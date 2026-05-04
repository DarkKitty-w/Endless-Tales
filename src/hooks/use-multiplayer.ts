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
  registerIceCandidateSendCallback, unregisterIceCandidateSendCallback, handleIncomingIceCandidate,
  type SignallingPackage
} from "../lib/webrtc-signalling";
import type { StoryLogEntry, GameState } from "../types/game-types";

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
      senderId: multiplayerState.peerId,
      timestamp: Date.now(),
    };

    return sendDataChannelMessage(channel, message);
  }, [multiplayerState.peerId]);

  // Send game action (guest sends to host)
  const sendGameAction = useCallback((action: string, turnNumber: number, isInitial = false) => {
    return sendMessage('game-actions', {
      playerId: multiplayerState.peerId,
      action,
      turnNumber,
      isInitial,
    });
  }, [sendMessage, multiplayerState.peerId]);

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
      playerId: multiplayerState.peerId,
      playerName,
      text: text.substring(0, 300),
      timestamp: Date.now(),
    });
  }, [sendMessage, multiplayerState.peerId, playerName]);

  // Send control message (host only)
  const sendControlMessage = useCallback((action: ControlMessage['payload']['action'], targetPeerId?: string, data?: any) => {
    if (!multiplayerState.isHost) {
      console.error('Only host can send control messages');
      return false;
    }
    return sendMessage('control', { action, targetPeerId, data });
  }, [sendMessage, multiplayerState.isHost]);

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
      const { peerConnection, encodedOffer } = await createOffer(
        multiplayerState.peerId,
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
        sessionId: multiplayerState.peerId,
        connectionStatus: 'connected',
      }));

      // Store init params for reconnection
      lastInitParams.current = { type: 'host' };
      setLastSessionId(multiplayerState.peerId);
      setLastIsHost(true);

      return encodedOffer;
    } catch (error) {
      console.error('Failed to create session:', error);
      setMultiplayerState(prev => ({ ...prev, connectionStatus: 'failed' }));
      throw error;
    }
  }, [multiplayerState.peerId, playerName]);

  // Initialize as guest
  const joinSession = useCallback(async (encodedOffer: string): Promise<string> => {
    setMultiplayerState(prev => ({ ...prev, connectionStatus: 'connecting', isHost: false }));

    try {
      const { peerConnection, encodedAnswer } = await createAnswer(
        encodedOffer,
        multiplayerState.peerId,
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
      setLastSessionId(multiplayerState.peerId);
      setLastIsHost(false);

      return encodedAnswer;
    } catch (error) {
      console.error('Failed to join session:', error);
      setMultiplayerState(prev => ({ ...prev, connectionStatus: 'failed' }));
      throw error;
    }
  }, [multiplayerState.peerId, playerName]);

  // Host applies guest's answer
  const applyGuestAnswer = useCallback(async (encodedAnswer: string) => {
    if (!peerConnectionRef.current || !multiplayerState.isHost) {
      throw new Error('Not in host mode or connection not initialized');
    }

    try {
      await applyAnswer(peerConnectionRef.current, encodedAnswer);
    } catch (error) {
      console.error('Failed to apply answer:', error);
      throw error;
    }
  }, [multiplayerState.isHost]);

  // Reconnect to last session
  const reconnect = useCallback(async () => {
    if (!lastInitParams.current || isReconnectingRef.current) return;
    
    isReconnectingRef.current = true;
    setIsReconnectingState(true);
    reconnectAttempts.current += 1;
    console.log(`Attempting reconnect #${reconnectAttempts.current}...`);
    
    try {
      if (lastInitParams.current.type === 'host') {
        await createSession();
      } else {
        await joinSession(lastInitParams.current.offer);
      }
      reconnectAttempts.current = 0; // reset on success
    } catch (error) {
      console.error('Reconnect failed:', error);
    } finally {
      isReconnectingRef.current = false;
      setIsReconnectingState(false);
    }
  }, [createSession, joinSession, setIsReconnectingState]);

  // Setup data channel event handlers
  const setupDataChannelForPeer = useCallback((channel: RTCDataChannel) => {
    setupDataChannel(
      channel,
      (data: any) => handleMessage(data, channel.label),
      () => {
        console.log(`Channel ${channel.label} opened`);
        dataChannelsRef.current[channel.label] = channel;
        
        // Register callback to send ICE candidates via this data channel
        const pcId = peerConnectionRef.current ? 
          (multiplayerState.isHost ? `offer-${multiplayerState.peerId}` : `answer-${multiplayerState.peerId}`) : '';
        if (pcId && peerConnectionRef.current) {
          registerIceCandidateSendCallback(pcId, (candidate: RTCIceCandidateInit) => {
            if (channel.readyState === 'open') {
              try {
                channel.send(JSON.stringify({
                  type: 'webrtc-ice-candidate',
                  candidate
                }));
              } catch (error) {
                console.error('Failed to send ICE candidate via data channel:', error);
              }
            }
          });
        }
      },
      () => {
        console.log(`Channel ${channel.label} closed`);
        delete dataChannelsRef.current[channel.label];
        
        // Unregister the ICE candidate callback
        const pcId = peerConnectionRef.current ? 
          (multiplayerState.isHost ? `offer-${multiplayerState.peerId}` : `answer-${multiplayerState.peerId}`) : '';
        if (pcId) {
          unregisterIceCandidateSendCallback(pcId);
        }
        
        // Attempt reconnection if not intentional disconnect
        if (!intentionalDisconnect.current && lastInitParams.current) {
          console.log('Data channel closed unexpectedly, attempting reconnect...');
          setTimeout(() => reconnect(), 1000);
        }
      }
    );
  }, [reconnect, lastInitParams, multiplayerState.connectionStatus, multiplayerState.peerId, multiplayerState.isHost, handleMessage]);

  // Handle incoming messages
  const handleMessage = useCallback((data: any, channelLabel: string) => {
    console.log(`Received message on ${channelLabel}:`, data);

    // Handle ICE candidate messages (these are not MultiplayerMessage types)
    if (data.type === 'webrtc-ice-candidate' && data.candidate) {
      if (peerConnectionRef.current) {
        handleIncomingIceCandidate(peerConnectionRef.current, data.candidate);
      }
      return;  // Don't process further as a MultiplayerMessage
    }

    // Now handle normal MultiplayerMessage types
    const message = data as MultiplayerMessage;
    
    switch (message.type) {
      case 'game-actions':
        // Host receives player actions
        if (multiplayerState.isHost && gameActionReceivedRef.current) {
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
        if (!multiplayerState.isHost && onStoryUpdate) {
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
            isMyTurn: msg.payload.turnOrder[msg.payload.currentTurnIndex] === multiplayerState.peerId,
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
          if (controlMsg.payload.targetPeerId === multiplayerState.peerId) {
            // We are kicked
            console.log('Kicked from game');
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
        } else if (controlMsg.payload.action === 'request-sync' && multiplayerState.isHost) {
          // Host received a sync request from a reconnecting peer
          console.log('Host: Sync request received, sending full state...');
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
        } else if (controlMsg.payload.action === 'sync-response' && !multiplayerState.isHost) {
          // Guest received state sync from host
          console.log('Guest: Received state sync from host');
          const { gameState, partyState, turnOrder, currentTurnIndex } = controlMsg.payload.data || {};
          if (gameState && onStoryUpdate) {
            // Apply the synced state - this will trigger a full state update
            console.log('Guest: Applying synced state...');
            // The actual state application will be done via dispatch in the component
            if (onControlMessage) {
              onControlMessage({ action: 'sync-complete', data: { gameState, partyState, turnOrder, currentTurnIndex } });
            }
          }
        }
        break;
      }
    }
  }, [multiplayerState.isHost, multiplayerState.peerId, onStoryUpdate, onPartyStateUpdate, onChatMessage, onControlMessage, onInteractionRequest, onInteractionResponse]);

  // Disconnect
  const disconnect = useCallback(() => {
    intentionalDisconnect.current = true;
    
    // Close all data channels
    Object.values(dataChannelsRef.current).forEach(channel => {
      try { channel.close(); } catch (e) {}
    });
    dataChannelsRef.current = {};

    // Close peer connection
    if (peerConnectionRef.current) {
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