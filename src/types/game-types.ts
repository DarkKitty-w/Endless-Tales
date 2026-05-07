// src/types/game-types.ts

import type { Character } from "./character-types";
import type { InventoryItem, ItemQuality } from "./inventory-types";
import type { AdventureSettings, StoryLogEntry, SavedAdventure, DifficultyLevel, AdventureType } from "./adventure-types";
import type { ProviderType } from "../ai/ai-router";
import type { ConnectionStatus, PendingInteraction, PlayerSummary } from "./multiplayer-types";

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
  x: number;
  y: number;
  connectedLocationIds: string[];
}

/** The world map graph. */
export interface WorldMap {
  locations: Location[];
  currentLocationId: string | null;
}

/** Represents the overall state of the game application. */
export interface GameState {
  version: number; // <-- ADDED for schema migration
  status: GameStatus;
  character: Character | null;
  sessionId: string | null;
  players: string[];
  isHost: boolean;

  // Multiplayer state
  peerId: string;
  connectionStatus: ConnectionStatus;
  turnOrder: string[];
  currentTurnIndex: number;
  isMyTurn: boolean;
  pendingInteraction: PendingInteraction | null;
  partyState: Record<string, PlayerSummary>;
  chatMessages: any[]; // ChatMessage['payload'][]
  isPaused: boolean;

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
  worldMap: WorldMap;

  // AI Provider settings
  aiProvider: ProviderType;
  providerApiKeys: Partial<Record<ProviderType, string>>;
}


// ----- Context types for AI prompts -----

export interface GameStateCharacterContext {
  name: string;
  class: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  stats: {
    strength: number;
    stamina: number;
    wisdom: number;
  };
  health: { current: number; max: number };
  stamina: { current: number; max: number };
  mana: { current: number; max: number };
  traits: string[];
  knowledge: string[];
  background: string;
  description: string;
  aiGeneratedDescription?: string;
  reputation: Record<string, number>;
  npcRelationships: Record<string, number>;
  skillTreeStage: number;
  skillTreeStageName: string;
  learnedSkills: string[];
  statusEffects?: { name: string; remainingTurns: number }[];
}

export interface GameStateInventoryItemContext {
  name: string;
  description: string;
  quality?: ItemQuality;
  weight?: number;
  durability?: number;
  magicalEffect?: string;
}

export interface GameStateAdventureSettingsContext {
  type: AdventureType;
  difficulty: DifficultyLevel;
  permanentDeath: boolean;
  worldType?: string;
  mainQuestline?: string;
  genreTheme?: string;
  magicSystem?: string;
  techLevel?: string;
  dominantTone?: string;
  startingSituation?: string;
  combatFrequency?: string;
  puzzleFrequency?: string;
  socialFocus?: string;
  universeName?: string;
  playerCharacterConcept?: string;
  characterOriginType?: 'existing' | 'original';
}

/** Structured context for AI prompts, replacing regex-based string parsing. */
export interface GameStateContext {
  turn: number;
  character: GameStateCharacterContext | null;
  inventory: GameStateInventoryItemContext[];
  adventureSettings: GameStateAdventureSettingsContext;
  previousNarration?: string;
  storyLogLength: number;
  /** Summary of key events from recent story history (for AI memory) */
  storyLogSummary?: string;
  /** Character personality memory: key events that demonstrate personality traits */
  characterMemory?: string;
  /** Structured story state facts: locations visited, NPCs met, objects state */
  storyStateFacts?: string;
  worldMap?: WorldMap;
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