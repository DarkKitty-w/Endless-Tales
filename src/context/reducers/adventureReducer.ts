// src/context/reducers/adventureReducer.ts
import type { GameState } from "@/types/game-types";
import type { StoryLogEntry, SavedAdventure } from "@/types/adventure-types";
import type { Action } from "../game-actions";
import { initialAdventureSettings, initialState } from "../game-initial-state";
import { calculateMaxStamina, calculateMaxMana, generateAdventureId } from "@/lib/gameUtils";
import { updateGameStateString } from "@/lib/game-state-utils";

export function adventureReducer(state: GameState, action: Action): GameState {
    switch (action.type) {
        case "SET_GAME_STATUS":
            return { ...state, status: action.payload };

        case "START_GAMEPLAY": {
            // This action primarily sets up the initial game state string and adventure ID.
            // Character and inventory initialization are handled by their respective reducers.
            if (!state.character || !state.adventureSettings.adventureType) {
                console.error("Cannot start gameplay: Missing character or adventure type.");
                return state;
            }
            const adventureId = state.currentAdventureId || generateAdventureId();
            const turnCount = state.currentAdventureId ? state.turnCount : 0; // Use loaded turn count if resuming
            const initialGameState = state.currentAdventureId
                ? state.currentGameStateString // Use existing if resuming
                : updateGameStateString("", state.character, state.inventory, turnCount); // Generate new if starting

            return {
                ...state,
                status: "Gameplay",
                storyLog: state.currentAdventureId ? state.storyLog : [],
                currentNarration: state.currentAdventureId ? state.currentNarration : null,
                adventureSummary: null,
                currentGameStateString: initialGameState,
                currentAdventureId: adventureId,
                isGeneratingSkillTree: state.currentAdventureId ? state.isGeneratingSkillTree : false,
                turnCount: turnCount,
            };
        }

        case "UPDATE_NARRATION": {
            const newLogEntry: StoryLogEntry = { ...action.payload, timestamp: action.payload.timestamp || Date.now() };
            const newLog = [...state.storyLog, newLogEntry];
            const newTurnCount = state.turnCount + 1; // Increment turn count here

            // The character and inventory states used here should already be updated by their respective reducers
            const charAfterNarration = state.character; // Assume characterReducer already updated
            const inventoryAfterNarration = state.inventory; // Assume inventoryReducer already updated

            if (!charAfterNarration) {
                 console.error("UPDATE_NARRATION: Character state is null, cannot update game state string.");
                 return { // Return minimally updated state
                     ...state,
                     currentNarration: newLogEntry,
                     storyLog: newLog,
                     turnCount: newTurnCount,
                 };
            }

            return {
                ...state,
                currentNarration: newLogEntry,
                storyLog: newLog,
                currentGameStateString: updateGameStateString(action.payload.updatedGameState, charAfterNarration, inventoryAfterNarration, newTurnCount),
                turnCount: newTurnCount,
            };
        }

        case "UPDATE_CRAFTING_RESULT": {
            // This action primarily updates the narration and game state string after crafting.
            // Inventory changes are handled by the inventoryReducer.
             const { narration, newGameStateString: providedGameState } = action.payload;
            const newTurnCount = state.turnCount + 1;

            if (!state.character) {
                 console.error("UPDATE_CRAFTING_RESULT: Character state is null.");
                 return { ...state, turnCount: newTurnCount };
            }

             const finalGameStateString = updateGameStateString(providedGameState || state.currentGameStateString, state.character, state.inventory, newTurnCount); // Use latest inventory/char state

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

        case "INCREMENT_TURN": // Could potentially be removed if UPDATE_NARRATION always handles turn increment
            return { ...state, turnCount: state.turnCount + 1 };

        case "SET_SKILL_TREE_GENERATING":
             return { ...state, isGeneratingSkillTree: action.payload };

        case "END_ADVENTURE": {
             let finalLog = [...state.storyLog];
             let finalGameState = state.currentGameStateString;
             let finalCharacterState = state.character;
             let finalInventoryState = state.inventory;
             let finalTurnCount = state.turnCount;

             if (action.payload.finalNarration && (!state.currentNarration || action.payload.finalNarration.narration !== state.currentNarration.narration)) {
                // Logic to apply final narration updates to character state (should ideally be done in characterReducer if possible)
                // This might involve temporary state or passing the final narration details to characterReducer
                // For now, we assume characterReducer handles updates based on narration actions implicitly before END_ADVENTURE is dispatched.
                 const finalEntry: StoryLogEntry = { ...action.payload.finalNarration, timestamp: action.payload.finalNarration.timestamp || Date.now() };
                 finalLog.push(finalEntry);
                 finalGameState = action.payload.finalNarration.updatedGameState;
                 finalTurnCount += 1;
                 // Re-fetch potentially updated character/inventory state
                 finalCharacterState = state.character; // Assuming characterReducer handled updates
                 finalInventoryState = state.inventory; // Assuming inventoryReducer handled updates
                 finalGameState = updateGameStateString(finalGameState, finalCharacterState, finalInventoryState, finalTurnCount);
                 console.log("Applied final narration updates before ending.");
             }

             let updatedSavedAdventures = state.savedAdventures;
             if (finalCharacterState && state.currentAdventureId) {
                 const endedAdventure: SavedAdventure = {
                     id: state.currentAdventureId,
                     saveTimestamp: Date.now(),
                     characterName: finalCharacterState.name,
                     character: finalCharacterState, // Save the potentially updated character
                     adventureSettings: state.adventureSettings,
                     storyLog: finalLog,
                     currentGameStateString: finalGameState, // Save the final game state string
                     inventory: finalInventoryState, // Save the potentially updated inventory
                     statusBeforeSave: "AdventureSummary",
                     adventureSummary: action.payload.summary,
                     turnCount: finalTurnCount,
                 };
                 updatedSavedAdventures = state.savedAdventures.filter(adv => adv.id !== endedAdventure.id);
                 updatedSavedAdventures.push(endedAdventure);
                 // Persistence logic moved outside reducer (e.g., in context or middleware)
                 console.log("Adventure ended, state prepared for saving.");
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
                 savedAdventures: updatedSavedAdventures, // Keep the updated save list in state
                 isGeneratingSkillTree: false,
             };
        }
        case "LOAD_ADVENTURE": {
            const adventureToLoad = state.savedAdventures.find(adv => adv.id === action.payload);
            if (!adventureToLoad) {
                console.error(`Adventure with ID ${action.payload} not found.`);
                return state;
            }

             // Validate loaded data (some validation might be in specific reducers too)
             const validatedStoryLog = Array.isArray(adventureToLoad.storyLog) ? adventureToLoad.storyLog : [];
             const validatedTurnCount = typeof adventureToLoad.turnCount === 'number' ? adventureToLoad.turnCount : 0;
             const validatedCharacter = adventureToLoad.character; // Assume characterReducer handles validation
             const validatedInventory = adventureToLoad.inventory; // Assume inventoryReducer handles validation
             const validatedGameStateString = adventureToLoad.currentGameStateString || updateGameStateString("", validatedCharacter, validatedInventory, validatedTurnCount);

             const loadedStatus = adventureToLoad.statusBeforeSave === "AdventureSummary" ? "AdventureSummary" : "Gameplay";

             return {
                 ...state, // Keep existing saves, theme, etc.
                 status: loadedStatus,
                 character: validatedCharacter, // Set by characterReducer
                 adventureSettings: adventureToLoad.adventureSettings, // Set by settingsReducer
                 storyLog: validatedStoryLog,
                 inventory: validatedInventory, // Set by inventoryReducer
                 turnCount: validatedTurnCount,
                 currentGameStateString: validatedGameStateString,
                 currentNarration: validatedStoryLog.length > 0 ? validatedStoryLog[validatedStoryLog.length - 1] : null,
                 adventureSummary: adventureToLoad.adventureSummary,
                 currentAdventureId: adventureToLoad.id,
                 isGeneratingSkillTree: false, // Reset on load
             };
         }
        default:
            return state;
    }
}
