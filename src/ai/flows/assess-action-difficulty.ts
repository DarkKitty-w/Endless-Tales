/**
 * @fileOverview An AI agent that assesses the difficulty of a player action.
 */

import { z } from 'zod';
import { getClient } from '../ai-instance';
import { Type, Schema } from "@google/genai";
import type { DifficultyLevel, GameStateContext } from '../../types/game-types';
import { formatGameStateContextForPrompt } from '../../context/game-state-utils';

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
}

export interface AssessActionDifficultyOutput {
    difficulty: DifficultyLevel;
    reasoning: string;
    suggestedDice: "d6" | "d10" | "d20" | "d100" | "None";
}

// Zod schema for validation
const AssessActionDifficultyOutputSchema = z.object({
    difficulty: z.enum(["Trivial", "Easy", "Normal", "Hard", "Very Hard", "Impossible"]),
    reasoning: z.string(),
    suggestedDice: z.enum(["d6", "d10", "d20", "d100", "None"]),
});

const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        difficulty: {
            type: Type.STRING,
            enum: ["Trivial", "Easy", "Normal", "Hard", "Very Hard", "Impossible"],
            description: "The assessed difficulty level."
        },
        reasoning: {
            type: Type.STRING,
            description: "Explanation for the difficulty."
        },
        suggestedDice: {
            type: Type.STRING,
            enum: ["d6", "d10", "d20", "d100", "None"],
            description: "Suggested dice to roll."
        }
    },
    required: ["difficulty", "reasoning", "suggestedDice"]
};

// Lookup table for fallback values when AI assessment fails
const FALLBACK_DIFFICULTY_MAP: Record<string, { difficulty: DifficultyLevel; dice: "d6" | "d10" | "d20" | "d100" | "None" }> = {
    easy: { difficulty: "Easy", dice: "d6" },
    normal: { difficulty: "Normal", dice: "d10" },
    hard: { difficulty: "Hard", dice: "d20" },
    nightmare: { difficulty: "Very Hard", dice: "d20" },
};

export async function assessActionDifficulty(input: AssessActionDifficultyInput): Promise<AssessActionDifficultyOutput> {
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

Output JSON only.
`;

  try {
      const client = getClient(input.userApiKey);
      const response = await client.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
              responseMimeType: "application/json",
              responseSchema: responseSchema,
          }
      });

      const text = response.text;
      if (!text) throw new Error("No text returned from AI");
      
      const parsed = JSON.parse(text);
      const validation = AssessActionDifficultyOutputSchema.safeParse(parsed);
      
      if (validation.success) {
          return validation.data;
      } else {
          console.warn("Zod validation failed for assessActionDifficulty, using fallback.", validation.error);
          throw new Error("Invalid response structure");
      }

  } catch (error) {
      console.error("AI Error in assessActionDifficulty:", error);
      
      // Use lookup table for fallback based on game difficulty setting
      const gameDiffKey = input.gameDifficulty?.toLowerCase() ?? 'normal';
      const fallback = FALLBACK_DIFFICULTY_MAP[gameDiffKey] ?? FALLBACK_DIFFICULTY_MAP['normal'];
      
      return {
          difficulty: fallback.difficulty,
          reasoning: "AI assessment failed; using a default assumption based on game settings.",
          suggestedDice: fallback.dice,
      };
  }
}