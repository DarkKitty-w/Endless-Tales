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
import type { CharacterStats, SkillTree, Skill, ReputationChange } from '@/context/GameContext'; // Import Skill and ReputationChange types

// Define Zod schema for CharacterStats
const CharacterStatsSchema = z.object({
  strength: z.number().describe('Character strength attribute (1-10 range).'),
  stamina: z.number().describe('Character stamina attribute (1-10 range).'),
  agility: z.number().describe('Character agility attribute (1-10 range).'),
});

// Define Zod schema for Skill (used in output)
const SkillSchema = z.object({
    name: z.string().describe("The name of the skill."),
    description: z.string().describe("A brief description of what the skill does or represents."),
    manaCost: z.number().optional().describe("Mana cost to use the skill, if any."),
    staminaCost: z.number().optional().describe("Stamina cost to use the skill, if any."),
});

// Define Zod schema for SkillTree Summary (used in input)
const SkillTreeSummarySchema = z.object({
    className: z.string().describe("The class the skill tree belongs to."),
    stageCount: z.number().describe("The total number of stages in the tree (should be 4 + stage 0)."), // 0-4 stages
    availableSkillsAtCurrentStage: z.array(z.string()).optional().describe("Names of skills available (but not necessarily learned) at the character's current stage."),
}).nullable(); // Make the whole skill tree summary optional

// Define Zod schema for Reputation Change (used in output)
const ReputationChangeSchema = z.object({
    faction: z.string().describe("The name of the faction whose reputation changed."),
    change: z.number().int().describe("The amount the reputation changed (positive or negative)."),
});


const NarrateAdventureInputSchema = z.object({
  character: z.object({
    name: z.string().describe('Character name.'),
    class: z.string().describe('Character class (e.g., Warrior, Mage, Rogue).'),
    description: z.string().describe('A brief description of the character (appearance, personality, backstory snippet).'),
    traits: z.array(z.string()).describe('List of character traits (e.g., Brave, Curious).'),
    knowledge: z.array(z.string()).describe('List of character knowledge areas (e.g., Magic, History).'),
    background: z.string().describe('Character background (e.g., Soldier, Royalty).'),
    stats: CharacterStatsSchema,
    // Resources
    currentStamina: z.number().describe('Current stamina points.'),
    maxStamina: z.number().describe('Maximum stamina points.'),
    currentMana: z.number().describe('Current mana points.'),
    maxMana: z.number().describe('Maximum mana points.'),
    // Progression
    level: z.number().describe("Character's current level."),
    xp: z.number().describe("Character's current experience points."),
    xpToNextLevel: z.number().describe("Experience points needed for the next level."),
    reputation: z.record(z.number()).describe("Current reputation scores with various factions (e.g., {\"Town Guard\": 10, \"Thieves Guild\": -5})."),
    // Skills
    skillTreeSummary: SkillTreeSummarySchema.describe("A summary of the character's current class skill tree and available skills at their stage."), // Add skill tree summary
    skillTreeStage: z.number().min(0).max(4).describe("The character's current skill progression stage (0-4). Stage affects available actions/skill power."), // Add current stage
    learnedSkills: z.array(z.string()).describe("List of skill names the character has actually learned."), // Add learned skills list
    aiGeneratedDescription: z.string().optional().describe('Optional detailed AI-generated character profile.'),
  }).describe('The player character details.'),
  playerChoice: z.string().describe('The player\'s chosen action or command. May include dice roll result like "(Dice Roll Result: 4)". May be an attempt to use a learned skill by name.'),
  gameState: z.string().describe('A string representing the current state of the game, including location, **current full inventory list**, ongoing events, character progression milestones achieved etc.'), // Emphasize inventory needed
  previousNarration: z.string().optional().describe('The narration text immediately preceding the player\'s current choice, for context.'),
});
export type NarrateAdventureInput = z.infer<typeof NarrateAdventureInputSchema>;

