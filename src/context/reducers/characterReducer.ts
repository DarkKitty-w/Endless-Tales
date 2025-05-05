// src/context/reducers/characterReducer.ts
import type { Character, CharacterStats, Skill, SkillTree, SkillTreeStage } from "@/types/character-types";
import type { Action } from "../game-actions";
import { initialCharacterState, initialStats } from "../game-initial-state";
import { calculateMaxStamina, calculateMaxMana, calculateXpToNextLevel, getStarterSkillsForClass } from "@/lib/gameUtils";
import { updateGameStateString } from "@/lib/game-state-utils"; // Import if needed for derived state

export function characterReducer(state: Character | null, action: Action): Character | null {
    switch (action.type) {
        case "CREATE_CHARACTER": {
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
            return newCharacter;
        }
        case "UPDATE_CHARACTER": {
            if (!state) return null;
            const updatedStats = action.payload.stats ? { ...state.stats, ...action.payload.stats } : state.stats;
            const updatedKnowledge = action.payload.knowledge ?? state.knowledge;
            const maxStamina = calculateMaxStamina(updatedStats);
            const maxMana = calculateMaxMana(updatedStats, updatedKnowledge);

            return {
                ...state,
                ...action.payload,
                stats: updatedStats,
                knowledge: updatedKnowledge,
                maxStamina: maxStamina,
                currentStamina: Math.min(state.currentStamina, maxStamina),
                maxMana: maxMana,
                currentMana: Math.min(state.currentMana, maxMana),
                traits: action.payload.traits ?? state.traits,
                skillTree: action.payload.skillTree !== undefined ? action.payload.skillTree : state.skillTree,
                skillTreeStage: action.payload.skillTreeStage !== undefined ? action.payload.skillTreeStage : state.skillTreeStage,
                aiGeneratedDescription: action.payload.aiGeneratedDescription !== undefined ? action.payload.aiGeneratedDescription : state.aiGeneratedDescription,
                learnedSkills: action.payload.learnedSkills ?? state.learnedSkills,
                level: action.payload.level ?? state.level,
                xp: action.payload.xp ?? state.xp,
                xpToNextLevel: action.payload.xpToNextLevel ?? state.xpToNextLevel,
                reputation: action.payload.reputation ?? state.reputation,
                npcRelationships: action.payload.npcRelationships ?? state.npcRelationships,
            };
        }
         case "SET_AI_DESCRIPTION":
             if (!state) return null;
             return { ...state, aiGeneratedDescription: action.payload };
        case "GRANT_XP": {
            if (!state) return null;
            const newXp = state.xp + action.payload;
            console.log(`Granted ${action.payload} XP. Current XP: ${newXp}/${state.xpToNextLevel}`);
            return { ...state, xp: newXp };
        }
        case "LEVEL_UP": {
            if (!state) return null;
            if (action.payload.newLevel <= state.level) {
                console.warn(`Attempted to level up to ${action.payload.newLevel}, but current level is ${state.level}. Ignoring.`);
                return state;
            }
            console.log(`Level Up! ${state.level} -> ${action.payload.newLevel}. Next level at ${action.payload.newXpToNextLevel} XP.`);
            const remainingXp = Math.max(0, state.xp - state.xpToNextLevel);
            return {
                ...state,
                level: action.payload.newLevel,
                xp: remainingXp,
                xpToNextLevel: action.payload.newXpToNextLevel,
                currentStamina: state.maxStamina, // Restore resources
                currentMana: state.maxMana,
            };
        }
        case "UPDATE_REPUTATION": {
            if (!state) return null;
            const { faction, change } = action.payload;
            const currentScore = state.reputation[faction] ?? 0;
            const newScore = Math.max(-100, Math.min(100, currentScore + change));
            console.log(`Reputation update for ${faction}: ${currentScore} -> ${newScore}`);
            return {
                ...state,
                reputation: { ...state.reputation, [faction]: newScore },
            };
        }
        case "UPDATE_NPC_RELATIONSHIP": {
            if (!state) return null;
            const { npcName, change } = action.payload;
            const currentScore = state.npcRelationships[npcName] ?? 0;
            const newScore = Math.max(-100, Math.min(100, currentScore + change));
            console.log(`Relationship update with ${npcName}: ${currentScore} -> ${newScore}`);
            return {
                ...state,
                npcRelationships: { ...state.npcRelationships, [npcName]: newScore },
            };
        }
        case "SET_SKILL_TREE": {
            if (!state) return null;
            if (state.class !== action.payload.class) {
                console.warn(`Skill tree class "${action.payload.class}" does not match character class "${state.class}". Ignoring.`);
                return state;
            }
            const stages = action.payload.skillTree.stages || [];
             if (stages.length !== 5) {
                 console.error(`Reducer: Received skill tree with ${stages.length} stages, expected 5. Discarding.`);
                 return { ...state }; // Return unchanged state
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
            return { ...state, skillTree: validatedSkillTree };
        }
         case "CHANGE_CLASS_AND_RESET_SKILLS": {
             if (!state) return null;
             console.log(`Changing class from ${state.class} to ${action.payload.newClass} and resetting skills/stage.`);
             const stages = action.payload.newSkillTree.stages || [];
              if (stages.length !== 5) {
                 console.error(`Reducer: Received new skill tree with ${stages.length} stages, expected 5. Aborting class change.`);
                 return state; // Return unchanged state
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
             return {
                 ...state,
                 class: action.payload.newClass,
                 skillTree: newValidatedSkillTree,
                 skillTreeStage: 0, // Reset stage
                 learnedSkills: starterSkills, // Reset to new class's starter skills
             };
         }
        case "PROGRESS_SKILL_STAGE": {
             if (!state || !state.skillTree) return state;
             const newStage = Math.max(0, Math.min(4, action.payload)); // Clamp stage between 0 and 4
             if (newStage > state.skillTreeStage) {
                 const newStageName = state.skillTree.stages[newStage]?.stageName || `Stage ${newStage}`;
                 console.log(`Progressing skill stage from ${state.skillTreeStage} to ${newStage} (${newStageName}).`);
                 return { ...state, skillTreeStage: newStage };
             } else {
                 console.log(`Attempted to progress skill stage to ${newStage}, but current stage is ${state.skillTreeStage}. No change.`);
                 return state;
             }
         }
         case "UPDATE_NARRATION": { // Handle character updates from narration
             if (!state) return null;
             const { updatedStats, updatedTraits, updatedKnowledge, staminaChange, manaChange, gainedSkill, xpGained, reputationChange, npcRelationshipChange, progressedToStage } = action.payload;
             let newState = { ...state };

             if (updatedStats) {
                 newState.stats = { ...newState.stats, ...updatedStats };
                 // Recalculate dependent stats
                 newState.maxStamina = calculateMaxStamina(newState.stats);
                 newState.maxMana = calculateMaxMana(newState.stats, newState.knowledge);
             }
             if (updatedTraits) newState.traits = updatedTraits;
             if (updatedKnowledge) {
                 newState.knowledge = updatedKnowledge;
                  newState.maxMana = calculateMaxMana(newState.stats, newState.knowledge); // Recalculate mana if knowledge changes
             }
             if (staminaChange) newState.currentStamina = Math.max(0, Math.min(newState.maxStamina, newState.currentStamina + staminaChange));
             if (manaChange) newState.currentMana = Math.max(0, Math.min(newState.maxMana, newState.currentMana + manaChange));

             if (gainedSkill && !newState.learnedSkills.some(s => s.name === gainedSkill.name)) {
                 newState.learnedSkills = [...newState.learnedSkills, { ...gainedSkill, type: 'Learned' }];
             }
             if (xpGained) newState.xp += xpGained;
             if (reputationChange) {
                 const { faction, change } = reputationChange;
                 const currentScore = newState.reputation[faction] ?? 0;
                 newState.reputation[faction] = Math.max(-100, Math.min(100, currentScore + change));
             }
             if (npcRelationshipChange) {
                 const { npcName, change } = npcRelationshipChange;
                 const currentScore = newState.npcRelationships[npcName] ?? 0;
                 newState.npcRelationships[npcName] = Math.max(-100, Math.min(100, currentScore + change));
             }
             if (progressedToStage !== undefined && progressedToStage > newState.skillTreeStage) {
                 newState.skillTreeStage = progressedToStage;
             }

             return newState;
         }
         case "RESET_GAME":
             return null; // Clear character on full reset
         case "LOAD_ADVENTURE":
             // Validate character data from loaded adventure
             const savedChar = action.payload.character;
             const validatedStats = savedChar?.stats ? { ...initialStats, ...savedChar.stats } : { ...initialStats };
             const validatedKnowledge = Array.isArray(savedChar?.knowledge) ? savedChar.knowledge : [];

             return { // Return validated character state
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
        default:
            return state;
    }
}
