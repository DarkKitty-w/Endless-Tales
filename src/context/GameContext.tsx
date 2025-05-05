// src/context/GameContext.tsx
"use client";

import type { ReactNode } from "react";
import React, { createContext, useContext, useReducer, Dispatch, useEffect, useCallback, useState } from "react";
import type { GameState, SavedAdventure } from "@/types/game-types";
import type { Action } from "./game-actions";
import { initialState } from "./game-initial-state";
import { gameReducer } from "./game-reducer";
import { THEMES } from "@/lib/themes"; // Import themes

// --- LocalStorage Key ---
const SAVED_ADVENTURES_KEY = "endlessTalesSavedAdventures";
const THEME_ID_KEY = "colorTheme";
const THEME_MODE_KEY = "themeMode";


// --- Context Definition ---
const GameContext = createContext<{ state: GameState; dispatch: Dispatch<Action> } | undefined>(undefined);

// --- Provider Component ---
export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

   // --- Apply Theme Logic (Moved from SettingsPanel) ---
   const applyTheme = useCallback((themeId: string, isDark: boolean) => {
        const theme = THEMES.find(t => t.id === themeId) || THEMES[0]; // Fallback to default
        const colors = isDark ? theme.dark : theme.light;
        const root = document.documentElement;

        if (!root) return; // Ensure document is ready

        console.log(`Applying theme: ${themeId}, Mode: ${isDark ? 'Dark' : 'Light'}`);

        // Apply CSS variables
        Object.entries(colors).forEach(([property, value]) => {
            root.style.setProperty(property, value);
        });

        // Apply dark/light class
        if (isDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        // Save preferences (moved from reducer to avoid direct localStorage access in reducer)
        localStorage.setItem(THEME_ID_KEY, themeId);
        localStorage.setItem(THEME_MODE_KEY, isDark ? 'dark' : 'light');
   }, []);


    // --- Persistence Effect ---
    useEffect(() => {
        console.log("GameProvider mounted. Attempting to load saved data.");

        // Load Saved Adventures
        try {
            const savedData = localStorage.getItem(SAVED_ADVENTURES_KEY);
            if (savedData) {
                const loadedAdventures: SavedAdventure[] = JSON.parse(savedData);
                if (Array.isArray(loadedAdventures)) {
                    dispatch({ type: "LOAD_SAVED_ADVENTURES", payload: loadedAdventures });
                    console.log(`Loaded ${loadedAdventures.length} adventures from storage.`);
                } else {
                    console.warn("Invalid saved adventures data. Discarding.");
                    localStorage.removeItem(SAVED_ADVENTURES_KEY);
                }
            } else {
                 console.log("No saved adventures found.");
            }
        } catch (error) {
            console.error("Failed to load saved adventures:", error);
             localStorage.removeItem(SAVED_ADVENTURES_KEY);
        }

         // Load Theme Settings
         const savedThemeId = localStorage.getItem(THEME_ID_KEY) || initialState.selectedThemeId;
         const savedMode = localStorage.getItem(THEME_MODE_KEY);
         const prefersDark = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : false;
         const initialDarkMode = savedMode === 'dark' || (!savedMode && prefersDark);

         dispatch({ type: 'SET_THEME_ID', payload: savedThemeId });
         dispatch({ type: 'SET_DARK_MODE', payload: initialDarkMode });

         console.log(`Loaded theme: ${savedThemeId}, Mode: ${initialDarkMode ? 'Dark' : 'Light'}`);
         // Apply the loaded theme directly here
         applyTheme(savedThemeId, initialDarkMode);

    }, [applyTheme]); // applyTheme is stable due to useCallback

    // --- Apply theme whenever state changes ---
     useEffect(() => {
         // Only apply if state has been initialized (avoids initial double-application)
         if (state.selectedThemeId !== initialState.selectedThemeId || state.isDarkMode !== initialState.isDarkMode) {
              applyTheme(state.selectedThemeId, state.isDarkMode);
         }
     }, [state.selectedThemeId, state.isDarkMode, applyTheme]);


   // Log state changes (optional but helpful for debugging)
   useEffect(() => {
      const currentStageName = state.character?.skillTreeStage !== undefined && state.character?.skillTree
          ? state.character.skillTree.stages[state.character.skillTreeStage]?.stageName ?? `Stage ${state.character.skillTreeStage}`
          : "Stage 0";
      const reputationString = state.character ? Object.entries(state.character.reputation).map(([f, s]) => `${f}: ${s}`).join(', ') || 'None' : 'N/A';
      const relationshipString = state.character ? Object.entries(state.character.npcRelationships).map(([n, s]) => `${n}: ${s}`).join(', ') || 'N/A' : 'N/A';
      const inventoryString = state.inventory.map(i => `${i.name}${i.quality ? ` (${i.quality})` : ''}`).join(', ') || 'Empty';
     // console.log("Game State Updated:", { // Temporarily disable verbose logging
     //    status: state.status,
     //    turn: state.turnCount,
     //    character: state.character?.name,
     //    level: state.character?.level,
     //    xp: `${state.character?.xp}/${state.character?.xpToNextLevel}`,
     //    reputation: reputationString,
     //    relationships: relationshipString,
     //    class: state.character?.class,
     //    stage: `${currentStageName} (${state.character?.skillTreeStage}/4)`,
     //    stamina: `${state.character?.currentStamina}/${state.character?.maxStamina}`,
     //    mana: `${state.character?.currentMana}/${state.character?.maxMana}`,
     //    adventureId: state.currentAdventureId,
     //    settings: state.adventureSettings,
     //    inventory: inventoryString,
     // });
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
