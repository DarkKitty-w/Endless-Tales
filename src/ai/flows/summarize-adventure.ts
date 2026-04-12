/**
 * @fileOverview Summarizes the adventure.
 */

import { z } from 'zod';
import { getClient } from '../ai-instance';
import { Type, Schema } from "@google/genai";

export interface SummarizeAdventureInput {
  story: string;
  userApiKey?: string | null;
}

export interface SummarizeAdventureOutput {
  summary: string;
}

const SummarizeAdventureOutputSchema = z.object({
  summary: z.string(),
});

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
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
              responseMimeType: "application/json",
              responseSchema: responseSchema,
          }
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
  } catch (e) {
      console.error("AI Summary Error:", e);
      return { summary: "Summary generation failed." };
  }
}