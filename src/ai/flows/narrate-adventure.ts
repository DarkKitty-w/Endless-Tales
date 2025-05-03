import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import type { CharacterStats, SkillTree, Skill, ReputationChange, NpcRelationshipChange } from '@/context/GameContext'; // Import Skill and Reputation/NPC Relationship Change types

// --- Zod Schemas (Internal - Not Exported) ---
const CharacterStatsSchema = z.object({
  strength: z.number().describe('Character strength attribute (1-10 range).'),
  stamina: z.number().describe('Character stamina attribute (1-10 range).'),
  agility: z.number().describe('Character agility attribute (1-10 range).'),
});

const SkillSchema = z.object({
    name: z.string().describe("The name of the skill."),
    description: z.string().describe("A brief description of what the skill does or represents."),
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
    class: z.string().describe('Character class (e.g., Warrior, Mage, Rogue).'),
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
    npcRelationships: z.record(z.number()).describe("Current relationship scores with specific NPCs (e.g., {\"Elara\": 25, \"Guard Captain\": -10})."), // Add NPC relationships
    skillTreeSummary: SkillTreeSummarySchema.describe("A summary of the character's current class skill tree and available skills at their stage."), // Add skill tree summary
    skillTreeStage: z.number().min(0).max(4).describe("The character's current skill progression stage (0-4). Stage affects available actions/skill power."), // Add current stage
    learnedSkills: z.array(z.string()).describe("List of skill names the character has actually learned."), // Add learned skills list
    aiGeneratedDescription: z.string().optional().describe('Optional detailed AI-generated character profile.'),
  }).describe('The player character details.'),
  playerChoice: z.string().describe('The player\'s chosen action or command. May include dice roll result like "(Dice Roll Result: 4)". May be an attempt to use a learned skill by name.'),
  gameState: z.string().describe('A string representing the current state of the game, including location, **current full inventory list**, ongoing events, character progression milestones achieved, **and known NPC states/relationships**.'), // Emphasize inventory and NPC relationships needed
  previousNarration: z.string().optional().describe('The narration text immediately preceding the player\'s current choice, for context.'),
  adventureSettings: z.object({ // Include adventure settings
      difficulty: z.string().describe("Overall game difficulty (e.g., Easy, Normal, Hard). Influences challenge levels and potential event triggers."),
      permanentDeath: z.boolean().describe("Whether permanent death is enabled."),
      adventureType: z.enum(["Randomized", "Custom"]).nullable().describe("Type of adventure."),
  }).describe("The overall settings for the current adventure."),
  turnCount: z.number().describe("The current turn number of the adventure. Can be used to trigger time-based events."),
});

const NarrateAdventureOutputSchema = z.object({
  narration: z.string().describe('The AI-generated narration describing the outcome of the action and the current situation. **Should occasionally introduce branching choices or dynamic events.**'),
  updatedGameState: z.string().describe('The updated state of the game string after the player action and narration, reflecting changes in location, **inventory**, character status (including stamina/mana, level, XP, reputation, **NPC relationships**), time, or achieved milestones. **Inventory changes MUST be reflected here.** **Must include current Turn count.**'),
  updatedStats: CharacterStatsSchema.partial().optional().describe('Optional: Changes to character stats resulting from the narration (e.g., gained 1 strength). Only include changed stats.'),
  updatedTraits: z.array(z.string()).optional().describe('Optional: The complete new list of character traits if they changed.'),
  updatedKnowledge: z.array(z.string()).optional().describe('Optional: The complete new list of character knowledge areas if they changed.'),
  xpGained: z.number().int().min(0).optional().describe('Optional: The amount of XP gained from this action/event.'), // Add XP gained
  reputationChange: ReputationChangeSchema.optional().describe('Optional: Change in reputation with a specific faction.'), // Add reputation change
  npcRelationshipChange: NpcRelationshipChangeSchema.optional().describe('Optional: Change in relationship score with a specific NPC.'), // Add NPC relationship change
  staminaChange: z.number().optional().describe('Optional: Change in current stamina (negative for cost, positive for gain).'),
  manaChange: z.number().optional().describe('Optional: Change in current mana (negative for cost, positive for gain).'),
  progressedToStage: z.number().min(1).max(4).optional().describe('Optional: If the character progressed to a new skill stage (1-4) based on achievements/actions.'),
  suggestedClassChange: z.string().optional().describe("Optional: If the AI detects the player's actions consistently align with a *different* class, suggest that class name here."),
  gainedSkill: SkillSchema.optional().describe("Optional: If the character learned a new skill through their actions or discoveries."), // Added gainedSkill
  // New fields for branching narratives and events
  branchingChoices: z.array(BranchingChoiceSchema).max(4).optional().describe("Optional: Up to 4 significant choices presented to the player, branching the narrative."),
  dynamicEventTriggered: z.string().optional().describe("Optional: A brief description if a random or time-based dynamic world event occurred (e.g., 'Sudden downpour begins', 'Merchant caravan arrives')."),
});

