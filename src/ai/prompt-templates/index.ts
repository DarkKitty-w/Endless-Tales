/**
 * @fileOverview Prompt templates module for Endless Tales AI flows.
 * Provides reusable components for building consistent, maintainable prompts.
 */

// System messages
export {
  BASE_NARRATOR_SYSTEM_MESSAGE,
  CHARACTER_GENERATION_SYSTEM_MESSAGE,
  GAME_ANALYSIS_SYSTEM_MESSAGE,
  CRAFTING_SYSTEM_MESSAGE,
  buildSystemMessage,
  ANTI_INJECTION_RULES,
  ANTI_REPETITION_RULES,
} from './system-messages';

// Context formatters
export {
  formatCharacterContext,
  formatInventoryContext,
  formatRelationshipsContext,
  formatAdventureSettings,
  formatStorySummary,
  buildGameContextForPrompt,
} from './context-formatters';

export type {} from './system-messages';
export type {} from './context-formatters';
