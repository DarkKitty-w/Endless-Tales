'use server';
/**
 * @fileOverview An AI agent that assesses the difficulty of a player action in a text adventure game.
 *
 * - assessActionDifficulty - A function that assesses the difficulty of an action.
 * - AssessActionDifficultyInput - The input type for the assessActionDifficulty function.
 * - AssessActionDifficultyOutput - The return type for the assessActionDifficulty function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

// Define the possible difficulty levels
const DifficultyLevelSchema = z.enum([
    "Trivial", // Requires almost no effort or skill. (No roll needed typically)
    "Easy",    // Requires minimal effort or skill. (Low DC roll, maybe d6/d10)
    "Normal",  // Standard level of challenge. (Medium DC roll, d10/d20)
    "Hard",    // Requires significant skill or effort. (High DC roll, d20/d100)
    "Very Hard", // Borderline possible, requires great skill/luck. (Very high DC roll, d100)
    "Impossible", // Cannot be done given the current context/character abilities. (No roll possible)
]);
export type DifficultyLevel = z.infer<typeof DifficultyLevelSchema>;

const AssessActionDifficultyInputSchema = z.object({
    playerAction: z.string().describe('The action the player wants to perform.'),
    characterCapabilities: z.string().describe('A summary of the character\'s relevant stats, skills, traits, knowledge, and equipment.'),
    currentSituation: z.string().describe('A brief description of the immediate environment, ongoing events, and any relevant obstacles or NPCs.'),
    gameStateSummary: z.string().describe('Broader context including location, major quest progress, significant items, and achieved milestones.'),
});
export type AssessActionDifficultyInput = z.infer<typeof AssessActionDifficultyInputSchema>;

const AssessActionDifficultyOutputSchema = z.object({
    difficulty: DifficultyLevelSchema.describe('The assessed difficulty level of the action.'),
    reasoning: z.string().describe('A brief explanation for the assessed difficulty level, considering the inputs.'),
    suggestedDice: z.enum(["d6", "d10", "d20", "d100", "None"]).describe('The suggested type of die to roll based on difficulty (None if Trivial or Impossible).'),
});
export type AssessActionDifficultyOutput = z.infer<typeof AssessActionDifficultyOutputSchema>;

export async function assessActionDifficulty(input: AssessActionDifficultyInput): Promise<AssessActionDifficultyOutput> {
  return assessActionDifficultyFlow(input);
}

const assessActionDifficultyPrompt = ai.definePrompt({
  name: 'assessActionDifficultyPrompt',
  input: { schema: AssessActionDifficultyInputSchema },
  output: { schema: AssessActionDifficultyOutputSchema },
  prompt: `You are an expert Game Master AI for the text adventure "Endless Tales". Your task is to assess the difficulty of a player's intended action based on their capabilities and the current game situation.

Consider the following factors:
1.  **Player Action:** What is the player *specifically* trying to achieve?
2.  **Character Capabilities:** {{{characterCapabilities}}} - Does the character possess the necessary strength, agility, knowledge, skills, traits, or items mentioned here? High relevant stats/skills make actions easier, low stats make them harder. Specific knowledge (e.g., Magic) enables related actions. Traits (e.g., Brave, Cautious) might influence feasibility or approach.
3.  **Current Situation:** {{{currentSituation}}} - What are the immediate obstacles? Is the environment helpful or hindering? Are there NPCs involved, and what is their disposition?
4.  **Game State Summary:** {{{gameStateSummary}}} - Has the character achieved milestones that make this action more plausible (e.g., "Mastered Basic Magic", "Gained Noble Title")? Does their inventory contain something crucial?
5.  **Plausibility:** Is the action physically possible within the game's established reality? Actions like "fly to the moon" or "destroy the mountain with a punch" are generally impossible unless specific high-level milestones/items are mentioned in the game state. Actions like "become king instantly" or "control time" are Impossible without EXTREME justification in the gameStateSummary (e.g., "Possesses the Crown of Ages").

**Player's Intended Action:**
{{{playerAction}}}

**Assessment Task:**
Determine the difficulty of this action using **ONLY** the following levels: Trivial, Easy, Normal, Hard, Very Hard, Impossible. Provide a brief reasoning based on the factors above. Suggest an appropriate dice type (d6, d10, d20, d100, None) corresponding to the difficulty (None for Trivial/Impossible).

**Difficulty Guidelines & Dice:**
*   **Trivial:** Obvious success, mundane action (e.g., walk across an empty room, look at own hands). Dice: None.
*   **Easy:** Minor challenge, likely success (e.g., climb a low wall, simple persuasion). Dice: d6 or d10.
*   **Normal:** Standard challenge, requires competence (e.g., fight a common enemy, pick a simple lock, cross a tricky path). Dice: d10 or d20.
*   **Hard:** Significant challenge, requires skill/luck (e.g., fight a tough opponent, decipher complex text, persuade a hostile guard). Dice: d20 or d100.
*   **Very Hard:** Borderline possible, requires exceptional skill/luck (e.g., fight a boss monster, cast a very complex spell, achieve a major political coup). Dice: d100.
*   **Impossible:** The action cannot succeed as described, given the character's current state and the game world's rules (e.g., violate fundamental laws of physics/magic without justification, achieve god-like power instantly). Dice: None.

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
        // Fallback to a default 'Normal' difficulty if AI fails
        return {
            difficulty: "Normal",
            reasoning: "AI assessment failed, assuming normal difficulty.",
            suggestedDice: "d10",
        };
     }

     console.log("Received from assessActionDifficultyPrompt:", JSON.stringify(output, null, 2));
     return output;
  }
);

