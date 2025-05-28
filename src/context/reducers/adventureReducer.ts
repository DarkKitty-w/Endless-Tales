
// src/context/reducers/adventureReducer.ts
import type { GameState } from "@/types/game-types";
import type { StoryLogEntry, SavedAdventure, FirestoreCoopSession } from "@/types/adventure-types";
import type { Action } from "../game-actions";
import { initialAdventureSettings, initialState, initialCharacterState, initialInventory } from "../game-initial-state";
import { generateAdventureId, calculateMaxHealth, calculateMaxActionStamina, calculateMaxMana } from "@/lib/gameUtils";
import { updateGameStateString } from "@/lib/game-state-utils";
import { SAVED_ADVENTURES_KEY } from "@/lib/constants";
import { characterReducer } from "./characterReducer";

export function adventureReducer(state: GameState, action: Action): GameState {
    switch (action.type) {
        case "SET_GAME_STATUS":
            return { ...state, status: action.payload };

        case "CREATE_CHARACTER_AND_SETUP": {
            if (state.adventureSettings.adventureType === "Coop") {
                console.warn("AdventureReducer: CREATE_CHARACTER_AND_SETUP called in Coop mode. This should be handled by session logic.");
                return state; // Character creation is different for co-op
            }
            const newCharacter = characterReducer(null, { type: "CREATE_CHARACTER", payload: action.payload });
            if (!newCharacter) {
                console.error("AdventureReducer: Failed to create character. Character object is null.");
                return state;
            }
            if (!state.adventureSettings.adventureType) {
                 console.error("AdventureReducer: AdventureType is null in CREATE_CHARACTER_AND_SETUP. Cannot proceed to AdventureSetup. Staying on CharacterCreation.");
                 return { ...state, character: newCharacter, status: "CharacterCreation" };
            }
            const adventureId = state.currentAdventureId || generateAdventureId();
            const turnCount = 0;
            const currentInventory = [...initialInventory];
            const initialGameState = updateGameStateString( `Starting adventure for ${newCharacter.name}...`, newCharacter, currentInventory, turnCount );
            console.log("AdventureReducer: CREATE_CHARACTER_AND_SETUP - Transitioning to Gameplay. Adventure Type:", state.adventureSettings.adventureType);
            return {
                ...state, character: newCharacter, status: "Gameplay", currentAdventureId: adventureId,
                inventory: currentInventory, storyLog: [], turnCount: turnCount, currentNarration: null,
                adventureSummary: null, currentGameStateString: initialGameState,
                isGeneratingSkillTree: state.adventureSettings.adventureType !== "Immersed" && !newCharacter.skillTree,
            };
        }

        case "SET_IMMERSED_CHARACTER_AND_START_GAMEPLAY": {
            const { character: immersedCharacter, adventureSettings: immersedSettings } = action.payload;
            if (!immersedCharacter || !immersedSettings || immersedSettings.adventureType !== "Immersed") {
                console.error("AdventureReducer: Invalid payload for SET_IMMERSED_CHARACTER_AND_START_GAMEPLAY");
                return state;
            }
            const adventureId = generateAdventureId();
            const turnCount = 0;
            const currentInventory = [...initialInventory];
            const initialGameState = updateGameStateString( "The adventure for " + immersedCharacter.name + " is about to begin...", immersedCharacter, currentInventory, turnCount );

            const finalMaxHealth = calculateMaxHealth(immersedCharacter.stats);
            const finalMaxActionStamina = calculateMaxActionStamina(immersedCharacter.stats);
            const finalMaxMana = calculateMaxMana(immersedCharacter.stats, immersedCharacter.knowledge);

            const characterWithRecalculatedResources = {
                ...immersedCharacter,
                maxHealth: finalMaxHealth,
                currentHealth: finalMaxHealth,
                maxStamina: finalMaxActionStamina,
                currentStamina: finalMaxActionStamina,
                maxMana: finalMaxMana,
                currentMana: finalMaxMana,
            };

            return {
                ...state, status: "Gameplay", character: characterWithRecalculatedResources, adventureSettings: immersedSettings,
                inventory: currentInventory, storyLog: [], currentNarration: null, adventureSummary: null,
                currentGameStateString: initialGameState, currentAdventureId: adventureId,
                isGeneratingSkillTree: false, turnCount: turnCount,
            };
        }

        case "START_GAMEPLAY": {
            if (state.adventureSettings.adventureType !== "Coop" && !state.character) {
                console.error("AdventureReducer: Cannot start single-player gameplay: Character is null. Resetting to Main Menu.");
                return { ...initialState, savedAdventures: state.savedAdventures, selectedThemeId: state.selectedThemeId, isDarkMode: state.isDarkMode, userGoogleAiApiKey: state.userGoogleAiApiKey };
            }
            if (!state.adventureSettings.adventureType && state.adventureSettings.adventureType !== "Coop") { // Allow Coop to start without adventureType pre-set if session handles it
                console.error("AdventureReducer: Cannot start gameplay: Adventure type is not set. Resetting to Main Menu.");
                 return { ...initialState, savedAdventures: state.savedAdventures, selectedThemeId: state.selectedThemeId, isDarkMode: state.isDarkMode, userGoogleAiApiKey: state.userGoogleAiApiKey };
            }
            const adventureId = state.currentAdventureId || (state.adventureSettings.adventureType === "Coop" ? state.sessionId : generateAdventureId());
            const turnCount = state.turnCount > 0 ? state.turnCount : 0;
            const currentInventory = state.inventory.length > 0 ? state.inventory : [...initialInventory];
            const initialGameState = updateGameStateString( state.storyLog.length > 0 ? state.currentGameStateString : "The adventure is about to begin...", state.character, currentInventory, turnCount );
            
            const newStatus = state.adventureSettings.adventureType === "Coop" ? "CoopGameplay" : "Gameplay";

            return {
                ...state, status: newStatus, inventory: currentInventory, currentGameStateString: initialGameState,
                currentAdventureId: adventureId,
                isGeneratingSkillTree: state.character ? (state.adventureSettings.adventureType !== "Immersed" && !state.character.skillTree && !state.isGeneratingSkillTree) : false,
                turnCount: turnCount,
            };
        }

        case "UPDATE_NARRATION": {
            const newLogEntry: StoryLogEntry = { ...action.payload, timestamp: action.payload.timestamp || Date.now() };
            const newLog = [...state.storyLog, newLogEntry];
            const newTurnCount = state.turnCount + 1;
            const charAfterNarration = state.character;
            const inventoryAfterNarration = state.inventory;

            if (!charAfterNarration) {
                 return { ...state, currentNarration: newLogEntry, storyLog: newLog, turnCount: newTurnCount };
            }
            const updatedGameState = updateGameStateString(action.payload.updatedGameState, charAfterNarration, inventoryAfterNarration, newTurnCount);

            if (action.payload.isCharacterDefeated && charAfterNarration.currentHealth <=0) {
                if (state.adventureSettings.permanentDeath) {
                    console.log("AdventureReducer: Character defeated (Permadeath). Game will end.");
                } else {
                    console.log("AdventureReducer: Character defeated. Respawn should be triggered.");
                }
            }
            return {
                ...state, currentNarration: newLogEntry, storyLog: newLog,
                currentGameStateString: updatedGameState, turnCount: newTurnCount,
            };
        }
        case "RESPAWN_CHARACTER": {
            if (!state.character) return state;
             const respawnMessage = action.payload?.narrationMessage || "You had a narrow escape and have recovered!";
             const respawnLogEntry: StoryLogEntry = {
                 narration: respawnMessage,
                 updatedGameState: updateGameStateString(state.currentGameStateString, state.character, state.inventory, state.turnCount),
                 timestamp: Date.now(),
             };
            return {
                ...state,
                storyLog: [...state.storyLog, respawnLogEntry],
                currentNarration: respawnLogEntry,
            };
        }

        case "UPDATE_CRAFTING_RESULT": {
            const { narration, newGameStateString: providedGameState } = action.payload;
            const newTurnCount = state.turnCount + 1;
            if (!state.character) return { ...state, turnCount: newTurnCount };
             const finalGameStateString = updateGameStateString(providedGameState || state.currentGameStateString, state.character, state.inventory, newTurnCount);
             const craftingLogEntry: StoryLogEntry = { narration: narration, updatedGameState: finalGameStateString, timestamp: Date.now() };
             return {
                 ...state, storyLog: [...state.storyLog, craftingLogEntry], currentNarration: craftingLogEntry,
                 currentGameStateString: finalGameStateString, turnCount: newTurnCount,
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
                 finalTurnCount = state.turnCount + (action.payload.finalNarration ? 1: 0) ;
                 if (finalCharacterState) {
                     finalGameState = updateGameStateString(action.payload.finalNarration.updatedGameState, finalCharacterState, finalInventoryState, finalTurnCount);
                 }
             }

             let updatedSavedAdventures = state.savedAdventures;
             if (finalCharacterState && state.currentAdventureId && state.adventureSettings.adventureType !== "Coop") { // Only save non-Coop games locally this way
                 const endedAdventure: SavedAdventure = {
                     id: state.currentAdventureId, saveTimestamp: Date.now(), characterName: finalCharacterState.name,
                     character: finalCharacterState, adventureSettings: state.adventureSettings, storyLog: finalLog,
                     currentGameStateString: finalGameState, inventory: finalInventoryState, statusBeforeSave: "AdventureSummary",
                     adventureSummary: action.payload.summary, turnCount: finalTurnCount,
                 };
                 updatedSavedAdventures = state.savedAdventures.filter(adv => adv.id !== endedAdventure.id);
                 updatedSavedAdventures.push(endedAdventure);
                 localStorage.setItem(SAVED_ADVENTURES_KEY, JSON.stringify(updatedSavedAdventures));
             }
             return {
                 ...state, status: "AdventureSummary", character: finalCharacterState, adventureSummary: action.payload.summary,
                 storyLog: finalLog, inventory: finalInventoryState, turnCount: finalTurnCount, currentNarration: null,
                 savedAdventures: updatedSavedAdventures, isGeneratingSkillTree: false,
                 sessionId: state.adventureSettings.adventureType === "Coop" ? null : state.sessionId, // Clear session ID if it was a co-op game ending
                 isHost: state.adventureSettings.adventureType === "Coop" ? false : state.isHost,
             };
        }

        case "LOAD_SAVED_ADVENTURES": return { ...state, savedAdventures: action.payload };

        case "SAVE_CURRENT_ADVENTURE": {
            if (!state.character || !state.currentAdventureId || state.status !== "Gameplay" || state.adventureSettings.adventureType === "Coop") {
                return state; // Do not save co-op games this way
            }
            const currentSave: SavedAdventure = {
              id: state.currentAdventureId, saveTimestamp: Date.now(), characterName: state.character.name,
              character: state.character, adventureSettings: state.adventureSettings, storyLog: state.storyLog,
              currentGameStateString: updateGameStateString(state.currentGameStateString, state.character, state.inventory, state.turnCount),
              inventory: state.inventory, statusBeforeSave: state.status, adventureSummary: state.adventureSummary,
              turnCount: state.turnCount,
            };
            const savesWithoutCurrent = state.savedAdventures.filter(adv => adv.id !== currentSave.id);
            const newSaves = [...savesWithoutCurrent, currentSave];
            localStorage.setItem(SAVED_ADVENTURES_KEY, JSON.stringify(newSaves));
            return { ...state, savedAdventures: newSaves };
          }

        case "LOAD_ADVENTURE": {
            const adventureToLoad = state.savedAdventures.find(adv => adv.id === action.payload);
            if (!adventureToLoad || adventureToLoad.adventureSettings.adventureType === "Coop") {
                return state; // Do not load co-op games this way
            }
            const statusToLoad = adventureToLoad.statusBeforeSave || (adventureToLoad.adventureSummary ? "AdventureSummary" : "Gameplay");
             return {
                 ...initialState,
                 savedAdventures: state.savedAdventures, selectedThemeId: state.selectedThemeId,
                 isDarkMode: state.isDarkMode, userGoogleAiApiKey: state.userGoogleAiApiKey,
                 status: statusToLoad, character: adventureToLoad.character,
                 adventureSettings: adventureToLoad.adventureSettings, storyLog: adventureToLoad.storyLog,
                 inventory: adventureToLoad.inventory, turnCount: adventureToLoad.turnCount || 0,
                 currentGameStateString: adventureToLoad.currentGameStateString,
                 currentNarration: adventureToLoad.storyLog.length > 0 ? adventureToLoad.storyLog[adventureToLoad.storyLog.length - 1] : null,
                 adventureSummary: adventureToLoad.adventureSummary, currentAdventureId: adventureToLoad.id,
                 isGeneratingSkillTree: false,
             };
         }

        case "DELETE_ADVENTURE": {
            const filteredSaves = state.savedAdventures.filter(adv => adv.id !== action.payload);
            localStorage.setItem(SAVED_ADVENTURES_KEY, JSON.stringify(filteredSaves));
            return { ...state, savedAdventures: filteredSaves };
         }

        // --- Multiplayer Actions ---
        case "SET_SESSION_ID":
            return { ...state, sessionId: action.payload, currentAdventureId: action.payload }; // For co-op, sessionID is the adventureID
        case "SET_PLAYERS":
            return { ...state, players: action.payload };
        case "ADD_PLAYER":
            if (state.players.includes(action.payload)) return state;
            return { ...state, players: [...state.players, action.payload] };
        case "REMOVE_PLAYER":
            return { ...state, players: state.players.filter(uid => uid !== action.payload) };
        case "SET_CURRENT_PLAYER_UID":
            return { ...state, currentPlayerUid: action.payload };
        case "SET_IS_HOST":
            return { ...state, isHost: action.payload };
        case "SYNC_COOP_SESSION_STATE": {
            const sessionData = action.payload;
            let updatedState = { ...state };
            if (sessionData.players) updatedState.players = sessionData.players;
            if (sessionData.turnCount !== undefined) updatedState.turnCount = sessionData.turnCount;
            if (sessionData.storyLog) updatedState.storyLog = sessionData.storyLog;
            if (sessionData.currentGameStateString) updatedState.currentGameStateString = sessionData.currentGameStateString;
            if (sessionData.sharedCharacter) updatedState.character = sessionData.sharedCharacter; // Simple sync for now
            if (sessionData.sharedInventory) updatedState.inventory = sessionData.sharedInventory;
            if (sessionData.adventureSettings) {
                updatedState.adventureSettings = {
                    ...state.adventureSettings, // Keep local settings like difficulty if not in session
                    ...sessionData.adventureSettings,
                    adventureType: "Coop", // Ensure type is Coop
                };
            }
            if (sessionData.storyLog && sessionData.storyLog.length > 0) {
                updatedState.currentNarration = sessionData.storyLog[sessionData.storyLog.length - 1];
            }
            return updatedState;
        }

        default:
            return state;
    }
}
