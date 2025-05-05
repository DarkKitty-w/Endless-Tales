// src/types/adventure-types.ts

import type { GameStatus } from "./game-types"; // Assuming GameStatus stays in the main types file for now
import type { Character, Reputation, NpcRelationships, Skill, CharacterStats, ReputationChange, NpcRelationshipChange } from "./character-types";
import type { InventoryItem } from "./inventory-types";


/** Defines the possible difficulty levels for the game and AI assessment. */
export type DifficultyLevel = "Trivial" | "Easy" | "Normal" | "Hard" | "Very Hard" | "Impossible";

/** Settings for the current adventure. */
export interface AdventureSettings {
  adventureType: "Randomized" | "Custom" | null;
  permanentDeath: boolean;
  difficulty: DifficultyLevel;
  // Fields for Custom Adventure
  worldType?: string;
  mainQuestline?: string;
}

/** Represents a single entry in the adventure's story log. */
export interface StoryLogEntry {
  narration: string;
  updatedGameState: string;
  // Character progression updates from AI
  updatedStats?: Partial<CharacterStats>;
  updatedTraits?: string[];
  updatedKnowledge?: string[];
  progressedToStage?: number; // Optional: AI indicates skill stage progression
  suggestedClassChange?: string; // Optional: AI suggests a class change
  timestamp: number;
  // Resource changes from AI
  staminaChange?: number; // Negative for cost, positive for gain
  manaChange?: number; // Negative for cost, positive for gain
  gainedSkill?: Skill; // Optional: If a new skill was learned/gained
  xpGained?: number; // Optional: XP awarded by AI for the action/event
  reputationChange?: ReputationChange; // Optional: Reputation change awarded by AI
  npcRelationshipChange?: NpcRelationshipChange; // Optional: NPC Relationship change awarded by AI
}

/** Represents a saved adventure state. */
export interface SavedAdventure {
    id: string;
    saveTimestamp: number;
    characterName: string;
    character: Character;
    adventureSettings: AdventureSettings;
    storyLog: StoryLogEntry[];
    currentGameStateString: string;
    inventory: InventoryItem[];
    statusBeforeSave?: GameStatus;
    adventureSummary?: string | null;
    turnCount?: number;
}
