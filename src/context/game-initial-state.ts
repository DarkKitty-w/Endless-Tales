// src/context/game-initial-state.ts

import type {
    GameState,
    Character,
    AdventureSettings,
    InventoryItem,
    ItemQuality
} from "@/types/game-types";
import {
    calculateMaxStamina,
    calculateMaxMana,
    calculateXpToNextLevel,
    getStarterSkillsForClass
} from "@/lib/gameUtils";

/** Initial state for a new character. */
export const initialCharacterState: Character = {
  name: "",
  description: "",
  class: "Adventurer", // Default starting class
  traits: [],
  knowledge: [],
  background: "",
  stats: { strength: 5, stamina: 5, agility: 5 },
  aiGeneratedDescription: undefined,
  maxStamina: calculateMaxStamina({ strength: 5, stamina: 5, agility: 5 }),
  currentStamina: calculateMaxStamina({ strength: 5, stamina: 5, agility: 5 }),
  maxMana: calculateMaxMana({ strength: 5, stamina: 5, agility: 5 }, []),
  currentMana: calculateMaxMana({ strength: 5, stamina: 5, agility: 5 }, []),
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
    difficulty: "Normal", // Default difficulty
    worldType: "",
    mainQuestline: "",
};

/** The overall initial state for the GameContext. */
export const initialState: GameState = {
  status: "MainMenu",
  character: null,
  adventureSettings: initialAdventureSettings,
  currentNarration: null,
  storyLog: [],
  adventureSummary: null,
  currentGameStateString: "The adventure is about to begin...",
  inventory: [], // Start with empty inventory, populated on new game
  savedAdventures: [],
  currentAdventureId: null,
  isGeneratingSkillTree: false,
  turnCount: 0,
};
