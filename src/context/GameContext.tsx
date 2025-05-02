// src/context/GameContext.tsx
"use client";

import type { ReactNode } from "react";
import React, { createContext, useContext, useReducer, Dispatch, useEffect } from "react";
import type { GenerateCharacterDescriptionOutput } from "@/ai/flows/generate-character-description";

export type GameStatus =
  | "MainMenu"
  | "CharacterCreation"
  | "AdventureSetup"
  | "Gameplay"
  | "AdventureSummary"
  | "ViewSavedAdventures";

// --- Skill Tree Definitions ---
export interface Skill {
    name: string;
    description: string;
}

export interface SkillTreeStage {
    stage: number; // 1-4
    skills: Skill[];
}

export interface SkillTree {
    className: string; // The class this tree belongs to
    stages: SkillTreeStage[]; // Array containing 4 stages
}

// --- State Definition ---

export interface CharacterStats {
  strength: number;
  stamina: number;
  agility: number;
}

export interface Character {
  name: string;
  description: string;
  class: string; // Character class (e.g., Warrior, Mage) - Now mandatory
  traits: string[];
  knowledge: string[];
  background: string;
  stats: CharacterStats;
  aiGeneratedDescription?: GenerateCharacterDescriptionOutput['detailedDescription'];
  skillTree: SkillTree | null; // Holds the generated skill tree for the current class
  skillTreeStage: number; // Current progression stage (0-4, 0 means no stage achieved yet)
}

export interface AdventureSettings {
  adventureType: "Randomized" | "Custom" | null;
  permanentDeath: boolean;
  worldType?: string;
  mainQuestline?: string;
  difficulty?: string;
}

export interface InventoryItem {
    name: string;
    description?: string;
    imageDataUri?: string;
}

export interface StoryLogEntry {
  narration: string;
  updatedGameState: string;
  updatedInventory?: string[];
  // Character progression updates from AI
  updatedStats?: Partial<CharacterStats>;
  updatedTraits?: string[];
  updatedKnowledge?: string[];
  updatedClass?: string;
  progressedToStage?: number; // Optional: AI indicates skill stage progression
  suggestedClassChange?: string; // Optional: AI suggests a class change
  timestamp: number;
}

export interface SavedAdventure {
    id: string;
    saveTimestamp: number;
    characterName: string;
    character: Character; // Includes skill tree and stage
    adventureSettings: AdventureSettings;
    storyLog: StoryLogEntry[];
    currentGameStateString: string;
    inventory: InventoryItem[];
    statusBeforeSave?: GameStatus;
    adventureSummary?: string | null;
}


export interface GameState {
  status: GameStatus;
  character: Character | null;
  adventureSettings: AdventureSettings;
  currentNarration: StoryLogEntry | null;
  storyLog: StoryLogEntry[];
  adventureSummary: string | null;
  currentGameStateString: string;
  inventory: InventoryItem[];
  savedAdventures: SavedAdventure[];
  currentAdventureId: string | null;
  isGeneratingSkillTree: boolean; // Track skill tree generation
}

const initialCharacterState: Character = {
  name: "",
  description: "",
  class: "Adventurer", // Default starting class
  traits: [],
  knowledge: [],
  background: "",
  stats: { strength: 5, stamina: 5, agility: 5 },
  skillTree: null, // Starts with no skill tree
  skillTreeStage: 0, // Starts at stage 0
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
  currentGameStateString: "The adventure is about to begin...",
  inventory: [],
  savedAdventures: [],
  currentAdventureId: null,
  isGeneratingSkillTree: false, // Initially not generating
};

// --- LocalStorage Keys ---
const SAVED_ADVENTURES_KEY = "endlessTalesSavedAdventures";

// --- Action Definitions ---

type Action =
  | { type: "SET_GAME_STATUS"; payload: GameStatus }
  | { type: "CREATE_CHARACTER"; payload: Partial<Character> }
  | { type: "UPDATE_CHARACTER"; payload: Partial<Character> }
  | { type: "SET_AI_DESCRIPTION"; payload: string }
  | { type: "SET_ADVENTURE_SETTINGS"; payload: Partial<AdventureSettings> }
  | { type: "START_GAMEPLAY" }
  | { type: "UPDATE_NARRATION"; payload: StoryLogEntry }
  | { type: "END_ADVENTURE"; payload: { summary: string | null; finalNarration?: StoryLogEntry } }
  | { type: "RESET_GAME" }
  | { type: "LOAD_SAVED_ADVENTURES"; payload: SavedAdventure[] }
  | { type: "SAVE_CURRENT_ADVENTURE" }
  | { type: "LOAD_ADVENTURE"; payload: string }
  | { type: "DELETE_ADVENTURE"; payload: string }
  | { type: "SET_SKILL_TREE_GENERATING"; payload: boolean } // Action to set generation status
  | { type: "SET_SKILL_TREE"; payload: { class: string; skillTree: SkillTree } } // Action to set the generated skill tree and class
  | { type: "CHANGE_CLASS_AND_RESET_SKILLS"; payload: { newClass: string; newSkillTree: SkillTree } } // Action to change class and reset skills
  | { type: "PROGRESS_SKILL_STAGE"; payload: number }; // Action to update skill stage

