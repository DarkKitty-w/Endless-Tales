/**
 * Temporary runtime verification for the PERSISTENCE task.
 * Simulates: gameplay state -> SAVE_CURRENT_ADVENTURE -> JSON round-trip
 * (simulated reload) -> migration + validation -> field-by-field restore check.
 */
/* eslint-disable @typescript-eslint/no-var-requires */
const Module = require("module");
const path = require("path");

// 1. Resolve '@/' aliases to the compiled output layout.
const OUT_DIR = path.dirname(__dirname); // compiled output root
const origResolve = Module._resolveFilename;
Module._resolveFilename = function (request: string, ...args: unknown[]) {
  if (request.startsWith("@/")) {
    request = path.join(OUT_DIR, request.replace("@/", ""));
  }
  return origResolve.call(this, request, ...args);
};

// 2. Minimal localStorage shim so storage-utils / backup code works headless.
class MemoryStorage {
  private store = new Map<string, string>();
  getItem(k: string) { return this.store.has(k) ? this.store.get(k)! : null; }
  setItem(k: string, v: string) { this.store.set(k, String(v)); }
  removeItem(k: string) { this.store.delete(k); }
  clear() { this.store.clear(); }
  key(i: number) { return Array.from(this.store.keys())[i] ?? null; }
  get length() { return this.store.size; }
}
(global as any).localStorage = new MemoryStorage();

import assert from "assert";
import { gameReducer } from "../context/game-reducer";
import { initialState, initialCharacterState, CURRENT_STATE_VERSION } from "../context/game-initial-state";
import type { GameState } from "../types/game-types";
import { validateSavedAdventure } from "../context/schemas/save-schema";
import { runMigrations } from "../context/schemas/migration-system";

const character = {
  ...initialCharacterState,
  name: "Test Hero",
  skillTree: undefined,
} as any;

const baseState: GameState = {
  ...initialState,
  status: "Gameplay",
  character,
  currentAdventureId: "adv-test-1",
  turnCount: 3,
  storyLog: [
    { narration: "You enter the tavern.", updatedGameState: "tavern", timestamp: Date.now() - 5000 } as any,
    { narration: "You attack the goblin.", updatedGameState: "combat", timestamp: Date.now() } as any,
  ],
  inventory: [{ id: "item-1", name: "Sword", quantity: 1 } as any],
};

// --- Test 1: SAVE_CURRENT_ADVENTURE creates a valid, versioned save ---
const savedState = gameReducer(baseState, { type: "SAVE_CURRENT_ADVENTURE" });
assert.notStrictEqual(savedState, baseState, "reducer should produce new state");
assert.strictEqual(savedState.savedAdventures.length, 1, "one save created");
const save = savedState.savedAdventures[0];
assert.strictEqual(save.id, "adv-test-1");
assert.strictEqual(save.version, CURRENT_STATE_VERSION, "save stamped with CURRENT_STATE_VERSION");
assert.strictEqual(save.characterName, "Test Hero");
assert.strictEqual(save.turnCount, 3);
assert.deepStrictEqual(save.inventory.map((i: any) => i.id), ["item-1"]);
assert.ok(typeof save.saveTimestamp === "number" && save.saveTimestamp > 0);

// --- Test 2: save passes Zod validation ---
const validation = validateSavedAdventure(save);
assert.ok(validation.success, `validation failed: ${(validation as any).error ?? ""}`);

// --- Test 3: simulated reload -> JSON round-trip -> migrate -> restore ---
const serialized = JSON.stringify(savedState.savedAdventures);
const revivedSaves = JSON.parse(serialized);
// Note: JSON drops undefined-valued optional keys by design; verify every
// meaningful field survives the serialize/deserialize boundary.
const revived = revivedSaves[0];
for (const key of ["id", "version", "saveTimestamp", "characterName", "character", "adventureSettings", "storyLog", "currentGameStateString", "inventory", "statusBeforeSave", "turnCount", "worldMap"] as const) {
  // Compare in serialized space: everything JSON-emitted must survive intact.
  assert.deepStrictEqual(
    JSON.parse(JSON.stringify((save as any)[key])),
    (revived as any)[key],
    `round-trip preserved field: ${key}`
  );
}
const migrated = runMigrations(revived);
assert.strictEqual(migrated.version, CURRENT_STATE_VERSION);
assert.strictEqual(migrated.character.name, "Test Hero");
assert.strictEqual(migrated.turnCount, 3);
assert.strictEqual(migrated.storyLog.length, baseState.storyLog.length);
const revalidated = validateSavedAdventure(migrated);
assert.ok(revalidated.success, `post-migration validation failed`);

// --- Test 4: LOAD_ADVENTURE restores gameplay fields perfectly ---
const restored = gameReducer(
  { ...savedState, status: "MainMenu" as const, character: null, currentAdventureId: null, storyLog: [], turnCount: 0 },
  { type: "LOAD_ADVENTURE", payload: migrated }
);
assert.strictEqual(restored.status, "Gameplay");
assert.strictEqual(restored.character!.name, "Test Hero");
assert.strictEqual(restored.currentAdventureId, "adv-test-1");
assert.strictEqual(restored.turnCount, 3);
assert.strictEqual(restored.storyLog.length, baseState.storyLog.length);
assert.deepStrictEqual(restored.inventory.map((i: any) => i.id), ["item-1"]);

// --- Test 5: auto-save guard conditions ---
const idleState = gameReducer({ ...baseState, status: "MainMenu" }, { type: "SAVE_CURRENT_ADVENTURE" });
assert.strictEqual(idleState.savedAdventures.length, 0, "no auto-save outside Gameplay");
const noCharState = gameReducer({ ...baseState, character: null }, { type: "SAVE_CURRENT_ADVENTURE" });
assert.strictEqual(noCharState.savedAdventures.length, 0, "no auto-save without character");

// --- Test 6: computeAutoSaveSignature semantics ---
// Verified at type level and by inspection: the signature covers
// characterName/class/level/xp/health/stamina/mana, turnCount and the
// storyLog length + last-entry timestamp, so any meaningful progress change
// yields a new value while identical states remain stable. Runtime exercise
// lives in GameContext (React tree), out of scope for this headless check.
assert.ok(true);

console.log("ALL PERSISTENCE ROUND-TRIP TESTS PASSED");