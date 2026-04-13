// src/context/game-initial-state.ts

import type { GameState, WorldMap, Location } from "../types/game-types";
import type { Character, CharacterStats } from "../types/character-types";
import type { InventoryItem, ItemQuality } from "../types/inventory-types";
import type { AdventureSettings, DifficultyLevel } from "../types/adventure-types";
import {
    calculateMaxHealth,
    calculateMaxActionStamina,
    calculateMaxMana,
    calculateXpToNextLevel,
    getStarterSkillsForClass
} from "../lib/gameUtils";
import { TOTAL_STAT_POINTS } from "../lib/constants";

export const CURRENT_STATE_VERSION = 1;

const pointsPerStat = Math.floor(TOTAL_STAT_POINTS / 3);
const remainderPoints = TOTAL_STAT_POINTS % 3;

export const initialCharacterStats: CharacterStats = {
    strength: pointsPerStat + (remainderPoints > 0 ? 1 : 0),
    stamina: pointsPerStat + (remainderPoints > 1 ? 1 : 0),
    wisdom: pointsPerStat,
};

export const initialCharacterState: Character = {
  name: "",
  description: "",
  class: "Adventurer",
  traits: [],
  knowledge: [],
  background: "",
  stats: { ...initialCharacterStats },
  aiGeneratedDescription: undefined,
  maxHealth: calculateMaxHealth(initialCharacterStats),
  currentHealth: calculateMaxHealth(initialCharacterStats),
  maxStamina: calculateMaxActionStamina(initialCharacterStats),
  currentStamina: calculateMaxActionStamina(initialCharacterStats),
  maxMana: calculateMaxMana(initialCharacterStats, []),
  currentMana: calculateMaxMana(initialCharacterStats, []),
  level: 1,
  xp: 0,
  statusEffects: [],
  xpToNextLevel: calculateXpToNextLevel(1),
  reputation: {},
  npcRelationships: {},
  skillTree: null,
  skillTreeStage: 0,
  learnedSkills: getStarterSkillsForClass("Adventurer"),
};

export const initialInventory: InventoryItem[] = [
    { name: "Basic Clothes", description: "Simple, slightly worn clothes.", quality: "Poor" as ItemQuality, weight: 1 },
    { name: "Crusty Bread", description: "A piece of somewhat stale bread.", quality: "Poor" as ItemQuality, weight: 0.5 }
];

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

// Sample world map for initial state – will be replaced by AI generation later
const initialLocations: Location[] = [
    {
        id: 'town1',
        name: 'Oakhaven',
        description: 'A peaceful village surrounded by forest.',
        type: 'town',
        discovered: true,
        x: 30,
        y: 40,
        connectedLocationIds: ['forest1', 'road1']
    },
    {
        id: 'forest1',
        name: 'Whispering Woods',
        description: 'An ancient forest with secrets.',
        type: 'wilderness',
        discovered: false,
        x: 50,
        y: 20,
        connectedLocationIds: ['town1', 'cave1']
    },
    {
        id: 'cave1',
        name: 'Glimmering Cave',
        description: 'A cave filled with glowing crystals.',
        type: 'dungeon',
        discovered: false,
        x: 70,
        y: 30,
        connectedLocationIds: ['forest1']
    },
    {
        id: 'road1',
        name: 'North Road',
        description: 'A well-traveled road leading to the mountains.',
        type: 'landmark',
        discovered: false,
        x: 20,
        y: 60,
        connectedLocationIds: ['town1', 'mountain1']
    },
    {
        id: 'mountain1',
        name: 'Ironpeak Mountain',
        description: 'A treacherous mountain pass.',
        type: 'wilderness',
        discovered: false,
        x: 10,
        y: 80,
        connectedLocationIds: ['road1']
    }
];

export const initialWorldMap: WorldMap = {
    locations: initialLocations,
    currentLocationId: 'town1',
};

export const initialState: GameState = {
  version: CURRENT_STATE_VERSION,
  status: "MainMenu",
  character: null,
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
  worldMap: initialWorldMap,
  aiProvider: 'gemini',
  providerApiKeys: {},
};