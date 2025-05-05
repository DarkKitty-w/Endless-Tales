// src/context/game-actions.ts

import type { GameStatus, GameState } from "@/types/game-types"; // Import GameStatus from main game types
import type {
    Character,
    SkillTree,
    Skill,
    ReputationChange,
    NpcRelationshipChange,
    CharacterStats, // Import CharacterStats
} from "@/types/character-types"; // Import character-related types
import type { InventoryItem } from "@/types/inventory-types"; // Import inventory types
import type { AdventureSettings, StoryLogEntry, SavedAdventure, DifficultyLevel } from "@/types/adventure-types"; // Import adventure types

/** Defines all possible actions that can be dispatched to the game reducer. */
export type Action =
  | { type: "SET_GAME_STATUS"; payload: GameStatus }
  | { type: "CREATE_CHARACTER"; payload: Partial<Character> }
  | { type: "UPDATE_CHARACTER"; payload: Partial<Character> }
  | { type: "SET_AI_DESCRIPTION"; payload: string }
  | { type: "SET_ADVENTURE_SETTINGS"; payload: Partial<AdventureSettings> }
  | { type: "START_GAMEPLAY" }
  | { type: "UPDATE_NARRATION"; payload: StoryLogEntry }
  | { type: "GRANT_XP"; payload: number }
  | { type: "LEVEL_UP"; payload: { newLevel: number; newXpToNextLevel: number } }
  | { type: "UPDATE_REPUTATION"; payload: ReputationChange }
  | { type: "UPDATE_NPC_RELATIONSHIP"; payload: NpcRelationshipChange }
  | { type: "INCREMENT_TURN" }
  | { type: "END_ADVENTURE"; payload: { summary: string | null; finalNarration?: StoryLogEntry } }
  | { type: "RESET_GAME" }
  | { type: "LOAD_SAVED_ADVENTURES"; payload: SavedAdventure[] }
  | { type: "SAVE_CURRENT_ADVENTURE" }
  | { type: "LOAD_ADVENTURE"; payload: string }
  | { type: "DELETE_ADVENTURE"; payload: string }
  | { type: "SET_SKILL_TREE_GENERATING"; payload: boolean }
  | { type: "SET_SKILL_TREE"; payload: { class: string; skillTree: SkillTree } }
  | { type: "CHANGE_CLASS_AND_RESET_SKILLS"; payload: { newClass: string; newSkillTree: SkillTree } }
  | { type: "PROGRESS_SKILL_STAGE"; payload: number }
  | { type: "ADD_ITEM"; payload: InventoryItem }
  | { type: "REMOVE_ITEM"; payload: { itemName: string; quantity?: number } }
  | { type: "UPDATE_ITEM"; payload: { itemName: string; updates: Partial<InventoryItem> } }
  | { type: "UPDATE_INVENTORY"; payload: InventoryItem[] }
  | { type: "SET_THEME_ID"; payload: string }
  | { type: "SET_DARK_MODE"; payload: boolean }
  | { type: "UPDATE_CRAFTING_RESULT"; payload: { narration: string; consumedItems: string[]; craftedItem: InventoryItem | null; newGameStateString: string } };
