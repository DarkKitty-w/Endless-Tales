/**
 * AI application service layer.
 *
 * This module is the single application-level boundary between UI components
 * and the AI domain (src/ai/*). Screens and gameplay components must depend on
 * this gateway instead of importing flow implementations directly, so that:
 * - the UI layer never orchestrates AI internals (prompts, providers, parsing);
 * - flow implementations can be refactored or replaced without touching UI code;
 * - cross-cutting concerns (tracing ids, fallbacks) stay in one place.
 *
 * Types re-exported here form the stable data contract consumed by the UI.
 */

import {
  narrateAdventure,
  type NarrateAdventureInput,
  type NarrateAdventureOutput,
} from "../ai/flows/narrate-adventure";
import {
  summarizeAdventure,
  type SummarizeAdventureInput,
  type SummarizeAdventureOutput,
} from "../ai/flows/summarize-adventure";
import {
  assessActionDifficulty,
  getFallbackDifficultyAssessment,
  type AssessActionDifficultyInput,
  type AssessActionDifficultyOutput,
  type DifficultyLevel,
} from "../ai/flows/assess-action-difficulty";
import {
  generateSkillTree,
  type GenerateSkillTreeInput,
  type GenerateSkillTreeOutput,
} from "../ai/flows/generate-skill-tree";
import {
  attemptCrafting,
  type AttemptCraftingInput,
  type AttemptCraftingOutput,
} from "../ai/flows/attempt-crafting";

// ---- Stable data contract for the UI layer -------------------------------
export type {
  NarrateAdventureInput,
  NarrateAdventureOutput,
  SummarizeAdventureInput,
  SummarizeAdventureOutput,
  AssessActionDifficultyInput,
  AssessActionDifficultyOutput,
  DifficultyLevel,
  GenerateSkillTreeInput,
  GenerateSkillTreeOutput,
  AttemptCraftingInput,
  AttemptCraftingOutput,
};

// ---- Use-case wrappers ----------------------------------------------------

/** Narrate the outcome of the player's action for the current turn. */
export function requestNarration(input: NarrateAdventureInput): Promise<NarrateAdventureOutput> {
  return narrateAdventure(input);
}

/** Generate a closing summary when the adventure ends. */
export function requestAdventureSummary(
  input: SummarizeAdventureInput,
): Promise<SummarizeAdventureOutput> {
  return summarizeAdventure(input);
}

/** Assess how difficult the player's action should be. */
export function requestDifficultyAssessment(
  input: AssessActionDifficultyInput,
): Promise<AssessActionDifficultyOutput> {
  return assessActionDifficulty(input);
}

/** Deterministic difficulty/dice fallback derived from the game difficulty. */
export function getFallbackDifficulty(
  gameDifficulty?: string,
): ReturnType<typeof getFallbackDifficultyAssessment> {
  return getFallbackDifficultyAssessment(gameDifficulty);
}

/** Generate (or regenerate) the skill tree for a character class. */
export function requestSkillTree(
  input: GenerateSkillTreeInput,
): Promise<GenerateSkillTreeOutput> {
  return generateSkillTree(input);
}

/** Resolve a crafting attempt against the character's knowledge/skills/inventory. */
export function requestCraftingAttempt(
  input: AttemptCraftingInput,
): Promise<AttemptCraftingOutput> {
  return attemptCrafting(input);
}
