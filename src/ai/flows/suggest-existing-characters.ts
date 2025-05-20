
'use server';
/**
 * @fileOverview An AI agent that suggests existing character names for a given universe.
 *
 * - suggestExistingCharacters - A function that suggests character names.
 * - SuggestExistingCharactersInput - The input type.
 * - SuggestExistingCharactersOutput - The return type.
 */

import {ai}from '@/ai/ai-instance';
import {z}from 'genkit';

const SuggestExistingCharactersInputSchema = z.object({
  universeName: z.string().describe('The name of the fictional universe (e.g., Star Wars, Harry Potter).'),
});

const SuggestExistingCharactersOutputSchema = z.object({
  suggestedNames: z.array(z.string()).min(1).max(5).describe('An array of 1-5 suggested existing character names from the universe.'),
});

export type SuggestExistingCharactersInput = z.infer<typeof SuggestExistingCharactersInputSchema>;
export type SuggestExistingCharactersOutput = z.infer<typeof SuggestExistingCharactersOutputSchema>;

export async function suggestExistingCharacters(input: SuggestExistingCharactersInput): Promise<SuggestExistingCharactersOutput> {
  return suggestExistingCharactersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestExistingCharactersPrompt',
  input: { schema: SuggestExistingCharactersInputSchema },
  output: { schema: SuggestExistingCharactersOutputSchema },
  prompt: `You are a creative assistant specializing in fictional universes. For the universe "{{{universeName}}}", please suggest 3 to 5 *different* and well-known existing character names.
Include a mix of protagonists, antagonists (if they could plausibly be player characters in some context), and important supporting characters.
Prioritize characters that a player might realistically want to embody in an adventure.
Return *only* an array of strings with the names. Example for Harry Potter: ["Harry Potter", "Hermione Granger", "Ron Weasley", "Draco Malfoy", "Luna Lovegood"]`,
});

const suggestExistingCharactersFlow = ai.defineFlow(
  {
    name: 'suggestExistingCharactersFlow',
    inputSchema: SuggestExistingCharactersInputSchema,
    outputSchema: SuggestExistingCharactersOutputSchema,
  },
  async (input) => {
    console.log("suggestExistingCharactersFlow: Input received:", input);
    let output: SuggestExistingCharactersOutput | undefined;
    try {
        const result = await prompt(input);
        output = result.output;
    } catch (e) {
        console.error("suggestExistingCharactersFlow: Error calling prompt:", e);
        output = undefined;
    }

    if (!output || !Array.isArray(output.suggestedNames) || output.suggestedNames.length === 0) {
      console.warn("suggestExistingCharactersFlow: AI did not return valid suggestions. Returning fallback.");
      // Fallback in case AI fails
      let fallbackName = "An Iconic Hero";
      if (input.universeName?.toLowerCase().includes("star wars")) fallbackName = "Luke Skywalker";
      else if (input.universeName?.toLowerCase().includes("harry potter")) fallbackName = "Harry Potter";
      else if (input.universeName?.toLowerCase().includes("lord of the rings")) fallbackName = "Frodo Baggins";
      return { suggestedNames: [fallbackName, "A Mysterious Stranger", "The Chosen One"] };
    }
    console.log("suggestExistingCharactersFlow: Output generated:", output);
    return output;
  }
);

