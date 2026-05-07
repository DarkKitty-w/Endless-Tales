/**
 * @fileOverview Summarizes the adventure.
 */

import { z } from 'zod';
import { getClient } from '../ai-instance';
import { extractJsonFromResponse } from '../../lib/utils';
import { logger, setRequestId, setTraceId } from '../../lib/logger';

export interface SummarizeAdventureInput {
  story: string;
  userApiKey?: string | null;
  signal?: AbortSignal;
  // OBS-6: Add requestId and traceId for correlation
  requestId?: string;
  traceId?: string;
}

export interface SummarizeAdventureOutput {
  summary: string;
  // ERR-8/ERR-11: Add fields to track fallback and preserve raw response
  usedFallback?: boolean;
  rawResponse?: string;
}

const SummarizeAdventureOutputSchema = z.object({
  summary: z.string(),
});

export async function summarizeAdventure(input: SummarizeAdventureInput): Promise<SummarizeAdventureOutput> {
  // OBS-6: Set requestId and traceId from input if provided
  if (input.requestId) {
    setRequestId(input.requestId);
  }
  if (input.traceId) {
    setTraceId(input.traceId);
  }
  
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
        logger.error("JSON parse failed for summarizeAdventure. Raw response:", cleanedText.substring(0, 500));
        throw new Error(`JSON parse failed. Raw response: ${cleanedText.substring(0, 500)}`);
      }
      
      const validation = SummarizeAdventureOutputSchema.safeParse(parsed);
      
      if (validation.success) {
          // ERR-8/ERR-11: Include raw response for debugging (only in dev mode)
          const result = validation.data;
          if (process.env.NODE_ENV === 'development') {
            (result as any).rawResponse = text;
          }
          (result as any).usedFallback = false;
          return result;
      } else {
          logger.error('Zod validation failed for summarizeAdventure', 'summarize-adventure', { rawResponse: cleanedText.substring(0, 500) });
          logger.error('Validation error', 'summarize-adventure', { error: validation.error?.message || String(validation.error) });
          throw new Error(`Invalid response structure. Raw response: ${cleanedText.substring(0, 500)}`);
      }
  } catch (error: any) {
      if (error.name === 'AbortError') {
          throw error;
      }
      logger.error('AI Summary Error', 'summarize-adventure', { error: error.message || String(error) });
      return { 
        summary: "Summary generation failed.",
        // ERR-8/ERR-11: Indicate fallback is being used
        usedFallback: true,
        rawResponse: error.message?.includes('Raw response:') ? error.message.split('Raw response: ')[1] : undefined,
      };
  }
}