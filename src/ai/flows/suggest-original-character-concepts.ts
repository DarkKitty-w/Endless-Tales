/**
 * @fileOverview An AI agent that suggests original character concepts.
 */

import { z } from 'zod';
import { getClient } from '../ai-instance';
import { extractJsonFromResponse } from '../../lib/utils';
import { logger, setRequestId, setTraceId } from '../../lib/logger';

export interface SuggestOriginalCharacterConceptsInput {
  universeName: string;
  userApiKey?: string | null;
  signal?: AbortSignal;
  // OBS-6: Add requestId and traceId for correlation
  requestId?: string;
  traceId?: string;
}

export interface SuggestOriginalCharacterConceptsOutput {
  suggestedConcepts: string[];
  // ERR-8/ERR-11: Add fields to track fallback and preserve raw response
  usedFallback?: boolean;
  rawResponse?: string;
}

const SuggestOriginalCharacterConceptsOutputSchema = z.object({
  suggestedConcepts: z.array(z.string()),
});

export async function suggestOriginalCharacterConcepts(input: SuggestOriginalCharacterConceptsInput): Promise<SuggestOriginalCharacterConceptsOutput> {
  // OBS-6: Set requestId and traceId from input if provided
  if (input.requestId) {
    setRequestId(input.requestId);
  }
  if (input.traceId) {
    setTraceId(input.traceId);
  }
  
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
          // OBS-6 & OBS-7: Pass requestId and traceId for correlation
          requestId: input.requestId,
          traceId: input.traceId,
      });

      const text = response.text;
      if (!text) throw new Error("No text");
      
      const cleanedText = extractJsonFromResponse(text);
      
      // ERR-6 Fix: Wrap JSON.parse in try-catch to preserve raw response text
      let parsed: any;
      try {
        parsed = JSON.parse(cleanedText);
      } catch (parseError) {
        logger.error("JSON parse failed for suggestOriginalCharacterConcepts. Raw response:", cleanedText.substring(0, 500));
        throw new Error(`JSON parse failed. Raw response: ${cleanedText.substring(0, 500)}`);
      }
      
      const validation = SuggestOriginalCharacterConceptsOutputSchema.safeParse(parsed);
      
      if (validation.success) {
          // ERR-8/ERR-11: Include raw response for debugging (only in dev mode)
          const result = validation.data;
          if (process.env.NODE_ENV === 'development') {
            (result as any).rawResponse = text;
          }
          (result as any).usedFallback = false;
          return result;
      } else {
          logger.error('Zod validation failed for suggestOriginalCharacterConcepts', 'suggest-original-character-concepts', { rawResponse: cleanedText.substring(0, 500) });
          logger.error('Validation error', 'suggest-original-character-concepts', { error: validation.error?.message || String(validation.error) });
          throw new Error(`Invalid response structure. Raw response: ${cleanedText.substring(0, 500)}`);
      }
  } catch (error: any) {
      if (error.name === 'AbortError') {
          throw error;
      }
      logger.error('AI Suggestion Error', 'suggest-original-character-concepts', { error: error.message || String(error) });
      return { 
        suggestedConcepts: ["A wanderer", "A local merchant", "A lost soldier"],
        // ERR-8/ERR-11: Indicate fallback is being used
        usedFallback: true,
        rawResponse: error.message?.includes('Raw response:') ? error.message.split('Raw response: ')[1] : undefined,
      };
  }
}