// src/context/reducers/adventureReducer.ts
import type { GameState } from "../../types/game-types";
import type { StoryLogEntry, SavedAdventure } from "../../types/adventure-types";
import type { Action } from "../game-actions";
import { initialState, initialInventory, initialWorldMap } from "../game-initial-state";
import { generateAdventureId } from "../../lib/gameUtils";
import { buildGameStateContext, formatGameStateContextForPrompt } from "../game-state-utils";

const MAX_LOG_SIZE = 200; // Prevent unbounded memory growth

export function adventureReducer(state: GameState, action: Action): GameState {
    switch (action.type) {
        case "SET_GAME_STATUS":
            return { ...state, status: action.payload };

        case "START_GAMEPLAY": {
            if (!state.character) {
                console.error("AdventureReducer: Cannot start gameplay: Character is null. Resetting to Main Menu.");
                return {
                    ...initialState,
                    savedAdventures: state.savedAdventures,
                    selectedThemeId: state.selectedThemeId,
                    isDarkMode: state.isDarkMode,
                    userGoogleAiApiKey: state.userGoogleAiApiKey,
                    aiProvider: state.aiProvider,
                    providerApiKeys: state.providerApiKeys,
                };
            }
            if (!state.adventureSettings.adventureType) {
                console.error("AdventureReducer: Cannot start gameplay: Adventure type is not set. Resetting to Main Menu.");
                return {
                    ...initialState,
                    savedAdventures: state.savedAdventures,
                    selectedThemeId: state.selectedThemeId,
                    isDarkMode: state.isDarkMode,
                    userGoogleAiApiKey: state.userGoogleAiApiKey,
                    aiProvider: state.aiProvider,
                    providerApiKeys: state.providerApiKeys,
                };
            }
            const adventureId = state.currentAdventureId || generateAdventureId();
            const turnCount = state.turnCount > 0 ? state.turnCount : 0;
            const currentInventory = state.inventory.length > 0 ? state.inventory : [...initialInventory];
            const initialGameState = state.storyLog.length > 0
                ? state.currentGameStateString
                : formatGameStateContextForPrompt(buildGameStateContext({
                    ...state,
                    inventory: currentInventory,
                    turnCount,
                }));
            
            return {
                ...state,
                status: "Gameplay",
                inventory: currentInventory,
                currentGameStateString: initialGameState,
                currentAdventureId: adventureId,
                isGeneratingSkillTree: state.adventureSettings.adventureType !== "Immersed" && !state.character.skillTree && !state.isGeneratingSkillTree,
                turnCount: turnCount,
            };
        }

        case "UPDATE_NARRATION": {
            const newLogEntry: StoryLogEntry = { ...action.payload, timestamp: action.payload.timestamp || Date.now() };
            const newLog = [...state.storyLog, newLogEntry].slice(-MAX_LOG_SIZE);
            const newTurnCount = state.turnCount + 1;
            
            const updatedGameState = formatGameStateContextForPrompt(buildGameStateContext({
                ...state,
                storyLog: newLog,
                turnCount: newTurnCount,
            }));

            return {
                ...state,
                currentNarration: newLogEntry,
                storyLog: newLog,
                currentGameStateString: updatedGameState,
                turnCount: newTurnCount,
            };
        }

        case "RESPAWN_CHARACTER": {
            if (!state.character) return state;
            const respawnMessage = action.payload?.narrationMessage || "You had a narrow escape and have recovered!";
            const updatedGameState = formatGameStateContextForPrompt(buildGameStateContext(state));
            const respawnLogEntry: StoryLogEntry = {
                narration: respawnMessage,
                updatedGameState,
                timestamp: Date.now(),
            };
            
            return {
                ...state,
                storyLog: [...state.storyLog, respawnLogEntry].slice(-MAX_LOG_SIZE),
                currentNarration: respawnLogEntry,
            };
        }

        case "UPDATE_CRAFTING_RESULT": {
            const { narration, newGameStateString: providedGameState } = action.payload;
            const newTurnCount = state.turnCount + 1;
            if (!state.character) return { ...state, turnCount: newTurnCount };
            const finalGameStateString = providedGameState || formatGameStateContextForPrompt(buildGameStateContext({
                ...state,
                turnCount: newTurnCount,
            }));
            const craftingLogEntry: StoryLogEntry = { narration: narration, updatedGameState: finalGameStateString, timestamp: Date.now() };
            return {
                ...state,
                storyLog: [...state.storyLog, craftingLogEntry].slice(-MAX_LOG_SIZE),
                currentNarration: craftingLogEntry,
                currentGameStateString: finalGameStateString,
                turnCount: newTurnCount,
            };
        }

        case "INCREMENT_TURN": return { ...state, turnCount: state.turnCount + 1 };
        case "SET_SKILL_TREE_GENERATING": return { ...state, isGeneratingSkillTree: action.payload };

        case "END_ADVENTURE": {
            let finalLog = [...state.storyLog];
            let finalGameState = state.currentGameStateString;
            let finalCharacterState = state.character;
            let finalInventoryState = state.inventory;
            let finalTurnCount = state.turnCount;

            if (action.payload.finalNarration && (!state.currentNarration || action.payload.finalNarration.narration !== state.currentNarration.narration)) {
                const finalEntry: StoryLogEntry = { ...action.payload.finalNarration, timestamp: action.payload.finalNarration.timestamp || Date.now() };
                finalLog.push(finalEntry);
                finalCharacterState = state.character;
                finalInventoryState = state.inventory;
                finalTurnCount = state.turnCount + 1;
                if (finalCharacterState) {
                    finalGameState = formatGameStateContextForPrompt(buildGameStateContext({
                        ...state,
                        storyLog: finalLog,
                        turnCount: finalTurnCount,
                        inventory: finalInventoryState,
                        character: finalCharacterState,
                    }));
                }
            }

            let updatedSavedAdventures = state.savedAdventures;
            if (finalCharacterState && state.currentAdventureId) {
                const cappedStoryLog = finalLog.slice(-50);
                const endedAdventure: SavedAdventure = {
                    id: state.currentAdventureId,
                    saveTimestamp: Date.now(),
                    characterName: finalCharacterState.name,
                    character: finalCharacterState,
                    adventureSettings: state.adventureSettings,
                    storyLog: cappedStoryLog,
                    currentGameStateString: finalGameState,
                    inventory: finalInventoryState,
                    statusBeforeSave: "AdventureSummary",
                    adventureSummary: action.payload.summary ?? null,
                    turnCount: finalTurnCount,
                };
                updatedSavedAdventures = state.savedAdventures.filter(adv => adv.id !== endedAdventure.id);
                updatedSavedAdventures.push(endedAdventure);
            }
            return {
                ...state,
                status: "AdventureSummary",
                character: finalCharacterState,
                adventureSummary: action.payload.summary ?? null,
                storyLog: finalLog,
                inventory: finalInventoryState,
                turnCount: finalTurnCount,
                currentNarration: null,
                savedAdventures: updatedSavedAdventures,
                isGeneratingSkillTree: false,
            };
        }

        case "LOAD_SAVED_ADVENTURES": return { ...state, savedAdventures: action.payload };

        case "SAVE_CURRENT_ADVENTURE": {
            if (!state.character || !state.currentAdventureId || state.status !== "Gameplay") {
                return state;
            }
            const cappedStoryLog = state.storyLog.slice(-50);
            const currentSave: SavedAdventure = {
                id: state.currentAdventureId,
                saveTimestamp: Date.now(),
                characterName: state.character.name,
                character: state.character,
                adventureSettings: state.adventureSettings,
                storyLog: cappedStoryLog,
                currentGameStateString: formatGameStateContextForPrompt(buildGameStateContext(state)),
                inventory: state.inventory,
                statusBeforeSave: state.status,
                adventureSummary: state.adventureSummary,
                turnCount: state.turnCount,
            };
            const savesWithoutCurrent = state.savedAdventures.filter(adv => adv.id !== currentSave.id);
            const newSaves = [...savesWithoutCurrent, currentSave];
            return { ...state, savedAdventures: newSaves };
        }

        case "LOAD_ADVENTURE": {
            const adventureToLoad = action.payload;
            if (!adventureToLoad) return state;
            const statusToLoad = adventureToLoad.statusBeforeSave || (adventureToLoad.adventureSummary ? "AdventureSummary" : "Gameplay");
            return {
                ...initialState,
                savedAdventures: state.savedAdventures,
                selectedThemeId: state.selectedThemeId,
                isDarkMode: state.isDarkMode,
                userGoogleAiApiKey: state.userGoogleAiApiKey,
                aiProvider: state.aiProvider,
                providerApiKeys: state.providerApiKeys,
                status: statusToLoad,
                character: adventureToLoad.character,
                adventureSettings: adventureToLoad.adventureSettings,
                storyLog: adventureToLoad.storyLog,
                inventory: adventureToLoad.inventory,
                turnCount: adventureToLoad.turnCount || 0,
                currentGameStateString: adventureToLoad.currentGameStateString,
                currentNarration: adventureToLoad.storyLog.length > 0 ? adventureToLoad.storyLog[adventureToLoad.storyLog.length - 1] : null,
                adventureSummary: adventureToLoad.adventureSummary ?? null,
                currentAdventureId: adventureToLoad.id,
                isGeneratingSkillTree: false,
                worldMap: adventureToLoad.worldMap || initialWorldMap,
            };
        }

        case "DELETE_ADVENTURE": {
            const filteredSaves = state.savedAdventures.filter(adv => adv.id !== action.payload);
            return { ...state, savedAdventures: filteredSaves };
        }

        // World map actions
        case "SET_WORLD_MAP":
            return { ...state, worldMap: action.payload };

        case "ADD_LOCATION": {
            const newLocation = action.payload;
            return {
                ...state,
                worldMap: {
                    ...state.worldMap,
                    locations: [...state.worldMap.locations, newLocation],
                },
            };
        }

        case "UPDATE_LOCATION": {
            const { id, updates } = action.payload;
            return {
                ...state,
                worldMap: {
                    ...state.worldMap,
                    locations: state.worldMap.locations.map(loc =>
                        loc.id === id ? { ...loc, ...updates } : loc
                    ),
                },
            };
        }

        case "DISCOVER_LOCATION": {
            return {
                ...state,
                worldMap: {
                    ...state.worldMap,
                    locations: state.worldMap.locations.map(loc =>
                        loc.id === action.payload ? { ...loc, discovered: true } : loc
                    ),
                },
            };
        }

        case "SET_CURRENT_LOCATION": {
            const newLocationId = action.payload;
            const locationExists = state.worldMap.locations.some(loc => loc.id === newLocationId);
            if (!locationExists) return state;
            // Also discover the location when moving there
            return {
                ...state,
                worldMap: {
                    ...state.worldMap,
                    currentLocationId: newLocationId,
                    locations: state.worldMap.locations.map(loc =>
                        loc.id === newLocationId ? { ...loc, discovered: true } : loc
                    ),
                },
            };
        }

        default:
            return state;
    }
}