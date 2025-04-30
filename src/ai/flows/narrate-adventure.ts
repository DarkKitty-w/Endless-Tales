'use server';
/**
 * @fileOverview A text adventure narration AI agent.
 *
 * - narrateAdventure - A function that handles the text adventure narration.
 * - NarrateAdventureInput - The input type for the narrateAdventure function.
 * - NarrateAdventureOutput - The return type for the narrateAdventure function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {rollDice} from '@/services/dice-roller';

const NarrateAdventureInputSchema = z.object({
  characterDescription: z
    .string()
    .describe('A description of the player character, including traits, knowledge, and background.'),
  playerChoice: z.string().describe('The player choice or action.'),
  gameState: z.string().describe('The current state of the game.'),
});
export type NarrateAdventureInput = z.infer<typeof NarrateAdventureInputSchema>;

const NarrateAdventureOutputSchema = z.object({
  narration: z.string().describe('The AI-generated narration of the story.'),
  updatedGameState: z.string().describe('The updated state of the game.'),
});
export type NarrateAdventureOutput = z.infer<typeof NarrateAdventureOutputSchema>;

export async function narrateAdventure(input: NarrateAdventureInput): Promise<NarrateAdventureOutput> {
  return narrateAdventureFlow(input);
}

const narrateAdventurePrompt = ai.definePrompt({
  name: 'narrateAdventurePrompt',
  input: {
    schema: z.object({
      characterDescription: z
        .string()
        .describe('A description of the player character, including traits, knowledge, and background.'),
      playerChoice: z.string().describe('The player choice or action.'),
      gameState: z.string().describe('The current state of the game.'),
    }),
  },
  output: {
    schema: z.object({
      narration: z.string().describe('The AI-generated narration of the story.'),
      updatedGameState: z.string().describe('The updated state of the game.'),
    }),
  },
  prompt: `You are a dynamic and engaging AI narrator for a text-based adventure game.

You will receive the current game state, a description of the player character, and the player's recent choice.

Based on this information, you will generate the next part of the story, and update the game state to reflect the player's actions and the consequences of those actions.

Character Description: {{{characterDescription}}}
Player Choice: {{{playerChoice}}}
Current Game State: {{{gameState}}}

Respond with the next part of the story, and the updated game state.

Narration:
Updated Game State:`,
});

const narrateAdventureFlow = ai.defineFlow<
  typeof NarrateAdventureInputSchema,
  typeof NarrateAdventureOutputSchema
>(
  {
    name: 'narrateAdventureFlow',
    inputSchema: NarrateAdventureInputSchema,
    outputSchema: NarrateAdventureOutputSchema,
  },
  async input => {
    const {output} = await narrateAdventurePrompt(input);
    // Basic dice roll implementation
    const diceRollResult = await rollDice();
    console.log('Dice roll result:', diceRollResult);

    // TODO: Incorporate dice roll result into narration and game state.
    // TODO: Add logic for handling overpowered choices and skill-based progression.

    return {
      narration: output?.narration ?? 'The adventure continues...', // Provide a default narration
      updatedGameState: output?.updatedGameState ?? input.gameState, // Keep the game state consistent
    };
  }
);
