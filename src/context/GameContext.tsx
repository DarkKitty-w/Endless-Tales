// src/context/GameContext.tsx
"use client";

import type { ReactNode } from "react";
import React, { createContext, useContext, useReducer, Dispatch, useEffect, useCallback, useMemo, useRef } from "react";
import type { GameState, GameStatus } from "../types/game-types";
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
import { logger } from "@/lib/logger";
import { toast } from "../hooks/use-toast";
import { validateSavedAdventure, SavedAdventureSchema } from "./schemas/save-schema";
import { runMigrations, getPendingMigrations } from "./schemas/migration-system";
import { atomicLocalStorageWrite, safeLocalStorageRead, isLocalStorageQuotaLow, checkSaveSize, sanitizeStateForPersistence, repairSaveData } from "@/lib/storage-utils";

// Storage keys
const AI_PROVIDER_KEY = "endlessTales_aiProvider";
const PROVIDER_API_KEYS_KEY = "endlessTales_providerApiKeys";

// Split contexts by domain to prevent unnecessary re-renders
const AdventureContext = createContext<{
  status: GameStatus;
  adventureSettings: any;
  currentNarration: any;
  storyLog: any[];
  adventureSummary: string | null;
  currentGameStateString: string;
  currentAdventureId: string | null;
  savedAdventures: SavedAdventure[];
  isGeneratingSkillTree: boolean;
  turnCount: number;
  worldMap: any;
  dispatch: Dispatch<Action>;
} | undefined>(undefined);

const CharacterContext = createContext<{
  character: any;
  dispatch: Dispatch<Action>;
} | undefined>(undefined);

const InventoryContext = createContext<{
  inventory: any[];
  dispatch: Dispatch<Action>;
} | undefined>(undefined);

const SettingsContext = createContext<{
  selectedThemeId: string;
  isDarkMode: boolean;
  userGoogleAiApiKey: string | null;
  aiProvider: ProviderType;
  providerApiKeys: Partial<Record<ProviderType, string>>;
  dispatch: Dispatch<Action>;
} | undefined>(undefined);

const MultiplayerContext = createContext<{
  sessionId: string | null;
  players: string[];
  isHost: boolean;
  peerId: string;
  connectionStatus: any;
  turnOrder: string[];
  currentTurnIndex: number;
  isMyTurn: boolean;
  pendingInteraction: any;
  partyState: Record<string, any>;
  chatMessages: any[];
  isPaused: boolean;
  dispatch: Dispatch<Action>;
} | undefined>(undefined);

// Main context for backward compatibility - DEPRECATED, use domain contexts instead
const GameContext = createContext<{ state: GameState; dispatch: Dispatch<Action> } | undefined>(undefined);

/**
 * Migrate a saved adventure to the current schema version.
 * Validates required fields using Zod schema validation.
 * Runs all necessary migrations to bring the save to the current version.
 * SAVE-13 Fix: Sanitizes loaded adventure to remove any multiplayer fields.
 * SAVE-15 Fix: Attempts to repair partially corrupted save data.
 */
