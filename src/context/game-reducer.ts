// src/context/game-reducer.ts
import type { GameState } from "@/types/game-types";
import type { Action } from "./game-actions";
import { characterReducer } from "./reducers/characterReducer";
import { inventoryReducer } from "./reducers/inventoryReducer";
import { adventureReducer } from "./reducers/adventureReducer";
import { settingsReducer } from "./reducers/settingsReducer";
import { SAVED_ADVENTURES_KEY } from "@/lib/constants"; // Import constant
import { initialState } from "./game-initial-state";
import { updateGameStateString } from "@/lib/game-state-utils";


/**
 * The main reducer function for managing the game state.
 * It delegates actions to specific sub-reducers based on the action type.
 *
 * @param state - The current game state.
 * @param action - The action to be processed.
 * @returns The new game state.
 */
export function gameReducer(state: GameState, action: Action): GameState {
    console.log(`Root Reducer Action: ${action.type}`, action.payload ? JSON.stringify(action.payload).substring(0, 200) : '');

    // Delegate actions to specific reducers
    let nextState: GameState = {
        ...state,
        // Pass the current character state to characterReducer
        character: characterReducer(state.character, action),
        inventory: inventoryReducer(state.inventory, action),
        // Pass the full state object to settingsReducer for all its concerns
        adventureSettings: settingsReducer(state, action).adventureSettings,
        selectedThemeId: settingsReducer(state, action).selectedThemeId,
        isDarkMode: settingsReducer(state, action).isDarkMode,
    };

    // Handle actions that affect multiple slices or the root state
    nextState = adventureReducer(nextState, action); // Adventure reducer might need access to more state

    // --- Global State / Cross-Cutting Actions ---
     switch (action.type) {
        case "CREATE_CHARACTER_AND_SETUP": {
             const newCharacter = characterReducer(null, { type: "CREATE_CHARACTER", payload: action.payload });
             if (!newCharacter) return state; // Should not happen if payload is valid, but check anyway
             return {
                 ...state, // Keep saved adventures, theme, etc.
                 character: newCharacter,
                 inventory: inventoryReducer([], { type: "START_GAMEPLAY" }), // Initialize inventory
                 status: "AdventureSetup", // Navigate immediately after character creation
                 // Reset other relevant gameplay state if needed
                 storyLog: [],
                 currentNarration: null,
                 currentGameStateString: "Adventure setup pending...",
                 currentAdventureId: null,
                 turnCount: 0,
                 adventureSummary: null,
             };
         }
        case "RESET_GAME": {
           const saved = state.savedAdventures; // Keep saved adventures
           const themeId = state.selectedThemeId; // Keep theme
           const darkMode = state.isDarkMode; // Keep mode
           return { ...initialState, savedAdventures: saved, status: "MainMenu", selectedThemeId: themeId, isDarkMode: darkMode };
         }
        case "LOAD_SAVED_ADVENTURES":
            return { ...state, savedAdventures: action.payload };
        case "SAVE_CURRENT_ADVENTURE": {
          if (!nextState.character || !nextState.currentAdventureId || nextState.status !== "Gameplay") {
            console.warn("Cannot save: No active character, adventure ID, or not in Gameplay.");
            return nextState;
          }
          // Use the potentially updated state from sub-reducers
          const currentSave = {
            id: nextState.currentAdventureId,
            saveTimestamp: Date.now(),
            characterName: nextState.character.name,
            character: nextState.character,
            adventureSettings: nextState.adventureSettings,
            storyLog: nextState.storyLog,
            currentGameStateString: updateGameStateString(nextState.currentGameStateString, nextState.character, nextState.inventory, nextState.turnCount), // Update game state string on save
            inventory: nextState.inventory,
            statusBeforeSave: nextState.status,
            adventureSummary: nextState.adventureSummary,
            turnCount: nextState.turnCount,
          };
          const savesWithoutCurrent = state.savedAdventures.filter(adv => adv.id !== currentSave.id);
          const newSaves = [...savesWithoutCurrent, currentSave];
          localStorage.setItem(SAVED_ADVENTURES_KEY, JSON.stringify(newSaves));
          return { ...nextState, savedAdventures: newSaves };
        }
        case "DELETE_ADVENTURE": {
            const filteredSaves = state.savedAdventures.filter(adv => adv.id !== action.payload);
            localStorage.setItem(SAVED_ADVENTURES_KEY, JSON.stringify(filteredSaves));
            return { ...nextState, savedAdventures: filteredSaves };
         }
        default:
          // If no root-level action matched, return the state potentially modified by sub-reducers
          return nextState;
      }
}
