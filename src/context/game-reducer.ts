// src/context/game-reducer.ts

import type { GameState } from "@/types/game-types";
import type {
    Character, SkillTreeStage, SkillTree, CharacterStats, Reputation, NpcRelationships, Skill
} from "@/types/character-types";
import type { InventoryItem, ItemQuality } from "@/types/inventory-types";
import type { StoryLogEntry, SavedAdventure, AdventureSettings, DifficultyLevel } from "@/types/adventure-types";
import type { Action } from "./game-actions";
import { initialCharacterState, initialAdventureSettings, initialInventory, initialState, initialStats } from "./game-initial-state";
import { calculateMaxStamina, calculateMaxMana, calculateXpToNextLevel, generateAdventureId, getStarterSkillsForClass } from "@/lib/gameUtils";
import { VALID_DIFFICULTY_LEVELS } from "@/lib/constants";

/** LocalStorage key for saving adventures. */
const SAVED_ADVENTURES_KEY = "endlessTalesSavedAdventures";
// Keys for theme persistence (moved here for consistency)
const THEME_ID_KEY = "colorTheme";
const THEME_MODE_KEY = "themeMode";

// --- Helper Function for Game State String Update ---
// (Moved to a separate file potentially, keeping here for now)
import { updateGameStateString } from './game-state-utils';

/**
 * The main reducer function for managing the game state.
 * @param state - The current game state.
 * @param action - The action to be processed.
 * @returns The new game state.
 */
