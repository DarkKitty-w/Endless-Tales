/**
 * @fileOverview Summarizes the adventure.
 */

import { getClient } from '../ai-instance';
import { Type, Schema } from "@google/genai";

export interface SummarizeAdventureInput {
  story: string;
  userApiKey?: string | null;
}

export interface SummarizeAdventureOutput {
  summary: string;
}

const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        summary: { type: Type.STRING }
    },
    required: ["summary"]
};

export async function summarizeAdventure(input: SummarizeAdventureInput): Promise<SummarizeAdventureOutput> {
  const prompt = `Summarize the following adventure story concisely, highlighting key events and consequences:\n\n${input.story}`;

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
      console.error("AI Summary Error:", e);
      return { summary: "Summary generation failed." };
  }
}