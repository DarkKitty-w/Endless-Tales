
// src/context/reducers/settingsReducer.ts
import type { AdventureSettings, DifficultyLevel } from "../../types/adventure-types";
import type { GameState } from "../../types/game-types";
import type { Action } from "../game-actions";
import { initialAdventureSettings } from "../game-initial-state";
import { VALID_ADVENTURE_DIFFICULTY_LEVELS } from "../../lib/constants";

// Define the part of the state this reducer handles
type SettingsState = Pick<GameState, 'adventureSettings' | 'selectedThemeId' | 'isDarkMode' | 'userGoogleAiApiKey'>;

// Combined reducer for settings (adventure settings + appearance + API key)
export function settingsReducer(state: SettingsState, action: Action): SettingsState {
    switch (action.type) {
        case "SET_ADVENTURE_SETTINGS": {
            const incomingPayload = action.payload;
            const currentAdventureTypeInState = state.adventureSettings.adventureType;
            // Prioritize adventureType from payload if available, otherwise keep existing.
            // This is crucial because AdventureSetup dispatches this with the type already determined.
            const finalAdventureType = incomingPayload.adventureType ?? currentAdventureTypeInState;

            if (!finalAdventureType) {
                console.error("SettingsReducer: SET_ADVENTURE_SETTINGS - finalAdventureType is unexpectedly null/undefined. This could lead to issues.", "Incoming Payload:", incomingPayload, "Current state type:", currentAdventureTypeInState);
            }

            const validatedDifficulty = VALID_ADVENTURE_DIFFICULTY_LEVELS.includes(incomingPayload.difficulty as DifficultyLevel)
                 ? incomingPayload.difficulty as DifficultyLevel
                 : state.adventureSettings.difficulty;

            let characterOriginTypeForUpdate: 'existing' | 'original' | undefined = undefined;
            if (finalAdventureType === 'Immersed') {
                characterOriginTypeForUpdate = incomingPayload.characterOriginType ?? state.adventureSettings.characterOriginType ?? 'original';
            }

            const newSettings: AdventureSettings = {
                ...state.adventureSettings, 
                ...incomingPayload,         
                adventureType: finalAdventureType, 
                difficulty: validatedDifficulty,
                characterOriginType: characterOriginTypeForUpdate,

                // Ensure Custom fields are only populated if type is Custom
                worldType: finalAdventureType === 'Custom' ? (incomingPayload.worldType ?? state.adventureSettings.worldType ?? "") : "",
                mainQuestline: finalAdventureType === 'Custom' ? (incomingPayload.mainQuestline ?? state.adventureSettings.mainQuestline ?? "") : "",
                genreTheme: finalAdventureType === 'Custom' ? (incomingPayload.genreTheme ?? state.adventureSettings.genreTheme ?? "") : "",
                magicSystem: finalAdventureType === 'Custom' ? (incomingPayload.magicSystem ?? state.adventureSettings.magicSystem ?? "") : "",
                techLevel: finalAdventureType === 'Custom' ? (incomingPayload.techLevel ?? state.adventureSettings.techLevel ?? "") : "",
                dominantTone: finalAdventureType === 'Custom' ? (incomingPayload.dominantTone ?? state.adventureSettings.dominantTone ?? "") : "",
                startingSituation: finalAdventureType === 'Custom' ? (incomingPayload.startingSituation ?? state.adventureSettings.startingSituation ?? "") : "",
                combatFrequency: finalAdventureType === 'Custom' ? (incomingPayload.combatFrequency ?? state.adventureSettings.combatFrequency) : undefined,
                puzzleFrequency: finalAdventureType === 'Custom' ? (incomingPayload.puzzleFrequency ?? state.adventureSettings.puzzleFrequency) : undefined,
                socialFocus: finalAdventureType === 'Custom' ? (incomingPayload.socialFocus ?? state.adventureSettings.socialFocus) : undefined,

                // Ensure Immersed fields are only populated if type is Immersed
                universeName: finalAdventureType === 'Immersed' ? (incomingPayload.universeName ?? state.adventureSettings.universeName ?? "") : "",
                playerCharacterConcept: finalAdventureType === 'Immersed' ? (incomingPayload.playerCharacterConcept ?? state.adventureSettings.playerCharacterConcept ?? "") : "",
            };
            console.log("SettingsReducer: SET_ADVENTURE_SETTINGS. Final settings being applied:", JSON.stringify(newSettings));
            return { ...state, adventureSettings: newSettings };
        }
        case "SET_ADVENTURE_TYPE": {
            console.log("SettingsReducer: Setting adventure type to", action.payload, ". Resetting specific fields.");
            const preservedDifficulty = state.adventureSettings.difficulty || initialAdventureSettings.difficulty;
            const preservedPermadeath = state.adventureSettings.permanentDeath !== undefined
                ? state.adventureSettings.permanentDeath
                : initialAdventureSettings.permanentDeath;

            return {
                ...state,
                adventureSettings: {
                    // Start with a clean slate for adventure-specific settings
                    ...initialAdventureSettings, 
                    adventureType: action.payload, // Set the new type
                    // Preserve general settings
                    difficulty: preservedDifficulty,
                    permanentDeath: preservedPermadeath,
                    // Crucially, characterOriginType is ONLY relevant for "Immersed"
                    // For Randomized/Custom, it MUST be undefined.
                    characterOriginType: action.payload === 'Immersed' ? 'original' : undefined,
                }
            };
        }
        case "SET_THEME_ID":
            return { ...state, selectedThemeId: action.payload };
        case "SET_DARK_MODE":
            return { ...state, isDarkMode: action.payload };
        case "SET_USER_API_KEY":
            return { ...state, userGoogleAiApiKey: action.payload };
         case "RESET_GAME":
             // Preserve theme and API key, reset adventure settings
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
             let loadedCharacterOriginType: 'existing' | 'original' | undefined = undefined;
             if (loadedAdventureType === 'Immersed') {
                loadedCharacterOriginType = settingsToLoad?.characterOriginType ?? 'original';
             }


             const validatedSettings: AdventureSettings = {
                 ...initialAdventureSettings,
                 ...(settingsToLoad || {}),
                 adventureType: loadedAdventureType,
                 difficulty: validatedDifficulty,
                 characterOriginType: loadedCharacterOriginType,

                worldType: loadedAdventureType === 'Custom' ? (settingsToLoad?.worldType ?? "") : "",
                mainQuestline: loadedAdventureType === 'Custom' ? (settingsToLoad?.mainQuestline ?? "") : "",
                genreTheme: loadedAdventureType === 'Custom' ? (settingsToLoad?.genreTheme ?? "") : "",
                magicSystem: loadedAdventureType === 'Custom' ? (settingsToLoad?.magicSystem ?? "") : "",
                techLevel: loadedAdventureType === 'Custom' ? (settingsToLoad?.techLevel ?? "") : "",
                dominantTone: loadedAdventureType === 'Custom' ? (settingsToLoad?.dominantTone ?? "") : "",
                startingSituation: loadedAdventureType === 'Custom' ? (settingsToLoad?.startingSituation ?? "") : "",
                combatFrequency: loadedAdventureType === 'Custom' ? (settingsToLoad?.combatFrequency) : undefined,
                puzzleFrequency: loadedAdventureType === 'Custom' ? (settingsToLoad?.puzzleFrequency) : undefined,
                socialFocus: loadedAdventureType === 'Custom' ? (settingsToLoad?.socialFocus) : undefined,

                universeName: loadedAdventureType === 'Immersed' ? (settingsToLoad?.universeName ?? "") : "",
                playerCharacterConcept: loadedAdventureType === 'Immersed' ? (settingsToLoad?.playerCharacterConcept ?? "") : "",
             };
             console.log("SettingsReducer: Loaded adventure settings:", JSON.stringify(validatedSettings));
             return {
                ...state,
                 adventureSettings: validatedSettings
             };
         }
        default:
            return state;
    }
}
