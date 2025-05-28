// src/context/game-initial-state.ts

import type { GameState } from "@/types/game-types";
import type { Character, CharacterStats } from "@/types/character-types";
import type { InventoryItem, ItemQuality } from "@/types/inventory-types";
import type { AdventureSettings, DifficultyLevel, AdventureType } from "@/types/adventure-types";
import {
    calculateMaxHealth,
    calculateMaxActionStamina,
    calculateMaxMana,
    calculateXpToNextLevel,
    getStarterSkillsForClass
} from "@/lib/gameUtils";
import { TOTAL_STAT_POINTS, MIN_STAT_VALUE } from "@/lib/constants";

// Default distribution for 3 allocatable stats (STR, STA, WIS)
const pointsPerStat = Math.floor(TOTAL_STAT_POINTS / 3);
const remainderPoints = TOTAL_STAT_POINTS % 3;

export const initialCharacterStats: CharacterStats = {
    strength: pointsPerStat + (remainderPoints > 0 ? 1 : 0),
    stamina: pointsPerStat + (remainderPoints > 1 ? 1 : 0),
    wisdom: pointsPerStat,
};

/** Initial state for a new character. */
export const initialCharacterState: Character = {
  name: "",
  description: "",
  class: "Adventurer", // Default starting class
  traits: [],
  knowledge: [],
  background: "",
  stats: { ...initialCharacterStats }, // Use a copy
  aiGeneratedDescription: undefined,
  maxHealth: calculateMaxHealth(initialCharacterStats),
  currentHealth: calculateMaxHealth(initialCharacterStats),
  maxStamina: calculateMaxActionStamina(initialCharacterStats), // For physical actions
  currentStamina: calculateMaxActionStamina(initialCharacterStats),
  maxMana: calculateMaxMana(initialCharacterStats, []),
  currentMana: calculateMaxMana(initialCharacterStats, []),
  level: 1,
  xp: 0,
  xpToNextLevel: calculateXpToNextLevel(1),
  reputation: {},
  npcRelationships: {},
  skillTree: null,
  skillTreeStage: 0,
  learnedSkills: getStarterSkillsForClass("Adventurer"),
};

/** Default starting inventory items. */
export const initialInventory: InventoryItem[] = [
    { name: "Basic Clothes", description: "Simple, slightly worn clothes.", quality: "Poor" as ItemQuality, weight: 1 },
    { name: "Crusty Bread", description: "A piece of somewhat stale bread.", quality: "Poor" as ItemQuality, weight: 0.5 }
];

/** Default adventure settings. */
export const initialAdventureSettings: AdventureSettings = {
    adventureType: null,
    permanentDeath: true,
    difficulty: "Normal" as DifficultyLevel,
    worldType: "",
    mainQuestline: "",
    genreTheme: "",
    magicSystem: "",
    techLevel: "",
    dominantTone: "",
    startingSituation: "",
    combatFrequency: "Medium",
    puzzleFrequency: "Medium",
    socialFocus: "Medium",
    universeName: "",
    playerCharacterConcept: "",
    characterOriginType: 'original',
};

/** The overall initial state for the GameContext. */
export const initialState: GameState = {
  status: "MainMenu",
  character: null,
  // Multiplayer specific state
  sessionId: null,
  players: [],
  currentPlayerUid: null,
  isHost: false,

  adventureSettings: { ...initialAdventureSettings },
  currentNarration: null,
  storyLog: [],
  adventureSummary: null,
  currentGameStateString: "The adventure is about to begin...",
  inventory: [],
  savedAdventures: [],
  currentAdventureId: null,
  isGeneratingSkillTree: false,
  turnCount: 0,
  selectedThemeId: 'cardboard',
  isDarkMode: false,
  userGoogleAiApiKey: null,
};
