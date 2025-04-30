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

1.  **React Dynamically:** Describe the outcome of the player's action. Consider their character's stats (strength, stamina, agility), traits, knowledge, background, and the current gameState (location, items, situation, milestones).
2.  **Logical Progression & Restrictions:**
    *   **Evaluate Feasibility:** Assess if the player's action is logically possible given their current situation, abilities (stats, knowledge, traits), and progress (milestones in gameState).
    *   **Block Impossible Actions:** Prevent players from performing actions that are fundamentally impossible or vastly outside their current capabilities (e.g., "destroy the universe", "teleport to another dimension", "become king instantly", "control time").
    *   **Narrate Failure Reason:** If an action is blocked, narrate *why* it fails within the story's logic. Explain the character's limitations (e.g., "You lack the physical strength to...", "Your knowledge of magic doesn't extend to...", "That concept is beyond your current understanding.", "Becoming king requires political power you haven't earned.").
    *   **Skill-based Progression:** Extremely powerful actions (like significant magic, ruling, dimension hopping) should ONLY be possible *after* the character achieves specific, major milestones clearly indicated in the gameState (e.g., "Milestone: Mastered Arcane Fundamentals", "Milestone: Gained Nobility Title", "Milestone: Found the Dimensional Key"). Do not allow these actions otherwise.
3.  **Incorporate Dice Rolls (d6):**
    *   **Interpret Roll Contextually:** If the Player's Action includes "(Dice Roll Result: N)", interpret the outcome based on the *inherent difficulty* of the action attempted.
    *   **Difficulty Matters:** A low roll (1-2) on a *difficult* task is a clear failure, perhaps with complications. A high roll (5-6) on an *easy* task might grant a bonus or extra success. A mid-roll (3-4) on a *normal* task could be partial success or success with a minor cost. A roll of 6 on a difficult task might be just barely succeeding.
    *   **Narrate Accordingly:** Use the dice roll combined with the action's context and difficulty to add unpredictability and determine the degree of success or failure. If no dice roll is mentioned, determine the outcome based solely on context and character abilities/gameState.
4.  **Consequences:** Actions have consequences. Decisions can alter the story, affect relationships with NPCs (implied or explicit), change the character's status, or modify the game world (inventory, location, time). Reflect these consequences in the narration and the updated game state.
5.  **Update Game State:** Modify the 'gameState' string concisely to reflect changes resulting from the player's action and the narration (e.g., new location, item acquired/lost, NPC mood change, time passed, quest progress updated, milestone achieved, status changed like 'Injured'). Ensure it remains a readable string format.
6.  **Tone:** Maintain a consistent tone suitable for a fantasy text adventure. Be descriptive and engaging.

**Output Format:** Respond ONLY with the JSON object containing 'narration' and 'updatedGameState'. Ensure the JSON is valid.

Example Updated Game State: "Location: Dark Forest - Cave Entrance\nInventory: Sword, Healing Potion (1), Glowing Moss\nStatus: Slightly Injured\nTime: Evening\nQuest: Find the Lost Amulet (Progress: Followed tracks to cave)\nMilestones: Defeated Goblin Sentry, Learned Basic Herbalism"
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

    // Ensure game state is not accidentally wiped
    if (updatedGameState.length < 10 && input.gameState.length > 10) {
        console.warn("AI returned suspiciously short game state, reverting to previous state.");
        return {
            narration: narration + "\n\n(Narrator's Note: The world state seems momentarily unstable, reverting to the last known stable point.)",
            updatedGameState: input.gameState,
        };
    }


    return {
      narration: narration,
      updatedGameState: updatedGameState,
    };
  }
);
