// src/ai/flows/generate-skill-tree.ts
'use server';
/**
 * @fileOverview An AI agent that generates a 4-stage skill tree for a given character class, including stage names.
 *
 * - generateSkillTree - A function that generates the skill tree.
 * - GenerateSkillTreeInput - The input type for the generateSkillTree function.
 * - GenerateSkillTreeOutput - The return type for the generateSkillTree function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import type { SkillTree, SkillTreeStage, Skill } from '@/context/GameContext'; // Import types

// Define Zod schemas for the skill tree structure
const SkillSchema = z.object({
    name: z.string().describe("The name of the skill."),
    description: z.string().describe("A brief description of what the skill does or represents."),
    manaCost: z.number().optional().describe("Mana cost to use the skill, if any."), // Add costs
    staminaCost: z.number().optional().describe("Stamina cost to use the skill, if any."), // Add costs
});

const SkillTreeStageSchema = z.object({
    stage: z.number().min(0).max(4).describe("The progression stage (0-4). Stage 0 is 'Potential'."), // Allow stage 0
    stageName: z.string().describe("A thematic name for this stage (e.g., Apprentice, Adept, Master, Grandmaster). Stage 0 should be named 'Potential' or similar."), // Added stage name
    skills: z.array(SkillSchema).min(0).max(3).describe("A list of 0-3 skills unlocked at this stage. Stage 0 has no skills."), // Define min/max skills per stage, 0 for stage 0
});

const SkillTreeSchema = z.object({
    className: z.string().describe("The character class this skill tree belongs to."),
    stages: z.array(SkillTreeStageSchema).length(5).describe("An array containing exactly 5 skill tree stages (0-4)."), // Ensure 5 stages
});

// Define input/output schemas for the flow
const GenerateSkillTreeInputSchema = z.object({
  characterClass: z.string().describe('The character class for which to generate the skill tree (e.g., Warrior, Mage, Rogue, Scholar).'),
  // Optional: Add character traits/knowledge for more tailored trees later
  // characterTraits: z.array(z.string()).optional().describe("Character's defining traits."),
  // characterKnowledge: z.array(z.string()).optional().describe("Character's areas of expertise."),
});
export type GenerateSkillTreeInput = z.infer<typeof GenerateSkillTreeInputSchema>;

// Output schema uses the defined SkillTreeSchema
const GenerateSkillTreeOutputSchema = SkillTreeSchema;
export type GenerateSkillTreeOutput = z.infer<typeof GenerateSkillTreeOutputSchema>;

// Exported function to call the flow
export async function generateSkillTree(input: GenerateSkillTreeInput): Promise<GenerateSkillTreeOutput> {
  console.log("Initiating skill tree generation for class:", input.characterClass);
  return generateSkillTreeFlow(input);
}

// AI Prompt Definition
const generateSkillTreePrompt = ai.definePrompt({
  name: 'generateSkillTreePrompt',
  input: { schema: GenerateSkillTreeInputSchema },
  output: { schema: GenerateSkillTreeOutputSchema },
  prompt: `You are a creative game designer crafting skill trees for the text adventure "Endless Tales". Generate a unique and thematic 5-stage skill tree (stages 0 through 4) for the following character class:

**Character Class:** {{{characterClass}}}

**Requirements:**
1.  **Five Stages (0-4):** The skill tree MUST have exactly five distinct stages of progression (stage 0, 1, 2, 3, 4).
2.  **Thematic Stage Names:**
    *   Stage 0 MUST have a 'stageName' like "Potential", "Initiate", "Neophyte", or similar, representing the starting point before specialization.
    *   Stages 1-4 MUST have increasingly impressive and thematically **evocative** 'stageName's relevant to the class. Avoid generic names like "Stage 1".
    *   **Good Examples:**
        *   Warrior: Squire -> Knight -> Champion -> Warlord
        *   Mage: Apprentice -> Conjurer -> Archmage -> Harbinger
        *   Rogue: Pickpocket -> Cutpurse -> Assassin -> Shadow Master
        *   Necromancer: Acolyte -> Ghoul Caller -> Lord of Bones -> Plague Sovereign
        *   Priest: Acolyte -> Cleric -> High Priest -> Saint
        *   Tinkerer: Apprentice -> Artisan -> Inventor -> Visionary
3.  **Skills per Stage:**
    *   Stage 0 MUST have an empty 'skills' array \`[]\`.
    *   Stages 1-4 MUST unlock between 1 and 3 thematically appropriate skills each. More powerful or defining skills should appear in later stages.
4.  **Skill Definition:** Each skill needs:
    *   A clear 'name'.
    *   A concise 'description' explaining its effect or purpose (e.g., combat advantage, new ability, knowledge unlock, social influence).
    *   Optionally include 'manaCost' or 'staminaCost' if the skill logically requires resources (use small numbers like 5, 10, 15, 20). Don't add costs to passive skills.
5.  **Class Theme:** The stage names, skills, and stage progression should strongly reflect the identity and typical abilities associated with the '{{{characterClass}}}' class archetype. Be creative and evocative.
6.  **Output Format:** Respond ONLY with the JSON object matching the SkillTree schema, containing the 'className' and the 'stages' array with 5 stages (0-4), each having 'stage', 'stageName', and the appropriate skills (with 'name', 'description', optional 'manaCost'/'staminaCost'). Ensure the JSON is valid.

**Generate the Skill Tree:**
`,
});

// Genkit Flow Definition
const generateSkillTreeFlow = ai.defineFlow<
  typeof GenerateSkillTreeInputSchema,
  typeof GenerateSkillTreeOutputSchema
>(
  {
    name: 'generateSkillTreeFlow',
    inputSchema: GenerateSkillTreeInputSchema,
    outputSchema: GenerateSkillTreeOutputSchema,
  },
  async (input) => {
     console.log("Sending to generateSkillTreePrompt:", JSON.stringify(input, null, 2));
     let output: GenerateSkillTreeOutput | undefined;
     let errorOccurred = false;
     let attempt = 0;
     const maxAttempts = 3;

     while (attempt < maxAttempts && !output) {
        attempt++;
        try {
            const result = await generateSkillTreePrompt(input);
            output = result.output;

             // Basic validation of the output structure
             if (!output || !output.className || !Array.isArray(output.stages) || output.stages.length !== 5) { // Expect 5 stages (0-4)
                 throw new Error(`AI returned invalid skill tree structure (missing class, stages array, or incorrect stage count - expected 5). Got: ${JSON.stringify(output).substring(0,100)}`);
             }
             for (const stage of output.stages) {
                 if (stage.stage === undefined || stage.stage < 0 || stage.stage > 4) {
                     throw new Error(`AI returned invalid stage number: ${stage.stage}. Must be 0-4.`);
                 }
                 if (!stage.stageName) {
                     throw new Error(`AI returned invalid structure for stage ${stage.stage} (missing stageName).`);
                 }
                 if (stage.stage === 0 && (!stage.skills || stage.skills.length !== 0)) {
                     throw new Error(`AI returned invalid structure for stage 0 (skills array must be empty). Got: ${stage.skills?.length}`);
                 }
                 if (stage.stage > 0 && (!stage.skills || stage.skills.length < 1 || stage.skills.length > 3)) {
                    throw new Error(`AI returned invalid skill count for stage ${stage.stage} (must be 1-3). Got: ${stage.skills?.length}`);
                 }
                 // Validate skills within stages > 0
                 if (stage.stage > 0 && stage.skills) {
                    for(const skill of stage.skills) {
                        if (!skill.name || !skill.description) {
                             throw new Error(`AI returned invalid skill definition in stage ${stage.stage} (missing name or description).`);
                        }
                        // Optional cost validation (check if number if present)
                        if (skill.manaCost !== undefined && typeof skill.manaCost !== 'number') {
                            throw new Error(`AI returned invalid manaCost type for skill "${skill.name}" in stage ${stage.stage}.`);
                        }
                        if (skill.staminaCost !== undefined && typeof skill.staminaCost !== 'number') {
                             throw new Error(`AI returned invalid staminaCost type for skill "${skill.name}" in stage ${stage.stage}.`);
                        }
                    }
                 }
             }
             // Ensure Stage 0 exists and has a proper name
             const stage0 = output.stages.find(s => s.stage === 0);
             if (!stage0 || !stage0.stageName || stage0.skills.length !== 0) {
                 throw new Error("AI failed to generate a valid Stage 0 (Potential/Initiate) with an empty skill list.");
             }


        } catch (err: any) {
            console.error(`Skill tree generation attempt ${attempt} failed:`, err);
            errorOccurred = true;
            if (attempt >= maxAttempts) {
                 // If all attempts fail, throw a more specific error or return a default/error state
                 throw new Error(`Failed to generate valid skill tree for class "${input.characterClass}" after ${maxAttempts} attempts. Last error: ${err.message}`);
            }
            // Optional: Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 500 * attempt));
        }
     }


     if (!output) {
        // Should not happen if the loop completes and throws, but as a fallback
        throw new Error(`Skill tree generation failed for class "${input.characterClass}".`);
     }

     console.log("Received valid skill tree from generateSkillTreePrompt:", JSON.stringify(output, null, 2));
     return output; // Return the validated output
  }
);
