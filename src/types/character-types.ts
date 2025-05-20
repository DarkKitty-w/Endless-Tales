// src/types/character-types.ts

/** Represents the core statistical attributes of a character. */
export interface CharacterStats {
    strength: number; // Affects action stamina pool
    stamina: number;  // Affects Health Points (HP)
    wisdom: number;   // Affects Mana pool and intellectual capabilities
}

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

/** Tracks reputation scores with various factions. */
export type Reputation = Record<string, number>; // Faction name -> Score (-100 to 100)

/** Tracks relationship scores with specific NPCs. */
export type NpcRelationships = Record<string, number>; // NPC Name -> Score (-100 to 100)

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

/** Represents the player character. */
export interface Character {
  name: string;
  description: string; // User's description or AI-generated one if they used the button
  class: string; // Character class (e.g., Warrior, Mage) - Now mandatory
  traits: string[];
  knowledge: string[];
  background: string;
  stats: CharacterStats; // Use imported CharacterStats type
  aiGeneratedDescription?: string; // Separate storage for AI's expansion

  // Resource Pools
  maxHealth: number; // New: Represents HP, derived from Stamina stat
  currentHealth: number; // New: Current HP
  maxStamina: number; // Renamed from actionStamina, derived from Strength stat
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
