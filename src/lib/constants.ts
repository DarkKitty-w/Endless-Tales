// src/lib/constants.ts
import type { DifficultyLevel } from "@/types/adventure-types"; // Import DifficultyLevel type

/** The total number of points available for character stats. */
export const TOTAL_STAT_POINTS = 15; // Updated total for 3 stats

/** The minimum value allowed for a single character stat. */
export const MIN_STAT_VALUE = 1;

/** The maximum value allowed for a single character stat. */
export const MAX_STAT_VALUE = 10;

/** Valid difficulty levels for validation. */
export const VALID_DIFFICULTY_LEVELS: DifficultyLevel[] = ["Easy", "Normal", "Hard", "Nightmare"];

/** LocalStorage key for saving adventures. */
export const SAVED_ADVENTURES_KEY = "endlessTalesSavedAdventures";

/** LocalStorage key for saving the selected theme ID. */
export const THEME_ID_KEY = "colorTheme";

/** LocalStorage key for saving the theme mode (light/dark). */
export const THEME_MODE_KEY = "themeMode";

// Note: VALID_DIFFICULTY_LEVELS in assess-action-difficulty flow is different.
// Decide if these should be unified or kept separate.
// If unifying, use:
// export const VALID_ASSESSMENT_DIFFICULTY_LEVELS: DifficultyLevel[] = ["Trivial", "Easy", "Normal", "Hard", "Very Hard", "Impossible"];
