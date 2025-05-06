// src/ai/flows/narrate-adventure.ts
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
import type { AdventureType } from '@/types/adventure-types'; // Import AdventureType

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

const AdventureTypeSchema = z.enum(["Randomized", "Custom", "Immersed"]).nullable();

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
      adventureType: AdventureTypeSchema,
      // Add custom fields only if adventureType is Custom or Immersed
      worldType: z.string().optional().describe("The specified world type (if Custom adventure)."),
      mainQuestline: z.string().optional().describe("The specified main quest goal (if Custom adventure)."),
      universeName: z.string().optional().describe("The specified universe name (if Immersed adventure, e.g., Star Wars, Lord of the Rings)."),
      playerCharacterConcept: z.string().optional().describe("The player's character concept within the immersed universe (if Immersed adventure, e.g., A young Jedi Padawan, A hobbit on an unexpected journey)."),
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
  branchingChoices: z.array(BranchingChoiceSchema).length(4).optional().describe("Optional: Always 4 significant choices presented to the player, **only if relevant narrative branches occurred.**"),
   dynamicEventTriggered: z.string().optional().describe("Optional: A brief description **only if a random or time-based dynamic world event occurred.**"),
});

// --- Exported Types (Derived from internal schemas) ---
export type NarrateAdventureInput = z.infer<typeof NarrateAdventureInputSchema>;
export type NarrateAdventureOutput = z.infer<typeof NarrateAdventureOutputSchema>;

// --- Exported Async Function ---
export async function narrateAdventure(input: NarrateAdventureInput): Promise<NarrateAdventureOutput> {
  if (input.character.class === 'admin000') {
    console.log("Developer Mode detected in narrateAdventure. Skipping standard AI narration.");
    return processDevCommand(input);
  }
  return narrateAdventureFlow(input);
}

// --- Helper Function for Developer Commands ---
