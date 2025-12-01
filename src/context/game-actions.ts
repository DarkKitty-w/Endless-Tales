
// src/context/game-actions.ts
import type { GameStatus } from "../types/game-types";
import type {
    Character, SkillTree, ReputationChange, NpcRelationshipChange
} from "../types/character-types";
import type { InventoryItem } from "../types/inventory-types";
import type { AdventureSettings, StoryLogEntry, SavedAdventure, AdventureType, FirestoreCoopSession } from "../types/adventure-types";

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
  | { type: "LOAD_ADVENTURE"; payload: SavedAdventure } // Payload is the full saved adventure object
  | { type: "DELETE_ADVENTURE"; payload: string } // Payload is the adventure ID
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
  | { type: "SET_USER_API_KEY"; payload: string | null }
  | { type: "UPDATE_CRAFTING_RESULT"; payload: { narration: string; consumedItems: string[]; craftedItem: InventoryItem | null; newGameStateString: string } }
  | { type: "SET_ADVENTURE_TYPE", payload: AdventureType }
  | { type: "RESPAWN_CHARACTER"; payload?: { narrationMessage?: string } }
  // Multiplayer Actions
  | { type: "SET_SESSION_ID"; payload: string | null }
  | { type: "SET_PLAYERS"; payload: string[] } // Array of player UIDs
  | { type: "ADD_PLAYER"; payload: string } // UID of player to add
  | { type: "REMOVE_PLAYER"; payload: string } // UID of player to remove
  | { type: "SET_CURRENT_PLAYER_UID"; payload: string | null }
  | { type: "SET_IS_HOST"; payload: boolean }
  | { type: "SYNC_COOP_SESSION_STATE"; payload: Partial<FirestoreCoopSession> };