const NarrateAdventureOutputSchema = z.object({
  narration: z.string().describe('The AI-generated narration describing the outcome of the action and the current situation.'),
  updatedGameState: z.string().describe('The updated state of the game string after the player action and narration, reflecting changes in location, inventory, character status (including stamina/mana, level, XP, reputation), time, or achieved milestones.'),
  updatedInventory: z.array(z.string()).optional().describe('An optional list of the character\'s complete inventory item names after the action. If provided, this list replaces the previous inventory. If omitted, the inventory is assumed unchanged.'),
  // Character progression outputs
  updatedStats: CharacterStatsSchema.partial().optional().describe('Optional: Changes to character stats resulting from the narration (e.g., gained 1 strength). Only include changed stats.'),
  updatedTraits: z.array(z.string()).optional().describe('Optional: The complete new list of character traits if they changed.'),
  updatedKnowledge: z.array(z.string()).optional().describe('Optional: The complete new list of character knowledge areas if they changed.'),
  xpGained: z.number().int().min(0).optional().describe('Optional: The amount of XP gained from this action/event.'), // Add XP gained
  reputationChange: ReputationChangeSchema.optional().describe('Optional: Change in reputation with a specific faction.'), // Add reputation change
  // Resource changes
  staminaChange: z.number().optional().describe('Optional: Change in current stamina (negative for cost, positive for gain).'),
  manaChange: z.number().optional().describe('Optional: Change in current mana (negative for cost, positive for gain).'),
  // Fields related to dynamic class/skill progression
  updatedClass: z.string().optional().describe('Deprecated: Suggest class changes via suggestedClassChange instead.'),
  progressedToStage: z.number().min(1).max(4).optional().describe('Optional: If the character progressed to a new skill stage (1-4) based on achievements/actions.'),
  suggestedClassChange: z.string().optional().describe("Optional: If the AI detects the player's actions consistently align with a *different* class, suggest that class name here."),
  gainedSkill: SkillSchema.optional().describe("Optional: If the character learned a new skill through their actions or discoveries."), // Added gainedSkill
});
export type NarrateAdventureOutput = z.infer<typeof NarrateAdventureOutputSchema>;

export async function narrateAdventure(input: NarrateAdventureInput): Promise<NarrateAdventureOutput> {
  return narrateAdventureFlow(input);
}

