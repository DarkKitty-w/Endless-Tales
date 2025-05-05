// src/lib/constants.ts
import type { DifficultyLevel } from "@/types/game-types"; // Import DifficultyLevel type

/** The total number of points available for character stats. */
export const TOTAL_STAT_POINTS = 30; // Updated total for 6 stats

/** The minimum value allowed for a single character stat. */
export const MIN_STAT_VALUE = 1;

/** The maximum value allowed for a single character stat. */
export const MAX_STAT_VALUE = 10;

/** Valid difficulty levels for validation. */
export const VALID_DIFFICULTY_LEVELS: DifficultyLevel[] = ["Trivial", "Easy", "Normal", "Hard", "Very Hard", "Impossible"];