// --- Helper Functions ---
function generateAdventureId(): string {
    return `adv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Placeholder for AI-generated image URI
async function generatePlaceholderImageUri(itemName: string): Promise<string> {
    let hash = 0;
    for (let i = 0; i < itemName.length; i++) {
        hash = itemName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const width = 200 + (Math.abs(hash) % 101);
    const height = 200 + (Math.abs(hash >> 16) % 101);
    return `https://picsum.photos/${width}/${height}?random=${encodeURIComponent(itemName)}&t=${Date.now()}`;
}

// --- Reducer ---
let isGeneratingImages = false;

// Async inventory update logic (remains the same)
async function handleInventoryUpdate(currentState: GameState, updatedItemNames: string[]): Promise<Partial<GameState>> {
    if (isGeneratingImages) {
        console.log("Image generation already in progress, skipping.");
        return {};
    }
    const currentInventoryMap = new Map(currentState.inventory.map(item => [item.name, item]));
    const itemsToGenerate: string[] = [];
    const finalInventoryItems: InventoryItem[] = [];
    for (const name of updatedItemNames) {
        const existingItem = currentInventoryMap.get(name);
        if (existingItem) {
            finalInventoryItems.push(existingItem);
            if (!existingItem.imageDataUri) itemsToGenerate.push(name);
        } else {
            finalInventoryItems.push({ name });
            itemsToGenerate.push(name);
        }
    }
    if (itemsToGenerate.length === 0) return { inventory: finalInventoryItems };
    isGeneratingImages = true;
    console.log("Generating images for items:", itemsToGenerate);
    try {
        const generationPromises = itemsToGenerate.map(name => generatePlaceholderImageUri(name).then(uri => ({ name, imageDataUri: uri })));
        const generatedItems = await Promise.all(generationPromises);
        const generatedMap = new Map(generatedItems.map(item => [item.name, item]));
        const inventoryWithImages = finalInventoryItems.map(item => generatedMap.get(item.name) ? { ...item, imageDataUri: generatedMap.get(item.name)?.imageDataUri } : item);
        isGeneratingImages = false;
        return { inventory: inventoryWithImages };
    } catch (error) {
        console.error("Error generating item images:", error);
        isGeneratingImages = false;
        return { inventory: finalInventoryItems };
    }
}


