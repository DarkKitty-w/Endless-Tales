// src/lib/gameUtils.ts

import type { CharacterStats, Skill } from "@/types/character-types";

/**
 * Calculates the maximum Health Points (HP) based on character's Stamina stat.
 * @param stats - Character's core stats.
 * @returns The maximum HP.
 */
export const calculateMaxHealth = (stats: CharacterStats): number => {
    // Example: Base HP + Stamina stat * multiplier
    return Math.max(10, 20 + stats.stamina * 10);
};

/**
 * Calculates the maximum Action Stamina (for physical actions) based on character's Strength stat.
 * @param stats - Character's core stats.
 * @returns The maximum action stamina points.
 */
export const calculateMaxActionStamina = (stats: CharacterStats): number => {
    // Example: Base Action Stamina + Strength stat * multiplier
    return Math.max(10, 30 + stats.strength * 5);
};

/**
 * Calculates the maximum mana based on character's Wisdom stat and knowledge.
 * @param stats - Character's core stats.
 * @param knowledge - List of character's knowledge areas.
 * @returns The maximum mana points.
 */
export const calculateMaxMana = (stats: CharacterStats, knowledge: string[]): number => {
    const baseMana = 10;
    // Wisdom is now the primary stat for mana
    const wisdomBonus = stats.wisdom * 10;
    const knowledgeBonus = knowledge.some(k => ["Magic", "Arcana", "Healing", "Mysticism", "Lore"].includes(k)) ? 20 : 0;
    return baseMana + wisdomBonus + knowledgeBonus;
};


/** Represents a universally available starter skill. */
export const COMMON_STARTER_SKILL: Skill = { name: "Observe", description: "Carefully examine your surroundings.", type: 'Starter' };

/** Defines starter skills for different character classes. */
export const CLASS_STARTER_SKILLS: Record<string, Skill[]> = {
    "Warrior": [
        { name: "Power Strike", description: "A forceful attack consuming action stamina.", type: 'Starter', staminaCost: 10 },
        { name: "Brace", description: "Prepare for an incoming blow, temporarily increasing resilience.", type: 'Starter', staminaCost: 5 }
    ],
    "Mage": [
        { name: "Arcane Bolt", description: "Launch a bolt of magical energy.", type: 'Starter', manaCost: 10 },
        { name: "Meditate", description: "Focus to slowly recover mana.", type: 'Starter' }
    ],
    "Rogue": [
        { name: "Swift Strike", description: "A quick attack that costs less action stamina.", type: 'Starter', staminaCost: 5 },
        { name: "Stealth", description: "Attempt to become less conspicuous.", type: 'Starter', staminaCost: 5 }
    ],
    "Scholar": [ // Wisdom-based class
        { name: "Insightful Analysis", description: "Use wisdom to uncover hidden details or weaknesses.", type: 'Starter', manaCost: 5 },
        { name: "Recall Lore", description: "Tap into your knowledge on a subject.", type: 'Starter' }
    ],
     "Adventurer": [ 
        { name: "Basic Strike", description: "A simple physical attack.", type: 'Starter', staminaCost: 5 },
        { name: "First Aid", description: "Attempt to patch up minor wounds.", type: 'Starter', staminaCost: 10 }
    ],
     "admin000": [ 
        { name: "Dev Power", description: "Access developer abilities.", type: 'Starter' },
    ],
    // Add more classes and their Wisdom/Strength/Stamina based skills
};

/**
 * Retrieves the list of starter skills for a given character class.
 * @param className - The name of the character class.
 * @returns An array of Skill objects, including the common 'Observe' skill.
 */
export function getStarterSkillsForClass(className: string): Skill[] {
    const classSkills = CLASS_STARTER_SKILLS[className] || CLASS_STARTER_SKILLS["Adventurer"]; 
    const skills = [COMMON_STARTER_SKILL, ...classSkills];
    return Array.from(new Map(skills.map(skill => [skill.name, skill])).values());
}

/**
 * Calculates the amount of XP required to reach the next level.
 * @param currentLevel - The character's current level.
 * @returns The total XP needed for the next level.
 */
export const calculateXpToNextLevel = (currentLevel: number): number => {
  const baseXP = 100;
  return Math.floor(baseXP + (currentLevel -1) * 50 + Math.pow(currentLevel -1, 2.2) * 10);
};

/**
 * Generates a unique ID for new adventures.
 * @returns A unique string identifier.
 */
export function generateAdventureId(): string {
    return `adv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
