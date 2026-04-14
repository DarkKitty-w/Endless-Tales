/**
 * @fileOverview An AI agent that generates a skill tree.
 */

import { z } from 'zod';
import { getClient } from '../ai-instance';
import type { SkillTree } from '../../types/game-types';
import { MAX_SKILL_TREE_STAGES } from '../../lib/constants';
import { processAiResponse } from '../../lib/utils';

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

const cleanSkill = (skill: any) => ({
    name: skill.name || 'Unknown Skill',
    description: skill.description || '',
    manaCost: skill.manaCost ?? undefined,
    staminaCost: skill.staminaCost ?? undefined,
});

const createFallbackSkillTree = (className: string): SkillTree => ({
    className: className,
    stages: [
        { stage: 0, stageName: "Potential", skills: [] },
        { stage: 1, stageName: "Novice", skills: [cleanSkill({ name: "Basic Training", description: "Improves readiness." })] },
        { stage: 2, stageName: "Apprentice", skills: [cleanSkill({ name: "Focused Study", description: "Deeper understanding." })] },
        { stage: 3, stageName: "Adept", skills: [cleanSkill({ name: "Power Surge", description: "Boosts effectiveness." })] },
        { stage: 4, stageName: "Master", skills: [cleanSkill({ name: "Ultimate Focus", description: "True potential." })] },
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

Return ONLY a valid JSON object. No explanations, no markdown formatting.
`;

  try {
      const client = getClient(input.userApiKey);
      const response = await client.models.generateContent({
          contents: prompt,
          config: { responseMimeType: "application/json" },
          signal: input.signal,
      });

      const text = response.text;
      if (!text) throw new Error("No text returned from AI");

      const fallback = createFallbackSkillTree(input.characterClass);
      
      const normalizer = (data: any): GenerateSkillTreeOutput => {
          // If the AI returned an array of stages directly
          if (Array.isArray(data)) {
              const stages = data.slice(0, MAX_SKILL_TREE_STAGES).map((stage: any, index: number) => ({
                  stage: stage.stage ?? index,
                  stageName: stage.stageName ?? stage.name ?? `Stage ${index}`,
                  skills: Array.isArray(stage.skills) ? stage.skills.map(cleanSkill) : [],
              }));
              while (stages.length < MAX_SKILL_TREE_STAGES) {
                  stages.push(fallback.stages[stages.length]);
              }
              return { className: input.characterClass, stages };
          }

          // If the AI returned an object with numeric keys (e.g., "0", "1")
          const numericKeys = Object.keys(data).filter(k => /^\d+$/.test(k));
          if (numericKeys.length > 0) {
              const stages = numericKeys
                  .sort((a, b) => parseInt(a) - parseInt(b))
                  .slice(0, MAX_SKILL_TREE_STAGES)
                  .map(key => {
                      const stageData = data[key];
                      return {
                          stage: parseInt(key),
                          stageName: stageData.name || stageData.stageName || `Stage ${key}`,
                          skills: Array.isArray(stageData.skills) ? stageData.skills.map(cleanSkill) : [],
                      };
                  });
              while (stages.length < MAX_SKILL_TREE_STAGES) {
                  stages.push(fallback.stages[stages.length]);
              }
              return { className: input.characterClass, stages };
          }

          // If the AI returned a proper stages array
          if (Array.isArray(data.stages)) {
              const stages = data.stages.slice(0, MAX_SKILL_TREE_STAGES).map((stage: any, index: number) => ({
                  stage: stage.stage ?? index,
                  stageName: stage.stageName ?? stage.name ?? `Stage ${index}`,
                  skills: Array.isArray(stage.skills) ? stage.skills.map(cleanSkill) : [],
              }));
              while (stages.length < MAX_SKILL_TREE_STAGES) {
                  stages.push(fallback.stages[stages.length]);
              }
              return { className: data.className ?? input.characterClass, stages };
          }

          return fallback;
      };

      const result = await processAiResponse(
          text,
          GenerateSkillTreeOutputSchema,
          fallback,
          normalizer
      );
      return result;

  } catch (error: any) {
      if (error.name === 'AbortError') throw error;
      console.error("AI Skill Tree Error:", error);
      return createFallbackSkillTree(input.characterClass);
  }
}