export function gameReducer(state: GameState, action: Action): GameState {
  console.log(`Reducer Action: ${action.type}`, action.payload ? JSON.stringify(action.payload).substring(0, 200) : '');
  switch (action.type) {
    case "SET_GAME_STATUS":
      return { ...state, status: action.payload };
    case "CREATE_CHARACTER": {
       // Use initialStats if no stats provided, otherwise merge
       const baseStats: CharacterStats = action.payload.stats
           ? { ...initialStats, ...action.payload.stats }
           : { ...initialStats };
       const baseKnowledge = action.payload.knowledge ?? [];
       const maxStamina = calculateMaxStamina(baseStats);
       const maxMana = calculateMaxMana(baseStats, baseKnowledge);
       const characterClass = action.payload.class ?? initialCharacterState.class;
       const starterSkills = getStarterSkillsForClass(characterClass);
       const initialLevel = 1;
       const initialXpToNext = calculateXpToNextLevel(initialLevel);

      const newCharacter: Character = {
        ...initialCharacterState,
        name: action.payload.name ?? "",
        description: action.payload.description ?? "",
        class: characterClass,
        traits: action.payload.traits ?? [],
        knowledge: baseKnowledge,
        background: action.payload.background ?? "",
        stats: baseStats, // Use the calculated baseStats
        aiGeneratedDescription: action.payload.aiGeneratedDescription ?? undefined,
        maxStamina: maxStamina,
        currentStamina: maxStamina,
        maxMana: maxMana,
        currentMana: maxMana,
        level: initialLevel,
        xp: 0,
        xpToNextLevel: initialXpToNext,
        reputation: {},
        npcRelationships: {},
        skillTree: null,
        skillTreeStage: 0,
        learnedSkills: starterSkills,
      };
      return {
        ...state,
        character: newCharacter,
        status: "AdventureSetup",
        adventureSettings: { ...initialAdventureSettings }, // Reset settings for new character
        currentAdventureId: null, // No adventure loaded yet
        storyLog: [],
        currentNarration: null,
        adventureSummary: null,
        inventory: [], // Start with empty inventory
        isGeneratingSkillTree: false,
        turnCount: 0,
      };
    }
     case "UPDATE_CHARACTER": {
         if (!state.character) return state;
         const updatedStats = action.payload.stats ? { ...state.character.stats, ...action.payload.stats } : state.character.stats;
         const updatedKnowledge = action.payload.knowledge ?? state.character.knowledge;
         const maxStamina = calculateMaxStamina(updatedStats);
         const maxMana = calculateMaxMana(updatedStats, updatedKnowledge);

         const updatedCharacter: Character = {
             ...state.character,
             ...action.payload,
             stats: updatedStats,
             knowledge: updatedKnowledge,
             maxStamina: maxStamina,
             currentStamina: Math.min(state.character.currentStamina, maxStamina), // Clamp current stamina
             maxMana: maxMana,
             currentMana: Math.min(state.character.currentMana, maxMana), // Clamp current mana
             traits: action.payload.traits ?? state.character.traits,
             skillTree: action.payload.skillTree !== undefined ? action.payload.skillTree : state.character.skillTree,
             skillTreeStage: action.payload.skillTreeStage !== undefined ? action.payload.skillTreeStage : state.character.skillTreeStage,
             aiGeneratedDescription: action.payload.aiGeneratedDescription !== undefined ? action.payload.aiGeneratedDescription : state.character.aiGeneratedDescription,
             learnedSkills: action.payload.learnedSkills ?? state.character.learnedSkills,
             level: action.payload.level ?? state.character.level,
             xp: action.payload.xp ?? state.character.xp,
             xpToNextLevel: action.payload.xpToNextLevel ?? state.character.xpToNextLevel,
             reputation: action.payload.reputation ?? state.character.reputation,
             npcRelationships: action.payload.npcRelationships ?? state.character.npcRelationships,
         };
         // Recalculate game state string after character update
          const newGameStateString = updateGameStateString(
             state.currentGameStateString,
             updatedCharacter,
             state.inventory,
             state.turnCount
         );
         return { ...state, character: updatedCharacter, currentGameStateString: newGameStateString };
        }
    case "SET_AI_DESCRIPTION":
        if (!state.character) return state;
        return { ...state, character: { ...state.character, aiGeneratedDescription: action.payload } };
    case "SET_ADVENTURE_SETTINGS": {
        // Validate difficulty before setting
         const difficulty = VALID_DIFFICULTY_LEVELS.includes(action.payload.difficulty as DifficultyLevel)
            ? action.payload.difficulty as DifficultyLevel
            : state.adventureSettings.difficulty; // Keep old if invalid

        return {
          ...state,
          adventureSettings: {
            ...state.adventureSettings,
            ...action.payload,
             difficulty, // Use the validated difficulty
          },
        };
    }
    case "START_GAMEPLAY": {
      if (!state.character || !state.adventureSettings.adventureType) {
        console.error("Cannot start gameplay: Missing character or adventure type.");
        return state;
      }
      const charDesc = state.character.description || "No description provided.";
      const startingItems = state.currentAdventureId ? state.inventory : initialInventory; // Use current if resuming, else initial
      const currentStage = state.character.skillTreeStage;
      const stageName = currentStage >= 0 && state.character.skillTree && state.character.skillTree.stages.length > currentStage
          ? state.character.skillTree.stages[currentStage].stageName
          : `Stage ${currentStage}`;
      const skillTreeSummary = state.character.skillTree
          ? `Class: ${state.character.skillTree.className} (${stageName} - Stage ${currentStage}/4)`
          : "No skill tree assigned yet.";
      const aiDescString = state.character.aiGeneratedDescription ? `\nAI Profile: ${state.character.aiGeneratedDescription}` : "";
      const progressionSummary = `Level: ${state.character.level} (${state.character.xp}/${state.character.xpToNextLevel} XP)`;
      const repSummary = Object.entries(state.character.reputation).map(([f, s]) => `${f}: ${s}`).join(', ') || 'None';
      const npcRelSummary = Object.entries(state.character.npcRelationships).map(([npc, score]) => `${npc}: ${score}`).join(', ') || 'None';
      const inventoryString = startingItems.length > 0 ? startingItems.map(item => `${item.name}${item.quality ? ` (${item.quality})` : ''}`).join(', ') : 'Empty';
      const turnCount = state.currentAdventureId ? state.turnCount : 0; // Use current turn if resuming

      let adventureDetails = `Adventure Mode: ${state.adventureSettings.adventureType}, Difficulty: ${state.adventureSettings.difficulty}, ${state.adventureSettings.permanentDeath ? 'Permadeath' : 'Respawn'}`;
      if (state.adventureSettings.adventureType === "Custom") {
          adventureDetails += `\nWorld: ${state.adventureSettings.worldType || '?'}\nQuest: ${state.adventureSettings.mainQuestline || '?'}`;
      }

      // Construct initial game state string, using turn count from loaded state if applicable
      const initialGameState = state.currentAdventureId ? state.currentGameStateString : `Turn: ${turnCount}\nLocation: Starting Point\nInventory: ${inventoryString}\nStatus: Healthy (STA: ${state.character.maxStamina}/${state.character.maxStamina}, MANA: ${state.character.maxMana}/${state.character.maxMana})\nTime: Day 1, Morning\nQuest: None\nMilestones: None\nCharacter Name: ${state.character.name}\n${progressionSummary}\nReputation: ${repSummary}\nNPC Relationships: ${npcRelSummary}\nClass: ${state.character.class}\nTraits: ${state.character.traits.join(', ') || 'None'}\nKnowledge: ${state.character.knowledge.join(', ') || 'None'}\nBackground: ${state.character.background || 'None'}\nStats: STR ${state.character.stats.strength}, STA ${state.character.stats.stamina}, AGI ${state.character.stats.agility}\nDescription: ${charDesc}${aiDescString}\n${adventureDetails}\n${skillTreeSummary}\nLearned Skills: ${state.character.learnedSkills.map(s => s.name).join(', ') || 'None'}`;

      const adventureId = state.currentAdventureId || generateAdventureId(); // Reuse ID if resuming

      return {
        ...state,
        status: "Gameplay",
        storyLog: state.currentAdventureId ? state.storyLog : [], // Keep log if resuming
        currentNarration: state.currentAdventureId ? state.currentNarration : null, // Keep current narration if resuming
        adventureSummary: null,
        inventory: startingItems,
        currentGameStateString: initialGameState, // Use loaded or new initial state
        currentAdventureId: adventureId,
        isGeneratingSkillTree: state.currentAdventureId ? state.isGeneratingSkillTree : false, // Keep skill gen state if resuming
        turnCount: turnCount, // Use loaded or new turn count
        character: { // Ensure resources are correct for new/resumed game
            ...state.character,
             currentStamina: state.currentAdventureId ? state.character.currentStamina : state.character.maxStamina,
             currentMana: state.currentAdventureId ? state.character.currentMana : state.character.maxMana,
        }
      };
    }
    case "INCREMENT_TURN":
        return { ...state, turnCount: state.turnCount + 1 };
    case "GRANT_XP": {
        if (!state.character) return state;
        const newXp = state.character.xp + action.payload;
        const xpNeeded = state.character.xpToNextLevel;
        console.log(`Granted ${action.payload} XP. Current XP: ${newXp}/${xpNeeded}`);
         const updatedChar = {
             ...state.character,
             xp: newXp,
         };
         const newGameStateString = updateGameStateString(state.currentGameStateString, updatedChar, state.inventory, state.turnCount);
        return {
            ...state,
             character: updatedChar,
             currentGameStateString: newGameStateString
        };
       }
   case "LEVEL_UP": {
       if (!state.character) return state;
       if (action.payload.newLevel <= state.character.level) {
           console.warn(`Attempted to level up to ${action.payload.newLevel}, but current level is ${state.character.level}. Ignoring.`);
           return state;
       }
       console.log(`Level Up! ${state.character.level} -> ${action.payload.newLevel}. Next level at ${action.payload.newXpToNextLevel} XP.`);
        const remainingXp = Math.max(0, state.character.xp - state.character.xpToNextLevel);
         const updatedChar = {
             ...state.character,
             level: action.payload.newLevel,
             xp: remainingXp,
             xpToNextLevel: action.payload.newXpToNextLevel,
              currentStamina: state.character.maxStamina, // Restore resources on level up
              currentMana: state.character.maxMana,
         };
         const newGameStateString = updateGameStateString(state.currentGameStateString, updatedChar, state.inventory, state.turnCount);
       return {
           ...state,
           character: updatedChar,
            currentGameStateString: newGameStateString
       };
   }
    case "UPDATE_REPUTATION": {
        if (!state.character) return state;
        const { faction, change } = action.payload;
        const currentScore = state.character.reputation[faction] ?? 0;
        const newScore = Math.max(-100, Math.min(100, currentScore + change)); // Clamp score
        console.log(`Reputation update for ${faction}: ${currentScore} -> ${newScore}`);
         const updatedChar = {
             ...state.character,
             reputation: {
                 ...state.character.reputation,
                 [faction]: newScore,
             },
         };
         const newGameStateString = updateGameStateString(state.currentGameStateString, updatedChar, state.inventory, state.turnCount);
        return {
            ...state,
             character: updatedChar,
             currentGameStateString: newGameStateString
        };
       }
    case "UPDATE_NPC_RELATIONSHIP": {
        if (!state.character) return state;
        const { npcName, change } = action.payload;
        const currentScore = state.character.npcRelationships[npcName] ?? 0;
        const newScore = Math.max(-100, Math.min(100, currentScore + change)); // Clamp score
        console.log(`Relationship update with ${npcName}: ${currentScore} -> ${newScore}`);
         const updatedChar = {
             ...state.character,
             npcRelationships: {
                 ...state.character.npcRelationships,
                 [npcName]: newScore,
             },
         };
         const newGameStateString = updateGameStateString(state.currentGameStateString, updatedChar, state.inventory, state.turnCount);
        return {
            ...state,
             character: updatedChar,
             currentGameStateString: newGameStateString
        };
    }
    case "UPDATE_NARRATION": {
        const newLogEntry: StoryLogEntry = { ...action.payload, timestamp: action.payload.timestamp || Date.now() };
        const newLog = [...state.storyLog, newLogEntry];
        let charAfterNarration = state.character;
        let inventoryAfterNarration = state.inventory; // Start with current inventory

        if (state.character) {
            const updatedStats = action.payload.updatedStats ? { ...state.character.stats, ...action.payload.updatedStats } : state.character.stats;
            const updatedKnowledge = action.payload.updatedKnowledge ?? state.character.knowledge;
            const maxStamina = calculateMaxStamina(updatedStats);
            const maxMana = calculateMaxMana(updatedStats, updatedKnowledge);
            const staminaChange = action.payload.staminaChange ?? 0;
            const manaChange = action.payload.manaChange ?? 0;
            const newCurrentStamina = Math.max(0, Math.min(maxStamina, state.character.currentStamina + staminaChange));
            const newCurrentMana = Math.max(0, Math.min(maxMana, state.character.currentMana + manaChange));
            let newLearnedSkills = state.character.learnedSkills;
            if (action.payload.gainedSkill && !state.character.learnedSkills.some(s => s.name === action.payload.gainedSkill!.name)) {
                newLearnedSkills = [...state.character.learnedSkills, { ...action.payload.gainedSkill, type: 'Learned' }];
                console.log(`Learned new skill: ${action.payload.gainedSkill.name}`);
            }
            const xpGained = action.payload.xpGained ?? 0;
            const currentXp = state.character.xp + xpGained;
             let updatedReputation = state.character.reputation;
             if (action.payload.reputationChange) {
                 const { faction, change } = action.payload.reputationChange;
                 const currentScore = updatedReputation[faction] ?? 0;
                 const newScore = Math.max(-100, Math.min(100, currentScore + change));
                 updatedReputation = { ...updatedReputation, [faction]: newScore };
                 console.log(`Reputation changed for ${faction}: ${currentScore} -> ${newScore}`);
             }
             let updatedNpcRelationships = state.character.npcRelationships;
             if (action.payload.npcRelationshipChange) {
                const { npcName, change } = action.payload.npcRelationshipChange;
                const currentScore = updatedNpcRelationships[npcName] ?? 0;
                const newScore = Math.max(-100, Math.min(100, currentScore + change));
                updatedNpcRelationships = { ...updatedNpcRelationships, [npcName]: newScore };
                console.log(`Relationship changed with ${npcName}: ${currentScore} -> ${newScore}`);
             }

            charAfterNarration = {
                ...state.character,
                stats: updatedStats,
                knowledge: updatedKnowledge,
                maxStamina: maxStamina,
                currentStamina: newCurrentStamina,
                maxMana: maxMana,
                currentMana: newCurrentMana,
                traits: action.payload.updatedTraits ?? state.character.traits,
                learnedSkills: newLearnedSkills,
                xp: currentXp,
                reputation: updatedReputation,
                npcRelationships: updatedNpcRelationships,
                skillTreeStage: action.payload.progressedToStage ?? state.character.skillTreeStage, // Update stage if provided
            };
            console.log("Character updated via narration:", { stats: action.payload.updatedStats, traits: action.payload.updatedTraits, knowledge: action.payload.updatedKnowledge, staminaChange, manaChange, gainedSkill: action.payload.gainedSkill?.name, xpGained, reputationChange: action.payload.reputationChange, npcRelationshipChange: action.payload.npcRelationshipChange, progressedStage: action.payload.progressedToStage });
        }

        // Inventory update logic (relying on updateGameStateString now)
        // This assumes the AI output's gameState string is the source of truth for inventory.
        // If more complex inventory management is needed (e.g., tracking counts),
        // the AI output might need an explicit `updatedInventory` list or similar.

         // Increment turn count here, after processing all narration effects
         const newTurnCount = state.turnCount + 1;

        return {
            ...state,
            character: charAfterNarration,
            currentNarration: newLogEntry,
            storyLog: newLog,
            inventory: inventoryAfterNarration, // Keep inventory state as is for now, rely on updateGameStateString parsing
            currentGameStateString: updateGameStateString(action.payload.updatedGameState, charAfterNarration, inventoryAfterNarration, newTurnCount), // Update game state string with latest info
            turnCount: newTurnCount,
        };
    }
    case "END_ADVENTURE": {
        let finalLog = [...state.storyLog];
        let finalGameState = state.currentGameStateString;
        let finalCharacterState = state.character;
        let finalInventoryState = state.inventory;
        let finalTurnCount = state.turnCount;

        // Apply final narration updates if provided and different from current
        if (action.payload.finalNarration && (!state.currentNarration || action.payload.finalNarration.narration !== state.currentNarration.narration)) {
            const finalEntry: StoryLogEntry = { ...action.payload.finalNarration, timestamp: action.payload.finalNarration.timestamp || Date.now() };
            finalLog.push(finalEntry);
            finalGameState = action.payload.finalNarration.updatedGameState;
            finalTurnCount += 1; // Increment turn for the final narration event

            // Apply character updates from the final narration
            if (state.character) {
                 const finalStats = finalEntry.updatedStats ? { ...state.character.stats, ...finalEntry.updatedStats } : state.character.stats;
                 const finalKnowledge = finalEntry.updatedKnowledge ?? state.character.knowledge;
                 const finalMaxStamina = calculateMaxStamina(finalStats);
                 const finalMaxMana = calculateMaxMana(finalStats, finalKnowledge);
                 const finalStaminaChange = finalEntry.staminaChange ?? 0;
                 const finalManaChange = finalEntry.manaChange ?? 0;
                 const finalCurrentStamina = Math.max(0, Math.min(finalMaxStamina, state.character.currentStamina + finalStaminaChange));
                 const finalCurrentMana = Math.max(0, Math.min(finalMaxMana, state.character.currentMana + finalManaChange));
                 let finalLearnedSkills = state.character.learnedSkills;
                 if (finalEntry.gainedSkill && !state.character.learnedSkills.some(s => s.name === finalEntry.gainedSkill!.name)) {
                      finalLearnedSkills = [...state.character.learnedSkills, { ...finalEntry.gainedSkill, type: 'Learned' }];
                 }
                 const finalXpGained = finalEntry.xpGained ?? 0;
                 const finalXp = state.character.xp + finalXpGained;
                  let finalReputation = state.character.reputation;
                 if (finalEntry.reputationChange) {
                     const { faction, change } = finalEntry.reputationChange;
                     const currentScore = finalReputation[faction] ?? 0;
                     const newScore = Math.max(-100, Math.min(100, currentScore + change));
                     finalReputation = { ...finalReputation, [faction]: newScore };
                 }
                 let finalNpcRelationships = state.character.npcRelationships;
                  if (finalEntry.npcRelationshipChange) {
                     const { npcName, change } = finalEntry.npcRelationshipChange;
                     const currentScore = finalNpcRelationships[npcName] ?? 0;
                     const newScore = Math.max(-100, Math.min(100, currentScore + change));
                     finalNpcRelationships = { ...finalNpcRelationships, [npcName]: newScore };
                  }

                finalCharacterState = {
                    ...state.character,
                    stats: finalStats,
                    knowledge: finalKnowledge,
                    maxStamina: finalMaxStamina,
                    currentStamina: finalCurrentStamina,
                    maxMana: finalMaxMana,
                    currentMana: finalCurrentMana,
                    traits: finalEntry.updatedTraits ?? state.character.traits,
                    skillTreeStage: finalEntry.progressedToStage ?? state.character.skillTreeStage,
                    learnedSkills: finalLearnedSkills,
                    xp: finalXp,
                    reputation: finalReputation,
                    npcRelationships: finalNpcRelationships,
                };
            }
            console.log("Applied final narration updates.");
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
                currentGameStateString: updateGameStateString(finalGameState, finalCharacterState, finalInventoryState, finalTurnCount), // Ensure final state string is updated
                inventory: finalInventoryState, // Save the final inventory
                statusBeforeSave: "AdventureSummary", // Mark as ended
                adventureSummary: action.payload.summary,
                turnCount: finalTurnCount, // Save the final turn count
            };
            // Remove any previous save with the same ID and add the new one
            updatedSavedAdventures = state.savedAdventures.filter(adv => adv.id !== endedAdventure.id);
            updatedSavedAdventures.push(endedAdventure);
            localStorage.setItem(SAVED_ADVENTURES_KEY, JSON.stringify(updatedSavedAdventures));
            console.log("Adventure ended and automatically saved.");
        }

        return {
            ...state,
            status: "AdventureSummary",
            character: finalCharacterState, // Keep final character state for summary screen
            adventureSummary: action.payload.summary,
            storyLog: finalLog, // Keep final story log for summary screen
            inventory: finalInventoryState, // Keep final inventory for summary screen
            turnCount: finalTurnCount,
            currentNarration: null, // Clear current narration
            savedAdventures: updatedSavedAdventures,
            isGeneratingSkillTree: false, // Reset flag
            // Keep currentAdventureId until reset
        };
    }
    case "RESET_GAME": {
       const saved = state.savedAdventures; // Keep saved adventures
       return { ...initialState, savedAdventures: saved, status: "MainMenu" };
      }
    case "LOAD_SAVED_ADVENTURES":
        // Directly update the savedAdventures part of the state
        return { ...state, savedAdventures: action.payload };
    case "SAVE_CURRENT_ADVENTURE": {
      if (!state.character || !state.currentAdventureId || state.status !== "Gameplay") {
        console.warn("Cannot save: No active character, adventure ID, or not in Gameplay.");
        return state;
      }
      const currentSave: SavedAdventure = {
        id: state.currentAdventureId,
        saveTimestamp: Date.now(),
        characterName: state.character.name,
        character: state.character,
        adventureSettings: state.adventureSettings,
        storyLog: state.storyLog,
        currentGameStateString: updateGameStateString(state.currentGameStateString, state.character, state.inventory, state.turnCount), // Update game state string on save
        inventory: state.inventory,
        statusBeforeSave: state.status, // Save current status (likely Gameplay)
        adventureSummary: state.adventureSummary, // Usually null during gameplay
        turnCount: state.turnCount,
      };
      // Replace existing save with the same ID or add new
      const savesWithoutCurrent = state.savedAdventures.filter(adv => adv.id !== currentSave.id);
      const newSaves = [...savesWithoutCurrent, currentSave];
      localStorage.setItem(SAVED_ADVENTURES_KEY, JSON.stringify(newSaves));
      return { ...state, savedAdventures: newSaves };
    }
    case "LOAD_ADVENTURE": {
      const adventureToLoad = state.savedAdventures.find(adv => adv.id === action.payload);
      if (!adventureToLoad) {
        console.error(`Adventure with ID ${action.payload} not found.`);
        return state;
      }

        // --- Character Validation ---
        const savedChar = adventureToLoad.character;
        const validatedStats = savedChar?.stats ? { ...initialStats, ...savedChar.stats } : { ...initialStats };
        const validatedKnowledge = Array.isArray(savedChar?.knowledge) ? savedChar.knowledge : [];

        const validatedCharacter: Character = {
           ...initialCharacterState, // Start with defaults
           ...(savedChar || {}), // Spread saved character data
           name: savedChar?.name || "Recovered Adventurer",
           description: savedChar?.description || "",
           class: savedChar?.class || "Adventurer",
           traits: Array.isArray(savedChar?.traits) ? savedChar.traits : [],
           knowledge: validatedKnowledge,
           background: savedChar?.background || "",
           stats: validatedStats,
           maxStamina: typeof savedChar?.maxStamina === 'number' ? savedChar.maxStamina : calculateMaxStamina(validatedStats),
           currentStamina: typeof savedChar?.currentStamina === 'number' ? savedChar.currentStamina : (savedChar?.maxStamina ?? calculateMaxStamina(validatedStats)),
           maxMana: typeof savedChar?.maxMana === 'number' ? savedChar.maxMana : calculateMaxMana(validatedStats, validatedKnowledge),
           currentMana: typeof savedChar?.currentMana === 'number' ? savedChar.currentMana : (savedChar?.maxMana ?? calculateMaxMana(validatedStats, validatedKnowledge)),
           level: typeof savedChar?.level === 'number' ? savedChar.level : 1,
           xp: typeof savedChar?.xp === 'number' ? savedChar.xp : 0,
           xpToNextLevel: typeof savedChar?.xpToNextLevel === 'number' ? savedChar.xpToNextLevel : calculateXpToNextLevel(savedChar?.level ?? 1),
           reputation: typeof savedChar?.reputation === 'object' && savedChar.reputation !== null ? savedChar.reputation : {},
           npcRelationships: typeof savedChar?.npcRelationships === 'object' && savedChar.npcRelationships !== null ? savedChar.npcRelationships : {},
           skillTree: savedChar?.skillTree ? { // Validate skill tree
               className: savedChar.skillTree.className || savedChar.class || "Adventurer",
               stages: (Array.isArray(savedChar.skillTree.stages) ? savedChar.skillTree.stages : []).map((stage, index) => ({
                    stage: typeof stage.stage === 'number' ? stage.stage : index,
                    stageName: stage.stageName || (index === 0 ? "Potential" : `Stage ${stage.stage ?? index}`), // Correct index check
                     skills: (Array.isArray(stage.skills) ? stage.skills : []).map(skill => ({
                        name: skill.name || "Unknown Skill",
                        description: skill.description || "",
                        type: skill.type || 'Learned',
                        manaCost: typeof skill.manaCost === 'number' ? skill.manaCost : undefined,
                        staminaCost: typeof skill.staminaCost === 'number' ? skill.staminaCost : undefined,
                    })),
               })).slice(0, 5) // Ensure exactly 5 stages
           } : null,
           skillTreeStage: typeof savedChar?.skillTreeStage === 'number' ? savedChar.skillTreeStage : 0,
           learnedSkills: (Array.isArray(savedChar?.learnedSkills) && savedChar.learnedSkills.length > 0) // Validate learned skills
                ? savedChar.learnedSkills.map(skill => ({
                     name: skill.name || "Unknown Skill",
                     description: skill.description || "",
                     type: skill.type || 'Learned',
                     manaCost: typeof skill.manaCost === 'number' ? skill.manaCost : undefined,
                     staminaCost: typeof skill.staminaCost === 'number' ? skill.staminaCost : undefined,
                  }))
                : getStarterSkillsForClass(savedChar?.class || "Adventurer"), // Fallback to starters
           aiGeneratedDescription: savedChar?.aiGeneratedDescription ?? undefined,
       };

        // --- Inventory Validation ---
       const validatedInventory = (Array.isArray(adventureToLoad.inventory) ? adventureToLoad.inventory : []).map(item => ({
           name: item.name || "Unknown Item",
           description: item.description || "An item of unclear origin.",
           weight: typeof item.weight === 'number' ? item.weight : 1,
           quality: item.quality || "Common" as ItemQuality,
           durability: typeof item.durability === 'number' ? item.durability : undefined,
           magicalEffect: item.magicalEffect || undefined,
       }));

       // --- Settings Validation ---
       const validatedDifficulty = VALID_DIFFICULTY_LEVELS.includes(adventureToLoad.adventureSettings?.difficulty as DifficultyLevel)
            ? adventureToLoad.adventureSettings.difficulty as DifficultyLevel
            : initialAdventureSettings.difficulty;

       const validatedSettings = {
           ...initialAdventureSettings,
           ...(adventureToLoad.adventureSettings || {}),
           difficulty: validatedDifficulty,
       };

      // Determine loaded state status
      const loadedStatus = adventureToLoad.statusBeforeSave === "AdventureSummary" ? "AdventureSummary" : "Gameplay";

      return {
          ...initialState, // Start from a clean slate but keep saved adventures
          savedAdventures: state.savedAdventures,
          status: loadedStatus,
          character: validatedCharacter,
          adventureSettings: validatedSettings,
          storyLog: Array.isArray(adventureToLoad.storyLog) ? adventureToLoad.storyLog : [],
          inventory: validatedInventory,
          turnCount: typeof adventureToLoad.turnCount === 'number' ? adventureToLoad.turnCount : 0,
          currentGameStateString: adventureToLoad.currentGameStateString || updateGameStateString(initialState.currentGameStateString, validatedCharacter, validatedInventory, typeof adventureToLoad.turnCount === 'number' ? adventureToLoad.turnCount : 0), // Recalculate if missing
          currentNarration: adventureToLoad.storyLog && adventureToLoad.storyLog.length > 0 ? adventureToLoad.storyLog[adventureToLoad.storyLog.length - 1] : null,
          adventureSummary: adventureToLoad.adventureSummary, // Load summary if ended
          currentAdventureId: adventureToLoad.id,
          isGeneratingSkillTree: false, // Reset flag on load
          selectedThemeId: state.selectedThemeId, // Keep current theme settings
          isDarkMode: state.isDarkMode,
      };
    }
    case "DELETE_ADVENTURE": {
        const filteredSaves = state.savedAdventures.filter(adv => adv.id !== action.payload);
        localStorage.setItem(SAVED_ADVENTURES_KEY, JSON.stringify(filteredSaves));
        return { ...state, savedAdventures: filteredSaves };
      }
    case "SET_SKILL_TREE_GENERATING":
        return { ...state, isGeneratingSkillTree: action.payload };
    case "SET_SKILL_TREE": {
        if (!state.character) return { ...state, isGeneratingSkillTree: false }; // Safety check
        if (state.character.class !== action.payload.class) {
            console.warn(`Skill tree class "${action.payload.class}" does not match character class "${state.character.class}". Ignoring.`);
            return { ...state, isGeneratingSkillTree: false };
        }
         const stages = action.payload.skillTree.stages || [];
         if (stages.length !== 5) {
             console.error(`Reducer: Received skill tree with ${stages.length} stages, expected 5. Discarding.`);
             return { ...state, isGeneratingSkillTree: false };
         }
         // Deep validation of stages and skills
         const validatedStages: SkillTreeStage[] = Array.from({ length: 5 }, (_, i) => {
            const foundStage = stages.find(s => s.stage === i);
            return {
                stage: i,
                stageName: foundStage?.stageName || (i === 0 ? "Potential" : `Stage ${i}`),
                 skills: (Array.isArray(foundStage?.skills) ? foundStage.skills : []).map(skill => ({
                     name: skill.name || "Unnamed Skill",
                     description: skill.description || "No description.",
                     type: skill.type || 'Learned',
                     manaCost: typeof skill.manaCost === 'number' ? skill.manaCost : undefined,
                     staminaCost: typeof skill.staminaCost === 'number' ? skill.staminaCost : undefined,
                 })),
            };
         });
         const validatedSkillTree: SkillTree = {
            className: action.payload.class,
            stages: validatedStages
         };
          const updatedChar = {
             ...state.character,
             skillTree: validatedSkillTree,
          };
          const newGameStateString = updateGameStateString(state.currentGameStateString, updatedChar, state.inventory, state.turnCount);
        return {
            ...state,
             character: updatedChar,
             isGeneratingSkillTree: false,
             currentGameStateString: newGameStateString
        };
      }
     case "CHANGE_CLASS_AND_RESET_SKILLS": {
         if (!state.character) return { ...state, isGeneratingSkillTree: false };
         console.log(`Changing class from ${state.character.class} to ${action.payload.newClass} and resetting skills/stage.`);
         const stages = action.payload.newSkillTree.stages || [];
          if (stages.length !== 5) {
             console.error(`Reducer: Received new skill tree with ${stages.length} stages, expected 5. Aborting class change.`);
             return { ...state, isGeneratingSkillTree: false };
         }
         // Deep validation (similar to SET_SKILL_TREE)
         const validatedStages: SkillTreeStage[] = Array.from({ length: 5 }, (_, i) => {
             const foundStage = stages.find(s => s.stage === i);
             return {
                 stage: i,
                 stageName: foundStage?.stageName || (i === 0 ? "Potential" : `Stage ${i}`),
                 skills: (Array.isArray(foundStage?.skills) ? foundStage.skills : []).map(skill => ({
                     name: skill.name || "Unnamed Skill",
                     description: skill.description || "No description.",
                     type: skill.type || 'Learned',
                     manaCost: typeof skill.manaCost === 'number' ? skill.manaCost : undefined,
                     staminaCost: typeof skill.staminaCost === 'number' ? skill.staminaCost : undefined,
                 })),
             };
         });
         const newValidatedSkillTree: SkillTree = {
             className: action.payload.newClass,
             stages: validatedStages
         };
         const starterSkills = getStarterSkillsForClass(action.payload.newClass);
          const updatedChar = {
             ...state.character,
             class: action.payload.newClass,
             skillTree: newValidatedSkillTree,
             skillTreeStage: 0, // Reset stage
             learnedSkills: starterSkills, // Reset to new class's starter skills
          };
           const newGameStateString = updateGameStateString(state.currentGameStateString, updatedChar, state.inventory, state.turnCount);
         return {
             ...state,
              character: updatedChar,
              isGeneratingSkillTree: false,
              currentGameStateString: newGameStateString
         };
        }
     case "PROGRESS_SKILL_STAGE": {
         if (!state.character || !state.character.skillTree) return state;
         const newStage = Math.max(0, Math.min(4, action.payload)); // Clamp stage between 0 and 4
         if (newStage > state.character.skillTreeStage) {
              const newStageName = state.character.skillTree.stages[newStage]?.stageName || `Stage ${newStage}`;
             console.log(`Progressing skill stage from ${state.character.skillTreeStage} to ${newStage} (${newStageName}).`);
              const updatedChar = {
                 ...state.character,
                 skillTreeStage: newStage,
              };
               const newGameStateString = updateGameStateString(state.currentGameStateString, updatedChar, state.inventory, state.turnCount);
             return {
                 ...state,
                 character: updatedChar,
                 currentGameStateString: newGameStateString
             };
         } else {
             console.log(`Attempted to progress skill stage to ${newStage}, but current stage is ${state.character.skillTreeStage}. No change.`);
             return state;
         }
        }
    case "ADD_ITEM": {
        // Validate item structure before adding
        const newItem: InventoryItem = {
            name: action.payload.name || "Mysterious Item",
            description: action.payload.description || "An item of unclear origin.",
            quality: action.payload.quality || "Common",
            weight: typeof action.payload.weight === 'number' ? action.payload.weight : 1,
            durability: typeof action.payload.durability === 'number' ? action.payload.durability : undefined,
            magicalEffect: action.payload.magicalEffect || undefined,
        };
         const newInventory = [...state.inventory, newItem];
         const newGameStateString = updateGameStateString(state.currentGameStateString, state.character, newInventory, state.turnCount);
        console.log("Adding validated item:", newItem.name);
        return {
             ...state,
              inventory: newInventory,
             currentGameStateString: newGameStateString
        };
      }
    case "REMOVE_ITEM": {
        const { itemName, quantity = 1 } = action.payload;
        console.log(`Attempting to remove ${quantity} of item:`, itemName);
        const updatedInventory = [...state.inventory];
        let removedCount = 0;
        // Iterate backwards to safely remove items while iterating
        for (let i = updatedInventory.length - 1; i >= 0 && removedCount < quantity; i--) {
            if (updatedInventory[i].name === itemName) {
                updatedInventory.splice(i, 1);
                removedCount++;
            }
        }
        if (removedCount < quantity) {
            console.warn(`Tried to remove ${quantity} of ${itemName}, but only found ${removedCount}.`);
        }
         const newGameStateString = updateGameStateString(state.currentGameStateString, state.character, updatedInventory, state.turnCount);
        return {
             ...state,
              inventory: updatedInventory,
             currentGameStateString: newGameStateString
        };
      }
    case "UPDATE_ITEM": {
        const { itemName, updates } = action.payload;
         const updatedInventory = state.inventory.map(item =>
             item.name === itemName ? { ...item, ...updates } : item
         );
         const newGameStateString = updateGameStateString(state.currentGameStateString, state.character, updatedInventory, state.turnCount);
        console.log("Updating item:", itemName, "with", updates);
        return {
            ...state,
             inventory: updatedInventory,
             currentGameStateString: newGameStateString
        };
     }
    case "UPDATE_INVENTORY": {
        // Validate the incoming inventory list
        const validatedNewInventory = action.payload.map(item => ({
            name: item.name || "Unknown Item",
            description: item.description || "An item of unclear origin.",
            weight: typeof item.weight === 'number' ? item.weight : 1,
            quality: item.quality || "Common" as ItemQuality,
            durability: typeof item.durability === 'number' ? item.durability : undefined,
            magicalEffect: item.magicalEffect || undefined,
        }));
         const newGameStateString = updateGameStateString(state.currentGameStateString, state.character, validatedNewInventory, state.turnCount);
        console.log("Replacing inventory with new list:", validatedNewInventory.map(i => i.name));
        return {
             ...state,
              inventory: validatedNewInventory,
             currentGameStateString: newGameStateString
         };
      }
    case "UPDATE_CRAFTING_RESULT": {
        if (!state.character) return state;
        const { narration, consumedItems, craftedItem } = action.payload;
        let updatedInventory = [...state.inventory];

        // Consume items
         consumedItems.forEach(itemName => {
             const indexToRemove = updatedInventory.findIndex(item => item.name === itemName);
             if (indexToRemove > -1) {
                 updatedInventory.splice(indexToRemove, 1);
             } else {
                 console.warn(`Attempted to consume non-existent item: ${itemName}`);
             }
         });

        // Add crafted item if successful
        if (craftedItem) {
            updatedInventory.push(craftedItem);
        }

         // Update game state string based on the new inventory and narration
         const newGameStateString = updateGameStateString(state.currentGameStateString, state.character, updatedInventory, state.turnCount + 1); // Increment turn for crafting action

         // Create a log entry for the crafting action
         const craftingLogEntry: StoryLogEntry = {
             narration: narration,
             updatedGameState: newGameStateString,
             timestamp: Date.now(),
             // No direct stat/XP changes from crafting itself, usually
         };

        return {
            ...state,
            inventory: updatedInventory,
            storyLog: [...state.storyLog, craftingLogEntry],
            currentNarration: craftingLogEntry,
            currentGameStateString: newGameStateString,
             turnCount: state.turnCount + 1, // Increment turn count
        };
    }
    // Handle theme changes
    case "SET_THEME_ID":
        console.log("Reducer: Setting theme ID to", action.payload);
        return { ...state, selectedThemeId: action.payload };
    case "SET_DARK_MODE":
        console.log("Reducer: Setting dark mode to", action.payload);
        return { ...state, isDarkMode: action.payload };

    default:
      // Ensure exhaustiveness check if using TypeScript >= 4.9
      // const _exhaustiveCheck: never = action;
      return state;
  }
}
