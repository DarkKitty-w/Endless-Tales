// src/context/GameContext.tsx
"use client";

import type { ReactNode } from "react";
import React, { createContext, useContext, useReducer, Dispatch, useEffect } from "react";
import type { GenerateCharacterDescriptionOutput } from "@/ai/flows/generate-character-description";
import type { NarrateAdventureOutput } from "@/ai/flows/narrate-adventure";

export type GameStatus =
  | "MainMenu"
  | "CharacterCreation"
  | "AdventureSetup"
  | "Gameplay"
  | "AdventureSummary"
  | "ViewSavedAdventures"; // New status for viewing saves

// --- State Definition ---

export interface CharacterStats {
  strength: number;
  stamina: number;
  agility: number;
}

export interface Character {
  name: string;
  description: string; // User input description (basic combined or text-based)
  traits: string[]; // Array of traits
  knowledge: string[]; // Array of knowledge areas
  background: string; // Single background string
  stats: CharacterStats;
  aiGeneratedDescription?: GenerateCharacterDescriptionOutput['detailedDescription']; // Optional detailed description from AI
}

export interface AdventureSettings {
  adventureType: "Randomized" | "Custom" | null;
  permanentDeath: boolean;
  // Add custom parameters here if needed
  worldType?: string;
  mainQuestline?: string;
  difficulty?: string;
}

// Represents one turn/log entry in the story
export interface StoryLogEntry extends NarrateAdventureOutput {
  timestamp: number; // Track when the entry occurred
}

// Represents a saved game state snapshot
export interface SavedAdventure {
    id: string; // Unique ID for the save (e.g., timestamp or UUID)
    saveTimestamp: number;
    characterName: string;
    // Store the state relevant for resuming or viewing summary
    character: Character;
    adventureSettings: AdventureSettings;
    storyLog: StoryLogEntry[];
    currentGameStateString: string; // State at the point of saving
    statusBeforeSave?: GameStatus; // Status when saved (e.g., Gameplay)
    adventureSummary?: string | null; // If saved after finishing
}


export interface GameState {
  status: GameStatus;
  character: Character | null;
  adventureSettings: AdventureSettings;
  currentNarration: StoryLogEntry | null; // The very latest narration received (now with timestamp)
  storyLog: StoryLogEntry[]; // Log of all narrations for summary/review (now with timestamps)
  adventureSummary: string | null;
  currentGameStateString: string; // Game state string for AI narration flow input
  savedAdventures: SavedAdventure[]; // Array to hold saved games
  currentAdventureId: string | null; // ID of the adventure currently being played/saved
}

const initialCharacterState: Character = {
  name: "",
  description: "",
  traits: [],
  knowledge: [],
  background: "",
  stats: { strength: 5, stamina: 5, agility: 5 }, // Default starting stats
};

const initialState: GameState = {
  status: "MainMenu",
  character: null,
  adventureSettings: {
    adventureType: null,
    permanentDeath: true,
  },
  currentNarration: null,
  storyLog: [],
  adventureSummary: null,
  currentGameStateString: "The adventure is about to begin...", // Initial game state placeholder
  savedAdventures: [], // Initialize as empty, will load from storage
  currentAdventureId: null,
};

// --- LocalStorage Keys ---
const SAVED_ADVENTURES_KEY = "endlessTalesSavedAdventures";

// --- Action Definitions ---

type Action =
  | { type: "SET_GAME_STATUS"; payload: GameStatus }
  | { type: "CREATE_CHARACTER"; payload: Partial<Character> } // Accepts partial character data
  | { type: "UPDATE_CHARACTER"; payload: Partial<Character> }
  | { type: "SET_AI_DESCRIPTION"; payload: string } // Action specifically for AI description
  | { type: "SET_ADVENTURE_SETTINGS"; payload: Partial<AdventureSettings> }
  | { type: "START_GAMEPLAY" }
  | { type: "UPDATE_NARRATION"; payload: NarrateAdventureOutput }
  | { type: "END_ADVENTURE"; payload: { summary: string | null; finalNarration?: NarrateAdventureOutput } }
  | { type: "RESET_GAME" }
  | { type: "LOAD_SAVED_ADVENTURES"; payload: SavedAdventure[] } // Load saves from storage
  | { type: "SAVE_CURRENT_ADVENTURE" } // Save the current game state
  | { type: "LOAD_ADVENTURE"; payload: string } // Load a specific adventure by ID
  | { type: "DELETE_ADVENTURE"; payload: string }; // Delete a specific adventure by ID

