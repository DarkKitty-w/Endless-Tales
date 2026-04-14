/**
 * @fileOverview An AI agent that narrates the story of a text adventure game.
 */
import { z } from 'zod';
import { getClient } from '../ai-instance';
import type { CharacterStats } from '../../types/character-types';
import type { AdventureSettings } from '../../types/adventure-types';
import type { DifficultyLevel, GameStateContext } from '../../types/game-types';
import { formatGameStateContextForPrompt } from '../../context/game-state-utils';
import { processAiResponse } from '../../lib/utils';
import { sanitizePlayerAction } from '../../lib/utils';

export interface NarrateAdventureInput {
  character: any;
  playerChoice: string;
  gameState: string;
  gameStateContext?: GameStateContext;
  previousNarration?: string;
  adventureSettings: AdventureSettings;
  turnCount: number;
  userApiKey?: string | null;
  assessDifficulty?: boolean;
  capabilitiesSummary?: string;
  signal?: AbortSignal;
}

export interface NarrateAdventureOutput {
  narration: string;
  updatedGameState: string;
  updatedStats?: Partial<CharacterStats>;
  updatedTraits?: string[];
  updatedKnowledge?: string[];
  progressedToStage?: number;
  healthChange?: number;
  staminaChange?: number;
  manaChange?: number;
  xpGained?: number;
  reputationChange?: { faction: string; change: number };
  npcRelationshipChange?: { npcName: string; change: number };
  suggestedClassChange?: string;
  gainedSkill?: { name: string; description: string; type?: string; manaCost?: number; staminaCost?: number };
  branchingChoices: { text: string; consequenceHint?: string }[];
  dynamicEventTriggered?: string;
  isCharacterDefeated?: boolean;
  assessedDifficulty?: DifficultyLevel;
  diceRoll?: number;
  diceType?: "d6" | "d10" | "d20" | "d100" | "None";
  worldMapChanges?: {
    newLocations?: {
      id: string;
      name: string;
      description: string;
      type: 'town' | 'dungeon' | 'wilderness' | 'landmark' | 'unknown';
      x: number;
      y: number;
      connectedTo?: string[];
    }[];
    discoveredLocationIds?: string[];
    updatedLocations?: { id: string; updates: Partial<{ name: string; description: string; type: string; discovered: boolean; x: number; y: number; connectedLocationIds: string[] }> }[];
  };
}

const NarrateAdventureOutputSchema = z.object({
  narration: z.string(),
  updatedGameState: z.string(),
  updatedStats: z.object({
    strength: z.number().optional(),
    stamina: z.number().optional(),
    wisdom: z.number().optional(),
  }).optional().nullable(),
  updatedTraits: z.array(z.string()).optional().nullable(),
  updatedKnowledge: z.array(z.string()).optional().nullable(),
  progressedToStage: z.number().optional().nullable(),
  healthChange: z.number().optional().nullable(),
  staminaChange: z.number().optional().nullable(),
  manaChange: z.number().optional().nullable(),
  xpGained: z.number().optional().nullable(),
  reputationChange: z.object({
    faction: z.string(),
    change: z.number(),
  }).optional().nullable(),
  npcRelationshipChange: z.object({
    npcName: z.string(),
    change: z.number(),
  }).optional().nullable(),
  suggestedClassChange: z.string().optional().nullable(),
  gainedSkill: z.object({
    name: z.string(),
    description: z.string(),
    type: z.string().optional(),
    manaCost: z.number().optional(),
    staminaCost: z.number().optional(),
  }).optional().nullable(),
  branchingChoices: z.array(z.object({
    text: z.string(),
    consequenceHint: z.string().optional(),
  })),
  dynamicEventTriggered: z.string().optional().nullable(),
  isCharacterDefeated: z.boolean().optional().nullable(),
  assessedDifficulty: z.enum(["Trivial", "Easy", "Normal", "Hard", "Very Hard", "Impossible"]).optional().nullable(),
  diceRoll: z.number().optional().nullable(),
  diceType: z.enum(["d6", "d10", "d20", "d100", "None"]).optional().nullable(),
  worldMapChanges: z.object({
    newLocations: z.array(z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      type: z.enum(['town', 'dungeon', 'wilderness', 'landmark', 'unknown']),
      x: z.number(),
      y: z.number(),
      connectedTo: z.array(z.string()).optional(),
    })).optional(),
    discoveredLocationIds: z.array(z.string()).optional(),
    updatedLocations: z.array(z.object({
      id: z.string(),
      updates: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        type: z.string().optional(),
        discovered: z.boolean().optional(),
        x: z.number().optional(),
        y: z.number().optional(),
        connectedLocationIds: z.array(z.string()).optional(),
      }),
    })).optional(),
  }).optional().nullable(),
});

