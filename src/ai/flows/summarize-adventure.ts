/**
 * @fileOverview Summarizes the adventure.
 */

import { z } from 'zod';
import { getClient } from '../ai-instance';

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

const PROVIDER_MODEL_MAP: Record<string, string> = {
  gemini: 'gemini-2.5-flash',
  openai: 'gpt-4o',
  claude: 'claude-3-5-sonnet-20241022',
  deepseek: 'deepseek-chat',
};

export async function summarizeAdventure(input: SummarizeAdventureInput): Promise<SummarizeAdventureOutput> {
  const prompt = `Summarize the following adventure story concisely, highlighting key events and consequences:\n\n${input.story}`;

  try {
      const client = getClient(input.userApiKey);
      const response = await client.models.generateContent({
          model: PROVIDER_MODEL_MAP.gemini,
          contents: prompt,
          config: {
              responseMimeType: "application/json",
          },
          signal: input.signal,
      });

      const text = response.text;
      if (!text) throw new Error("No text");
      
      const parsed = JSON.parse(text);
      const validation = SummarizeAdventureOutputSchema.safeParse(parsed);
      
      if (validation.success) {
          return validation.data;
      } else {
          console.warn("Zod validation failed for summarizeAdventure, using fallback.", validation.error);
          throw new Error("Invalid response structure");
      }
  } catch (error: any) {
      if (error.name === 'AbortError') {
          throw error;
      }
      console.error("AI Summary Error:", error);
      return { summary: "Summary generation failed." };
  }
}