// --- Helper Functions ---
function generateAdventureId(): string {
    return `adv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// --- Reducer ---

function gameReducer(state: GameState, action: Action): GameState {
  console.log(`Reducer Action: ${action.type}`, action.payload ? JSON.stringify(action.payload).substring(0, 200) : ''); // Log actions for debugging
  switch (action.type) {
    case "SET_GAME_STATUS":
      return { ...state, status: action.payload };
    case "CREATE_CHARACTER":
      const newCharacter: Character = {
        ...initialCharacterState,
        ...action.payload,
         stats: action.payload.stats ? { ...initialCharacterState.stats, ...action.payload.stats } : initialCharacterState.stats,
         traits: action.payload.traits ?? [],
         knowledge: action.payload.knowledge ?? [],
      };
      return {
        ...state,
        character: newCharacter,
        status: "AdventureSetup",
        currentAdventureId: null, // Ensure no old ID persists
        storyLog: [],
        currentNarration: null,
        adventureSummary: null,
      };
    case "UPDATE_CHARACTER":
        if (!state.character) return state;
        return {
            ...state,
            character: { ...state.character, ...action.payload },
        };
    case "SET_AI_DESCRIPTION":
        if (!state.character) return state;
        return {
            ...state,
            character: { ...state.character, aiGeneratedDescription: action.payload },
        };
    case "SET_ADVENTURE_SETTINGS":
      return {
        ...state,
        adventureSettings: { ...state.adventureSettings, ...action.payload },
      };
    case "START_GAMEPLAY":
      if (!state.character || !state.adventureSettings.adventureType) {
        console.error("Cannot start gameplay: Missing character or adventure type.");
        return state;
      }
       const charDesc = state.character.aiGeneratedDescription || state.character.description || "No description provided.";
       const initialGameState = `Location: Starting Point\nInventory: Basic Clothes\nStatus: Healthy\nTime: Day 1, Morning\nQuest: None\nMilestones: None\nCharacter Name: ${state.character.name}\nTraits: ${state.character.traits.join(', ') || 'None'}\nKnowledge: ${state.character.knowledge.join(', ') || 'None'}\nBackground: ${state.character.background || 'None'}\nStats: STR ${state.character.stats.strength}, STA ${state.character.stats.stamina}, AGI ${state.character.stats.agility}\nDescription: ${charDesc}\nAdventure Mode: ${state.adventureSettings.adventureType}, ${state.adventureSettings.permanentDeath ? 'Permadeath' : 'Respawn'}`;
       const adventureId = state.currentAdventureId || generateAdventureId(); // Use existing ID if loading, else generate new
      return {
        ...state,
        status: "Gameplay",
        storyLog: state.currentAdventureId ? state.storyLog : [], // Keep log if loading
        currentNarration: state.currentAdventureId ? state.currentNarration : null, // Keep narration if loading
        adventureSummary: null,
        currentGameStateString: state.currentAdventureId ? state.currentGameStateString : initialGameState, // Keep state if loading
        currentAdventureId: adventureId, // Set the ID for this adventure session
      };
    case "UPDATE_NARRATION":
      const newLogEntry: StoryLogEntry = {
          ...action.payload,
          timestamp: Date.now(),
       };
      const newLog = [...state.storyLog, newLogEntry];
      return {
        ...state,
        currentNarration: newLogEntry,
        storyLog: newLog,
        currentGameStateString: action.payload.updatedGameState,
      };
     case "END_ADVENTURE":
       let finalLog = [...state.storyLog];
       let finalGameState = state.currentGameStateString;
       if (action.payload.finalNarration && (!state.currentNarration || action.payload.finalNarration.narration !== state.currentNarration.narration)) {
          const finalEntry: StoryLogEntry = {
            ...action.payload.finalNarration,
            timestamp: Date.now(),
          };
          finalLog.push(finalEntry);
          finalGameState = action.payload.finalNarration.updatedGameState; // Update final game state
          console.log("Added final narration entry to log.");
       } else {
         console.log("Final narration not added (either missing or same as last entry).")
       }

       // Auto-save on end
       let updatedSavedAdventures = state.savedAdventures;
        if (state.character && state.currentAdventureId) {
           const endedAdventure: SavedAdventure = {
               id: state.currentAdventureId,
               saveTimestamp: Date.now(),
               characterName: state.character.name,
               character: state.character,
               adventureSettings: state.adventureSettings,
               storyLog: finalLog, // Save the complete log
               currentGameStateString: finalGameState, // Save the final state
               statusBeforeSave: "AdventureSummary", // Mark as ended
               adventureSummary: action.payload.summary,
           };
           // Remove existing save with the same ID before adding the updated one
           updatedSavedAdventures = state.savedAdventures.filter(adv => adv.id !== endedAdventure.id);
           updatedSavedAdventures.push(endedAdventure);
            // Persist to localStorage immediately
            localStorage.setItem(SAVED_ADVENTURES_KEY, JSON.stringify(updatedSavedAdventures));
            console.log("Adventure ended and automatically saved.");
        }

      return {
        ...state,
        status: "AdventureSummary",
        adventureSummary: action.payload.summary,
        storyLog: finalLog,
        currentNarration: null,
        savedAdventures: updatedSavedAdventures,
      };
    case "RESET_GAME":
      // Reset everything EXCEPT saved adventures
      return {
          ...initialState,
          savedAdventures: state.savedAdventures, // Keep loaded saves
          status: "MainMenu", // Ensure status is MainMenu
       };

    // --- Save/Load Actions ---
    case "LOAD_SAVED_ADVENTURES":
        return { ...state, savedAdventures: action.payload };

    case "SAVE_CURRENT_ADVENTURE":
      if (!state.character || !state.currentAdventureId || state.status !== "Gameplay") {
        console.warn("Cannot save: No active character, adventure ID, or not in Gameplay.");
        return state;
      }
      const currentSave: SavedAdventure = {
        id: state.currentAdventureId,
        saveTimestamp: Date.now(),
        characterName: state.character.name,
        character: state.character,
        adventureSettings: state.adventureSettings,
        storyLog: state.storyLog,
        currentGameStateString: state.currentGameStateString,
        statusBeforeSave: state.status, // Capture current status
        adventureSummary: state.adventureSummary, // Might be null if saved mid-game
      };
      // Remove existing save with same ID before adding/updating
      const savesWithoutCurrent = state.savedAdventures.filter(adv => adv.id !== currentSave.id);
      const newSaves = [...savesWithoutCurrent, currentSave];
       // Persist to localStorage
       localStorage.setItem(SAVED_ADVENTURES_KEY, JSON.stringify(newSaves));
      return { ...state, savedAdventures: newSaves };

    case "LOAD_ADVENTURE":
      const adventureToLoad = state.savedAdventures.find(adv => adv.id === action.payload);
      if (!adventureToLoad) {
        console.error(`Adventure with ID ${action.payload} not found.`);
        return state;
      }
       // Check if the adventure was already finished
        if (adventureToLoad.statusBeforeSave === "AdventureSummary") {
            // Load directly into summary view
             return {
                ...initialState, // Reset most things
                savedAdventures: state.savedAdventures, // Keep saves
                status: "AdventureSummary",
                character: adventureToLoad.character, // Load character for display
                adventureSummary: adventureToLoad.adventureSummary,
                storyLog: adventureToLoad.storyLog,
                currentAdventureId: adventureToLoad.id, // Keep track of which summary we are viewing
             };
        } else {
            // Load into gameplay state
            return {
                ...state,
                status: "Gameplay", // Set status to trigger gameplay screen
                character: adventureToLoad.character,
                adventureSettings: adventureToLoad.adventureSettings,
                storyLog: adventureToLoad.storyLog,
                currentGameStateString: adventureToLoad.currentGameStateString,
                currentNarration: adventureToLoad.storyLog.length > 0 ? adventureToLoad.storyLog[adventureToLoad.storyLog.length - 1] : null,
                adventureSummary: null, // Clear summary if resuming mid-game
                currentAdventureId: adventureToLoad.id, // Set the ID of the loaded adventure
            };
        }


    case "DELETE_ADVENTURE":
        const filteredSaves = state.savedAdventures.filter(adv => adv.id !== action.payload);
        // Persist deletion to localStorage
        localStorage.setItem(SAVED_ADVENTURES_KEY, JSON.stringify(filteredSaves));
        return { ...state, savedAdventures: filteredSaves };


    default:
      // https://github.com/typescript-eslint/typescript-eslint/issues/6131
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-case-declarations
      const exhaustiveCheck: never = action; // Ensures all actions are handled
      return state;
  }
}

// --- Context and Provider ---

const GameContext = createContext<{ state: GameState; dispatch: Dispatch<Action> } | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

    // --- Persistence Effect ---
    useEffect(() => {
        // Load saved adventures from localStorage on initial mount
        try {
            const savedData = localStorage.getItem(SAVED_ADVENTURES_KEY);
            if (savedData) {
                const loadedAdventures: SavedAdventure[] = JSON.parse(savedData);
                // Basic validation (check if it's an array)
                if (Array.isArray(loadedAdventures)) {
                    dispatch({ type: "LOAD_SAVED_ADVENTURES", payload: loadedAdventures });
                    console.log(`Loaded ${loadedAdventures.length} adventures from storage.`);
                } else {
                    console.warn("Invalid data found in localStorage for saved adventures.");
                    localStorage.removeItem(SAVED_ADVENTURES_KEY); // Clear invalid data
                }
            } else {
                 console.log("No saved adventures found in storage.");
            }
        } catch (error) {
            console.error("Failed to load or parse saved adventures:", error);
             localStorage.removeItem(SAVED_ADVENTURES_KEY); // Clear potentially corrupt data
        }
    }, []); // Empty dependency array ensures this runs only once on mount


   // Log state changes for debugging (reduce noise by logging only status changes)
   useEffect(() => {
     console.log("Game Status Changed:", state.status);
     // Log when entering gameplay and if it's a loaded game
     if (state.status === 'Gameplay' && state.currentAdventureId) {
        const loaded = state.savedAdventures.some(s => s.id === state.currentAdventureId);
        console.log(`Entered Gameplay. Adventure ID: ${state.currentAdventureId}. ${loaded ? '(Loaded)' : '(New)'}`);
     }
   }, [state.status, state.currentAdventureId, state.savedAdventures]); // Add dependencies


  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

// --- Hook ---

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
