/**
 * @fileOverview An AI agent that narrates the story of a text adventure game.
 */
import { getClient } from '../ai-instance';
import { Type, Schema } from "@google/genai";
import type { CharacterStats } from '../../types/character-types';
import type { AdventureSettings } from '../../types/adventure-types';

export interface NarrateAdventureInput {
  character: any; // Using any for simplicity in types here, effectively matches schema
  playerChoice: string;
  gameState: string;
  previousNarration?: string;
  adventureSettings: AdventureSettings;
  turnCount: number;
  userApiKey?: string | null;
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
}

const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        narration: { type: Type.STRING },
        updatedGameState: { type: Type.STRING },
        updatedStats: { 
            type: Type.OBJECT,
            properties: {
                strength: { type: Type.NUMBER },
                stamina: { type: Type.NUMBER },
                wisdom: { type: Type.NUMBER },
            },
            nullable: true
        },
        updatedTraits: { type: Type.ARRAY, items: { type: Type.STRING }, nullable: true },
        updatedKnowledge: { type: Type.ARRAY, items: { type: Type.STRING }, nullable: true },
        progressedToStage: { type: Type.NUMBER, nullable: true },
        healthChange: { type: Type.NUMBER, nullable: true },
        staminaChange: { type: Type.NUMBER, nullable: true },
        manaChange: { type: Type.NUMBER, nullable: true },
        xpGained: { type: Type.NUMBER, nullable: true },
        reputationChange: {
            type: Type.OBJECT,
            properties: { faction: { type: Type.STRING }, change: { type: Type.NUMBER } },
            nullable: true
        },
        npcRelationshipChange: {
            type: Type.OBJECT,
            properties: { npcName: { type: Type.STRING }, change: { type: Type.NUMBER } },
            nullable: true
        },
        suggestedClassChange: { type: Type.STRING, nullable: true },
        gainedSkill: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                type: { type: Type.STRING },
                manaCost: { type: Type.NUMBER },
                staminaCost: { type: Type.NUMBER }
            },
            nullable: true
        },
        branchingChoices: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: { text: { type: Type.STRING }, consequenceHint: { type: Type.STRING } },
                required: ["text"]
            }
        },
        dynamicEventTriggered: { type: Type.STRING, nullable: true },
        isCharacterDefeated: { type: Type.BOOLEAN, nullable: true }
    },
    required: ["narration", "updatedGameState", "branchingChoices"]
};

export async function narrateAdventure(input: NarrateAdventureInput): Promise<NarrateAdventureOutput> {
  if (input.character.class === 'admin000') {
    return {
        narration: `Developer command "${input.playerChoice}" processed.`,
        updatedGameState: input.gameState,
        branchingChoices: [
            { text: "Continue." }, { text: "Inspect." }, { text: "Status." }, { text: "Chaos." }
        ]
    };
  }

  const { character, adventureSettings, turnCount } = input;
  const isCustom = adventureSettings.adventureType === "Custom";
  const isImmersed = adventureSettings.adventureType === "Immersed";
  const isRandomized = adventureSettings.adventureType === "Randomized";

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
**Current Game State:** ${input.gameState}

**Action:** ${input.playerChoice}

**Task:**
1. Narrate the outcome.
2. Update game state (include Turn: ${turnCount + 1}).
3. Provide exactly 4 branching choices.
4. Calculate resource changes (health, stamina, mana) if applicable.
5. If character HP <= 0, set isCharacterDefeated: true.

Output JSON.
`;

  try {
      const client = getClient(input.userApiKey);
      const response = await client.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: prompt,
          config: {
              responseMimeType: "application/json",
              responseSchema: responseSchema,
          }
      });

      const text = response.text;
      if (!text) throw new Error("No text returned from AI");
      const output = JSON.parse(text) as NarrateAdventureOutput;
      
      // Force correct branching choice count if AI fails
      if (!output.branchingChoices || output.branchingChoices.length !== 4) {
          output.branchingChoices = [
            { text: "Look around." }, { text: "Think carefully." },
            { text: "Check inventory." }, { text: "Wait." }
          ];
      }
      
      return output;

  } catch (error: any) {
      console.error("AI Narration Error:", error);
      return {
          narration: `The Narrator stumbled. (AI Error: ${error.message}). Please retry.`,
          updatedGameState: input.gameState,
          branchingChoices: [
            { text: "Look around." }, { text: "Think carefully." },
            { text: "Check inventory." }, { text: "Wait." }
          ]
      };
  }
}