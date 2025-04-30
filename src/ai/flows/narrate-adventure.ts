// src/ai/flows/narrate-adventure.ts
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
import { CharacterStats } from '@/context/GameContext'; // Import CharacterStats if defined separately

// Define Zod schema for CharacterStats if not already imported
const CharacterStatsSchema = z.object({
  strength: z.number().describe('Character strength attribute.'),
  stamina: z.number().describe('Character stamina attribute.'),
  agility: z.number().describe('Character agility attribute.'),
});

const NarrateAdventureInputSchema = z.object({
  character: z.object({
    name: z.string().describe('Character name.'),
    description: z.string().describe('A brief description of the character (appearance, personality, backstory snippet).'),
    traits: z.array(z.string()).describe('List of character traits (e.g., Brave, Curious).'),
    knowledge: z.array(z.string()).describe('List of character knowledge areas (e.g., Magic, History).'),
    background: z.string().describe('Character background (e.g., Soldier, Royalty).'),
    stats: CharacterStatsSchema, // Use the defined stats schema
    aiGeneratedDescription: z.string().optional().describe('Optional detailed AI-generated character profile.'),
  }).describe('The player character details.'),
  playerChoice: z.string().describe('The player choice or action, potentially including dice roll result.'),
  gameState: z.string().describe('The current state of the game, including location, inventory, ongoing events etc.'),
});
export type NarrateAdventureInput = z.infer<typeof NarrateAdventureInputSchema>;

const NarrateAdventureOutputSchema = z.object({
  narration: z.string().describe('The AI-generated narration of the story segment.'),
  updatedGameState: z.string().describe('The updated state of the game after the player action and narration.'),
});
export type NarrateAdventureOutput = z.infer<typeof NarrateAdventureOutputSchema>;

export async function narrateAdventure(input: NarrateAdventureInput): Promise<NarrateAdventureOutput> {
  return narrateAdventureFlow(input);
}

const narrateAdventurePrompt = ai.definePrompt({
  name: 'narrateAdventurePrompt',
  input: { schema: NarrateAdventureInputSchema }, // Use the combined input schema
  output: { schema: NarrateAdventureOutputSchema },
  prompt: `You are a dynamic and engaging AI narrator for a text-based adventure game, "Endless Tales".

You will receive the current game state, details about the player character (including their name, stats, traits, knowledge, background, and description), and the player's recent choice (which might include a dice roll result indicating success level).

**Character Details:**
Name: {{{character.name}}}
Stats: Strength {{{character.stats.strength}}}, Stamina {{{character.stats.stamina}}}, Agility {{{character.stats.agility}}}
Traits: {{#if character.traits}}{{#each character.traits}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None{{/if}}
Knowledge: {{#if character.knowledge}}{{#each character.knowledge}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None{{/if}}
Background: {{{character.background}}}
Description: {{{character.description}}}
{{#if character.aiGeneratedDescription}}AI Profile: {{{character.aiGeneratedDescription}}}{{/if}}

**Current Game Situation:**
{{{gameState}}}

**Player's Action:**
{{{playerChoice}}}

**Your Task:**
Based on ALL the information above, generate the next part of the story.
- React dynamically to the player's choice, considering their character's stats, traits, and knowledge. For example, a strong character might succeed easily at a physical task, while a knowledgeable one might recall relevant lore.
- Incorporate the outcome implied by any dice roll mentioned in the player's action (e.g., a low roll means the action might fail or have negative consequences, a high roll means success).
- Describe the consequences of the action and the evolving situation.
- Update the game state concisely to reflect changes (e.g., location change, inventory update, NPC reaction, time passing).
- Maintain a consistent tone appropriate for a fantasy adventure.
- **Important:** Do not allow players to perform actions far beyond their current capabilities or the established world rules (e.g., instantly becoming king, controlling time early on). Narrate logical consequences or limitations based on their character and the game state. Progression should feel earned.

**Output Format:**
Respond ONLY with the narration and the updated game state in the specified format.

Narration:
[Your generated story segment here]

Updated Game State:
[Your concise update to the game state here]
`,
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
  async (input) => {
    // --- Dice Roll Logic (Example - potentially move to Gameplay screen before calling flow) ---
    // This part demonstrates how a dice roll *could* be integrated if done *within* the flow,
    // but it's generally better managed in the calling component (Gameplay.tsx)
    // so the result can be added to the playerChoice *before* sending to the AI.
    // const diceRollResult = await rollDice();
    // const successModifier = diceRollResult >= 4 ? 1 : (diceRollResult <= 2 ? -1 : 0);
    // // Modify input.playerChoice based on diceRollResult here if needed.
    // input.playerChoice += ` (Dice Roll: ${diceRollResult})`;
    // console.log('Dice roll result (in flow):', diceRollResult);

     // --- AI Call ---
     console.log("Sending to narrateAdventurePrompt:", input); // Log the input being sent
     const {output} = await narrateAdventurePrompt(input);

     // TODO: Add more sophisticated logic for handling overpowered choices based on game state and character progression.
     // This might involve checking the updatedGameState for specific keywords or patterns.

    // Validate output or provide defaults
     const narration = output?.narration?.trim();
     const updatedGameState = output?.updatedGameState?.trim();

     if (!narration || !updatedGameState) {
        console.error("AI narration output missing or invalid:", output);
        // Provide a safe fallback if AI fails
        return {
            narration: "The world seems to pause, waiting for your next move. (AI error occurred)",
            updatedGameState: input.gameState, // Return original game state on error
        };
     }


    return {
      narration: narration,
      updatedGameState: updatedGameState,
    };
  }
);
