/**
 * @fileOverview An AI agent that generates a detailed character description.
 */

import { getClient } from '../ai-instance';
import { Type, Schema } from "@google/genai";

export interface GenerateCharacterDescriptionInput {
  characterDescription: string;
  isImmersedMode?: boolean;
  universeName?: string;
  playerCharacterConcept?: string;
  userApiKey?: string | null;
}

export interface GenerateCharacterDescriptionOutput {
  detailedDescription: string;
  inferredClass: string;
  inferredTraits: string[];
  inferredKnowledge: string[];
  inferredBackground: string;
}

const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        detailedDescription: { type: Type.STRING },
        inferredClass: { type: Type.STRING },
        inferredTraits: { type: Type.ARRAY, items: { type: Type.STRING } },
        inferredKnowledge: { type: Type.ARRAY, items: { type: Type.STRING } },
        inferredBackground: { type: Type.STRING }
    },
    required: ["detailedDescription", "inferredClass", "inferredTraits", "inferredKnowledge", "inferredBackground"]
};

export async function generateCharacterDescription(
  input: GenerateCharacterDescriptionInput
): Promise<GenerateCharacterDescriptionOutput> {
  
  let promptContext = "";
  if (input.isImmersedMode) {
      promptContext = `
**Context: IMMERSED ADVENTURE MODE**
* Universe: ${input.universeName}
* Character Concept: ${input.playerCharacterConcept}
* User Description: ${input.characterDescription}

Task:
1. Elaborate on the character within the ${input.universeName} universe.
2. Infer role/archetype (inferredClass).
3. Infer traits, knowledge/skills, and background fitting the lore.
`;
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
          model: 'gemini-2.0-flash',
          contents: prompt,
          config: {
              responseMimeType: "application/json",
              responseSchema: responseSchema,
          }
      });

      const text = response.text;
      if (!text) throw new Error("No text returned from AI");
      const output = JSON.parse(text) as GenerateCharacterDescriptionOutput;
      
      // Sanitization
      output.inferredTraits = Array.isArray(output.inferredTraits) ? output.inferredTraits : [];
      output.inferredKnowledge = Array.isArray(output.inferredKnowledge) ? output.inferredKnowledge : [];
      
      return output;

  } catch (error) {
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