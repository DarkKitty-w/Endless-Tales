// src/context/GameContext.tsx
"use client";

import type { ReactNode } from "react";
import React, { createContext, useContext, useReducer, Dispatch, useEffect, useCallback } from "react";
import type { GameState, Character, InventoryItem, StoryLogEntry, SkillTree, Skill, Reputation, NpcRelationships } from "@/types/game-types";
import type { Action } from "./game-actions";
import { initialState } from "./game-initial-state";
import { gameReducer } from "./game-reducer";
import { THEMES } from "@/lib/themes";
import { SAVED_ADVENTURES_KEY, THEME_ID_KEY, THEME_MODE_KEY, USER_API_KEY_KEY } from "@/lib/constants"; // Import USER_API_KEY_KEY
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

        Object.entries(colors).forEach(([property, value]) => {
            root.style.setProperty(property, value);
        });

        if (isDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
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
                } else {
                    localStorage.removeItem(SAVED_ADVENTURES_KEY);
                }
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

        // Load User API Key
        const savedUserApiKey = localStorage.getItem(USER_API_KEY_KEY);
        if (savedUserApiKey) {
            dispatch({ type: 'SET_USER_API_KEY', payload: savedUserApiKey });
            loadedStateApplied = true;
        }


         if (savedThemeId !== initialState.selectedThemeId || initialDarkMode !== initialState.isDarkMode || (savedUserApiKey && savedUserApiKey !== initialState.userGoogleAiApiKey) ) {
            if (savedThemeId !== initialState.selectedThemeId) dispatch({ type: 'SET_THEME_ID', payload: savedThemeId });
            if (initialDarkMode !== initialState.isDarkMode) dispatch({ type: 'SET_DARK_MODE', payload: initialDarkMode });
            // API key already dispatched if found
            loadedStateApplied = true;
         }

         if (!loadedStateApplied && state.selectedThemeId === initialState.selectedThemeId && state.isDarkMode === initialState.isDarkMode && state.userGoogleAiApiKey === initialState.userGoogleAiApiKey) {
             applyTheme(initialState.selectedThemeId, initialState.isDarkMode);
         }

    }, [applyTheme]); // Only needs applyTheme on initial mount


     // --- Theme Application Effect (Reacting to State Changes) ---
      useEffect(() => {
         applyTheme(state.selectedThemeId, state.isDarkMode);
         // Save theme and mode to localStorage whenever they change in state
         localStorage.setItem(THEME_ID_KEY, state.selectedThemeId);
         localStorage.setItem(THEME_MODE_KEY, state.isDarkMode ? 'dark' : 'light');
      }, [state.selectedThemeId, state.isDarkMode, applyTheme]);

      // --- API Key Persistence Effect ---
      useEffect(() => {
        if (state.userGoogleAiApiKey) {
            localStorage.setItem(USER_API_KEY_KEY, state.userGoogleAiApiKey);
        } else {
            localStorage.removeItem(USER_API_KEY_KEY);
        }
      }, [state.userGoogleAiApiKey]);


   // Log state changes
   useEffect(() => {
      const currentStageName = state.character?.skillTreeStage !== undefined && state.character?.skillTree
          ? state.character.skillTree.stages[state.character.skillTreeStage]?.stageName ?? `Stage ${state.character.skillTreeStage}`
          : "Potential";
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
         apiKeySet: !!state.userGoogleAiApiKey, // Log if API key is set
         storyLogLength: state.storyLog.length,
         isGeneratingSkillTree: state.isGeneratingSkillTree,
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
