// src/services/multiplayer-service.ts
// Fully mocked to avoid importing firebase/firestore which causes crashes with dummy db object.

import type { FirestoreCoopSession } from "../types/adventure-types";

// Dummy type for Unsubscribe
type Unsubscribe = () => void;

/**
 * Generates a short, random session ID.
 * @returns A string like "ABC-XYZ"
 */
export const generateSessionId = (): string => {
  const S4 = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1).toUpperCase();
  return `${S4()}-${S4()}`;
};

/**
 * Creates a new co-op game session (MOCKED).
 */
export async function createCoopSession(hostUid: string): Promise<string> {
  console.warn("Multiplayer features are currently disabled.");
  throw new Error("Multiplayer is currently disabled.");
}

/**
 * Allows a player to join an existing co-op session (MOCKED).
 */
export async function joinCoopSession(sessionId: string, playerUid: string): Promise<boolean> {
  console.warn("Multiplayer features are currently disabled.");
  throw new Error("Multiplayer is currently disabled.");
}

/**
 * Sets up a real-time listener for updates (MOCKED).
 */
export function listenToSessionUpdates(
  sessionId: string,
  callback: (data: FirestoreCoopSession | null) => void
): Unsubscribe {
  console.warn("Multiplayer features are currently disabled.");
  // Immediately return a no-op unsubscribe function
  return () => {};
}

/**
 * Allows the host to start the game (MOCKED).
 */
export async function hostStartGame(sessionId: string, hostUid: string): Promise<void> {
    console.warn("Multiplayer features are currently disabled.");
    throw new Error("Multiplayer is currently disabled.");
}

/**
 * Placeholder for updating the player's action (MOCKED).
 */
export async function updatePlayerActionInSession(
  sessionId: string,
  playerUid: string,
  action: string
): Promise<void> {
  console.warn("Multiplayer features are currently disabled.");
}