// src/hooks/use-multiplayer.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { 
  PeerInfo, MultiplayerState, ConnectionStatus, MultiplayerMessage,
  GameActionMessage, StoryUpdateMessage, PartyStateMessage, ChatMessage, ControlMessage,
  PendingInteraction, InteractionRequest
} from "../types/multiplayer-types";
import {
  createOffer, createAnswer, applyAnswer, setupDataChannel,
  sendBufferedIceCandidates, handleIceCandidateMessage, decodeSignallingData
} from "../lib/webrtc-signalling";
import type { StoryLogEntry, GameState } from "../types/game-types";
import { logger } from "@/lib/logger";

// NET-13 Fix: Simple checksum function for state reconciliation
function calculateStateChecksum(state: any): string {
  // Simple checksum: create a string from key state fields and hash it
  const relevantFields = {
    storyLogLength: state.storyLog?.length || 0,
    turnCount: state.turnCount || 0,
    currentTurnIndex: state.currentTurnIndex || 0,
    players: state.players?.sort().join(',') || '',
    partyStateKeys: Object.keys(state.partyState || {}).sort().join(','),
  };
  const str = JSON.stringify(relevantFields);
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `checksum_${Math.abs(hash)}`;
}

interface UseMultiplayerOptions {
  playerName: string;
  onGameActionReceived?: (playerId: string, action: string, turnNumber: number, isInitial: boolean) => void;
  onStoryUpdate?: (entry: StoryLogEntry, newTurn: number) => void;
  onPartyStateUpdate?: (partyState: Record<string, any>) => void;
  onChatMessage?: (message: ChatMessage['payload']) => void;
  onControlMessage?: (message: ControlMessage['payload']) => void;
  onInteractionRequest?: (interaction: InteractionRequest) => void;
  onInteractionResponse?: (interactionId: string, accepted: boolean) => void;
  onPeerConnected?: (peer: PeerInfo) => void;
  onPeerDisconnected?: (peerId: string) => void;
  // NET-14 Fix: Host-provided snapshot of the authoritative GameState used for
  // full-state resync (sync-response). Falls back to the hook-level state when absent.
  getGameStateSnapshot?: () => any;
  // ERR-13: Add error callback for user-facing error messages
  onError?: (title: string, description: string, recoverable?: boolean) => void;
}

// NET-14 Fix: Heartbeat tuning. Pings are sent every 5s; a peer is considered
// stale after ~15s of silence (3 missed beats). Any inbound traffic also counts
// as liveness so gameplay stays responsive under high latency.
const HEARTBEAT_INTERVAL_MS = 5000;
const STALE_THRESHOLD_MS = 15000;

