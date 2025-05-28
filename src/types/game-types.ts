// src/types/game-types.ts

import type { Character } from "./character-types";
import type { InventoryItem } from "./inventory-types";
import type { AdventureSettings, StoryLogEntry, SavedAdventure, DifficultyLevel, AdventureType } from "./adventure-types";

// Keep general game status type here or move to its own file if it grows
export type GameStatus =
  | "MainMenu"
  | "CharacterCreation"
  | "AdventureSetup"
  | "Gameplay"
  | "AdventureSummary"
  | "ViewSavedAdventures"
  | "CoopLobby" // New status for co-op game setup/joining
  | "CoopGameplay"; // New status for active co-op gameplay


/** Represents the overall state of the game application. */
export interface GameState {
  status: GameStatus;
  character: Character | null; // For single-player or host in co-op
  // Multiplayer specific state
  sessionId: string | null; // ID of the current co-op game session
  players: string[]; // Array of player UIDs in the current session
  currentPlayerUid: string | null; // UID of the current authenticated user
  isHost: boolean; // Is the current player the host of the co-op game?

  adventureSettings: AdventureSettings;
  currentNarration: StoryLogEntry | null;
  storyLog: StoryLogEntry[];
  adventureSummary: string | null;
  currentGameStateString: string;
  inventory: InventoryItem[];
  savedAdventures: SavedAdventure[]; // For single-player saves
  currentAdventureId: string | null; // Could be session ID for co-op or local adventure ID
  isGeneratingSkillTree: boolean;
  turnCount: number;
  // Theme state
  selectedThemeId: string;
  isDarkMode: boolean;
  // User API Key
  userGoogleAiApiKey: string | null;
}

// Re-export frequently used sub-types for convenience in other files if needed
export type {
    Character,
    CharacterStats,
    Skill,
    SkillTree,
    SkillTreeStage,
    Reputation,
    NpcRelationships,
    ReputationChange,
    NpcRelationshipChange,
} from "./character-types";

export type { InventoryItem, ItemQuality } from "./inventory-types";

export type { AdventureSettings, StoryLogEntry, SavedAdventure, DifficultyLevel, AdventureType } from "./adventure-types";
