/**
 * Runtime verification for the BALANCE task: economy bounds + per-turn
 * resource clamps, both at the helper level and through the real
 * characterReducer UPDATE_NARRATION path.
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

// 2. Minimal localStorage shim (logger/storage deps).
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

let failures = 0;
function eq(actual: unknown, expected: unknown, label: string) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a !== e) { console.log(`FAIL ${label}: expected ${e}, got ${a}`); failures++; }
  else { console.log(`ok   ${label} -> ${a}`); }
}

import * as gu from "../lib/gameUtils";
import { MAX_XP_PER_EVENT, MAX_STAMINA_CHANGE_PER_TURN, MAX_MANA_CHANGE_PER_TURN } from "../lib/constants";
type Action = import("../context/game-actions").Action;

// ---------------------------------------------------------------------------
// Part 1: XP reward economy helpers
// ---------------------------------------------------------------------------
eq(gu.getXpRewardRange("Trivial"), [0, 5], "range Trivial");
eq(gu.getXpRewardRange("Normal"), [20, 40], "range Normal");
eq(gu.getXpRewardRange("Very Hard"), [70, 110], "range Very Hard");
eq(gu.getXpRewardRange("Impossible"), [120, 200], "range Impossible");
eq(gu.getXpRewardRange("Hard", "Nightmare"), [60, 105], "Hard x Nightmare = x1.5");
eq(gu.getXpRewardRange("Normal", "easy"), [15, 30], "Normal x easy = x0.75");
eq(gu.getXpRewardRange(null, null), [20, 40], "missing tier -> Normal default");
eq(gu.getXpRewardRange("Bogus" as never), [20, 40], "unknown tier -> Normal default");

eq(gu.clampXpGained(35), 35, "xp normal value passes");
eq(gu.clampXpGained(5000), MAX_XP_PER_EVENT, "xp capped at MAX_XP_PER_EVENT");
eq(gu.clampXpGained(-50), 0, "negative xp floored to 0");
eq(gu.clampXpGained(12.9), 12, "xp floored to integer");
eq(gu.clampXpGained(undefined), 0, "undefined -> 0");
eq(gu.clampXpGained(NaN), 0, "NaN -> 0");
eq(gu.clampXpGained("100" as never), 0, "string rejected -> 0");

// ---------------------------------------------------------------------------
// Part 2: per-turn resource delta clamps (helper level)
// ---------------------------------------------------------------------------
const maxHealth = 70; // stamina 5 => 50 + 4*5
eq(gu.clampResourceChange(999, "health", maxHealth), 35, "heal +999 clamped to half max");
eq(gu.clampResourceChange(-999, "health", maxHealth), -35, "damage -999 clamped to -half max");
eq(gu.clampResourceChange(-10, "health", maxHealth), -10, "normal damage passes through");
eq(gu.clampResourceChange(20, "stamina", 60), 20, "stamina within cap passes");
eq(gu.clampResourceChange(80, "stamina", 60), 30, "stamina over cap clamped");
eq(gu.clampResourceChange(-80, "mana", 25), -30, "mana drain clamped");
eq(gu.clampResourceChange(undefined, "mana", 25), 0, "undefined delta -> 0");
eq(gu.clampResourceChange(Infinity, "health", 70), 0, "non-finite rejected");
eq(gu.clampResourceChange(0, "health", 70), 0, "zero stays zero");

// ---------------------------------------------------------------------------
// Part 3: enforcement through the REAL characterReducer (UPDATE_NARRATION)
// ---------------------------------------------------------------------------
const { characterReducer } = require("../context/reducers/characterReducer");
const { initialCharacterState } = require("@/context/game-initial-state");

function narrate(from: typeof initialCharacterState | null, payload: Partial<import("../types/adventure-types").StoryLogEntry>): ReturnType<typeof characterReducer> {
  return characterReducer(from, {
    type: "UPDATE_NARRATION",
    payload: {
      narration: "test",
      updatedGameState: "test",
      timestamp: Date.now(),
      turnNumber: 1,
      ...payload,
    } as any,
  } as Action);
}

// 3a. Absurd AI XP is capped before reaching the character.
// Curve: L1->100, L2->193 => capped 200 xp = level 2 with 100 leftover.
const afterBigXp = narrate(initialCharacterState, { xpGained: 5000 });
eq(afterBigXp!.xp, MAX_XP_PER_EVENT - calculateXpToNextLevelSafe(1),
  "reducer: xpGained=5000 stored as cap minus L1 threshold");
eq(afterBigXp!.level, 2, "reducer: level-up to 2 follows capped XP");
eq(afterBigXp!.xpToNextLevel, calculateXpToNextLevelSafe(2), "reducer: next threshold recalculated");

// 3b. Negative AI XP cannot demote the character.
const afterNegXp = narrate(initialCharacterState, { xpGained: -100 });
eq(afterNegXp!.xp, initialCharacterState.xp, "reducer: negative xp ignored");
eq(afterNegXp!.level, initialCharacterState.level, "reducer: no level change on negative xp");

// 3c. Resource spikes are clamped per turn (start from damaged state so
// clamping is actually observable).
const woundedChar = { ...initialCharacterState, currentHealth: 20 };
const afterHeal = narrate(woundedChar, { healthChange: 500 });
eq(afterHeal!.currentHealth,
  Math.min(initialCharacterState.maxHealth, 20 + Math.floor(initialCharacterState.maxHealth / 2)),
  "reducer: heal spike clamped to half max HP");
eq(narrate(woundedChar, { healthChange: 500 })!.currentHealth, 55,
  "reducer: exact heal-clamp value 20+35");

const tiredChar = { ...initialCharacterState, currentStamina: 55 };
const afterDrain = narrate(tiredChar, { staminaChange: -500 });
eq(afterDrain!.currentStamina,
  Math.max(0, initialCharacterState.currentStamina - MAX_STAMINA_CHANGE_PER_TURN),
  "reducer: stamina drain clamped to flat per-turn cap");

const drainedMage = { ...initialCharacterState, currentMana: 40 };
const afterManaDrain = narrate(drainedMage, { manaChange: -500 });
eq(afterManaDrain!.currentMana, 40 - MAX_MANA_CHANGE_PER_TURN, "reducer: mana drain clamped to flat per-turn cap");

const boostedMage = { ...initialCharacterState, currentMana: 20 };
const afterManaBoost = narrate(boostedMage, { manaChange: 500 });
eq(afterManaBoost!.currentMana,
  Math.min(initialCharacterState.maxMana, 20 + MAX_MANA_CHANGE_PER_TURN),
  "reducer: mana boost clamped and capped at max");

// 3d. Normal gameplay deltas pass through untouched.
const afterNormal = narrate(initialCharacterState, { healthChange: -5, xpGained: 25 });
eq(afterNormal!.currentHealth, initialCharacterState.currentHealth - 5, "reducer: normal damage exact");
eq(afterNormal!.xp, initialCharacterState.xp + 25, "reducer: normal xp exact");

// 3e. HP floor at 0.
const lowHpChar = { ...initialCharacterState, currentHealth: 3 };
const afterKillBlow = narrate(lowHpChar, { healthChange: -50 });
eq(afterKillBlow!.currentHealth, 0, "reducer: HP floors at 0 on lethal narration");

console.log(failures === 0 ? "\nALL BALANCE TESTS PASSED" : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);

function calculateXpToNextLevelSafe(level: number): number {
  return gu.calculateXpToNextLevel(level);
}
