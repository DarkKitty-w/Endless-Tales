
// src/lib/constants.ts
import type { DifficultyLevel as AdventureDifficultyLevel } from "../types/adventure-types"; // Import DifficultyLevel type
import type { DifficultyLevel as AssessmentDifficultyLevel } from "../types/game-types"; // Corrected import


/** The total number of points available for character stats. */
export const TOTAL_STAT_POINTS = 15;

/** The minimum value allowed for a single character stat. */
export const MIN_STAT_VALUE = 1;

/** The maximum value allowed for a single character stat. */
export const MAX_STAT_VALUE = 10;

/** Valid difficulty levels for adventure settings. */
export const VALID_ADVENTURE_DIFFICULTY_LEVELS: AdventureDifficultyLevel[] = ["Easy", "Normal", "Hard", "Nightmare"];

/** Valid difficulty levels for AI action assessment. */
export const VALID_ASSESSMENT_DIFFICULTY_LEVELS: AssessmentDifficultyLevel[] = ["Trivial", "Easy", "Normal", "Hard", "Very Hard", "Impossible"];


/** LocalStorage key for saving adventures. */
export const SAVED_ADVENTURES_KEY = "endlessTalesSavedAdventures";

/** LocalStorage key for saving the selected theme ID. */
export const THEME_ID_KEY = "colorTheme";

/** LocalStorage key for saving the theme mode (light/dark). */
export const THEME_MODE_KEY = "themeMode";

/** LocalStorage key for saving the user's Google AI API key. */
export const USER_API_KEY_KEY = "userGoogleAiApiKey";
