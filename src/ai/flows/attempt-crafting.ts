/**
 * @fileOverview An AI agent that determines the outcome of a crafting attempt.
 */

import { z } from 'zod';
import { getClient } from '../ai-instance';
import type { InventoryItem, ItemQuality } from '../../types/game-types';
import { processAiResponse } from '../../lib/utils';
import { logger } from '../../lib/logger';

export interface AttemptCraftingInput {
  characterKnowledge: string[];
  characterSkills: string[];
  inventoryItems: string[];
  desiredItem: string;
  usedIngredients: string[];
  userApiKey?: string | null;
  signal?: AbortSignal;
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

// Zod schema for validation
const AttemptCraftingOutputSchema = z.object({
    success: z.boolean(),
    message: z.string(),
    craftedItem: z.object({
        name: z.string(),
        description: z.string(),
        quality: z.enum(["Poor", "Common", "Uncommon", "Rare", "Epic", "Legendary"]).optional(),
        weight: z.number().optional(),
        durability: z.number().optional(),
        magicalEffect: z.string().optional(),
    }).nullable(),
    consumedItems: z.array(z.string()),
});

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

Return ONLY a valid JSON object. No explanations, no markdown formatting.
`;

  try {
      const client = getClient(input.userApiKey);
      const response = await client.models.generateContent({
          contents: prompt,
          config: { responseMimeType: "application/json" },
          signal: input.signal,
      });

      const text = response.text;
      if (!text) throw new Error("No text returned from AI");

      const fallback: AttemptCraftingOutput = {
          success: false,
          message: "The crafting attempt failed due to an external force (AI Error).",
          craftedItem: null,
          consumedItems: [],
      };

      const normalizer = (data: any): AttemptCraftingOutput => ({
          success: data.success ?? fallback.success,
          message: data.message ?? fallback.message,
          craftedItem: data.craftedItem ?? fallback.craftedItem,
          consumedItems: Array.isArray(data.consumedItems) ? data.consumedItems : fallback.consumedItems,
      });

      const result = await processAiResponse(
          text,
          AttemptCraftingOutputSchema,
          fallback,
          normalizer
      );
      return result;

  } catch (error: any) {
      if (error.name === 'AbortError') throw error;
      logger.error("AI Crafting Error:", error);
      return {
          success: false,
          message: "The crafting attempt failed due to an external force (AI Error).",
          craftedItem: null,
          consumedItems: []
      };
  }
}