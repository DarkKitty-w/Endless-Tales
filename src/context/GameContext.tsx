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

export interface Character {
  name: string;
  description: string; // Can be user-input or AI-generated detailed description
  traits: string[];
  knowledge: string[];
  background: string;
  stats: {
    strength: number;
    stamina: number;
    agility: number;
  };
  aiGeneratedDescription?: GenerateCharacterDescriptionOutput['detailedDescription'];
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
  currentNarration: NarrateAdventureOutput | null;
  storyLog: NarrateAdventureOutput[]; // Log of narrations for summary/review
  adventureSummary: string | null;
  currentGameStateString: string; // Game state for AI narration flow
}

const initialCharacterState: Character = {
  name: "",
  description: "",
  traits: [],
  knowledge: [],
  background: "",
  stats: { strength: 5, stamina: 5, agility: 5 }, // Example starting stats
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
  currentGameStateString: "The adventure begins...", // Initial game state
};

// --- Action Definitions ---

type Action =
  | { type: "SET_GAME_STATUS"; payload: GameStatus }
  | { type: "CREATE_CHARACTER"; payload: Partial<Character> }
  | { type: "UPDATE_CHARACTER"; payload: Partial<Character> }
  | { type: "SET_AI_DESCRIPTION"; payload: string }
  | { type: "SET_ADVENTURE_SETTINGS"; payload: Partial<AdventureSettings> }
  | { type: "START_GAMEPLAY" }
  | { type: "UPDATE_NARRATION"; payload: NarrateAdventureOutput }
  | { type: "END_ADVENTURE"; payload: { summary: string | null; finalNarration?: NarrateAdventureOutput } }
  | { type: "RESET_GAME" };

// --- Reducer ---

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "SET_GAME_STATUS":
      return { ...state, status: action.payload };
    case "CREATE_CHARACTER":
      return {
        ...state,
        character: { ...initialCharacterState, ...action.payload },
        status: "AdventureSetup", // Move to next step after creation
      };
    case "UPDATE_CHARACTER":
        if (!state.character) return state; // Should not happen if updating
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
      if (!state.character) return state; // Need character and settings
      return {
        ...state,
        status: "Gameplay",
        storyLog: [],
        currentNarration: null,
        adventureSummary: null,
        currentGameStateString: `Character: ${JSON.stringify(state.character, null, 2)}\nSettings: ${JSON.stringify(state.adventureSettings, null, 2)}\nInitial State: The adventure begins.`, // More detailed initial state
      };
    case "UPDATE_NARRATION":
      const newLog = [...state.storyLog, action.payload];
      return {
        ...state,
        currentNarration: action.payload,
        storyLog: newLog,
        currentGameStateString: action.payload.updatedGameState,
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
