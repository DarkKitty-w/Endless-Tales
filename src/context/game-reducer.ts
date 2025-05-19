
// src/context/game-reducer.ts
import type { GameState } from "@/types/game-types";
import type { Action } from "./game-actions";
import { initialAdventureSettings, initialState } from "./game-initial-state";
import { characterReducer } from "./reducers/characterReducer";
import { inventoryReducer } from "./reducers/inventoryReducer";
import { settingsReducer } from "./reducers/settingsReducer";
import { adventureReducer } from "./reducers/adventureReducer"; // This will handle most game flow logic

export function gameReducer(state: GameState, action: Action): GameState {
    console.log(`GameReducer: Action received - ${action.type}`, action.payload !== undefined ? JSON.stringify(action.payload).substring(0,300) : '(no payload)');

    const updatedCharacter = characterReducer(state.character, action);
    const updatedInventory = inventoryReducer(state.inventory, action);
    const settingsRelatedState = settingsReducer(
        {
            adventureSettings: state.adventureSettings,
            selectedThemeId: state.selectedThemeId,
            isDarkMode: state.isDarkMode,
            userGoogleAiApiKey: state.userGoogleAiApiKey,
        },
        action
    );

    let nextState: GameState = {
        ...state,
        character: updatedCharacter,
        inventory: updatedInventory,
        adventureSettings: settingsRelatedState.adventureSettings,
        selectedThemeId: settingsRelatedState.selectedThemeId,
        isDarkMode: settingsRelatedState.isDarkMode,
        userGoogleAiApiKey: settingsRelatedState.userGoogleAiApiKey,
    };

    nextState = adventureReducer(nextState, action);

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
        // CREATE_CHARACTER_AND_SETUP is now fully handled by adventureReducer which calls characterReducer
        // Other specific root actions handled by adventureReducer or sub-reducers.
        default:
            return nextState;
    }
}
