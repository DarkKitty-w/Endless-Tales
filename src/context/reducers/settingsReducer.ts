// src/context/reducers/settingsReducer.ts
import type { AdventureSettings, DifficultyLevel } from "@/types/adventure-types";
import type { GameState } from "@/types/game-types"; // Import GameState for theme/mode
import type { Action } from "../game-actions";
import { initialAdventureSettings, initialState } from "../game-initial-state";
import { VALID_DIFFICULTY_LEVELS, THEME_ID_KEY, THEME_MODE_KEY } from "@/lib/constants"; // Import constants

// Define the part of the state this reducer handles
type SettingsState = Pick<GameState, 'adventureSettings' | 'selectedThemeId' | 'isDarkMode'>;

// Combined reducer for settings (adventure settings + appearance)
export function settingsReducer(state: SettingsState, action: Action): SettingsState {
    switch (action.type) {
        case "SET_ADVENTURE_SETTINGS": {
            // Ensure action.payload.difficulty is validated against the allowed enum values
             const validatedDifficulty = VALID_DIFFICULTY_LEVELS.includes(action.payload.difficulty as DifficultyLevel)
                 ? action.payload.difficulty as DifficultyLevel
                 : state.adventureSettings.difficulty; // Fallback to current if invalid

            const newSettings: AdventureSettings = {
                ...state.adventureSettings,
                ...(action.payload || {}), // Apply payload, ensuring it's not null/undefined
                difficulty: validatedDifficulty, // Apply validated difficulty
            };
            return { ...state, adventureSettings: newSettings };
        }
        case "SET_THEME_ID":
            console.log("Settings Reducer: Setting theme ID to", action.payload);
            // Persistence moved to context effect
            return { ...state, selectedThemeId: action.payload };
        case "SET_DARK_MODE":
            console.log("Settings Reducer: Setting dark mode to", action.payload);
            // Persistence moved to context effect
            return { ...state, isDarkMode: action.payload };
         case "RESET_GAME": // Reset adventure settings but keep theme/mode
             return {
                ...state, // Keep selectedThemeId and isDarkMode
                 adventureSettings: { ...initialAdventureSettings }
             };
         case "LOAD_ADVENTURE": { // Load adventure settings from saved game
             const settingsToLoad = action.payload.adventureSettings;
             const validatedDifficulty = VALID_DIFFICULTY_LEVELS.includes(settingsToLoad?.difficulty as DifficultyLevel)
                 ? settingsToLoad.difficulty as DifficultyLevel
                 : initialAdventureSettings.difficulty; // Default if missing or invalid

             const validatedSettings: AdventureSettings = {
                 ...initialAdventureSettings, // Start with defaults
                 ...(settingsToLoad || {}), // Apply loaded settings
                 difficulty: validatedDifficulty, // Apply validated difficulty
             };
             return {
                ...state, // Keep current theme/mode on load
                 adventureSettings: validatedSettings
             };
         }
        default:
            return state;
    }
}
