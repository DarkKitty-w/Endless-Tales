// src/context/GameContext.tsx
"use client";

import type { ReactNode } from "react";
import React, { createContext, useContext, useReducer, Dispatch, useEffect } from "react";
import type { GenerateCharacterDescriptionOutput } from "@/ai/flows/generate-character-description";

export type GameStatus =
  | "MainMenu"
  | "CharacterCreation"
  | "AdventureSetup"
  | "Gameplay"
  | "AdventureSummary"
  | "ViewSavedAdventures";

// --- Skill Tree Definitions ---
export interface Skill {
    name: string;
    description: string;
    type?: 'Starter' | 'Learned'; // Indicate if it's a starter skill or learned
    manaCost?: number; // Optional mana cost
    staminaCost?: number; // Optional stamina cost
}

export interface SkillTreeStage {
    stage: number; // 0-4
    stageName: string; // e.g., "Potential", "Apprentice", "Knight", "Initiate", "Master", "Grandmaster"
    skills: Skill[]; // Skills *available* at this stage (not necessarily learned yet)
}

export interface SkillTree {
    className: string; // The class this tree belongs to
    stages: SkillTreeStage[]; // Array containing 5 stages (0-4)
}

// --- State Definition ---

export interface CharacterStats {
  strength: number;
  stamina: number; // Base stamina stat affecting max stamina
  agility: number;
  // Maybe add Intelligence/Wisdom later for mana?
}

export interface Character {
  name: string;
  description: string; // User's description or AI-generated one if they used the button
  class: string; // Character class (e.g., Warrior, Mage) - Now mandatory
  traits: string[];
  knowledge: string[];
  background: string;
  stats: CharacterStats;
  aiGeneratedDescription?: GenerateCharacterDescriptionOutput['detailedDescription']; // Separate storage for AI's expansion

  // Resource Pools
  maxStamina: number;
  currentStamina: number;
  maxMana: number;
  currentMana: number;

  skillTree: SkillTree | null; // Holds the generated skill tree for the current class
  skillTreeStage: number; // Current progression stage (0-4, 0 means no stage achieved yet)
  learnedSkills: Skill[]; // List of skills the character has actually learned/acquired
}

export interface AdventureSettings {
  adventureType: "Randomized" | "Custom" | null;
  permanentDeath: boolean;
  // Fields for Custom Adventure
  worldType?: string;
  mainQuestline?: string;
  difficulty?: string;
}

export interface InventoryItem {
    name: string;
    description?: string;
    imageDataUri?: string;
}

export interface StoryLogEntry {
  narration: string;
  updatedGameState: string;
  updatedInventory?: string[];
  // Character progression updates from AI
  updatedStats?: Partial<CharacterStats>;
  updatedTraits?: string[];
  updatedKnowledge?: string[];
  updatedClass?: string;
  progressedToStage?: number; // Optional: AI indicates skill stage progression
  suggestedClassChange?: string; // Optional: AI suggests a class change
  timestamp: number;
  // Resource changes from AI
  staminaChange?: number; // Negative for cost, positive for gain
  manaChange?: number; // Negative for cost, positive for gain
  gainedSkill?: Skill; // Optional: If a new skill was learned/gained
}

export interface SavedAdventure {
    id: string;
    saveTimestamp: number;
    characterName: string;
    character: Character; // Includes stamina/mana, skill tree (with stage names), stage number, and learned skills
    adventureSettings: AdventureSettings; // Includes custom settings if applicable
    storyLog: StoryLogEntry[];
    currentGameStateString: string;
    inventory: InventoryItem[];
    statusBeforeSave?: GameStatus;
    adventureSummary?: string | null;
}


export interface GameState {
  status: GameStatus;
  character: Character | null;
  adventureSettings: AdventureSettings;
  currentNarration: StoryLogEntry | null;
  storyLog: StoryLogEntry[];
  adventureSummary: string | null;
  currentGameStateString: string;
  inventory: InventoryItem[];
  savedAdventures: SavedAdventure[];
  currentAdventureId: string | null;
  isGeneratingSkillTree: boolean; // Track skill tree generation
}

