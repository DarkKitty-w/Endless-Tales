"use client";

// src/context/game-reducer.ts
import type { GameState } from "../types/game-types";
import type { Action } from "./game-actions";
import { initialState } from "./game-initial-state";
import { characterReducer } from "./reducers/characterReducer";
import { inventoryReducer } from "./reducers/inventoryReducer";
import { settingsReducer } from "./reducers/settingsReducer";
import { adventureReducer } from "./reducers/adventureReducer";
import { multiplayerReducer } from "./reducers/multiplayerReducer";
import { logger } from "@/lib/logger";

// Action type sets for routing to specific reducers
const CHARACTER_ACTIONS = new Set<Action['type']>([
    "CREATE_CHARACTER",
    "UPDATE_CHARACTER",
    "SET_AI_DESCRIPTION",
    "GRANT_XP",
    "LEVEL_UP",
    "UPDATE_REPUTATION",
    "UPDATE_NPC_RELATIONSHIP",
    "SET_SKILL_TREE",
    "CHANGE_CLASS_AND_RESET_SKILLS",
    "PROGRESS_SKILL_STAGE",
    "UPDATE_NARRATION",
    "RESPAWN_CHARACTER",
    "LOAD_ADVENTURE",
    "RESET_GAME",
]);

const INVENTORY_ACTIONS = new Set<Action['type']>([
    "ADD_ITEM",
    "REMOVE_ITEM",
    "UPDATE_ITEM",
    "UPDATE_INVENTORY",
    "UPDATE_CRAFTING_RESULT",
    "START_GAMEPLAY",
    "LOAD_ADVENTURE",
    "RESET_GAME",
]);

const SETTINGS_ACTIONS = new Set<Action['type']>([
    "SET_ADVENTURE_SETTINGS",
    "SET_ADVENTURE_TYPE",
    "SET_THEME_ID",
    "SET_DARK_MODE",
    "SET_USER_API_KEY",
    "SET_AI_PROVIDER",
    "SET_PROVIDER_API_KEY",
    "LOAD_ADVENTURE",
    "RESET_GAME",
]);

const ADVENTURE_ACTIONS = new Set<Action['type']>([
    "SET_GAME_STATUS",
    "START_GAMEPLAY",
    "UPDATE_NARRATION",
    "RESPAWN_CHARACTER",
    "UPDATE_CRAFTING_RESULT",
    "INCREMENT_TURN",
    "SET_SKILL_TREE_GENERATING",
    "END_ADVENTURE",
    "LOAD_SAVED_ADVENTURES",
    "SAVE_CURRENT_ADVENTURE",
    "LOAD_ADVENTURE",
    "DELETE_ADVENTURE",
]);

const MULTIPLAYER_ACTIONS = new Set<Action['type']>([
    "PEER_CONNECTED",
    "PEER_DISCONNECTED",
    "SET_TURN_ORDER",
    "ADVANCE_TURN",
    "APPLY_REMOTE_STATE",
    "APPLY_REMOTE_NARRATION",
    "SEND_PLAYER_ACTION",
    "UPDATE_PARTY_STATE",
    "ADD_CHAT_MESSAGE",
    "CLEAR_CHAT",
    "SET_PENDING_INTERACTION",
    "RESOLVE_PENDING_INTERACTION",
    "KICK_PLAYER",
    "PAUSE_GAME",
    "RESUME_GAME",
    "SET_CONNECTION_STATUS",
    "SET_MY_TURN",
    "SET_SESSION_ID",
    "SET_IS_HOST",
    "SET_PLAYERS",
    "PROCESS_TRADE",
]);

