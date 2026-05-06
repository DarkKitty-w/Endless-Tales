/**
 * @fileOverview An AI agent that suggests existing character names.
 */

import { z } from 'zod';
import { getClient } from '../ai-instance';
import { extractJsonFromResponse } from '../../lib/utils';
import { logger } from '../../lib/logger';

export interface SuggestExistingCharactersInput {
  universeName: string;
  userApiKey?: string | null;
  signal?: AbortSignal;
}

export interface SuggestExistingCharactersOutput {
  suggestedNames: string[];
  // ERR-8/ERR-11: Add fields to track fallback and preserve raw response
  usedFallback?: boolean;
  rawResponse?: string;
}

const SuggestExistingCharactersOutputSchema = z.object({
  suggestedNames: z.array(z.string()),
});

export async function suggestExistingCharacters(input: SuggestExistingCharactersInput): Promise<SuggestExistingCharactersOutput> {
  const prompt = `Suggest 3 to 5 well-known existing characters from the universe "${input.universeName}" suitable for a player character. Return only a JSON object with 'suggestedNames' array.`;

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
      
      // ERR-6 Fix: Wrap JSON.parse in try-catch to preserve raw response text
      let parsed: any;
      try {
        parsed = JSON.parse(cleanedText);
      } catch (parseError) {
        logger.error("JSON parse failed for suggestExistingCharacters. Raw response:", cleanedText.substring(0, 500));
        throw new Error(`JSON parse failed. Raw response: ${cleanedText.substring(0, 500)}`);
      }
      
      const validation = SuggestExistingCharactersOutputSchema.safeParse(parsed);
      
      if (validation.success) {
          // ERR-8/ERR-11: Include raw response for debugging (only in dev mode)
          const result = validation.data;
          if (process.env.NODE_ENV === 'development') {
            (result as any).rawResponse = text;
          }
          (result as any).usedFallback = false;
          return result;
      } else {
          logger.error("Zod validation failed for suggestExistingCharacters. Raw response:", cleanedText.substring(0, 500));
          logger.error("Validation error:", validation.error);
          throw new Error(`Invalid response structure. Raw response: ${cleanedText.substring(0, 500)}`);
      }
  } catch (error: any) {
      if (error.name === 'AbortError') {
          throw error;
      }
      logger.error("AI Suggestion Error:", error);
      return { 
        suggestedNames: ["Hero", "Villain", "Sidekick"],
        // ERR-8/ERR-11: Indicate fallback is being used
        usedFallback: true,
        rawResponse: error.message?.includes('Raw response:') ? error.message.split('Raw response: ')[1] : undefined,
      };
  }
}