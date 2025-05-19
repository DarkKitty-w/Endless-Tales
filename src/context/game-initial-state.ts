
// src/context/game-initial-state.ts

import type { GameState } from "@/types/game-types";
import type { Character, CharacterStats } from "@/types/character-types";
import type { InventoryItem, ItemQuality } from "@/types/inventory-types";
import type { AdventureSettings, DifficultyLevel, AdventureType } from "@/types/adventure-types";
import {
    calculateMaxStamina,
    calculateMaxMana,
    calculateXpToNextLevel,
    getStarterSkillsForClass
} from "@/lib/gameUtils";
import { TOTAL_STAT_POINTS, MIN_STAT_VALUE } from "@/lib/constants";

/** Initial stats for a new character, ensuring they respect the total points. */
const baseValue = Math.floor(TOTAL_STAT_POINTS / 3); // Divide points among STR, STA, AGI
const remainder = TOTAL_STAT_POINTS % 3;

export const initialCharacterStats: CharacterStats = {
    strength: baseValue + (remainder > 0 ? 1 : 0), // Distribute remainder
    stamina: baseValue + (remainder > 1 ? 1 : 0),
    agility: baseValue,
    intellect: MIN_STAT_VALUE, // Keep non-allocatable stats at min
    wisdom: MIN_STAT_VALUE,
    charisma: MIN_STAT_VALUE,
};

/** Initial state for a new character. */
export const initialCharacterState: Character = {
  name: "",
  description: "",
  class: "Adventurer", // Default starting class
  traits: [],
  knowledge: [],
  background: "",
  stats: { ...initialCharacterStats }, // Use a copy of initialStats object
  aiGeneratedDescription: undefined,
  maxStamina: calculateMaxStamina(initialCharacterStats),
  currentStamina: calculateMaxStamina(initialCharacterStats),
  maxMana: calculateMaxMana(initialCharacterStats, []),
  currentMana: calculateMaxMana(initialCharacterStats, []),
  level: 1,
  xp: 0,
  xpToNextLevel: calculateXpToNextLevel(1),
  reputation: {},
  npcRelationships: {},
  skillTree: null,
  skillTreeStage: 0,
  learnedSkills: getStarterSkillsForClass("Adventurer"), // Assign default starter skills
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
    // Fields for Custom Adventure
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
    // Fields for Immersed Adventure
    universeName: "",
    playerCharacterConcept: "",
    characterOriginType: 'original', // Default to original character for Immersed
};

/** The overall initial state for the GameContext. */
export const initialState: GameState = {
  status: "MainMenu",
  character: null,
  adventureSettings: { ...initialAdventureSettings }, // Use a copy
  currentNarration: null,
  storyLog: [],
  adventureSummary: null,
  currentGameStateString: "The adventure is about to begin...",
  inventory: [], // Start with empty inventory, populated on new game
  savedAdventures: [],
  currentAdventureId: null,
  isGeneratingSkillTree: false,
  turnCount: 0,
  selectedThemeId: 'cardboard', // Default theme
  isDarkMode: false, // Default mode (will be checked against system pref on load)
  userGoogleAiApiKey: null, // Initialize user API key
};

