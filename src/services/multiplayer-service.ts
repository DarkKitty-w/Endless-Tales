// src/services/multiplayer-service.ts
// Multiplayer is now handled via WebRTC (see src/hooks/use-multiplayer.ts).
// This file is kept for reference but is no longer used.

export const generateSessionId = (): string => {
  const S4 = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1).toUpperCase();
  return `${S4()}-${S4()}`;
};

// All other functions are disabled.
export async function createCoopSession(hostUid: string): Promise<string> {
  throw new Error("Multiplayer is now handled via WebRTC.");
}

export async function joinCoopSession(sessionId: string, playerUid: string): Promise<boolean> {
  throw new Error("Multiplayer is now handled via WebRTC.");
}

export function listenToSessionUpdates(
  sessionId: string,
  callback: (data: any) => void
): (() => void) {
  return () => {};
}

export async function hostStartGame(sessionId: string, hostUid: string): Promise<void> {
  throw new Error("Multiplayer is now handled via WebRTC.");
}

export async function updatePlayerActionInSession(
  sessionId: string,
  playerUid: string,
  action: string
): Promise<void> {
  throw new Error("Multiplayer is now handled via WebRTC.");
}