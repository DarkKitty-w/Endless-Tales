// src/context/schemas/save-schema.ts
import { z } from 'zod';
import type { SavedAdventure } from '../../types/adventure-types';

// Zod schema for validating SavedAdventure objects
export const SavedAdventureSchema = z.object({
  id: z.string().min(1, 'id is required'),
  version: z.number().min(0, 'version must be a non-negative number'),
  saveTimestamp: z.number().min(0, 'saveTimestamp must be a non-negative number'),
  characterName: z.string().min(1, 'characterName is required'),
  character: z.object({
    name: z.string(),
    class: z.string(),
    level: z.number(),
    // Add more character validation as needed - using passthrough for flexibility
  }).passthrough(),
  adventureSettings: z.object({
    adventureType: z.union([z.string(), z.null()]),
    permanentDeath: z.boolean(),
    difficulty: z.string(),
  }).passthrough(),
  storyLog: z.array(z.object({
    narration: z.string(),
    updatedGameState: z.string(),
    timestamp: z.number(),
  }).passthrough()).min(0),
  currentGameStateString: z.string().min(1, 'currentGameStateString is required'),
  inventory: z.array(z.object({
    name: z.string(),
  }).passthrough()).min(0),
  statusBeforeSave: z.union([z.string(), z.null()]).optional(),
  adventureSummary: z.union([z.string(), z.null()]).optional(),
  turnCount: z.number().min(0).optional(),
  worldMap: z.object({
    locations: z.array(z.object({
      id: z.string(),
      name: z.string(),
      discovered: z.boolean(),
    }).passthrough()),
    currentLocationId: z.union([z.string(), z.null()]),
  }).passthrough().optional(),
});

// Type inference from schema
export type ValidatedSavedAdventure = z.infer<typeof SavedAdventureSchema>;

// Helper function to validate a saved adventure
export function validateSavedAdventure(data: unknown): { success: true; data: SavedAdventure } | { success: false; error: string } {
  const result = SavedAdventureSchema.safeParse(data);  
  if (result.success) {
    return { success: true, data: result.data as SavedAdventure };
  } else {
    const errorMessage = result.error.errors
      .map((err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`)
      .join(', ');
    return { success: false, error: errorMessage };
  }
}
