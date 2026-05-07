// src/context/game-actions.ts
import type { GameStatus, WorldMap, Location } from "../types/game-types";
import type {
    Character, SkillTree, ReputationChange, NpcRelationshipChange
} from "../types/character-types";
import type { InventoryItem } from "../types/inventory-types";
import type { ProviderType } from "../ai/ai-router";
import type { AdventureSettings, StoryLogEntry, SavedAdventure, AdventureType } from "../types/adventure-types";

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
  | { type: "LOAD_ADVENTURE"; payload: SavedAdventure }
  | { type: "DELETE_ADVENTURE"; payload: string }
  | { type: "SET_SKILL_TREE_GENERATING"; payload: boolean }
  | { type: "SET_SKILL_TREE"; payload: { class: string; skillTree: SkillTree } }
  | { type: "CHANGE_CLASS_AND_RESET_SKILLS"; payload: { newClass: string; newSkillTree: SkillTree } }
  | { type: "PROGRESS_SKILL_STAGE"; payload: number }
  | { type: "UNLEARN_SKILL"; payload: string }
  | { type: "RESPEC_ALL_SKILLS" }
  | { type: "ADD_ITEM"; payload: InventoryItem }
  | { type: "REMOVE_ITEM"; payload: { itemName: string; quantity?: number } }
  | { type: "UPDATE_ITEM"; payload: { itemName: string; updates: Partial<InventoryItem> } }
  | { type: "UPDATE_INVENTORY"; payload: InventoryItem[] }
  | { type: "SET_THEME_ID"; payload: string }
  | { type: "SET_DARK_MODE"; payload: boolean }
  | { type: "SET_USER_API_KEY"; payload: string | null }
  | { type: "UPDATE_CRAFTING_RESULT"; payload: { narration: string; consumedItems: string[]; craftedItem: InventoryItem | null; newGameStateString: string } }
  | { type: "SET_ADVENTURE_TYPE"; payload: AdventureType }
  | { type: "RESPAWN_CHARACTER"; payload?: { narrationMessage?: string } }
  | { type: "SET_AI_PROVIDER"; payload: ProviderType }
  | { type: "SET_PROVIDER_API_KEY"; payload: { provider: ProviderType; apiKey: string | null } }
  // World map actions
  | { type: "SET_WORLD_MAP"; payload: WorldMap }
  | { type: "ADD_LOCATION"; payload: Location }
  | { type: "UPDATE_LOCATION"; payload: { id: string; updates: Partial<Location> } }
  | { type: "DISCOVER_LOCATION"; payload: string }
  | { type: "SET_CURRENT_LOCATION"; payload: string }
// Multiplayer actions
  | { type: "SET_SESSION_ID"; payload: string | null }
  | { type: "SET_IS_HOST"; payload: boolean }
  | { type: "SET_PLAYERS"; payload: string[] }
  | { type: "PEER_CONNECTED"; payload: { peerId: string; name: string; isHost: boolean } }
  | { type: "PEER_DISCONNECTED"; payload: string }
  | { type: "SET_TURN_ORDER"; payload: string[] }
  | { type: "ADVANCE_TURN"; payload: number }
  | { type: "APPLY_REMOTE_STATE"; payload: any }
  | { type: "APPLY_REMOTE_NARRATION"; payload: { entry: any; newTurn: number } }
  | { type: "SEND_PLAYER_ACTION"; payload: { action: string; turnNumber: number; isInitial?: boolean } }
  | { type: "UPDATE_PARTY_STATE"; payload: Record<string, any> }
  | { type: "ADD_CHAT_MESSAGE"; payload: any }
  | { type: "CLEAR_CHAT" }
  | { type: "SET_PENDING_INTERACTION"; payload: any | null }
  | { type: "RESOLVE_PENDING_INTERACTION"; payload: { accepted: boolean } }
  | { type: "KICK_PLAYER"; payload: string }
  | { type: "PAUSE_GAME" }
  | { type: "RESUME_GAME" }
  | { type: "SET_CONNECTION_STATUS"; payload: any }
  | { type: "SET_MY_TURN"; payload: boolean }
  // New actions for trade and reconnection
  | { type: "PROCESS_TRADE"; payload: { fromPeerId: string; toPeerId: string; items: string[] } }
  | { type: "RECONNECT_SYNC"; payload: { gameState: any; partyState: Record<string, any>; turnOrder: string[]; currentTurnIndex: number } }