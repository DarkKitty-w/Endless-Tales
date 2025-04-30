// src/context/GameContext.tsx
"use client";

import type { ReactNode } from "react";
import React, { createContext, useContext, useReducer, Dispatch } from "react";
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

export interface GameState {
  status: GameStatus;
  character: Character | null;
  adventureSettings: AdventureSettings;
  currentNarration: NarrateAdventureOutput | null; // The very latest narration received
  storyLog: NarrateAdventureOutput[]; // Log of all narrations for summary/review
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
  console.log(`Reducer Action: ${action.type}`, action); // Log actions for debugging
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
      // Append the new narration+state object to the log
      const newLog = [...state.storyLog, action.payload];
      return {
        ...state,
        currentNarration: action.payload, // Update the latest narration
        storyLog: newLog, // Update the full log
        currentGameStateString: action.payload.updatedGameState, // Update the game state string for the next turn
      };
     case "END_ADVENTURE":
      // Optionally add the final narration to the log if provided
      const finalLog = action.payload.finalNarration
        ? [...state.storyLog, action.payload.finalNarration]
        : state.storyLog;
      return {
        ...state,
        status: "AdventureSummary",
        adventureSummary: action.payload.summary,
        storyLog: finalLog, // Save the full log for detailed view
      };
    case "RESET_GAME":
      return { ...initialState }; // Reset to main menu, clear everything
    default:
      return state;
  }
}

// --- Context and Provider ---

const GameContext = createContext<{ state: GameState; dispatch: Dispatch<Action> } | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

   // Log state changes for debugging
   useEffect(() => {
     console.log("Game State Changed:", state);
   }, [state]);

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

// Effect hook for debugging (optional)
import { useEffect } from "react";
