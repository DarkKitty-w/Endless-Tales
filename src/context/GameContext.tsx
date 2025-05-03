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

// Simple reputation structure: Faction name -> Score (-100 to 100)
export type Reputation = Record<string, number>;

// NPC Relationship structure: NPC Name -> Score (-100 to 100)
export type NpcRelationships = Record<string, number>;

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

  // Progression
  level: number;
  xp: number;
  xpToNextLevel: number;
  reputation: Reputation; // Faction reputation scores
  npcRelationships: NpcRelationships; // Relationship scores with specific NPCs

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

// Updated InventoryItem type
export type ItemQuality = "Poor" | "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";

export interface InventoryItem {
    name: string;
    description: string; // Make description mandatory
    weight?: number; // Optional weight
    durability?: number; // Optional durability (e.g., 0-100)
    magicalEffect?: string; // Optional description of magical effects
    quality?: ItemQuality; // Optional quality level
}


// Structure for AI-driven reputation changes
export interface ReputationChange {
    faction: string;
    change: number; // Positive or negative change amount
}

// Structure for AI-driven NPC relationship changes
export interface NpcRelationshipChange {
    npcName: string;
    change: number; // Positive or negative change amount
}


// Structure for crafting results (placeholder, might be expanded)
export interface CraftedItemResult {
    success: boolean;
    item?: InventoryItem; // The crafted item if successful
    message: string; // Message about the crafting attempt
}


export interface StoryLogEntry {
  narration: string;
  updatedGameState: string;
  // Inventory changes are now inferred from gameState or handled by specific actions
  // updatedInventory?: InventoryItem[]; // Use full items instead of just names if needed
  // Character progression updates from AI
  updatedStats?: Partial<CharacterStats>;
  updatedTraits?: string[];
  updatedKnowledge?: string[];
  // updatedClass?: string; // Deprecated: Class change is handled by specific action now
  progressedToStage?: number; // Optional: AI indicates skill stage progression
  suggestedClassChange?: string; // Optional: AI suggests a class change
  timestamp: number;
  // Resource changes from AI
  staminaChange?: number; // Negative for cost, positive for gain
  manaChange?: number; // Negative for cost, positive for gain
  gainedSkill?: Skill; // Optional: If a new skill was learned/gained
  xpGained?: number; // Optional: XP awarded by AI for the action/event
  reputationChange?: ReputationChange; // Optional: Reputation change awarded by AI
  npcRelationshipChange?: NpcRelationshipChange; // Optional: NPC Relationship change awarded by AI
  // Crafting-related fields can be added if needed, but outcome might be part of narration/gameState
  // craftedItem?: CraftedItemResult;
}

export interface SavedAdventure {
    id: string;
    saveTimestamp: number;
    characterName: string;
    character: Character; // Includes XP, Level, Reputation, stamina/mana, skill tree, stage, learned skills, NPC relationships
    adventureSettings: AdventureSettings; // Includes custom settings if applicable
    storyLog: StoryLogEntry[];
    currentGameStateString: string;
    inventory: InventoryItem[]; // Store full item objects
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
  inventory: InventoryItem[]; // Use the updated type
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
    const knowledgeBonus = knowledge.includes("Magic") || knowledge.includes("Arcana") || knowledge.includes("Healing") ? 20 : 0; // Expanded check
    // Add bonus from a potential 'Intelligence' stat later if needed
    return baseMana + knowledgeBonus;
};

// Export this function
export const calculateXpToNextLevel = (level: number): number => {
    // Example formula: Exponential growth
    return Math.floor(100 * Math.pow(1.5, level -1));
};

// --- Starter Skill Definitions ---
const COMMON_STARTER_SKILL: Skill = { name: "Observe", description: "Carefully examine your surroundings.", type: 'Starter' };

