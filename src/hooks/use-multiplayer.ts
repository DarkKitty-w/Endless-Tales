// src/hooks/use-multiplayer.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { 
  PeerInfo, MultiplayerState, ConnectionStatus, MultiplayerMessage,
  GameActionMessage, StoryUpdateMessage, PartyStateMessage, ChatMessage, ControlMessage,
  PendingInteraction, InteractionRequest
} from "../types/multiplayer-types";
import {
  createOffer, createAnswer, applyAnswer, setupDataChannel, sendDataChannelMessage,
  sendBufferedIceCandidates, handleIceCandidateMessage,
  type SignallingPackage
} from "../lib/webrtc-signalling";
import type { StoryLogEntry, GameState } from "../types/game-types";
import { logger } from "@/lib/logger";

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
}

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
  const [lastSessionId, setLastSessionId] = useState<string | null>(null);
  const [lastIsHost, setLastIsHost] = useState(false);
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
  const iceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const multiplayerStateRef = useRef(multiplayerState);

  // Keep ref updated
  useEffect(() => {
    multiplayerStateRef.current = multiplayerState;
  }, [multiplayerState]);

  // Generate a unique peer ID
  function generatePeerId(): string {
    return `peer_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  // Send a message via a specific data channel
  const sendMessage = useCallback((type: MultiplayerMessage['type'], payload: any) => {
    const channel = dataChannelsRef.current[type];
    if (!channel) {
      console.error(`Data channel ${type} not available`);
      return false;
    }

    const message: MultiplayerMessage = {
      type,
      payload,
      senderId: multiplayerStateRef.current.peerId,
      timestamp: Date.now(),
    };

    return sendDataChannelMessage(channel, message);
  }, []);

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
      console.error('Only host can send control messages');
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
      const { peerConnection, encodedOffer } = await createOffer(
        currentPeerId,
        playerName,
        (candidate) => {
          iceCandidatesRef.current.push(candidate);
        }
      );

      peerConnectionRef.current = peerConnection;

      // Setup data channel listeners for host
      peerConnection.ondatachannel = (event) => {
        const channel = event.channel;
        setupDataChannelForPeer(channel);
      };

      setMultiplayerState(prev => ({
        ...prev,
        sessionId: currentPeerId,
        connectionStatus: 'connected',
      }));

      // Store init params for reconnection
      lastInitParams.current = { type: 'host' };
      setLastSessionId(currentPeerId);
      setLastIsHost(true);

      return encodedOffer;
    } catch (error) {
      console.error('Failed to create session:', error);
      setMultiplayerState(prev => ({ ...prev, connectionStatus: 'failed' }));
      throw error;
    }
  }, [playerName]);

  // Initialize as guest
  const joinSession = useCallback(async (encodedOffer: string): Promise<string> => {
    setMultiplayerState(prev => ({ ...prev, connectionStatus: 'connecting', isHost: false }));

    try {
      const currentPeerId = multiplayerStateRef.current.peerId;
      const { peerConnection, encodedAnswer } = await createAnswer(
        encodedOffer,
        currentPeerId,
        playerName,
        (candidate) => {
          iceCandidatesRef.current.push(candidate);
        }
      );

      peerConnectionRef.current = peerConnection;

      // Setup data channels for guest
      peerConnection.ondatachannel = (event) => {
        setupDataChannelForPeer(event.channel);
      };

      setMultiplayerState(prev => ({
        ...prev,
        connectionStatus: 'connected',
      }));

      // Store init params for reconnection
      lastInitParams.current = { type: 'guest', offer: encodedOffer };
      setLastSessionId(currentPeerId);
      setLastIsHost(false);

      return encodedAnswer;
    } catch (error) {
      console.error('Failed to join session:', error);
      setMultiplayerState(prev => ({ ...prev, connectionStatus: 'failed' }));
      throw error;
    }
  }, [playerName]);

  // Host applies guest's answer
  const applyGuestAnswer = useCallback(async (encodedAnswer: string) => {
    if (!peerConnectionRef.current || !multiplayerStateRef.current.isHost) {
      throw new Error('Not in host mode or connection not initialized');
    }

    try {
      await applyAnswer(peerConnectionRef.current, encodedAnswer);
    } catch (error) {
      console.error('Failed to apply answer:', error);
      throw error;
    }
  }, []);

  // BUG-9 Fix: Reconnect with exponential backoff
  const reconnect = useCallback(async () => {
    if (!lastInitParams.current || isReconnectingRef.current) return;
    
    // Check if we've exceeded max reconnect attempts
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      logger.log(`Max reconnect attempts (${maxReconnectAttempts}) reached. Giving up.`);
      setIsReconnectingState(false);
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
    } catch (error) {
      console.error('Reconnect failed:', error);
      
      // Exponential backoff: 1s, 2s, 4s (capped at 4s)
      const backoffDelay = Math.min(1000 * Math.pow(2, reconnectAttempts.current - 1), 4000);
      logger.log(`Reconnect failed. Retrying in ${backoffDelay}ms...`);
      
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
  }, [createSession, joinSession, setIsReconnectingState, maxReconnectAttempts]);

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
      },
      () => {
        logger.log(`Channel ${channel.label} closed`);
        delete dataChannelsRef.current[channel.label];
        // BUG-9 Fix: Attempt reconnection if not intentional disconnect
        // The reconnect function now handles exponential backoff internally
        if (!intentionalDisconnect.current && lastInitParams.current) {
          logger.log('Data channel closed unexpectedly, attempting reconnect...');
          reconnect();
        }
      }
    );
  }, [reconnect, lastInitParams]);

  // Handle incoming messages
  const handleMessage = useCallback((data: MultiplayerMessage, channelLabel: string) => {
    logger.log(`Received message on ${channelLabel}:`, data);

    // Use ref to get current state (avoids stale closures)
    const currentState = multiplayerStateRef.current;

    switch (data.type) {
      case 'game-actions':
        // Host receives player actions
        if (currentState.isHost && gameActionReceivedRef.current) {
          const msg = data as unknown as GameActionMessage;
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
          // Send full state sync
          sendMessage('control', { 
            action: 'sync-response', 
            data: { 
              gameState: multiplayerStateRef.current,
              partyState: multiplayerStateRef.current?.partyState,
              turnOrder: multiplayerStateRef.current?.turnOrder,
              currentTurnIndex: multiplayerStateRef.current?.currentTurnIndex,
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
        }
        break;
      }
    }
  }, [onStoryUpdate, onPartyStateUpdate, onChatMessage, onControlMessage, onInteractionRequest, onInteractionResponse]);

  // PERF-3 Fix: Improved cleanup function with proper event listener removal
  const disconnect = useCallback(() => {
    intentionalDisconnect.current = true;
    
    // Clear any pending reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
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
    
    // Reset intentional disconnect flag after a short delay
    setTimeout(() => {
      intentionalDisconnect.current = false;
    }, 2000);
  }, []);

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
    lastSessionId,
    isConnected: multiplayerState.connectionStatus === 'connected',
    isMyTurn: multiplayerState.isMyTurn,
    isHost: multiplayerState.isHost,
    isReconnecting: isReconnectingState,
  };
}