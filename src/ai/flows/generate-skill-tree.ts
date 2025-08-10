
'use server';
/**
 * @fileOverview An AI agent that generates a 4-stage skill tree for a given character class, including stage names.
 *
 * - generateSkillTree - A function that generates the skill tree.
 * - GenerateSkillTreeInput - The input type for the generateSkillTree function.
 * - GenerateSkillTreeOutput - The return type for the generateSkillTree function.
 */

import {ai, getModel} from '@/ai/ai-instance';
import {z} from 'genkit';
import type { SkillTree, SkillTreeStage, Skill } from '@/types/game-types'; // Import types from central location

// --- Zod Schemas (Internal - Not Exported) ---
// Define input schema first
const GenerateSkillTreeInputSchema = z.object({
  characterClass: z.string().describe('The character class for which to generate the skill tree (e.g., Warrior, Mage, Rogue, Scholar).'),
  userApiKey: z.string().optional().nullable().describe("User's optional Google AI API key."),
});

// Define the structure of a single skill
const SkillSchema = z.object({
    name: z.string().describe("The name of the skill."),
    description: z.string().describe("A brief description of what the skill does or represents."),
    manaCost: z.number().optional().describe("Mana cost to use the skill, if any."),
    staminaCost: z.number().optional().describe("Stamina cost to use the skill, if any."),
});

// Define the structure of a skill tree stage
const SkillTreeStageSchema = z.object({
    stage: z.number().min(0).max(4).describe("The progression stage (0-4). Stage 0 is 'Potential'."),
    stageName: z.string().describe("A thematic name for this stage (e.g., Apprentice, Adept, Master, Grandmaster). Stage 0 should be named 'Potential' or similar."),
    skills: z.array(SkillSchema).min(0).max(3).describe("A list of 0-3 skills unlocked at this stage. Stage 0 has no skills."),
});

// Define the final output schema (Skill Tree)
const GenerateSkillTreeOutputSchema = z.object({
    className: z.string().describe("The character class this skill tree belongs to."),
    stages: z.array(SkillTreeStageSchema).length(5).describe("An array containing exactly 5 skill tree stages (0-4)."),
});

// --- Exported Types (Derived from internal schemas) ---
export type GenerateSkillTreeInput = z.infer<typeof GenerateSkillTreeInputSchema>;
export type GenerateSkillTreeOutput = z.infer<typeof GenerateSkillTreeOutputSchema>;

// --- Exported Async Function ---
export async function generateSkillTree(input: GenerateSkillTreeInput): Promise<GenerateSkillTreeOutput> {
  console.log("generateSkillTree AI Flow: Initiating skill tree generation for class:", input.characterClass);
  return generateSkillTreeFlow(input);
}

// --- Internal Prompt and Flow Definitions ---
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

