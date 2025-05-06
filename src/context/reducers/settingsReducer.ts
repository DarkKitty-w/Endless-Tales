// src/context/reducers/settingsReducer.ts
import type { AdventureSettings, DifficultyLevel } from "@/types/adventure-types";
import type { GameState } from "@/types/game-types";
import type { Action } from "../game-actions";
import { initialAdventureSettings } from "../game-initial-state";
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
                ...action.payload, // Spread the incoming payload
                difficulty: validatedDifficulty,
                 // Ensure specific fields are cleared if adventureType changes away from Custom/Immersed
                worldType: action.payload.adventureType === 'Custom' ? (action.payload.worldType ?? state.adventureSettings.worldType) : (action.payload.adventureType === 'Immersed' ? state.adventureSettings.worldType : ""),
                mainQuestline: action.payload.adventureType === 'Custom' ? (action.payload.mainQuestline ?? state.adventureSettings.mainQuestline) : (action.payload.adventureType === 'Immersed' ? state.adventureSettings.mainQuestline : ""),
                universeName: action.payload.adventureType === 'Immersed' ? (action.payload.universeName ?? state.adventureSettings.universeName) : "",
                playerCharacterConcept: action.payload.adventureType === 'Immersed' ? (action.payload.playerCharacterConcept ?? state.adventureSettings.playerCharacterConcept) : "",
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
             };
         case "LOAD_ADVENTURE": {
             const settingsToLoad = action.payload.adventureSettings;
             const validatedDifficulty = VALID_ADVENTURE_DIFFICULTY_LEVELS.includes(settingsToLoad?.difficulty as DifficultyLevel)
                 ? settingsToLoad.difficulty as DifficultyLevel
                 : initialAdventureSettings.difficulty;

             const validatedSettings: AdventureSettings = {
                 ...initialAdventureSettings,
                 ...(settingsToLoad || {}), // Spread loaded settings
                 difficulty: validatedDifficulty,
                 // Ensure specific fields are correctly loaded or defaulted
                worldType: settingsToLoad?.adventureType === 'Custom' ? (settingsToLoad.worldType ?? "") : "",
                mainQuestline: settingsToLoad?.adventureType === 'Custom' ? (settingsToLoad.mainQuestline ?? "") : "",
                universeName: settingsToLoad?.adventureType === 'Immersed' ? (settingsToLoad.universeName ?? "") : "",
                playerCharacterConcept: settingsToLoad?.adventureType === 'Immersed' ? (settingsToLoad.playerCharacterConcept ?? "") : "",
             };
             return {
                ...state,
                 adventureSettings: validatedSettings
             };
         }
        default:
            return state;
    }
}