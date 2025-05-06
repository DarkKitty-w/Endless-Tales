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
  | "ViewSavedAdventures";

/** Represents the overall state of the game application. */
export interface GameState {
  status: GameStatus;
  character: Character | null;
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
  // Theme state
  selectedThemeId: string;
  isDarkMode: boolean;
  // User API Key
  userGoogleAiApiKey: string | null;
}

// Re-export frequently used sub-types for convenience in other files if needed
// Or encourage importing directly from the specific type files
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

export type { InventoryItem, ItemQuality } from "./inventory-types"; // Example re-export with alias

export type { AdventureSettings, StoryLogEntry, SavedAdventure, DifficultyLevel, AdventureType } from "./adventure-types";