// --- Initial State Calculation Helpers ---
const calculateMaxStamina = (stats: CharacterStats): number => {
    return Math.max(10, stats.stamina * 10 + 20); // Example calculation: base 20 + 10 per stamina point
};

const calculateMaxMana = (stats: CharacterStats, knowledge: string[]): number => {
    const baseMana = 10;
    const knowledgeBonus = knowledge.includes("Magic") || knowledge.includes("Arcana") ? 20 : 0;
    // Add bonus from a potential 'Intelligence' stat later if needed
    return baseMana + knowledgeBonus;
};

const initialCharacterState: Character = {
  name: "",
  description: "",
  class: "Adventurer", // Default starting class
  traits: [],
  knowledge: [],
  background: "",
  stats: { strength: 5, stamina: 5, agility: 5 },
  aiGeneratedDescription: undefined, // Starts undefined
  maxStamina: calculateMaxStamina({ strength: 5, stamina: 5, agility: 5 }),
  currentStamina: calculateMaxStamina({ strength: 5, stamina: 5, agility: 5 }),
  maxMana: calculateMaxMana({ strength: 5, stamina: 5, agility: 5 }, []),
  currentMana: calculateMaxMana({ strength: 5, stamina: 5, agility: 5 }, []),
  skillTree: null, // Starts with no skill tree
  skillTreeStage: 0, // Starts at stage 0
  learnedSkills: [], // Starts with no learned skills
};

const initialState: GameState = {
  status: "MainMenu",
  character: null,
  adventureSettings: {
    adventureType: null,
    permanentDeath: true,
    // Default custom settings to empty strings
    worldType: "",
    mainQuestline: "",
    difficulty: "Normal", // Default difficulty
  },
  currentNarration: null,
  storyLog: [],
  adventureSummary: null,
  currentGameStateString: "The adventure is about to begin...",
  inventory: [],
  savedAdventures: [],
  currentAdventureId: null,
  isGeneratingSkillTree: false, // Initially not generating
};

// --- LocalStorage Keys ---
const SAVED_ADVENTURES_KEY = "endlessTalesSavedAdventures";

// --- Action Definitions ---

type Action =
  | { type: "SET_GAME_STATUS"; payload: GameStatus }
  | { type: "CREATE_CHARACTER"; payload: Partial<Character> }
  | { type: "UPDATE_CHARACTER"; payload: Partial<Character> }
  | { type: "SET_AI_DESCRIPTION"; payload: string } // This sets the separate aiGeneratedDescription
  | { type: "SET_ADVENTURE_SETTINGS"; payload: Partial<AdventureSettings> }
  | { type: "START_GAMEPLAY" }
  | { type: "UPDATE_NARRATION"; payload: StoryLogEntry }
  | { type: "END_ADVENTURE"; payload: { summary: string | null; finalNarration?: StoryLogEntry } }
  | { type: "RESET_GAME" }
  | { type: "LOAD_SAVED_ADVENTURES"; payload: SavedAdventure[] }
  | { type: "SAVE_CURRENT_ADVENTURE" }
  | { type: "LOAD_ADVENTURE"; payload: string }
  | { type: "DELETE_ADVENTURE"; payload: string }
  | { type: "SET_SKILL_TREE_GENERATING"; payload: boolean } // Action to set generation status
  | { type: "SET_SKILL_TREE"; payload: { class: string; skillTree: SkillTree } } // Action to set the generated skill tree and class
  | { type: "CHANGE_CLASS_AND_RESET_SKILLS"; payload: { newClass: string; newSkillTree: SkillTree } } // Action to change class and reset skills/stage
  | { type: "PROGRESS_SKILL_STAGE"; payload: number }; // Action to update skill stage

