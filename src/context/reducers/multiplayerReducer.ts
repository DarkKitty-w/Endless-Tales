// src/context/reducers/multiplayerReducer.ts
// Handles all multiplayer-related state changes

import type { GameState } from "../../types/game-types";
import type { Action } from "../game-actions";
import type { PeerInfo, PlayerSummary, PendingInteraction, ConnectionStatus } from "../../types/multiplayer-types";
import { logger } from "../../lib/logger";
import { sanitizeStateForPersistence } from "../../lib/storage-utils";

export function multiplayerReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "PEER_CONNECTED": {
      const { peerId, name, isHost } = action.payload;
      const newPeer: PeerInfo = {
        peerId,
        name,
        isHost,
        isConnected: true,
      };
      
      // Check if peer already exists
      if (state.players.includes(peerId)) {
        return state;
      }
      
      return {
        ...state,
        players: [...state.players, peerId],
        partyState: {
          ...state.partyState,
          [peerId]: state.partyState[peerId] || {
            peerId,
            name,
            class: 'Unknown',
            level: 1,
            currentHealth: 100,
            maxHealth: 100,
            currentStamina: 100,
            maxStamina: 100,
            currentMana: 100,
            maxMana: 100,
            inventorySummary: [],
          } as PlayerSummary,
        },
      };
    }

    case "PEER_DISCONNECTED": {
      const peerId = action.payload;
      return {
        ...state,
        players: state.players.filter(id => id !== peerId),
        partyState: (() => {
          const newState = { ...state.partyState };
          delete newState[peerId];
          return newState;
        })(),
      };
    }

    case "SET_TURN_ORDER": {
      const turnOrder = action.payload;
      return {
        ...state,
        turnOrder,
        currentTurnIndex: 0,
        isMyTurn: turnOrder.length > 0 && turnOrder[0] === state.peerId,
      };
    }

    case "ADVANCE_TURN": {
      const newIndex = action.payload;
      if (newIndex < 0 || newIndex >= state.turnOrder.length) {
        logger.error('ADVANCE_TURN: Invalid turn index', newIndex);
        return state;
      }
      return {
        ...state,
        currentTurnIndex: newIndex,
        isMyTurn: state.turnOrder[newIndex] === state.peerId,
      };
    }

    case "APPLY_REMOTE_STATE": {
      const remoteState = action.payload;
      // SAVE-11 Fix: Sanitize remote state to remove multiplayer-specific fields
      // before merging into local state to prevent persisting them in saves
      const sanitizedRemote = sanitizeStateForPersistence(remoteState);
      
      // SAVE-12 Fix: Create backup of current state before applying remote state
      // This provides a safety net in case of conflicts
      if (state.currentAdventureId) {
        try {
          const localBackup = {
            id: `${state.currentAdventureId}_pre_multiplayer_${Date.now()}`,
            version: state.version,
            saveTimestamp: Date.now(),
            characterName: state.character?.name || 'Unknown',
            character: state.character,
            adventureSettings: state.adventureSettings,
            storyLog: state.storyLog,
            currentGameStateString: state.currentGameStateString,
            inventory: state.inventory,
            statusBeforeSave: state.status,
            adventureSummary: state.adventureSummary,
            turnCount: state.turnCount,
            worldMap: state.worldMap,
          };
          // Store in sessionStorage as a temporary backup (not persisted across sessions)
          sessionStorage.setItem(
            `endlessTales_temp_backup_${state.currentAdventureId}_${Date.now()}`,
            JSON.stringify(localBackup)
          );
          logger.log('Created backup before applying remote state');
        } catch (e) {
          logger.error('Failed to create backup before applying remote state:', e);
        }
      }
      
      // Apply remote state partially - only update what host sends
      // Preserve local multiplayer state that shouldn't be overwritten
      return {
        ...state,
        ...sanitizedRemote,
        // Preserve local multiplayer state that shouldn't be overwritten
        peerId: state.peerId,
        sessionId: state.sessionId,
        isHost: state.isHost,
        connectionStatus: state.connectionStatus,
      };
    }

    case "APPLY_REMOTE_NARRATION": {
      const { entry, newTurn } = action.payload;
      const newLogEntry = { ...entry, timestamp: entry.timestamp || Date.now() };
      const newLog = [...state.storyLog, newLogEntry].slice(-200);
      
      return {
        ...state,
        currentNarration: newLogEntry,
        storyLog: newLog,
        turnCount: newTurn,
      };
    }

    case "SEND_PLAYER_ACTION": {
      // NO-OP: This action is intentionally handled by the useMultiplayer hook via
      // the sendGameAction callback, not by this reducer. The action is dispatched
      // to notify the system that a player action was sent, but state changes
      // occur through other actions (RECEIVE_NARRATION, etc.)
      return state;
    }

    case "UPDATE_PARTY_STATE": {
      const partyState = action.payload;
      return {
        ...state,
        partyState,
      };
    }

    case "ADD_CHAT_MESSAGE": {
      const message = action.payload;
      const newMessages = [...state.chatMessages, message].slice(-100); // Keep last 100 messages
      return {
        ...state,
        chatMessages: newMessages,
      };
    }

    case "CLEAR_CHAT": {
      return {
        ...state,
        chatMessages: [],
      };
    }

    case "SET_PENDING_INTERACTION": {
      return {
        ...state,
        pendingInteraction: action.payload,
      };
    }

    case "RESOLVE_PENDING_INTERACTION": {
      const { accepted } = action.payload;
      if (!state.pendingInteraction) return state;
      
      return {
        ...state,
        pendingInteraction: {
          ...state.pendingInteraction,
          resolved: true,
          accepted,
        },
      };
    }

    case "KICK_PLAYER": {
      const peerId = action.payload;
      // Only host can kick
      if (!state.isHost) return state;
      
      return {
        ...state,
        players: state.players.filter(id => id !== peerId),
        partyState: (() => {
          const newState = { ...state.partyState };
          delete newState[peerId];
          return newState;
        })(),
      };
    }

    case "PAUSE_GAME": {
      if (!state.isHost) return state;
      return {
        ...state,
        isPaused: true,
      };
    }

    case "RESUME_GAME": {
      if (!state.isHost) return state;
      return {
        ...state,
        isPaused: false,
      };
    }

    case "SET_CONNECTION_STATUS": {
      const status = action.payload as ConnectionStatus;
      return {
        ...state,
        connectionStatus: status,
      };
    }

    case "SET_MY_TURN": {
      return {
        ...state,
        isMyTurn: action.payload,
      };
    }

    case "SET_SESSION_ID": {
      return {
        ...state,
        sessionId: action.payload,
      };
    }

    case "SET_IS_HOST": {
      return {
        ...state,
        isHost: action.payload,
      };
    }

    case "SET_PLAYERS": {
      return {
        ...state,
        players: action.payload,
      };
    }

    case "PROCESS_TRADE": {
      const { fromPeerId, toPeerId, items } = action.payload;
      // Process trade - transfer items between players
      const newPartyState = { ...state.partyState };
      let newInventory = state.inventory;
      
      if (newPartyState[fromPeerId] && newPartyState[toPeerId]) {
        // Update inventory summaries in party state
        const senderSummary = { ...newPartyState[fromPeerId] };
        const receiverSummary = { ...newPartyState[toPeerId] };
        
        // Remove items from sender's inventory summary
        if (senderSummary.inventorySummary) {
          senderSummary.inventorySummary = senderSummary.inventorySummary.filter(
            (itemName: string) => !items.includes(itemName)
          );
        }
        
        // Add items to receiver's inventory summary
        if (receiverSummary.inventorySummary) {
          receiverSummary.inventorySummary = [...receiverSummary.inventorySummary, ...items];
        } else {
          receiverSummary.inventorySummary = [...items];
        }
        
        newPartyState[fromPeerId] = senderSummary;
        newPartyState[toPeerId] = receiverSummary;
        
        logger.info(`Trade processed: ${fromPeerId} -> ${toPeerId}`, "multiplayerReducer", { items });
        
        // Update actual inventory if current player is involved
        if (state.peerId === fromPeerId || state.peerId === toPeerId) {
          // Find the actual InventoryItem objects for the items being traded
          const itemsToTransfer = state.inventory.filter(item => items.includes(item.name));
          
          if (state.peerId === fromPeerId) {
            // Current player is the sender - remove items from their inventory
            newInventory = state.inventory.filter(item => !items.includes(item.name));
            logger.info(`Removed items from sender's inventory`, "multiplayerReducer", { items });
          }
          
          if (state.peerId === toPeerId) {
            // Current player is the receiver - add items to their inventory
            // Note: In a real multiplayer scenario, the receiver would get the items from the sender's inventory
            // For now, we'll create new items since we don't have the full item data in the trade
            const newItems = items.map(itemName => ({
              name: itemName,
              description: `Traded item: ${itemName}`,
              quality: 'Common' as const,
            }));
            newInventory = [...state.inventory, ...newItems];
            logger.info(`Added items to receiver's inventory`, "multiplayerReducer", { items: newItems });
          }
        }
      }
      
      return {
        ...state,
        partyState: newPartyState,
        inventory: newInventory,
      };
    }

    case "RECONNECT_SYNC": {
      const { gameState, partyState, turnOrder, currentTurnIndex } = action.payload;
      // Full state sync for reconnection
      return {
        ...state,
        ...gameState,
        partyState: partyState || state.partyState,
        turnOrder: turnOrder || state.turnOrder,
        currentTurnIndex: currentTurnIndex || state.currentTurnIndex,
        isMyTurn: turnOrder ? turnOrder[currentTurnIndex || 0] === state.peerId : state.isMyTurn,
      };
    }

    default:
      return state;
  }
}
