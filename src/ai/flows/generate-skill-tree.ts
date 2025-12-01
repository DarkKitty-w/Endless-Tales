/**
 * @fileOverview An AI agent that generates a skill tree.
 */

import { getClient } from '../ai-instance';
import { Type, Schema } from "@google/genai";
import type { SkillTree } from '../../types/game-types'; 

export interface GenerateSkillTreeInput {
  characterClass: string;
  userApiKey?: string | null;
}

export type GenerateSkillTreeOutput = SkillTree;

const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        className: { type: Type.STRING },
        stages: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    stage: { type: Type.NUMBER },
                    stageName: { type: Type.STRING },
                    skills: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                description: { type: Type.STRING },
                                manaCost: { type: Type.NUMBER, nullable: true },
                                staminaCost: { type: Type.NUMBER, nullable: true }
                            },
                            required: ["name", "description"]
                        }
                    }
                },
                required: ["stage", "stageName", "skills"]
            }
        }
    },
    required: ["className", "stages"]
};

const createFallbackSkillTree = (className: string): SkillTree => ({
    className: className,
    stages: [
        { stage: 0, stageName: "Potential", skills: [] },
        { stage: 1, stageName: "Novice", skills: [{ name: "Basic Training", description: "Improves readiness."}] },
        { stage: 2, stageName: "Apprentice", skills: [{ name: "Focused Study", description: "Deeper understanding."}] },
        { stage: 3, stageName: "Adept", skills: [{ name: "Power Surge", description: "Boosts effectiveness."}] },
        { stage: 4, stageName: "Master", skills: [{ name: "Ultimate Focus", description: "True potential."}] },
    ]
});

export async function generateSkillTree(input: GenerateSkillTreeInput): Promise<GenerateSkillTreeOutput> {
  const prompt = `
You are a game designer. Generate a 5-stage skill tree (stages 0-4) for the class: ${input.characterClass}.

Requirements:
1. 5 stages (0, 1, 2, 3, 4).
2. Stage 0 named "Potential" or similar, with EMPTY skills array.
3. Stages 1-4 have thematic names and 1-3 skills each.
4. Skills need name, description, and optional manaCost/staminaCost.

Output JSON.
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
      const output = JSON.parse(text) as GenerateSkillTreeOutput;
      
      // Basic validation
      if (!output.stages || output.stages.length !== 5) throw new Error("Invalid stage count");
      
      return output;

  } catch (error) {
      console.error("AI Skill Tree Error:", error);
      return createFallbackSkillTree(input.characterClass);
  }
}