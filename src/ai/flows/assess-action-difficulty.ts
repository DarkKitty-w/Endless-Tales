
'use server';
/**
 * @fileOverview An AI agent that assesses the difficulty of a player action in a text adventure game.
 *
 * - assessActionDifficulty - A function that assesses the difficulty of an action.
 * - AssessActionDifficultyInput - The input type for the assessActionDifficulty function.
 * - AssessActionDifficultyOutput - The return type for the assessActionDifficulty function.
 * - DifficultyLevel - The possible difficulty levels.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import type { DifficultyLevel } from '@/types/game-types'; 

const DifficultyLevelSchema = z.enum([
    "Trivial", "Easy", "Normal", "Hard", "Very Hard", "Impossible",
]);

const AssessActionDifficultyInputSchema = z.object({
    playerAction: z.string().describe('The action the player wants to perform.'),
    characterCapabilities: z.string().describe("A summary of the character's relevant stats (Strength, Stamina, Wisdom), skills, traits, knowledge, equipment, health, action stamina, and mana."), // Updated stats
    characterClass: z.string().optional().describe("The character's class. Used for special checks like developer mode."),
    currentSituation: z.string().describe('A brief description of the immediate environment, ongoing events, and any relevant obstacles or NPCs.'),
    gameStateSummary: z.string().describe('Broader context including location, major quest progress, significant items, and achieved milestones.'),
    gameDifficulty: z.string().describe("The overall game difficulty setting (e.g., Easy, Normal, Hard, Nightmare). This should influence the baseline difficulty."),
    turnCount: z.number().describe("The current turn number. Higher turn counts might imply more complex situations or fatigued characters."),
});

const AssessActionDifficultyOutputSchema = z.object({
    difficulty: DifficultyLevelSchema.describe('The assessed difficulty level of the action.'),
    reasoning: z.string().describe('A brief explanation for the assessed difficulty level, considering the inputs.'),
    suggestedDice: z.enum(["d6", "d10", "d20", "d100", "None"]).describe('The suggested type of die to roll based on difficulty (None if Trivial or Impossible).'),
});

export type { DifficultyLevel };
export type AssessActionDifficultyInput = z.infer<typeof AssessActionDifficultyInputSchema>;
export type AssessActionDifficultyOutput = z.infer<typeof AssessActionDifficultyOutputSchema>;

export async function assessActionDifficulty(input: AssessActionDifficultyInput): Promise<AssessActionDifficultyOutput> {
  if (input.characterClass === 'admin000') {
    console.log("Developer Mode detected in assessActionDifficulty. Skipping AI assessment.");
    return {
      difficulty: "Trivial",
      reasoning: "Developer Mode active. Action automatically succeeds.",
      suggestedDice: "None",
    };
  }
  return assessActionDifficultyFlow(input);
}

const assessActionDifficultyPrompt = ai.definePrompt({
  name: 'assessActionDifficultyPrompt',
  input: { schema: AssessActionDifficultyInputSchema },
  output: { schema: AssessActionDifficultyOutputSchema },
  prompt: `You are an expert Game Master AI for the text adventure "Endless Tales". Your task is to assess the difficulty of a player's intended action based on their capabilities, the current game situation, and overall game settings.

**Overall Game Difficulty:** {{{gameDifficulty}}} (Adjust baseline difficulty: Harder settings make actions generally tougher, Easier settings make them simpler).
**Current Turn:** {{{turnCount}}} (Consider fatigue or escalating complexity in later turns).

Consider the following factors:
1.  **Player Action:** What is the player *specifically* trying to achieve?
2.  **Character Capabilities:** {{{characterCapabilities}}} - Does the character possess the necessary Strength (for physical actions), Stamina (for health resilience), Wisdom (for mental/magical tasks), knowledge, skills, traits, or items mentioned here? High relevant stats/skills make actions easier, low stats make them harder. Specific knowledge (e.g., Magic) enables related actions. Traits (e.g., Brave, Cautious) might influence feasibility or approach. Current health, action stamina, and mana levels are also critical.
3.  **Current Situation:** {{{currentSituation}}} - What are the immediate obstacles? Is the environment helpful or hindering? Are there NPCs involved, and what is their disposition?
4.  **Game State Summary:** {{{gameStateSummary}}} - Has the character achieved milestones that make this action more plausible (e.g., "Mastered Basic Magic", "Gained Noble Title")? Does their inventory contain something crucial?
5.  **Plausibility:** Is the action physically possible within the game's established reality? Actions like "fly to the moon" or "destroy the mountain with a punch" are generally impossible unless specific high-level milestones/items are mentioned in the game state. Actions like "become king instantly" or "control time" are Impossible without EXTREME justification in the gameStateSummary (e.g., "Possesses the Crown of Ages").

**Player's Intended Action:**
{{{playerAction}}}

**Assessment Task:**
Determine the difficulty of this action using **ONLY** the following levels: Trivial, Easy, Normal, Hard, Very Hard, Impossible. Provide a brief reasoning based on the factors above, INCLUDING the game difficulty setting. Suggest an appropriate dice type (d6, d10, d20, d100, None) corresponding to the difficulty (None for Trivial/Impossible). Remember that higher game difficulty increases the chance of 'Hard' or 'Very Hard' assessments for non-trivial actions.

**Difficulty Guidelines & Dice:**
*   **Trivial:** Obvious success, mundane action. Dice: None.
*   **Easy:** Minor challenge, likely success. Dice: d6 or d10.
*   **Normal:** Standard challenge, requires competence. Dice: d10 or d20.
*   **Hard:** Significant challenge, requires skill/luck. Dice: d20 or d100.
*   **Very Hard:** Borderline possible, requires exceptional skill/luck. Dice: d100.
*   **Impossible:** The action cannot succeed as described. Dice: None.

**Output Format:** Respond ONLY with the JSON object containing 'difficulty', 'reasoning', and 'suggestedDice'. Ensure the JSON is valid.
`,
});

const assessActionDifficultyFlow = ai.defineFlow<
  typeof AssessActionDifficultyInputSchema,
  typeof AssessActionDifficultyOutputSchema
>(
  {
    name: 'assessActionDifficultyFlow',
    inputSchema: AssessActionDifficultyInputSchema,
    outputSchema: AssessActionDifficultyOutputSchema,
  },
  async (input) => {
     console.log("Sending to assessActionDifficultyPrompt:", JSON.stringify(input, null, 2));
     const {output} = await assessActionDifficultyPrompt(input);

     if (!output || !output.difficulty || !output.reasoning || !output.suggestedDice) {
        console.error("AI difficulty assessment output missing or invalid:", output);
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
     console.log("Received from assessActionDifficultyPrompt:", JSON.stringify(output, null, 2));
     return output;
  }
);
