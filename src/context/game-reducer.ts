"use client";

// src/context/game-reducer.ts
import type { GameState } from "../types/game-types";
import type { Action } from "./game-actions";
import { initialState } from "./game-initial-state";
import { characterReducer } from "./reducers/characterReducer";
import { inventoryReducer } from "./reducers/inventoryReducer";
import { settingsReducer } from "./reducers/settingsReducer";
import { adventureReducer } from "./reducers/adventureReducer";

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

export function gameReducer(state: GameState, action: Action): GameState {
    if (process.env.NODE_ENV === 'development') {
        console.log(`GameReducer: Action received - ${action.type}`, 
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
            },
            action
        )
        : {
            adventureSettings: state.adventureSettings,
            selectedThemeId: state.selectedThemeId,
            isDarkMode: state.isDarkMode,
            userGoogleAiApiKey: state.userGoogleAiApiKey,
        };

    let nextState: GameState = {
        ...state,
        character: updatedCharacter,
        inventory: updatedInventory,
        adventureSettings: settingsRelatedState.adventureSettings,
        selectedThemeId: settingsRelatedState.selectedThemeId,
        isDarkMode: settingsRelatedState.isDarkMode,
        userGoogleAiApiKey: settingsRelatedState.userGoogleAiApiKey,
    };

    if (ADVENTURE_ACTIONS.has(action.type)) {
        nextState = adventureReducer(nextState, action);
    }

    switch (action.type) {
        case "RESET_GAME": {
            const { savedAdventures, selectedThemeId, isDarkMode, userGoogleAiApiKey } = state;
            console.log("GameReducer: Resetting game to initial state, preserving session settings.");
            return {
                ...initialState,
                savedAdventures,
                selectedThemeId,
                isDarkMode,
                userGoogleAiApiKey,
                status: "MainMenu",
            };
        }
        default:
            return nextState;
    }
}