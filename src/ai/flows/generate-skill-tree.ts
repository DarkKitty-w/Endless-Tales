/**
 * @fileOverview An AI agent that generates a skill tree.
 */

import { z } from 'zod';
import { getClient } from '../ai-instance';
import type { SkillTree } from '../../types/game-types';
import { MAX_SKILL_TREE_STAGES } from '../../lib/constants';

export interface GenerateSkillTreeInput {
  characterClass: string;
  userApiKey?: string | null;
  signal?: AbortSignal;
}

export type GenerateSkillTreeOutput = SkillTree;

const SkillSchema = z.object({
    name: z.string(),
    description: z.string(),
    manaCost: z.number().optional().nullable(),
    staminaCost: z.number().optional().nullable(),
});

const SkillTreeStageSchema = z.object({
    stage: z.number(),
    stageName: z.string(),
    skills: z.array(SkillSchema),
});

const GenerateSkillTreeOutputSchema = z.object({
    className: z.string(),
    stages: z.array(SkillTreeStageSchema).length(MAX_SKILL_TREE_STAGES),
});

const PROVIDER_MODEL_MAP: Record<string, string> = {
  gemini: 'gemini-2.5-flash',
  openai: 'gpt-4o',
  claude: 'claude-3-5-sonnet-20241022',
  deepseek: 'deepseek-chat',
};

const createFallbackSkillTree = (className: string): SkillTree => ({
    className: className,
    stages: [
        { stage: 0, stageName: "Potential", skills: [] },
        { stage: 1, stageName: "Novice", skills: [{ name: "Basic Training", description: "Improves readiness."}] },
        { stage: 2, stageName: "Apprentice", skills: [{ name: "Focused Study", description: "Deeper understanding."}] },
        { stage: 3, stageName: "Adept", skills: [{ name: "Power Surge", description: "Boosts effectiveness."}] },
        { stage: 4, stageName: "Master", skills: [{ name: "Ultimate Focus", description: "True potential."}] },
    ].slice(0, MAX_SKILL_TREE_STAGES)
});

export async function generateSkillTree(input: GenerateSkillTreeInput): Promise<GenerateSkillTreeOutput> {
  const prompt = `
You are a game designer. Generate a ${MAX_SKILL_TREE_STAGES}-stage skill tree (stages 0-${MAX_SKILL_TREE_STAGES - 1}) for the class: ${input.characterClass}.

Requirements:
1. ${MAX_SKILL_TREE_STAGES} stages (0, 1, 2, 3, 4).
2. Stage 0 named "Potential" or similar, with EMPTY skills array.
3. Stages 1-${MAX_SKILL_TREE_STAGES - 1} have thematic names and 1-3 skills each.
4. Skills need name, description, and optional manaCost/staminaCost.

Output JSON.
`;

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
      if (!text) throw new Error("No text returned from AI");
      
      const parsed = JSON.parse(text);
      const validation = GenerateSkillTreeOutputSchema.safeParse(parsed);
      
      if (validation.success) {
          return validation.data as GenerateSkillTreeOutput;
      } else {
          console.warn("Zod validation failed for generateSkillTree, using fallback.", validation.error);
          throw new Error("Invalid response structure");
      }

  } catch (error: any) {
      if (error.name === 'AbortError') {
          throw error;
      }
      console.error("AI Skill Tree Error:", error);
      return createFallbackSkillTree(input.characterClass);
  }
}