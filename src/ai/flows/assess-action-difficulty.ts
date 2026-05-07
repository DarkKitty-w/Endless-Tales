/**
 * @fileOverview An AI agent that assesses the difficulty of a player action.
 */

import { z } from 'zod';
import { getClient } from '../ai-instance';
import type { DifficultyLevel, GameStateContext } from '../../types/game-types';
import { formatGameStateContextForPrompt } from '../../context/game-state-utils';
import { processAiResponse } from '../../lib/utils';
import { logger, setRequestId, setTraceId } from '../../lib/logger';

export type { DifficultyLevel };

export interface AssessActionDifficultyInput {
    playerAction: string;
    characterCapabilities: string;
    characterClass?: string;
    currentSituation: string;
    gameStateSummary: string;
    gameStateContext?: GameStateContext;
    gameDifficulty: string; // e.g., "Easy", "Normal", "Hard", "Nightmare"
    turnCount: number;
    userApiKey?: string | null;
    signal?: AbortSignal;
    // OBS-6: Add requestId and traceId for correlation
    requestId?: string;
    traceId?: string;
}

export interface AssessActionDifficultyOutput {
    difficulty: DifficultyLevel;
    reasoning: string;
    suggestedDice: "d6" | "d10" | "d20" | "d100" | "None";
    // ERR-8/ERR-11: Track if fallback was used and preserve raw AI response
    usedFallback?: boolean;
    rawResponse?: string;
}

// Zod schema for validation
const AssessActionDifficultyOutputSchema = z.object({
    difficulty: z.enum(["Trivial", "Easy", "Normal", "Hard", "Very Hard", "Impossible"]),
    reasoning: z.string(),
    suggestedDice: z.enum(["d6", "d10", "d20", "d100", "None"]),
});

// Lookup table for fallback values when AI assessment fails
const FALLBACK_DIFFICULTY_MAP: Record<string, { difficulty: DifficultyLevel; dice: "d6" | "d10" | "d20" | "d100" | "None" }> = {
    easy: { difficulty: "Easy", dice: "d6" },
    normal: { difficulty: "Normal", dice: "d10" },
    hard: { difficulty: "Hard", dice: "d20" },
    nightmare: { difficulty: "Very Hard", dice: "d20" },
};

export async function assessActionDifficulty(input: AssessActionDifficultyInput): Promise<AssessActionDifficultyOutput> {
  // OBS-6: Set requestId and traceId from input if provided
  if (input.requestId) {
    setRequestId(input.requestId);
  }
  if (input.traceId) {
    setTraceId(input.traceId);
  }
  
  if (process.env.NODE_ENV === 'development' && input.characterClass === 'admin000') {
    return {
      difficulty: "Trivial",
      reasoning: "Developer Mode active. Action automatically succeeds.",
      suggestedDice: "None",
    };
  }

  const stateSummary = input.gameStateContext
      ? formatGameStateContextForPrompt(input.gameStateContext)
      : input.gameStateSummary;

  const prompt = `
You are an expert Game Master AI for the text adventure "Endless Tales". Your task is to assess the difficulty of a player's intended action.

**Overall Game Difficulty:** ${input.gameDifficulty} (Adjust baseline difficulty: Harder settings make actions generally tougher).
**Current Turn:** ${input.turnCount}

**Factors to Consider:**
1. **Player Action:** ${input.playerAction}
2. **Character Capabilities:** ${input.characterCapabilities}
3. **Current Situation:** ${input.currentSituation}
4. **Game State Summary:** 
${stateSummary}
5. **Plausibility:** Is the action physically possible? "Fly to the moon" or "become king instantly" are Impossible without specific justification.

**Assessment Task:**
Determine the difficulty: Trivial, Easy, Normal, Hard, Very Hard, Impossible.
Suggest a dice type: d6, d10, d20, d100, None.

Return ONLY a valid JSON object. No explanations, no markdown formatting.
`;

  try {
      const client = getClient(input.userApiKey);
      const response = await client.models.generateContent({
          contents: prompt,
          config: { responseMimeType: "application/json" },
          signal: input.signal,
          // OBS-6 & OBS-7: Pass requestId and traceId for correlation
          requestId: input.requestId,
          traceId: input.traceId,
      });

      const text = response.text;
      if (!text) throw new Error("No text returned from AI");

      // ERR-8/ERR-11: Preserve raw AI response
      const rawResponse = text;

      // Build fallback based on game difficulty
      const gameDiffKey = input.gameDifficulty?.toLowerCase() ?? 'normal';
      const fallbackMapping = FALLBACK_DIFFICULTY_MAP[gameDiffKey] ?? FALLBACK_DIFFICULTY_MAP['normal'];
      const fallback: AssessActionDifficultyOutput = {
          difficulty: fallbackMapping.difficulty,
          reasoning: "AI assessment failed; using a default assumption based on game settings.",
          suggestedDice: fallbackMapping.dice,
          usedFallback: true,
          rawResponse: text,
      };

      const normalizer = (data: any): AssessActionDifficultyOutput => ({
          difficulty: data.difficulty ?? fallback.difficulty,
          reasoning: data.reasoning ?? fallback.reasoning,
          suggestedDice: data.suggestedDice ?? fallback.suggestedDice,
          usedFallback: false,
          rawResponse: rawResponse,
      });

      const result = await processAiResponse(
          text,
          AssessActionDifficultyOutputSchema,
          fallback,
          normalizer
      );
      return result;

  } catch (error: any) {
      if (error.name === 'AbortError') throw error;
      
      // OBS-9 Fix: Include requestId/traceId and input context for reproducibility
      logger.error("AI Error in assessActionDifficulty", 'ai-flows', {
        requestId: input.requestId,
        traceId: input.traceId,
        playerAction: input.playerAction.substring(0, 100), // Truncated for safety
        characterClass: input.characterClass,
        gameDifficulty: input.gameDifficulty,
        turnCount: input.turnCount,
        error: error instanceof Error ? {
          message: error.message,
          name: error.name,
          stack: error.stack?.split('\n').slice(0, 3).join('\n'), // First 3 lines only
        } : String(error),
      });
      
      const gameDiffKey = input.gameDifficulty?.toLowerCase() ?? 'normal';
      const fallbackMapping = FALLBACK_DIFFICULTY_MAP[gameDiffKey] ?? FALLBACK_DIFFICULTY_MAP['normal'];
      return {
          difficulty: fallbackMapping.difficulty,
          reasoning: "AI assessment failed; using a default assumption based on game settings.",
          suggestedDice: fallbackMapping.dice,
          usedFallback: true,
          rawResponse: error.message || 'Unknown error',
      };
  }
}