
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

            // If Immersed Original character, go directly to Gameplay
            if (state.adventureSettings.adventureType === "Immersed" && state.adventureSettings.characterOriginType === 'original') {
                const adventureId = state.currentAdventureId || generateAdventureId();
                const turnCount = 0;
                const currentInventory = [...initialInventory];
                const initialGameState = updateGameStateString(
                    `Starting adventure for ${newCharacter.name} in ${state.adventureSettings.universeName || 'the chosen universe'}...`,
                    newCharacter,
                    currentInventory,
                    turnCount
                );
                 console.log("AdventureReducer: Immersed (Original) - proceeding directly to Gameplay. Adventure ID:", adventureId);
                return {
                    ...state,
                    character: newCharacter,
                    status: "Gameplay",
                    currentAdventureId: adventureId,
                    inventory: currentInventory,
                    storyLog: [],
                    turnCount: turnCount,
                    currentNarration: null,
                    adventureSummary: null,
                    currentGameStateString: initialGameState,
                    isGeneratingSkillTree: false, // Immersed usually doesn't use class-based skill trees this way
                };
            }

            // For Randomized and Custom, or if Immersed Existing somehow hits this (shouldn't), proceed to AdventureSetup
            if (!state.adventureSettings.adventureType) {
                console.error("AdventureReducer: AdventureType is null in CREATE_CHARACTER_AND_SETUP. Cannot proceed to AdventureSetup. Staying on CharacterCreation.");
                return { ...state, character: newCharacter, status: "CharacterCreation" };
            }

            console.log("AdventureReducer: Character created. Transitioning to AdventureSetup. Adventure Type:", state.adventureSettings.adventureType);
            return {
                ...state,
                character: newCharacter,
                inventory: [...initialInventory], // Fresh inventory for these paths
                status: "AdventureSetup",
                currentAdventureId: generateAdventureId(),
                storyLog: [],
                currentNarration: null,
                adventureSummary: null,
                turnCount: 0,
                currentGameStateString: "Preparing for adventure setup...",
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
                isGeneratingSkillTree: false,
                turnCount: turnCount,
            };
        }

        case "START_GAMEPLAY": {
            console.log("AdventureReducer: START_GAMEPLAY called.");
            if (!state.character) {
                console.error("AdventureReducer: Cannot start gameplay: Character is null.");
                // Dispatch an error or navigate to a safe state like CharacterCreation if appropriate.
                // For now, returning to CharacterCreation.
                return { ...state, status: "CharacterCreation", character: null, adventureSettings: {...initialAdventureSettings} }; // Reset character and settings
            }
            if (!state.adventureSettings.adventureType) {
                console.error("AdventureReducer: Cannot start gameplay: Adventure type is not set.");
                 return { ...state, status: "MainMenu" }; // Go back to main menu
            }

            // This check is important: if it's an Immersed (Existing) character, this action might be redundant
            // as SET_IMMERSED_CHARACTER_AND_START_GAMEPLAY should have handled it.
            if (state.adventureSettings.adventureType === "Immersed" && state.adventureSettings.characterOriginType === "existing") {
                console.warn("AdventureReducer: START_GAMEPLAY called for Immersed (Existing) character. This path should ideally be handled by SET_IMMERSED_CHARACTER_AND_START_GAMEPLAY. Ensuring status is Gameplay.");
                // Just ensure status is Gameplay, character and settings should already be correct from the other action.
                return { ...state, status: "Gameplay" };
            }

            const adventureId = state.currentAdventureId || generateAdventureId(); 
            const turnCount = 0; 
            const currentInventory = state.inventory.length > 0 ? state.inventory : [...initialInventory];

            const initialGameState = updateGameStateString(
                "The adventure is about to begin...",
                state.character,
                currentInventory,
                turnCount
            );

            console.log("AdventureReducer: Starting gameplay. Adventure ID:", adventureId, "Turn:", turnCount, "Inventory items:", currentInventory.length);
            return {
                ...state,
                status: "Gameplay",
                inventory: currentInventory,
                storyLog: [], 
                currentNarration: null,
                adventureSummary: null,
                currentGameStateString: initialGameState,
                currentAdventureId: adventureId, 
                isGeneratingSkillTree: state.adventureSettings.adventureType !== "Immersed" && !state.character.skillTree,
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
                 ...initialState, // Start with a clean base to avoid merging unexpected old state
                 savedAdventures: state.savedAdventures, // Persist the list of all saved adventures
                 selectedThemeId: state.selectedThemeId, // Persist theme settings
                 isDarkMode: state.isDarkMode,           // Persist theme settings
                 userGoogleAiApiKey: state.userGoogleAiApiKey, // Persist API key

                 // Load the specific adventure's state
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
                 isGeneratingSkillTree: false, // Reset this, will trigger if needed
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

