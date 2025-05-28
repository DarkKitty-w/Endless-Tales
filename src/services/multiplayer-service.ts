
// src/services/multiplayer-service.ts
"use server"; // Mark as server component if it contains server-only logic, or remove if client-side only

import { db, auth } from "@/lib/firebase"; // Assuming auth might be needed for UID later
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  onSnapshot,
  type Unsubscribe,
  collection,
  Timestamp,
} from "firebase/firestore";
import type { FirestoreCoopSession, AdventureSettings, StoryLogEntry } from "@/types/adventure-types";
import { initialAdventureSettings } from "@/context/game-initial-state"; // For default settings

/**
 * Generates a short, random session ID.
 * @returns A string like "ABC-XYZ"
 */
export const generateSessionId = (): string => {
  const S4 = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1).toUpperCase();
  return `${S4()}-${S4()}`;
};

/**
 * Creates a new co-op game session in Firestore.
 * @param hostUid - The Firebase UID of the player creating the session (the host).
 * @returns The ID of the newly created session.
 * @throws If there's an error writing to Firestore.
 */
export async function createCoopSession(hostUid: string): Promise<string> {
  if (!hostUid) {
    throw new Error("Host UID is required to create a co-op session.");
  }

  const newSessionId = generateSessionId();
  const sessionRef = doc(db, "sessions", newSessionId);

  const initialSessionData: FirestoreCoopSession = {
    sessionId: newSessionId,
    hostUid: hostUid,
    players: [hostUid], // Host is the first player
    status: "lobby",
    createdAt: Timestamp.now().toMillis(), // Use Firestore Timestamp then convert
    currentTurnUid: hostUid, // Host starts
    turnCount: 0,
    adventureSettings: { // Basic default co-op settings
      ...initialAdventureSettings,
      adventureType: "Coop",
      difficulty: "Normal", // Default difficulty for co-op
      permanentDeath: false, // Default to respawn for co-op
    },
    storyLog: [{
        narration: `Co-op session ${newSessionId} created by ${hostUid}. Waiting for players...`,
        updatedGameState: "Lobby created.",
        timestamp: Timestamp.now().toMillis()
    }],
    currentGameStateString: "Lobby created. Waiting for players...",
  };

  try {
    await setDoc(sessionRef, initialSessionData);
    console.log(`MultiplayerService: Co-op session ${newSessionId} created successfully.`);
    return newSessionId;
  } catch (error) {
    console.error("MultiplayerService: Error creating co-op session:", error);
    throw error; // Re-throw to be handled by the caller
  }
}

/**
 * Allows a player to join an existing co-op session.
 * @param sessionId - The ID of the session to join.
 * @param playerUid - The Firebase UID of the player joining.
 * @returns True if successfully joined, false otherwise.
 * @throws If the session doesn't exist, isn't in lobby, or there's a Firestore error.
 */
export async function joinCoopSession(sessionId: string, playerUid: string): Promise<boolean> {
  if (!sessionId || !playerUid) {
    throw new Error("Session ID and Player UID are required to join a session.");
  }

  const sessionRef = doc(db, "sessions", sessionId);
  try {
    const sessionSnap = await getDoc(sessionRef);
    if (!sessionSnap.exists()) {
      throw new Error(`Session ${sessionId} not found.`);
    }

    const sessionData = sessionSnap.data() as FirestoreCoopSession;
    if (sessionData.status !== "lobby") {
      throw new Error(`Session ${sessionId} is not in lobby status (current: ${sessionData.status}). Cannot join.`);
    }
    if (sessionData.players.includes(playerUid)) {
        console.log(`MultiplayerService: Player ${playerUid} already in session ${sessionId}.`);
        return true; // Already joined
    }
    if (sessionData.players.length >= 4) { // Example: max 4 players
        throw new Error(`Session ${sessionId} is full.`);
    }

    await updateDoc(sessionRef, {
      players: arrayUnion(playerUid),
    });
    console.log(`MultiplayerService: Player ${playerUid} successfully joined session ${sessionId}.`);
    return true;
  } catch (error) {
    console.error(`MultiplayerService: Error joining co-op session ${sessionId}:`, error);
    throw error;
  }
}

/**
 * Sets up a real-time listener for updates to a co-op session.
 * @param sessionId - The ID of the session to listen to.
 * @param callback - Function to call with the session data when it updates.
 * @returns An unsubscribe function for the listener.
 */
export function listenToSessionUpdates(
  sessionId: string,
  callback: (data: FirestoreCoopSession | null) => void
): Unsubscribe {
  const sessionRef = doc(db, "sessions", sessionId);
  const unsubscribe = onSnapshot(
    sessionRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data() as FirestoreCoopSession);
      } else {
        console.warn(`MultiplayerService: Session ${sessionId} not found or deleted.`);
        callback(null); // Session doesn't exist or was deleted
      }
    },
    (error) => {
      console.error(`MultiplayerService: Error listening to session ${sessionId}:`, error);
      callback(null); // Propagate error indication
    }
  );
  return unsubscribe;
}


/**
 * Allows the host to start the game, changing its status.
 * @param sessionId - The ID of the session.
 * @param hostUid - The UID of the host attempting to start.
 */
export async function hostStartGame(sessionId: string, hostUid: string): Promise<void> {
    const sessionRef = doc(db, "sessions", sessionId);
    const sessionSnap = await getDoc(sessionRef);

    if (!sessionSnap.exists()) throw new Error("Session not found.");
    const sessionData = sessionSnap.data() as FirestoreCoopSession;
    if (sessionData.hostUid !== hostUid) throw new Error("Only the host can start the game.");
    if (sessionData.status !== 'lobby') throw new Error("Game is not in lobby state.");

    const startGameLog: StoryLogEntry = {
        narration: `The adventure begins! Host ${hostUid} has started the game.`,
        updatedGameState: "Game started by host.",
        timestamp: Timestamp.now().toMillis()
    };

    await updateDoc(sessionRef, {
        status: 'playing',
        storyLog: arrayUnion(startGameLog), // Add to existing log
        currentGameStateString: `Game started. Current turn: ${sessionData.currentTurnUid || sessionData.hostUid}.`,
        turnCount: sessionData.turnCount !== undefined ? sessionData.turnCount + 1 : 1,
    });
    console.log(`MultiplayerService: Host ${hostUid} started game session ${sessionId}.`);
}


/**
 * Placeholder for updating the player's action in the session.
 * This would typically trigger a Cloud Function.
 */
export async function updatePlayerActionInSession(
  sessionId: string,
  playerUid: string,
  action: string
): Promise<void> {
  console.log(
    `MultiplayerService (Placeholder): Player ${playerUid} in session ${sessionId} took action: ${action}. This would write to Firestore and trigger a Cloud Function.`
  );
  // In a full implementation, you'd write to a specific field, e.g.:
  // const sessionRef = doc(db, "sessions", sessionId);
  // await updateDoc(sessionRef, {
  //   lastActionBy: playerUid,
  //   lastActionText: action,
  //   lastActionTimestamp: serverTimestamp(), // To trigger Cloud Function
  // });
}