// --- Helper Functions ---
function generateAdventureId(): string {
    return `adv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Placeholder for AI-generated image URI
async function generatePlaceholderImageUri(itemName: string): Promise<string> {
    let hash = 0;
    for (let i = 0; i < itemName.length; i++) {
        hash = itemName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const width = 200 + (Math.abs(hash) % 101);
    const height = 200 + (Math.abs(hash >> 16) % 101);
    return `https://picsum.photos/${width}/${height}?random=${encodeURIComponent(itemName)}&t=${Date.now()}`;
}

// --- Reducer ---
let isGeneratingImages = false;

// Async inventory update logic (remains the same)
async function handleInventoryUpdate(currentState: GameState, updatedItemNames: string[]): Promise<Partial<GameState>> {
    if (isGeneratingImages) {
        console.log("Image generation already in progress, skipping.");
        return {};
    }
    const currentInventoryMap = new Map(currentState.inventory.map(item => [item.name, item]));
    const itemsToGenerate: string[] = [];
    const finalInventoryItems: InventoryItem[] = [];
    for (const name of updatedItemNames) {
        const existingItem = currentInventoryMap.get(name);
        if (existingItem) {
            finalInventoryItems.push(existingItem);
            if (!existingItem.imageDataUri) itemsToGenerate.push(name);
        } else {
            finalInventoryItems.push({ name });
            itemsToGenerate.push(name);
        }
    }
    if (itemsToGenerate.length === 0) return { inventory: finalInventoryItems };
    isGeneratingImages = true;
    console.log("Generating images for items:", itemsToGenerate);
    try {
        const generationPromises = itemsToGenerate.map(name => generatePlaceholderImageUri(name).then(uri => ({ name, imageDataUri: uri })));
        const generatedItems = await Promise.all(generationPromises);
        const generatedMap = new Map(generatedItems.map(item => [item.name, item.imageDataUri]));
        const inventoryWithImages = finalInventoryItems.map(item => generatedMap.get(item.name) ? { ...item, imageDataUri: generatedMap.get(item.name)?.imageDataUri } : item);
        isGeneratingImages = false;
        return { inventory: inventoryWithImages };
    } catch (error) {
        console.error("Error generating item images:", error);
        isGeneratingImages = false;
        return { inventory: finalInventoryItems };
    }
}


