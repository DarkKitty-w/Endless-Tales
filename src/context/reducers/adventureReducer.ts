
// src/context/reducers/adventureReducer.ts
import type { GameState } from "@/types/game-types";
import type { StoryLogEntry, SavedAdventure } from "@/types/adventure-types";
import type { Action } from "../game-actions";
import { initialAdventureSettings, initialState, initialCharacterState, initialInventory } from "../game-initial-state";
import { generateAdventureId } from "@/lib/gameUtils";
import { updateGameStateString } from "@/lib/game-state-utils";
import { SAVED_ADVENTURES_KEY } from "@/lib/constants";
import { characterReducer } from "./characterReducer";

export function adventureReducer(state: GameState, action: Action): GameState {
    switch (action.type) {
        case "SET_GAME_STATUS":
            console.log("AdventureReducer: Setting game status to", action.payload);
            return { ...state, status: action.payload };

        case "CREATE_CHARACTER_AND_SETUP": {
            console.log("AdventureReducer: CREATE_CHARACTER_AND_SETUP. Payload:", JSON.stringify(action.payload).substring(0, 200));
            const newCharacter = characterReducer(null, { type: "CREATE_CHARACTER", payload: action.payload });

            if (!newCharacter) {
                console.error("AdventureReducer: Failed to create character in CREATE_CHARACTER_AND_SETUP. Character object is null.");
                return state;
            }
            console.log("AdventureReducer: Character successfully created:", newCharacter.name, "Class:", newCharacter.class);

            // For Randomized, Custom, or Immersed (Original Character)
            // This action implies character creation is done, so proceed to gameplay setup.
            const adventureId = state.currentAdventureId || generateAdventureId();
            const turnCount = 0;
            const currentInventory = [...initialInventory];
            const initialGameState = updateGameStateString(
                `Starting adventure for ${newCharacter.name}...`,
                newCharacter,
                currentInventory,
                turnCount
            );
            console.log("AdventureReducer: Character created. Transitioning to Gameplay. Adventure ID:", adventureId, "Adventure Type:", state.adventureSettings.adventureType);
            return {
                ...state,
                character: newCharacter,
                status: "Gameplay", // Directly to gameplay as setup is done or handled by specific type
                currentAdventureId: adventureId,
                inventory: currentInventory,
                storyLog: [],
                turnCount: turnCount,
                currentNarration: null,
                adventureSummary: null,
                currentGameStateString: initialGameState,
                // Skill tree generation will be triggered in Gameplay.tsx useEffect if needed
                isGeneratingSkillTree: state.adventureSettings.adventureType !== "Immersed" && !newCharacter.skillTree,
            };
        }
        
        case "SET_IMMERSED_CHARACTER_AND_START_GAMEPLAY": {
            const { character: immersedCharacter, adventureSettings: immersedSettings } = action.payload;
            if (!immersedCharacter || !immersedSettings || immersedSettings.adventureType !== "Immersed") {
                console.error("AdventureReducer: Invalid payload for SET_IMMERSED_CHARACTER_AND_START_GAMEPLAY");
                return state;
            }
            console.log("AdventureReducer: Setting Immersed (Existing) Character and starting gameplay:", immersedCharacter.name);
            const adventureId = generateAdventureId();
            const turnCount = 0;
            const currentInventory = [...initialInventory]; 

            const initialGameState = updateGameStateString(
                "The adventure for " + immersedCharacter.name + " is about to begin...",
                immersedCharacter,
                currentInventory,
                turnCount
            );
            return {
                ...state,
                status: "Gameplay",
                character: immersedCharacter,
                adventureSettings: immersedSettings,
                inventory: currentInventory,
                storyLog: [],
                currentNarration: null,
                adventureSummary: null,
                currentGameStateString: initialGameState,
                currentAdventureId: adventureId,
                isGeneratingSkillTree: false, // Immersed characters might not use standard skill trees
                turnCount: turnCount,
            };
        }

        case "START_GAMEPLAY": {
            console.log("AdventureReducer: START_GAMEPLAY called.");
            if (!state.character) {
                console.error("AdventureReducer: Cannot start gameplay: Character is null. Resetting to Main Menu.");
                return { ...initialState, savedAdventures: state.savedAdventures, selectedThemeId: state.selectedThemeId, isDarkMode: state.isDarkMode, userGoogleAiApiKey: state.userGoogleAiApiKey };
            }
            if (!state.adventureSettings.adventureType) {
                console.error("AdventureReducer: Cannot start gameplay: Adventure type is not set. Resetting to Main Menu.");
                 return { ...initialState, savedAdventures: state.savedAdventures, selectedThemeId: state.selectedThemeId, isDarkMode: state.isDarkMode, userGoogleAiApiKey: state.userGoogleAiApiKey };
            }

            // This action is more of a "confirmation" or final step after all setups are done.
            // Character and specific adventure settings should already be in place.
            const adventureId = state.currentAdventureId || generateAdventureId(); 
            const turnCount = state.turnCount > 0 ? state.turnCount : 0;  // Preserve turn count if loading a game that used START_GAMEPLAY
            const currentInventory = state.inventory.length > 0 ? state.inventory : [...initialInventory];

            const initialGameState = updateGameStateString(
                state.storyLog.length > 0 ? state.currentGameStateString : "The adventure is about to begin...",
                state.character,
                currentInventory,
                turnCount
            );

            console.log("AdventureReducer: Ensuring gameplay state. Adventure ID:", adventureId, "Turn:", turnCount);
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
            const newLog = [...state.storyLog, newLogEntry];
            const newTurnCount = state.turnCount + 1;

            const charAfterNarration = state.character; // Character state is updated by characterReducer
            const inventoryAfterNarration = state.inventory; // Inventory state is updated by inventoryReducer

            if (!charAfterNarration) {
                 console.error("AdventureReducer: UPDATE_NARRATION: Character state is null.");
                 return {
                     ...state,
                     currentNarration: newLogEntry,
                     storyLog: newLog,
                     turnCount: newTurnCount,
                 };
            }
            const updatedGameState = updateGameStateString(action.payload.updatedGameState, charAfterNarration, inventoryAfterNarration, newTurnCount);
            return {
                ...state,
                currentNarration: newLogEntry,
                storyLog: newLog,
                currentGameStateString: updatedGameState,
                turnCount: newTurnCount,
            };
        }

        case "UPDATE_CRAFTING_RESULT": {
            const { narration, newGameStateString: providedGameState } = action.payload;
            const newTurnCount = state.turnCount + 1;

            if (!state.character) {
                 console.error("AdventureReducer: UPDATE_CRAFTING_RESULT: Character state is null.");
                 return { ...state, turnCount: newTurnCount };
            }
             const finalGameStateString = updateGameStateString(providedGameState || state.currentGameStateString, state.character, state.inventory, newTurnCount);
             const craftingLogEntry: StoryLogEntry = {
                 narration: narration,
                 updatedGameState: finalGameStateString,
                 timestamp: Date.now(),
             };
             return {
                 ...state,
                 storyLog: [...state.storyLog, craftingLogEntry],
                 currentNarration: craftingLogEntry,
                 currentGameStateString: finalGameStateString,
                 turnCount: newTurnCount,
             };
        }

        case "INCREMENT_TURN":
            const incrementedTurn = state.turnCount + 1;
            return { ...state, turnCount: incrementedTurn };

        case "SET_SKILL_TREE_GENERATING":
             return { ...state, isGeneratingSkillTree: action.payload };

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
                 finalTurnCount += 1;
                 finalGameState = updateGameStateString(action.payload.finalNarration.updatedGameState, finalCharacterState, finalInventoryState, finalTurnCount);
             }

             let updatedSavedAdventures = state.savedAdventures;
             if (finalCharacterState && state.currentAdventureId) {
                 const endedAdventure: SavedAdventure = {
                     id: state.currentAdventureId,
                     saveTimestamp: Date.now(),
                     characterName: finalCharacterState.name,
                     character: finalCharacterState,
                     adventureSettings: state.adventureSettings,
                     storyLog: finalLog,
                     currentGameStateString: finalGameState,
                     inventory: finalInventoryState,
                     statusBeforeSave: "AdventureSummary",
                     adventureSummary: action.payload.summary,
                     turnCount: finalTurnCount,
                 };
                 updatedSavedAdventures = state.savedAdventures.filter(adv => adv.id !== endedAdventure.id);
                 updatedSavedAdventures.push(endedAdventure);
                 localStorage.setItem(SAVED_ADVENTURES_KEY, JSON.stringify(updatedSavedAdventures));
                 console.log("AdventureReducer: Adventure ended and saved. ID:", state.currentAdventureId);
             }

             return {
                 ...state,
                 status: "AdventureSummary",
                 character: finalCharacterState,
                 adventureSummary: action.payload.summary,
                 storyLog: finalLog,
                 inventory: finalInventoryState,
                 turnCount: finalTurnCount,
                 currentNarration: null,
                 savedAdventures: updatedSavedAdventures,
                 isGeneratingSkillTree: false,
             };
        }

        case "LOAD_SAVED_ADVENTURES":
            return { ...state, savedAdventures: action.payload };

        case "SAVE_CURRENT_ADVENTURE": {
            if (!state.character || !state.currentAdventureId || state.status !== "Gameplay") {
              console.warn("AdventureReducer: Cannot save - No active character, adventure ID, or not in Gameplay.");
              return state;
            }
            const currentSave: SavedAdventure = {
              id: state.currentAdventureId,
              saveTimestamp: Date.now(),
              characterName: state.character.name,
              character: state.character,
              adventureSettings: state.adventureSettings,
              storyLog: state.storyLog,
              currentGameStateString: updateGameStateString(state.currentGameStateString, state.character, state.inventory, state.turnCount),
              inventory: state.inventory,
              statusBeforeSave: state.status,
              adventureSummary: state.adventureSummary,
              turnCount: state.turnCount,
            };
            const savesWithoutCurrent = state.savedAdventures.filter(adv => adv.id !== currentSave.id);
            const newSaves = [...savesWithoutCurrent, currentSave];
            localStorage.setItem(SAVED_ADVENTURES_KEY, JSON.stringify(newSaves));
            return { ...state, savedAdventures: newSaves };
          }

        case "LOAD_ADVENTURE": {
            const adventureToLoad = state.savedAdventures.find(adv => adv.id === action.payload);
            if (!adventureToLoad) {
                console.error(`AdventureReducer: Adventure with ID ${action.payload} not found.`);
                return state;
            }
            console.log("AdventureReducer: Loading adventure. ID:", action.payload);
            const statusToLoad = adventureToLoad.statusBeforeSave || (adventureToLoad.adventureSummary ? "AdventureSummary" : "Gameplay");
             return {
                 ...initialState, 
                 savedAdventures: state.savedAdventures, 
                 selectedThemeId: state.selectedThemeId, 
                 isDarkMode: state.isDarkMode,           
                 userGoogleAiApiKey: state.userGoogleAiApiKey, 

                 status: statusToLoad,
                 character: adventureToLoad.character,
                 adventureSettings: adventureToLoad.adventureSettings,
                 storyLog: adventureToLoad.storyLog,
                 inventory: adventureToLoad.inventory,
                 turnCount: adventureToLoad.turnCount || 0,
                 currentGameStateString: adventureToLoad.currentGameStateString,
                 currentNarration: adventureToLoad.storyLog.length > 0 ? adventureToLoad.storyLog[adventureToLoad.storyLog.length - 1] : null,
                 adventureSummary: adventureToLoad.adventureSummary,
                 currentAdventureId: adventureToLoad.id,
                 isGeneratingSkillTree: false, 
             };
         }

        case "DELETE_ADVENTURE": {
            const filteredSaves = state.savedAdventures.filter(adv => adv.id !== action.payload);
            localStorage.setItem(SAVED_ADVENTURES_KEY, JSON.stringify(filteredSaves));
            console.log("AdventureReducer: Adventure deleted. ID:", action.payload);
            return { ...state, savedAdventures: filteredSaves };
         }
        default:
            return state;
    }
}
