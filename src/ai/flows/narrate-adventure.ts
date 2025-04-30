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
import type { CharacterStats } from '@/context/GameContext'; // Import CharacterStats type

// Define Zod schema for CharacterStats if not already imported elsewhere globally
const CharacterStatsSchema = z.object({
  strength: z.number().describe('Character strength attribute (1-10 range).'),
  stamina: z.number().describe('Character stamina attribute (1-10 range).'),
  agility: z.number().describe('Character agility attribute (1-10 range).'),
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
  playerChoice: z.string().describe('The player\'s chosen action or command. May include dice roll result like "(Dice Roll Result: 4)".'),
  gameState: z.string().describe('A string representing the current state of the game, including location, inventory, ongoing events, character progression milestones achieved etc.'),
  previousNarration: z.string().optional().describe('The narration text immediately preceding the player\'s current choice, for context.'),
});
export type NarrateAdventureInput = z.infer<typeof NarrateAdventureInputSchema>;

const NarrateAdventureOutputSchema = z.object({
  narration: z.string().describe('The AI-generated narration describing the outcome of the action and the current situation.'),
  updatedGameState: z.string().describe('The updated state of the game string after the player action and narration, reflecting changes in location, inventory, character status, time, or achieved milestones.'),
});
export type NarrateAdventureOutput = z.infer<typeof NarrateAdventureOutputSchema>;

export async function narrateAdventure(input: NarrateAdventureInput): Promise<NarrateAdventureOutput> {
  return narrateAdventureFlow(input);
}

const narrateAdventurePrompt = ai.definePrompt({
  name: 'narrateAdventurePrompt',
  input: { schema: NarrateAdventureInputSchema },
  output: { schema: NarrateAdventureOutputSchema },
  prompt: `You are a dynamic and engaging AI narrator for the text-based adventure game, "Endless Tales". Your role is to weave a compelling story based on player choices, character attributes, and the established game world.

**Game Context:**
{{{gameState}}}

{{#if previousNarration}}
**Previous Scene:**
{{{previousNarration}}}
{{/if}}

**Player Character:**
Name: {{{character.name}}}
Stats: Strength {{{character.stats.strength}}}, Stamina {{{character.stats.stamina}}}, Agility {{{character.stats.agility}}}
Traits: {{#if character.traits}}{{#each character.traits}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None{{/if}}
Knowledge: {{#if character.knowledge}}{{#each character.knowledge}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None{{/if}}
Background: {{{character.background}}}
Description: {{{character.description}}}
{{#if character.aiGeneratedDescription}}Detailed Profile: {{{character.aiGeneratedDescription}}}{{/if}}

**Player's Action:**
{{{playerChoice}}}

**Your Task:**
Generate the next part of the story based on ALL the information above.

1.  **React Dynamically:** Describe the outcome of the player's action. Consider their character's stats (strength, stamina, agility), traits, knowledge, and background. A strong character might succeed at physical tasks, a knowledgeable one might recall relevant lore, a brave one might face danger head-on.
2.  **Incorporate Dice Rolls:** If the Player's Action includes "(Dice Roll Result: N)", interpret the outcome. A high roll (e.g., 5-6 on d6) usually means success, possibly with a bonus. A low roll (e.g., 1-2 on d6) suggests failure, complications, or negative consequences. A mid-roll (e.g., 3-4 on d6) might mean partial success or success with a cost. Use the dice roll to add unpredictability. If no dice roll is mentioned, determine the outcome based on context and character abilities.
3.  **Logical Progression & Restrictions:** The character starts with limited abilities. Prevent players from performing overpowered actions early on (e.g., "become king", "control time", "instantly learn all magic"). Such actions should only become possible *after* significant narrative progress, achieving specific milestones (like completing major quests, finding powerful artifacts, gaining renown - which should be reflected in the gameState). If the player attempts something unreasonable for their current state, narrate why it fails or is impossible *within the story*.
4.  **Consequences:** Actions have consequences. Decisions can alter the story, affect relationships with NPCs (implied or explicit), change the character's status, or modify the game world. Reflect these consequences in the narration and the updated game state.
5.  **Update Game State:** Modify the 'gameState' string concisely to reflect changes resulting from the player's action and the narration (e.g., new location, item acquired/lost, NPC mood change, time passed, quest progress updated, milestone achieved).
6.  **Tone:** Maintain a consistent tone suitable for a fantasy text adventure. Be descriptive and engaging.

**Output Format:** Respond ONLY with the JSON object containing 'narration' and 'updatedGameState'. Ensure the JSON is valid.

Example Updated Game State: "Location: Dark Forest\nInventory: Sword, Healing Potion (2)\nStatus: Slightly Injured\nTime: Evening\nQuest: Find the Lost Amulet (Progress: Found clues)\nMilestones: Defeated Goblin Sentry"
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
     // --- AI Call ---
     console.log("Sending to narrateAdventurePrompt:", JSON.stringify(input, null, 2)); // Log the input being sent
     const {output} = await narrateAdventurePrompt(input);

     // --- Validation & Fallback ---
     const narration = output?.narration?.trim();
     const updatedGameState = output?.updatedGameState?.trim();

     if (!narration || !updatedGameState) {
        console.error("AI narration output missing or invalid:", output);
        // Provide a safe fallback if AI fails
        return {
            narration: "The threads of fate seem momentarily tangled. You pause, considering your next move as the world holds its breath. (AI Error: Narration generation failed)",
            updatedGameState: input.gameState, // Return original game state on error
        };
     }

    console.log("Received from narrateAdventurePrompt:", JSON.stringify(output, null, 2));

    // TODO: Potentially add more robust checks here for game-breaking state changes if the AI fails to follow restrictions, although the prompt aims to prevent this.

    return {
      narration: narration,
      updatedGameState: updatedGameState,
    };
  }
);
