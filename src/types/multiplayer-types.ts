// src/types/multiplayer-types.ts
// Type definitions for WebRTC multiplayer feature

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'failed';

export interface PeerInfo {
  peerId: string;
  name: string;
  isHost: boolean;
  isConnected: boolean;
  character?: PlayerSummary;
}

export interface PlayerSummary {
  peerId: string;
  name: string;
  class: string;
  level: number;
  currentHealth: number;
  maxHealth: number;
  currentStamina: number;
  maxStamina: number;
  currentMana: number;
  maxMana: number;
  inventorySummary: string[]; // Item names only for display
}

export interface PendingInteraction {
  id: string;
  targetPeerId: string;
  type: 'gift' | 'trade' | 'duel' | 'custom';
  initiatedBy: string;
  details: string;
  resolved: boolean;
  accepted?: boolean;
}

export type DataChannelType = 
  | 'game-actions'
  | 'story-update'
  | 'party-state'
  | 'chat'
  | 'control';

export interface MultiplayerMessage {
  type: DataChannelType;
  payload: any;
  senderId: string;
  timestamp: number;
  messageId?: string;
  // NET-8 Fix: Add sequence number for message ordering
  sequenceNumber?: number;
}

export interface GameActionMessage {
  type: 'PLAYER_ACTION';
  payload: {
    playerId: string;
    action: string;
    turnNumber: number;
    isInitial?: boolean;
  };
  senderId: string;
  timestamp: number;
}

export interface StoryUpdateMessage {
  type: 'STORY_UPDATE';
  payload: {
    entry: any; // StoryLogEntry
    newTurn: number;
    updatedGameState: string;
  };
  senderId: string;
  timestamp: number;
}

export interface PartyStateMessage {
  type: 'PARTY_STATE';
  payload: {
    characters: Record<string, PlayerSummary>;
    turnOrder: string[];
    currentTurnIndex: number;
  };
  senderId: string;
  timestamp: number;
}

export interface ChatMessage {
  type: 'CHAT';
  payload: {
    playerId: string;
    playerName: string;
    text: string;
    timestamp: number;
  };
}

export interface ControlMessage {
  type: 'CONTROL';
  payload: {
    action: 'kick' | 'pause' | 'resume' | 'set-turn-order' | 'reconnect' | 'interaction-request' | 'interaction-response' | 'request-sync' | 'sync-response' | 'sync-complete';
    targetPeerId?: string;
    data?: any;
  };
  senderId: string;
  timestamp: number;
}

export interface InteractionRequest {
  id: string;
  type: 'gift' | 'trade' | 'duel' | 'custom';
  initiatedBy: string;
  targetPeerId: string;
  details: string;
  timestamp: number;
}

export interface WebRTCOffer {
  sdp: string;
  type: 'offer';
  iceCandidates: RTCIceCandidateInit[];
  hostInfo: {
    peerId: string;
    name: string;
  };
}

export interface WebRTCAnswer {
  sdp: string;
  type: 'answer';
  iceCandidates: RTCIceCandidateInit[];
  guestInfo: {
    peerId: string;
    name: string;
  };
}

export interface SignallingData {
  offer?: WebRTCOffer;
  answer?: WebRTCAnswer;
  iceCandidate?: RTCIceCandidateInit;
}

export interface MultiplayerState {
  peerId: string;
  sessionId: string;
  isHost: boolean;
  connectionStatus: ConnectionStatus;
  peers: PeerInfo[];
  turnOrder: string[];
  currentTurnIndex: number;
  isMyTurn: boolean;
  pendingInteraction: PendingInteraction | null;
  partyState: Record<string, PlayerSummary>;
  chatMessages: ChatMessage['payload'][];
  isPaused: boolean;
}