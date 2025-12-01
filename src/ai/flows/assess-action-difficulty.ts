/**
 * @fileOverview An AI agent that assesses the difficulty of a player action in a text adventure game.
 */

import { getClient } from '../ai-instance';
import { Type, Schema } from "@google/genai";
import type { DifficultyLevel } from '../../types/game-types'; 

export type { DifficultyLevel };

export interface AssessActionDifficultyInput {
    playerAction: string;
    characterCapabilities: string;
    characterClass?: string;
    currentSituation: string;
    gameStateSummary: string;
    gameDifficulty: string;
    turnCount: number;
    userApiKey?: string | null;
}

export interface AssessActionDifficultyOutput {
    difficulty: DifficultyLevel;
    reasoning: string;
    suggestedDice: "d6" | "d10" | "d20" | "d100" | "None";
}

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

export async function assessActionDifficulty(input: AssessActionDifficultyInput): Promise<AssessActionDifficultyOutput> {
  if (input.characterClass === 'admin000') {
    return {
      difficulty: "Trivial",
      reasoning: "Developer Mode active. Action automatically succeeds.",
      suggestedDice: "None",
    };
  }

  const prompt = `
You are an expert Game Master AI for the text adventure "Endless Tales". Your task is to assess the difficulty of a player's intended action.

**Overall Game Difficulty:** ${input.gameDifficulty} (Adjust baseline difficulty: Harder settings make actions generally tougher).
**Current Turn:** ${input.turnCount}

**Factors to Consider:**
1. **Player Action:** ${input.playerAction}
2. **Character Capabilities:** ${input.characterCapabilities}
3. **Current Situation:** ${input.currentSituation}
4. **Game State Summary:** ${input.gameStateSummary}
5. **Plausibility:** Is the action physically possible? "Fly to the moon" or "become king instantly" are Impossible without specific justification.

**Assessment Task:**
Determine the difficulty: Trivial, Easy, Normal, Hard, Very Hard, Impossible.
Suggest a dice type: d6, d10, d20, d100, None.

Output JSON only.
`;

  try {
      const client = getClient(input.userApiKey);
      const response = await client.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: prompt,
          config: {
              responseMimeType: "application/json",
              responseSchema: responseSchema,
          }
      });

      const text = response.text;
      if (!text) throw new Error("No text returned from AI");
      return JSON.parse(text) as AssessActionDifficultyOutput;

  } catch (error) {
      console.error("AI Error in assessActionDifficulty:", error);
      // Fallback
      let fallbackDifficulty: DifficultyLevel = "Normal";
      let fallbackDice: "d6" | "d10" | "d20" | "d100" | "None" = "d10";
      switch(input.gameDifficulty?.toLowerCase()) {
          case 'easy': fallbackDifficulty = "Easy"; fallbackDice = "d6"; break;
          case 'hard': case 'nightmare': fallbackDifficulty = "Hard"; fallbackDice = "d20"; break;
          default: fallbackDifficulty = "Normal"; fallbackDice = "d10";
      }
      return {
          difficulty: fallbackDifficulty,
          reasoning: "AI assessment failed, assuming difficulty based on game settings.",
          suggestedDice: fallbackDice,
      };
  }
}