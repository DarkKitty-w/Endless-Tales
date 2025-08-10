// src/ai/ai-instance.ts
import {genkit, GenerationCommonConfig} from 'genkit';
import {googleAI, GoogleAIGenerativeAI, gemini2Flash} from '@genkit-ai/googleai';

const googleAiPlugin = googleAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

// Base configuration for Genkit
export const ai = genkit({
  promptDir: './prompts',
  plugins: [googleAiPlugin],
});

/**
 * Gets a model instance with a dynamically provided API key.
 * If no key is provided, it falls back to the default instance.
 * @param userApiKey - The user-provided Google AI API key.
 * @returns A configured model reference.
 */
export function getModel(userApiKey?: string | null): GoogleAIGenerativeAI {
    if (userApiKey) {
        // Create a temporary, per-request instance of the GoogleAI plugin with the user's key
        const dynamicGoogleAI = googleAI({ apiKey: userApiKey });
        // Return a specific model from this dynamic plugin instance
        return dynamicGoogleAI.getModel('gemini-2.0-flash');
    }
    // Fallback to the default, globally configured model
    return googleAiPlugin.getModel('gemini-2.0-flash');
}
