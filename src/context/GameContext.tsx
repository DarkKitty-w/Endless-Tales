// src/context/GameContext.tsx
"use client";

import type { ReactNode } from "react";
import React, { createContext, useContext, useReducer, Dispatch, useEffect, useCallback, useMemo, useRef } from "react";
import type { GameState } from "../types/game-types";
import type { Action } from "./game-actions";
import { initialState, CURRENT_STATE_VERSION } from "./game-initial-state";
import { gameReducer } from "./game-reducer";
import { THEMES } from "../lib/themes";
import {
  SAVED_ADVENTURES_KEY,
  THEME_ID_KEY,
  THEME_MODE_KEY,
  USER_API_KEY_KEY,
} from "../lib/constants";
import type { SavedAdventure } from "../types/adventure-types";
import { configureAIRouter, type ProviderType } from "../ai/ai-router";

// Storage keys
const AI_PROVIDER_KEY = "endlessTales_aiProvider";
const PROVIDER_API_KEYS_KEY = "endlessTales_providerApiKeys";

const GameContext = createContext<{ state: GameState; dispatch: Dispatch<Action> } | undefined>(undefined);

/**
 * Migrate a saved adventure to the current schema version.
 */
function migrateSavedAdventure(adventure: any): SavedAdventure {
  // If no version, treat as version 0 (pre-versioning)
  const version = adventure.version ?? 0;

  // Clone to avoid mutating original
  const migrated = { ...adventure };

  // Version 0 -> 1: ensure worldMap exists
  if (version < 1) {
    if (!migrated.worldMap) {
      migrated.worldMap = initialState.worldMap;
    }
    // Other future migrations can be added here
  }

  migrated.version = CURRENT_STATE_VERSION;
  return migrated as SavedAdventure;
}

