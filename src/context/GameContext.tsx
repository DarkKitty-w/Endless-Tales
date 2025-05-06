// src/context/GameContext.tsx
"use client";

import type { ReactNode } from "react";
import React, { createContext, useContext, useReducer, Dispatch, useEffect, useCallback } from "react";
import type { GameState, Character, InventoryItem, StoryLogEntry, SkillTree, Skill, Reputation, NpcRelationships } from "@/types/game-types"; // Import all necessary types
import type { Action } from "./game-actions";
import { initialState } from "./game-initial-state";
import { gameReducer } from "./game-reducer"; // Import the main combined reducer
import { THEMES } from "@/lib/themes";
import { SAVED_ADVENTURES_KEY, THEME_ID_KEY, THEME_MODE_KEY } from "@/lib/constants"; // Import constants
import type { SavedAdventure } from "@/types/adventure-types";

// --- Context Definition ---
const GameContext = createContext<{ state: GameState; dispatch: Dispatch<Action> } | undefined>(undefined);

// --- Provider Component ---
export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

   // --- Apply Theme Logic ---
   const applyTheme = useCallback((themeId: string, isDark: boolean) => {
        const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
        const colors = isDark ? theme.dark : theme.light;
        const root = document.documentElement;

        if (!root) return;

        console.log(`Applying theme: ${themeId}, Mode: ${isDark ? 'Dark' : 'Light'}`);

        Object.entries(colors).forEach(([property, value]) => {
            root.style.setProperty(property, value);
        });

        if (isDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        // Save preferences to localStorage
        localStorage.setItem(THEME_ID_KEY, themeId);
        localStorage.setItem(THEME_MODE_KEY, isDark ? 'dark' : 'light');
   }, []);


    // --- Persistence Effect (Loading) ---
    useEffect(() => {
        console.log("GameProvider mounted. Attempting to load saved data.");
        let loadedStateApplied = false;

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

         // Dispatch theme settings directly if they differ from initial state defaults
         if (savedThemeId !== initialState.selectedThemeId || initialDarkMode !== initialState.isDarkMode) {
            dispatch({ type: 'SET_THEME_ID', payload: savedThemeId });
            dispatch({ type: 'SET_DARK_MODE', payload: initialDarkMode });
            console.log(`Loaded theme: ${savedThemeId}, Mode: ${initialDarkMode ? 'Dark' : 'Light'}`);
            // applyTheme(savedThemeId, initialDarkMode); // Apply is handled by the state change effect now
            loadedStateApplied = true;
         }

         // Apply default theme if no saved theme was loaded/dispatched and state hasn't been initialized from storage
         // This check is now less critical as the state change effect will handle it.
         // However, we still might need an initial application if the loaded state matches the initial state perfectly.
         if (!loadedStateApplied && state.selectedThemeId === initialState.selectedThemeId && state.isDarkMode === initialState.isDarkMode) {
             console.log(`Applying initial default theme: ${initialState.selectedThemeId}, Mode: ${initialState.isDarkMode ? 'Dark' : 'Light'}`);
             applyTheme(initialState.selectedThemeId, initialState.isDarkMode);
         }

    }, [applyTheme]); // Run only once on mount


     // --- Theme Application Effect (Reacting to State Changes) ---
      useEffect(() => {
         // Always apply the theme based on the current state
         console.log(`Theme Effect: Applying theme ${state.selectedThemeId}, Dark Mode: ${state.isDarkMode}`);
         applyTheme(state.selectedThemeId, state.isDarkMode);
      }, [state.selectedThemeId, state.isDarkMode, applyTheme]); // Run whenever theme or mode changes


   // Log state changes (optional but helpful for debugging)
   useEffect(() => {
      const currentStageName = state.character?.skillTreeStage !== undefined && state.character?.skillTree
          ? state.character.skillTree.stages[state.character.skillTreeStage]?.stageName ?? `Stage ${state.character.skillTreeStage}`
          : "Potential"; // Updated default name
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
         stage: `${currentStageName} (${state.character?.skillTreeStage ?? 0}/4)`,
         stamina: `${state.character?.currentStamina}/${state.character?.maxStamina}`,
         mana: `${state.character?.currentMana}/${state.character?.maxMana}`,
         adventureId: state.currentAdventureId,
         settings: state.adventureSettings,
         inventory: inventoryString,
         theme: `${state.selectedThemeId} (${state.isDarkMode ? 'Dark' : 'Light'})`,
         storyLogLength: state.storyLog.length,
         isGeneratingSkillTree: state.isGeneratingSkillTree, // Log skill tree generation status
      });
   }, [state]); // Log whenever the state object changes


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

// --- Re-export types if needed, or import directly from specific files ---
export type {
    GameState,
    Action,
    Character,
    InventoryItem,
    StoryLogEntry,
    SkillTree,
    Skill,
    Reputation,
    NpcRelationships
};