const narrateAdventurePrompt = ai.definePrompt({
  name: 'narrateAdventurePrompt',
  input: { schema: NarrateAdventureInputSchema },
  output: { schema: NarrateAdventureOutputSchema },
  prompt: `You are a dynamic and engaging AI narrator for the text-based adventure game, "Endless Tales". Your role is to weave a compelling story based on player choices, character attributes (stats, level, xp, reputation), resources (stamina/mana), skills, and the established game world, updating the character's progression (including XP and reputation) and potentially awarding new skills.

**Game Context:**
{{{gameState}}}
*Note: The game state string above contains the character's current inventory, status, level, XP, reputation, and progress.*

{{#if previousNarration}}
**Previous Scene:**
{{{previousNarration}}}
{{/if}}

**Player Character:**
Name: {{{character.name}}}
Class: {{{character.class}}} (Level {{{character.level}}})
XP: {{{character.xp}}}/{{{character.xpToNextLevel}}}
Reputation: {{#if character.reputation}}{{#each character.reputation}} {{ @key }}: {{ this }}; {{/each}}{{else}}None{{/if}}
Stats: Strength {{{character.stats.strength}}}, Stamina {{{character.stats.stamina}}}, Agility {{{character.stats.agility}}}
Resources: Stamina {{{character.currentStamina}}}/{{{character.maxStamina}}}, Mana {{{character.currentMana}}}/{{{character.maxMana}}}
Traits: {{#if character.traits}}{{#each character.traits}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None{{/if}}
Knowledge: {{#if character.knowledge}}{{#each character.knowledge}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None{{/if}}
Background: {{{character.background}}}
Skill Stage: {{{character.skillTreeStage}}} / 4
{{#if character.skillTreeSummary}}Skills Available at Stage {{{character.skillTreeStage}}}: {{#if character.skillTreeSummary.availableSkillsAtCurrentStage}}{{#each character.skillTreeSummary.availableSkillsAtCurrentStage}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None{{/if}}{{else}} (No skill tree active){{/if}}
Learned Skills: {{#if character.learnedSkills}}{{#each character.learnedSkills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None{{/if}}
Description: {{{character.description}}}
{{#if character.aiGeneratedDescription}}Detailed Profile: {{{character.aiGeneratedDescription}}}{{/if}}

**Player's Action:**
{{{playerChoice}}}

**Your Task:**
Generate the next part of the story based on ALL the information above.

1.  **React Dynamically:** Describe the outcome of the player's action. Consider their character's class, level, xp, reputation, stats, **current stamina and mana**, traits, knowledge, background, *current skill stage*, **learned skills**, inventory, and the current gameState (location, items, situation, milestones).
2.  **Logical Progression, Resource Costs & Restrictions:**
    *   **Evaluate Feasibility:** Assess if the action is logically possible. *Actions tied to higher skill stages should only be possible if the character has reached that stage.*
    *   **Check Learned Skills & Resources:** Verify if a used skill is learned and if enough resources (stamina/mana) are available. Narrate failure reasons (not learned, insufficient resources). Calculate costs and output 'staminaChange' or 'manaChange'.
    *   **Block Impossible Actions:** Prevent universe-breaking actions unless EXTREME justification exists in gameState AND skill stage is high.
    *   **Narrate Failure Reason:** If blocked/failed, explain why (lack of skill, resources, item, stage, reputation, etc.).
    *   **Skill-based Progression:** Very powerful actions require high milestones AND skill stages.
3.  **Incorporate Dice Rolls:** Interpret dice roll results (e.g., "(Difficulty: Hard, Dice Roll Result: 75/100)") contextually. Narrate the degree of success/failure. Success might grant more XP or better reputation changes. Failure might have negative consequences.
4.  **Consequences, Inventory, Resources, XP, Reputation & Character Progression:**
    *   **Inventory:** If inventory changes, include 'updatedInventory' field with the COMPLETE list of item names. Omit if no change.
    *   **Resource Changes:** If current stamina or mana changed, include 'staminaChange' or 'manaChange'.
    *   **XP Awards:** If the action was significant (overcame challenge, clever solution, quest progress), award XP by including the 'xpGained' field (e.g., 10, 25, 50). Be reasonable; don't award XP for trivial actions like walking.
    *   **Reputation Changes:** If the action affects a faction's view (helping guards, stealing from merchants), include 'reputationChange' with the 'faction' name and the integer 'change' amount (positive or negative, e.g., {"faction": "Town Guard", "change": 5}).
    *   **Character Progression (Optional):** If events lead to development:
        *   Include 'updatedStats' for stat changes.
        *   Include 'updatedTraits' with the *complete new list*.
        *   Include 'updatedKnowledge' with the *complete new list*.
        *   **Skill Stage Progression:** Consider if the character should advance to the next skill stage (1-4) based on significant achievements/milestones. If so, include 'progressedToStage'. Only one stage per narration.
        *   **Class Change Suggestion:** If actions consistently align with another class, MAYBE suggest it via 'suggestedClassChange'. Do NOT include 'updatedClass'.
        *   **Gaining Skills:** If appropriate, award a new skill via 'gainedSkill' (name, description, costs). Do not award skills trivially.
5.  **Update Game State:** Modify the 'gameState' string concisely to reflect ALL changes (location, inventory, NPC mood, time, quest progress, milestones, **status including resources, level, XP, and reputation**). Ensure it accurately reflects inventory, resource, XP, reputation, and potential stage/skill changes. Include character class, level, stage, and learned skills summary.
6.  **Tone:** Maintain a consistent fantasy text adventure tone. Be descriptive and engaging.

**Output Format:** Respond ONLY with the JSON object matching the schema, including 'narration', 'updatedGameState', and optionally other fields like 'updatedInventory', 'staminaChange', 'manaChange', 'xpGained', 'reputationChange', 'updatedStats', 'updatedTraits', 'updatedKnowledge', 'progressedToStage', 'suggestedClassChange', 'gainedSkill'. Ensure the JSON is valid.

Example Output with XP and Reputation Change:
{
  "narration": "You successfully defended the merchant from the bandits! He gratefully offers you a pouch of coins and praises your bravery to the nearby Town Guard captain.",
  "updatedGameState": "Location: Trade Road\\nInventory: Torch, Sword, Pouch of Coins\\nStatus: Healthy (STA: 80/100, MANA: 15/20)\\nTime: Midday\\nQuest: Escort Merchant (Complete)\\nMilestones: Defended Merchant\\nCharacter Class: Warrior (Level 2, 15/250 XP)\\nReputation: Town Guard: 15, Merchants Guild: 5\\nLearned Skills: Observe, Basic Strike, Shield Block, Toughen Up",
  "updatedInventory": ["Torch", "Sword", "Pouch of Coins"],
  "xpGained": 50,
  "reputationChange": { "faction": "Town Guard", "change": 10 }
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
     let attempt = 0;
     const maxAttempts = 3;

     while (attempt < maxAttempts && !output) {
        attempt++;
        console.log(`Narration attempt ${attempt}...`);
        try {
            const result = await narrateAdventurePrompt(input);
            output = result.output;

             // Basic validation
             if (!output || !output.narration || !output.updatedGameState) {
                 throw new Error(`AI returned invalid output structure (attempt ${attempt})`);
             }
             // Validate optional progression fields if present
              if (output.xpGained && (!Number.isInteger(output.xpGained) || output.xpGained < 0)) {
                console.warn("AI returned invalid xpGained value:", output.xpGained);
                output.xpGained = undefined; // Discard invalid XP
             }
             if (output.reputationChange && (!output.reputationChange.faction || !Number.isInteger(output.reputationChange.change))) {
                 console.warn("AI returned invalid reputationChange structure:", output.reputationChange);
                 output.reputationChange = undefined; // Discard invalid rep change
             }
             if (output.progressedToStage && (output.progressedToStage < 1 || output.progressedToStage > 4)) {
                console.warn("AI returned invalid progressedToStage value:", output.progressedToStage);
                output.progressedToStage = undefined; // Discard invalid stage
             }
             if (output.suggestedClassChange && typeof output.suggestedClassChange !== 'string') {
                 console.warn("AI returned invalid suggestedClassChange value:", output.suggestedClassChange);
                 output.suggestedClassChange = undefined;
             }
             if (output.gainedSkill && (!output.gainedSkill.name || !output.gainedSkill.description)) {
                  console.warn("AI returned invalid gainedSkill structure:", output.gainedSkill);
                  output.gainedSkill = undefined;
             }
             if (output.staminaChange && typeof output.staminaChange !== 'number') {
                 console.warn("AI returned invalid staminaChange value:", output.staminaChange);
                 output.staminaChange = undefined;
             }
              if (output.manaChange && typeof output.manaChange !== 'number') {
                 console.warn("AI returned invalid manaChange value:", output.manaChange);
                 output.manaChange = undefined;
             }


        } catch (err: any) {
            console.error(`AI narration attempt ${attempt} error:`, err);
            errorOccurred = true;
             if (err.message?.includes('503') || err.message?.includes('overloaded')) {
                errorMessage = `AI Error: The story generation service is overloaded (Attempt ${attempt}/${maxAttempts}). Please try again shortly.`;
                // Optional: Wait longer before retrying on overload
                if (attempt < maxAttempts) await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
             } else if (err.message?.includes('Error fetching')) {
                 errorMessage = `AI Error: Could not reach the story generation service (Attempt ${attempt}/${maxAttempts}). Check network or try again.`;
                 if (attempt < maxAttempts) await new Promise(resolve => setTimeout(resolve, 500 * attempt));
             } else {
                 errorMessage = `AI Error: ${err.message?.substring(0, 150) || 'Unknown error'} (Attempt ${attempt}/${maxAttempts})`;
                 if (attempt < maxAttempts) await new Promise(resolve => setTimeout(resolve, 500 * attempt));
             }
        }
     }

     // --- Validation & Fallback after all attempts ---
     if (!output || !output.narration || !output.updatedGameState) {
        console.error("AI narration failed after all attempts:", errorMessage);
        return {
            narration: `The threads of fate seem momentarily tangled. You pause, considering your next move as the world holds its breath. (${errorMessage})`,
            updatedGameState: input.gameState, // Return original game state on complete failure
        };
     }

    console.log("Received valid narration from narrateAdventurePrompt:", JSON.stringify(output, null, 2));

    // Ensure game state is not accidentally wiped
    if (output.updatedGameState.trim().length < 10 && input.gameState.trim().length > 10) {
        console.warn("AI returned suspiciously short game state, reverting to previous state.");
        return {
            narration: output.narration + "\n\n(Narrator's Note: The world state seems momentarily unstable, reverting to the last known stable point.)",
            updatedGameState: input.gameState,
            updatedInventory: input.gameState.match(/Inventory: (.*)/)?.[1]?.split(', ').filter(Boolean) ?? undefined,
             // Keep potential progression/resource changes from the AI output even if state reverts
             xpGained: output.xpGained,
             reputationChange: output.reputationChange,
             staminaChange: output.staminaChange,
             manaChange: output.manaChange,
             updatedStats: output.updatedStats,
             updatedTraits: output.updatedTraits,
             updatedKnowledge: output.updatedKnowledge,
             gainedSkill: output.gainedSkill,
             // Don't revert progression suggestions on state revert
             progressedToStage: output.progressedToStage,
             suggestedClassChange: output.suggestedClassChange,
        };
    }

    // Return the full output including optional fields
    return output;
  }
);