export const GameProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const applyTheme = useCallback((themeId: string, isDark: boolean) => {
    const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
    const colors = isDark ? theme.dark : theme.light;
    const root = document.documentElement;
    if (!root) return;
    const cssText = Object.entries(colors).map(([prop, val]) => `${prop}: ${val};`).join(' ');
    root.style.cssText += cssText;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  // Load initial data from storage (runs once on mount)
  useEffect(() => {
    console.log("GameProvider initializing...");

    // Load saved adventures from localStorage
    try {
      const savedData = localStorage.getItem(SAVED_ADVENTURES_KEY);
      if (savedData) {
        const loadedAdventures: any[] = JSON.parse(savedData);
        if (Array.isArray(loadedAdventures)) {
          // Migrate each adventure to current schema version
          const migratedAdventures = loadedAdventures.map(migrateSavedAdventure);
          dispatch({ type: "LOAD_SAVED_ADVENTURES", payload: migratedAdventures });
        } else {
          localStorage.removeItem(SAVED_ADVENTURES_KEY);
        }
      }
    } catch (error) {
      console.error("Failed to load saved adventures:", error);
      localStorage.removeItem(SAVED_ADVENTURES_KEY);
    }

    // Load theme from localStorage
    const savedThemeId = localStorage.getItem(THEME_ID_KEY) || initialState.selectedThemeId;
    const savedMode = localStorage.getItem(THEME_MODE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDarkMode = savedMode === 'dark' || (savedMode === null && prefersDark);

    // Load API key from sessionStorage (more secure, cleared on session end)
    const savedUserApiKey = sessionStorage.getItem(USER_API_KEY_KEY);
    if (savedUserApiKey) {
      dispatch({ type: 'SET_USER_API_KEY', payload: savedUserApiKey });
    }

    // Load AI provider preference
    const savedProvider = localStorage.getItem(AI_PROVIDER_KEY) as ProviderType | null;
    if (savedProvider && ['gemini', 'openai', 'claude', 'deepseek'].includes(savedProvider)) {
      dispatch({ type: 'SET_AI_PROVIDER', payload: savedProvider });
    }

    // Load provider API keys from sessionStorage (moved from localStorage for security)
    try {
      const savedKeys = sessionStorage.getItem(PROVIDER_API_KEYS_KEY);
      if (savedKeys) {
        const keys = JSON.parse(savedKeys);
        Object.entries(keys).forEach(([provider, key]) => {
          if (key && typeof key === 'string') {
            dispatch({ type: 'SET_PROVIDER_API_KEY', payload: { provider: provider as ProviderType, apiKey: key } });
          }
        });
      }
      // Clean up any old keys from localStorage (migration)
      if (localStorage.getItem(PROVIDER_API_KEYS_KEY)) {
        localStorage.removeItem(PROVIDER_API_KEYS_KEY);
      }
    } catch (e) {
      console.error("Failed to load provider API keys:", e);
    }

    dispatch({ type: 'SET_THEME_ID', payload: savedThemeId });
    dispatch({ type: 'SET_DARK_MODE', payload: initialDarkMode });

    // Theme will be applied by the persistence effect after state update
  }, []); // Empty deps – runs once

  // NEW: Immediate AI router configuration (no debounce)
  useEffect(() => {
    configureAIRouter({
      defaultProvider: state.aiProvider,
      apiKeys: state.providerApiKeys,
    });
  }, [state.aiProvider, state.providerApiKeys]);

  // Consolidated persistence hook with debouncing (storage writes only)
  useEffect(() => {
    // Clear any pending debounce
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Debounce writes to avoid excessive I/O
    debounceTimeoutRef.current = setTimeout(() => {
      // Theme
      applyTheme(state.selectedThemeId, state.isDarkMode);
      localStorage.setItem(THEME_ID_KEY, state.selectedThemeId);
      localStorage.setItem(THEME_MODE_KEY, state.isDarkMode ? 'dark' : 'light');

      // Google AI key (sessionStorage)
      if (state.userGoogleAiApiKey) {
        sessionStorage.setItem(USER_API_KEY_KEY, state.userGoogleAiApiKey);
      } else if (state.userGoogleAiApiKey === null) {
        sessionStorage.removeItem(USER_API_KEY_KEY);
      }

      // Saved adventures (localStorage)
      localStorage.setItem(SAVED_ADVENTURES_KEY, JSON.stringify(state.savedAdventures));

      // AI provider preference (localStorage)
      localStorage.setItem(AI_PROVIDER_KEY, state.aiProvider);

      // Provider API keys (sessionStorage)
      if (Object.keys(state.providerApiKeys).length > 0) {
        sessionStorage.setItem(PROVIDER_API_KEYS_KEY, JSON.stringify(state.providerApiKeys));
      } else {
        sessionStorage.removeItem(PROVIDER_API_KEYS_KEY);
      }

      // REMOVED: configureAIRouter call – now handled by immediate effect above

      debounceTimeoutRef.current = null;
    }, 300);

    // Cleanup timeout on unmount or before next effect run
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }
    };
  }, [
    state.selectedThemeId,
    state.isDarkMode,
    state.userGoogleAiApiKey,
    state.savedAdventures,
    // state.aiProvider and state.providerApiKeys are no longer in this dependency array
    applyTheme,
  ]);

  // Debug log (development only) - moved to useEffect to avoid running on every render
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const currentStageName = state.character?.skillTreeStage !== undefined && state.character?.skillTree
        ? state.character.skillTree.stages[state.character.skillTreeStage]?.stageName ?? `Stage ${state.character.skillTreeStage}`
        : "Potential";
      const reputationString = state.character ? Object.entries(state.character.reputation).map(([f, s]) => `${f}: ${s}`).join(', ') || 'None' : 'N/A';
      const relationshipString = state.character ? Object.entries(state.character.npcRelationships).map(([n, s]) => `${n}: ${s}`).join(', ') || 'None' : 'N/A';
      const inventoryString = state.inventory.map(i => `${i.name}${i.quality ? ` (${i.quality})` : ''}`).join(', ') || 'Empty';
      console.log("Game State Updated:", {
        version: state.version,
        status: state.status,
        turn: state.turnCount,
        character: state.character?.name,
        level: state.character?.level,
        xp: `${state.character?.xp}/${state.character?.xpToNextLevel}`,
        reputation: reputationString,
        relationships: relationshipString,
        class: state.character?.class,
        stage: `${currentStageName} (${state.character?.skillTreeStage ?? 0}/4)`,
        health: `${state.character?.currentHealth}/${state.character?.maxHealth}`,
        actionStamina: `${state.character?.currentStamina}/${state.character?.maxStamina}`,
        mana: `${state.character?.currentMana}/${state.character?.maxMana}`,
        adventureId: state.currentAdventureId,
        settings: state.adventureSettings,
        inventory: inventoryString,
        theme: `${state.selectedThemeId} (${state.isDarkMode ? 'Dark' : 'Light'})`,
        apiKeySet: !!state.userGoogleAiApiKey,
        storyLogLength: state.storyLog.length,
        isGeneratingSkillTree: state.isGeneratingSkillTree,
        aiProvider: state.aiProvider,
        providerKeysCount: Object.keys(state.providerApiKeys).length,
      });
    }
  }, [state.version, state.status, state.turnCount, state.character, state.inventory, state.selectedThemeId, state.isDarkMode, state.userGoogleAiApiKey, state.storyLog.length, state.isGeneratingSkillTree, state.aiProvider, state.providerApiKeys]);

  const contextValue = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};