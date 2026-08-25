
// src/lib/gameUtils.ts

import type { CharacterStats, Skill } from "../types/character-types";
import {
  XP_REWARD_RANGES,
  DEFAULT_XP_REWARD_RANGE,
  DIFFICULTY_SETTING_XP_MULTIPLIER,
  DEFAULT_DIFFICULTY_XP_MULTIPLIER,
  MAX_XP_PER_EVENT,
  MAX_HEALTH_CHANGE_PER_TURN_FRACTION,
  MAX_STAMINA_CHANGE_PER_TURN,
  MAX_MANA_CHANGE_PER_TURN,
} from "./constants";

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
    // SECURITY: the "admin000" developer class (Dev Power skill) was removed —
    // it was reachable by typing a magic string into the free-form class field.
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

// --- Balance helpers (GAME-BALANCE) ---

/**
 * Returns the XP reward range [min, max] for an assessed action difficulty,
 * scaled by the adventure difficulty setting. Unknown or missing values fall
 * back to Normal-tier rewards with a neutral multiplier, keeping the economy
 * predictable even when the AI omits its assessment.
 *
 * @param assessedDifficulty - Difficulty tier assessed by the AI narrator.
 * @param difficultySetting - Adventure difficulty setting ("Easy"..."Nightmare").
 * @returns A [min, max] tuple of XP to award for the event.
 */
export function getXpRewardRange(
  assessedDifficulty?: string | null,
  difficultySetting?: string | null
): [number, number] {
  const tier = assessedDifficulty ?? "";
  const baseRange = XP_REWARD_RANGES[tier] ?? DEFAULT_XP_REWARD_RANGE;
  const multiplier = DIFFICULTY_SETTING_XP_MULTIPLIER[difficultySetting?.toLowerCase() ?? ""] ?? DEFAULT_DIFFICULTY_XP_MULTIPLIER;
  const scale = (value: number) => Math.max(0, Math.floor(value * multiplier));
  return [scale(baseRange[0]), Math.max(scale(baseRange[0]), scale(baseRange[1]))];
}

/**
 * Clamps a raw xpGained value from the AI into a sane, non-negative integer.
 * Prevents runaway rewards (or punishments) from breaking progression.
 *
 * @param xp - Raw XP value returned by the AI.
 * @returns An integer between 0 and MAX_XP_PER_EVENT.
 */
export function clampXpGained(xp: unknown): number {
  if (typeof xp !== "number" || !Number.isFinite(xp)) return 0;
  return Math.max(0, Math.min(MAX_XP_PER_EVENT, Math.floor(xp)));
}

/**
 * Clamps a single narration resource change so one turn can never swing a
 * resource by more than the tuned per-turn cap. Deltas beyond the cap are the
 * main source of unfair difficulty spikes; the reducer still enforces final
 * [0, max] bounds on top of this.
 *
 * @param change - Raw resource delta returned by the AI.
 * @param kind - Which resource is changing.
 * @param maxValue - The character's current maximum for that resource.
 * @returns The clamped delta.
 */
export function clampResourceChange(
  change: unknown,
  kind: "health" | "stamina" | "mana",
  maxValue: number
): number {
  if (typeof change !== "number" || !Number.isFinite(change) || change === 0) return 0;
  let cap: number;
  switch (kind) {
    case "health": cap = Math.max(1, maxValue * MAX_HEALTH_CHANGE_PER_TURN_FRACTION); break;
    case "stamina": cap = MAX_STAMINA_CHANGE_PER_TURN; break;
    case "mana": cap = MAX_MANA_CHANGE_PER_TURN; break;
    default: cap = maxValue;
  }
  return Math.max(-cap, Math.min(cap, change));
}

/**
 * Generates a unique ID for new adventures.
 * @returns A unique string identifier.
 */
export function generateAdventureId(): string {
    return `adv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
