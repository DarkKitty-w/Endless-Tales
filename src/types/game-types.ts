// src/types/game-types.ts

import type { Character } from "./character-types";
import type { InventoryItem } from "./inventory-types";
import type { AdventureSettings, StoryLogEntry, SavedAdventure, DifficultyLevel, AdventureType } from "./adventure-types";
import type { ProviderType } from "../ai/ai-router";

export type GameStatus =
  | "MainMenu"
  | "CharacterCreation"
  | "AdventureSetup"
  | "Gameplay"
  | "AdventureSummary"
  | "ViewSavedAdventures"
  | "CoopLobby"
  | "CoopGameplay";

/** A single location on the world map. */
export interface Location {
  id: string;
  name: string;
  description: string;
  type: 'town' | 'dungeon' | 'wilderness' | 'landmark' | 'unknown';
  discovered: boolean;
  x: number; // relative position for rendering (0-100)
  y: number;
  connectedLocationIds: string[]; // IDs of reachable locations
}

/** The world map graph. */
export interface WorldMap {
  locations: Location[];
  currentLocationId: string | null;
}

/** Represents the overall state of the game application. */
export interface GameState {
  status: GameStatus;
  character: Character | null;
  sessionId: string | null;
  players: string[];
  currentPlayerUid: string | null;
  isHost: boolean;

  adventureSettings: AdventureSettings;
  currentNarration: StoryLogEntry | null;
  storyLog: StoryLogEntry[];
  adventureSummary: string | null;
  currentGameStateString: string;
  inventory: InventoryItem[];
  savedAdventures: SavedAdventure[];
  currentAdventureId: string | null;
  isGeneratingSkillTree: boolean;
  turnCount: number;
  selectedThemeId: string;
  isDarkMode: boolean;
  userGoogleAiApiKey: string | null;
  worldMap: WorldMap; // new field

  // AI Provider settings
  aiProvider: ProviderType;
  providerApiKeys: Partial<Record<ProviderType, string>>;
}

/** Structured context for AI prompts, replacing regex-based string parsing. */
export interface GameStateContext {
  turn: number;
  character: { /* ... unchanged ... */ } | null;
  inventory: Array<{ /* ... unchanged ... */ }>;
  adventureSettings: { /* ... unchanged ... */ };
  previousNarration?: string;
  storyLogLength: number;
  worldMap?: WorldMap; // include in AI context
}

// Re-export frequently used sub-types
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

export type { AdventureSettings, StoryLogEntry, SavedAdventure, DifficultyLevel, AdventureType, FirestoreCoopSession } from "./adventure-types";