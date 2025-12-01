/**
 * @fileOverview An AI agent that suggests existing character names.
 */

import { getClient } from '../ai-instance';
import { Type, Schema } from "@google/genai";

export interface SuggestExistingCharactersInput {
  universeName: string;
  userApiKey?: string | null;
}

export interface SuggestExistingCharactersOutput {
  suggestedNames: string[];
}

const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        suggestedNames: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ["suggestedNames"]
};

export async function suggestExistingCharacters(input: SuggestExistingCharactersInput): Promise<SuggestExistingCharactersOutput> {
  const prompt = `Suggest 3 to 5 well-known existing characters from the universe "${input.universeName}" suitable for a player character. Return only a JSON object with 'suggestedNames' array.`;

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
      if (!text) throw new Error("No text");
      return JSON.parse(text);
  } catch (e) {
      console.error("AI Suggestion Error:", e);
      return { suggestedNames: ["Hero", "Villain", "Sidekick"] };
  }
}