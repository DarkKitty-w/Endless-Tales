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
  systemMessage?: string;
}

export interface NarrateAdventureOutput {
  narration: string;
  updatedGameState: string;
  updatedStats?: Partial<CharacterStats> | null;
  updatedTraits?: string[] | null;
  updatedKnowledge?: string[] | null;
  progressedToStage?: number | null;
  healthChange?: number | null;
  staminaChange?: number | null;
  manaChange?: number | null;
  xpGained?: number | null;
  reputationChange?: { faction: string; change: number } | null;
  npcRelationshipChange?: { npcName: string; change: number } | null;
  suggestedClassChange?: string | null;
  gainedSkill?: { name: string; description: string; type?: string; manaCost?: number; staminaCost?: number } | null;
  branchingChoices: { text: string; consequenceHint?: string }[];
  dynamicEventTriggered?: string | null;
  isCharacterDefeated?: boolean | null;
  assessedDifficulty?: DifficultyLevel | null;
  diceRoll?: number | null;
  diceType?: "d6" | "d10" | "d20" | "d100" | "None" | null;
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
  } | null;
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
  assessedDifficulty: z.enum(["Trivial", "Easy", "Normal", "Hard", "Very Hard", "Impossible", "Nightmare"]).optional().nullable(),
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
    impossible: { difficulty: "Impossible", dice: "None" },
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

  // System message for providers that support it (OpenAI, Claude, DeepSeek)
  const systemMessage = input.systemMessage || `You are a creative Game Master AI for "Endless Tales". Narrate the next segment.`;

  const userPrompt = `
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

      // Pass systemMessage separately for providers that support it
      const systemMsg = systemMessage;

      if (!assessDifficulty) {
          const chunks: string[] = [];
          const stream = client.models.generateContentStream({
              contents: userPrompt,
              systemMessage: systemMsg,
              config: { responseMimeType: "application/json" },
              signal: input.signal,
          });
          for await (const chunk of stream) {
              chunks.push(chunk);
          }
          text = chunks.join('');
      } else {
          const response = await client.models.generateContent({
              contents: userPrompt,
              systemMessage: systemMsg,
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
          updatedStats: undefined,
          branchingChoices: [
            { text: "Look around." }, { text: "Think carefully." },
            { text: "Check inventory." }, { text: "Wait." }
          ],
          assessedDifficulty: assessDifficulty ? fallbackAssess.difficulty : undefined,
          diceRoll: fallbackDiceRoll,
          diceType: assessDifficulty ? fallbackDiceType : undefined,
      };

      const normalizer = (data: any): NarrateAdventureOutput => {
          if (Array.isArray(data)) data = data[0] || {};
          if (!data || typeof data !== 'object') {
            console.warn('Normalizer received invalid data:', data);
            return fallback;
          }

          // --- narration ---
          const narrationText = data.narration 
              ?? data.outcome?.description 
              ?? data.description 
              ?? data.action?.outcome 
              ?? data.text  // Some AIs return 'text' instead of 'narration'
              ?? fallback.narration;

          // --- updatedGameState: force string ---
          let updatedGameState: string = input.gameState;
          if (typeof data.updatedGameState === 'string') {
              updatedGameState = data.updatedGameState;
          } else if (typeof data.updatedGameState === 'object' && data.updatedGameState !== null) {
              try {
                updatedGameState = JSON.stringify(data.updatedGameState);
              } catch (e) {
                console.warn('Failed to stringify updatedGameState:', e);
              }
          } else if (data.update_game_state) {
              updatedGameState = typeof data.update_game_state === 'string'
                  ? data.update_game_state
                  : JSON.stringify(data.update_game_state);
          } else if (typeof data.gameState === 'string') {
              updatedGameState = data.gameState;
          }

          // --- updatedStats with null check ---
          let updatedStats = data.updatedStats;
          if (updatedStats && typeof updatedStats === 'object') {
            // Ensure it has at least one valid stat property
            const hasValidStat = updatedStats.strength !== undefined || 
                               updatedStats.stamina !== undefined || 
                               updatedStats.mana !== undefined ||
                               updatedStats.wisdom !== undefined;
            if (!hasValidStat) {
              updatedStats = undefined;
            }
          } else {
            updatedStats = undefined;
          }

          // --- updatedTraits with null check ---
          const updatedTraits = Array.isArray(data.updatedTraits) ? data.updatedTraits : 
                              Array.isArray(data.traits) ? data.traits : undefined;
          
          // --- updatedKnowledge with null check ---
          const updatedKnowledge = Array.isArray(data.updatedKnowledge) ? data.updatedKnowledge : 
                                  Array.isArray(data.knowledge) ? data.knowledge : undefined;

          // --- branchingChoices ---
          let branchingChoices = data.branchingChoices;
          if (!branchingChoices && Array.isArray(data.choices)) {
              branchingChoices = data.choices.slice(0, 4).map((c: any) => ({
                  text: c?.text || c?.name || c?.prompt || c?.description || c?.choice || 'Continue',
                  consequenceHint: c?.consequenceHint || c?.gameEffect || c?.hint || c?.effect,
              }));
          }
          if (!Array.isArray(branchingChoices) || branchingChoices.length === 0) {
              branchingChoices = fallback.branchingChoices;
          }

          // --- difficulty / dice ---
          const assessedDifficulty = data.assessedDifficulty ?? data.difficulty ?? data.assessed_difficulty ?? fallback.assessedDifficulty;
          const diceType = data.diceType ?? data.suggestedDice ?? data.dice_type ?? fallback.diceType;
          const diceRoll = typeof data.diceRoll === 'number' ? data.diceRoll : 
                          typeof data.dice_roll === 'number' ? data.dice_roll :
                          fallback.diceRoll;

          // --- resource changes with null checks ---
          const healthChange = typeof data.healthChange === 'number' ? data.healthChange 
              : (data.outcome?.health_change ?? data.action?.health_change ?? data.health_change ?? data.healthChange);
          const staminaChange = typeof data.staminaChange === 'number' ? data.staminaChange 
              : (data.outcome?.stamina_change ?? data.action?.stamina_change ?? data.stamina_change ?? data.staminaChange);
          const manaChange = typeof data.manaChange === 'number' ? data.manaChange 
              : (data.outcome?.mana_change ?? data.action?.mana_change ?? data.mana_change ?? data.manaChange);

          // --- worldMapChanges: normalize coordinates, connections, and type defaults ---
          let worldMapChanges = data.worldMapChanges;
          if (worldMapChanges && typeof worldMapChanges === 'object') {
              const wmc = { ...worldMapChanges };
              if (Array.isArray(wmc.newLocations)) {
                  wmc.newLocations = wmc.newLocations.map((loc: any) => {
                      if (!loc || typeof loc !== 'object') return { type: 'unknown', x: 50, y: 50 };
                      const l = { ...loc };
                      // Default type
                      if (!l.type) l.type = 'unknown';
                      // Ensure x & y are numbers (from coordinates or default)
                      if (typeof l.x !== 'number' || typeof l.y !== 'number') {
                          if (l.coordinates && typeof l.coordinates.x === 'number' && typeof l.coordinates.y === 'number') {
                              l.x = l.coordinates.x;
                              l.y = l.coordinates.y;
                          } else {
                              l.x = typeof l.x === 'number' ? l.x : 50;
                              l.y = typeof l.y === 'number' ? l.y : 50;
                          }
                      }
                      // Handle connections -> connectedTo
                      if (Array.isArray(l.connections) && !l.connectedTo) {
                          l.connectedTo = l.connections;
                      }
                      // Clean up non-standard fields
                      delete l.coordinates;
                      delete l.connections;
                      return l;
                  });
              }
              worldMapChanges = wmc;
          } else {
            worldMapChanges = undefined;
          }

          // Handle isCharacterDefeated - check for various property name variations defensively
          const isCharacterDefeated = Boolean(
              data.isCharacterDefeated ?? 
              data.character_defeated ??  // Handle non-standard snake_case
              data.characterDefeated ??   // Handle camelCase variation
              false
          );

          // Handle progressedToStage - the schema uses "progressedToStage" (double 's')
          // Some AI responses might use single 's' typo, so check both
          const progressedToStage = data.progressedToStage ?? 
              (data as any).progressedToStage ?? // Handle typo: single 's'
              null;

          return {
              narration: narrationText,
              updatedGameState,
              updatedStats,
              updatedTraits,
              updatedKnowledge,
              progressedToStage,
              healthChange,
              staminaChange,
              manaChange,
              xpGained: typeof data.xpGained === 'number' ? data.xpGained : 
                        typeof data.xp_gained === 'number' ? data.xp_gained : undefined,
              reputationChange: (data.reputationChange && typeof data.reputationChange === 'object') ? data.reputationChange : 
                               (data.reputation_change && typeof data.reputation_change === 'object') ? data.reputation_change : undefined,
              npcRelationshipChange: (data.npcRelationshipChange && typeof data.npcRelationshipChange === 'object') ? data.npcRelationshipChange :
                                    (data.npc_relationship_change && typeof data.npc_relationship_change === 'object') ? data.npc_relationship_change : undefined,
              suggestedClassChange: data.suggestedClassChange || data.suggested_class_change || undefined,
              gainedSkill: data.gainedSkill || data.gained_skill || undefined,
              branchingChoices,
              dynamicEventTriggered: data.dynamicEventTriggered || data.dynamic_event_triggered || undefined,
              isCharacterDefeated,
              assessedDifficulty,
              diceRoll,
              diceType,
              worldMapChanges,
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