function migrateSavedAdventure(adventure: any, onError?: (title: string, description: string) => void): SavedAdventure | null {
  // Validate using Zod schema
  const validationResult = validateSavedAdventure(adventure);
  
  if (!validationResult.success) {
    logger.error('Schema validation failed for adventure:', { 
      adventureId: adventure.id, 
      error: validationResult.error 
    });
    
    // SAVE-15 Fix: Attempt to repair the corrupted save data
    logger.log('Attempting to repair corrupted save data...');
    const repaired = repairSaveData(adventure, {
      characterName: 'Unknown Hero',
      character: { name: 'Unknown Hero', class: 'Adventurer', level: 1 },
      adventureSettings: { adventureType: null, permanentDeath: false, difficulty: 'normal' },
      storyLog: [],
      currentGameStateString: JSON.stringify({}),
      inventory: [],
      worldMap: { locations: [], currentLocationId: null },
    });
    
    if (repaired) {
      logger.log('Successfully repaired corrupted save data for adventure:', repaired.id);
      if (onError) {
        onError(
          "Save Data Repaired", 
          `Save data was corrupted but has been repaired. Some data may have been restored from defaults.`
        );
      }
      // Continue with the repaired data
      try {
        const migrated = runMigrations(repaired);
        const pendingMigs = getPendingMigrations(repaired);
        if (pendingMigs.length > 0) {
          logger.log(`Applied migrations to repaired save: ${pendingMigs.map(v => `v${v}->v${v+1}`).join(', ')}`);
        }
        const sanitized = sanitizeStateForPersistence(migrated);
        return sanitized as SavedAdventure;
      } catch (error: any) {
        logger.error('Migration failed for repaired adventure:', error);
      }
    }
    
    // If repair failed or wasn't possible, show error
    if (onError) {
      onError(
        "Invalid Save Data", 
        `Save data validation failed: ${validationResult.error}. This save cannot be loaded.`
      );
    }
    return null; // Return null to indicate validation failure
  }

  try {
    // Run all necessary migrations
    const migrated = runMigrations(validationResult.data);
    
    // Log pending migrations (for debugging)
    const pendingMigs = getPendingMigrations(validationResult.data);
    if (pendingMigs.length > 0) {
      logger.log(`Applied migrations: ${pendingMigs.map(v => `v${v}->v${v+1}`).join(', ')}`);
    }
    
    // SAVE-13 Fix: Sanitize migrated adventure to remove any multiplayer fields
    // that might have been added to the save (from older versions or bugs)
    const sanitized = sanitizeStateForPersistence(migrated);
    
    return sanitized as SavedAdventure;
  } catch (error: any) {
    // ERR-21 Fix: Surface migration errors to user
    logger.error('Migration failed for adventure:', { adventureId: adventure.id, error: error.message });
    if (onError) {
      onError("Save Data Migration Failed", `Failed to migrate save data${adventure.id ? ` for adventure ${adventure.id}` : ''}. ${error.message || 'Unknown error'}`);
    }
    // Return null if migration fails
    return null;
  }
}

