
// src/context/GameContext.tsx
"use client";

import type { ReactNode } from "react";
import React, { createContext, useContext, useReducer, Dispatch, useEffect, useCallback } from "react";
import type { GameState, FirestoreCoopSession } from "@/types/game-types";
import type { Action } from "./game-actions";
import { initialState } from "./game-initial-state";
import { gameReducer } from "./game-reducer";
import { THEMES } from "@/lib/themes";
import { SAVED_ADVENTURES_KEY, THEME_ID_KEY, THEME_MODE_KEY, USER_API_KEY_KEY } from "@/lib/constants";
import type { SavedAdventure } from "@/types/adventure-types";
import { auth } from '@/lib/firebase';
import type { User } from 'firebase/auth';
import { signInAnonymously } from "firebase/auth"; // Import signInAnonymously
import { listenToSessionUpdates } from "@/services/multiplayer-service";


const GameContext = createContext<{ state: GameState; dispatch: Dispatch<Action> } | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

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

    useEffect(() => {
        console.log("GameProvider mounted. Attempting to load saved data.");
        let loadedStateApplied = false;
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
         const savedThemeId = localStorage.getItem(THEME_ID_KEY) || initialState.selectedThemeId;
         const savedMode = localStorage.getItem(THEME_MODE_KEY);
         const prefersDark = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : false;
         const initialDarkMode = savedMode === 'dark' || (!savedMode && prefersDark);
        const savedUserApiKey = localStorage.getItem(USER_API_KEY_KEY);
        if (savedUserApiKey) {
            dispatch({ type: 'SET_USER_API_KEY', payload: savedUserApiKey });
            loadedStateApplied = true;
        }
         if (savedThemeId !== initialState.selectedThemeId || initialDarkMode !== initialState.isDarkMode || (savedUserApiKey && savedUserApiKey !== initialState.userGoogleAiApiKey) ) {
            if (savedThemeId !== initialState.selectedThemeId) dispatch({ type: 'SET_THEME_ID', payload: savedThemeId });
            if (initialDarkMode !== initialState.isDarkMode) dispatch({ type: 'SET_DARK_MODE', payload: initialDarkMode });
            loadedStateApplied = true;
         }
         if (!loadedStateApplied && state.selectedThemeId === initialState.selectedThemeId && state.isDarkMode === initialState.isDarkMode && state.userGoogleAiApiKey === initialState.userGoogleAiApiKey) {
             applyTheme(initialState.selectedThemeId, initialState.isDarkMode);
         }
        const unsubscribeAuth = auth.onAuthStateChanged(async (user: User | null) => { // Make async
            if (user) {
                console.log("GameProvider: Firebase Auth user signed in:", user.uid);
                dispatch({ type: 'SET_CURRENT_PLAYER_UID', payload: user.uid });
            } else {
                console.log("GameProvider: Firebase Auth user signed out or no user. Attempting anonymous sign-in.");
                try {
                    const userCredential = await signInAnonymously(auth);
                    console.log("GameProvider: Signed in anonymously:", userCredential.user.uid);
                    // onAuthStateChanged will fire again with the new anonymous user,
                    // so dispatching SET_CURRENT_PLAYER_UID here might be redundant
                    // but it doesn't hurt.
                    dispatch({ type: 'SET_CURRENT_PLAYER_UID', payload: userCredential.user.uid });
                } catch (error) {
                    console.error("GameProvider: Error signing in anonymously:", error);
                    dispatch({ type: 'SET_CURRENT_PLAYER_UID', payload: null }); // Ensure UID is null on failure
                }
            }
        });
        return () => {
            unsubscribeAuth();
        };
    }, [applyTheme]); // applyTheme is stable due to useCallback

      useEffect(() => {
         applyTheme(state.selectedThemeId, state.isDarkMode);
         localStorage.setItem(THEME_ID_KEY, state.selectedThemeId);
         localStorage.setItem(THEME_MODE_KEY, state.isDarkMode ? 'dark' : 'light');
      }, [state.selectedThemeId, state.isDarkMode, applyTheme]);

      useEffect(() => {
        if (state.userGoogleAiApiKey) {
            localStorage.setItem(USER_API_KEY_KEY, state.userGoogleAiApiKey);
        } else {
            localStorage.removeItem(USER_API_KEY_KEY);
        }
      }, [state.userGoogleAiApiKey]);

    // Effect for listening to Firestore session updates
    useEffect(() => {
        let unsubscribeSession: (() => void) | undefined;

        if (state.sessionId && (state.status === "CoopLobby" || state.status === "CoopGameplay")) {
            console.log(`GameContext: Listening to session updates for sessionId: ${state.sessionId}`);
            unsubscribeSession = listenToSessionUpdates(state.sessionId, (sessionData: FirestoreCoopSession | null) => {
                if (sessionData) {
                    console.log("GameContext: Firestore session data received:", sessionData);
                    // Dispatch an action to sync the relevant parts of the session data
                    // This needs to be more granular to avoid overwriting local optimistic updates
                    dispatch({ type: "SYNC_COOP_SESSION_STATE", payload: sessionData });

                    // Example: If session status from Firestore is 'playing' and local is 'CoopLobby', transition
                    if (sessionData.status === 'playing' && state.status === 'CoopLobby') {
                        dispatch({
                            type: "SET_ADVENTURE_SETTINGS",
                            payload: {
                                ...sessionData.adventureSettings, // Sync adventure settings
                                adventureType: "Coop"
                            }
                        });
                        dispatch({ type: "SET_GAME_STATUS", payload: "CoopGameplay" });
                    }
                } else {
                    console.log("GameContext: Session data is null (deleted or error).");
                    // Handle session deletion or error, e.g., redirect to main menu
                    if (state.status === "CoopLobby" || state.status === "CoopGameplay") {
                         dispatch({ type: "RESET_GAME" }); // Or a more specific "SESSION_ENDED" action
                    }
                }
            });
        }
        return () => {
            if (unsubscribeSession) {
                console.log(`GameContext: Unsubscribing from session updates for sessionId: ${state.sessionId}`);
                unsubscribeSession();
            }
        };
    }, [state.sessionId, state.status, dispatch]);


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
         health: `${state.character?.currentHealth}/${state.character?.maxHealth}`,
         actionStamina: `${state.character?.currentStamina}/${state.character?.maxStamina}`, // Changed from stamina to actionStamina for clarity
         mana: `${state.character?.currentMana}/${state.character?.maxMana}`,
         adventureId: state.currentAdventureId,
         settings: state.adventureSettings,
         inventory: inventoryString,
         theme: `${state.selectedThemeId} (${state.isDarkMode ? 'Dark' : 'Light'})`,
         apiKeySet: !!state.userGoogleAiApiKey,
         storyLogLength: state.storyLog.length,
         isGeneratingSkillTree: state.isGeneratingSkillTree,
         // Multiplayer log
         sessionId: state.sessionId,
         players: state.players,
         currentPlayerUid: state.currentPlayerUid,
         isHost: state.isHost,
      });
   }, [state]);


  return (
    <GameContext.Provider value={{ state, dispatch }}>
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


      