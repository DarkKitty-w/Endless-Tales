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
  | "AdventureSummary";

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


export interface GameState {
  status: GameStatus;
  character: Character | null;
  adventureSettings: AdventureSettings;
  currentNarration: StoryLogEntry | null; // The very latest narration received (now with timestamp)
  storyLog: StoryLogEntry[]; // Log of all narrations for summary/review (now with timestamps)
  adventureSummary: string | null;
  currentGameStateString: string; // Game state string for AI narration flow input
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
};

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
  | { type: "RESET_GAME" };

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
         // Ensure arrays are always initialized
         traits: action.payload.traits ?? [],
         knowledge: action.payload.knowledge ?? [],
      };
      return {
        ...state,
        character: newCharacter,
        status: "AdventureSetup",
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
        return state; // Prevent starting gameplay without necessary info
      }
       const charDesc = state.character.aiGeneratedDescription || state.character.description || "No description provided.";
       const initialGameState = `Location: Starting Point\nInventory: Basic Clothes\nStatus: Healthy\nTime: Day 1, Morning\nQuest: None\nMilestones: None\nCharacter Name: ${state.character.name}\nTraits: ${state.character.traits.join(', ') || 'None'}\nKnowledge: ${state.character.knowledge.join(', ') || 'None'}\nBackground: ${state.character.background || 'None'}\nStats: STR ${state.character.stats.strength}, STA ${state.character.stats.stamina}, AGI ${state.character.stats.agility}\nDescription: ${charDesc}\nAdventure Mode: ${state.adventureSettings.adventureType}, ${state.adventureSettings.permanentDeath ? 'Permadeath' : 'Respawn'}`;
      return {
        ...state,
        status: "Gameplay",
        storyLog: [], // Clear previous log
        currentNarration: null, // Clear previous narration
        adventureSummary: null, // Clear previous summary
        currentGameStateString: initialGameState, // Set detailed initial state for AI
      };
    case "UPDATE_NARRATION":
      const newLogEntry: StoryLogEntry = {
          ...action.payload,
          timestamp: Date.now(), // Add timestamp to the new entry
       };
      // Append the new narration+state object to the log
      const newLog = [...state.storyLog, newLogEntry];
      return {
        ...state,
        currentNarration: newLogEntry, // Update the latest narration
        storyLog: newLog, // Update the full log
        currentGameStateString: action.payload.updatedGameState, // Update the game state string for the next turn
      };
     case "END_ADVENTURE":
       // Optionally add the final narration to the log if provided and different from last entry
       let finalLog = [...state.storyLog]; // Create a mutable copy
       if (action.payload.finalNarration && (!state.currentNarration || action.payload.finalNarration.narration !== state.currentNarration.narration)) {
          const finalEntry: StoryLogEntry = {
            ...action.payload.finalNarration,
            timestamp: Date.now(),
          };
          finalLog.push(finalEntry); // Append the final entry to the copied log
          console.log("Added final narration entry to log.");
       } else {
         console.log("Final narration not added (either missing or same as last entry).")
       }

      return {
        ...state,
        status: "AdventureSummary", // Change game status
        adventureSummary: action.payload.summary, // Save the generated summary
        storyLog: finalLog, // Save the final log for detailed view
        // Reset currentNarration to avoid showing it again on the summary screen implicitly
        currentNarration: null,
      };
    case "RESET_GAME":
      return { ...initialState }; // Reset to main menu, clear everything
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

   // Log state changes for debugging (reduce noise by logging only status changes)
   useEffect(() => {
     console.log("Game Status Changed:", state.status);
   }, [state.status]);

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
