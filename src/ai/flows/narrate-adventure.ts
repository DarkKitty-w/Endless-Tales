'use server';
/**
 * @fileOverview An AI agent that narrates the story of a text adventure game based on player actions and game state.
 *
 * - narrateAdventure - A function that generates the next part of the story.
 * - NarrateAdventureInput - The input type for the narrateAdventure function.
 * - NarrateAdventureOutput - The return type for the narrateAdventure function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import type { CharacterStats, SkillTree, Skill, ReputationChange, NpcRelationshipChange, InventoryItem } from '@/types/game-types'; // Import types from central location
import { toast } from '@/hooks/use-toast'; // Import toast for user feedback

// --- Zod Schemas (Internal - Not Exported) ---
const CharacterStatsSchema = z.object({
  strength: z.number().describe('Character strength attribute (1-10 range).'),
  stamina: z.number().describe('Character stamina attribute (1-10 range).'),
  agility: z.number().describe('Character agility attribute (1-10 range).'),
  intellect: z.number().describe('Character intellect attribute (1-10 range).'),
  wisdom: z.number().describe('Character wisdom attribute (1-10 range).'),
  charisma: z.number().describe('Character charisma attribute (1-10 range).'),
});

const SkillSchema = z.object({
    name: z.string().describe("The name of the skill."),
    description: z.string().describe("A brief description of what the skill does or represents."),
    type: z.enum(["Starter", "Learned"]).optional().describe("Indicates if the skill was a starter skill or learned during gameplay."), // Added type
    manaCost: z.number().optional().describe("Mana cost to use the skill, if any."),
    staminaCost: z.number().optional().describe("Stamina cost to use the skill, if any."),
});


const SkillTreeSummarySchema = z.object({
    className: z.string().describe("The class the skill tree belongs to."),
    stageCount: z.number().describe("The total number of stages in the tree (should be 4 + stage 0)."), // 0-4 stages
    availableSkillsAtCurrentStage: z.array(z.string()).optional().describe("Names of skills available (but not necessarily learned) at the character's current stage."),
}).nullable(); // Make the whole skill tree summary optional

const ReputationChangeSchema = z.object({
    faction: z.string().describe("The name of the faction whose reputation changed."),
    change: z.number().int().describe("The amount the reputation changed (positive or negative)."),
});

const NpcRelationshipChangeSchema = z.object({
    npcName: z.string().describe("The name of the NPC whose relationship changed."),
    change: z.number().int().describe("The amount the relationship score changed (positive or negative)."),
});

// Define schema for branching choices
const BranchingChoiceSchema = z.object({
    text: z.string().describe("The text describing the choice option for the player."),
    consequenceHint: z.string().optional().describe("A subtle hint about the potential outcome or required check (e.g., 'Might require agility', 'Could anger the guard')."),
});

const NarrateAdventureInputSchema = z.object({
  character: z.object({
    name: z.string().describe('Character name.'),
    class: z.string().describe('Character class (e.g., Warrior, Mage, Rogue). **Handle "admin000" as a special developer mode.**'), // Highlight dev mode
    description: z.string().describe('A brief description of the character (appearance, personality, backstory snippet).'),
    traits: z.array(z.string()).describe('List of character traits (e.g., Brave, Curious).'),
    knowledge: z.array(z.string()).describe('List of character knowledge areas (e.g., Magic, History).'),
    background: z.string().describe('Character background (e.g., Soldier, Royalty).'),
    stats: CharacterStatsSchema,
    currentStamina: z.number().describe('Current stamina points.'),
    maxStamina: z.number().describe('Maximum stamina points.'),
    currentMana: z.number().describe('Current mana points.'),
    maxMana: z.number().describe('Maximum mana points.'),
    level: z.number().describe("Character's current level."),
    xp: z.number().describe("Character's current experience points."),
    xpToNextLevel: z.number().describe("Experience points needed for the next level."),
    reputation: z.record(z.number()).describe("Current reputation scores with various factions (e.g., {\"Town Guard\": 10, \"Thieves Guild\": -5})."),
    npcRelationships: z.record(z.number()).describe("Current relationship scores with specific NPCs (e.g., {\"Elara\": 25, \"Guard Captain\": -10})."),
    skillTreeSummary: SkillTreeSummarySchema.describe("A summary of the character's current class skill tree and available skills at their stage."), // Add skill tree summary
    skillTreeStage: z.number().min(0).max(4).describe("The character's current skill progression stage (0-4). Stage affects available actions/skill power."), // Add current stage
    learnedSkills: z.array(z.string()).describe("List of skill names the character has actually learned."), // Add learned skills list
    aiGeneratedDescription: z.string().optional().describe('Optional detailed AI-generated character profile.'),
  }).describe('The player character details.'),
  playerChoice: z.string().describe('The player\'s chosen action or command. May include dice roll result like "(Dice Roll Result: 4)". May be an attempt to use a learned skill by name.'),
  gameState: z.string().describe('A string representing the current state of the game, including location, **current full inventory list**, ongoing events, character progression milestones achieved, **and known NPC states/relationships**.'),
  previousNarration: z.string().optional().describe('The narration text immediately preceding the player\'s current choice, for context.'),
  adventureSettings: z.object({ // Include adventure settings
      difficulty: z.string().describe("Overall game difficulty (e.g., Easy, Normal, Hard, Nightmare). Influences challenge levels and potential event triggers."),
      permanentDeath: z.boolean().describe("Whether permanent death is enabled."),
      adventureType: z.enum(["Randomized", "Custom"]).nullable().describe("Type of adventure."),
      // Add custom fields only if adventureType is Custom
      worldType: z.string().optional().describe("The specified world type (if Custom adventure)."),
      mainQuestline: z.string().optional().describe("The specified main quest goal (if Custom adventure)."),
  }).describe("The overall settings for the current adventure."),
  turnCount: z.number().describe("The current turn number of the adventure. Can be used to trigger time-based events."),
});

const NarrateAdventureOutputSchema = z.object({
  narration: z.string().describe('**REQUIRED.** The AI-generated narration describing the outcome of the action and the current situation. **Should occasionally introduce branching choices or dynamic events.**'),
  updatedGameState: z.string().describe('**REQUIRED.** The updated state of the game string after the player action and narration. **MUST accurately reflect changes** in location, inventory, character status (including stamina/mana, level, XP, reputation, NPC relationships), time, or achieved milestones. **MUST include the current Turn count (e.g., "Turn: 16").**'),
  updatedStats: CharacterStatsSchema.partial().optional().describe('Optional: Changes to character stats resulting from the narration (e.g., gained 1 strength). **Only include if stats actually changed.**'),
  updatedTraits: z.array(z.string()).optional().describe('Optional: The complete new list of character traits **only if they changed.**'),
  updatedKnowledge: z.array(z.string()).optional().describe('Optional: The complete new list of character knowledge areas **only if they changed.**'),
  xpGained: z.number().int().min(0).optional().describe('Optional: The amount of XP gained **only if XP was awarded.**'), // Add XP gained
  reputationChange: ReputationChangeSchema.optional().describe('Optional: Change in reputation with a specific faction **only if reputation changed.**'), // Add reputation change
  npcRelationshipChange: NpcRelationshipChangeSchema.optional().describe('Optional: Change in relationship score with a specific NPC **only if relationship changed.**'), // Add NPC relationship change
  staminaChange: z.number().optional().describe('Optional: Change in current stamina (negative for cost, positive for gain). **Only include if stamina changed.**'),
  manaChange: z.number().optional().describe('Optional: Change in current mana (negative for cost, positive for gain). **Only include if mana changed.**'),
  progressedToStage: z.number().min(1).max(4).optional().describe('Optional: The new skill stage (1-4) **only if the character progressed to a new stage.**'),
  suggestedClassChange: z.string().optional().describe("Optional: Suggest a different class name **only if the AI detects the player's actions consistently align with a different class.**"),
  gainedSkill: SkillSchema.optional().describe("Optional: Details of a new skill **only if the character learned a new skill.**"), // Added gainedSkill
  // New fields for branching narratives and events
  branchingChoices: z.array(BranchingChoiceSchema).length(4).optional().describe("Optional: Always 4 significant choices presented to the player, **only if relevant narrative branches occurred.**"),
  dynamicEventTriggered: z.string().optional().describe("Optional: A brief description **only if a random or time-based dynamic world event occurred.**"),
});

// --- Exported Types (Derived from internal schemas) ---
export type NarrateAdventureInput = z.infer<typeof NarrateAdventureInputSchema>;
export type NarrateAdventureOutput = z.infer<typeof NarrateAdventureOutputSchema>;

// --- Exported Async Function ---
export async function narrateAdventure(input: NarrateAdventureInput): Promise<NarrateAdventureOutput> {
  // Check for Developer Mode
  if (input.character.class === 'admin000') {
    console.log("Developer Mode detected in narrateAdventure. Skipping standard AI narration.");
    // Process dev commands or return simple success
    return processDevCommand(input); // Use the new helper function
  }
  return narrateAdventureFlow(input);
}

// --- Helper Function for Developer Commands ---
function processDevCommand(input: NarrateAdventureInput): NarrateAdventureOutput {
    const { character, playerChoice, gameState, turnCount } = input;
    const command = playerChoice.trim().toLowerCase();
    const parts = command.split(' ');
    const baseCommand = parts[0];
    const value = parts.length > 1 ? parts.slice(1).join(' ') : undefined;

    let devNarration = `(Developer Mode) Action: "${playerChoice}"`;
    let updatedStats: Partial<CharacterStats> | undefined = undefined;
    let xpGained: number | undefined = undefined;
    let progressedToStage: number | undefined = undefined;
    let addedItemName: string | undefined = undefined;
    let removedItemName: string | undefined = undefined;

    try { // Wrap dev commands in try/catch
        if (baseCommand === '/xp' && value) {
            const amount = parseInt(value, 10);
            if (!isNaN(amount)) {
                xpGained = amount;
                devNarration = `(Developer Mode) Granted ${amount} XP.`;
                // Level up logic will be handled by the reducer after dispatch
            } else {
                devNarration += " - Invalid XP amount.";
            }
        } else if (baseCommand === '/stage' && value) {
            const stageNum = parseInt(value, 10);
            if (!isNaN(stageNum) && stageNum >= 0 && stageNum <= 4) {
                progressedToStage = stageNum;
                devNarration = `(Developer Mode) Set skill stage to ${stageNum}.`;
            } else {
                devNarration += " - Invalid stage number (0-4).";
            }
        } else if (baseCommand === '/additem' && value) {
            addedItemName = value; // Signal to reducer to add this item
            devNarration = `(Developer Mode) Added item: ${value}.`;
        } else if (baseCommand === '/removeitem' && value) {
            removedItemName = value; // Signal to reducer to remove this item
            devNarration = `(Developer Mode) Attempted to remove item: ${value}.`;
        } else if (baseCommand === '/stat' && parts.length === 3) {
            const statKey = parts[1].toLowerCase() as keyof CharacterStats;
            const statValue = parseInt(parts[2], 10);
            if (Object.keys(character.stats).includes(statKey) && !isNaN(statValue)) {
                 updatedStats = { [statKey]: statValue };
                 devNarration = `(Developer Mode) Set ${statKey} to ${statValue}.`;
            } else {
                devNarration += " - Invalid stat or value (e.g., /stat strength 8).";
            }
        }
         else {
            // Default success message if no specific command matched
            devNarration += " performed successfully. Restrictions bypassed.";
        }

        // Generate a basic updated game state string for dev mode
        const updatedGameStateString = `Turn: ${turnCount + 1}\n${gameState.replace(/Turn: \d+/, '')}\nDEV MODE ACTIVE - Last command: ${playerChoice}`;

        // Return the structure expected by the reducer, including necessary updates
        return {
            narration: devNarration,
            updatedGameState: updatedGameStateString,
            xpGained: xpGained,
            progressedToStage: progressedToStage,
            // Need to pass these signals to the reducer to handle inventory/stat changes
            // The reducer logic needs to be updated to handle these specifically for dev mode if not already done.
            // For example, ADD_ITEM/REMOVE_ITEM actions could be dispatched directly from Gameplay.tsx for dev commands.
            // Or, the UPDATE_NARRATION action in the reducer could interpret these dev mode outputs.
            // For now, sending the information in the standard fields:
            updatedStats: updatedStats,
            // Let's assume inventory changes are handled by separate dispatches in Gameplay for dev mode.
        };

    } catch (devError: any) {
        console.error("Error processing dev command:", devError);
        return {
            narration: `(Developer Mode) Command failed: ${devError.message}`,
            updatedGameState: `Turn: ${turnCount + 1}\n${gameState.replace(/Turn: \d+/, '')}\nDEV MODE ERROR`,
        };
    }
}


// --- Internal Prompt and Flow Definitions ---
const narrateAdventurePrompt = ai.definePrompt({
  name: 'narrateAdventurePrompt',
  input: { schema: NarrateAdventureInputSchema },
  output: { schema: NarrateAdventureOutputSchema },
  prompt: `You are a dynamic and engaging AI narrator for the text-based adventure game, "Endless Tales". Your role is to weave a compelling, potentially branching story based on player choices, character attributes, resources, skills, and the established game world, updating progression and occasionally introducing dynamic events or significant narrative choices.

**Game Settings:** Difficulty: {{{adventureSettings.difficulty}}}, Permadeath: {{{adventureSettings.permanentDeath}}}
{{#if adventureSettings.worldType}}
{{#if adventureSettings.mainQuestline}}
**Adventure Type:** Custom
**World:** {{{adventureSettings.worldType}}}, Goal: {{{adventureSettings.mainQuestline}}}
{{else}}
**Adventure Type:** Custom (World: {{{adventureSettings.worldType}}}, Goal: Not Specified)
{{/if}}
{{else if adventureSettings.adventureType}}
**Adventure Type:** Randomized (World/Goal: Generate based on character details below)
**INSTRUCTION:** If the adventure type is 'Randomized', **especially on the first few turns**, focus the narration on establishing a unique setting, initial challenge, or short-term goal derived directly from the character's class, background, traits, or knowledge.
*Use these details to make the randomized world feel tailored to the player character.*
{{else}}
**Adventure Type:** Not specified
{{/if}}
**Current Turn:** {{{turnCount}}}

**Game Context:**
{{{gameState}}}
*Note: The game state string above contains the character's current inventory, status, level, XP, reputation, known NPC states and progress.*

{{#if previousNarration}}
**Previous Scene:**
{{{previousNarration}}}
{{/if}}

**Player Character:**
Name: {{{character.name}}}
Class: {{{character.class}}} (Level {{{character.level}}})
XP: {{{character.xp}}}/{{{character.xpToNextLevel}}}
Reputation: {{#if character.reputation}}{{#each character.reputation}} {{ @key }}: {{ this }}; {{/each}}{{else}}None{{/if}}
Relationships: {{#if character.npcRelationships}}{{#each character.npcRelationships}} {{ @key }}: {{ this }}; {{/each}}{{else}}None{{/if}}
Stats: Strength {{{character.stats.strength}}}, Stamina {{{character.stats.stamina}}}, Agility {{{character.stats.agility}}}, Intellect {{{character.stats.intellect}}}, Wisdom {{{character.stats.wisdom}}}, Charisma {{{character.stats.charisma}}}
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

1.  **React Dynamically:** Describe the outcome of the player's action. Consider their character's class, level, xp, reputation, relationships, stats, **current stamina and mana**, traits, knowledge, background, *current skill stage*, **learned skills**, inventory, the current gameState, and the **game difficulty**.
2.  **Logical Progression, Resource Costs & Restrictions:**
    *   **Evaluate Feasibility:** Assess if the action is logically possible. *Actions tied to higher skill stages should only be possible if the character has reached that stage.* Harder difficulties might make certain actions less feasible initially.
    *   **Check Learned Skills & Resources:** Verify if a used skill is learned and if enough resources (stamina/mana) are available. Narrate failure reasons (not learned, insufficient resources). Calculate costs and output \`staminaChange\`, \`manaChange\` **only if they changed**.
    *   **Block Impossible Actions:** Prevent universe-breaking actions (e.g., "destroy the universe", "teleport to another dimension") unless EXTREME justification exists in gameState AND skill stage is high. Simple reality-bending ("become king", "control time") is also typically Impossible without justification.
    *   **Narrate Failure Reason:** If blocked/failed, explain why (lack of skill, resources, item, stage, reputation, **NPC relationships**, difficulty, etc.).
    *   **Skill-based Progression:** Very powerful actions require high milestones AND skill stages.
3.  **Incorporate Dice Rolls:** Interpret dice roll results (e.g., "(Difficulty: Hard, Dice Roll Result: 75/100)") contextually. High rolls succeed, low rolls fail, adjusted by **game difficulty**. Narrate the degree of success/failure. Success might grant more XP or better reputation/relationship changes. Failure might have negative consequences, potentially more severe on higher difficulties.
4.  **Consequences, Resources, XP, Reputation, Relationships & Character Progression:**
    *   **Resource Changes:** If current stamina or mana changed, include \`staminaChange\` or \`manaChange\`. **Do not include if unchanged.**
    *   **XP Awards:** If the action was significant (overcame challenge, clever solution, quest progress), award XP via \`xpGained\` (adjust based on **difficulty** - harder challenges grant more). **Only include if XP was gained.**
    *   **Reputation Changes:** If the action affects a faction's view, include \`reputationChange\`. **Only include if reputation changed.**
    *   **NPC Relationship Changes:** If the action affects an NPC's view, include \`npcRelationshipChange\`. **Only include if relationship changed.**
    *   **Character Progression (Optional):** If events lead to development:
        *   Include \`updatedStats\`, \`updatedTraits\`, \`updatedKnowledge\`. **Only include if they changed.**
        *   **Skill Stage Progression:** Include \`progressedToStage\` **only if milestones warrant advancement.**
        *   **Class Change Suggestion:** Include \`suggestedClassChange\` **only if actions strongly align elsewhere.**
        *   **Gaining Skills:** Include \`gainedSkill\` **only if appropriate.**
5.  **Update Game State:** **REQUIRED.** Modify the 'gameState' string concisely to reflect ALL changes (location, **inventory**, NPC mood, time, quest progress, milestones, **status including resources, level, XP, reputation, and NPC relationships**). **Ensure the inventory listed in the 'updatedGameState' string is the character's complete and accurate inventory after the action.** **MUST include the current Turn count (e.g., "Turn: 16").**
6.  **Branching Narratives & Dynamic Events (Introduce Occasionally):**
    *   **Branching Choices:** At significant moments, present **exactly 4** meaningful \`branchingChoices\` that significantly alter the path forward. Provide optional subtle 'consequenceHint' for each. **Only include if relevant.**
    *   **Dynamic Events:** Based on 'turnCount' or randomness (especially on higher difficulties), trigger a \`dynamicEventTriggered\`. This event should integrate into the current narration. Keep these events relatively infrequent. **Only include if triggered.**
7.  **Tone:** Maintain a consistent fantasy text adventure tone. Be descriptive and engaging. Adjust tone slightly based on **difficulty** (e.g., more ominous on Hard).

**Output Format:** Respond **ONLY** with a valid JSON object matching the NarrateAdventureOutput schema.
*   'narration' and 'updatedGameState' are **REQUIRED**.
*   All other fields are **OPTIONAL** and should **ONLY** be included if their corresponding event actually occurred (e.g., include \`xpGained\` only if XP was actually awarded).
*   If including \`branchingChoices\`, ensure the array contains **exactly 4** choices.
*   Ensure the 'updatedGameState' string contains the correct turn count.

Example Output (Success with XP and branching choices):
{
  "narration": "You successfully sneak past the sleeping goblin! Ahead, the tunnel forks. To the left, you hear dripping water. To the right, a faint metallic clang echoes. Straight ahead, the main tunnel continues into darkness. You could also try examining the goblin's discarded pouch.",
  "updatedGameState": "Turn: 15\\nLocation: Goblin Tunnel\\nInventory: Torch, Sword, Lockpicks\\nStatus: Healthy (STA: 90/100, MANA: 15/20)\\nLevel: 2, XP: 160/250\\nReputation: None\\nNPC Relationships: None\\nClass: Rogue\\nSkill Stage: Stage 1 - Scout\\nLearned Skills: Observe, Sneak, Quick Strike",
  "xpGained": 15,
  "staminaChange": -5,
  "branchingChoices": [
    { "text": "Venture into the narrow passage (Left Fork)", "consequenceHint": "Might lead to water source or damp passage." },
    { "text": "Follow the metallic clang (Right Fork)", "consequenceHint": "Could be guards, machinery, or treasure." },
    { "text": "Continue straight down the main tunnel", "consequenceHint": "The most obvious path." },
    { "text": "Examine the goblin's pouch", "consequenceHint": "Might find something useful, or wake the goblin." }
  ]
}

Example Output (Failure with no other changes):
{
  "narration": "You try to force the rusty lever, but it refuses to budge. Your muscles strain, but it's stuck fast.",
  "updatedGameState": "Turn: 17\\nLocation: Rusty Lever Room\\nInventory: Torch, Rope\\nStatus: Healthy (STA: 85/95, MANA: 10/10)\\nLevel: 1, XP: 50/100\\nReputation: Town Guard: 5\\nNPC Relationships: Guard Captain: -5\\nClass: Warrior\\nSkill Stage: Stage 0 - Potential\\nLearned Skills: Basic Strike, Shield Block, Observe",
  "staminaChange": -5
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
     // Developer mode check is now handled in the exported wrapper function
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
                 throw new Error(`AI returned invalid output structure (attempt ${attempt}) - missing narration or updatedGameState.`);
             }
             // Validate game state includes turn count
             if (!output.updatedGameState.toLowerCase().includes('turn:')) {
                  throw new Error("AI response missing Turn count in updated game state.");
             }
             // More detailed validation of optional fields if present
              if (output.xpGained !== undefined && (!Number.isInteger(output.xpGained) || output.xpGained < 0)) {
                console.warn("AI returned invalid xpGained value:", output.xpGained);
                output.xpGained = undefined; // Discard invalid XP
             }
             if (output.reputationChange && (!output.reputationChange.faction || !Number.isInteger(output.reputationChange.change))) {
                 console.warn("AI returned invalid reputationChange structure:", output.reputationChange);
                 output.reputationChange = undefined; // Discard invalid rep change
             }
             if (output.npcRelationshipChange && (!output.npcRelationshipChange.npcName || !Number.isInteger(output.npcRelationshipChange.change))) {
                 console.warn("AI returned invalid npcRelationshipChange structure:", output.npcRelationshipChange);
                 output.npcRelationshipChange = undefined; // Discard invalid NPC relationship change
             }
             if (output.progressedToStage !== undefined && (output.progressedToStage < 1 || output.progressedToStage > 4)) {
                console.warn("AI returned invalid progressedToStage value:", output.progressedToStage);
                output.progressedToStage = undefined; // Discard invalid stage
             }
             if (output.suggestedClassChange !== undefined && typeof output.suggestedClassChange !== 'string') {
                 console.warn("AI returned invalid suggestedClassChange value:", output.suggestedClassChange);
                 output.suggestedClassChange = undefined;
             }
             if (output.gainedSkill && (!output.gainedSkill.name || !output.gainedSkill.description)) {
                  console.warn("AI returned invalid gainedSkill structure:", output.gainedSkill);
                  output.gainedSkill = undefined;
             }
             if (output.staminaChange !== undefined && typeof output.staminaChange !== 'number') {
                 console.warn("AI returned invalid staminaChange value:", output.staminaChange);
                 output.staminaChange = undefined;
             }
              if (output.manaChange !== undefined && typeof output.manaChange !== 'number') {
                 console.warn("AI returned invalid manaChange value:", output.manaChange);
                 output.manaChange = undefined;
             }
             // Validate branching choices if present
             if (output.branchingChoices && (!Array.isArray(output.branchingChoices) || output.branchingChoices.length !== 4 || output.branchingChoices.some(c => !c.text))) {
                  console.warn(`AI returned invalid branchingChoices structure (expected 4 choices, got ${output.branchingChoices?.length}):`, output.branchingChoices);
                  output.branchingChoices = undefined; // Discard invalid choices
             }
             // Validate dynamic event trigger if present
             if (output.dynamicEventTriggered !== undefined && typeof output.dynamicEventTriggered !== 'string') {
                 console.warn("AI returned invalid dynamicEventTriggered value:", output.dynamicEventTriggered);
                 output.dynamicEventTriggered = undefined;
             }


        } catch (err: any) {
            console.error(`AI narration attempt ${attempt} error:`, err);
            errorOccurred = true;
             if (err.message?.includes('503') || err.message?.includes('overloaded')) {
                errorMessage = `AI Service Overloaded (Attempt ${attempt}/${maxAttempts}). Please try again shortly. Retrying...`;
                // No toast on server-side
                // toast({ title: "AI Busy", description: `Service overloaded. Retrying...`, variant: "default"});
                // Optional: Wait longer before retrying on overload
                if (attempt < maxAttempts) await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
             } else if (err.message?.includes('400 Bad Request')) {
                 errorMessage = `AI Error: Bad Request (${err.message?.substring(0, 50)}...). Check prompt or input format. Retrying... (Attempt ${attempt}/${maxAttempts})`;
                 // No toast on server-side
                 // toast({ title: "AI Error", description: `${errorMessage.substring(0, 60)}... Retrying...`, variant: "destructive"});
                 if (attempt < maxAttempts) await new Promise(resolve => setTimeout(resolve, 500 * attempt));
             }
              else if (err.message?.includes('Error fetching')) {
                  errorMessage = `AI Error: Could not reach or process request with the story generation service (Attempt ${attempt}/${maxAttempts}). Check network or try again. (${err.message})`;
                  // No toast on server-side
                  // toast({ title: "Network Error", description: "Could not reach AI service. Retrying...", variant: "destructive"});
                  if (attempt < maxAttempts) await new Promise(resolve => setTimeout(resolve, 500 * attempt));
              } else {
                 errorMessage = `AI Error: ${err.message?.substring(0, 150) || 'Unknown error'} (Attempt ${attempt}/${maxAttempts})`;
                 // No toast on server-side
                 // toast({ title: "Story Error", description: `${errorMessage.substring(0, 60)}... Retrying...`, variant: "destructive"});
                 if (attempt < maxAttempts) await new Promise(resolve => setTimeout(resolve, 500 * attempt));
             }
        }
     }

     // --- Validation & Fallback after all attempts ---
     if (!output || !output.narration || !output.updatedGameState) {
        console.error("AI narration failed after all attempts:", errorMessage);
        // Return a structured error response instead of throwing,
        // allowing the client to handle the failure gracefully.
        return {
            narration: `The threads of fate seem momentarily tangled. You pause, considering your next move as the world holds its breath. (${errorMessage})`,
            updatedGameState: `${input.gameState}\nTurn: ${input.turnCount + 1}`, // Return original game state but increment turn
        };
     }

    console.log("Received valid narration from narrateAdventurePrompt:", JSON.stringify(output, null, 2));

    // Ensure game state is not accidentally wiped and includes turn count
     const includesTurn = output.updatedGameState.toLowerCase().includes('turn:');
     const gameStateSeemsValid = output.updatedGameState.trim().length > 10 && includesTurn;

     if (!gameStateSeemsValid) {
        console.warn("AI returned suspiciously short or invalid game state (missing Turn count?), reverting to previous state with added turn count.");
        // Try to preserve the turn count from the AI response if possible, otherwise increment from input
        const turnMatch = output.updatedGameState.match(/Turn: (\d+)/i);
        const turnFromOutput = turnMatch ? parseInt(turnMatch[1], 10) : input.turnCount + 1;

        const revertedGameState = input.gameState.includes(`Turn: ${input.turnCount}`)
            ? input.gameState.replace(`Turn: ${input.turnCount}`, `Turn: ${turnFromOutput}`)
            : `Turn: ${turnFromOutput}\n${input.gameState}`; // Add turn count if missing

        return {
            narration: output.narration + "\n\n(Narrator's Note: The world state seems momentarily unstable, reverting to the last known stable point.)",
            updatedGameState: revertedGameState,
            // Keep potential progression/resource changes from the AI output even if state reverts
             xpGained: output.xpGained,
             reputationChange: output.reputationChange,
             npcRelationshipChange: output.npcRelationshipChange,
             staminaChange: output.staminaChange,
             manaChange: output.manaChange,
             updatedStats: output.updatedStats,
             updatedTraits: output.updatedTraits,
             updatedKnowledge: output.updatedKnowledge,
             gainedSkill: output.gainedSkill,
             // Keep potential new branches/events
             branchingChoices: output.branchingChoices,
             dynamicEventTriggered: output.dynamicEventTriggered,
             // Don't revert progression suggestions on state revert
             progressedToStage: output.progressedToStage,
             suggestedClassChange: output.suggestedClassChange,
        };
    }

    // Return the full output including optional fields
    return {
        ...output,
        // Ensure undefined is used if values are not present, matching the schema
        updatedStats: output.updatedStats ?? undefined,
        updatedTraits: output.updatedTraits ?? undefined,
        updatedKnowledge: output.updatedKnowledge ?? undefined,
        xpGained: output.xpGained ?? undefined,
        reputationChange: output.reputationChange ?? undefined,
        npcRelationshipChange: output.npcRelationshipChange ?? undefined,
        staminaChange: output.staminaChange ?? undefined,
        manaChange: output.manaChange ?? undefined,
        progressedToStage: output.progressedToStage ?? undefined,
        suggestedClassChange: output.suggestedClassChange ?? undefined,
        gainedSkill: output.gainedSkill ?? undefined,
        branchingChoices: output.branchingChoices ?? undefined,
        dynamicEventTriggered: output.dynamicEventTriggered ?? undefined,
    };
  }
);

    

    