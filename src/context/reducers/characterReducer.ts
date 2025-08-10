// src/context/reducers/characterReducer.ts
import type { Character, CharacterStats, Skill, SkillTree, SkillTreeStage } from "@/types/character-types";
import type { Action } from "../game-actions";
import { initialCharacterState, initialCharacterStats } from "../game-initial-state";
import { calculateMaxHealth, calculateMaxActionStamina, calculateMaxMana, calculateXpToNextLevel, getStarterSkillsForClass } from "@/lib/gameUtils";
import { updateGameStateString } from "@/lib/game-state-utils";

export function characterReducer(state: Character | null, action: Action): Character | null {
    switch (action.type) {
        case "CREATE_CHARACTER": {
            const baseStats: CharacterStats = action.payload.stats
                ? { ...initialCharacterStats, ...action.payload.stats }
                : { ...initialCharacterStats };
            const baseKnowledge = action.payload.knowledge ?? [];
            const maxHealth = calculateMaxHealth(baseStats);
            const maxActionStamina = calculateMaxActionStamina(baseStats);
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
                maxHealth: maxHealth,
                currentHealth: maxHealth,
                maxStamina: maxActionStamina,
                currentStamina: maxActionStamina,
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
            
            const newMaxHealth = calculateMaxHealth(updatedStats);
            const newMaxActionStamina = calculateMaxActionStamina(updatedStats);
            const newMaxMana = calculateMaxMana(updatedStats, updatedKnowledge);

            return {
                ...state,
                ...action.payload,
                stats: updatedStats,
                knowledge: updatedKnowledge,
                maxHealth: newMaxHealth,
                currentHealth: Math.min(action.payload.currentHealth ?? state.currentHealth, newMaxHealth),
                maxStamina: newMaxActionStamina,
                currentStamina: Math.min(action.payload.currentStamina ?? state.currentStamina, newMaxActionStamina),
                maxMana: newMaxMana,
                currentMana: Math.min(action.payload.currentMana ?? state.currentMana, newMaxMana),
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
            return { ...state, xp: newXp };
        }
        case "LEVEL_UP": {
            if (!state) return null;
            if (action.payload.newLevel <= state.level) return state;
            const remainingXp = Math.max(0, state.xp - state.xpToNextLevel);
            // Full heal on level up
            const newMaxHealth = calculateMaxHealth(state.stats);
            const newMaxActionStamina = calculateMaxActionStamina(state.stats);
            const newMaxMana = calculateMaxMana(state.stats, state.knowledge);

            return {
                ...state,
                level: action.payload.newLevel,
                xp: remainingXp,
                xpToNextLevel: action.payload.newXpToNextLevel,
                maxHealth: newMaxHealth,
                currentHealth: newMaxHealth,
                maxStamina: newMaxActionStamina,
                currentStamina: newMaxActionStamina,
                maxMana: newMaxMana,
                currentMana: newMaxMana,
            };
        }
        case "UPDATE_REPUTATION": {
            if (!state) return null;
            const { faction, change } = action.payload;
            const currentScore = state.reputation[faction] ?? 0;
            const newScore = Math.max(-100, Math.min(100, currentScore + change));
            return { ...state, reputation: { ...state.reputation, [faction]: newScore } };
        }
        case "UPDATE_NPC_RELATIONSHIP": {
            if (!state) return null;
            const { npcName, change } = action.payload;
            const currentScore = state.npcRelationships[npcName] ?? 0;
            const newScore = Math.max(-100, Math.min(100, currentScore + change));
            return { ...state, npcRelationships: { ...state.npcRelationships, [npcName]: newScore } };
        }
        case "SET_SKILL_TREE": {
            if (!state || state.class !== action.payload.class) return state;
            const stages = action.payload.skillTree.stages || [];
             if (stages.length !== 5) {
                 console.error(`Reducer: Received skill tree with ${stages.length} stages, expected 5. Discarding.`);
                 return state;
             }
             const validatedStages: SkillTreeStage[] = Array.from({ length: 5 }, (_, i) => {
                const foundStage = stages.find(s => s.stage === i);
                return { stage: i, stageName: foundStage?.stageName || (i === 0 ? "Potential" : `Stage ${i}`),
                     skills: (Array.isArray(foundStage?.skills) ? foundStage.skills : []).map(skill => ({
                         name: skill.name || "Unnamed Skill", description: skill.description || "No description.", type: skill.type || 'Learned',
                         manaCost: typeof skill.manaCost === 'number' ? skill.manaCost : undefined,
                         staminaCost: typeof skill.staminaCost === 'number' ? skill.staminaCost : undefined,
                     })),
                };
             });
             const validatedSkillTree: SkillTree = { className: action.payload.class, stages: validatedStages };
            return { ...state, skillTree: validatedSkillTree };
        }
         case "CHANGE_CLASS_AND_RESET_SKILLS": {
             if (!state) return null;
             const stages = action.payload.newSkillTree.stages || [];
              if (stages.length !== 5) {
                 console.error(`Reducer: Received new skill tree with ${stages.length} stages, expected 5. Aborting class change.`);
                 return state;
             }
             const validatedStages: SkillTreeStage[] = Array.from({ length: 5 }, (_, i) => {
                 const foundStage = stages.find(s => s.stage === i);
                 return { stage: i, stageName: foundStage?.stageName || (i === 0 ? "Potential" : `Stage ${i}`),
                     skills: (Array.isArray(foundStage?.skills) ? foundStage.skills : []).map(skill => ({
                         name: skill.name || "Unnamed Skill", description: skill.description || "No description.", type: skill.type || 'Learned',
                         manaCost: typeof skill.manaCost === 'number' ? skill.manaCost : undefined,
                         staminaCost: typeof skill.staminaCost === 'number' ? skill.staminaCost : undefined,
                     })),
                 };
             });
             const newValidatedSkillTree: SkillTree = { className: action.payload.newClass, stages: validatedStages };
             const starterSkills = getStarterSkillsForClass(action.payload.newClass);
             return { ...state, class: action.payload.newClass, skillTree: newValidatedSkillTree, skillTreeStage: 0, learnedSkills: starterSkills };
         }
        case "PROGRESS_SKILL_STAGE": {
             if (!state || !state.skillTree) return state;
             const newStage = Math.max(0, Math.min(4, action.payload));
             if (newStage > state.skillTreeStage) return { ...state, skillTreeStage: newStage };
             return state;
         }
         case "UPDATE_NARRATION": {
             if (!state) return null;
             const { updatedStats, updatedTraits, updatedKnowledge, healthChange, staminaChange, manaChange, gainedSkill, xpGained, reputationChange, npcRelationshipChange, progressedToStage } = action.payload;
             let newState = { ...state };
             if (updatedStats) newState.stats = { ...newState.stats, ...updatedStats };
             if (updatedTraits) newState.traits = updatedTraits;
             if (updatedKnowledge) newState.knowledge = updatedKnowledge;

             // Recalculate max values if stats or knowledge changed
             if (updatedStats || updatedKnowledge) {
                newState.maxHealth = calculateMaxHealth(newState.stats);
                newState.maxStamina = calculateMaxActionStamina(newState.stats);
                newState.maxMana = calculateMaxMana(newState.stats, newState.knowledge);
             }
             
             if (healthChange) newState.currentHealth = Math.max(0, Math.min(newState.maxHealth, newState.currentHealth + healthChange));
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
        case "RESPAWN_CHARACTER": {
            if (!state) return null;
            // TODO: Implement more nuanced respawn penalties (e.g., XP loss) if desired.
            return {
                ...state,
                currentHealth: state.maxHealth, // Restore health
                currentStamina: state.maxStamina, // Restore action stamina
                currentMana: state.maxMana, // Restore mana
            };
        }
         case "RESET_GAME": return null;
         case "LOAD_ADVENTURE":
             const savedChar = action.payload.character;
             const validatedStats = savedChar?.stats ? { ...initialCharacterStats, ...savedChar.stats } : { ...initialCharacterStats };
             const validatedKnowledge = Array.isArray(savedChar?.knowledge) ? savedChar.knowledge : [];
             const loadedCharClass = savedChar?.class || "Adventurer";
             return {
                 ...initialCharacterState, 
                 ...(savedChar || {}), 
                 name: savedChar?.name || "Recovered Adventurer",
                 class: loadedCharClass,
                 knowledge: validatedKnowledge,
                 stats: validatedStats,
                 maxHealth: typeof savedChar?.maxHealth === 'number' ? savedChar.maxHealth : calculateMaxHealth(validatedStats),
                 currentHealth: typeof savedChar?.currentHealth === 'number' ? savedChar.currentHealth : (savedChar?.maxHealth ?? calculateMaxHealth(validatedStats)),
                 maxStamina: typeof savedChar?.maxStamina === 'number' ? savedChar.maxStamina : calculateMaxActionStamina(validatedStats),
                 currentStamina: typeof savedChar?.currentStamina === 'number' ? savedChar.currentStamina : (savedChar?.maxStamina ?? calculateMaxActionStamina(validatedStats)),
                 maxMana: typeof savedChar?.maxMana === 'number' ? savedChar.maxMana : calculateMaxMana(validatedStats, validatedKnowledge),
                 currentMana: typeof savedChar?.currentMana === 'number' ? savedChar.currentMana : (savedChar?.maxMana ?? calculateMaxMana(validatedStats, validatedKnowledge)),
                 level: typeof savedChar?.level === 'number' ? savedChar.level : 1,
                 xpToNextLevel: typeof savedChar?.xpToNextLevel === 'number' ? savedChar.xpToNextLevel : calculateXpToNextLevel(savedChar?.level ?? 1),
                 skillTree: savedChar?.skillTree ? { 
                     className: savedChar.skillTree.className || loadedCharClass,
                     stages: (Array.isArray(savedChar.skillTree.stages) ? savedChar.skillTree.stages : []).map((stage, index) => ({
                          stage: typeof stage.stage === 'number' ? stage.stage : index,
                          stageName: stage.stageName || (index === 0 ? "Potential" : `Stage ${stage.stage ?? index}`), 
                          skills: (Array.isArray(stage.skills) ? stage.skills : []).map(skill => ({
                             name: skill.name || "Unknown Skill", description: skill.description || "", type: skill.type || 'Learned',
                             manaCost: typeof skill.manaCost === 'number' ? skill.manaCost : undefined,
                             staminaCost: typeof skill.staminaCost === 'number' ? skill.staminaCost : undefined,
                         })),
                    })).slice(0, 5) 
                 } : null,
                 learnedSkills: (Array.isArray(savedChar?.learnedSkills) && savedChar.learnedSkills.length > 0) 
                      ? savedChar.learnedSkills.map(skill => ({
                          name: skill.name || "Unknown Skill", description: skill.description || "", type: skill.type || 'Learned',
                          manaCost: typeof skill.manaCost === 'number' ? skill.manaCost : undefined,
                          staminaCost: typeof skill.staminaCost === 'number' ? skill.staminaCost : undefined,
                       }))
                     : getStarterSkillsForClass(loadedCharClass), 
             };
        default:
            return state;
    }
}
