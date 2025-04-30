// src/context/GameContext.tsx
"use client";

import type { ReactNode } from "react";
import React, { createContext, useContext, useReducer, Dispatch, useEffect } from "react";
import type { GenerateCharacterDescriptionOutput } from "@/ai/flows/generate-character-description";
// Remove direct import of NarrateAdventureOutput, use generic object for now
// import type { NarrateAdventureOutput } from "@/ai/flows/narrate-adventure";

export type GameStatus =
  | "MainMenu"
  | "CharacterCreation"
  | "AdventureSetup"
  | "Gameplay"
  | "AdventureSummary"
  | "ViewSavedAdventures"; // New status for viewing saves

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

// Represents an item in the player's inventory
export interface InventoryItem {
    name: string;
    description?: string; // Optional description from AI state
    imageDataUri?: string; // Placeholder for AI generated image
}

// Represents one turn/log entry in the story - Use generic object for AI output payload
export interface StoryLogEntry {
  narration: string;
  updatedGameState: string;
  updatedInventory?: string[]; // Array of item names in the inventory after the turn
  timestamp: number; // Track when the entry occurred
}

// Represents a saved game state snapshot
export interface SavedAdventure {
    id: string; // Unique ID for the save (e.g., timestamp or UUID)
    saveTimestamp: number;
    characterName: string;
    // Store the state relevant for resuming or viewing summary
    character: Character;
    adventureSettings: AdventureSettings;
    storyLog: StoryLogEntry[];
    currentGameStateString: string; // State at the point of saving
    inventory: InventoryItem[]; // Save inventory state
    statusBeforeSave?: GameStatus; // Status when saved (e.g., Gameplay)
    adventureSummary?: string | null; // If saved after finishing
}


export interface GameState {
  status: GameStatus;
  character: Character | null;
  adventureSettings: AdventureSettings;
  currentNarration: StoryLogEntry | null; // The very latest narration received
  storyLog: StoryLogEntry[]; // Log of all narrations for summary/review
  adventureSummary: string | null;
  currentGameStateString: string; // Game state string for AI narration flow input
  inventory: InventoryItem[]; // Player's current inventory
  savedAdventures: SavedAdventure[]; // Array to hold saved games
  currentAdventureId: string | null; // ID of the adventure currently being played/saved
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
  inventory: [], // Start with empty inventory
  savedAdventures: [], // Initialize as empty, will load from storage
  currentAdventureId: null,
};

// --- LocalStorage Keys ---
const SAVED_ADVENTURES_KEY = "endlessTalesSavedAdventures";

// --- Action Definitions ---

type Action =
  | { type: "SET_GAME_STATUS"; payload: GameStatus }
  | { type: "CREATE_CHARACTER"; payload: Partial<Character> } // Accepts partial character data
  | { type: "UPDATE_CHARACTER"; payload: Partial<Character> }
  | { type: "SET_AI_DESCRIPTION"; payload: string } // Action specifically for AI description
  | { type: "SET_ADVENTURE_SETTINGS"; payload: Partial<AdventureSettings> }
  | { type: "START_GAMEPLAY" }
  | { type: "UPDATE_NARRATION"; payload: { narration: string; updatedGameState: string; updatedInventory?: string[] } } // Use generic payload type
  | { type: "END_ADVENTURE"; payload: { summary: string | null; finalNarration?: { narration: string; updatedGameState: string; updatedInventory?: string[] } } }
  | { type: "RESET_GAME" }
  | { type: "LOAD_SAVED_ADVENTURES"; payload: SavedAdventure[] } // Load saves from storage
  | { type: "SAVE_CURRENT_ADVENTURE" } // Save the current game state
  | { type: "LOAD_ADVENTURE"; payload: string } // Load a specific adventure by ID
  | { type: "DELETE_ADVENTURE"; payload: string }; // Delete a specific adventure by ID

// --- Helper Functions ---
function generateAdventureId(): string {
    return `adv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Placeholder function to generate image URIs (replace with actual AI call later)
async function generatePlaceholderImageUri(itemName: string): Promise<string> {
    // Simple hash function to get somewhat consistent dimensions based on item name
    let hash = 0;
    for (let i = 0; i < itemName.length; i++) {
        hash = itemName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const width = 200 + (Math.abs(hash) % 101); // width between 200-300
    const height = 200 + (Math.abs(hash >> 16) % 101); // height between 200-300
    return `https://picsum.photos/${width}/${height}?random=${encodeURIComponent(itemName)}`; // Add item name to query for variation
}