// --- Exported Types (Derived from internal schemas) ---
export type NarrateAdventureInput = z.infer<typeof NarrateAdventureInputSchema>;
export type NarrateAdventureOutput = z.infer<typeof NarrateAdventureOutputSchema>;

// --- Exported Async Function ---
export async function narrateAdventure(input: NarrateAdventureInput): Promise<NarrateAdventureOutput> {
  return narrateAdventureFlow(input);
}

// --- Internal Prompt and Flow Definitions ---
const narrateAdventurePrompt = ai.definePrompt({
  name: 'narrateAdventurePrompt',
  input: { schema: NarrateAdventureInputSchema },
  output: { schema: NarrateAdventureOutputSchema },
  prompt: `You are a dynamic and engaging AI narrator for the text-based adventure game, "Endless Tales". Your role is to weave a compelling, potentially branching story based on player choices, character attributes, resources, skills, and the established game world, updating progression and occasionally introducing dynamic events or significant narrative choices.

**Game Settings:** Difficulty: {{{adventureSettings.difficulty}}}, Permadeath: {{{adventureSettings.permanentDeath}}}, Type: {{{adventureSettings.adventureType}}}
**Current Turn:** {{{turnCount}}}

**Game Context:**
{{{gameState}}}
*Note: The game state string above contains the character's current inventory, status, level, XP, reputation, **NPC relationships**, and progress.*

{{#if previousNarration}}
**Previous Scene:**
{{{previousNarration}}}
{{/if}}

**Player Character:**
Name: {{{character.name}}}
Class: {{{character.class}}} (Level {{{character.level}}})
XP: {{{character.xp}}}/{{{character.xpToNextLevel}}}
Reputation: {{#if character.reputation}}{{#each character.reputation}} {{ @key }}: {{ this }}; {{/each}}{{else}}None{{/if}}
NPC Relationships: {{#if character.npcRelationships}}{{#each character.npcRelationships}} {{ @key }}: {{ this }}; {{/each}}{{else}}None{{/if}}
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

1.  **React Dynamically:** Describe the outcome of the player's action. Consider their character's class, level, xp, reputation, **NPC relationships**, stats, **current stamina and mana**, traits, knowledge, background, *current skill stage*, **learned skills**, inventory, the current gameState, and the **game difficulty**.
2.  **Logical Progression, Resource Costs & Restrictions:**
    *   **Evaluate Feasibility:** Assess if the action is logically possible. *Actions tied to higher skill stages should only be possible if the character has reached that stage.* Harder difficulties might make certain actions less feasible initially.
    *   **Check Learned Skills & Resources:** Verify if a used skill is learned and if enough resources (stamina/mana) are available. Narrate failure reasons (not learned, insufficient resources). Calculate costs and output `staminaChange`, `manaChange`.
    *   **Block Impossible Actions:** Prevent universe-breaking actions unless EXTREME justification exists in gameState AND skill stage is high.
    *   **Narrate Failure Reason:** If blocked/failed, explain why (lack of skill, resources, item, stage, reputation, **NPC relationships**, difficulty, etc.).
    *   **Skill-based Progression:** Very powerful actions require high milestones AND skill stages.
3.  **Incorporate Dice Rolls:** Interpret dice roll results (e.g., "(Difficulty: Hard, Dice Roll Result: 75/100)") contextually. High rolls succeed, low rolls fail, adjusted by **game difficulty**. Narrate the degree of success/failure. Success might grant more XP or better reputation/relationship changes. Failure might have negative consequences, potentially more severe on higher difficulties.
4.  **Consequences, Resources, XP, Reputation, Relationships & Character Progression:**
    *   **Resource Changes:** If current stamina or mana changed, include 'staminaChange' or 'manaChange'.
    *   **XP Awards:** If the action was significant (overcame challenge, clever solution, quest progress), award XP via 'xpGained' (adjust based on **difficulty** - harder challenges grant more).
    *   **Reputation Changes:** If the action affects a faction's view, include 'reputationChange'.
    *   **NPC Relationship Changes:** If the action affects an NPC's view, include 'npcRelationshipChange'.
    *   **Character Progression (Optional):** If events lead to development:
        *   Include 'updatedStats', 'updatedTraits', 'updatedKnowledge'.
        *   **Skill Stage Progression:** Include 'progressedToStage' if milestones warrant advancement.
        *   **Class Change Suggestion:** Include 'suggestedClassChange' if actions strongly align elsewhere.
        *   **Gaining Skills:** Include 'gainedSkill' if appropriate.
5.  **Update Game State:** Modify the 'gameState' string concisely to reflect ALL changes (location, **inventory**, NPC mood, **NPC relationships**, time, quest progress, milestones, **status including resources, level, XP, and reputation, current turn count**). **Ensure the inventory listed in the 'updatedGameState' string is the character's complete and accurate inventory after the action.** **Ensure the Turn count is included in updatedGameState.**
6.  **Branching Narratives & Dynamic Events (Introduce Occasionally):**
    *   **Branching Choices:** At significant moments, present 2-4 meaningful 'branchingChoices' that significantly alter the path forward. Provide optional subtle 'consequenceHint' for each.
    *   **Dynamic Events:** Based on 'turnCount' or randomness (especially on higher difficulties), trigger a 'dynamicEventTriggered' (e.g., weather change, unexpected encounter, rumour). This event should integrate into the current narration. Keep these events relatively infrequent.
7.  **Tone:** Maintain a consistent fantasy text adventure tone. Be descriptive and engaging. Adjust tone slightly based on **difficulty** (e.g., more ominous on Hard).

**Output Format:** Respond ONLY with the JSON object matching the schema, including 'narration', 'updatedGameState', and optionally other fields. Ensure the JSON is valid. **Inventory changes MUST be reflected in the 'updatedGameState' string.** **The current Turn count must be included in updatedGameState.**

Example Output with Branching Choice:
{
  "narration": "You successfully sneak past the sleeping goblin! Ahead, the tunnel forks. To the left, you hear dripping water. To the right, a faint metallic clang echoes.",
  "updatedGameState": "Turn: 15\nLocation: Goblin Tunnel\nInventory: Torch, Sword, Lockpicks\nStatus: Healthy (STA: 90/100, MANA: 15/20)\nTime: Night\nQuest: Find Cave Exit\nCharacter Class: Rogue (Level 2, 160/250 XP)\nReputation: None\nNPC Relationships: None\nLearned Skills: Observe, Sneak, Quick Strike",
  "xpGained": 15,
  "staminaChange": -5,
  "branchingChoices": [
    { "text": "Investigate the dripping sound (Left Fork)", "consequenceHint": "Might lead to water source or damp passage." },
    { "text": "Follow the metallic clang (Right Fork)", "consequenceHint": "Could be guards, machinery, or treasure." }
  ]
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
             // Validate game state includes turn count
           if (!result.updatedGameState.toLowerCase().includes('turn:')) {
                throw new Error("AI response missing Turn count in updated game state.");
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
             if (output.npcRelationshipChange && (!output.npcRelationshipChange.npcName || !Number.isInteger(output.npcRelationshipChange.change))) {
                 console.warn("AI returned invalid npcRelationshipChange structure:", output.npcRelationshipChange);
                 output.npcRelationshipChange = undefined; // Discard invalid NPC relationship change
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
             // Validate branching choices if present
             if (output.branchingChoices && (!Array.isArray(output.branchingChoices) || output.branchingChoices.some(c => !c.text))) {
                  console.warn("AI returned invalid branchingChoices structure:", output.branchingChoices);
                  output.branchingChoices = undefined;
             }
             // Validate dynamic event trigger if present
             if (output.dynamicEventTriggered && typeof output.dynamicEventTriggered !== 'string') {
                 console.warn("AI returned invalid dynamicEventTriggered value:", output.dynamicEventTriggered);
                 output.dynamicEventTriggered = undefined;
             }


        } catch (err: any) {
            console.error(`AI narration attempt ${attempt} error:`, err);
            errorOccurred = true;
             if (err.message?.includes('503') || err.message?.includes('overloaded')) {
                errorMessage = `AI Error: The story generation service is overloaded (Attempt ${attempt}/${maxAttempts}). Please try again shortly.`;
                // Optional: Wait longer before retrying on overload
                if (attempt < maxAttempts) await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
             } else if (err.message?.includes('Error fetching') || err.message?.includes('400 Bad Request')) { // Handle 400 errors too
                 errorMessage = `AI Error: Could not reach or process request with the story generation service (Attempt ${attempt}/${maxAttempts}). Check network or try again. (${err.message})`;
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

    // Ensure game state is not accidentally wiped and includes turn count
     const includesTurn = output.updatedGameState.toLowerCase().includes('turn:');
    if ((output.updatedGameState.trim().length < 10 && input.gameState.trim().length > 10) || !includesTurn) {
        console.warn("AI returned suspiciously short or invalid game state (missing Turn count?), reverting to previous state with added turn count.");
        const revertedGameState = input.gameState.includes(`Turn: ${input.turnCount}`)
            ? input.gameState.replace(`Turn: ${input.turnCount}`, `Turn: ${input.turnCount + 1}`)
            : `Turn: ${input.turnCount + 1}\n${input.gameState}`; // Add turn count if missing

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
        staminaChange: output.staminaChange ?? undefined,
        manaChange: output.manaChange ?? undefined,
    };
  }
);

