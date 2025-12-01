
// src/types/adventure-types.ts

import type { GameStatus } from "./game-types";
import type { Character, CharacterStats, Skill } from "./character-types";
import type { InventoryItem } from "./inventory-types";


/** Defines the possible difficulty levels for the game and AI assessment. */
export type DifficultyLevel = "Trivial" | "Easy" | "Normal" | "Hard" | "Very Hard" | "Impossible" | "Nightmare";

/** Defines the possible types of adventures. */
export type AdventureType = "Randomized" | "Custom" | "Immersed" | "Coop" | null;

export type GenreTheme = "High Fantasy" | "Dark Fantasy" | "Sci-Fi (Cyberpunk)" | "Sci-Fi (Space Opera)" | "Post-Apocalyptic" | "Horror" | "Mystery" | "Urban Fantasy" | "";
export type MagicSystem = "High Magic (Common & Powerful)" | "Low Magic (Rare & Subtle)" | "Elemental Magic" | "Psionics" | "No Magic" | "";
export type TechLevel = "Primitive" | "Medieval" | "Renaissance" | "Industrial" | "Modern" | "Futuristic" | "";
export type DominantTone = "Heroic & Optimistic" | "Grim & Perilous" | "Mysterious & Eerie" | "Comedic & Lighthearted" | "Serious & Political" | "";
export type CombatFrequency = "High" | "Medium" | "Low" | "None (Focus on Puzzles/Social)" | "";
export type PuzzleFrequency = "High" | "Medium" | "Low" | "";
export type SocialFocus = "High (Many NPCs, Dialogue Choices)" | "Medium" | "Low (More Exploration/Combat)" | "";


/** Settings for the current adventure. */
export interface AdventureSettings {
  adventureType: AdventureType;
  permanentDeath: boolean;
  difficulty: DifficultyLevel;
  worldType?: string;
  mainQuestline?: string;
  genreTheme?: GenreTheme;
  magicSystem?: MagicSystem;
  techLevel?: TechLevel;
  dominantTone?: DominantTone;
  startingSituation?: string;
  combatFrequency?: CombatFrequency;
  puzzleFrequency?: PuzzleFrequency;
  socialFocus?: SocialFocus;
  universeName?: string;
  playerCharacterConcept?: string;
  characterOriginType?: 'existing' | 'original';
}

/** Represents a single entry in the adventure's story log. */
export interface StoryLogEntry {
  narration: string;
  updatedGameState: string;
  updatedStats?: Partial<CharacterStats>;
  updatedTraits?: string[];
  updatedKnowledge?: string[];
  progressedToStage?: number;
  suggestedClassChange?: string;
  timestamp: number;
  healthChange?: number; // Added healthChange
  staminaChange?: number;
  manaChange?: number;
  gainedSkill?: Skill;
  xpGained?: number;
  reputationChange?: { faction: string; change: number };
  npcRelationshipChange?: { npcName: string; change: number };
  branchingChoices?: { text: string; consequenceHint?: string }[];
  dynamicEventTriggered?: string;
  isCharacterDefeated?: boolean; // Added to explicitly track defeat in narration
  turnNumber?: number; // Added turnNumber property
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

/** Structure for Firestore co-op session documents */
export interface FirestoreCoopSession {
    sessionId: string;
    hostUid: string;
    players: string[]; // Array of player UIDs
    status: 'lobby' | 'playing' | 'ended';
    createdAt: number; // Firestore timestamp or server timestamp
    currentTurnUid?: string | null; // UID of the player whose turn it is
    turnCount?: number;
    adventureSettings: AdventureSettings;
    storyLog: StoryLogEntry[];
    currentGameStateString: string;
    // For co-op, character and inventory might be shared or handled per player.
    // For simplicity, we might start with a shared character or a host-controlled one.
    sharedCharacter?: Character | null; // Or a more complex structure for multiple characters
    sharedInventory?: InventoryItem[];
    lastActionBy?: string; // UID of player who took the last action
    lastActionTimestamp?: number;
}
