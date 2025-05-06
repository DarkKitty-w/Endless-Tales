// src/context/game-reducer.ts
import type { GameState } from "@/types/game-types";
import type { StoryLogEntry, SavedAdventure } from "@/types/adventure-types";
import type { Action } from "./game-actions";
import { initialAdventureSettings, initialState } from "./game-initial-state"; // Corrected path
import { calculateMaxStamina, calculateMaxMana, generateAdventureId } from "@/lib/gameUtils";
import { updateGameStateString } from "@/lib/game-state-utils";
import { characterReducer } from "./reducers/characterReducer";
import { inventoryReducer } from "./reducers/inventoryReducer";
import { settingsReducer } from "./reducers/settingsReducer";
import { adventureReducer } from "./reducers/adventureReducer";

export function gameReducer(state: GameState, action: Action): GameState {
    // Log all actions
    console.log(`Action: ${action.type}`, action.payload ? JSON.stringify(action.payload).substring(0, 200) : '');

    // Delegate to adventureReducer first for adventure-specific actions
    // However, adventureReducer itself might call other reducers implicitly if not careful
    // It's generally cleaner to have a root reducer that combines results.
    // For now, we'll keep the pattern where adventureReducer might be the primary handler for some actions.

    let nextState = { ...state }; // Start with a copy of the current state

    // Pass to specific reducers first.
    // These reducers should ideally only modify their respective parts of the state.
    const charState = characterReducer(state.character, action);
    const invState = inventoryReducer(state.inventory, action);
    // settingsReducer takes the whole GameState to manage adventureSettings, theme, mode, and API key.
    const settingsRelatedState = settingsReducer(state, action);


    // Update the main state object with results from individual reducers
    // This ensures that if a sub-reducer changed its part of the state, it's reflected.
    nextState.character = charState;
    nextState.inventory = invState;
    nextState.adventureSettings = settingsRelatedState.adventureSettings;
    nextState.selectedThemeId = settingsRelatedState.selectedThemeId;
    nextState.isDarkMode = settingsRelatedState.isDarkMode;
    nextState.userGoogleAiApiKey = settingsRelatedState.userGoogleAiApiKey;


    // Now handle actions that modify the root state or have cross-cutting concerns
    // This is where adventureReducer and other root-level logic comes in.
    // adventureReducer will operate on the `nextState` which already has updates from char/inv/settings.
    nextState = adventureReducer(nextState, action);


    // Specific root-level actions not fully covered by sub-reducers or needing further root-level logic
    switch (action.type) {
      // RESET_GAME needs to be handled at the root to reset everything.
      case "RESET_GAME": {
         const saved = state.savedAdventures;
         const themeId = state.selectedThemeId;
         const darkMode = state.isDarkMode;
         const apiKey = state.userGoogleAiApiKey;
         // Return the absolute initial state but preserve specific cross-session settings
         return { ...initialState, savedAdventures: saved, status: "MainMenu", selectedThemeId: themeId, isDarkMode: darkMode, userGoogleAiApiKey: apiKey };
       }

      // LOAD_SAVED_ADVENTURES directly impacts the root 'savedAdventures'
      case "LOAD_SAVED_ADVENTURES":
          return { ...nextState, savedAdventures: action.payload }; // Use nextState to keep other potential updates

      // SAVE_CURRENT_ADVENTURE also modifies 'savedAdventures' at the root
      case "SAVE_CURRENT_ADVENTURE": {
        if (!nextState.character || !nextState.currentAdventureId || nextState.status !== "Gameplay") {
          console.warn("Cannot save: No active character, adventure ID, or not in Gameplay.");
          return nextState; // Return the already processed state
        }
        const currentSave: SavedAdventure = {
          id: nextState.currentAdventureId,
          saveTimestamp: Date.now(),
          characterName: nextState.character.name,
          character: nextState.character,
          adventureSettings: nextState.adventureSettings,
          storyLog: nextState.storyLog,
          currentGameStateString: updateGameStateString(nextState.currentGameStateString, nextState.character, nextState.inventory, nextState.turnCount),
          inventory: nextState.inventory,
          statusBeforeSave: nextState.status,
          adventureSummary: nextState.adventureSummary,
          turnCount: nextState.turnCount,
        };
        const savesWithoutCurrent = nextState.savedAdventures.filter(adv => adv.id !== currentSave.id);
        const newSaves = [...savesWithoutCurrent, currentSave];
        localStorage.setItem("savedAdventures", JSON.stringify(newSaves));
        return { ...nextState, savedAdventures: newSaves };
      }

      // DELETE_ADVENTURE modifies 'savedAdventures'
      case "DELETE_ADVENTURE": {
          const filteredSaves = nextState.savedAdventures.filter(adv => adv.id !== action.payload);
          localStorage.setItem("savedAdventures", JSON.stringify(filteredSaves));
          return { ...nextState, savedAdventures: filteredSaves };
       }
      default:
        // If no root-level action matched, return the state already processed by sub-reducers and adventureReducer
        return nextState;
    }
}
