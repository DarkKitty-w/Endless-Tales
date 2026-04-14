/**
 * @fileOverview An AI agent that generates a detailed character description.
 */

import { z } from 'zod';
import { getClient } from '../ai-instance';
import { extractJsonFromResponse } from '../../lib/utils';

export interface GenerateCharacterDescriptionInput {
  characterDescription: string;
  isImmersedMode?: boolean;
  universeName?: string;
  playerCharacterConcept?: string;
  characterOriginType?: 'original' | 'existing';
  userApiKey?: string | null;
  signal?: AbortSignal;
}

export interface GenerateCharacterDescriptionOutput {
  detailedDescription: string;
  inferredClass: string;
  inferredTraits: string[];
  inferredKnowledge: string[];
  inferredBackground: string;
}

const GenerateCharacterDescriptionOutputSchema = z.object({
  detailedDescription: z.string(),
  inferredClass: z.string(),
  inferredTraits: z.array(z.string()),
  inferredKnowledge: z.array(z.string()),
  inferredBackground: z.string(),
});

export async function generateCharacterDescription(
  input: GenerateCharacterDescriptionInput
): Promise<GenerateCharacterDescriptionOutput> {
  
  let promptContext = "";
  if (input.isImmersedMode) {
      if (input.characterOriginType === 'existing') {
          promptContext = `
**Context: IMMERSED ADVENTURE MODE - EXISTING CHARACTER**
* Universe: ${input.universeName}
* Character Name: ${input.playerCharacterConcept}
* User Provided Brief: ${input.characterDescription}

Task:
1. Provide a detailed description of the well-known character "${input.playerCharacterConcept}" from the ${input.universeName} universe, staying true to established lore.
2. Infer their role/archetype (inferredClass) appropriate to that universe.
3. Infer traits, knowledge/skills, and background based on canon.
`;
      } else {
          promptContext = `
**Context: IMMERSED ADVENTURE MODE - ORIGINAL CHARACTER**
* Universe: ${input.universeName}
* Character Concept: ${input.playerCharacterConcept}
* User Description: ${input.characterDescription}

Task:
1. Elaborate on the character within the ${input.universeName} universe.
2. Infer role/archetype (inferredClass).
3. Infer traits, knowledge/skills, and background fitting the lore.
`;
      }
  } else {
      promptContext = `
**Context: STANDARD ADVENTURE MODE**
* User Description: ${input.characterDescription}

Task:
1. Elaborate on the description.
2. Infer Class from [Warrior, Mage, Rogue, Scholar, Hunter, Healer, Bard, Artisan, Noble, Commoner, Adventurer].
3. Infer traits, knowledge, and background.
`;
  }

  const prompt = `You are a fantasy/sci-fi story writer and character profiler.
${promptContext}

Output JSON matching the schema.
`;

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
      if (!text) throw new Error("No text returned from AI");
      
      const cleanedText = extractJsonFromResponse(text);
      const parsed = JSON.parse(cleanedText);
      const validation = GenerateCharacterDescriptionOutputSchema.safeParse(parsed);
      
      if (validation.success) {
          return validation.data;
      } else {
          console.warn("Zod validation failed for generateCharacterDescription, using fallback.", validation.error);
          throw new Error("Invalid response structure");
      }

  } catch (error: any) {
      if (error.name === 'AbortError') {
          throw error;
      }
      console.error("AI Character Generation Error:", error);
      return {
          detailedDescription: `AI generation failed for: "${input.characterDescription}".`,
          inferredClass: input.isImmersedMode ? "Immersed Protagonist" : "Adventurer",
          inferredTraits: [],
          inferredKnowledge: [],
          inferredBackground: "Unknown",
      };
  }
}