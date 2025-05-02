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
import type { CharacterStats, SkillTree } from '@/context/GameContext'; // Import types

// Define Zod schema for CharacterStats
const CharacterStatsSchema = z.object({
  strength: z.number().describe('Character strength attribute (1-10 range).'),
  stamina: z.number().describe('Character stamina attribute (1-10 range).'),
  agility: z.number().describe('Character agility attribute (1-10 range).'),
});

// Define Zod schema for SkillTree (optional, might be null)
// We only need a summary for the prompt, not the full complex structure validation here.
const SkillTreeSummarySchema = z.object({
    className: z.string().describe("The class the skill tree belongs to."),
    stageCount: z.number().describe("The total number of stages in the tree (should be 4)."),
    skillsInCurrentStage: z.array(z.string()).optional().describe("Names of skills available at the character's current stage."),
}).nullable(); // Make the whole skill tree summary optional


const NarrateAdventureInputSchema = z.object({
  character: z.object({
    name: z.string().describe('Character name.'),
    class: z.string().describe('Character class (e.g., Warrior, Mage, Rogue).'),
    description: z.string().describe('A brief description of the character (appearance, personality, backstory snippet).'),
    traits: z.array(z.string()).describe('List of character traits (e.g., Brave, Curious).'),
    knowledge: z.array(z.string()).describe('List of character knowledge areas (e.g., Magic, History).'),
    background: z.string().describe('Character background (e.g., Soldier, Royalty).'),
    stats: CharacterStatsSchema,
    skillTreeSummary: SkillTreeSummarySchema.describe("A summary of the character's current class skill tree and unlocked skills."), // Add skill tree summary
    skillTreeStage: z.number().min(0).max(4).describe("The character's current skill progression stage (0-4). Stage affects available actions/skill power."), // Add current stage
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
  updatedStats: CharacterStatsSchema.partial().optional().describe('Optional: Changes to character stats resulting from the narration (e.g., gained 1 strength). Only include changed stats.'),
  updatedTraits: z.array(z.string()).optional().describe('Optional: The complete new list of character traits if they changed.'),
  updatedKnowledge: z.array(z.string()).optional().describe('Optional: The complete new list of character knowledge areas if they changed.'),
  // Fields related to dynamic class/skill progression
  updatedClass: z.string().optional().describe('Optional: The new character class if it changed due to events.'),
  progressedToStage: z.number().min(1).max(4).optional().describe('Optional: If the character progressed to a new skill stage (1-4) based on achievements/actions.'),
  suggestedClassChange: z.string().optional().describe("Optional: If the AI detects the player's actions consistently align with a *different* class, suggest that class name here."),
});
export type NarrateAdventureOutput = z.infer<typeof NarrateAdventureOutputSchema>;

export async function narrateAdventure(input: NarrateAdventureInput): Promise<NarrateAdventureOutput> {
  return narrateAdventureFlow(input);
}

const narrateAdventurePrompt = ai.definePrompt({
  name: 'narrateAdventurePrompt',
  input: { schema: NarrateAdventureInputSchema },
  output: { schema: NarrateAdventureOutputSchema },
  prompt: `You are a dynamic and engaging AI narrator for the text-based adventure game, "Endless Tales". Your role is to weave a compelling story based on player choices, character attributes, and the established game world, and update the character's progression, including skill stages and potential class changes.

**Game Context:**
{{{gameState}}}
*Note: The game state string above contains the character's current inventory.*

{{#if previousNarration}}
**Previous Scene:**
{{{previousNarration}}}
{{/if}}

**Player Character:**
Name: {{{character.name}}}
Class: {{{character.class}}}
Stats: Strength {{{character.stats.strength}}}, Stamina {{{character.stats.stamina}}}, Agility {{{character.stats.agility}}}
Traits: {{#if character.traits}}{{#each character.traits}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None{{/if}}
Knowledge: {{#if character.knowledge}}{{#each character.knowledge}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None{{/if}}
Background: {{{character.background}}}
Skill Stage: {{{character.skillTreeStage}}} / 4
{{#if character.skillTreeSummary}}Skills Available at Stage {{{character.skillTreeStage}}}: {{#if character.skillTreeSummary.skillsInCurrentStage}}{{#each character.skillTreeSummary.skillsInCurrentStage}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None{{/if}}{{else}} (No skill tree active){{/if}}
Description: {{{character.description}}}
{{#if character.aiGeneratedDescription}}Detailed Profile: {{{character.aiGeneratedDescription}}}{{/if}}

**Player's Action:**
{{{playerChoice}}}

**Your Task:**
Generate the next part of the story based on ALL the information above.

1.  **React Dynamically:** Describe the outcome of the player's action. Consider their character's class, stats, traits, knowledge, background, *current skill stage*, available skills, inventory, and the current gameState (location, items, situation, milestones).
2.  **Logical Progression & Restrictions:**
    *   **Evaluate Feasibility:** Assess if the action is logically possible given the situation, abilities (stats, class, knowledge, traits, *skills available at current stage*), inventory, and progress (milestones). *Actions tied to higher skill stages should only be possible if the character has reached that stage.*
    *   **Block Impossible Actions:** Prevent impossible actions (e.g., "destroy the universe", "teleport", "become king instantly", "control time") unless EXTREME justification exists in gameState (e.g., specific items, high-level milestones AND high skill stage).
    *   **Narrate Failure Reason:** If blocked, narrate *why* it fails (e.g., lacking strength, knowledge, required skill stage, specific item, political power).
    *   **Skill-based Progression:** Extremely powerful actions require significant milestones AND reaching high skill stages (e.g., Stage 4) in their skill tree.
3.  **Incorporate Dice Rolls:** Interpret dice roll results (e.g., "(Difficulty: Hard, Dice Roll Result: 75/100)") contextually based on difficulty and character capabilities. High rolls on hard tasks succeed, low rolls fail. Narrate the degree of success/failure.
4.  **Consequences, Inventory & Character Progression:**
    *   **Inventory:** If inventory changes, include the 'updatedInventory' field with the COMPLETE list of item names. Omit if no change.
    *   **Character Progression (Optional):** If events lead to development:
        *   Include 'updatedStats' for stat changes.
        *   Include 'updatedTraits' with the *complete new list* if traits changed.
        *   Include 'updatedKnowledge' with the *complete new list* if knowledge changed.
        *   **Skill Stage Progression:** If the character accomplishes a significant feat, overcomes a major challenge related to their class, or achieves a relevant milestone mentioned in the gameState, consider if they should advance to the next skill stage (1-4). If they progress, include the 'progressedToStage' field with the *new* stage number (e.g., 'progressedToStage: 2'). Only progress one stage at a time per narration.
        *   **Class Change Suggestion:** If the player's actions *consistently and significantly* deviate from their current class and strongly align with another class archetype (e.g., a Warrior constantly using magic, a Mage relying solely on brawling), you MAY suggest a class change by including the 'suggestedClassChange' field with the name of the *new* class (e.g., 'suggestedClassChange: "Spellsword"'). This is a suggestion; the game logic will handle the actual change if confirmed. Only suggest if the pattern is clear and persistent over several turns. Do NOT include 'updatedClass' yourself.
5.  **Update Game State:** Modify the 'gameState' string concisely to reflect changes (location, inventory, NPC mood, time, quest progress, milestones achieved, status, *skill stage*). Ensure it reflects inventory and potential stage changes accurately. Include a summary of the character's class and skill stage in the updated state string.
6.  **Tone:** Maintain a consistent fantasy text adventure tone. Be descriptive and engaging.

**Output Format:** Respond ONLY with the JSON object containing 'narration', 'updatedGameState', and optionally 'updatedInventory', 'updatedStats', 'updatedTraits', 'updatedKnowledge', 'progressedToStage', 'suggestedClassChange'. Ensure the JSON is valid.

Example Output with Stage Progression:
{
  "narration": "By mastering the ancient incantation from the scroll, you feel a deeper connection to the arcane energies. You've unlocked new potential.",
  "updatedGameState": "Location: Mage Tower Archive\\nInventory: Scroll of Arcane Power, Wand\\nStatus: Empowered\\nTime: Evening\\nMilestones: Mastered Incantation\\nCharacter Class: Mage (Stage 2)",
  "progressedToStage": 2
}

Example Output with Class Change Suggestion:
{
  "narration": "Despite your warrior training, you consistently rely on clever traps and diversions rather than direct combat. Perhaps your path lies elsewhere?",
  "updatedGameState": "Location: Bandit Camp\\nInventory: Sword, Trap Kit\\nStatus: Healthy\\nTime: Night\\nCharacter Class: Warrior (Stage 1)",
  "suggestedClassChange": "Rogue"
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
     console.log("Sending to narrateAdventurePrompt:", JSON.stringify(input, null, 2));
     let output: NarrateAdventureOutput | undefined;
     let errorOccurred = false;
     let errorMessage = "AI Error: Narration generation failed";

     try {
         const result = await narrateAdventurePrompt(input);
         output = result.output;

         // Basic validation
         if (!output || !output.narration || !output.updatedGameState) {
             throw new Error("AI returned invalid output structure (missing narration or updatedGameState).");
         }
         // Validate optional progression fields if present
         if (output.progressedToStage && (output.progressedToStage < 1 || output.progressedToStage > 4)) {
            console.warn("AI returned invalid progressedToStage value:", output.progressedToStage);
            output.progressedToStage = undefined; // Discard invalid stage
         }
          if (output.suggestedClassChange && typeof output.suggestedClassChange !== 'string') {
              console.warn("AI returned invalid suggestedClassChange value:", output.suggestedClassChange);
              output.suggestedClassChange = undefined;
          }


     } catch (err: any) {
         console.error("AI narration error caught:", err);
         errorOccurred = true;
         if (err.message && err.message.includes('503')) {
            errorMessage = "AI Error: The story generation service is unavailable. Please try again shortly.";
         } else if (err.message && err.message.includes('overloaded')) {
             errorMessage = "AI Error: The story generation service is overloaded. Please try again shortly.";
         } else if (err.message && err.message.includes('Error fetching')) {
             errorMessage = "AI Error: Could not reach the story generation service. Check network or try again.";
         } else {
             errorMessage = `AI Error: ${err.message.substring(0, 150)}`; // Generic error
         }
     }

     // --- Validation & Fallback ---
     const narration = output?.narration?.trim();
     const updatedGameState = output?.updatedGameState?.trim();

     if (errorOccurred || !narration || !updatedGameState) {
        console.error("AI narration output missing, invalid, or error occurred:", output, errorOccurred);
        return {
            narration: `The threads of fate seem momentarily tangled. You pause, considering your next move as the world holds its breath. (${errorMessage})`,
            updatedGameState: input.gameState,
        };
     }

    console.log("Received from narrateAdventurePrompt:", JSON.stringify(output, null, 2));

    // Ensure game state is not accidentally wiped
    if (updatedGameState.length < 10 && input.gameState.length > 10) {
        console.warn("AI returned suspiciously short game state, reverting to previous state.");
        return {
            narration: narration + "\n\n(Narrator's Note: The world state seems momentarily unstable, reverting to the last known stable point.)",
            updatedGameState: input.gameState,
            updatedInventory: input.gameState.match(/Inventory: (.*)/)?.[1]?.split(', ').filter(Boolean) ?? undefined,
        };
    }

    // Return the full output including optional fields
    return {
      narration: narration,
      updatedGameState: updatedGameState,
      updatedInventory: output.updatedInventory,
      updatedStats: output.updatedStats,
      updatedTraits: output.updatedTraits,
      updatedKnowledge: output.updatedKnowledge,
      updatedClass: output.updatedClass, // Note: AI prompt asks *not* to set this, but schema allows it for flexibility. Logic should prioritize suggestedClassChange.
      progressedToStage: output.progressedToStage,
      suggestedClassChange: output.suggestedClassChange,
    };
  }
);


    