const FALLBACK_DIFFICULTY_MAP: Record<string, { difficulty: DifficultyLevel; dice: "d6" | "d10" | "d20" | "d100" | "None" }> = {
    easy: { difficulty: "Easy", dice: "d6" },
    normal: { difficulty: "Normal", dice: "d10" },
    hard: { difficulty: "Hard", dice: "d20" },
    nightmare: { difficulty: "Very Hard", dice: "d20" },
};

export async function narrateAdventure(input: NarrateAdventureInput): Promise<NarrateAdventureOutput> {
  if (process.env.NODE_ENV === 'development' && input.character.class === 'admin000') {
    return {
        narration: `Developer command "${input.playerChoice}" processed.`,
        updatedGameState: input.gameState,
        branchingChoices: [
            { text: "Continue." }, { text: "Inspect." }, { text: "Status." }, { text: "Chaos." }
        ]
    };
  }

  const { character, adventureSettings, turnCount, assessDifficulty, capabilitiesSummary, gameStateContext } = input;
  const isCustom = adventureSettings.adventureType === "Custom";
  const isImmersed = adventureSettings.adventureType === "Immersed";
  const isRandomized = adventureSettings.adventureType === "Randomized";
  
  const sanitizedPlayerChoice = sanitizePlayerAction(input.playerChoice);

  let adventureContext = "";
  if (isCustom) {
      adventureContext = `
* World: ${adventureSettings.worldType}
* Main Quest: ${adventureSettings.mainQuestline}
* Genre: ${adventureSettings.genreTheme}
* Tone: ${adventureSettings.dominantTone}
      `;
  } else if (isImmersed) {
      adventureContext = `
* Universe: ${adventureSettings.universeName}
* Character Concept: ${adventureSettings.playerCharacterConcept}
**INSTRUCTION:** Adhere strictly to universe lore.
      `;
  } else if (isRandomized) {
      adventureContext = `**INSTRUCTION:** Establish a unique setting based on character traits.`;
  }

  const gameStateSummary = gameStateContext
      ? formatGameStateContextForPrompt(gameStateContext)
      : input.gameState;

  let assessmentPromptSection = "";
  if (assessDifficulty && capabilitiesSummary) {
      assessmentPromptSection = `
**Before narrating, first assess the difficulty of the action:**
- Player Action: ${sanitizedPlayerChoice}
- Character Capabilities: ${capabilitiesSummary}
- Current Situation: ${input.previousNarration || "Beginning of scene"}
- Game Difficulty Setting: ${adventureSettings.difficulty}

Based on the above, determine:
- assessedDifficulty: one of "Trivial", "Easy", "Normal", "Hard", "Very Hard", "Impossible"
- suggestedDice: one of "d6", "d10", "d20", "d100", "None"
- diceRoll: if suggestedDice is not "None", generate a random roll result for that die (e.g., 1-20 for d20). If "None", set to null.

If the action is "Impossible", the narration should reflect that the action cannot be performed, and the updatedGameState should remain unchanged (except turn increment).
`;
  }

  const prompt = `
You are a creative Game Master AI for "Endless Tales". Narrate the next segment.

**Character:**
Name: ${character.name}
Class: ${character.class}
Stats: STR ${character.stats.strength}, STA ${character.stats.stamina}, WIS ${character.stats.wisdom}
Health: ${character.currentHealth}/${character.maxHealth}
Description: ${character.aiGeneratedDescription || character.description}

**Context:**
Turn: ${turnCount}
Difficulty: ${adventureSettings.difficulty}
${adventureContext}

**Previous Narration:** ${input.previousNarration || "None"}
**Current Game State:**
${gameStateSummary}

**Action:** ${sanitizedPlayerChoice}
${assessmentPromptSection}

**Task:**
1. ${assessDifficulty ? 'Assess difficulty as instructed above.' : ''}
2. Narrate the outcome.
3. Update game state (include Turn: ${turnCount + 1}).
4. Provide exactly 4 branching choices.
5. Calculate resource changes (health, stamina, mana) if applicable.
6. If character HP <= 0, set isCharacterDefeated: true.
7. **World Map Updates:** If the narration involves traveling to a new area, discovering a location, or learning about a place, include worldMapChanges. Provide new locations with unique IDs, descriptive names, coordinates (x,y between 0-100), and connections to existing discovered locations. For already known locations that are revealed, use discoveredLocationIds. To modify existing ones, use updatedLocations.

Return ONLY a valid JSON object. No explanations, no markdown formatting.
`;

  try {
      const client = getClient(input.userApiKey);
      let text: string;

      if (!assessDifficulty) {
          const chunks: string[] = [];
          const stream = client.models.generateContentStream({
              contents: prompt,
              config: { responseMimeType: "application/json" },
              signal: input.signal,
          });
          for await (const chunk of stream) {
              chunks.push(chunk);
          }
          text = chunks.join('');
      } else {
          const response = await client.models.generateContent({
              contents: prompt,
              config: { responseMimeType: "application/json" },
              signal: input.signal,
          });
          text = response.text;
      }

      if (!text) throw new Error("No text returned from AI");

      const gameDiffKey = adventureSettings.difficulty?.toLowerCase() ?? 'normal';
      const fallbackAssess = FALLBACK_DIFFICULTY_MAP[gameDiffKey] ?? FALLBACK_DIFFICULTY_MAP['normal'];
      
      let fallbackDiceRoll: number | undefined = undefined;
      let fallbackDiceType: "d6" | "d10" | "d20" | "d100" | "None" = "None";
      if (assessDifficulty) {
          switch (fallbackAssess.dice) {
              case 'd6': fallbackDiceRoll = Math.floor(Math.random() * 6) + 1; break;
              case 'd10': fallbackDiceRoll = Math.floor(Math.random() * 10) + 1; break;
              case 'd20': fallbackDiceRoll = Math.floor(Math.random() * 20) + 1; break;
              case 'd100': fallbackDiceRoll = Math.floor(Math.random() * 100) + 1; break;
              default: fallbackDiceRoll = undefined;
          }
          fallbackDiceType = fallbackAssess.dice;
      }

      const fallback: NarrateAdventureOutput = {
          narration: `The Narrator stumbled. (AI Error). Please retry.`,
          updatedGameState: input.gameState,
          branchingChoices: [
            { text: "Look around." }, { text: "Think carefully." },
            { text: "Check inventory." }, { text: "Wait." }
          ],
          assessedDifficulty: assessDifficulty ? fallbackAssess.difficulty : undefined,
          diceRoll: fallbackDiceRoll,
          diceType: assessDifficulty ? fallbackDiceType : undefined,
      };

      const normalizer = (data: any): NarrateAdventureOutput => {
          // Handle case where jsonrepair produced an array
          if (Array.isArray(data)) data = data[0] || {};

          // Extract narration from various possible fields
          const narrationText = data.narration 
              ?? data.outcome?.description 
              ?? data.description 
              ?? data.action?.outcome 
              ?? fallback.narration;

          // Build updatedGameState string
          const updatedGameState = data.updatedGameState 
              ?? (data.update_game_state ? JSON.stringify(data.update_game_state) : null)
              ?? input.gameState;

          // Build branching choices
          let branchingChoices = data.branchingChoices;
          if (!branchingChoices && Array.isArray(data.choices)) {
              branchingChoices = data.choices.slice(0, 4).map((c: any) => ({
                  text: c.name || c.text || c.prompt || 'Continue',
                  consequenceHint: c.description || c.consequenceHint,
              }));
          }
          if (!Array.isArray(branchingChoices) || branchingChoices.length === 0) {
              branchingChoices = fallback.branchingChoices;
          }

          // Map difficulty
          const assessedDifficulty = data.assessedDifficulty ?? data.difficulty ?? fallback.assessedDifficulty;
          const diceType = data.diceType ?? data.suggestedDice ?? fallback.diceType;
          const diceRoll = data.diceRoll ?? fallback.diceRoll;

          // Extract resource changes
          const healthChange = data.healthChange ?? data.outcome?.health_change ?? data.action?.health_change;
          const staminaChange = data.staminaChange ?? data.outcome?.stamina_change ?? data.action?.stamina_change;
          const manaChange = data.manaChange ?? data.outcome?.mana_change ?? data.action?.mana_change;

          return {
              narration: narrationText,
              updatedGameState,
              updatedStats: data.updatedStats,
              updatedTraits: data.updatedTraits,
              updatedKnowledge: data.updatedKnowledge,
              progressedToStage: data.progressedToStage,
              healthChange,
              staminaChange,
              manaChange,
              xpGained: data.xpGained,
              reputationChange: data.reputationChange,
              npcRelationshipChange: data.npcRelationshipChange,
              suggestedClassChange: data.suggestedClassChange,
              gainedSkill: data.gainedSkill,
              branchingChoices,
              dynamicEventTriggered: data.dynamicEventTriggered,
              isCharacterDefeated: data.isCharacterDefeated ?? data.character_defeated ?? false,
              assessedDifficulty,
              diceRoll,
              diceType,
              worldMapChanges: data.worldMapChanges,
          };
      };

      const result = await processAiResponse(
          text,
          NarrateAdventureOutputSchema,
          fallback,
          normalizer
      );

      // Ensure branching choices are exactly 4
      if (!result.branchingChoices || result.branchingChoices.length !== 4) {
          result.branchingChoices = fallback.branchingChoices;
      }

      return result;

  } catch (error: any) {
      if (error.name === 'AbortError') throw error;
      console.error("AI Narration Error:", error);
      
      const gameDiffKey = adventureSettings.difficulty?.toLowerCase() ?? 'normal';
      const fallbackAssess = FALLBACK_DIFFICULTY_MAP[gameDiffKey] ?? FALLBACK_DIFFICULTY_MAP['normal'];
      
      let fallbackDiceRoll: number | undefined = undefined;
      let fallbackDiceType: "d6" | "d10" | "d20" | "d100" | "None" = "None";
      if (assessDifficulty) {
          switch (fallbackAssess.dice) {
              case 'd6': fallbackDiceRoll = Math.floor(Math.random() * 6) + 1; break;
              case 'd10': fallbackDiceRoll = Math.floor(Math.random() * 10) + 1; break;
              case 'd20': fallbackDiceRoll = Math.floor(Math.random() * 20) + 1; break;
              case 'd100': fallbackDiceRoll = Math.floor(Math.random() * 100) + 1; break;
              default: fallbackDiceRoll = undefined;
          }
          fallbackDiceType = fallbackAssess.dice;
      }
      
      return {
          narration: `The Narrator stumbled. (AI Error: ${error.message}). Please retry.`,
          updatedGameState: input.gameState,
          branchingChoices: [
            { text: "Look around." }, { text: "Think carefully." },
            { text: "Check inventory." }, { text: "Wait." }
          ],
          assessedDifficulty: assessDifficulty ? fallbackAssess.difficulty : undefined,
          diceRoll: fallbackDiceRoll,
          diceType: assessDifficulty ? fallbackDiceType : undefined,
      };
  }
}