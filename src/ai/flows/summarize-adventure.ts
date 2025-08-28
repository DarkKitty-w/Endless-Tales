
'use server';
/**
 * @fileOverview Summarizes the key events, choices, and consequences of a player's adventure.
 *
 * - summarizeAdventure - A function that summarizes the adventure story.
 * - SummarizeAdventureInput - The input type for the summarizeAdventure function.
 * - SummarizeAdventureOutput - The return type for the summarizeAdventure function.
 */

import {ai, getModel} from '@/ai/ai-instance';
import {z} from 'genkit';

// --- Zod Schemas (Internal - Not Exported) ---
const SummarizeAdventureInputSchema = z.object({
  story: z
    .string()
    .describe('The full text of the adventure story to summarize.'),
  userApiKey: z.string().optional().nullable().describe("User's optional Google AI API key."),
});

const SummarizeAdventureOutputSchema = z.object({
  summary: z
    .string()
    .describe('A concise summary of the adventure, including key events, choices, and consequences.'),
});

// --- Exported Types (Derived from internal schemas) ---
export type SummarizeAdventureInput = z.infer<typeof SummarizeAdventureInputSchema>;
export type SummarizeAdventureOutput = z.infer<typeof SummarizeAdventureOutputSchema>;

// --- Exported Async Function ---
export async function summarizeAdventure(input: SummarizeAdventureInput): Promise<SummarizeAdventureOutput> {
  return summarizeAdventureFlow(input);
}

// --- Internal Prompt and Flow Definitions ---
const prompt = ai.definePrompt({
  name: 'summarizeAdventurePrompt',
  input: { schema: SummarizeAdventureInputSchema },
  output: { schema: SummarizeAdventureOutputSchema },
  prompt: `You are an AI assistant that summarizes adventure stories. Please provide a concise summary of the following adventure, including the key events, choices, and consequences:\n\n{{{story}}}`,
});

const summarizeAdventureFlow = ai.defineFlow(
  {
    name: 'summarizeAdventureFlow',
    inputSchema: SummarizeAdventureInputSchema,
    outputSchema: SummarizeAdventureOutputSchema,
  },
  async input => {
    const model = getModel(input.userApiKey);
    const {output} = await prompt(input, { model });
    return output!;
  }
);