export const GameProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const [state, rawDispatch] = useReducer(gameReducer, initialState);
  const [isInitializing, setIsInitializing] = React.useState(true);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // PERF-3 Fix: Wrap dispatch to clean up WebRTC queue processor on RESET_GAME
  const dispatch: Dispatch<Action> = useCallback((action: Action) => {
    if (action.type === 'RESET_GAME') {
      // Dynamic import to avoid circular dependency
      import('@/lib/webrtc-signalling').then(({ cleanupQueueProcessor }) => {
        cleanupQueueProcessor();
      }).catch(() => {
        // Ignore errors - webrtc-signalling might not be available
      });
    }
    rawDispatch(action);
  }, [rawDispatch]);

  const applyTheme = useCallback((themeId: string, isDark: boolean) => {
    const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
    const colors = isDark ? theme.dark : theme.light;
    const root = document.documentElement;
    if (!root) return;
    
    // Clear ALL theme CSS custom properties from all themes to prevent accumulation
    const allProps = new Set<string>();
    THEMES.forEach(t => {
      Object.keys(t.light).forEach(prop => allProps.add(prop));
      Object.keys(t.dark).forEach(prop => allProps.add(prop));
    });
    allProps.forEach(prop => {
      root.style.removeProperty(prop);
    });
    
    // Apply new theme properties
    Object.entries(colors).forEach(([prop, val]) => {
      root.style.setProperty(prop, val);
    });
    
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  // Load initial data from storage (runs once on mount)
  useEffect(() => {
    logger.log("GameProvider initializing...");

    // Load saved adventures from localStorage
    try {
      const savedData = localStorage.getItem(SAVED_ADVENTURES_KEY);
      if (savedData) {
        const loadedAdventures: any[] = JSON.parse(savedData);
        if (Array.isArray(loadedAdventures)) {
          // ERR-21 Fix: Pass toast callback to surface migration errors
          const migrationErrorCallback = (title: string, description: string) => {
            toast({
              title,
              description,
              variant: "destructive",
            });
          };
          
          // Migrate each adventure to current schema version
          const migratedAdventures = loadedAdventures
            .map(adv => migrateSavedAdventure(adv, migrationErrorCallback))
            .filter((adv): adv is SavedAdventure => adv !== null); // Filter out invalid adventures
          
          if (migratedAdventures.length < loadedAdventures.length) {
            toast({
              title: "Some Saves Invalid",
              description: `${loadedAdventures.length - migratedAdventures.length} save(s) could not be loaded due to invalid data.`,
              variant: "destructive",
            });
          }
          
          dispatch({ type: "LOAD_SAVED_ADVENTURES", payload: migratedAdventures });
        } else {
          // ERR-18/ERR-20 Fix: Offer recovery options for invalid data format
          toast({
            title: "Invalid Save Data Format",
            description: "Your saved adventures data is not in the expected format. Would you like to delete it?",
            variant: "destructive",
            action: (
              <button
                onClick={() => {
                  localStorage.removeItem(SAVED_ADVENTURES_KEY);
                  toast({ title: "Save Data Deleted", description: "Corrupted save data has been removed." });
                }}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            ),
          });
        }
      }
    } catch (error) {
      logger.error("Failed to load saved adventures:", error);
      
      // ERR-18/ERR-20/ERR-21 Fix: Provide detailed error and recovery options
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const isCorrupted = errorMessage.includes('JSON') || errorMessage.includes('parse');
      
      // SAVE-7 Fix: Backup corrupted data before removing
      let backupKey: string | null = null;
      if (isCorrupted) {
        try {
          const rawData = localStorage.getItem(SAVED_ADVENTURES_KEY);
          if (rawData) {
            // Create backup key with timestamp
            backupKey = `endlessTalesCorruptedBackup_${Date.now()}`;
            localStorage.setItem(backupKey, rawData);
            logger.log(`Backed up corrupted save data to ${backupKey}`);
          }
        } catch (backupError) {
          logger.error("Failed to backup corrupted data:", backupError);
        }
      }
      
      toast({
        title: isCorrupted ? "Corrupted Save Data" : "Error Loading Saved Adventures",
        description: isCorrupted 
          ? "Your saved adventures data appears to be corrupted. A backup has been created for recovery."
          : "There was a problem loading your saved adventures.",
        variant: "destructive",
      });
      
      // ERR-21 Fix: Log the problematic data for debugging (safely truncated)
      if (isCorrupted) {
        try {
          const rawData = localStorage.getItem(SAVED_ADVENTURES_KEY);
          logger.error("Corrupted save data (first 500 chars):", rawData?.substring(0, 500));
        } catch (e) {
          logger.error("Could not read corrupted data for debugging");
        }
      }
      
      // SAVE-7 Fix: Offer recovery option with backup
      toast({
        title: "Data Recovery",
        description: backupKey 
          ? "A backup of your corrupted save data has been created. Would you like to delete the corrupted data?"
          : "Would you like to delete the corrupted save data?",
        action: (
          <button
            onClick={() => {
              localStorage.removeItem(SAVED_ADVENTURES_KEY);
              toast({ 
                title: "Save Data Deleted", 
                description: backupKey 
                  ? `Corrupted data has been removed. Backup available at: ${backupKey}`
                  : "Corrupted save data has been removed. You can start a new adventure." 
              });
            }}
            className="bg-red-500 text-white px-3 py-1 rounded"
          >
            Delete Corrupted Data
          </button>
        ),
      });
    }

    // Load theme from localStorage
    const savedThemeId = localStorage.getItem(THEME_ID_KEY) || initialState.selectedThemeId;
    const savedMode = localStorage.getItem(THEME_MODE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDarkMode = savedMode === 'dark' || (savedMode === null && prefersDark);

    // Load AI provider preference
    const savedProvider = localStorage.getItem(AI_PROVIDER_KEY) as ProviderType | null;
    if (savedProvider && ['gemini', 'openai', 'claude', 'deepseek'].includes(savedProvider)) {
      dispatch({ type: 'SET_AI_PROVIDER', payload: savedProvider });
    }

    // Note: API keys are now server-side only for security (no client-side storage)

    dispatch({ type: 'SET_THEME_ID', payload: savedThemeId });
    dispatch({ type: 'SET_DARK_MODE', payload: initialDarkMode });

    // Theme will be applied by the persistence effect after state update
    
    // Mark initialization as complete
    setIsInitializing(false);
  }, []); // Empty deps – runs once

  // Note: AI router no longer needs client-side configuration (server-side keys only)

  // Consolidated persistence hook with debouncing (storage writes only)
  useEffect(() => {
    // Clear any pending debounce
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Debounce writes to avoid excessive I/O
    debounceTimeoutRef.current = setTimeout(() => {
      try {
        // Theme
        applyTheme(state.selectedThemeId, state.isDarkMode);
        localStorage.setItem(THEME_ID_KEY, state.selectedThemeId);
        localStorage.setItem(THEME_MODE_KEY, state.isDarkMode ? 'dark' : 'light');

        // SAVE-8 Fix: Check if storage is getting full
        if (isLocalStorageQuotaLow()) {
          toast({
            title: "Storage Nearly Full",
            description: "Your browser storage is almost full. Consider deleting old saves.",
            variant: "destructive",
          });
        }

        // Saved adventures (localStorage)
        // SAVE-16 Fix: Validate saves before writing
        // SAVE-6 Fix: Use atomic writes
        const invalidSaves: string[] = [];
        const validSaves = state.savedAdventures.filter((adventure: SavedAdventure) => {
          const validation = validateSavedAdventure(adventure);
          if (!validation.success) {
            invalidSaves.push(adventure.id || 'unknown');
            logger.error('Skipping invalid save during persist:', { 
              adventureId: adventure.id, 
              error: validation.error 
            });
            return false;
          }
          return true;
        });

        if (invalidSaves.length > 0) {
          toast({
            title: "Invalid Saves Detected",
            description: `${invalidSaves.length} save(s) failed validation and will not be persisted: ${invalidSaves.join(', ')}`,
            variant: "destructive",
          });
        }

        // SAVE-6: Atomic write for saves
        // SAVE-10 Fix: Check save sizes and warn if too large
        const oversizedSaves: string[] = [];
        const sizeWarnings: string[] = [];
        
        validSaves.forEach((adventure: SavedAdventure) => {
          const sizeCheck = checkSaveSize(adventure);
          if (sizeCheck.isTooLarge) {
            oversizedSaves.push(`${adventure.characterName || adventure.id} (${sizeCheck.sizeFormatted})`);
          } else if (sizeCheck.isApproachingLimit) {
            sizeWarnings.push(`${adventure.characterName || adventure.id} (${sizeCheck.sizeFormatted})`);
          }
        });
        
        if (oversizedSaves.length > 0) {
          toast({
            title: "Saves Too Large",
            description: `The following saves exceed size limits and won't be saved: ${oversizedSaves.join(', ')}. Consider deleting old story log entries.`,
            variant: "destructive",
          });
          // Filter out oversized saves
          const fitsSaves = validSaves.filter((adv: SavedAdventure) => {
            const sizeCheck = checkSaveSize(adv);
            return !sizeCheck.isTooLarge;
          });
          const saveSuccess = atomicLocalStorageWrite(SAVED_ADVENTURES_KEY, fitsSaves);
          if (!saveSuccess) {
            throw new Error('Atomic write failed for saved adventures');
          }
        } else {
          if (sizeWarnings.length > 0) {
            toast({
              title: "Large Saves Warning",
              description: `The following saves are approaching size limits: ${sizeWarnings.join(', ')}. Consider reducing story log size.`,
            });
          }
          
          const saveSuccess = atomicLocalStorageWrite(SAVED_ADVENTURES_KEY, validSaves);
          if (!saveSuccess) {
            throw new Error('Atomic write failed for saved adventures');
          }
        }

        // AI provider preference (localStorage)
        localStorage.setItem(AI_PROVIDER_KEY, state.aiProvider);

        // Note: API keys are now server-side only (no client-side storage)
      } catch (storageError) {
        // ERR-22/ERR-24 Fix: Handle localStorage errors
        logger.error("Failed to save to localStorage:", storageError);
        
        // Check if it's a quota exceeded error
        const isQuotaExceeded = storageError instanceof DOMException && 
          (storageError.code === 22 || storageError.name === 'QuotaExceededError');
        
        toast({
          title: "Save Failed",
          description: isQuotaExceeded 
            ? "Storage full. Please delete some saved adventures to free up space." 
            : "Failed to save your progress. Your changes may not persist.",
          variant: "destructive",
          action: isQuotaExceeded ? (
            <button
              onClick={() => {
                if (confirm("This will delete all saved adventures except the current one. Continue?")) {
                  try {
                    localStorage.removeItem(SAVED_ADVENTURES_KEY);
                    toast({ title: "Save Data Cleared", description: "You can now save new adventures." });
                  } catch (e) {
                    logger.error("Failed to clear save data:", e);
                  }
                }
              }}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Clear Saves
            </button>
          ) : undefined,
        });
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
      logger.log("Game State Updated:", {
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

  // Memoize each domain context value separately
  const adventureContextValue = useMemo(() => ({
    status: state.status,
    adventureSettings: state.adventureSettings,
    currentNarration: state.currentNarration,
    storyLog: state.storyLog,
    adventureSummary: state.adventureSummary,
    currentGameStateString: state.currentGameStateString,
    currentAdventureId: state.currentAdventureId,
    savedAdventures: state.savedAdventures,
    isGeneratingSkillTree: state.isGeneratingSkillTree,
    turnCount: state.turnCount,
    worldMap: state.worldMap,
    dispatch,
  }), [
    state.status,
    state.adventureSettings,
    state.currentNarration,
    state.storyLog,
    state.adventureSummary,
    state.currentGameStateString,
    state.currentAdventureId,
    state.savedAdventures,
    state.isGeneratingSkillTree,
    state.turnCount,
    state.worldMap,
    dispatch
  ]);

  const characterContextValue = useMemo(() => ({
    character: state.character,
    dispatch,
  }), [state.character, dispatch]);

  const inventoryContextValue = useMemo(() => ({
    inventory: state.inventory,
    dispatch,
  }), [state.inventory, dispatch]);

  const settingsContextValue = useMemo(() => ({
    selectedThemeId: state.selectedThemeId,
    isDarkMode: state.isDarkMode,
    userGoogleAiApiKey: state.userGoogleAiApiKey,
    aiProvider: state.aiProvider,
    providerApiKeys: state.providerApiKeys,
    dispatch,
  }), [
    state.selectedThemeId,
    state.isDarkMode,
    state.userGoogleAiApiKey,
    state.aiProvider,
    state.providerApiKeys,
    dispatch
  ]);

  const multiplayerContextValue = useMemo(() => ({
    sessionId: state.sessionId,
    players: state.players,
    isHost: state.isHost,
    peerId: state.peerId,
    connectionStatus: state.connectionStatus,
    turnOrder: state.turnOrder,
    currentTurnIndex: state.currentTurnIndex,
    isMyTurn: state.isMyTurn,
    pendingInteraction: state.pendingInteraction,
    partyState: state.partyState,
    chatMessages: state.chatMessages,
    isPaused: state.isPaused,
    dispatch,
  }), [
    state.sessionId,
    state.players,
    state.isHost,
    state.peerId,
    state.connectionStatus,
    state.turnOrder,
    state.currentTurnIndex,
    state.isMyTurn,
    state.pendingInteraction,
    state.partyState,
    state.chatMessages,
    state.isPaused,
    dispatch
  ]);

  // Backward compatibility context value
  const gameContextValue = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  // Show loading spinner while initializing
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AdventureContext.Provider value={adventureContextValue}>
      <CharacterContext.Provider value={characterContextValue}>
        <InventoryContext.Provider value={inventoryContextValue}>
          <SettingsContext.Provider value={settingsContextValue}>
            <MultiplayerContext.Provider value={multiplayerContextValue}>
              <GameContext.Provider value={gameContextValue}>
                {children}
              </GameContext.Provider>
            </MultiplayerContext.Provider>
          </SettingsContext.Provider>
        </InventoryContext.Provider>
      </CharacterContext.Provider>
    </AdventureContext.Provider>
  );
};

// Domain-specific hooks for optimized rendering
export const useAdventure = () => {
  const context = useContext(AdventureContext);
  if (context === undefined) {
    throw new Error("useAdventure must be used within a GameProvider");
  }
  return context;
};

export const useCharacter = () => {
  const context = useContext(CharacterContext);
  if (context === undefined) {
    throw new Error("useCharacter must be used within a GameProvider");
  }
  return context;
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error("useInventory must be used within a GameProvider");
  }
  return context;
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a GameProvider");
  }
  return context;
};

export const useMultiplayer = () => {
  const context = useContext(MultiplayerContext);
  if (context === undefined) {
    throw new Error("useMultiplayer must be used within a GameProvider");
  }
  return context;
};

// Backward compatibility hook - DEPRECATED, use domain hooks instead
export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};