// --- Reducer ---

// Use a temporary state within the reducer to handle async image generation
let isGeneratingImages = false;

async function handleInventoryUpdate(currentState: GameState, updatedItemNames: string[], dispatch: Dispatch<Action>): Promise<Partial<GameState>> {
    if (isGeneratingImages) {
        console.log("Image generation already in progress, skipping.");
        return {}; // Return empty object, no immediate state change
    }

    isGeneratingImages = true;
    const currentInventoryNames = new Set(currentState.inventory.map(item => item.name));
    const newItemsToGenerate = updatedItemNames.filter(name => !currentInventoryNames.has(name));

    if (newItemsToGenerate.length === 0) {
        // Only update inventory if names changed (items removed potentially)
        const updatedInventory = currentState.inventory.filter(item => updatedItemNames.includes(item.name));
         isGeneratingImages = false; // Reset flag
        return { inventory: updatedInventory };
    }

    console.log("Generating images for new items:", newItemsToGenerate);

    try {
        const generationPromises = newItemsToGenerate.map(async (name) => {
            const imageDataUri = await generatePlaceholderImageUri(name);
            return { name, imageDataUri };
        });

        const generatedItems = await Promise.all(generationPromises);

        // Combine old items (that still exist) with newly generated ones
        const finalInventory = [
            ...currentState.inventory.filter(item => updatedItemNames.includes(item.name)), // Keep existing items that are still in the list
            ...generatedItems // Add new items with images
        ];

         isGeneratingImages = false; // Reset flag
        return { inventory: finalInventory };
    } catch (error) {
        console.error("Error generating item images:", error);
        // Keep existing items, add new ones without images as fallback
        const fallbackInventory = [
             ...currentState.inventory.filter(item => updatedItemNames.includes(item.name)),
             ...newItemsToGenerate.map(name => ({ name })) // Add new items without images
        ];
         isGeneratingImages = false; // Reset flag
        return { inventory: fallbackInventory };
    }
}

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
         traits: action.payload.traits ?? [],
         knowledge: action.payload.knowledge ?? [],
      };
      return {
        ...state,
        character: newCharacter,
        status: "AdventureSetup",
        currentAdventureId: null, // Ensure no old ID persists
        storyLog: [],
        currentNarration: null,
        adventureSummary: null,
        inventory: [], // Reset inventory on new character
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
        return state;
      }
       const charDesc = state.character.aiGeneratedDescription || state.character.description || "No description provided.";
       // Initialize with starting items if necessary, e.g., "Basic Clothes"
        const initialItems = [{ name: "Basic Clothes" }];
        const initialInventoryNames = initialItems.map(item => item.name);
        const initialGameState = `Location: Starting Point\nInventory: ${initialInventoryNames.join(', ') || 'Empty'}\nStatus: Healthy\nTime: Day 1, Morning\nQuest: None\nMilestones: None\nCharacter Name: ${state.character.name}\nTraits: ${state.character.traits.join(', ') || 'None'}\nKnowledge: ${state.character.knowledge.join(', ') || 'None'}\nBackground: ${state.character.background || 'None'}\nStats: STR ${state.character.stats.strength}, STA ${state.character.stats.stamina}, AGI ${state.character.stats.agility}\nDescription: ${charDesc}\nAdventure Mode: ${state.adventureSettings.adventureType}, ${state.adventureSettings.permanentDeath ? 'Permadeath' : 'Respawn'}`;
       const adventureId = state.currentAdventureId || generateAdventureId(); // Use existing ID if loading, else generate new

       // Handle initial inventory image generation asynchronously
        if (!state.currentAdventureId && initialItems.length > 0) {
            // We can't directly dispatch from reducer, so we might trigger this after START_GAMEPLAY in the component
            // Or, update the structure slightly - for now, we'll add items without images initially
            console.log("Need to generate initial item images after state update.");
        }

      return {
        ...state,
        status: "Gameplay",
        storyLog: state.currentAdventureId ? state.storyLog : [], // Keep log if loading
        currentNarration: state.currentAdventureId ? state.currentNarration : null, // Keep narration if loading
        adventureSummary: null,
        inventory: state.currentAdventureId ? state.inventory : initialItems, // Set initial items only for new games
        currentGameStateString: state.currentAdventureId ? state.currentGameStateString : initialGameState, // Keep state if loading
        currentAdventureId: adventureId, // Set the ID for this adventure session
      };
    case "UPDATE_NARRATION":
      const newLogEntry: StoryLogEntry = {
          narration: action.payload.narration,
          updatedGameState: action.payload.updatedGameState,
          updatedInventory: action.payload.updatedInventory, // Store the list of item names
          timestamp: Date.now(),
       };
      const newLog = [...state.storyLog, newLogEntry];

       // Handle inventory updates (images generated async, see handleInventoryUpdate)
       let updatedInventoryState = state.inventory;
        if (action.payload.updatedInventory) {
           // Naive update for now: replace inventory based on names
            updatedInventoryState = action.payload.updatedInventory.map(name => {
                // Try to find existing item with image
                const existingItem = state.inventory.find(item => item.name === name);
                return existingItem ? existingItem : { name }; // Keep existing or add new without image yet
            });

           // TODO: Trigger async image generation for new items outside reducer
           // Maybe via useEffect in Gameplay component watching storyLog changes?
            // For now, we just update names and rely on later generation/display logic
            console.log("Inventory names updated:", action.payload.updatedInventory);
       }

      return {
        ...state,
        currentNarration: newLogEntry,
        storyLog: newLog,
        inventory: updatedInventoryState, // Update with potentially new item names
        currentGameStateString: action.payload.updatedGameState,
      };
     case "END_ADVENTURE":
       let finalLog = [...state.storyLog];
       let finalGameState = state.currentGameStateString;
       let finalInventoryNames = state.inventory.map(i => i.name);

       if (action.payload.finalNarration && (!state.currentNarration || action.payload.finalNarration.narration !== state.currentNarration.narration)) {
          const finalEntry: StoryLogEntry = {
            ...action.payload.finalNarration,
            timestamp: Date.now(),
          };
          finalLog.push(finalEntry);
          finalGameState = action.payload.finalNarration.updatedGameState; // Update final game state
          finalInventoryNames = action.payload.finalNarration.updatedInventory || finalInventoryNames; // Update final inventory names
          console.log("Added final narration entry to log.");
       } else {
         console.log("Final narration not added (either missing or same as last entry).")
       }

        // Keep current inventory items (with images if generated) that match final names
        const finalInventory = state.inventory.filter(item => finalInventoryNames.includes(item.name));

       // Auto-save on end
       let updatedSavedAdventures = state.savedAdventures;
        if (state.character && state.currentAdventureId) {
           const endedAdventure: SavedAdventure = {
               id: state.currentAdventureId,
               saveTimestamp: Date.now(),
               characterName: state.character.name,
               character: state.character,
               adventureSettings: state.adventureSettings,
               storyLog: finalLog, // Save the complete log
               currentGameStateString: finalGameState, // Save the final state
               inventory: finalInventory, // Save the final inventory state
               statusBeforeSave: "AdventureSummary", // Mark as ended
               adventureSummary: action.payload.summary,
           };
           // Remove existing save with the same ID before adding the updated one
           updatedSavedAdventures = state.savedAdventures.filter(adv => adv.id !== endedAdventure.id);
           updatedSavedAdventures.push(endedAdventure);
            // Persist to localStorage immediately
            localStorage.setItem(SAVED_ADVENTURES_KEY, JSON.stringify(updatedSavedAdventures));
            console.log("Adventure ended and automatically saved.");
        }

      return {
        ...state,
        status: "AdventureSummary",
        adventureSummary: action.payload.summary,
        storyLog: finalLog,
        inventory: finalInventory, // Update state with final inventory
        currentNarration: null,
        savedAdventures: updatedSavedAdventures,
      };
    case "RESET_GAME":
      // Reset everything EXCEPT saved adventures
      return {
          ...initialState,
          savedAdventures: state.savedAdventures, // Keep loaded saves
          status: "MainMenu", // Ensure status is MainMenu
       };

    // --- Save/Load Actions ---
    case "LOAD_SAVED_ADVENTURES":
        return { ...state, savedAdventures: action.payload };

    case "SAVE_CURRENT_ADVENTURE":
      if (!state.character || !state.currentAdventureId || state.status !== "Gameplay") {
        console.warn("Cannot save: No active character, adventure ID, or not in Gameplay.");
        return state;
      }
      const currentSave: SavedAdventure = {
        id: state.currentAdventureId,
        saveTimestamp: Date.now(),
        characterName: state.character.name,
        character: state.character,
        adventureSettings: state.adventureSettings,
        storyLog: state.storyLog,
        currentGameStateString: state.currentGameStateString,
        inventory: state.inventory, // Save current inventory
        statusBeforeSave: state.status, // Capture current status
        adventureSummary: state.adventureSummary, // Might be null if saved mid-game
      };
      // Remove existing save with same ID before adding/updating
      const savesWithoutCurrent = state.savedAdventures.filter(adv => adv.id !== currentSave.id);
      const newSaves = [...savesWithoutCurrent, currentSave];
       // Persist to localStorage
       localStorage.setItem(SAVED_ADVENTURES_KEY, JSON.stringify(newSaves));
      return { ...state, savedAdventures: newSaves };

    case "LOAD_ADVENTURE":
      const adventureToLoad = state.savedAdventures.find(adv => adv.id === action.payload);
      if (!adventureToLoad) {
        console.error(`Adventure with ID ${action.payload} not found.`);
        return state;
      }
       // Check if the adventure was already finished
        if (adventureToLoad.statusBeforeSave === "AdventureSummary") {
            // Load directly into summary view
             return {
                ...initialState, // Reset most things
                savedAdventures: state.savedAdventures, // Keep saves
                status: "AdventureSummary",
                character: adventureToLoad.character, // Load character for display
                adventureSummary: adventureToLoad.adventureSummary,
                storyLog: adventureToLoad.storyLog,
                inventory: adventureToLoad.inventory, // Load inventory for summary view
                currentAdventureId: adventureToLoad.id, // Keep track of which summary we are viewing
             };
        } else {
            // Load into gameplay state
            return {
                ...state,
                status: "Gameplay", // Set status to trigger gameplay screen
                character: adventureToLoad.character,
                adventureSettings: adventureToLoad.adventureSettings,
                storyLog: adventureToLoad.storyLog,
                inventory: adventureToLoad.inventory, // Load inventory state
                currentGameStateString: adventureToLoad.currentGameStateString,
                currentNarration: adventureToLoad.storyLog.length > 0 ? adventureToLoad.storyLog[adventureToLoad.storyLog.length - 1] : null,
                adventureSummary: null, // Clear summary if resuming mid-game
                currentAdventureId: adventureToLoad.id, // Set the ID of the loaded adventure
            };
        }


    case "DELETE_ADVENTURE":
        const filteredSaves = state.savedAdventures.filter(adv => adv.id !== action.payload);
        // Persist deletion to localStorage
        localStorage.setItem(SAVED_ADVENTURES_KEY, JSON.stringify(filteredSaves));
        return { ...state, savedAdventures: filteredSaves };


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

    // --- Persistence Effect ---
    useEffect(() => {
        // Load saved adventures from localStorage on initial mount
        try {
            const savedData = localStorage.getItem(SAVED_ADVENTURES_KEY);
            if (savedData) {
                const loadedAdventures: SavedAdventure[] = JSON.parse(savedData);
                // Basic validation (check if it's an array)
                if (Array.isArray(loadedAdventures)) {
                    // Validate structure further if needed (e.g., check for required fields)
                    const validAdventures = loadedAdventures.filter(adv => adv.id && adv.characterName && adv.saveTimestamp);
                    dispatch({ type: "LOAD_SAVED_ADVENTURES", payload: validAdventures });
                    console.log(`Loaded ${validAdventures.length} valid adventures from storage.`);
                    if (validAdventures.length !== loadedAdventures.length) {
                        console.warn("Some saved adventure data was invalid and discarded.");
                    }
                } else {
                    console.warn("Invalid data found in localStorage for saved adventures.");
                    localStorage.removeItem(SAVED_ADVENTURES_KEY); // Clear invalid data
                }
            } else {
                 console.log("No saved adventures found in storage.");
            }
        } catch (error) {
            console.error("Failed to load or parse saved adventures:", error);
             localStorage.removeItem(SAVED_ADVENTURES_KEY); // Clear potentially corrupt data
        }
    }, []); // Empty dependency array ensures this runs only once on mount


   // Log state changes for debugging (reduce noise by logging only status changes)
   useEffect(() => {
     console.log("Game Status Changed:", state.status);
     // Log when entering gameplay and if it's a loaded game
     if (state.status === 'Gameplay' && state.currentAdventureId) {
        const loaded = state.savedAdventures.some(s => s.id === state.currentAdventureId);
        console.log(`Entered Gameplay. Adventure ID: ${state.currentAdventureId}. ${loaded ? '(Loaded)' : '(New)'}`);
     }
   }, [state.status, state.currentAdventureId, state.savedAdventures]); // Add dependencies


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