/**
 * @fileOverview An AI agent that suggests original character concepts.
 */

import { getClient } from '../ai-instance';
import { Type, Schema } from "@google/genai";

export interface SuggestOriginalCharacterConceptsInput {
  universeName: string;
  userApiKey?: string | null;
}

export interface SuggestOriginalCharacterConceptsOutput {
  suggestedConcepts: string[];
}

const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        suggestedConcepts: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ["suggestedConcepts"]
};

export async function suggestOriginalCharacterConcepts(input: SuggestOriginalCharacterConceptsInput): Promise<SuggestOriginalCharacterConceptsOutput> {
  const prompt = `Suggest 3 to 5 creative ORIGINAL character concepts for the universe "${input.universeName}". Brief phrases. Return only JSON object with 'suggestedConcepts' array.`;

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
      return { suggestedConcepts: ["A wanderer", "A local merchant", "A lost soldier"] };
  }
}