const createFallbackSkillTree = (className: string): GenerateSkillTreeOutput => {
    console.warn(`generateSkillTreeFlow: Creating fallback skill tree for class "${className}".`);
    // Ensure this fallback is fully valid according to GenerateSkillTreeOutputSchema
    return {
        className: className,
        stages: [
            { stage: 0, stageName: "Potential", skills: [] },
            { stage: 1, stageName: "Novice", skills: [{ name: "Basic Combat Training", description: "Improves general combat readiness."}] },
            { stage: 2, stageName: "Apprentice", skills: [{ name: "Focused Study", description: "Allows deeper understanding of class abilities."}] },
            { stage: 3, stageName: "Adept", skills: [{ name: "Power Surge", description: "Temporarily boosts effectiveness."}] },
            { stage: 4, stageName: "Master", skills: [{ name: "Ultimate Focus", description: "Unlocks true potential."}] },
        ]
    };
};

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
     console.log("generateSkillTreeFlow: Sending to prompt with input:", JSON.stringify(input, null, 2));
     let output: GenerateSkillTreeOutput | undefined;
     let attempt = 0;
     const maxAttempts = 3;
     let lastError: any = null;

     while (attempt < maxAttempts && !output) {
        attempt++;
        console.log(`generateSkillTreeFlow: AI call attempt ${attempt} for class "${input.characterClass}"...`);
        try {
            const model = getModel(input.userApiKey);
            const result = await ai.generate({
                model: model,
                prompt: generateSkillTreePrompt,
                input: input,
            });
            output = result.output;

            // Validate the structure of the output
             if (!output || !output.className || !Array.isArray(output.stages) || output.stages.length !== 5) {
                 throw new Error(`AI returned invalid skill tree structure (attempt ${attempt}). Missing className, stages, or stages length not 5. Received: ${JSON.stringify(output)}`);
             }
             for (const stage of output.stages) {
                 if (stage.stage === undefined || typeof stage.stage !== 'number' || stage.stage < 0 || stage.stage > 4) throw new Error(`AI returned invalid stage number: ${stage.stage} (attempt ${attempt}).`);
                 if (!stage.stageName || typeof stage.stageName !== 'string') throw new Error(`AI returned invalid structure for stage ${stage.stage} (missing or invalid stageName, attempt ${attempt}).`);
                 if (!Array.isArray(stage.skills)) throw new Error(`AI returned invalid structure for stage ${stage.stage} (skills is not an array, attempt ${attempt}).`);
                 if (stage.stage === 0 && stage.skills.length !== 0) throw new Error(`AI returned invalid structure for stage 0 (skills array must be empty, attempt ${attempt}). Actual skills: ${JSON.stringify(stage.skills)}`);
                 if (stage.stage > 0 && (stage.skills.length < 0 || stage.skills.length > 3)) throw new Error(`AI returned invalid skill count for stage ${stage.stage} (must be 0-3, attempt ${attempt}). Actual skills: ${JSON.stringify(stage.skills)}`);
                 
                 for(const skill of stage.skills) {
                     if (!skill.name || typeof skill.name !== 'string' || !skill.description || typeof skill.description !== 'string') throw new Error(`AI returned invalid skill definition in stage ${stage.stage} (missing/invalid name or description, attempt ${attempt}). Skill: ${JSON.stringify(skill)}`);
                     if (skill.manaCost !== undefined && typeof skill.manaCost !== 'number') throw new Error(`AI returned invalid manaCost for skill "${skill.name}" (attempt ${attempt}).`);
                     if (skill.staminaCost !== undefined && typeof skill.staminaCost !== 'number') throw new Error(`AI returned invalid staminaCost for skill "${skill.name}" (attempt ${attempt}).`);
                 }
             }
             const stage0 = output.stages.find(s => s.stage === 0);
             if (!stage0 || !stage0.stageName || (stage0.skills && stage0.skills.length !== 0) ) throw new Error(`AI failed to generate a valid Stage 0 (attempt ${attempt}). Stage 0 skills: ${JSON.stringify(stage0?.skills)}`);

             // If all validations pass, break the loop
             break;

        } catch (err: any) {
            console.error(`generateSkillTreeFlow: Skill tree generation attempt ${attempt} for class "${input.characterClass}" failed:`, err.message);
            lastError = err;
            output = undefined; // Ensure output is reset to retry
            if (attempt >= maxAttempts) {
                 console.error(`generateSkillTreeFlow: Failed to generate valid skill tree for class "${input.characterClass}" after ${maxAttempts} attempts. Last error: ${err.message}. Returning fallback.`);
                 return createFallbackSkillTree(input.characterClass);
            }
            await new Promise(resolve => setTimeout(resolve, 500 * attempt)); // Exponential backoff
        }
     }

     if (!output) {
        // This case should ideally be handled by the fallback in the loop,
        // but as a final safeguard:
        console.error(`generateSkillTreeFlow: Skill tree generation ultimately failed for class "${input.characterClass}" after all attempts and no output was defined. Returning fallback. Last error: ${lastError?.message}`);
        return createFallbackSkillTree(input.characterClass);
     }
     console.log(`generateSkillTreeFlow: Received valid skill tree from prompt for class "${input.characterClass}":`, JSON.stringify(output, null, 2).substring(0, 500) + "...");
     return output;
  }
);