function gameReducer(state: GameState, action: Action): GameState {
  console.log(`Reducer Action: ${action.type}`, action.payload ? JSON.stringify(action.payload).substring(0, 200) : '');
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
        class: action.payload.class ?? initialCharacterState.class,
        skillTree: null, // Start with no skill tree
        skillTreeStage: 0, // Start at stage 0
      };
      return {
        ...state,
        character: newCharacter,
        status: "AdventureSetup",
        currentAdventureId: null,
        storyLog: [],
        currentNarration: null,
        adventureSummary: null,
        inventory: [],
        isGeneratingSkillTree: false, // Reset flag
      };
     case "UPDATE_CHARACTER":
         if (!state.character) return state;
         const updatedCharacter: Character = {
             ...state.character,
             ...action.payload,
             stats: action.payload.stats ? { ...state.character.stats, ...action.payload.stats } : state.character.stats,
             traits: action.payload.traits ?? state.character.traits,
             knowledge: action.payload.knowledge ?? state.character.knowledge,
             // Class update is handled by CHANGE_CLASS_AND_RESET_SKILLS now
             // class: action.payload.class ?? state.character.class,
         };
         return { ...state, character: updatedCharacter };
    case "SET_AI_DESCRIPTION":
        if (!state.character) return state;
        return { ...state, character: { ...state.character, aiGeneratedDescription: action.payload } };
    case "SET_ADVENTURE_SETTINGS":
      return { ...state, adventureSettings: { ...state.adventureSettings, ...action.payload } };
    case "START_GAMEPLAY":
      if (!state.character || !state.adventureSettings.adventureType) {
        console.error("Cannot start gameplay: Missing character or adventure type.");
        return state;
      }
      const charDesc = state.character.aiGeneratedDescription || state.character.description || "No description provided.";
      const initialItems = [{ name: "Basic Clothes" }];
      const initialInventoryNames = initialItems.map(item => item.name);
      const skillTreeSummary = state.character.skillTree
          ? `Class Tree: ${state.character.skillTree.className} (Stage ${state.character.skillTreeStage})`
          : "No skill tree assigned yet.";
      const initialGameState = `Location: Starting Point\nInventory: ${initialInventoryNames.join(', ') || 'Empty'}\nStatus: Healthy\nTime: Day 1, Morning\nQuest: None\nMilestones: None\nCharacter Name: ${state.character.name}\nClass: ${state.character.class}\nTraits: ${state.character.traits.join(', ') || 'None'}\nKnowledge: ${state.character.knowledge.join(', ') || 'None'}\nBackground: ${state.character.background || 'None'}\nStats: STR ${state.character.stats.strength}, STA ${state.character.stats.stamina}, AGI ${state.character.stats.agility}\nDescription: ${charDesc}\nAdventure Mode: ${state.adventureSettings.adventureType}, ${state.adventureSettings.permanentDeath ? 'Permadeath' : 'Respawn'}\n${skillTreeSummary}`;
      const adventureId = state.currentAdventureId || generateAdventureId();

      return {
        ...state,
        status: "Gameplay",
        storyLog: state.currentAdventureId ? state.storyLog : [],
        currentNarration: state.currentAdventureId ? state.currentNarration : null,
        adventureSummary: null,
        inventory: state.currentAdventureId ? state.inventory : initialItems,
        currentGameStateString: state.currentAdventureId ? state.currentGameStateString : initialGameState,
        currentAdventureId: adventureId,
        isGeneratingSkillTree: state.currentAdventureId ? state.isGeneratingSkillTree : false, // Keep flag if loading
        // Ensure skill tree and stage are kept if loading
        character: {
            ...state.character,
            skillTree: state.currentAdventureId ? state.character.skillTree : null,
            skillTreeStage: state.currentAdventureId ? state.character.skillTreeStage : 0,
        }
      };
    case "UPDATE_NARRATION":
        const newLogEntry: StoryLogEntry = { ...action.payload, timestamp: action.payload.timestamp || Date.now() };
        const newLog = [...state.storyLog, newLogEntry];
        let charAfterNarration = state.character;
        let inventoryAfterNarration = state.inventory;

        if (state.character) {
            charAfterNarration = {
                ...state.character,
                stats: newLogEntry.updatedStats ? { ...state.character.stats, ...newLogEntry.updatedStats } : state.character.stats,
                traits: newLogEntry.updatedTraits ?? state.character.traits,
                knowledge: newLogEntry.updatedKnowledge ?? state.character.knowledge,
                // Stage progression is handled by PROGRESS_SKILL_STAGE triggered externally after AI confirms
                // Class change is handled by CHANGE_CLASS_AND_RESET_SKILLS triggered externally
            };
            console.log("Character stats/traits/knowledge updated via narration:", { stats: newLogEntry.updatedStats, traits: newLogEntry.updatedTraits, knowledge: newLogEntry.updatedKnowledge });
        }

        if (action.payload.updatedInventory) {
            const itemNames = action.payload.updatedInventory;
            // Trigger async update but don't wait for it in the reducer
            handleInventoryUpdate(state, itemNames).then(inventoryUpdate => {
                 // Update inventory if needed, this might happen after the current render cycle
                // This part needs careful handling, perhaps triggering another dispatch or managing in component
                 console.log("Async inventory update result (may not be immediate):", inventoryUpdate);
            });
            // Immediately update names for consistency, images will follow
             inventoryAfterNarration = itemNames.map(name => state.inventory.find(item => item.name === name) ?? { name });
             console.log("Inventory names updated based on narration payload.");
        }

        return {
            ...state,
            character: charAfterNarration,
            currentNarration: newLogEntry,
            storyLog: newLog,
            inventory: inventoryAfterNarration,
            currentGameStateString: action.payload.updatedGameState,
        };

    case "END_ADVENTURE":
        let finalLog = [...state.storyLog];
        let finalGameState = state.currentGameStateString;
        let finalInventoryNames = state.inventory.map(i => i.name);
        let finalCharacterState = state.character;

        if (action.payload.finalNarration && (!state.currentNarration || action.payload.finalNarration.narration !== state.currentNarration.narration)) {
            const finalEntry: StoryLogEntry = { ...action.payload.finalNarration, timestamp: action.payload.finalNarration.timestamp || Date.now() };
            finalLog.push(finalEntry);
            finalGameState = action.payload.finalNarration.updatedGameState;
            finalInventoryNames = action.payload.finalNarration.updatedInventory || finalInventoryNames;

            if (state.character) {
                finalCharacterState = {
                    ...state.character,
                    stats: finalEntry.updatedStats ? { ...state.character.stats, ...finalEntry.updatedStats } : state.character.stats,
                    traits: finalEntry.updatedTraits ?? state.character.traits,
                    knowledge: finalEntry.updatedKnowledge ?? state.character.knowledge,
                    class: finalEntry.updatedClass ?? state.character.class,
                    // Capture final stage if provided
                    skillTreeStage: finalEntry.progressedToStage ?? state.character.skillTreeStage,
                };
            }
            console.log("Added final narration entry to log and applied final character updates.");
        } else {
            console.log("Final narration not added.");
        }

        const finalInventory = state.inventory.filter(item => finalInventoryNames.includes(item.name));
        let updatedSavedAdventures = state.savedAdventures;
        if (finalCharacterState && state.currentAdventureId) {
            const endedAdventure: SavedAdventure = {
                id: state.currentAdventureId,
                saveTimestamp: Date.now(),
                characterName: finalCharacterState.name,
                character: finalCharacterState, // Save final character state including skill tree/stage
                adventureSettings: state.adventureSettings,
                storyLog: finalLog,
                currentGameStateString: finalGameState,
                inventory: finalInventory,
                statusBeforeSave: "AdventureSummary",
                adventureSummary: action.payload.summary,
            };
            updatedSavedAdventures = state.savedAdventures.filter(adv => adv.id !== endedAdventure.id);
            updatedSavedAdventures.push(endedAdventure);
            localStorage.setItem(SAVED_ADVENTURES_KEY, JSON.stringify(updatedSavedAdventures));
            console.log("Adventure ended and automatically saved.");
        }

        return {
            ...state,
            status: "AdventureSummary",
            character: finalCharacterState,
            adventureSummary: action.payload.summary,
            storyLog: finalLog,
            inventory: finalInventory,
            currentNarration: null,
            savedAdventures: updatedSavedAdventures,
            isGeneratingSkillTree: false, // Reset flag on end
        };
    case "RESET_GAME":
      return { ...initialState, savedAdventures: state.savedAdventures, status: "MainMenu" };

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
        character: state.character, // Save current character state including skill tree/stage
        adventureSettings: state.adventureSettings,
        storyLog: state.storyLog,
        currentGameStateString: state.currentGameStateString,
        inventory: state.inventory,
        statusBeforeSave: state.status,
        adventureSummary: state.adventureSummary,
      };
      const savesWithoutCurrent = state.savedAdventures.filter(adv => adv.id !== currentSave.id);
      const newSaves = [...savesWithoutCurrent, currentSave];
      localStorage.setItem(SAVED_ADVENTURES_KEY, JSON.stringify(newSaves));
      return { ...state, savedAdventures: newSaves };

    case "LOAD_ADVENTURE":
      const adventureToLoad = state.savedAdventures.find(adv => adv.id === action.payload);
      if (!adventureToLoad) {
        console.error(`Adventure with ID ${action.payload} not found.`);
        return state;
      }
      if (adventureToLoad.statusBeforeSave === "AdventureSummary") {
          return {
              ...initialState,
              savedAdventures: state.savedAdventures,
              status: "AdventureSummary",
              character: adventureToLoad.character,
              adventureSummary: adventureToLoad.adventureSummary,
              storyLog: adventureToLoad.storyLog,
              inventory: adventureToLoad.inventory,
              currentAdventureId: adventureToLoad.id,
          };
      } else {
          // Restore full game state for gameplay
          return {
              ...state, // Keep general settings like savedAdventures
              status: "Gameplay",
              character: adventureToLoad.character, // Load character including skills/stage
              adventureSettings: adventureToLoad.adventureSettings,
              storyLog: adventureToLoad.storyLog,
              inventory: adventureToLoad.inventory,
              currentGameStateString: adventureToLoad.currentGameStateString,
              currentNarration: adventureToLoad.storyLog.length > 0 ? adventureToLoad.storyLog[adventureToLoad.storyLog.length - 1] : null,
              adventureSummary: null,
              currentAdventureId: adventureToLoad.id,
              isGeneratingSkillTree: false, // Assume tree is already loaded
          };
      }

    case "DELETE_ADVENTURE":
        const filteredSaves = state.savedAdventures.filter(adv => adv.id !== action.payload);
        localStorage.setItem(SAVED_ADVENTURES_KEY, JSON.stringify(filteredSaves));
        return { ...state, savedAdventures: filteredSaves };

    // --- Skill Tree Actions ---
    case "SET_SKILL_TREE_GENERATING":
        return { ...state, isGeneratingSkillTree: action.payload };

    case "SET_SKILL_TREE":
        if (!state.character) return state;
        // Ensure the skill tree class matches the current character class
        if (state.character.class !== action.payload.class) {
            console.warn(`Skill tree class "${action.payload.class}" does not match character class "${state.character.class}". Ignoring.`);
            return { ...state, isGeneratingSkillTree: false };
        }
        return {
            ...state,
            character: {
                ...state.character,
                skillTree: action.payload.skillTree,
                skillTreeStage: state.character.skillTreeStage, // Keep current stage when setting tree initially
            },
            isGeneratingSkillTree: false,
        };

     case "CHANGE_CLASS_AND_RESET_SKILLS":
         if (!state.character) return state;
         console.log(`Changing class from ${state.character.class} to ${action.payload.newClass} and resetting skills.`);
         return {
             ...state,
             character: {
                 ...state.character,
                 class: action.payload.newClass, // Update class
                 skillTree: action.payload.newSkillTree, // Assign new skill tree
                 skillTreeStage: 0, // Reset stage progression to 0
             },
             isGeneratingSkillTree: false, // Ensure generation flag is off
         };

     case "PROGRESS_SKILL_STAGE":
         if (!state.character || !state.character.skillTree) return state;
         // Ensure progression is within bounds (1-4) and sequential or equal
         const newStage = Math.max(1, Math.min(4, action.payload));
         if (newStage > state.character.skillTreeStage) {
             console.log(`Progressing skill stage from ${state.character.skillTreeStage} to ${newStage}.`);
             return {
                 ...state,
                 character: {
                     ...state.character,
                     skillTreeStage: newStage,
                 },
             };
         } else {
             console.log(`Attempted to progress skill stage to ${newStage}, but current stage is ${state.character.skillTreeStage}. No change.`);
             return state; // No change if not progressing
         }


    default:
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const exhaustiveCheck: never = action;
      return state;
  }
}