const CLASS_STARTER_SKILLS: Record<string, Skill[]> = {
    "Warrior": [
        { name: "Basic Strike", description: "A simple physical attack.", type: 'Starter', staminaCost: 5 },
        { name: "Shield Block", description: "Raise your shield to deflect an incoming attack.", type: 'Starter', staminaCost: 10 }
    ],
    "Mage": [
        { name: "Zap", description: "Hurl a small bolt of arcane energy.", type: 'Starter', manaCost: 5 },
        { name: "Mana Shield", description: "Expend mana to create a temporary magical barrier.", type: 'Starter', manaCost: 10 }
    ],
    "Rogue": [
        { name: "Sneak", description: "Attempt to move silently or hide.", type: 'Starter', staminaCost: 5 },
        { name: "Quick Strike", description: "A fast dagger attack.", type: 'Starter', staminaCost: 5 }
    ],
    "Scholar": [
        { name: "Analyze", description: "Examine an object or creature for weaknesses or details.", type: 'Starter' },
        { name: "Distract", description: "Use words or a minor illusion to divert attention.", type: 'Starter', manaCost: 5 }
    ],
    "Hunter": [
        { name: "Track", description: "Look for signs of passage or nearby creatures.", type: 'Starter' },
        { name: "Aimed Shot", description: "Take careful aim for a more accurate ranged attack.", type: 'Starter', staminaCost: 10 }
    ],
    "Healer": [
        { name: "Minor Heal", description: "Restore a small amount of health.", type: 'Starter', manaCost: 10 },
        { name: "Ward", description: "Place a protective ward against minor harm.", type: 'Starter', manaCost: 5 }
    ],
    "Bard": [
        { name: "Inspire", description: "Bolster courage or morale with a short performance.", type: 'Starter', manaCost: 5 },
        { name: "Distract", description: "Use music or performance to divert attention.", type: 'Starter', manaCost: 5 }
    ],
    "Tinkerer": [ // Added Tinkerer for skill tree example
        { name: "Jury-Rig", description: "Attempt a temporary fix on a broken item.", type: 'Starter', staminaCost: 5 },
        { name: "Identify Device", description: "Try to understand the function of a mechanism.", type: 'Starter' }
    ],
    // Add more classes and their specific starter skills here
    "Default": [ // Fallback for Adventurer or unknown classes
        { name: "Basic Strike", description: "A simple physical attack.", type: 'Starter', staminaCost: 5 },
        { name: "First Aid", description: "Attempt to patch up minor wounds.", type: 'Starter', staminaCost: 10 }
    ],
};

function getStarterSkillsForClass(className: string): Skill[] {
    const classSkills = CLASS_STARTER_SKILLS[className] || CLASS_STARTER_SKILLS["Default"];
    return [COMMON_STARTER_SKILL, ...classSkills];
}

// --- Initial State ---
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
  level: 1,
  xp: 0,
  xpToNextLevel: calculateXpToNextLevel(1),
  reputation: {}, // Starts with no reputation
  npcRelationships: {}, // Starts with no NPC relationships
  skillTree: null, // Starts with no skill tree
  skillTreeStage: 0, // Starts at stage 0
  learnedSkills: getStarterSkillsForClass("Adventurer"), // Assign default starter skills initially
};

const initialInventory: InventoryItem[] = [
    { name: "Basic Clothes", description: "Simple, slightly worn clothes.", quality: "Poor", weight: 1 },
    { name: "Crusty Bread", description: "A piece of somewhat stale bread.", quality: "Poor", weight: 0.5 }
];

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
  inventory: [], // Start with empty inventory, populated on new game
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
  | { type: "UPDATE_NARRATION"; payload: StoryLogEntry } // Updated payload structure might be needed for inventory
  | { type: "GRANT_XP"; payload: number } // New action for granting XP
  | { type: "LEVEL_UP"; payload: { newLevel: number; newXpToNextLevel: number /* Add rewards here later */ } } // New action for leveling up
  | { type: "UPDATE_REPUTATION"; payload: ReputationChange } // New action for updating reputation
  | { type: "UPDATE_NPC_RELATIONSHIP"; payload: NpcRelationshipChange } // New action for updating NPC relationship
  | { type: "END_ADVENTURE"; payload: { summary: string | null; finalNarration?: StoryLogEntry } }
  | { type: "RESET_GAME" }
  | { type: "LOAD_SAVED_ADVENTURES"; payload: SavedAdventure[] }
  | { type: "SAVE_CURRENT_ADVENTURE" }
  | { type: "LOAD_ADVENTURE"; payload: string }
  | { type: "DELETE_ADVENTURE"; payload: string }
  | { type: "SET_SKILL_TREE_GENERATING"; payload: boolean } // Action to set generation status
  | { type: "SET_SKILL_TREE"; payload: { class: string; skillTree: SkillTree } } // Action to set the generated skill tree and class
  | { type: "CHANGE_CLASS_AND_RESET_SKILLS"; payload: { newClass: string; newSkillTree: SkillTree } } // Action to change class and reset skills/stage
  | { type: "PROGRESS_SKILL_STAGE"; payload: number } // Action to update skill stage
  | { type: "ADD_ITEM"; payload: InventoryItem } // Action to add an item
  | { type: "REMOVE_ITEM"; payload: { itemName: string; quantity?: number } } // Action to remove item(s)
  | { type: "UPDATE_ITEM"; payload: { itemName: string; updates: Partial<InventoryItem> } } // Action to update item properties
  | { type: "UPDATE_INVENTORY"; payload: InventoryItem[] }; // Action to replace the whole inventory

