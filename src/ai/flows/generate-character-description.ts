/**
 * @fileOverview An AI agent that generates a detailed character description.
 */

import { z } from 'zod';
import { getClient } from '../ai-instance';
import { extractJsonFromResponse } from '../../lib/utils';
import { logger, setRequestId, setTraceId } from '../../lib/logger';
import { CHARACTER_GENERATION_SYSTEM_MESSAGE, buildSystemMessage } from '../prompt-templates';

export interface GenerateCharacterDescriptionInput {
  characterDescription: string;
  isImmersedMode?: boolean;
  universeName?: string;
  playerCharacterConcept?: string;
  characterOriginType?: 'original' | 'existing';
  userApiKey?: string | null;
  signal?: AbortSignal;
  // OBS-6: Add requestId and traceId for correlation
  requestId?: string;
  traceId?: string;
}

export interface GenerateCharacterDescriptionOutput {
  detailedDescription: string;
  inferredClass: string;
  inferredTraits: string[];
  inferredKnowledge: string[];
  inferredBackground: string;
  // ERR-8/ERR-11: Add fields to track fallback and raw response
  usedFallback?: boolean;
  rawResponse?: string;
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
  
  // OBS-6: Set requestId and traceId from input if provided (for correlation UI → AI)
  if (input.requestId) {
    setRequestId(input.requestId);
  }
  if (input.traceId) {
    setTraceId(input.traceId);
  }
  
  const systemMessage = buildSystemMessage(
    CHARACTER_GENERATION_SYSTEM_MESSAGE,
    [
      'Output ONLY valid JSON matching the required schema.',
      'Do not include markdown formatting or code blocks in the response.',
    ]
  );

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

  const userPrompt = `${promptContext}

Output JSON matching the schema.`;

  try {
      const client = getClient(input.userApiKey);
      const response = await client.models.generateContent({
          // ✅ model removed – provider uses its default
          contents: userPrompt,
          systemMessage: systemMessage,
          config: {
              responseMimeType: "application/json",
          },
          signal: input.signal,
          // OBS-6 & OBS-7: Pass requestId and traceId for correlation
          requestId: input.requestId,
          traceId: input.traceId,
      });

      const text = response.text;
      if (!text) throw new Error("No text returned from AI");
      
      const cleanedText = extractJsonFromResponse(text);
      
      // ERR-6 Fix: Wrap JSON.parse in try-catch to preserve raw response text
      let parsed: any;
      try {
        parsed = JSON.parse(cleanedText);
      } catch (parseError) {
        logger.error("JSON parse failed for generateCharacterDescription. Raw response:", cleanedText.substring(0, 500));
        throw new Error(`JSON parse failed. Raw response: ${cleanedText.substring(0, 500)}`);
      }
      
      const validation = GenerateCharacterDescriptionOutputSchema.safeParse(parsed);
      
      if (validation.success) {
          // ERR-8/ERR-11: Include raw response for debugging (only in dev mode)
          const result = validation.data;
          if (process.env.NODE_ENV === 'development') {
            (result as any).rawResponse = text;
          }
          (result as any).usedFallback = false;
          return result;
      } else {
          logger.error('Zod validation failed for generateCharacterDescription', 'generate-character-description', { rawResponse: cleanedText.substring(0, 500) });
          logger.error('Validation error', 'generate-character-description', { error: validation.error?.message || String(validation.error) });
          throw new Error(`Invalid response structure. Raw response: ${cleanedText.substring(0, 500)}`);
      }

  } catch (error: any) {
      if (error.name === 'AbortError') {
          throw error;
      }
      logger.error('AI Character Generation Error', 'generate-character-description', { error: error.message || String(error) });
      return {
          detailedDescription: `AI generation failed for: "${input.characterDescription}".`,
          inferredClass: input.isImmersedMode ? "Immersed Protagonist" : "Adventurer",
          inferredTraits: [],
          inferredKnowledge: [],
          inferredBackground: "Unknown",
          // ERR-8/ERR-11: Indicate fallback is being used
          usedFallback: true,
          rawResponse: error.message?.includes('Raw response:') ? error.message.split('Raw response: ')[1] : undefined,
      };
  }
}