// --- Context and Provider ---

const GameContext = createContext<{ state: GameState; dispatch: Dispatch<Action> } | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

    // --- Persistence Effect ---
    useEffect(() => {
        try {
            const savedData = localStorage.getItem(SAVED_ADVENTURES_KEY);
            if (savedData) {
                const loadedAdventures: SavedAdventure[] = JSON.parse(savedData);
                if (Array.isArray(loadedAdventures)) {
                    // Ensure loaded characters have default skill tree/stage if missing from old save format
                    const validatedAdventures = loadedAdventures.map(adv => ({
                       ...adv,
                       character: {
                           ...initialCharacterState, // Apply defaults first
                           ...adv.character, // Then load saved data
                           skillTree: adv.character.skillTree || null, // Ensure null if missing
                           skillTreeStage: adv.character.skillTreeStage ?? 0, // Ensure 0 if missing
                       }
                    })).filter(adv => adv.id && adv.characterName && adv.saveTimestamp && adv.character); // Basic validation

                    dispatch({ type: "LOAD_SAVED_ADVENTURES", payload: validatedAdventures });
                    console.log(`Loaded ${validatedAdventures.length} valid adventures from storage.`);
                    if (validatedAdventures.length !== loadedAdventures.length) {
                         console.warn("Some saved adventure data was invalid or missing character data and discarded.");
                         // Optionally update localStorage with only valid adventures
                         localStorage.setItem(SAVED_ADVENTURES_KEY, JSON.stringify(validatedAdventures));
                    }
                } else {
                    console.warn("Invalid data found in localStorage for saved adventures.");
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


   // Log state changes
   useEffect(() => {
     console.log("Game State Updated:", { status: state.status, character: state.character?.name, class: state.character?.class, stage: state.character?.skillTreeStage, adventureId: state.currentAdventureId });
   }, [state.status, state.character, state.currentAdventureId]);


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
