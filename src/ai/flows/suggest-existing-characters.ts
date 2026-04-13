/**
 * @fileOverview An AI agent that suggests existing character names.
 */

import { z } from 'zod';
import { getClient } from '../ai-instance';

export interface SuggestExistingCharactersInput {
  universeName: string;
  userApiKey?: string | null;
  signal?: AbortSignal;
}

export interface SuggestExistingCharactersOutput {
  suggestedNames: string[];
}

const SuggestExistingCharactersOutputSchema = z.object({
  suggestedNames: z.array(z.string()),
});

const PROVIDER_MODEL_MAP: Record<string, string> = {
  gemini: 'gemini-2.5-flash',
  openai: 'gpt-4o',
  claude: 'claude-3-5-sonnet-20241022',
  deepseek: 'deepseek-chat',
};

export async function suggestExistingCharacters(input: SuggestExistingCharactersInput): Promise<SuggestExistingCharactersOutput> {
  const prompt = `Suggest 3 to 5 well-known existing characters from the universe "${input.universeName}" suitable for a player character. Return only a JSON object with 'suggestedNames' array.`;

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
      const validation = SuggestExistingCharactersOutputSchema.safeParse(parsed);
      
      if (validation.success) {
          return validation.data;
      } else {
          console.warn("Zod validation failed for suggestExistingCharacters, using fallback.", validation.error);
          throw new Error("Invalid response structure");
      }
  } catch (error: any) {
      if (error.name === 'AbortError') {
          throw error;
      }
      console.error("AI Suggestion Error:", error);
      return { suggestedNames: ["Hero", "Villain", "Sidekick"] };
  }
}