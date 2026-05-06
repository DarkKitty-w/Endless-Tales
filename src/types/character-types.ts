// src/types/character-types.ts

/** Represents the core statistical attributes of a character. */
export interface CharacterStats {
    strength: number;
    stamina: number;
    wisdom: number;
}

/** Represents a single skill a character can possess or learn. */
export interface Skill {
    name: string;
    description: string;
    type?: 'Starter' | 'Learned';
    manaCost?: number;
    staminaCost?: number;
}

/** Represents a single stage within a skill tree. */
export interface SkillTreeStage {
    stage: number;
    stageName: string;
    skills: Skill[];
}

/** Represents the entire skill tree for a character class. */
export interface SkillTree {
    className: string;
    stages: SkillTreeStage[];
    // ERR-8/ERR-11: Track if fallback was used and preserve raw AI response
    usedFallback?: boolean;
    rawResponse?: string;
}

/** Tracks reputation scores with various factions. */
export type Reputation = Record<string, number>;

/** Tracks relationship scores with specific NPCs. */
export type NpcRelationships = Record<string, number>;

/** Represents a change in reputation with a faction. */
export interface ReputationChange {
    faction: string;
    change: number;
}

/** Represents a change in relationship score with an NPC. */
export interface NpcRelationshipChange {
    npcName: string;
    change: number;
}

/** A temporary status effect applied to the character. */
export interface StatusEffect {
    id: string;
    name: string;
    description: string;
    remainingTurns: number;
    // Modifiers can be added later
    statModifiers?: Partial<CharacterStats>;
}

/** Represents the player character. */
export interface Character {
    name: string;
    description: string;
    class: string;
    traits: string[];
    knowledge: string[];
    background: string;
    stats: CharacterStats;
    aiGeneratedDescription?: string;

    // Resource Pools
    maxHealth: number;
    currentHealth: number;
    maxStamina: number;
    currentStamina: number;
    maxMana: number;
    currentMana: number;

    // Progression
    level: number;
    xp: number;
    xpToNextLevel: number;
    reputation: Reputation;
    npcRelationships: NpcRelationships;

    skillTree: SkillTree | null;
    skillTreeStage: number;
    learnedSkills: Skill[];

    // Status Effects
    statusEffects: StatusEffect[];
}