// --- Helper Functions ---
function generateAdventureId(): string {
    return `adv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// --- Reducer ---

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
       const characterClass = action.payload.class ?? initialCharacterState.class;
       const starterSkills = getStarterSkillsForClass(characterClass); // Get class-specific starter skills
       const initialLevel = 1;
       const initialXpToNext = calculateXpToNextLevel(initialLevel);

      const newCharacter: Character = {
        ...initialCharacterState, // Use spread of initialCharacterState to ensure all fields are present
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
        level: initialLevel, // Start at level 1
        xp: 0, // Start with 0 XP
        xpToNextLevel: initialXpToNext, // XP needed for level 2
        reputation: {}, // Starts with no reputation
        npcRelationships: {}, // Starts with no NPC relationships
        skillTree: null, // Starts with no skill tree
        skillTreeStage: 0, // Starts at stage 0
        learnedSkills: starterSkills, // Assign dynamic starter skills
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
        inventory: [], // Start new character with empty inventory (will be populated in START_GAMEPLAY)
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
             // Include XP, level, etc. if they are in payload, otherwise keep existing
             level: action.payload.level ?? state.character.level,
             xp: action.payload.xp ?? state.character.xp,
             xpToNextLevel: action.payload.xpToNextLevel ?? state.character.xpToNextLevel,
             reputation: action.payload.reputation ?? state.character.reputation,
             npcRelationships: action.payload.npcRelationships ?? state.character.npcRelationships, // Add NPC relationships
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
      const startingItems = state.currentAdventureId ? state.inventory : initialInventory; // Load saved inventory or use defaults
      const currentStage = state.character.skillTreeStage;
      const stageName = currentStage >= 0 && state.character.skillTree && state.character.skillTree.stages[currentStage]
          ? state.character.skillTree.stages[currentStage].stageName
          : `Stage ${currentStage}`;
      const skillTreeSummary = state.character.skillTree
          ? `Class: ${state.character.skillTree.className} (${stageName} - Stage ${currentStage}/4)`
          : "No skill tree assigned yet.";
      const aiDescString = state.character.aiGeneratedDescription ? `\nAI Profile: ${state.character.aiGeneratedDescription}` : "";
      const progressionSummary = `Level: ${state.character.level} (${state.character.xp}/${state.character.xpToNextLevel} XP)`;
      const repSummary = Object.entries(state.character.reputation).map(([faction, score]) => `${faction}: ${score}`).join(', ') || 'None';
      const npcRelSummary = Object.entries(state.character.npcRelationships).map(([npc, score]) => `${npc}: ${score}`).join(', ') || 'None'; // Add NPC relationship summary
      const inventoryString = startingItems.length > 0 ? startingItems.map(item => `${item.name}${item.quality ? ` (${item.quality})` : ''}`).join(', ') : 'Empty';


      let adventureDetails = `Adventure Mode: ${state.adventureSettings.adventureType}, ${state.adventureSettings.permanentDeath ? 'Permadeath' : 'Respawn'}`;
      if (state.adventureSettings.adventureType === "Custom") {
          adventureDetails += `\nWorld: ${state.adventureSettings.worldType || '?'}\nQuest: ${state.adventureSettings.mainQuestline || '?'}\nDifficulty: ${state.adventureSettings.difficulty || '?'}`;
      }

       const initialGameState = `Location: Starting Point\nInventory: ${inventoryString}\nStatus: Healthy (STA: ${state.character.currentStamina}/${state.character.maxStamina}, MANA: ${state.character.currentMana}/${state.character.maxMana})\nTime: Day 1, Morning\nQuest: None\nMilestones: None\nCharacter Name: ${state.character.name}\n${progressionSummary}\nReputation: ${repSummary}\nNPC Relationships: ${npcRelSummary}\nClass: ${state.character.class}\nTraits: ${state.character.traits.join(', ') || 'None'}\nKnowledge: ${state.character.knowledge.join(', ') || 'None'}\nBackground: ${state.character.background || 'None'}\nStats: STR ${state.character.stats.strength}, STA ${state.character.stats.stamina}, AGI ${state.character.stats.agility}\nDescription: ${charDesc}${aiDescString}\n${adventureDetails}\n${skillTreeSummary}\nLearned Skills: ${state.character.learnedSkills.map(s => s.name).join(', ') || 'None'}`;

      const adventureId = state.currentAdventureId || generateAdventureId();

      return {
        ...state,
        status: "Gameplay",
        storyLog: state.currentAdventureId ? state.storyLog : [],
        currentNarration: state.currentAdventureId ? state.currentNarration : null,
        adventureSummary: null,
        inventory: startingItems, // Use loaded or default items
        currentGameStateString: state.currentAdventureId ? state.currentGameStateString : initialGameState,
        currentAdventureId: adventureId,
        isGeneratingSkillTree: state.currentAdventureId ? state.isGeneratingSkillTree : false,
        character: {
            ...state.character,
            skillTree: state.currentAdventureId ? state.character.skillTree : state.character.skillTree,
            skillTreeStage: state.currentAdventureId ? state.character.skillTreeStage : state.character.skillTreeStage,
             // Ensure stamina/mana are full on new game start or loaded
             currentStamina: state.currentAdventureId ? state.character.currentStamina : state.character.maxStamina,
             currentMana: state.currentAdventureId ? state.character.currentMana : state.character.maxMana,
             learnedSkills: state.currentAdventureId ? state.character.learnedSkills : state.character.learnedSkills,
             // Progression fields are loaded from save or initialized in CREATE_CHARACTER
             level: state.currentAdventureId ? state.character.level : state.character.level,
             xp: state.currentAdventureId ? state.character.xp : state.character.xp,
             xpToNextLevel: state.currentAdventureId ? state.character.xpToNextLevel : state.character.xpToNextLevel,
             reputation: state.currentAdventureId ? state.character.reputation : state.character.reputation,
             npcRelationships: state.currentAdventureId ? state.character.npcRelationships : {}, // Load or initialize relationships

        }
      };
    }
    case "UPDATE_NARRATION": {
        const newLogEntry: StoryLogEntry = { ...action.payload, timestamp: action.payload.timestamp || Date.now() };
        const newLog = [...state.storyLog, newLogEntry];
        let charAfterNarration = state.character;
        let inventoryAfterNarration = state.inventory; // Start with current inventory

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

            // Process XP gain (defer level up check to GRANT_XP action)
            const xpGained = newLogEntry.xpGained ?? 0;
            const currentXp = state.character.xp + xpGained;

             // Process reputation change
             let updatedReputation = state.character.reputation;
             if (newLogEntry.reputationChange) {
                 const { faction, change } = newLogEntry.reputationChange;
                 const currentScore = updatedReputation[faction] ?? 0;
                 const newScore = Math.max(-100, Math.min(100, currentScore + change)); // Clamp between -100 and 100
                 updatedReputation = { ...updatedReputation, [faction]: newScore };
                 console.log(`Reputation changed for ${faction}: ${currentScore} -> ${newScore}`);
             }

             // Process NPC relationship change
             let updatedNpcRelationships = state.character.npcRelationships;
             if (newLogEntry.npcRelationshipChange) {
                const { npcName, change } = newLogEntry.npcRelationshipChange;
                const currentScore = updatedNpcRelationships[npcName] ?? 0;
                const newScore = Math.max(-100, Math.min(100, currentScore + change)); // Clamp
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
                currentMana: newCurrentMana, // Ensure currentMana is updated
                traits: newLogEntry.updatedTraits ?? state.character.traits,
                learnedSkills: newLearnedSkills,
                xp: currentXp, // Update XP here
                reputation: updatedReputation, // Update reputation
                npcRelationships: updatedNpcRelationships, // Update relationships
                 // Class, level, xpToNextLevel are handled separately by other actions
            };
            console.log("Character updated via narration:", { stats: newLogEntry.updatedStats, traits: newLogEntry.updatedTraits, knowledge: newLogEntry.updatedKnowledge, staminaChange, manaChange, gainedSkill: newLogEntry.gainedSkill?.name, xpGained, reputationChange: newLogEntry.reputationChange, npcRelationshipChange: newLogEntry.npcRelationshipChange });
        }

        console.log("Narration updated. Inventory state relies on subsequent actions or gameState parsing.");


        return {
            ...state,
            character: charAfterNarration,
            currentNarration: newLogEntry,
            storyLog: newLog,
            inventory: inventoryAfterNarration, // Keep current inventory unless explicitly changed
            currentGameStateString: action.payload.updatedGameState,
        };
    }
     case "GRANT_XP": {
         if (!state.character) return state;
         const newXp = state.character.xp + action.payload;
         const xpNeeded = state.character.xpToNextLevel;
         console.log(`Granted ${action.payload} XP. Current XP: ${newXp}/${xpNeeded}`);
         // Level up check logic is separate (dispatched by Gameplay component after this)
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
         // TODO: Apply level up rewards (e.g., stat points, skill points) based on payload later
         const remainingXp = Math.max(0, state.character.xp - state.character.xpToNextLevel); // XP carried over
        return {
            ...state,
            character: {
                ...state.character,
                level: action.payload.newLevel,
                xp: remainingXp,
                xpToNextLevel: action.payload.newXpToNextLevel,
                // TODO: Apply stat increases, potentially increase maxStamina/maxMana and refill them?
                 // Maybe automatically refill stamina/mana on level up?
                 currentStamina: state.character.maxStamina, // Refill stamina
                 currentMana: state.character.maxMana, // Refill mana
            },
        };
    }
     case "UPDATE_REPUTATION": {
         if (!state.character) return state;
         const { faction, change } = action.payload;
         const currentScore = state.character.reputation[faction] ?? 0;
         const newScore = Math.max(-100, Math.min(100, currentScore + change)); // Clamp
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
         const newScore = Math.max(-100, Math.min(100, currentScore + change)); // Clamp
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
        // let finalInventoryNames = state.inventory.map(i => i.name); // Not needed anymore
        let finalCharacterState = state.character;
        let finalInventoryState = state.inventory; // Keep the full inventory objects

        // Apply updates from the very last narration step if provided
        if (action.payload.finalNarration && (!state.currentNarration || action.payload.finalNarration.narration !== state.currentNarration.narration)) {
            const finalEntry: StoryLogEntry = { ...action.payload.finalNarration, timestamp: action.payload.finalNarration.timestamp || Date.now() };
            finalLog.push(finalEntry);
            finalGameState = action.payload.finalNarration.updatedGameState;
            // Inventory updates are handled via specific actions, not directly from final narration payload usually

            if (state.character) {
                 // Apply final character updates from the last narration step
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
                    npcRelationships: finalNpcRelationships, // Include final relationships
                };
            }
            console.log("Added final narration entry to log and applied final character updates.");
        } else {
            console.log("Final narration not added or same as current.");
        }

        // finalInventoryState is the inventory *before* the end is processed
        let updatedSavedAdventures = state.savedAdventures;
        // Automatically save the ended adventure
        if (finalCharacterState && state.currentAdventureId) {
            const endedAdventure: SavedAdventure = {
                id: state.currentAdventureId,
                saveTimestamp: Date.now(),
                characterName: finalCharacterState.name,
                character: finalCharacterState, // Save the final state including progression
                adventureSettings: state.adventureSettings, // Save current settings
                storyLog: finalLog,
                currentGameStateString: finalGameState,
                inventory: finalInventoryState, // Save the inventory as it was at the end
                statusBeforeSave: "AdventureSummary", // Mark as ended
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
            storyLog: finalLog, // Keep the log for the summary screen
            inventory: finalInventoryState, // Keep final inventory for summary
            currentNarration: null, // Clear current narration
            savedAdventures: updatedSavedAdventures,
            isGeneratingSkillTree: false,
            // currentAdventureId is kept so the summary knows which adventure it was
        };
    }
    case "RESET_GAME": {
       const saved = state.savedAdventures; // Keep saved adventures
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
        character: state.character, // Save current character state including progression
        adventureSettings: state.adventureSettings, // Save current settings
        storyLog: state.storyLog,
        currentGameStateString: state.currentGameStateString,
        inventory: state.inventory, // Save full inventory objects
        statusBeforeSave: state.status, // Save the status before saving (should be Gameplay)
        adventureSummary: state.adventureSummary, // Usually null when saving during gameplay
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
           // Ensure all required fields have values
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
            // Progression fields with defaults
           level: typeof adventureToLoad.character?.level === 'number' ? adventureToLoad.character.level : 1,
           xp: typeof adventureToLoad.character?.xp === 'number' ? adventureToLoad.character.xp : 0,
           xpToNextLevel: typeof adventureToLoad.character?.xpToNextLevel === 'number' ? adventureToLoad.character.xpToNextLevel : calculateXpToNextLevel(adventureToLoad.character?.level ?? 1),
           reputation: typeof adventureToLoad.character?.reputation === 'object' && adventureToLoad.character.reputation !== null ? adventureToLoad.character.reputation : {},
           npcRelationships: typeof adventureToLoad.character?.npcRelationships === 'object' && adventureToLoad.character.npcRelationships !== null ? adventureToLoad.character.npcRelationships : {}, // Load or default relationships
           // Skill tree and learned skills validation
           skillTree: adventureToLoad.character?.skillTree ? {
               ...adventureToLoad.character.skillTree,
                className: adventureToLoad.character.skillTree.className || adventureToLoad.character.class || "Adventurer", // Ensure class name is set
               stages: (Array.isArray(adventureToLoad.character.skillTree.stages) ? adventureToLoad.character.skillTree.stages : []).map((stage, index) => ({
                    stage: typeof stage.stage === 'number' ? stage.stage : index, // Provide default stage number if missing
                    stageName: stage.stageName || `Stage ${stage.stage ?? index}`, // Default stage name if missing
                     skills: (Array.isArray(stage.skills) ? stage.skills : []).map(skill => ({ // Validate skills within stage
                        name: skill.name || "Unknown Skill",
                        description: skill.description || "",
                        type: skill.type || 'Learned',
                        manaCost: typeof skill.manaCost === 'number' ? skill.manaCost : undefined,
                        staminaCost: typeof skill.staminaCost === 'number' ? skill.staminaCost : undefined,
                    })),
               })).slice(0, 5) // Ensure only 5 stages
           } : null,
           skillTreeStage: typeof adventureToLoad.character?.skillTreeStage === 'number' ? adventureToLoad.character.skillTreeStage : 0,
           learnedSkills: (Array.isArray(adventureToLoad.character?.learnedSkills) && adventureToLoad.character.learnedSkills.length > 0)
                ? adventureToLoad.character.learnedSkills.map(skill => ({ // Validate learned skills
                     name: skill.name || "Unknown Skill",
                     description: skill.description || "",
                     type: skill.type || 'Learned',
                     manaCost: typeof skill.manaCost === 'number' ? skill.manaCost : undefined,
                     staminaCost: typeof skill.staminaCost === 'number' ? skill.staminaCost : undefined,
                  }))
                : getStarterSkillsForClass(adventureToLoad.character?.class || "Adventurer"), // Provide default starter skills if missing
           aiGeneratedDescription: adventureToLoad.character?.aiGeneratedDescription ?? undefined,
       };

      // Load inventory with defaults for missing properties
      const validatedInventory = (Array.isArray(adventureToLoad.inventory) ? adventureToLoad.inventory : []).map(item => ({
           name: item.name || "Unknown Item",
           description: item.description || "An item of unclear origin.", // Default description
           weight: typeof item.weight === 'number' ? item.weight : 1, // Default weight
           quality: item.quality || "Common", // Default quality
           durability: typeof item.durability === 'number' ? item.durability : undefined,
           magicalEffect: item.magicalEffect || undefined,
       }));


      // If loading an adventure that was previously finished (on summary screen)
      if (adventureToLoad.statusBeforeSave === "AdventureSummary") {
          return {
              ...initialState, // Start fresh but keep saved adventures list
              savedAdventures: state.savedAdventures,
              status: "AdventureSummary", // Go directly to summary
              character: validatedCharacter, // Load the character state as it was at the end
              adventureSummary: adventureToLoad.adventureSummary,
              storyLog: adventureToLoad.storyLog, // Show the full log
              inventory: validatedInventory, // Show final inventory
              currentAdventureId: adventureToLoad.id,
              adventureSettings: adventureToLoad.adventureSettings, // Load settings for context
              isGeneratingSkillTree: false,
          };
      } else {
          // Loading an adventure that was in progress
          return {
              ...initialState, // Start fresh but keep saved adventures list
              savedAdventures: state.savedAdventures,
              status: "Gameplay", // Resume gameplay
              character: validatedCharacter, // Load the character state
              adventureSettings: adventureToLoad.adventureSettings, // Load settings
              storyLog: adventureToLoad.storyLog,
              inventory: validatedInventory, // Load inventory
              currentGameStateString: adventureToLoad.currentGameStateString,
              currentNarration: adventureToLoad.storyLog.length > 0 ? adventureToLoad.storyLog[adventureToLoad.storyLog.length - 1] : null, // Set current narration
              adventureSummary: null, // No summary for ongoing game
              currentAdventureId: adventureToLoad.id,
              isGeneratingSkillTree: false, // Assume tree is generated or will be triggered if needed
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
          if (stages.length !== 5) {
             console.error(`Reducer: Received skill tree for new class with ${stages.length} stages, expected 5. Aborting class change.`);
             return { ...state, isGeneratingSkillTree: false }; // Stop loading
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

         const newValidatedSkillTree: SkillTree = {
            ...action.payload.newSkillTree,
            className: action.payload.newClass,
            stages: validatedStages
         };

          // Get starter skills for the *new* class
         const starterSkills = getStarterSkillsForClass(action.payload.newClass);

         return {
             ...state,
             character: {
                 ...state.character,
                 class: action.payload.newClass,
                 skillTree: newValidatedSkillTree,
                 skillTreeStage: 0, // Reset stage to 0
                 learnedSkills: starterSkills, // Assign starter skills for the new class
                 // Keep existing stats, level, xp, reputation, etc. upon class change
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
    // --- Inventory Actions ---
    case "ADD_ITEM": {
        // Simple add, assuming quantity 1 for now
        const newItem = {
            description: "An item acquired during your journey.", // Default description
            quality: "Common" as ItemQuality, // Default quality
            weight: 1, // Default weight
            ...action.payload, // Allow overwriting defaults
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
        // Validate items in the payload
        const validatedNewInventory = action.payload.map(item => ({
            name: item.name || "Unknown Item",
            description: item.description || "An item of unclear origin.",
            weight: typeof item.weight === 'number' ? item.weight : 1,
            quality: item.quality || "Common",
            durability: typeof item.durability === 'number' ? item.durability : undefined,
            magicalEffect: item.magicalEffect || undefined,
        }));
        return { ...state, inventory: validatedNewInventory };
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
                     // Validate loaded adventures more thoroughly
                     const validatedAdventures = loadedAdventures.map(adv => {
                         const validatedChar = {
                             ...initialCharacterState, // Start with defaults
                             ...(adv.character || {}), // Load saved data
                             // Ensure critical fields have defaults if missing from save
                             name: adv.character?.name || "Recovered Adventurer",
                             description: adv.character?.description || "",
                             class: adv.character?.class || "Adventurer",
                             traits: Array.isArray(adv.character?.traits) ? adv.character.traits : [],
                             knowledge: Array.isArray(adv.character?.knowledge) ? adv.character.knowledge : [],
                             background: adv.character?.background || "",
                             stats: adv.character?.stats ? { ...initialCharacterState.stats, ...adv.character.stats } : initialCharacterState.stats,
                             maxStamina: typeof adv.character?.maxStamina === 'number' ? adv.character.maxStamina : calculateMaxStamina(adv.character?.stats ?? initialCharacterState.stats),
                             currentStamina: typeof adv.character?.currentStamina === 'number' ? adv.character.currentStamina : (adv.character?.maxStamina ?? calculateMaxStamina(adv.character?.stats ?? initialCharacterState.stats)),
                             maxMana: typeof adv.character?.maxMana === 'number' ? adv.character.maxMana : calculateMaxMana(adv.character?.stats ?? initialCharacterState.stats, adv.character?.knowledge ?? []),
                             currentMana: typeof adv.character?.currentMana === 'number' ? adv.character.currentMana : (adv.character?.maxMana ?? calculateMaxMana(adv.character?.stats ?? initialCharacterState.stats, adv.character?.knowledge ?? [])),
                             // Progression fields validation
                             level: typeof adv.character?.level === 'number' ? adv.character.level : 1,
                             xp: typeof adv.character?.xp === 'number' ? adv.character.xp : 0,
                             xpToNextLevel: typeof adv.character?.xpToNextLevel === 'number' ? adv.character.xpToNextLevel : calculateXpToNextLevel(adv.character?.level ?? 1),
                             reputation: typeof adv.character?.reputation === 'object' && adv.character.reputation !== null ? adv.character.reputation : {},
                             npcRelationships: typeof adv.character?.npcRelationships === 'object' && adv.character.npcRelationships !== null ? adv.character.npcRelationships : {}, // Validate relationships
                             // Skill tree and learned skills validation
                             skillTree: adv.character?.skillTree ? {
                                 ...adv.character.skillTree,
                                 className: adv.character.skillTree.className || adv.character.class || "Adventurer", // Ensure class name is set
                                 stages: (Array.isArray(adv.character.skillTree.stages) ? adv.character.skillTree.stages : []).map((stage, index) => ({
                                     stage: typeof stage.stage === 'number' ? stage.stage : index, // Provide default stage number if missing
                                     stageName: stage.stageName || `Stage ${stage.stage ?? index}`, // Default stage name if missing
                                     skills: (Array.isArray(stage.skills) ? stage.skills : []).map(skill => ({ // Validate skills within stage
                                        name: skill.name || "Unknown Skill",
                                        description: skill.description || "",
                                        type: skill.type || 'Learned',
                                        manaCost: typeof skill.manaCost === 'number' ? skill.manaCost : undefined,
                                        staminaCost: typeof skill.staminaCost === 'number' ? skill.staminaCost : undefined,
                                     })),
                                 })).slice(0, 5) // Ensure only 5 stages
                             } : null,
                             skillTreeStage: typeof adv.character?.skillTreeStage === 'number' ? adv.character.skillTreeStage : 0,
                             learnedSkills: (Array.isArray(adv.character?.learnedSkills) && adv.character.learnedSkills.length > 0)
                                ? adv.character.learnedSkills.map(skill => ({ // Validate learned skills
                                     name: skill.name || "Unknown Skill",
                                     description: skill.description || "",
                                     type: skill.type || 'Learned',
                                     manaCost: typeof skill.manaCost === 'number' ? skill.manaCost : undefined,
                                     staminaCost: typeof skill.staminaCost === 'number' ? skill.staminaCost : undefined,
                                  }))
                                : getStarterSkillsForClass(adv.character?.class || "Adventurer"), // Provide default starter skills if missing
                             aiGeneratedDescription: adv.character?.aiGeneratedDescription ?? undefined,
                         };

                         // Validate inventory items within the loaded adventure
                         const validatedAdvInventory = (Array.isArray(adv.inventory) ? adv.inventory : []).map(item => ({
                              name: item.name || "Unknown Item",
                              description: item.description || "An item of unclear origin.",
                              weight: typeof item.weight === 'number' ? item.weight : 1,
                              quality: item.quality || "Common",
                              durability: typeof item.durability === 'number' ? item.durability : undefined,
                              magicalEffect: item.magicalEffect || undefined,
                          }));


                         return {
                           ...adv,
                           id: adv.id || generateAdventureId(), // Ensure ID exists
                           saveTimestamp: adv.saveTimestamp || Date.now(),
                           characterName: validatedChar.name || "Unnamed Adventurer",
                           character: validatedChar,
                           adventureSettings: { // Ensure defaults for potentially missing custom settings
                               ...initialState.adventureSettings,
                               ...(adv.adventureSettings || {}),
                               adventureType: adv.adventureSettings?.adventureType || null, // Ensure adventureType is valid or null
                           },
                           storyLog: Array.isArray(adv.storyLog) ? adv.storyLog : [],
                           currentGameStateString: adv.currentGameStateString || "",
                           inventory: validatedAdvInventory, // Use validated inventory
                           statusBeforeSave: adv.statusBeforeSave || "Gameplay",
                           adventureSummary: adv.adventureSummary || null,
                         };
                     }).filter(adv => adv.character.name && adv.character.class); // Ensure character has name and class


                    dispatch({ type: "LOAD_SAVED_ADVENTURES", payload: validatedAdventures });
                    console.log(`Loaded ${validatedAdventures.length} valid adventures from storage.`);
                    if (validatedAdventures.length !== loadedAdventures.length) {
                         console.warn("Some saved adventure data was invalid or missing critical data and discarded.");
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
      const reputationString = state.character ? Object.entries(state.character.reputation).map(([f, s]) => `${f}: ${s}`).join(', ') || 'None' : 'N/A';
      const relationshipString = state.character ? Object.entries(state.character.npcRelationships).map(([n, s]) => `${n}: ${s}`).join(', ') || 'None' : 'N/A'; // Log relationships
      const inventoryString = state.inventory.map(i => `${i.name}${i.quality ? ` (${i.quality})` : ''}`).join(', ') || 'Empty';
     console.log("Game State Updated:", {
        status: state.status,
        character: state.character?.name,
        level: state.character?.level,
        xp: `${state.character?.xp}/${state.character?.xpToNextLevel}`,
        reputation: reputationString,
        relationships: relationshipString, // Log relationships
        class: state.character?.class,
        stage: `${currentStageName} (${state.character?.skillTreeStage}/4)`,
        stamina: `${state.character?.currentStamina}/${state.character?.maxStamina}`,
        mana: `${state.character?.currentMana}/${state.character?.maxMana}`,
        adventureId: state.currentAdventureId,
        settings: state.adventureSettings, // Log settings
        inventory: inventoryString, // Log inventory summary
    });
   }, [state]);


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
