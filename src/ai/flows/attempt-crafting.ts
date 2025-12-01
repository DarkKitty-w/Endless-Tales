/**
 * @fileOverview An AI agent that determines the outcome of a crafting attempt.
 */

import { getClient } from '../ai-instance';
import { Type, Schema } from "@google/genai";
import type { InventoryItem, ItemQuality } from '../../types/game-types';

export interface AttemptCraftingInput {
  characterKnowledge: string[];
  characterSkills: string[];
  inventoryItems: string[];
  desiredItem: string;
  usedIngredients: string[];
  userApiKey?: string | null;
}

export interface AttemptCraftingOutput {
  success: boolean;
  message: string;
  craftedItem: {
      name: string;
      description: string;
      quality?: ItemQuality;
      weight?: number;
      durability?: number;
      magicalEffect?: string;
  } | null;
  consumedItems: string[];
}

const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        success: { type: Type.BOOLEAN },
        message: { type: Type.STRING },
        craftedItem: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                quality: { type: Type.STRING, enum: ["Poor", "Common", "Uncommon", "Rare", "Epic", "Legendary"] },
                weight: { type: Type.NUMBER },
                durability: { type: Type.NUMBER },
                magicalEffect: { type: Type.STRING }
            },
            nullable: true
        },
        consumedItems: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        }
    },
    required: ["success", "message", "consumedItems"]
};

export async function attemptCrafting(input: AttemptCraftingInput): Promise<AttemptCraftingOutput> {
  const prompt = `
You are a Master Crafter AI for the text adventure "Endless Tales". Evaluate a player's crafting attempt.

**Character Capabilities:**
* Knowledge: ${input.characterKnowledge.length ? input.characterKnowledge.join(', ') : 'None'}
* Skills: ${input.characterSkills.length ? input.characterSkills.join(', ') : 'None'}

**Inventory:**
${input.inventoryItems.length ? input.inventoryItems.join(', ') : 'Empty'}

**Crafting Attempt:**
* Goal: ${input.desiredItem}
* Ingredients Used: ${input.usedIngredients.length ? input.usedIngredients.join(', ') : 'None specified'}

**Evaluation Task:**
1. **Plausibility:** Is crafting ${input.desiredItem} feasible?
2. **Knowledge/Skills:** Does character have required know-how?
3. **Ingredients:** Are ingredients logical and available?

**Outcome:**
* **Success:** Set success=true. Generate item details. List used ingredients in consumedItems.
* **Failure/Impossible:** Set success=false. Provide message. List ingredients consumed (if failed attempt wasted them).

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
      return JSON.parse(text) as AttemptCraftingOutput;

  } catch (error: any) {
      console.error("AI Crafting Error:", error);
      return {
          success: false,
          message: "The crafting attempt failed due to an external force (AI Error).",
          craftedItem: null,
          consumedItems: []
      };
  }
}