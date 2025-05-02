'use server';
/**
 * @fileOverview An AI agent that generates a 4-stage skill tree for a given character class.
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
});

const SkillTreeStageSchema = z.object({
    stage: z.number().min(1).max(4).describe("The progression stage (1-4)."),
    skills: z.array(SkillSchema).min(1).max(3).describe("A list of 1-3 skills unlocked at this stage."), // Define min/max skills per stage
});

const SkillTreeSchema = z.object({
    className: z.string().describe("The character class this skill tree belongs to."),
    stages: z.array(SkillTreeStageSchema).length(4).describe("An array containing exactly 4 skill tree stages."), // Ensure 4 stages
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
  prompt: `You are a creative game designer crafting skill trees for the text adventure "Endless Tales". Generate a unique and thematic 4-stage skill tree for the following character class:

**Character Class:** {{{characterClass}}}

**Requirements:**
1.  **Four Stages:** The skill tree MUST have exactly four distinct stages of progression (stage 1, 2, 3, 4).
2.  **Skills per Stage:** Each stage MUST unlock between 1 and 3 thematically appropriate skills. More powerful or defining skills should appear in later stages.
3.  **Skill Definition:** Each skill needs a clear 'name' and a concise 'description' explaining its effect or purpose within the game context (e.g., combat advantage, new ability, knowledge unlock, social influence).
4.  **Class Theme:** The skills and stage progression should strongly reflect the identity and typical abilities associated with the '{{{characterClass}}}' class.
    *   Example (Warrior): Stage 1 might have "Basic Parry", Stage 2 "Power Attack", Stage 3 "Shield Bash", Stage 4 "Battle Cry".
    *   Example (Mage): Stage 1 "Mana Bolt", Stage 2 "Arcane Ward", Stage 3 "Fireball", Stage 4 "Summon Familiar".
    *   Example (Rogue): Stage 1 "Sneak", Stage 2 "Lockpicking", Stage 3 "Backstab", Stage 4 "Shadow Cloak".
5.  **Output Format:** Respond ONLY with the JSON object matching the SkillTree schema, containing the 'className' and the 'stages' array with 4 stages, each having 1-3 skills with 'name' and 'description'. Ensure the JSON is valid.

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
             if (!output || !output.className || !Array.isArray(output.stages) || output.stages.length !== 4) {
                 throw new Error("AI returned invalid skill tree structure (missing class, stages array, or incorrect stage count).");
             }
             for (const stage of output.stages) {
                if (!stage.skills || stage.skills.length < 1 || stage.skills.length > 3) {
                    throw new Error(`AI returned invalid skill count for stage ${stage.stage} (must be 1-3).`);
                }
                for(const skill of stage.skills) {
                    if (!skill.name || !skill.description) {
                         throw new Error(`AI returned invalid skill definition in stage ${stage.stage} (missing name or description).`);
                    }
                }
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
