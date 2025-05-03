// src/context/game-reducer.ts

import type { GameState, StoryLogEntry, Character, SkillTreeStage, ItemQuality, SavedAdventure } from "@/types/game-types";
import type { Action } from "./game-actions";
import { initialCharacterState, initialAdventureSettings, initialInventory, initialState } from "./game-initial-state";
import { calculateMaxStamina, calculateMaxMana, calculateXpToNextLevel, generateAdventureId, getStarterSkillsForClass } from "@/lib/gameUtils";

/** LocalStorage key for saving adventures. */
const SAVED_ADVENTURES_KEY = "endlessTalesSavedAdventures";

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
       const baseStats = action.payload.stats ? { ...initialCharacterState.stats, ...action.payload.stats } : initialCharacterState.stats;
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
        stats: baseStats,
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
        adventureSettings: { ...initialAdventureSettings },
        currentAdventureId: null,
        storyLog: [],
        currentNarration: null,
        adventureSummary: null,
        inventory: [],
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
             currentStamina: Math.min(state.character.currentStamina, maxStamina),
             maxMana: maxMana,
             currentMana: Math.min(state.character.currentMana, maxMana),
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
         return { ...state, character: updatedCharacter };
        }
    case "SET_AI_DESCRIPTION":
        if (!state.character) return state;
        return { ...state, character: { ...state.character, aiGeneratedDescription: action.payload } };
    case "SET_ADVENTURE_SETTINGS":
      return { ...state, adventureSettings: { ...state.adventureSettings, ...action.payload } };
    case "START_GAMEPLAY": {
      if (!state.character || !state.adventureSettings.adventureType) {
        console.error("Cannot start gameplay: Missing character or adventure type.");
        return state;
      }
      const charDesc = state.character.description || "No description provided.";
      const startingItems = state.currentAdventureId ? state.inventory : initialInventory;
      const currentStage = state.character.skillTreeStage;
      const stageName = currentStage >= 0 && state.character.skillTree && state.character.skillTree.stages[currentStage]
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
      const turnCount = state.currentAdventureId ? state.turnCount : 0;


      let adventureDetails = `Adventure Mode: ${state.adventureSettings.adventureType}, Difficulty: ${state.adventureSettings.difficulty}, ${state.adventureSettings.permanentDeath ? 'Permadeath' : 'Respawn'}`;
      if (state.adventureSettings.adventureType === "Custom") {
          adventureDetails += `\nWorld: ${state.adventureSettings.worldType || '?'}\nQuest: ${state.adventureSettings.mainQuestline || '?'}`;
      }

       const initialGameState = `Turn: ${turnCount}\nLocation: Starting Point\nInventory: ${inventoryString}\nStatus: Healthy (STA: ${state.character.currentStamina}/${state.character.maxStamina}, MANA: ${state.character.currentMana}/${state.character.maxMana})\nTime: Day 1, Morning\nQuest: None\nMilestones: None\nCharacter Name: ${state.character.name}\n${progressionSummary}\nReputation: ${repSummary}\nNPC Relationships: ${npcRelSummary}\nClass: ${state.character.class}\nTraits: ${state.character.traits.join(', ') || 'None'}\nKnowledge: ${state.character.knowledge.join(', ') || 'None'}\nBackground: ${state.character.background || 'None'}\nStats: STR ${state.character.stats.strength}, STA ${state.character.stats.stamina}, AGI ${state.character.stats.agility}\nDescription: ${charDesc}${aiDescString}\n${adventureDetails}\n${skillTreeSummary}\nLearned Skills: ${state.character.learnedSkills.map(s => s.name).join(', ') || 'None'}`;

      const adventureId = state.currentAdventureId || generateAdventureId();

      return {
        ...state,
        status: "Gameplay",
        storyLog: state.currentAdventureId ? state.storyLog : [],
        currentNarration: state.currentAdventureId ? state.currentNarration : null,
        adventureSummary: null,
        inventory: startingItems,
        currentGameStateString: state.currentAdventureId ? state.currentGameStateString : initialGameState,
        currentAdventureId: adventureId,
        isGeneratingSkillTree: state.currentAdventureId ? state.isGeneratingSkillTree : false,
        turnCount: turnCount,
        character: {
            ...state.character,
             currentStamina: state.currentAdventureId ? state.character.currentStamina : state.character.maxStamina,
             currentMana: state.currentAdventureId ? state.character.currentMana : state.character.maxMana,
        }
      };
    }
    case "UPDATE_NARRATION": {
        const newLogEntry: StoryLogEntry = { ...action.payload, timestamp: action.payload.timestamp || Date.now() };
        const newLog = [...state.storyLog, newLogEntry];
        let charAfterNarration = state.character;
        let inventoryAfterNarration = state.inventory;

        if (state.character) {
            const updatedStats = newLogEntry.updatedStats ? { ...state.character.stats, ...newLogEntry.updatedStats } : state.character.stats;
            const updatedKnowledge = newLogEntry.updatedKnowledge ?? state.character.knowledge;
            const maxStamina = calculateMaxStamina(updatedStats);
            const maxMana = calculateMaxMana(updatedStats, updatedKnowledge);
            const staminaChange = newLogEntry.staminaChange ?? 0;
            const manaChange = newLogEntry.manaChange ?? 0;
            const newCurrentStamina = Math.max(0, Math.min(maxStamina, state.character.currentStamina + staminaChange));
            const newCurrentMana = Math.max(0, Math.min(maxMana, state.character.currentMana + manaChange));
            let newLearnedSkills = state.character.learnedSkills;
            if (newLogEntry.gainedSkill && !state.character.learnedSkills.some(s => s.name === newLogEntry.gainedSkill!.name)) {
                newLearnedSkills = [...state.character.learnedSkills, { ...newLogEntry.gainedSkill, type: 'Learned' }];
                console.log(`Learned new skill: ${newLogEntry.gainedSkill.name}`);
            }
            const xpGained = newLogEntry.xpGained ?? 0;
            const currentXp = state.character.xp + xpGained;
             let updatedReputation = state.character.reputation;
             if (newLogEntry.reputationChange) {
                 const { faction, change } = newLogEntry.reputationChange;
                 const currentScore = updatedReputation[faction] ?? 0;
                 const newScore = Math.max(-100, Math.min(100, currentScore + change));
                 updatedReputation = { ...updatedReputation, [faction]: newScore };
                 console.log(`Reputation changed for ${faction}: ${currentScore} -> ${newScore}`);
             }
             let updatedNpcRelationships = state.character.npcRelationships;
             if (newLogEntry.npcRelationshipChange) {
                const { npcName, change } = newLogEntry.npcRelationshipChange;
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
                traits: newLogEntry.updatedTraits ?? state.character.traits,
                learnedSkills: newLearnedSkills,
                xp: currentXp,
                reputation: updatedReputation,
                npcRelationships: updatedNpcRelationships,
            };
            console.log("Character updated via narration:", { stats: newLogEntry.updatedStats, traits: newLogEntry.updatedTraits, knowledge: newLogEntry.updatedKnowledge, staminaChange, manaChange, gainedSkill: newLogEntry.gainedSkill?.name, xpGained, reputationChange: newLogEntry.reputationChange, npcRelationshipChange: newLogEntry.npcRelationshipChange });
        }
        console.log("Narration updated. Inventory state relies on subsequent actions or gameState parsing.");
        return {
            ...state,
            character: charAfterNarration,
            currentNarration: newLogEntry,
            storyLog: newLog,
            inventory: inventoryAfterNarration,
            currentGameStateString: action.payload.updatedGameState,
            turnCount: state.turnCount + 1,
        };
    }
     case "INCREMENT_TURN":
        return { ...state, turnCount: state.turnCount + 1 };
     case "GRANT_XP": {
         if (!state.character) return state;
         const newXp = state.character.xp + action.payload;
         const xpNeeded = state.character.xpToNextLevel;
         console.log(`Granted ${action.payload} XP. Current XP: ${newXp}/${xpNeeded}`);
         return {
             ...state,
             character: {
                 ...state.character,
                 xp: newXp,
             },
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
        return {
            ...state,
            character: {
                ...state.character,
                level: action.payload.newLevel,
                xp: remainingXp,
                xpToNextLevel: action.payload.newXpToNextLevel,
                 currentStamina: state.character.maxStamina,
                 currentMana: state.character.maxMana,
            },
        };
    }
     case "UPDATE_REPUTATION": {
         if (!state.character) return state;
         const { faction, change } = action.payload;
         const currentScore = state.character.reputation[faction] ?? 0;
         const newScore = Math.max(-100, Math.min(100, currentScore + change));
         console.log(`Manual reputation update for ${faction}: ${currentScore} -> ${newScore}`);
         return {
             ...state,
             character: {
                 ...state.character,
                 reputation: {
                     ...state.character.reputation,
                     [faction]: newScore,
                 },
             },
         };
        }
     case "UPDATE_NPC_RELATIONSHIP": {
         if (!state.character) return state;
         const { npcName, change } = action.payload;
         const currentScore = state.character.npcRelationships[npcName] ?? 0;
         const newScore = Math.max(-100, Math.min(100, currentScore + change));
         console.log(`Manual relationship update with ${npcName}: ${currentScore} -> ${newScore}`);
         return {
             ...state,
             character: {
                 ...state.character,
                 npcRelationships: {
                     ...state.character.npcRelationships,
                     [npcName]: newScore,
                 },
             },
         };
     }
    case "END_ADVENTURE": {
        let finalLog = [...state.storyLog];
        let finalGameState = state.currentGameStateString;
        let finalCharacterState = state.character;
        let finalInventoryState = state.inventory;
        let finalTurnCount = state.turnCount;

        if (action.payload.finalNarration && (!state.currentNarration || action.payload.finalNarration.narration !== state.currentNarration.narration)) {
            const finalEntry: StoryLogEntry = { ...action.payload.finalNarration, timestamp: action.payload.finalNarration.timestamp || Date.now() };
            finalLog.push(finalEntry);
            finalGameState = action.payload.finalNarration.updatedGameState;
            finalTurnCount += 1;

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
                    aiGeneratedDescription: state.character.aiGeneratedDescription,
                    learnedSkills: finalLearnedSkills,
                    xp: finalXp,
                    reputation: finalReputation,
                    npcRelationships: finalNpcRelationships,
                };
            }
            console.log("Added final narration entry to log and applied final character updates.");
        } else {
            console.log("Final narration not added or same as current.");
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
            console.log("Adventure ended and automatically saved.");
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
    case "RESET_GAME": {
       const saved = state.savedAdventures;
       return { ...initialState, savedAdventures: saved, status: "MainMenu" };
      }
    case "LOAD_SAVED_ADVENTURES":
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
        currentGameStateString: state.currentGameStateString,
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
        console.error(`Adventure with ID ${action.payload} not found.`);
        return state;
      }
       const validatedCharacter: Character = {
           ...initialCharacterState,
           ...(adventureToLoad.character || {}),
           name: adventureToLoad.character?.name || "Recovered Adventurer",
           description: adventureToLoad.character?.description || "",
           class: adventureToLoad.character?.class || "Adventurer",
           traits: Array.isArray(adventureToLoad.character?.traits) ? adventureToLoad.character.traits : [],
           knowledge: Array.isArray(adventureToLoad.character?.knowledge) ? adventureToLoad.character.knowledge : [],
           background: adventureToLoad.character?.background || "",
           stats: adventureToLoad.character?.stats ? { ...initialCharacterState.stats, ...adventureToLoad.character.stats } : initialCharacterState.stats,
           maxStamina: typeof adventureToLoad.character?.maxStamina === 'number' ? adventureToLoad.character.maxStamina : calculateMaxStamina(adventureToLoad.character?.stats ?? initialCharacterState.stats),
           currentStamina: typeof adventureToLoad.character?.currentStamina === 'number' ? adventureToLoad.character.currentStamina : (adventureToLoad.character?.maxStamina ?? calculateMaxStamina(adventureToLoad.character?.stats ?? initialCharacterState.stats)),
           maxMana: typeof adventureToLoad.character?.maxMana === 'number' ? adventureToLoad.character.maxMana : calculateMaxMana(adventureToLoad.character?.stats ?? initialCharacterState.stats, adventureToLoad.character?.knowledge ?? []),
           currentMana: typeof adventureToLoad.character?.currentMana === 'number' ? adventureToLoad.character.currentMana : (adventureToLoad.character?.maxMana ?? calculateMaxMana(adventureToLoad.character?.stats ?? initialCharacterState.stats, adventureToLoad.character?.knowledge ?? [])),
           level: typeof adventureToLoad.character?.level === 'number' ? adventureToLoad.character.level : 1,
           xp: typeof adventureToLoad.character?.xp === 'number' ? adventureToLoad.character.xp : 0,
           xpToNextLevel: typeof adventureToLoad.character?.xpToNextLevel === 'number' ? adventureToLoad.character.xpToNextLevel : calculateXpToNextLevel(adventureToLoad.character?.level ?? 1),
           reputation: typeof adventureToLoad.character?.reputation === 'object' && adventureToLoad.character.reputation !== null ? adventureToLoad.character.reputation : {},
           npcRelationships: typeof adventureToLoad.character?.npcRelationships === 'object' && adventureToLoad.character.npcRelationships !== null ? adventureToLoad.character.npcRelationships : {},
           skillTree: adventureToLoad.character?.skillTree ? {
               ...adventureToLoad.character.skillTree,
                className: adventureToLoad.character.skillTree.className || adventureToLoad.character.class || "Adventurer",
               stages: (Array.isArray(adventureToLoad.character.skillTree.stages) ? adventureToLoad.character.skillTree.stages : []).map((stage, index) => ({
                    stage: typeof stage.stage === 'number' ? stage.stage : index,
                    stageName: stage.stageName || `Stage ${stage.stage ?? index}`,
                     skills: (Array.isArray(stage.skills) ? stage.skills : []).map(skill => ({
                        name: skill.name || "Unknown Skill",
                        description: skill.description || "",
                        type: skill.type || 'Learned',
                        manaCost: typeof skill.manaCost === 'number' ? skill.manaCost : undefined,
                        staminaCost: typeof skill.staminaCost === 'number' ? skill.staminaCost : undefined,
                    })),
               })).slice(0, 5)
           } : null,
           skillTreeStage: typeof adventureToLoad.character?.skillTreeStage === 'number' ? adventureToLoad.character.skillTreeStage : 0,
           learnedSkills: (Array.isArray(adventureToLoad.character?.learnedSkills) && adventureToLoad.character.learnedSkills.length > 0)
                ? adventureToLoad.character.learnedSkills.map(skill => ({
                     name: skill.name || "Unknown Skill",
                     description: skill.description || "",
                     type: skill.type || 'Learned',
                     manaCost: typeof skill.manaCost === 'number' ? skill.manaCost : undefined,
                     staminaCost: typeof skill.staminaCost === 'number' ? skill.staminaCost : undefined,
                  }))
                : getStarterSkillsForClass(adventureToLoad.character?.class || "Adventurer"),
           aiGeneratedDescription: adventureToLoad.character?.aiGeneratedDescription ?? undefined,
       };
      const validatedInventory = (Array.isArray(adventureToLoad.inventory) ? adventureToLoad.inventory : []).map(item => ({
           name: item.name || "Unknown Item",
           description: item.description || "An item of unclear origin.",
           weight: typeof item.weight === 'number' ? item.weight : 1,
           quality: item.quality || "Common" as ItemQuality,
           durability: typeof item.durability === 'number' ? item.durability : undefined,
           magicalEffect: item.magicalEffect || undefined,
       }));
        const loadedTurnCount = typeof adventureToLoad.turnCount === 'number' ? adventureToLoad.turnCount : 0;

      if (adventureToLoad.statusBeforeSave === "AdventureSummary") {
          return {
              ...initialState,
              savedAdventures: state.savedAdventures,
              status: "AdventureSummary",
              character: validatedCharacter,
              adventureSummary: adventureToLoad.adventureSummary,
              storyLog: adventureToLoad.storyLog,
              inventory: validatedInventory,
              turnCount: loadedTurnCount,
              currentAdventureId: adventureToLoad.id,
              adventureSettings: adventureToLoad.adventureSettings,
              isGeneratingSkillTree: false,
          };
      } else {
          return {
              ...initialState,
              savedAdventures: state.savedAdventures,
              status: "Gameplay",
              character: validatedCharacter,
              adventureSettings: adventureToLoad.adventureSettings,
              storyLog: adventureToLoad.storyLog,
              inventory: validatedInventory,
              turnCount: loadedTurnCount,
              currentGameStateString: adventureToLoad.currentGameStateString,
              currentNarration: adventureToLoad.storyLog.length > 0 ? adventureToLoad.storyLog[adventureToLoad.storyLog.length - 1] : null,
              adventureSummary: null,
              currentAdventureId: adventureToLoad.id,
              isGeneratingSkillTree: false,
          };
      }
    }
    case "DELETE_ADVENTURE": {
        const filteredSaves = state.savedAdventures.filter(adv => adv.id !== action.payload);
        localStorage.setItem(SAVED_ADVENTURES_KEY, JSON.stringify(filteredSaves));
        return { ...state, savedAdventures: filteredSaves };
      }
    case "SET_SKILL_TREE_GENERATING":
        return { ...state, isGeneratingSkillTree: action.payload };
    case "SET_SKILL_TREE": {
        if (!state.character) return state;
        if (state.character.class !== action.payload.class) {
            console.warn(`Skill tree class "${action.payload.class}" does not match character class "${state.character.class}". Ignoring.`);
            return { ...state, isGeneratingSkillTree: false };
        }
         const stages = action.payload.skillTree.stages || [];
         if (stages.length !== 5) {
             console.error(`Reducer: Received skill tree with ${stages.length} stages, expected 5. Discarding.`);
             return { ...state, isGeneratingSkillTree: false };
         }
         const validatedStages: SkillTreeStage[] = Array.from({ length: 5 }, (_, i) => {
            const foundStage = stages.find(s => s.stage === i);
            if (!foundStage) {
                console.warn(`Reducer: Skill tree missing stage data for stage ${i}. Using defaults.`);
            }
            return {
                stage: i,
                stageName: foundStage?.stageName || (i === 0 ? "Potential" : `Stage ${i}`),
                skills: foundStage?.skills || []
            };
         });
         const validatedSkillTree = {
            ...action.payload.skillTree,
            className: action.payload.class,
            stages: validatedStages
         };
        return {
            ...state,
            character: {
                ...state.character,
                skillTree: validatedSkillTree,
            },
            isGeneratingSkillTree: false,
        };
      }
     case "CHANGE_CLASS_AND_RESET_SKILLS": {
         if (!state.character) return state;
         console.log(`Changing class from ${state.character.class} to ${action.payload.newClass} and resetting skills/stage.`);
         const stages = action.payload.newSkillTree.stages || [];
          if (stages.length !== 5) {
             console.error(`Reducer: Received skill tree for new class with ${stages.length} stages, expected 5. Aborting class change.`);
             return { ...state, isGeneratingSkillTree: false };
         }
         const validatedStages: SkillTreeStage[] = Array.from({ length: 5 }, (_, i) => {
            const foundStage = stages.find(s => s.stage === i);
             if (!foundStage) {
                console.warn(`Reducer: New skill tree missing stage data for stage ${i}. Using defaults.`);
            }
            return {
                stage: i,
                stageName: foundStage?.stageName || (i === 0 ? "Potential" : `Stage ${i}`),
                skills: foundStage?.skills || []
            };
         });
         const newValidatedSkillTree = {
            ...action.payload.newSkillTree,
            className: action.payload.newClass,
            stages: validatedStages
         };
         const starterSkills = getStarterSkillsForClass(action.payload.newClass);
         return {
             ...state,
             character: {
                 ...state.character,
                 class: action.payload.newClass,
                 skillTree: newValidatedSkillTree,
                 skillTreeStage: 0,
                 learnedSkills: starterSkills,
             },
             isGeneratingSkillTree: false,
         };
        }
     case "PROGRESS_SKILL_STAGE": {
         if (!state.character || !state.character.skillTree) return state;
         const newStage = Math.max(0, Math.min(4, action.payload));
         if (newStage > state.character.skillTreeStage) {
              const newStageName = state.character.skillTree.stages[newStage]?.stageName || `Stage ${newStage}`;
             console.log(`Progressing skill stage from ${state.character.skillTreeStage} to ${newStage} (${newStageName}).`);
             return {
                 ...state,
                 character: {
                     ...state.character,
                     skillTreeStage: newStage,
                 },
             };
         } else {
             console.log(`Attempted to progress skill stage to ${newStage}, but current stage is ${state.character.skillTreeStage}. No change.`);
             return state;
         }
        }
    case "ADD_ITEM": {
        const newItem = {
            description: "An item acquired during your journey.",
            quality: "Common" as ItemQuality,
            weight: 1,
            ...action.payload,
        };
        console.log("Adding item:", newItem.name);
        return { ...state, inventory: [...state.inventory, newItem] };
      }
    case "REMOVE_ITEM": {
        const { itemName, quantity = 1 } = action.payload;
        console.log(`Removing ${quantity} of item:`, itemName);
        const updatedInventory = [...state.inventory];
        let removedCount = 0;
        for (let i = updatedInventory.length - 1; i >= 0 && removedCount < quantity; i--) {
            if (updatedInventory[i].name === itemName) {
                updatedInventory.splice(i, 1);
                removedCount++;
            }
        }
        if (removedCount < quantity) {
            console.warn(`Tried to remove ${quantity} of ${itemName}, but only found ${removedCount}.`);
        }
        return { ...state, inventory: updatedInventory };
      }
    case "UPDATE_ITEM": {
        const { itemName, updates } = action.payload;
        console.log("Updating item:", itemName, "with", updates);
        return {
            ...state,
            inventory: state.inventory.map(item =>
                item.name === itemName ? { ...item, ...updates } : item
            ),
        };
     }
    case "UPDATE_INVENTORY": {
        console.log("Replacing inventory with new list:", action.payload.map(i => i.name));
        const validatedNewInventory = action.payload.map(item => ({
            name: item.name || "Unknown Item",
            description: item.description || "An item of unclear origin.",
            weight: typeof item.weight === 'number' ? item.weight : 1,
            quality: item.quality || "Common" as ItemQuality,
            durability: typeof item.durability === 'number' ? item.durability : undefined,
            magicalEffect: item.magicalEffect || undefined,
        }));
        return { ...state, inventory: validatedNewInventory };
      }

    default:
      return state;
  }
}
