// src/lib/constants.ts
import type { DifficultyLevel as AdventureDifficultyLevel } from "../types/adventure-types";

/** The total number of points available for character stats. */
export const TOTAL_STAT_POINTS = 15;

/** The minimum value allowed for a single character stat. */
export const MIN_STAT_VALUE = 1;

/** The maximum value allowed for a single character stat. */
export const MAX_STAT_VALUE = 10;

/** The number of stages in a skill tree (0 to MAX-1). */
export const MAX_SKILL_TREE_STAGES = 5;

/** Valid difficulty levels for adventure settings. */
export const VALID_ADVENTURE_DIFFICULTY_LEVELS: AdventureDifficultyLevel[] = ["Easy", "Normal", "Hard", "Nightmare"];

/** LocalStorage key for saving adventures. */
export const SAVED_ADVENTURES_KEY = "endlessTalesSavedAdventures";

/** LocalStorage key for saving the selected theme ID. */
export const THEME_ID_KEY = "colorTheme";

/** LocalStorage key for saving the theme mode (light/dark). */
export const THEME_MODE_KEY = "themeMode";

/** LocalStorage key for saving the user's Google AI API key. */
export const USER_API_KEY_KEY = "userGoogleAiApiKey";

// --- Respawn Penalties ---
/** Percentage of current XP lost upon respawn (0-1). */
export const RESPAWN_XP_LOSS_PERCENT = 0.1;

/** Number of turns the "Weakened" debuff lasts after respawn. */
export const RESPAWN_DEBUFF_DURATION = 3;

// --- Balance: XP reward economy (GAME-BALANCE) ---
/**
 * XP awarded per narrated event, keyed by the AI's assessed action difficulty.
 * Ranges are tuned against calculateXpToNextLevel (~100/160/240/330...) so a
 * player levels up roughly every 4-6 meaningful actions early on, slowing
 * naturally at higher levels.
 */
export const XP_REWARD_RANGES: Record<string, [number, number]> = {
  Trivial: [0, 5],
  Easy: [10, 20],
  Normal: [20, 40],
  Hard: [40, 70],
  "Very Hard": [70, 110],
  Impossible: [120, 200],
};

/** Default XP range when the assessed difficulty is missing or unknown. */
export const DEFAULT_XP_REWARD_RANGE: [number, number] = XP_REWARD_RANGES.Normal;

/** Multiplier applied to XP rewards based on the adventure difficulty setting. */
export const DIFFICULTY_SETTING_XP_MULTIPLIER: Record<string, number> = {
  easy: 0.75,
  normal: 1,
  hard: 1.25,
  nightmare: 1.5,
};

/** Default multiplier when the difficulty setting is missing or unknown. */
export const DEFAULT_DIFFICULTY_XP_MULTIPLIER = 1;

/** Absolute cap on a single XP award, so no event can trivialize progression. */
export const MAX_XP_PER_EVENT = 200;

// --- Balance: per-turn resource change caps (GAME-BALANCE) ---
/** Max fraction of max health a single narration may add or remove. */
export const MAX_HEALTH_CHANGE_PER_TURN_FRACTION = 0.5;

/** Max stamina a single narration may add or remove (points). */
export const MAX_STAMINA_CHANGE_PER_TURN = 30;

/** Max mana a single narration may add or remove (points). */
export const MAX_MANA_CHANGE_PER_TURN = 30;