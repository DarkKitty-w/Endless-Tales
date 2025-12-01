// src/ai/ai-instance.ts
import { GoogleGenAI } from "@google/genai";

// Safely access process.env
const safeProcess = typeof process !== 'undefined' ? process : { env: {} as Record<string, string | undefined> };

// Use a dummy key if not present to prevent initialization crash. 
// Real requests will fail if a valid key isn't provided via getClient later or if this env var is invalid.
const apiKey = safeProcess.env.API_KEY || safeProcess.env.GOOGLE_GENAI_API_KEY || 'DUMMY_KEY_FOR_INIT';

// Initialize the default client
export const aiClient = new GoogleGenAI({ apiKey });

/**
 * Gets a GenAI client instance. 
 * If a user API key is provided, returns a new instance using that key.
 * Otherwise returns the default instance using the environment key.
 * @param userApiKey - The user-provided Google AI API key.
 * @returns A GoogleGenAI client instance.
 */
export function getClient(userApiKey?: string | null): GoogleGenAI {
    if (userApiKey) {
        return new GoogleGenAI({ apiKey: userApiKey });
    }
    return aiClient;
}