export function useMultiplayer(options: UseMultiplayerOptions) {
  const {
    playerName,
    onGameActionReceived,
    onStoryUpdate,
    onPartyStateUpdate,
    onChatMessage,
    onControlMessage,
    onInteractionRequest,
    onInteractionResponse,
    onPeerConnected,
    onPeerDisconnected,
    getGameStateSnapshot,
    onError,
  } = options;

  const [multiplayerState, setMultiplayerState] = useState<MultiplayerState>({
    peerId: generatePeerId(),
    sessionId: '',
    isHost: false,
    connectionStatus: 'disconnected',
    peers: [],
    turnOrder: [],
    currentTurnIndex: 0,
    isMyTurn: false,
    pendingInteraction: null,
    partyState: {},
    chatMessages: [],
    isPaused: false,
  });
  const [isReconnectingState, setIsReconnectingState] = useState(false);
  const isReconnectingRef = useRef(false);
  const lastInitParams = useRef<{ type: 'host' } | { type: 'guest'; offer: string } | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 3;
  const intentionalDisconnect = useRef(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const gameActionReceivedRef = useRef<((playerId: string, action: string, turnNumber: number, isInitial: boolean) => void) | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelsRef = useRef<Record<string, RTCDataChannel>>({});
  // NET-10 Fix: Per-peer message queues to prevent cross-peer message leakage
  const peerMessageQueues = useRef<Record<string, { data: any; timestamp: number }[]>>({});
  const peerQueueTimeouts = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  // NET-8 Fix: Sequence number tracking per peer for message ordering
  const peerSequenceNumbers = useRef<Record<string, number>>({}); // Track expected sequence number per peer
  const peerOutboxSequence = useRef<Record<string, number>>({}); // Track outgoing sequence number per peer
  const iceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const multiplayerStateRef = useRef(multiplayerState);
  const remotePeerInfoRef = useRef<PeerInfo | null>(null);
  const peerConnectedNotifiedRef = useRef(false);
  // NET-13 Fix: State reconciliation for detecting mismatched states
  const lastSentChecksum = useRef<string | null>(null);
  const reconciliationInterval = useRef<NodeJS.Timeout | null>(null);
  const peerChecksums = useRef<Record<string, { checksum: string; timestamp: number }>>({});
  // NET-14 Fix: Heartbeat state for stale connection detection
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);
  const peerLastActivity = useRef<Record<string, number>>({}); // last inbound activity per remote peer/channel
  const reconnectRef = useRef<(() => void) | null>(null); // late-bound ref so heartbeat can trigger reconnection
  const sendMessageRef = useRef<((type: MultiplayerMessage['type'], payload: any) => boolean) | null>(null); // late-bound send for reconnect path

  // Keep ref updated
  useEffect(() => {
    multiplayerStateRef.current = multiplayerState;
  }, [multiplayerState]);

  // Generate a unique peer ID
  function generatePeerId(): string {
    return `peer_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  // NET-13 Fix: State reconciliation functions
  const sendStateChecksum = useCallback(() => {
    if (!multiplayerStateRef.current.isHost) return; // Only host sends checksums
    
    const checksum = calculateStateChecksum(multiplayerStateRef.current);
    lastSentChecksum.current = checksum;
    
    // Broadcast checksum to all peers
    Object.keys(dataChannelsRef.current).forEach(label => {
      const channel = dataChannelsRef.current[label];
      if (channel && channel.readyState === 'open') {
        try {
          const seq = (peerOutboxSequence.current[label] || 0);
          peerOutboxSequence.current[label] = seq + 1;
          channel.send(JSON.stringify({
            type: 'CONTROL',
            senderId: multiplayerStateRef.current.peerId,
            sequenceNumber: seq,
            timestamp: Date.now(),
            payload: {
              action: 'state-checksum',
              data: { checksum, version: 1 }, // Use a default version or remove this field
            },
          } as ControlMessage));
        } catch (error) {
          logger.error("Failed to send state checksum", "use-multiplayer", { error: String(error) });
        }
      }
    });
  }, [peerOutboxSequence]);

  const requestStateResync = useCallback((fromPeerId?: string) => {
    logger.log('Requesting state resync', fromPeerId ? `from ${fromPeerId}` : '');
    const channelKeys = Object.keys(dataChannelsRef.current);
    
    if (fromPeerId) {
      // Request from specific peer (host)
      const channel = dataChannelsRef.current[fromPeerId];
      if (channel && channel.readyState === 'open') {
        try {
          const seq = (peerOutboxSequence.current[fromPeerId] || 0);
          peerOutboxSequence.current[fromPeerId] = seq + 1;
          channel.send(JSON.stringify({
            type: 'CONTROL',
            senderId: multiplayerStateRef.current.peerId,
            sequenceNumber: seq,
            timestamp: Date.now(),
            payload: { action: 'request-sync' },
          } as ControlMessage));
        } catch (error) {
          logger.error("Failed to request resync", "use-multiplayer", { error: String(error) });
        }
      }
    } else {
      // Broadcast request to all (should reach host)
      channelKeys.forEach(label => {
        const channel = dataChannelsRef.current[label];
        if (channel && channel.readyState === 'open') {
          try {
            const seq = (peerOutboxSequence.current[label] || 0);
            peerOutboxSequence.current[label] = seq + 1;
            channel.send(JSON.stringify({
              type: 'CONTROL',
              senderId: multiplayerStateRef.current.peerId,
              sequenceNumber: seq,
              timestamp: Date.now(),
              payload: { action: 'request-sync' },
            } as ControlMessage));
          } catch (error) {
            logger.error("Failed to request resync", "use-multiplayer", { error: String(error) });
          }
        }
      });
    }
  }, [peerOutboxSequence]);

  const startReconciliation = useCallback(() => {
    if (reconciliationInterval.current) return;
    
    // Send checksum every 30 seconds
    reconciliationInterval.current = setInterval(() => {
      if (multiplayerStateRef.current.isHost) {
        sendStateChecksum();
      }
    }, 30000);
    
    // Send initial checksum
    if (multiplayerStateRef.current.isHost) {
      sendStateChecksum();
    }
  }, [sendStateChecksum]);

  const stopReconciliation = useCallback(() => {
    if (reconciliationInterval.current) {
      clearInterval(reconciliationInterval.current);
      reconciliationInterval.current = null;
    }
  }, []);

  // NET-14 Fix: Heartbeat helpers. The heartbeat runs on the reliable, ordered
  // control channel of an already-established connection; it detects peers that
  // vanished without a close frame (network drop, sleep, crash).
  const markPeerActivity = useCallback((peerKey: string) => {
    peerLastActivity.current[peerKey] = Date.now();
  }, []);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current);
      heartbeatInterval.current = null;
    }
  }, []);

  const handleStaleConnection = useCallback((staleKey: string) => {
    if (intentionalDisconnect.current) return;
    logger.warn(`Stale connection detected for "${staleKey}" (no heartbeat for ${STALE_THRESHOLD_MS}ms)`, 'use-multiplayer');

    stopHeartbeat();

    // Resolve the remote peer id so consumers can clean up party/turn state.
    const remotePeerId = remotePeerInfoRef.current?.peerId || staleKey;

    setMultiplayerState(prev => ({
      ...prev,
      connectionStatus: 'disconnected',
      peers: prev.peers.map(p => p.peerId === remotePeerId ? { ...p, isConnected: false } : p)
        .filter(p => p.peerId === remotePeerId ? false : true),
    }));

    // Let the UI remove the peer from party state / turn order.
    onPeerDisconnected?.(remotePeerId);

    // Attempt to re-establish the session with exponential backoff.
    if (lastInitParams.current) {
      reconnectRef.current?.();
    }
  }, [stopHeartbeat, onPeerDisconnected]);

  const startHeartbeat = useCallback(() => {
    if (heartbeatInterval.current) return;

    // Seed activity so a freshly opened connection is not instantly flagged.
    Object.keys(dataChannelsRef.current).forEach(label => {
      const key = remotePeerInfoRef.current?.peerId || label;
      markPeerActivity(key);
    });

    heartbeatInterval.current = setInterval(() => {
      if (intentionalDisconnect.current) {
        stopHeartbeat();
        return;
      }

      const openLabels = Object.keys(dataChannelsRef.current)
        .filter(label => dataChannelsRef.current[label]?.readyState === 'open');
      if (openLabels.length === 0) return;

      const peerKey = remotePeerInfoRef.current?.peerId || openLabels[0];

      // Ping every open control-capable channel.
      openLabels.forEach(label => {
        try {
          const seq = (peerOutboxSequence.current[label] || 0);
          peerOutboxSequence.current[label] = seq + 1;
          dataChannelsRef.current[label].send(JSON.stringify({
            type: 'CONTROL',
            senderId: multiplayerStateRef.current.peerId,
            sequenceNumber: seq,
            timestamp: Date.now(),
            payload: { action: 'ping', data: { timestamp: Date.now() } },
          } as ControlMessage));
        } catch (error) {
          logger.error('Failed to send heartbeat ping', 'use-multiplayer', { error: String(error), channel: label });
        }
      });

      // Flag stale peers that have been silent for too long.
      const lastActivity = peerLastActivity.current[peerKey];
      if (lastActivity && Date.now() - lastActivity > STALE_THRESHOLD_MS) {
        handleStaleConnection(peerKey);
      }
    }, HEARTBEAT_INTERVAL_MS);
  }, [markPeerActivity, stopHeartbeat, handleStaleConnection]);


  // NET-10 Fix: Per-peer message queue processing
  const processPeerQueue = useCallback((channelLabel: string) => {
    const channel = dataChannelsRef.current[channelLabel];
    if (!channel || channel.readyState !== 'open') return;
    
    const queue = peerMessageQueues.current[channelLabel];
    if (!queue || queue.length === 0) return;
    
    const now = Date.now();
    const BUFFER_LIMIT = 1024 * 1024; // 1MB
    let i = 0;
    while (i < queue.length) {
      const msg = queue[i];
      // Remove messages older than 30 seconds
      if (now - msg.timestamp > 30000) {
        queue.splice(i, 1);
        continue;
      }
      if (channel.bufferedAmount < BUFFER_LIMIT / 2) {
        try {
          channel.send(JSON.stringify(msg.data));
          queue.splice(i, 1); // Remove on successful send
        } catch (error) {
          i++; // Keep in queue, will retry next time
        }
      } else {
        i++; // Channel buffer full, keep message in queue
      }
    }
    
    // Reschedule if there are still messages in the queue
    if (queue.length > 0) {
      if (peerQueueTimeouts.current[channelLabel]) {
        clearTimeout(peerQueueTimeouts.current[channelLabel]);
      }
      peerQueueTimeouts.current[channelLabel] = setTimeout(() => processPeerQueue(channelLabel), 50);
    } else {
      delete peerQueueTimeouts.current[channelLabel];
      delete peerMessageQueues.current[channelLabel];
    }
  }, []);

  // Send a message via a specific data channel
  const sendMessage = useCallback((type: MultiplayerMessage['type'], payload: any) => {

    const channel = dataChannelsRef.current[type];
    if (!channel) {
      logger.error(`Data channel ${type} not available`);
      if (onError) {
        onError("Message Send Failed", `Data channel ${type} is not available. Message not sent.`, false);
      }
      return false;
    }

    // NET-8 Fix: Assign sequence number to outgoing messages
    if (!peerOutboxSequence.current[type]) {
      peerOutboxSequence.current[type] = 0;
    }
    const sequenceNumber = peerOutboxSequence.current[type]++;

    const message: MultiplayerMessage = {
      type,
      payload,
      senderId: multiplayerStateRef.current.peerId,
      timestamp: Date.now(),
      sequenceNumber,
    };

    // Try to send immediately
    if (channel.readyState === 'open') {
      try {
        channel.send(JSON.stringify(message));
        return true;
      } catch (error) {
        logger.error("Failed to send immediately", "use-multiplayer", { error: String(error) });
      }
    }
    
    // Queue the message if channel not open or send failed
    if (!peerMessageQueues.current[type]) {
      peerMessageQueues.current[type] = [];
    }
    
    const queue = peerMessageQueues.current[type];
    const MAX_QUEUE_SIZE = 100;
    if (queue.length < MAX_QUEUE_SIZE) {
      queue.push({ data: message, timestamp: Date.now() });
      // Schedule processing for queued messages
      if (!peerQueueTimeouts.current[type]) {
        peerQueueTimeouts.current[type] = setTimeout(() => processPeerQueue(type), 50);
      }
      return true; // Message is queued (will be sent later)
    } else {
      logger.error('Message queue full, dropping message');
      if (onError) {
        onError("Message Not Sent", `Failed to send ${type} message. The connection may be congested.`, false);
      }
      return false; // Queue is full, message dropped
    }
  }, [onError, processPeerQueue]);

  // NET-14 Fix: Late-bound ref so reconnect() can queue a request-sync even
  // before sendMessage is stable across renders.
  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  // Send game action (guest sends to host)
  const sendGameAction = useCallback((action: string, turnNumber: number, isInitial = false) => {
    return sendMessage('game-actions', {
      playerId: multiplayerStateRef.current.peerId,
      action,
      turnNumber,
      isInitial,
    });
  }, [sendMessage]);

  // Broadcast story update (host sends to all)
  const broadcastStoryUpdate = useCallback((entry: StoryLogEntry, newTurn: number, updatedGameState: string) => {
    return sendMessage('story-update', {
      entry,
      newTurn,
      updatedGameState,
    });
  }, [sendMessage]);

  // Broadcast party state (host sends to all)
  const broadcastPartyState = useCallback((partyState: Record<string, any>, turnOrder: string[], currentTurnIndex: number) => {
    return sendMessage('party-state', {
      characters: partyState,
      turnOrder,
      currentTurnIndex,
    });
  }, [sendMessage]);

  // Send chat message
  const sendChatMessage = useCallback((text: string) => {
    return sendMessage('chat', {
      playerId: multiplayerStateRef.current.peerId,
      playerName,
      text: text.substring(0, 300),
      timestamp: Date.now(),
    });
  }, [sendMessage, playerName]);

  // Send control message (host only)
  const sendControlMessage = useCallback((action: ControlMessage['payload']['action'], targetPeerId?: string, data?: any) => {
    if (!multiplayerStateRef.current.isHost) {
      logger.error('Only host can send control messages');
      return false;
    }
    return sendMessage('control', { action, targetPeerId, data });
  }, [sendMessage]);

  // Send interaction request to another peer
  const sendInteractionRequest = useCallback((targetPeerId: string, type: 'gift' | 'trade' | 'duel' | 'custom', details: string) => {
    const interactionId = `interaction_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    return sendMessage('control', {
      action: 'interaction-request',
      targetPeerId,
      data: { interactionId, type, details }
    });
  }, [sendMessage]);

  // Send interaction response (accept/decline)
  const sendInteractionResponse = useCallback((interactionId: string, accepted: boolean, items?: string[]) => {
    return sendMessage('control', {
      action: 'interaction-response',
      data: { interactionId, accepted, items }
    });
  }, [sendMessage]);

  // Initialize as host
  const createSession = useCallback(async (): Promise<string> => {
    setMultiplayerState(prev => ({ ...prev, connectionStatus: 'connecting', isHost: true }));

    try {
      const currentPeerId = multiplayerStateRef.current.peerId;
      const { peerConnection, encodedOffer, dataChannels } = await createOffer(
        currentPeerId,
        playerName,
        (candidate) => {
          iceCandidatesRef.current.push(candidate);
        }
      );

      peerConnectionRef.current = peerConnection;
      peerConnectedNotifiedRef.current = false;
      remotePeerInfoRef.current = null;

      // The host creates data channels, so attach handlers directly to those channels.
      Object.values(dataChannels).forEach(setupDataChannelForPeer);

      setMultiplayerState(prev => ({
        ...prev,
        sessionId: currentPeerId,
        connectionStatus: 'connecting',
      }));

      // Store init params for reconnection
      lastInitParams.current = { type: 'host' };

      return encodedOffer;
    } catch (error: any) {
      logger.error('Failed to create session:', error);
      setMultiplayerState(prev => ({ ...prev, connectionStatus: 'failed' }));
      // ERR-13: Show user-friendly error with recovery option
      if (onError) {
        const errorMsg = error?.message || 'Unknown error';
        onError(
          "Connection Failed", 
          `Failed to create multiplayer session: ${errorMsg}. Check your network connection and try again.`,
          true // recoverable
        );
      }
      throw error;
    }
  }, [playerName, onError]);

  // Initialize as guest
  const joinSession = useCallback(async (encodedOffer: string): Promise<string> => {
    setMultiplayerState(prev => ({ ...prev, connectionStatus: 'connecting', isHost: false }));

    try {
      const currentPeerId = multiplayerStateRef.current.peerId;
      const { peerConnection, encodedAnswer, remotePeerInfo } = await createAnswer(
        encodedOffer,
        currentPeerId,
        playerName,
        (candidate) => {
          iceCandidatesRef.current.push(candidate);
        }
      );

      peerConnectionRef.current = peerConnection;
      peerConnectedNotifiedRef.current = false;
      remotePeerInfoRef.current = {
        peerId: remotePeerInfo.peerId,
        name: remotePeerInfo.name,
        isHost: true,
        isConnected: false,
      };

      // Setup data channels for guest
      peerConnection.ondatachannel = (event) => {
        setupDataChannelForPeer(event.channel);
      };

      setMultiplayerState(prev => ({
        ...prev,
        sessionId: remotePeerInfo.peerId,
        connectionStatus: 'connecting',
      }));

      // Store init params for reconnection
      lastInitParams.current = { type: 'guest', offer: encodedOffer };

      return encodedAnswer;
    } catch (error: any) {
      logger.error('Failed to join session:', error);
      setMultiplayerState(prev => ({ ...prev, connectionStatus: 'failed' }));
      // ERR-13: Show user-friendly error with recovery option
      if (onError) {
        const errorMsg = error?.message || 'Unknown error';
        onError(
          "Connection Failed", 
          `Failed to join multiplayer session: ${errorMsg}. Check the offer code and your network connection.`,
          true // recoverable
        );
      }
      throw error;
    }
  }, [playerName, onError]);

  // Host applies guest's answer
  const applyGuestAnswer = useCallback(async (encodedAnswer: string) => {
    if (!peerConnectionRef.current || !multiplayerStateRef.current.isHost) {
      const error = new Error('Not in host mode or connection not initialized');
      if (onError) {
        onError("Answer Failed", error.message, false);
      }
      throw error;
    }

    try {
      // Decode first so the channel-open handler can identify the guest even if
      // WebRTC opens the data channel during setRemoteDescription.
      const decodedAnswer = decodeSignallingData(encodedAnswer);
      remotePeerInfoRef.current = {
        peerId: decodedAnswer.peerInfo.peerId,
        name: decodedAnswer.peerInfo.name,
        isHost: false,
        isConnected: false,
      };
      await applyAnswer(peerConnectionRef.current, encodedAnswer);
    } catch (error: any) {
      logger.error('Failed to apply answer:', error);
      if (onError) {
        const errorMsg = error?.message || 'Unknown error';
        onError("Connection Failed", `Failed to apply answer: ${errorMsg}`, true);
      }
      throw error;
    }
  }, [onError]);

  // BUG-9 Fix: Reconnect with exponential backoff
  const reconnect = useCallback(async () => {
    if (!lastInitParams.current || isReconnectingRef.current) return;
    
    // Check if we've exceeded max reconnect attempts
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      logger.log(`Max reconnect attempts (${maxReconnectAttempts}) reached. Giving up.`);
      setIsReconnectingState(false);
      if (onError) {
        onError("Reconnection Failed", `Failed to reconnect after ${maxReconnectAttempts} attempts. Please try manually.`, false);
      }
      return;
    }
    
    isReconnectingRef.current = true;
    setIsReconnectingState(true);
    reconnectAttempts.current += 1;
    logger.log(`Attempting reconnect #${reconnectAttempts.current}...`);
    
    try {
      if (lastInitParams.current.type === 'host') {
        await createSession();
      } else {
        await joinSession(lastInitParams.current.offer);
      }
      reconnectAttempts.current = 0; // reset on success
      logger.log('Reconnect successful!');

      // NET-14 Fix: After a successful reconnection, guests must re-request the
      // authoritative host state so both sides converge on identical state. The
      // message is queued by sendMessage if channels are not open yet and is
      // flushed as soon as they open.
      if (!multiplayerStateRef.current.isHost) {
        sendMessageRef.current?.('control', {
          action: 'request-sync',
          data: { reason: 'reconnected' }
        });
      }
    } catch (error: any) {
      logger.error('Reconnect failed:', error);
      
      // Exponential backoff: 1s, 2s, 4s (capped at 4s)
      const backoffDelay = Math.min(1000 * Math.pow(2, reconnectAttempts.current - 1), 4000);
      logger.log(`Reconnect failed. Retrying in ${backoffDelay}ms...`);
      
      // Show user-facing error on first attempt, then informational on subsequent
      if (onError && reconnectAttempts.current === 1) {
        onError("Reconnection Failed", `Connection lost. Retrying automatically (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})...`, true);
      }
      
      // Schedule retry with backoff
      if (reconnectAttempts.current < maxReconnectAttempts) {
        reconnectTimeoutRef.current = setTimeout(() => {
          isReconnectingRef.current = false; // Reset so reconnect can be called again
          reconnect();
        }, backoffDelay);
      }
    } finally {
      // Only set to false if we're not scheduling a retry
      if (reconnectAttempts.current >= maxReconnectAttempts || reconnectAttempts.current === 0) {
        isReconnectingRef.current = false;
        setIsReconnectingState(false);
      }
    }
  }, [createSession, joinSession, setIsReconnectingState, maxReconnectAttempts, onError]);

  // Setup data channel event handlers
  const setupDataChannelForPeer = useCallback((channel: RTCDataChannel) => {
    setupDataChannel(
      channel,
      (data: any) => {
        // Handle ICE candidate messages separately
        if (data.type === 'ice-candidate') {
          if (peerConnectionRef.current) {
            handleIceCandidateMessage(peerConnectionRef.current, data);
          }
          return;
        }
        handleMessage(data as MultiplayerMessage, channel.label);
      },
      () => {
        logger.log(`Channel ${channel.label} opened`);
        dataChannelsRef.current[channel.label] = channel;
        // Send any buffered ICE candidates after connection is established
        if (peerConnectionRef.current) {
          sendBufferedIceCandidates(peerConnectionRef.current, channel);
        }

        // Treat the control channel opening as the point where the one-friend
        // connection is actually ready. Offer/answer generation alone is not enough.
        if (channel.label === 'control') {
          const remotePeer = remotePeerInfoRef.current;
          setMultiplayerState(prev => {
            const nextPeers = remotePeer && !prev.peers.some(p => p.peerId === remotePeer.peerId)
              ? [...prev.peers, { ...remotePeer, isConnected: true }]
              : prev.peers.map(p => p.peerId === remotePeer?.peerId ? { ...p, isConnected: true } : p);
            return {
              ...prev,
              connectionStatus: 'connected',
              peers: nextPeers,
            };
          });

          if (remotePeer && !peerConnectedNotifiedRef.current) {
            peerConnectedNotifiedRef.current = true;
            onPeerConnected?.({ ...remotePeer, isConnected: true });
          }
        }

        // NET-14 Fix: Start heartbeat once the control channel is live so stale
        // peers are detected even without a close frame.
        if (channel.label === 'control') {
          markPeerActivity(remotePeerInfoRef.current?.peerId || channel.label);
          startHeartbeat();
        }

        // NET-13 Fix: Start state reconciliation when channel opens
        startReconciliation();
      },
      () => {
        logger.log(`Channel ${channel.label} closed`);
        delete dataChannelsRef.current[channel.label];
        // NET-14 Fix: Stop the heartbeat when the control channel goes away
        // (reconnection restarts it on the fresh control channel).
        if (channel.label === 'control') {
          stopHeartbeat();
        }
        // BUG-9 Fix: Attempt reconnection if not intentional disconnect
        // The reconnect function now handles exponential backoff internally
        if (!intentionalDisconnect.current && lastInitParams.current) {
          logger.log('Data channel closed unexpectedly, attempting reconnect...');
          reconnect();
        }
      }
    );
  }, [reconnect, lastInitParams, startReconciliation, startHeartbeat, stopHeartbeat, markPeerActivity, onPeerConnected]);

  // NET-14 Fix: Late-bound ref so the heartbeat's stale detection can trigger
  // reconnection without a circular dependency between the callbacks.
  useEffect(() => {
    reconnectRef.current = () => { void reconnect(); };
  }, [reconnect]);

  // Handle incoming messages
  const handleMessage = useCallback((data: MultiplayerMessage, channelLabel: string) => {
    logger.log(`Received message on ${channelLabel}:`, "use-multiplayer", { messageType: data.type });

    // NET-8 Fix: Basic sequence number validation (channels are ordered: true, but this adds extra safety)
    const senderId = data.senderId || channelLabel;
    if (data.sequenceNumber !== undefined) {
      if (!peerSequenceNumbers.current[senderId]) {
        peerSequenceNumbers.current[senderId] = 0;
      }
      const expectedSeq = peerSequenceNumbers.current[senderId];
      if (data.sequenceNumber < expectedSeq) {
        logger.warn(`Received old message from ${senderId}: got ${data.sequenceNumber}, expected ${expectedSeq}. Ignoring duplicate/old message.`);
        return;
      }
      peerSequenceNumbers.current[senderId] = data.sequenceNumber + 1;
    }

    // NET-14 Fix: Any inbound traffic proves the peer is alive; keep the
    // heartbeat from flagging active-but-slow connections as stale.
    markPeerActivity(senderId);

    // Use ref to get current state (avoids stale closures)
    const currentState = multiplayerStateRef.current;

    // Some senders mark control payloads with a legacy uppercase type; normalize
    // so both spellings reach the control branch instead of being dropped.
    const rawType = String(data.type);
    const normalizedType = (rawType === 'CONTROL' ? 'control' : rawType) as typeof data.type;

    // NET-14 Fix: Handle heartbeat messages directly in the hook. Pings are
    // answered immediately with a pong echoing the original timestamp so the
    // peer can measure liveness; pongs update the activity tracker. These
    // messages are internal and are not forwarded to UI handlers.
    if (normalizedType === 'control') {
      const payload = (data as { payload?: { action?: string; data?: { timestamp?: number } } }).payload;
      if (payload?.action === 'ping') {
        try {
          const seq = peerOutboxSequence.current['control'] || 0;
          peerOutboxSequence.current['control'] = seq + 1;
          dataChannelsRef.current['control']?.send(JSON.stringify({
            type: 'CONTROL',
            senderId: currentState.peerId,
            sequenceNumber: seq,
            timestamp: Date.now(),
            payload: { action: 'pong', data: { timestamp: payload.data?.timestamp } },
          }));
        } catch (error) {
          logger.error('Failed to send heartbeat pong', 'use-multiplayer', { error: String(error) });
        }
        return;
      }
      if (payload?.action === 'pong') {
        return; // Liveness already recorded by markPeerActivity above.
      }
    }

    switch (normalizedType) {
      case 'game-actions':
        // Host receives player actions
        if (currentState.isHost && gameActionReceivedRef.current) {
          const msg = data as unknown as GameActionMessage;
          
          // NET-4 Fix: Validate that the action is from the current player in turn order
          if (currentState.turnOrder.length > 0) {
            const expectedPlayerId = currentState.turnOrder[currentState.currentTurnIndex];
            if (msg.payload.playerId !== expectedPlayerId) {
              logger.warn(`Received action from ${msg.payload.playerId} but it's ${expectedPlayerId}'s turn. Ignoring.`);
              return; // Ignore actions from players not currently in turn
            }
          }
          
          gameActionReceivedRef.current(
            msg.payload.playerId,
            msg.payload.action,
            msg.payload.turnNumber,
            msg.payload.isInitial || false
          );
        }
        break;

      case 'story-update':
        if (!currentState.isHost && onStoryUpdate) {
          const msg = data as unknown as StoryUpdateMessage;
          onStoryUpdate(msg.payload.entry, msg.payload.newTurn);
        }
        break;

      case 'party-state':
        if (onPartyStateUpdate) {
          const msg = data as unknown as PartyStateMessage;
          onPartyStateUpdate(msg.payload.characters);
          setMultiplayerState(prev => ({
            ...prev,
            turnOrder: msg.payload.turnOrder,
            currentTurnIndex: msg.payload.currentTurnIndex,
            isMyTurn: msg.payload.turnOrder[msg.payload.currentTurnIndex] === currentState.peerId,
          }));
        }
        break;

      case 'chat':
        if (onChatMessage) {
          const msg = data as unknown as ChatMessage;
          onChatMessage(msg.payload);
          setMultiplayerState(prev => ({
            ...prev,
            chatMessages: [...prev.chatMessages, msg.payload],
          }));
        }
        break;

      case 'control': {
        const msg = data as unknown as ControlMessage;
        if (onControlMessage) {
          onControlMessage(msg.payload);
        }
        // Handle specific control actions
        const controlMsg = msg;
        if (controlMsg.payload.action === 'kick') {
          if (controlMsg.payload.targetPeerId === currentState.peerId) {
            // We are kicked
            logger.log('Kicked from game');
            disconnect();
          }
        } else if (controlMsg.payload.action === 'pause') {
          setMultiplayerState(prev => ({ ...prev, isPaused: true }));
        } else if (controlMsg.payload.action === 'resume') {
          setMultiplayerState(prev => ({ ...prev, isPaused: false }));
        } else if (controlMsg.payload.action === 'set-turn-order') {
          const newOrder = controlMsg.payload.data?.turnOrder;
          if (newOrder) {
            setMultiplayerState(prev => ({
              ...prev,
              turnOrder: newOrder,
              currentTurnIndex: 0,
              isMyTurn: newOrder[0] === prev.peerId,
            }));
          }
        } else if (controlMsg.payload.action === 'interaction-request' && onInteractionRequest) {
          const interaction: InteractionRequest = {
            id: controlMsg.payload.data?.interactionId || `interaction_${Date.now()}`,
            type: controlMsg.payload.data?.type || 'custom',
            initiatedBy: controlMsg.senderId,
            targetPeerId: controlMsg.payload.targetPeerId || '',
            details: controlMsg.payload.data?.details || '',
            timestamp: controlMsg.timestamp,
          };
          onInteractionRequest(interaction);
        } else if (controlMsg.payload.action === 'interaction-response' && onInteractionResponse) {
          onInteractionResponse(
            controlMsg.payload.data?.interactionId,
            controlMsg.payload.data?.accepted
          );
        } else if (controlMsg.payload.action === 'request-sync' && currentState.isHost) {
          // Host received a sync request from a reconnecting peer
          logger.log('Host: Sync request received, sending full state...');
          // NET-14 Fix: Prefer the component-provided snapshot of the real,
          // authoritative GameState; fall back to the hook-level state when the
          // host has not registered one.
          const snapshot = getGameStateSnapshot?.();
          const syncGameState = snapshot?.gameState ?? multiplayerStateRef.current;
          const syncPartyState = snapshot?.partyState ?? multiplayerStateRef.current?.partyState;
          // Send full state sync
          sendMessage('control', {
            action: 'sync-response',
            data: {
              gameState: syncGameState,
              partyState: syncPartyState,
              turnOrder: snapshot?.turnOrder ?? multiplayerStateRef.current?.turnOrder,
              currentTurnIndex: snapshot?.currentTurnIndex ?? multiplayerStateRef.current?.currentTurnIndex,
            }
          });
        } else if (controlMsg.payload.action === 'sync-response' && !currentState.isHost) {
          // Guest received state sync from host
          logger.log('Guest: Received state sync from host');
          const { gameState, partyState, turnOrder, currentTurnIndex } = controlMsg.payload.data || {};
          if (gameState && onStoryUpdate) {
            // Apply the synced state - this will trigger a full state update
            logger.log('Guest: Applying synced state...');
            // The actual state application will be done via dispatch in the component
            if (onControlMessage) {
              onControlMessage({ action: 'sync-complete', data: { gameState, partyState, turnOrder, currentTurnIndex } });
            }
          }
        } else if (controlMsg.payload.action === 'state-checksum' && !currentState.isHost) {
          // Guest received state checksum from host - check for mismatch
          const { checksum, version } = controlMsg.payload.data || {};
          const senderId = controlMsg.senderId;
          
          if (checksum && senderId) {
            // Store the checksum
            peerChecksums.current[senderId] = { checksum, timestamp: Date.now() };
            
            // Calculate our own checksum
            const localChecksum = calculateStateChecksum(multiplayerStateRef.current);
            
            // Compare checksums
            if (localChecksum !== checksum) {
              logger.warn(`State mismatch detected! Host checksum: ${checksum}, Local checksum: ${localChecksum}`);
              // Request a full state resync from host
              requestStateResync(senderId);
            } else {
              logger.log('State checksum matches host - all good!');
            }
          }
        }
        break;
      }
    }
  }, [onStoryUpdate, onPartyStateUpdate, onChatMessage, onControlMessage, onInteractionRequest, onInteractionResponse, markPeerActivity, getGameStateSnapshot]);

  // PERF-3 Fix: Improved cleanup function with proper event listener removal
  const disconnect = useCallback(() => {
    intentionalDisconnect.current = true;

    // Clear any pending reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // NET-14 Fix: Stop heartbeat tracking on intentional disconnect
    stopHeartbeat();
    peerLastActivity.current = {};
    
    // NET-13 Fix: Stop state reconciliation
    stopReconciliation();
    peerChecksums.current = {}; // Clear stored checksums
    
    // NET-10 Fix: Clean up per-peer message queues and timeouts
    Object.keys(peerQueueTimeouts.current).forEach(channelLabel => {
      clearTimeout(peerQueueTimeouts.current[channelLabel]);
    });
    peerQueueTimeouts.current = {};
    peerMessageQueues.current = {};
    
    // Close all data channels with proper cleanup
    Object.values(dataChannelsRef.current).forEach(channel => {
      try {
        // Remove all event listeners before closing
        channel.onmessage = null;
        channel.onopen = null;
        channel.onclose = null;
        channel.onerror = null;
        channel.close();
      } catch (e) {}
    });
    dataChannelsRef.current = {};

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.onicecandidate = null;
      peerConnectionRef.current.ondatachannel = null;
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    setMultiplayerState(prev => ({
      ...prev,
      connectionStatus: 'disconnected',
      peers: [],
      turnOrder: [],
      currentTurnIndex: 0,
      isMyTurn: false,
      pendingInteraction: null,
      partyState: {},
      chatMessages: [],
    }));

    iceCandidatesRef.current = [];
    remotePeerInfoRef.current = null;
    peerConnectedNotifiedRef.current = false;
    
    // Reset intentional disconnect flag after a short delay
    setTimeout(() => {
      intentionalDisconnect.current = false;
    }, 2000);
  }, [stopReconciliation, stopHeartbeat]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // Function to set the game action received handler
  const setGameActionReceivedHandler = useCallback((handler: ((playerId: string, action: string, turnNumber: number, isInitial: boolean) => void) | null) => {
    gameActionReceivedRef.current = handler;
  }, []);

  return {
    multiplayerState,
    createSession,
    joinSession,
    applyGuestAnswer,
    sendGameAction,
    broadcastStoryUpdate,
    broadcastPartyState,
    sendChatMessage,
    sendControlMessage,
    sendInteractionRequest,
    sendInteractionResponse,
    disconnect,
    reconnect,
    setGameActionReceivedHandler,
    isConnected: multiplayerState.connectionStatus === 'connected',
    isMyTurn: multiplayerState.isMyTurn,
    isHost: multiplayerState.isHost,
    isReconnecting: isReconnectingState,
  };
}