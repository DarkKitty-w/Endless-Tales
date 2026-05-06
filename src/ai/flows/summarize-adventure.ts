/**
 * @fileOverview Summarizes the adventure.
 */

import { z } from 'zod';
import { getClient } from '../ai-instance';
import { extractJsonFromResponse } from '../../lib/utils';
import { logger } from '../../lib/logger';

export interface SummarizeAdventureInput {
  story: string;
  userApiKey?: string | null;
  signal?: AbortSignal;
}

export interface SummarizeAdventureOutput {
  summary: string;
}

const SummarizeAdventureOutputSchema = z.object({
  summary: z.string(),
});

export async function summarizeAdventure(input: SummarizeAdventureInput): Promise<SummarizeAdventureOutput> {
  const prompt = `Summarize the following adventure story concisely, highlighting key events and consequences:\n\n${input.story}`;

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
        logger.error("JSON parse failed for summarizeAdventure. Raw response:", cleanedText.substring(0, 500));
        throw new Error(`JSON parse failed. Raw response: ${cleanedText.substring(0, 500)}`);
      }
      
      const validation = SummarizeAdventureOutputSchema.safeParse(parsed);
      
      if (validation.success) {
          return validation.data;
      } else {
          logger.error("Zod validation failed for summarizeAdventure. Raw response:", cleanedText.substring(0, 500));
          logger.error("Validation error:", validation.error);
          throw new Error(`Invalid response structure. Raw response: ${cleanedText.substring(0, 500)}`);
      }
  } catch (error: any) {
      if (error.name === 'AbortError') {
          throw error;
      }
      logger.error("AI Summary Error:", error);
      return { summary: "Summary generation failed." };
  }
}