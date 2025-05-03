// src/types/game-types.ts

import type { GenerateCharacterDescriptionOutput } from "@/ai/flows/generate-character-description";

/** Defines the possible states the game can be in. */
export type GameStatus =
  | "MainMenu"
  | "CharacterCreation"
  | "AdventureSetup"
  | "Gameplay"
  | "AdventureSummary"
  | "ViewSavedAdventures";

/** Represents a single skill a character can possess or learn. */
export interface Skill {
    name: string;
    description: string;
    type?: 'Starter' | 'Learned'; // Indicate if it's a starter skill or learned
    manaCost?: number; // Optional mana cost
    staminaCost?: number; // Optional stamina cost
}

/** Represents a single stage within a skill tree. */
export interface SkillTreeStage {
    stage: number; // 0-4
    stageName: string; // e.g., "Potential", "Apprentice", "Knight", "Initiate", "Master", "Grandmaster"
    skills: Skill[]; // Skills *available* at this stage (not necessarily learned yet)
}

/** Represents the entire skill tree for a character class. */
export interface SkillTree {
    className: string; // The class this tree belongs to
    stages: SkillTreeStage[]; // Array containing 5 stages (0-4)
}

/** Holds the core statistical attributes of a character. */
export interface CharacterStats {
  strength: number;
  stamina: number; // Base stamina stat affecting max stamina
  agility: number;
}

/** Tracks reputation scores with various factions. */
export type Reputation = Record<string, number>; // Faction name -> Score (-100 to 100)

/** Tracks relationship scores with specific NPCs. */
export type NpcRelationships = Record<string, number>; // NPC Name -> Score (-100 to 100)

/** Represents the player character. */
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

/** Settings for the current adventure. */
export interface AdventureSettings {
  adventureType: "Randomized" | "Custom" | null;
  permanentDeath: boolean;
  difficulty: string; // Now mandatory, used for challenge modes
  // Fields for Custom Adventure
  worldType?: string;
  mainQuestline?: string;
}

/** Defines the possible quality levels for items. */
export type ItemQuality = "Poor" | "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";

/** Represents an item in the character's inventory. */
export interface InventoryItem {
    name: string;
    description: string; // Make description mandatory
    weight?: number; // Optional weight
    durability?: number; // Optional durability (e.g., 0-100)
    magicalEffect?: string; // Optional description of magical effects
    quality?: ItemQuality; // Optional quality level
}

/** Represents a change in reputation with a faction. */
export interface ReputationChange {
    faction: string;
    change: number; // Positive or negative change amount
}

/** Represents a change in relationship score with an NPC. */
export interface NpcRelationshipChange {
    npcName: string;
    change: number; // Positive or negative change amount
}

/** Represents the outcome of a crafting attempt. */
export interface CraftedItemResult {
    success: boolean;
    item?: InventoryItem; // The crafted item if successful
    message: string; // Message about the crafting attempt
}

/** Represents a single entry in the adventure's story log. */
export interface StoryLogEntry {
  narration: string;
  updatedGameState: string;
  // Character progression updates from AI
  updatedStats?: Partial<CharacterStats>;
  updatedTraits?: string[];
  updatedKnowledge?: string[];
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
}

/** Represents a saved adventure state. */
export interface SavedAdventure {
    id: string;
    saveTimestamp: number;
    characterName: string;
    character: Character; // Includes XP, Level, Reputation, stamina/mana, skill tree, stage, learned skills, NPC relationships
    adventureSettings: AdventureSettings; // Includes custom settings and difficulty
    storyLog: StoryLogEntry[];
    currentGameStateString: string;
    inventory: InventoryItem[]; // Store full item objects
    statusBeforeSave?: GameStatus;
    adventureSummary?: string | null;
    turnCount?: number; // Added turn count for potential dynamic events
}

/** Represents the overall state of the game application. */
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
  turnCount: number; // Track turns for potential dynamic events
}