function gameReducer(state: GameState, action: Action): GameState {
  console.log(`Reducer Action: ${action.type}`, action.payload ? JSON.stringify(action.payload).substring(0, 200) : '');
  switch (action.type) {
    case "SET_GAME_STATUS":
      return { ...state, status: action.payload };
    case "CREATE_CHARACTER": {
      // Reset adventure settings when creating a new character
       const baseStats = action.payload.stats ? { ...initialCharacterState.stats, ...action.payload.stats } : initialCharacterState.stats;
       const baseKnowledge = action.payload.knowledge ?? [];
       const maxStamina = calculateMaxStamina(baseStats);
       const maxMana = calculateMaxMana(baseStats, baseKnowledge);

       // Starter Skills Example (can be moved to a config or generated based on class later)
       const starterSkills: Skill[] = [
           { name: "Observe", description: "Carefully examine your surroundings.", type: 'Starter' },
           { name: "Basic Strike", description: "A simple physical attack.", type: 'Starter', staminaCost: 5 },
           { name: "First Aid", description: "Attempt to patch up minor wounds.", type: 'Starter', manaCost: 0, staminaCost: 10 },
       ];

      const newCharacter: Character = {
        ...initialCharacterState, // Use spread of initialCharacterState to ensure all fields are present
        name: action.payload.name ?? "",
        description: action.payload.description ?? "",
        class: action.payload.class ?? initialCharacterState.class,
        traits: action.payload.traits ?? [],
        knowledge: baseKnowledge,
        background: action.payload.background ?? "",
        stats: baseStats,
        aiGeneratedDescription: action.payload.aiGeneratedDescription ?? undefined,
        maxStamina: maxStamina,
        currentStamina: maxStamina,
        maxMana: maxMana,
        currentMana: maxMana,
        skillTree: null,
        skillTreeStage: 0,
        learnedSkills: starterSkills, // Add starter skills
      };
      return {
        ...state,
        character: newCharacter,
        status: "AdventureSetup",
        adventureSettings: { ...initialState.adventureSettings }, // Reset adventure settings
        currentAdventureId: null,
        storyLog: [],
        currentNarration: null,
        adventureSummary: null,
        inventory: [],
        isGeneratingSkillTree: false,
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
             // Clamp current stamina/mana if max decreased
             currentStamina: Math.min(state.character.currentStamina, maxStamina),
             maxMana: maxMana,
             currentMana: Math.min(state.character.currentMana, maxMana),
             traits: action.payload.traits ?? state.character.traits,
             skillTree: action.payload.skillTree !== undefined ? action.payload.skillTree : state.character.skillTree,
             skillTreeStage: action.payload.skillTreeStage !== undefined ? action.payload.skillTreeStage : state.character.skillTreeStage,
             aiGeneratedDescription: action.payload.aiGeneratedDescription !== undefined ? action.payload.aiGeneratedDescription : state.character.aiGeneratedDescription,
             learnedSkills: action.payload.learnedSkills ?? state.character.learnedSkills,

         };
         return { ...state, character: updatedCharacter };
        }
    case "SET_AI_DESCRIPTION":
        if (!state.character) return state;
        return { ...state, character: { ...state.character, aiGeneratedDescription: action.payload } };
    case "SET_ADVENTURE_SETTINGS":
      // Merge new settings with existing ones
      return { ...state, adventureSettings: { ...state.adventureSettings, ...action.payload } };
    case "START_GAMEPLAY": {
      if (!state.character || !state.adventureSettings.adventureType) {
        console.error("Cannot start gameplay: Missing character or adventure type.");
        return state;
      }
      // Build initial game state string based on settings
      const charDesc = state.character.description || "No description provided.";
      const initialItems = [{ name: "Basic Clothes" }];
      const initialInventoryNames = initialItems.map(item => item.name);
      const currentStage = state.character.skillTreeStage;
      const stageName = currentStage >= 0 && state.character.skillTree && state.character.skillTree.stages[currentStage]
          ? state.character.skillTree.stages[currentStage].stageName
          : `Stage ${currentStage}`;
      const skillTreeSummary = state.character.skillTree
          ? `Class: ${state.character.skillTree.className} (${stageName} - Stage ${currentStage}/4)`
          : "No skill tree assigned yet.";
      const aiDescString = state.character.aiGeneratedDescription ? `\nAI Profile: ${state.character.aiGeneratedDescription}` : "";

      let adventureDetails = `Adventure Mode: ${state.adventureSettings.adventureType}, ${state.adventureSettings.permanentDeath ? 'Permadeath' : 'Respawn'}`;
      if (state.adventureSettings.adventureType === "Custom") {
          adventureDetails += `\nWorld: ${state.adventureSettings.worldType || '?'}\nQuest: ${state.adventureSettings.mainQuestline || '?'}\nDifficulty: ${state.adventureSettings.difficulty || '?'}`;
      }

       const initialGameState = `Location: Starting Point\nInventory: ${initialInventoryNames.join(', ') || 'Empty'}\nStatus: Healthy (STA: ${state.character.currentStamina}/${state.character.maxStamina}, MANA: ${state.character.currentMana}/${state.character.maxMana})\nTime: Day 1, Morning\nQuest: None\nMilestones: None\nCharacter Name: ${state.character.name}\nClass: ${state.character.class}\nTraits: ${state.character.traits.join(', ') || 'None'}\nKnowledge: ${state.character.knowledge.join(', ') || 'None'}\nBackground: ${state.character.background || 'None'}\nStats: STR ${state.character.stats.strength}, STA ${state.character.stats.stamina}, AGI ${state.character.stats.agility}\nDescription: ${charDesc}${aiDescString}\n${adventureDetails}\n${skillTreeSummary}\nLearned Skills: ${state.character.learnedSkills.map(s => s.name).join(', ') || 'None'}`;

      const adventureId = state.currentAdventureId || generateAdventureId();

      return {
        ...state,
        status: "Gameplay",
        storyLog: state.currentAdventureId ? state.storyLog : [],
        currentNarration: state.currentAdventureId ? state.currentNarration : null,
        adventureSummary: null,
        inventory: state.currentAdventureId ? state.inventory : initialItems,
        currentGameStateString: state.currentAdventureId ? state.currentGameStateString : initialGameState,
        currentAdventureId: adventureId,
        isGeneratingSkillTree: state.currentAdventureId ? state.isGeneratingSkillTree : false,
        character: {
            ...state.character,
            skillTree: state.currentAdventureId ? state.character.skillTree : state.character.skillTree,
            skillTreeStage: state.currentAdventureId ? state.character.skillTreeStage : state.character.skillTreeStage,
             // Ensure stamina/mana are full on new game start
             currentStamina: state.currentAdventureId ? state.character.currentStamina : state.character.maxStamina,
             currentMana: state.currentAdventureId ? state.character.currentMana : state.character.maxMana,
             learnedSkills: state.currentAdventureId ? state.character.learnedSkills : state.character.learnedSkills,
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

            // Apply stamina/mana changes, clamping between 0 and max
            const staminaChange = newLogEntry.staminaChange ?? 0;
            const manaChange = newLogEntry.manaChange ?? 0;
            const newCurrentStamina = Math.max(0, Math.min(maxStamina, state.character.currentStamina + staminaChange));
            const newCurrentMana = Math.max(0, Math.min(maxMana, state.character.currentMana + manaChange));

            // Handle gained skill
            let newLearnedSkills = state.character.learnedSkills;
            if (newLogEntry.gainedSkill && !state.character.learnedSkills.some(s => s.name === newLogEntry.gainedSkill!.name)) {
                newLearnedSkills = [...state.character.learnedSkills, { ...newLogEntry.gainedSkill, type: 'Learned' }];
                console.log(`Learned new skill: ${newLogEntry.gainedSkill.name}`);
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
                 // Class is handled separately by CHANGE_CLASS action or suggestedClassChange logic
            };
            console.log("Character updated via narration:", { stats: newLogEntry.updatedStats, traits: newLogEntry.updatedTraits, knowledge: newLogEntry.updatedKnowledge, staminaChange, manaChange, gainedSkill: newLogEntry.gainedSkill?.name });
        }

        if (action.payload.updatedInventory) {
            const itemNames = action.payload.updatedInventory;
            handleInventoryUpdate(state, itemNames).then(inventoryUpdate => {
                 console.log("Async inventory update result (may not be immediate):", inventoryUpdate);
            });
             inventoryAfterNarration = itemNames.map(name => state.inventory.find(item => item.name === name) ?? { name });
             console.log("Inventory names updated based on narration payload.");
        }

        return {
            ...state,
            character: charAfterNarration,
            currentNarration: newLogEntry,
            storyLog: newLog,
            inventory: inventoryAfterNarration,
            currentGameStateString: action.payload.updatedGameState,
        };
    }
    case "END_ADVENTURE": {
        let finalLog = [...state.storyLog];
        let finalGameState = state.currentGameStateString;
        let finalInventoryNames = state.inventory.map(i => i.name);
        let finalCharacterState = state.character;

        if (action.payload.finalNarration && (!state.currentNarration || action.payload.finalNarration.narration !== state.currentNarration.narration)) {
            const finalEntry: StoryLogEntry = { ...action.payload.finalNarration, timestamp: action.payload.finalNarration.timestamp || Date.now() };
            finalLog.push(finalEntry);
            finalGameState = action.payload.finalNarration.updatedGameState;
            finalInventoryNames = action.payload.finalNarration.updatedInventory || finalInventoryNames;

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


                finalCharacterState = {
                    ...state.character,
                    stats: finalStats,
                    knowledge: finalKnowledge,
                    maxStamina: finalMaxStamina,
                    currentStamina: finalCurrentStamina,
                    maxMana: finalMaxMana,
                    currentMana: finalCurrentMana,
                    traits: finalEntry.updatedTraits ?? state.character.traits,
                    class: finalEntry.updatedClass ?? state.character.class,
                    skillTreeStage: finalEntry.progressedToStage ?? state.character.skillTreeStage,
                    aiGeneratedDescription: state.character.aiGeneratedDescription,
                    learnedSkills: finalLearnedSkills,
                };
            }
            console.log("Added final narration entry to log and applied final character updates.");
        } else {
            console.log("Final narration not added or same as current.");
        }

        const finalInventory = state.inventory.filter(item => finalInventoryNames.includes(item.name));
        let updatedSavedAdventures = state.savedAdventures;
        if (finalCharacterState && state.currentAdventureId) {
            const endedAdventure: SavedAdventure = {
                id: state.currentAdventureId,
                saveTimestamp: Date.now(),
                characterName: finalCharacterState.name,
                character: finalCharacterState, // Save the final state
                adventureSettings: state.adventureSettings, // Save current settings
                storyLog: finalLog,
                currentGameStateString: finalGameState,
                inventory: finalInventory,
                statusBeforeSave: "AdventureSummary",
                adventureSummary: action.payload.summary,
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
            inventory: finalInventory,
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
        character: state.character, // Save current character state including stamina/mana/skills
        adventureSettings: state.adventureSettings, // Save current settings
        storyLog: state.storyLog,
        currentGameStateString: state.currentGameStateString,
        inventory: state.inventory,
        statusBeforeSave: state.status,
        adventureSummary: state.adventureSummary,
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
       // Validate and provide defaults for potentially missing character fields from older saves
       const validatedCharacter: Character = {
           ...initialCharacterState, // Start with defaults
           ...(adventureToLoad.character || {}), // Load saved data, ensure character obj exists
           stats: adventureToLoad.character?.stats ? { ...initialCharacterState.stats, ...adventureToLoad.character.stats } : initialCharacterState.stats,
           maxStamina: adventureToLoad.character?.maxStamina ?? calculateMaxStamina(adventureToLoad.character?.stats ?? initialCharacterState.stats),
           currentStamina: adventureToLoad.character?.currentStamina ?? (adventureToLoad.character?.maxStamina ?? calculateMaxStamina(adventureToLoad.character?.stats ?? initialCharacterState.stats)),
           maxMana: adventureToLoad.character?.maxMana ?? calculateMaxMana(adventureToLoad.character?.stats ?? initialCharacterState.stats, adventureToLoad.character?.knowledge ?? []),
           currentMana: adventureToLoad.character?.currentMana ?? (adventureToLoad.character?.maxMana ?? calculateMaxMana(adventureToLoad.character?.stats ?? initialCharacterState.stats, adventureToLoad.character?.knowledge ?? [])),
           skillTree: adventureToLoad.character?.skillTree ? {
               ...adventureToLoad.character.skillTree,
               stages: (adventureToLoad.character.skillTree.stages || []).map((stage, index) => ({
                    ...stage,
                    stageName: stage.stageName || `Stage ${stage.stage ?? index}` // Default stage name if missing
               }))
           } : null,
           skillTreeStage: adventureToLoad.character?.skillTreeStage ?? 0,
           learnedSkills: adventureToLoad.character?.learnedSkills ?? [], // Default to empty array if missing
           aiGeneratedDescription: adventureToLoad.character?.aiGeneratedDescription ?? undefined,
       };


      if (adventureToLoad.statusBeforeSave === "AdventureSummary") {
          return {
              ...initialState,
              savedAdventures: state.savedAdventures,
              status: "AdventureSummary",
              character: validatedCharacter,
              adventureSummary: adventureToLoad.adventureSummary,
              storyLog: adventureToLoad.storyLog,
              inventory: adventureToLoad.inventory,
              currentAdventureId: adventureToLoad.id,
              adventureSettings: adventureToLoad.adventureSettings, // Load settings for context
          };
      } else {
          return {
              ...initialState,
              savedAdventures: state.savedAdventures,
              status: "Gameplay",
              character: validatedCharacter,
              adventureSettings: adventureToLoad.adventureSettings, // Load settings
              storyLog: adventureToLoad.storyLog,
              inventory: adventureToLoad.inventory,
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
    // --- Skill Tree Actions ---
    case "SET_SKILL_TREE_GENERATING":
        return { ...state, isGeneratingSkillTree: action.payload };

    case "SET_SKILL_TREE": {
        if (!state.character) return state;
        if (state.character.class !== action.payload.class) {
            console.warn(`Skill tree class "${action.payload.class}" does not match character class "${state.character.class}". Ignoring.`);
            return { ...state, isGeneratingSkillTree: false };
        }
        // Ensure the skill tree has 5 stages (0-4) and default names
         const stages = action.payload.skillTree.stages || [];
         const validatedStages: SkillTreeStage[] = Array.from({ length: 5 }, (_, i) => {
            const foundStage = stages.find(s => s.stage === i);
            return {
                stage: i,
                stageName: foundStage?.stageName || (i === 0 ? "Potential" : `Stage ${i}`), // Default stage 0 name
                skills: foundStage?.skills || [] // Skills defined by AI for stages 1-4, empty for stage 0
            };
         });

         const validatedSkillTree: SkillTree = {
            ...action.payload.skillTree,
            className: action.payload.class,
            stages: validatedStages
         };

        return {
            ...state,
            character: {
                ...state.character,
                skillTree: validatedSkillTree,
                // skillTreeStage is not reset here, only when class changes
            },
            isGeneratingSkillTree: false,
        };
      }
     case "CHANGE_CLASS_AND_RESET_SKILLS": {
         if (!state.character) return state;
         console.log(`Changing class from ${state.character.class} to ${action.payload.newClass} and resetting skills/stage.`);
          // Ensure the new skill tree has 5 stages (0-4) and default names
         const stages = action.payload.newSkillTree.stages || [];
         const validatedStages: SkillTreeStage[] = Array.from({ length: 5 }, (_, i) => {
            const foundStage = stages.find(s => s.stage === i);
            return {
                stage: i,
                stageName: foundStage?.stageName || (i === 0 ? "Potential" : `Stage ${i}`),
                skills: foundStage?.skills || []
            };
         });

         const newValidatedSkillTree: SkillTree = {
            ...action.payload.newSkillTree,
            className: action.payload.newClass,
            stages: validatedStages
         };

          // Reset learned skills to only include starter skills
         const starterSkills = state.character.learnedSkills.filter(skill => skill.type === 'Starter');

         return {
             ...state,
             character: {
                 ...state.character,
                 class: action.payload.newClass,
                 skillTree: newValidatedSkillTree,
                 skillTreeStage: 0, // Reset stage to 0
                 learnedSkills: starterSkills, // Reset learned skills
             },
             isGeneratingSkillTree: false,
         };
        }
     case "PROGRESS_SKILL_STAGE": {
         if (!state.character || !state.character.skillTree) return state;
         const newStage = Math.max(0, Math.min(4, action.payload)); // Allow stage 0, max 4
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

    default:
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const exhaustiveCheck: never = action;
      return state;
  }
}

// --- Context and Provider ---

const GameContext = createContext<{ state: GameState; dispatch: Dispatch<Action> } | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

    // --- Persistence Effect ---
    useEffect(() => {
        try {
            const savedData = localStorage.getItem(SAVED_ADVENTURES_KEY);
            if (savedData) {
                const loadedAdventures: SavedAdventure[] = JSON.parse(savedData);
                if (Array.isArray(loadedAdventures)) {
                     const validatedAdventures = loadedAdventures.map(adv => {
                         const validatedChar = {
                             ...initialCharacterState,
                             ...(adv.character || {}),
                             stats: adv.character?.stats ? { ...initialCharacterState.stats, ...adv.character.stats } : initialCharacterState.stats,
                             maxStamina: adv.character?.maxStamina ?? calculateMaxStamina(adv.character?.stats ?? initialCharacterState.stats),
                             currentStamina: adv.character?.currentStamina ?? (adv.character?.maxStamina ?? calculateMaxStamina(adv.character?.stats ?? initialCharacterState.stats)),
                             maxMana: adv.character?.maxMana ?? calculateMaxMana(adv.character?.stats ?? initialCharacterState.stats, adv.character?.knowledge ?? []),
                             currentMana: adv.character?.currentMana ?? (adv.character?.maxMana ?? calculateMaxMana(adv.character?.stats ?? initialCharacterState.stats, adv.character?.knowledge ?? [])),
                             skillTree: adv.character?.skillTree ? {
                                 ...adv.character.skillTree,
                                 stages: (adv.character.skillTree.stages || []).map((stage, index) => ({
                                     ...stage,
                                     stageName: stage.stageName || `Stage ${stage.stage ?? index}`
                                 }))
                             } : null,
                             skillTreeStage: adv.character?.skillTreeStage ?? 0,
                             learnedSkills: adv.character?.learnedSkills ?? [],
                             aiGeneratedDescription: adv.character?.aiGeneratedDescription ?? undefined,
                         };

                         return {
                           ...adv,
                           character: validatedChar,
                           adventureSettings: { // Ensure defaults for potentially missing custom settings
                               ...initialState.adventureSettings,
                               ...(adv.adventureSettings || {})
                           }
                         };
                     }).filter(adv => adv.id && adv.characterName && adv.saveTimestamp && adv.character);


                    dispatch({ type: "LOAD_SAVED_ADVENTURES", payload: validatedAdventures });
                    console.log(`Loaded ${validatedAdventures.length} valid adventures from storage.`);
                    if (validatedAdventures.length !== loadedAdventures.length) {
                         console.warn("Some saved adventure data was invalid or missing character data and discarded.");
                         localStorage.setItem(SAVED_ADVENTURES_KEY, JSON.stringify(validatedAdventures));
                    }
                } else {
                    console.warn("Invalid data found in localStorage for saved adventures.");
                    localStorage.removeItem(SAVED_ADVENTURES_KEY);
                }
            } else {
                 console.log("No saved adventures found in storage.");
            }
        } catch (error) {
            console.error("Failed to load or parse saved adventures:", error);
             localStorage.removeItem(SAVED_ADVENTURES_KEY);
        }
    }, []);


   // Log state changes
   useEffect(() => {
      const currentStageName = state.character?.skillTreeStage !== undefined && state.character?.skillTree
          ? state.character.skillTree.stages[state.character.skillTreeStage]?.stageName ?? `Stage ${state.character.skillTreeStage}`
          : "Stage 0";
     console.log("Game State Updated:", {
        status: state.status,
        character: state.character?.name,
        class: state.character?.class,
        stage: `${currentStageName} (${state.character?.skillTreeStage}/4)`,
        stamina: `${state.character?.currentStamina}/${state.character?.maxStamina}`,
        mana: `${state.character?.currentMana}/${state.character?.maxMana}`,
        adventureId: state.currentAdventureId,
        settings: state.adventureSettings, // Log settings
    });
   }, [state.status, state.character, state.currentAdventureId, state.adventureSettings]);


  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

// --- Hook ---

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
