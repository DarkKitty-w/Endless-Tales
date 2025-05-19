
// src/context/reducers/settingsReducer.ts
import type { AdventureSettings, DifficultyLevel, AdventureType } from "@/types/adventure-types";
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

            const currentType = action.payload.adventureType ?? state.adventureSettings.adventureType;

            const newSettings: AdventureSettings = {
                ...state.adventureSettings,
                ...action.payload,
                adventureType: currentType,
                difficulty: validatedDifficulty,
                worldType: currentType === 'Custom' ? (action.payload.worldType ?? state.adventureSettings.worldType) : "",
                mainQuestline: currentType === 'Custom' ? (action.payload.mainQuestline ?? state.adventureSettings.mainQuestline) : "",
                genreTheme: currentType === 'Custom' ? (action.payload.genreTheme ?? state.adventureSettings.genreTheme) : "",
                magicSystem: currentType === 'Custom' ? (action.payload.magicSystem ?? state.adventureSettings.magicSystem) : "",
                techLevel: currentType === 'Custom' ? (action.payload.techLevel ?? state.adventureSettings.techLevel) : "",
                dominantTone: currentType === 'Custom' ? (action.payload.dominantTone ?? state.adventureSettings.dominantTone) : "",
                startingSituation: currentType === 'Custom' ? (action.payload.startingSituation ?? state.adventureSettings.startingSituation) : "",
                combatFrequency: currentType === 'Custom' ? (action.payload.combatFrequency ?? state.adventureSettings.combatFrequency) : "Medium",
                puzzleFrequency: currentType === 'Custom' ? (action.payload.puzzleFrequency ?? state.adventureSettings.puzzleFrequency) : "Medium",
                socialFocus: currentType === 'Custom' ? (action.payload.socialFocus ?? state.adventureSettings.socialFocus) : "Medium",
                universeName: currentType === 'Immersed' ? (action.payload.universeName ?? state.adventureSettings.universeName) : "",
                playerCharacterConcept: currentType === 'Immersed' ? (action.payload.playerCharacterConcept ?? state.adventureSettings.playerCharacterConcept) : "",
                characterOriginType: currentType === 'Immersed' ? (action.payload.characterOriginType ?? state.adventureSettings.characterOriginType) : undefined,
            };
            console.log("SettingsReducer: Updated adventure settings:", newSettings);
            return { ...state, adventureSettings: newSettings };
        }
        case "SET_ADVENTURE_TYPE":
            console.log("SettingsReducer: Setting adventure type to", action.payload);
            return {
                ...state,
                adventureSettings: {
                    ...initialAdventureSettings, 
                    adventureType: action.payload, 
                    difficulty: state.adventureSettings.difficulty,
                    permanentDeath: state.adventureSettings.permanentDeath,
                    characterOriginType: action.payload === 'Immersed' ? 'original' : undefined,
                }
            };
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
            
             const loadedAdventureType = settingsToLoad?.adventureType || null;

             const validatedSettings: AdventureSettings = {
                 ...initialAdventureSettings, 
                 ...(settingsToLoad || {}), 
                 adventureType: loadedAdventureType,
                 difficulty: validatedDifficulty,
                worldType: loadedAdventureType === 'Custom' ? (settingsToLoad?.worldType ?? "") : "",
                mainQuestline: loadedAdventureType === 'Custom' ? (settingsToLoad?.mainQuestline ?? "") : "",
                genreTheme: loadedAdventureType === 'Custom' ? (settingsToLoad?.genreTheme ?? "") : "",
                magicSystem: loadedAdventureType === 'Custom' ? (settingsToLoad?.magicSystem ?? "") : "",
                techLevel: loadedAdventureType === 'Custom' ? (settingsToLoad?.techLevel ?? "") : "",
                dominantTone: loadedAdventureType === 'Custom' ? (settingsToLoad?.dominantTone ?? "") : "",
                startingSituation: loadedAdventureType === 'Custom' ? (settingsToLoad?.startingSituation ?? "") : "",
                combatFrequency: loadedAdventureType === 'Custom' ? (settingsToLoad?.combatFrequency ?? "Medium") : "Medium",
                puzzleFrequency: loadedAdventureType === 'Custom' ? (settingsToLoad?.puzzleFrequency ?? "Medium") : "Medium",
                socialFocus: loadedAdventureType === 'Custom' ? (settingsToLoad?.socialFocus ?? "Medium") : "Medium",
                universeName: loadedAdventureType === 'Immersed' ? (settingsToLoad?.universeName ?? "") : "",
                playerCharacterConcept: loadedAdventureType === 'Immersed' ? (settingsToLoad?.playerCharacterConcept ?? "") : "",
                characterOriginType: loadedAdventureType === 'Immersed' ? (settingsToLoad?.characterOriginType ?? 'original') : undefined,
             };
             console.log("SettingsReducer: Loaded adventure settings:", validatedSettings);
             return {
                ...state,
                 adventureSettings: validatedSettings
             };
         }
        default:
            return state;
    }
}

