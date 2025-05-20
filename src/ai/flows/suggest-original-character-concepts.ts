
'use server';
/**
 * @fileOverview An AI agent that suggests original character concepts for a given universe.
 *
 * - suggestOriginalCharacterConcepts - A function that suggests concepts.
 * - SuggestOriginalCharacterConceptsInput - The input type.
 * - SuggestOriginalCharacterConceptsOutput - The return type.
 */

import {ai}from '@/ai/ai-instance';
import {z}from 'genkit';

const SuggestOriginalCharacterConceptsInputSchema = z.object({
  universeName: z.string().describe('The name of the fictional universe (e.g., Star Wars, Harry Potter).'),
});

const SuggestOriginalCharacterConceptsOutputSchema = z.object({
  suggestedConcepts: z.array(z.string()).max(5).describe('An array of 3-5 suggested original character concepts or names suitable for the universe.'),
});

export type SuggestOriginalCharacterConceptsInput = z.infer<typeof SuggestOriginalCharacterConceptsInputSchema>;
export type SuggestOriginalCharacterConceptsOutput = z.infer<typeof SuggestOriginalCharacterConceptsOutputSchema>;

export async function suggestOriginalCharacterConcepts(input: SuggestOriginalCharacterConceptsInput): Promise<SuggestOriginalCharacterConceptsOutput> {
  return suggestOriginalCharacterConceptsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestOriginalCharacterConceptsPrompt',
  input: { schema: SuggestOriginalCharacterConceptsInputSchema },
  output: { schema: SuggestOriginalCharacterConceptsOutputSchema },
  prompt: `You are a creative assistant. For the fictional universe "{{{universeName}}}", please suggest 3 to 5 creative and thematic concepts or names for an *original* player character that would fit well within this universe.
The suggestions should be brief (a short phrase or a name with a title).
Examples for Star Wars: "A Twi'lek smuggler with a hidden past", "Jax Pavan, Jedi Archivist", "A former Imperial officer seeking redemption".
Examples for Harry Potter: "A Ravenclaw student specializing in ancient runes", "Silas Blackwood, a quiet Hufflepuff with a knack for magical creatures", "An exchange student from Beauxbatons".
Return *only* an array of strings with the concepts/names.`,
});

const suggestOriginalCharacterConceptsFlow = ai.defineFlow(
  {
    name: 'suggestOriginalCharacterConceptsFlow',
    inputSchema: SuggestOriginalCharacterConceptsInputSchema,
    outputSchema: SuggestOriginalCharacterConceptsOutputSchema,
  },
  async (input) => {
    console.log("suggestOriginalCharacterConceptsFlow: Input received:", input);
    const {output} = await prompt(input);
     if (!output || !Array.isArray(output.suggestedConcepts) || output.suggestedConcepts.length === 0) {
      console.warn("suggestOriginalCharacterConceptsFlow: AI did not return valid suggestions. Returning fallback.");
      let fallbackConcept = "A new arrival";
      if (input.universeName?.toLowerCase().includes("star wars")) fallbackConcept = "A hopeful Padawan";
      else if (input.universeName?.toLowerCase().includes("harry potter")) fallbackConcept = "A transfer student to Hogwarts";
      else if (input.universeName?.toLowerCase().includes("lord of the rings")) fallbackConcept = "An adventurous Hobbit";
      return { suggestedConcepts: [fallbackConcept, "Someone seeking their fortune", "A mysterious wanderer"] };
    }
    console.log("suggestOriginalCharacterConceptsFlow: Output generated:", output);
    return output;
  }
);