export function gameReducer(state: GameState, action: Action): GameState {
    if (process.env.NODE_ENV === 'development') {
        logger.log(`GameReducer: Action received - ${action.type}`, 
            (action as any).payload !== undefined ? JSON.stringify((action as any).payload).substring(0,300) : '(no payload)');
    }

    // Conditionally call sub-reducers only for relevant actions
    const updatedCharacter = CHARACTER_ACTIONS.has(action.type)
        ? characterReducer(state.character, action)
        : state.character;

    const updatedInventory = INVENTORY_ACTIONS.has(action.type)
        ? inventoryReducer(state.inventory, action)
        : state.inventory;

    const settingsRelatedState = SETTINGS_ACTIONS.has(action.type)
        ? settingsReducer(
            {
                adventureSettings: state.adventureSettings,
                selectedThemeId: state.selectedThemeId,
                isDarkMode: state.isDarkMode,
                userGoogleAiApiKey: state.userGoogleAiApiKey,
                aiProvider: state.aiProvider,
                providerApiKeys: state.providerApiKeys,
            },
            action
        )
        : {
            adventureSettings: state.adventureSettings,
            selectedThemeId: state.selectedThemeId,
            isDarkMode: state.isDarkMode,
            userGoogleAiApiKey: state.userGoogleAiApiKey,
            aiProvider: state.aiProvider,
            providerApiKeys: state.providerApiKeys,
        };

    let nextState: GameState = {
        ...state,
        character: updatedCharacter,
        inventory: updatedInventory,
        adventureSettings: settingsRelatedState.adventureSettings,
        selectedThemeId: settingsRelatedState.selectedThemeId,
        isDarkMode: settingsRelatedState.isDarkMode,
        userGoogleAiApiKey: settingsRelatedState.userGoogleAiApiKey,
        aiProvider: settingsRelatedState.aiProvider ?? state.aiProvider,
        providerApiKeys: settingsRelatedState.providerApiKeys ?? state.providerApiKeys,
    };

    if (ADVENTURE_ACTIONS.has(action.type)) {
        nextState = adventureReducer(nextState, action);
    }

    if (MULTIPLAYER_ACTIONS.has(action.type)) {
        nextState = multiplayerReducer(nextState, action);
    }

    // PERF-1 Fix: Return old state reference if nothing changed to prevent unnecessary re-renders
    if (
        nextState === state ||
        (nextState.character === state.character &&
         nextState.inventory === state.inventory &&
         nextState.adventureSettings === state.adventureSettings &&
         nextState.storyLog === state.storyLog &&
         nextState.turnCount === state.turnCount &&
         nextState.status === state.status &&
         nextState.currentNarration === state.currentNarration &&
         nextState.adventureSummary === state.adventureSummary &&
         nextState.currentGameStateString === state.currentGameStateString &&
         nextState.savedAdventures === state.savedAdventures &&
         nextState.currentAdventureId === state.currentAdventureId &&
         nextState.isGeneratingSkillTree === state.isGeneratingSkillTree &&
         nextState.selectedThemeId === state.selectedThemeId &&
         nextState.isDarkMode === state.isDarkMode &&
         nextState.userGoogleAiApiKey === state.userGoogleAiApiKey &&
         nextState.aiProvider === state.aiProvider &&
         nextState.providerApiKeys === state.providerApiKeys &&
         nextState.sessionId === state.sessionId &&
         nextState.players === state.players &&
         nextState.isHost === state.isHost &&
         nextState.peerId === state.peerId &&
         nextState.connectionStatus === state.connectionStatus &&
         nextState.turnOrder === state.turnOrder &&
         nextState.currentTurnIndex === state.currentTurnIndex &&
         nextState.isMyTurn === state.isMyTurn &&
         nextState.pendingInteraction === state.pendingInteraction &&
         nextState.partyState === state.partyState &&
         nextState.chatMessages === state.chatMessages &&
         nextState.isPaused === state.isPaused &&
         nextState.worldMap === state.worldMap)
    ) {
        return state;  // Return OLD reference if nothing changed
    }

    switch (action.type) {
        case "RESET_GAME": {
            const { savedAdventures, selectedThemeId, isDarkMode, userGoogleAiApiKey, aiProvider, providerApiKeys } = state;
            logger.log("GameReducer: Resetting game to initial state, preserving session settings.");
            return {
                ...initialState,
                savedAdventures,
                selectedThemeId,
                isDarkMode,
                userGoogleAiApiKey,
                aiProvider,                // ← ADDED
                providerApiKeys,            // ← ADDED
                status: "MainMenu",
            };
        }
        default:
            return nextState;
    }
}