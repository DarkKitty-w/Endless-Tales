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
  gameState: z.string().describe('A string representing the current state of the game, including location, **current full inventory list**, ongoing events, character progression milestones achieved etc.'), // Emphasize inventory needed
  previousNarration: z.string().optional().describe('The narration text immediately preceding the player\'s current choice, for context.'),
});
export type NarrateAdventureInput = z.infer<typeof NarrateAdventureInputSchema>;

const NarrateAdventureOutputSchema = z.object({
  narration: z.string().describe('The AI-generated narration describing the outcome of the action and the current situation.'),
  updatedGameState: z.string().describe('The updated state of the game string after the player action and narration, reflecting changes in location, inventory, character status, time, or achieved milestones.'),
  updatedInventory: z.array(z.string()).optional().describe('An optional list of the character\'s complete inventory item names after the action. If provided, this list replaces the previous inventory. If omitted, the inventory is assumed unchanged.'),
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
*Note: The game state string above contains the character's current inventory.*

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

1.  **React Dynamically:** Describe the outcome of the player's action. Consider their character's stats (strength, stamina, agility), traits, knowledge, background, and the current gameState (location, items in inventory, situation, milestones).
2.  **Logical Progression & Restrictions:**
    *   **Evaluate Feasibility:** Assess if the player's action is logically possible given their current situation, abilities (stats, knowledge, traits), inventory, and progress (milestones in gameState).
    *   **Block Impossible Actions:** Prevent players from performing actions that are fundamentally impossible or vastly outside their current capabilities (e.g., "destroy the universe", "teleport to another dimension", "become king instantly", "control time").
    *   **Narrate Failure Reason:** If an action is blocked, narrate *why* it fails within the story's logic. Explain the character's limitations (e.g., "You lack the physical strength to...", "Your knowledge of magic doesn't extend to...", "That concept is beyond your current understanding.", "Becoming king requires political power you haven't earned.", "You don't have a [required item] in your inventory.").
    *   **Skill-based Progression:** Extremely powerful actions (like significant magic, ruling, dimension hopping) should ONLY be possible *after* the character achieves specific, major milestones clearly indicated in the gameState (e.g., "Milestone: Mastered Arcane Fundamentals", "Milestone: Gained Nobility Title", "Milestone: Found the Dimensional Key"). Do not allow these actions otherwise.
3.  **Incorporate Dice Rolls (d6, d10, d20, d100):**
    *   **Interpret Roll Contextually:** If the Player's Action includes "(Difficulty: [Level], Dice Roll Result: N/[Max])", interpret the outcome based on the assessed *difficulty* ([Level]) and the roll result (N) versus the max possible (Max).
    *   **Difficulty Matters:** A low roll on a *Hard* or *Very Hard* task is a clear failure. A high roll on an *Easy* task might grant a bonus. A mid-range roll on a *Normal* task could be partial success.
    *   **Narrate Accordingly:** Use the dice roll combined with the action's context and difficulty to determine the degree of success or failure. If no dice roll is mentioned, determine outcome based on context/character.
4.  **Consequences & Inventory:** Actions have consequences. Decisions can alter the story, inventory (gaining/losing items), location, status, etc. Reflect these changes.
    *   **If the inventory changes (items added, removed, or transformed):** You MUST include the updatedInventory field in your JSON output. This field should contain the COMPLETE list of item names the character possesses *after* the action.
    *   **If the inventory does not change:** You can OMIT the updatedInventory field.
5.  **Update Game State:** Modify the 'gameState' string concisely to reflect changes resulting from the player's action and the narration (e.g., new location, **updated inventory list**, NPC mood change, time passed, quest progress updated, milestone achieved, status changed like 'Injured'). Ensure it remains a readable string format and **accurately reflects the inventory changes**.
6.  **Tone:** Maintain a consistent tone suitable for a fantasy text adventure. Be descriptive and engaging.

**Output Format:** Respond ONLY with the JSON object containing 'narration', 'updatedGameState', and optionally 'updatedInventory'. Ensure the JSON is valid.

Example Output with Inventory Change:
{
  "narration": "You carefully pick the lock on the dusty chest. Inside, you find a gleaming Ruby and a small Potion.",
  "updatedGameState": "Location: Dank Cellar\nInventory: Sword, Healing Potion (1), Ruby, Small Potion\nStatus: Healthy\nTime: Afternoon\nQuest: Escape the Dungeon (Progress: Opened chest)",
  "updatedInventory": ["Sword", "Healing Potion", "Ruby", "Small Potion"]
}

Example Output without Inventory Change:
{
  "narration": "You scan the gloomy cellar but find nothing else of interest.",
  "updatedGameState": "Location: Dank Cellar\nInventory: Sword, Healing Potion (1)\nStatus: Healthy\nTime: Afternoon\nQuest: Escape the Dungeon (Progress: Searched cellar)"
}
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
     let output: NarrateAdventureOutput | undefined;
     let errorOccurred = false;
     let errorMessage = "AI Error: Narration generation failed"; // Default error message

     try {
         const result = await narrateAdventurePrompt(input); // Renamed to avoid shadowing
         output = result.output;
     } catch (err: any) {
         console.error("AI narration error caught:", err);
         errorOccurred = true;
         // Refine error message based on common issues
         if (err.message && err.message.includes('503') && err.message.includes('Service Unavailable')) {
            errorMessage = "AI Error: The story generation service is currently unavailable. Please try again shortly.";
         } else if (err.message && err.message.includes('overloaded')) {
             errorMessage = "AI Error: The story generation service is overloaded. Please try again shortly.";
         } else if (err.message && err.message.includes('Error fetching')) {
             errorMessage = "AI Error: Could not reach the story generation service. Check network or try again.";
         } else if (err.message) {
             errorMessage = `AI Error: ${err.message.substring(0, 100)}`; // Generic error
         }
     }


     // --- Validation & Fallback ---
     const narration = output?.narration?.trim();
     const updatedGameState = output?.updatedGameState?.trim();
     const updatedInventory = output?.updatedInventory; // Keep optional nature

     // Check if an error occurred OR if the output is invalid (narration or gameState missing)
     if (errorOccurred || !narration || !updatedGameState) {
        console.error("AI narration output missing, invalid, or error occurred:", output, errorOccurred);
        // Provide a safe fallback if AI fails
        return {
            narration: `The threads of fate seem momentarily tangled. You pause, considering your next move as the world holds its breath. (${errorMessage})`, // Use the refined error message
            updatedGameState: input.gameState, // Return original game state on error
            // Omit updatedInventory on error
        };
     }

    console.log("Received from narrateAdventurePrompt:", JSON.stringify(output, null, 2));

    // Ensure game state is not accidentally wiped
    if (updatedGameState.length < 10 && input.gameState.length > 10) {
        console.warn("AI returned suspiciously short game state, reverting to previous state.");
        return {
            narration: narration + "\n\n(Narrator's Note: The world state seems momentarily unstable, reverting to the last known stable point.)",
            updatedGameState: input.gameState,
             // Revert inventory too if game state reverted
            updatedInventory: input.gameState.match(/Inventory: (.*)/)?.[1]?.split(', ').filter(Boolean) ?? undefined,
        };
    }


    return {
      narration: narration,
      updatedGameState: updatedGameState,
      updatedInventory: updatedInventory, // Pass along the optional inventory list
    };
  }
);
