/**
 * @fileOverview An AI agent that suggests original character concepts.
 */

import { z } from 'zod';
import { getClient } from '../ai-instance';
import { extractJsonFromResponse } from '../../lib/utils';
import { logger } from '../../lib/logger';

export interface SuggestOriginalCharacterConceptsInput {
  universeName: string;
  userApiKey?: string | null;
  signal?: AbortSignal;
}

export interface SuggestOriginalCharacterConceptsOutput {
  suggestedConcepts: string[];
}

const SuggestOriginalCharacterConceptsOutputSchema = z.object({
  suggestedConcepts: z.array(z.string()),
});

export async function suggestOriginalCharacterConcepts(input: SuggestOriginalCharacterConceptsInput): Promise<SuggestOriginalCharacterConceptsOutput> {
  const prompt = `Suggest 3 to 5 creative ORIGINAL character concepts for the universe "${input.universeName}". Brief phrases. Return only JSON object with 'suggestedConcepts' array.`;

  try {
      const client = getClient(input.userApiKey);
      const response = await client.models.generateContent({
          // ✅ model removed – provider uses its default
          contents: prompt,
          config: {
              responseMimeType: "application/json",
          },
          signal: input.signal,
      });

      const text = response.text;
      if (!text) throw new Error("No text");
      
      const cleanedText = extractJsonFromResponse(text);
      const parsed = JSON.parse(cleanedText);
      const validation = SuggestOriginalCharacterConceptsOutputSchema.safeParse(parsed);
      
      if (validation.success) {
          return validation.data;
      } else {
          console.warn("Zod validation failed for suggestOriginalCharacterConcepts, using fallback.", validation.error);
          throw new Error("Invalid response structure");
      }
  } catch (error: any) {
      if (error.name === 'AbortError') {
          throw error;
      }
      logger.error("AI Suggestion Error:", error);
      return { suggestedConcepts: ["A wanderer", "A local merchant", "A lost soldier"] };
  }
}