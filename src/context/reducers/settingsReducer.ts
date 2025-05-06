// src/context/reducers/settingsReducer.ts
import type { AdventureSettings, DifficultyLevel } from "@/types/adventure-types";
import type { GameState } from "@/types/game-types";
import type { Action } from "../game-actions";
import { initialAdventureSettings, initialState } from "../game-initial-state";
import { VALID_ADVENTURE_DIFFICULTY_LEVELS } from "@/lib/constants";

// Define the part of the state this reducer handles
type SettingsState = Pick<GameState, 'adventureSettings' | 'selectedThemeId' | 'isDarkMode' | 'userGoogleAiApiKey'>;

// Combined reducer for settings (adventure settings + appearance + API key)
export function settingsReducer(state: SettingsState, action: Action): SettingsState {
    switch (action.type) {
        case "SET_ADVENTURE_SETTINGS": {
            const validatedDifficulty = VALID_ADVENTURE_DIFFICULTY_LEVELS.includes(action.payload.difficulty as DifficultyLevel)
                 ? action.payload.difficulty as DifficultyLevel
                 : state.adventureSettings.difficulty;

            const newSettings: AdventureSettings = {
                ...state.adventureSettings,
                ...(action.payload || {}),
                difficulty: validatedDifficulty,
            };
            return { ...state, adventureSettings: newSettings };
        }
        case "SET_THEME_ID":
            return { ...state, selectedThemeId: action.payload };
        case "SET_DARK_MODE":
            return { ...state, isDarkMode: action.payload };
        case "SET_USER_API_KEY":
            return { ...state, userGoogleAiApiKey: action.payload };
         case "RESET_GAME":
             return {
                ...state,
                adventureSettings: { ...initialAdventureSettings },
                // userGoogleAiApiKey is persisted and not reset here.
                // Theme and dark mode are also persisted.
             };
         case "LOAD_ADVENTURE": {
             const settingsToLoad = action.payload.adventureSettings;
             const validatedDifficulty = VALID_ADVENTURE_DIFFICULTY_LEVELS.includes(settingsToLoad?.difficulty as DifficultyLevel)
                 ? settingsToLoad.difficulty as DifficultyLevel
                 : initialAdventureSettings.difficulty;

             const validatedSettings: AdventureSettings = {
                 ...initialAdventureSettings,
                 ...(settingsToLoad || {}),
                 difficulty: validatedDifficulty,
             };
             return {
                ...state,
                 adventureSettings: validatedSettings
                 // userGoogleAiApiKey, theme, dark mode are kept from current state.
             };
         }
        default:
            return state;
    }
}
