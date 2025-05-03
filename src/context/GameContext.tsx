// src/context/GameContext.tsx
"use client";

import type { ReactNode } from "react";
import React, { createContext, useContext, useReducer, Dispatch, useEffect } from "react";
import type { GameState, SavedAdventure } from "@/types/game-types";
import type { Action } from "./game-actions";
import { initialState } from "./game-initial-state";
import { gameReducer } from "./game-reducer";

// --- LocalStorage Key ---
const SAVED_ADVENTURES_KEY = "endlessTalesSavedAdventures";

// --- Context Definition ---
const GameContext = createContext<{ state: GameState; dispatch: Dispatch<Action> } | undefined>(undefined);

// --- Provider Component ---
export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

    // --- Persistence Effect ---
    useEffect(() => {
        console.log("GameProvider mounted. Attempting to load saved adventures.");
        try {
            const savedData = localStorage.getItem(SAVED_ADVENTURES_KEY);
            if (savedData) {
                const loadedAdventures: SavedAdventure[] = JSON.parse(savedData);
                // Basic validation - a more robust validation happens in the reducer on LOAD_ADVENTURE
                if (Array.isArray(loadedAdventures)) {
                    dispatch({ type: "LOAD_SAVED_ADVENTURES", payload: loadedAdventures });
                    console.log(`Loaded ${loadedAdventures.length} adventures from storage into initial state.`);
                } else {
                    console.warn("Invalid data found in localStorage for saved adventures. Discarding.");
                    localStorage.removeItem(SAVED_ADVENTURES_KEY);
                }
            } else {
                 console.log("No saved adventures found in storage.");
            }
        } catch (error) {
            console.error("Failed to load or parse saved adventures:", error);
             localStorage.removeItem(SAVED_ADVENTURES_KEY);
        }
    }, []);


   // Log state changes (optional but helpful for debugging)
   useEffect(() => {
      const currentStageName = state.character?.skillTreeStage !== undefined && state.character?.skillTree
          ? state.character.skillTree.stages[state.character.skillTreeStage]?.stageName ?? `Stage ${state.character.skillTreeStage}`
          : "Stage 0";
      const reputationString = state.character ? Object.entries(state.character.reputation).map(([f, s]) => `${f}: ${s}`).join(', ') || 'None' : 'N/A';
      const relationshipString = state.character ? Object.entries(state.character.npcRelationships).map(([n, s]) => `${n}: ${s}`).join(', ') || 'None' : 'N/A';
      const inventoryString = state.inventory.map(i => `${i.name}${i.quality ? ` (${i.quality})` : ''}`).join(', ') || 'Empty';
     console.log("Game State Updated:", {
        status: state.status,
        turn: state.turnCount,
        character: state.character?.name,
        level: state.character?.level,
        xp: `${state.character?.xp}/${state.character?.xpToNextLevel}`,
        reputation: reputationString,
        relationships: relationshipString,
        class: state.character?.class,
        stage: `${currentStageName} (${state.character?.skillTreeStage}/4)`,
        stamina: `${state.character?.currentStamina}/${state.character?.maxStamina}`,
        mana: `${state.character?.currentMana}/${state.character?.maxMana}`,
        adventureId: state.currentAdventureId,
        settings: state.adventureSettings,
        inventory: inventoryString,
    });
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
