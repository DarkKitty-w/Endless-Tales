// src/lib/gameUtils.ts

import type { CharacterStats, Skill } from "@/types/character-types"; // Import from character types

/**
 * Calculates the maximum stamina based on character stats.
 * @param stats - Character's core stats.
 * @returns The maximum stamina points.
 */
export const calculateMaxStamina = (stats: CharacterStats): number => {
    return Math.max(10, stats.stamina * 10 + 20); // Example calculation: base 20 + 10 per stamina point
};

/**
 * Calculates the maximum mana based on character stats and knowledge.
 * @param stats - Character's core stats.
 * @param knowledge - List of character's knowledge areas.
 * @returns The maximum mana points.
 */
export const calculateMaxMana = (stats: CharacterStats, knowledge: string[]): number => {
    const baseMana = 10;
    const knowledgeBonus = knowledge.includes("Magic") || knowledge.includes("Arcana") || knowledge.includes("Healing") ? 20 : 0; // Expanded check
    // Add bonus from a potential 'Intelligence' stat later if needed
    return baseMana + knowledgeBonus;
};

/** Represents a universally available starter skill. */
export const COMMON_STARTER_SKILL: Skill = { name: "Observe", description: "Carefully examine your surroundings.", type: 'Starter' };

/** Defines starter skills for different character classes. */
export const CLASS_STARTER_SKILLS: Record<string, Skill[]> = {
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
    "Tinkerer": [
        { name: "Jury-Rig", description: "Attempt a temporary fix on a broken item.", type: 'Starter', staminaCost: 5 },
        { name: "Identify Device", description: "Try to understand the function of a mechanism.", type: 'Starter' }
    ],
     "Adventurer": [ // Fallback for Adventurer or unknown classes
        { name: "Basic Strike", description: "A simple physical attack.", type: 'Starter', staminaCost: 5 },
        { name: "First Aid", description: "Attempt to patch up minor wounds.", type: 'Starter', staminaCost: 10 }
    ],
};

/**
 * Retrieves the list of starter skills for a given character class.
 * @param className - The name of the character class.
 * @returns An array of Skill objects, including the common 'Observe' skill.
 */
export function getStarterSkillsForClass(className: string): Skill[] {
    const classSkills = CLASS_STARTER_SKILLS[className] || CLASS_STARTER_SKILLS["Adventurer"]; // Use Adventurer as default
    // Ensure Observe is always included and prevent duplicates if class already has it
    const skills = [COMMON_STARTER_SKILL, ...classSkills];
    return Array.from(new Map(skills.map(skill => [skill.name, skill])).values());
}

/**
 * Calculates the amount of XP required to reach the next level.
 * @param currentLevel - The character's current level.
 * @returns The total XP needed for the next level.
 */
export const calculateXpToNextLevel = (currentLevel: number): number => {
  // Example: Simple exponential curve (adjust as needed)
  const baseXP = 100;
  const scalingFactor = 1.5;
  return Math.floor(baseXP * Math.pow(scalingFactor, currentLevel - 1));
};

/**
 * Generates a unique ID for new adventures.
 * @returns A unique string identifier.
 */
export function generateAdventureId(): string {
    return `adv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
