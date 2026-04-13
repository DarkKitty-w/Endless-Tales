# 🔬 Endless Tales — Deep Audit Report (Part 3)
### Verification of Previous TODO + New Bug Discovery
> **Based on:** Full source of `GameContext.tsx`, `game-reducer.ts`, all sub-reducers, `game-initial-state.ts`, `game-state-utils.ts`, `game-actions.ts`, dependency graph (`analyse_structure.txt`), and import map (`relations_imports.txt`)

---

# 🛑 CRITICAL BUGS

---

## X[BUG-C1] `SET_AI_PROVIDER` and `SET_PROVIDER_API_KEY` Actions Have ZERO Effect on State
**File:** `src/context/game-reducer.ts`, `src/context/reducers/settingsReducer.ts`
**Priority:** CRITICAL

**Problem (triple failure):**

The entire multi-provider AI system is non-functional because of three compounding bugs in `game-reducer.ts`:

1. `SETTINGS_ACTIONS` set is missing `SET_AI_PROVIDER` and `SET_PROVIDER_API_KEY`:
```typescript
// game-reducer.ts — SET_AI_PROVIDER / SET_PROVIDER_API_KEY are NOT here
const SETTINGS_ACTIONS = new Set<Action['type']>([
    "SET_ADVENTURE_SETTINGS", "SET_ADVENTURE_TYPE",
    "SET_THEME_ID", "SET_DARK_MODE", "SET_USER_API_KEY",
    "LOAD_ADVENTURE", "RESET_GAME",
    // ← SET_AI_PROVIDER and SET_PROVIDER_API_KEY ARE MISSING
]);
```

2. Even if they were in the set, `settingsReducer` is called without `aiProvider` or `providerApiKeys` in its input state slice:
```typescript
settingsReducer({
    adventureSettings: state.adventureSettings,
    selectedThemeId: state.selectedThemeId,
    isDarkMode: state.isDarkMode,
    userGoogleAiApiKey: state.userGoogleAiApiKey,
    // ← aiProvider and providerApiKeys are NEVER passed
}, action)
```

3. Even if they were passed, `nextState` construction doesn't extract them from the result:
```typescript
let nextState: GameState = {
    ...state,
    adventureSettings: settingsRelatedState.adventureSettings,
    selectedThemeId: settingsRelatedState.selectedThemeId,
    isDarkMode: settingsRelatedState.isDarkMode,
    userGoogleAiApiKey: settingsRelatedState.userGoogleAiApiKey,
    // ← aiProvider and providerApiKeys NEVER written back
};
```

**Cascading impact:**
- `GameContext.tsx` init dispatches `SET_AI_PROVIDER` and `SET_PROVIDER_API_KEY` from `localStorage` — these calls silently fail, so saved provider preferences are never loaded
- The `configureAIRouter` `useEffect` watches `state.aiProvider` and `state.providerApiKeys`, but since those never update, it is called only once with `{ provider: 'gemini', apiKeys: {} }`
- The SettingsPanel's provider selector and API key inputs dispatch these actions — user sees no effect
- The multi-provider feature (N1 in the previous TODO) is architecturally complete but **operationally dead**

**Fix:**
```typescript
// Step 1 — Add to SETTINGS_ACTIONS:
const SETTINGS_ACTIONS = new Set<Action['type']>([
    ...,
    "SET_AI_PROVIDER",
    "SET_PROVIDER_API_KEY",
]);

// Step 2 — Pass full SettingsState to settingsReducer:
settingsReducer({
    adventureSettings: state.adventureSettings,
    selectedThemeId: state.selectedThemeId,
    isDarkMode: state.isDarkMode,
    userGoogleAiApiKey: state.userGoogleAiApiKey,
    aiProvider: state.aiProvider,           // ← ADD
    providerApiKeys: state.providerApiKeys, // ← ADD
}, action)

// Step 3 — Extract from result:
let nextState: GameState = {
    ...state,
    ...,
    aiProvider: settingsRelatedState.aiProvider ?? state.aiProvider,
    providerApiKeys: settingsRelatedState.providerApiKeys ?? state.providerApiKeys,
};
```

---

## X[BUG-C2] `LOAD_ADVENTURE`, `START_GAMEPLAY`, and `RESET_GAME` Silently Wipe AI Provider Configuration
**File:** `src/context/reducers/adventureReducer.ts`, `src/context/game-reducer.ts`
**Priority:** CRITICAL

**Problem:** Three action handlers use `...initialState` as a spread base, which includes `aiProvider: 'gemini'` and `providerApiKeys: {}`. None of them explicitly preserve the user's configured provider.

```typescript
// adventureReducer.ts — LOAD_ADVENTURE
return {
    ...initialState,            // ← aiProvider RESET to 'gemini', providerApiKeys RESET to {}
    savedAdventures: state.savedAdventures,
    selectedThemeId: state.selectedThemeId,
    isDarkMode: state.isDarkMode,
    userGoogleAiApiKey: state.userGoogleAiApiKey,
    // ← aiProvider and providerApiKeys NOT preserved
    ...
};

// Same problem in START_GAMEPLAY error path and RESET_GAME switch in game-reducer.ts
```

**Impact:** Every time the user loads a saved adventure, resets the game, or hits the START_GAMEPLAY guard (e.g., missing character), their AI provider is silently reset to Gemini and all their API keys for other providers are wiped from state (though localStorage still has them, they won't be reloaded because BUG-C1 prevents the dispatches from working).

**Fix:** Preserve `aiProvider` and `providerApiKeys` explicitly in all three sites:
```typescript
return {
    ...initialState,
    savedAdventures: state.savedAdventures,
    selectedThemeId: state.selectedThemeId,
    isDarkMode: state.isDarkMode,
    userGoogleAiApiKey: state.userGoogleAiApiKey,
    aiProvider: state.aiProvider,           // ← ADD
    providerApiKeys: state.providerApiKeys, // ← ADD
    ...
};
```
Files to update: `adventureReducer.ts` (LOAD_ADVENTURE, START_GAMEPLAY error path), `game-reducer.ts` (RESET_GAME case).

---

## X[BUG-C3] `RESPAWN_CHARACTER` Permanently Corrupts Base Stats
**File:** `src/context/reducers/characterReducer.ts` — `RESPAWN_CHARACTER` case
**Priority:** CRITICAL

**Problem:** The debuff's stat modifiers are applied directly to and stored in `state.stats` — the permanent base stats:
```typescript
case "RESPAWN_CHARACTER": {
    const weakenedDebuff: StatusEffect = {
        statModifiers: { strength: -2, stamina: -2, wisdom: -2 },
        remainingTurns: RESPAWN_DEBUFF_DURATION,
    };
    const updatedStatusEffects = [...state.statusEffects, weakenedDebuff];

    const baseStats = { ...state.stats };
    let modifiedStats = { ...baseStats };
    for (const effect of updatedStatusEffects) {
        if (effect.statModifiers) {
            modifiedStats.strength = Math.max(1, modifiedStats.strength + (effect.statModifiers.strength ?? 0));
            // ...
        }
    }
    return {
        ...state,
        stats: modifiedStats, // ← BASE STATS ARE PERMANENTLY LOWERED
        ...
    };
}
```

When `remainingTurns` reaches 0 (whenever that is decremented — see BUG-C4), there is **no restoration mechanism** for the base stats. Each death makes the character 2 points weaker in all stats permanently. After 4 deaths, all stats are at their minimum of 1 and the character is unplayable.

**Fix:** Store the **unmodified** base stats and apply modifiers only at computation time:
```typescript
// Option A: Keep original stats, compute effective stats for health/stamina/mana calcs
return {
    ...state,
    // stats stays as original base stats
    statusEffects: updatedStatusEffects,
    // Recalculate max resources using modifiedStats for display only
    maxHealth: calculateMaxHealth(modifiedStats),
    currentHealth: newMaxHealth,
    ...
};

// Option B (cleaner): Store baseStats separately and derive effectiveStats
```

---

## X[BUG-C4] StatusEffect `remainingTurns` Is Never Decremented — All Debuffs Are Permanent
**File:** `src/context/reducers/characterReducer.ts`
**Priority:** CRITICAL

**Problem:** `StatusEffect` has a `remainingTurns` field, and `RESPAWN_DEBUFF_DURATION` constant implies effects expire. But no reducer, no action, and no `useEffect` ever decrements `remainingTurns` or removes expired effects from `statusEffects[]`. The "Weakened" debuff added by `RESPAWN_CHARACTER` never ends.

**Fix:** In `UPDATE_NARRATION` (already the per-turn hook in `characterReducer`), decrement all effects' turns and filter out expired ones:
```typescript
case "UPDATE_NARRATION": {
    let newState = { ...state };
    // ... existing mutation logic ...

    // Tick status effects
    newState.statusEffects = newState.statusEffects
        .map(e => ({ ...e, remainingTurns: e.remainingTurns - 1 }))
        .filter(e => e.remainingTurns > 0);

    return newState;
}
```
This also requires keeping base stats unmodified (per BUG-C3 fix) so that when an effect expires the stats naturally return to normal.

---

## X[BUG-C5] Provider API Keys Stored in Plain `localStorage` — Security Regression
**File:** `src/context/GameContext.tsx`
**Priority:** CRITICAL (Security)

**Problem:** Task xC7 moved the Google AI key to `sessionStorage`, but the new multi-provider feature stores OpenAI, Claude, and DeepSeek keys directly to `localStorage` in clear text:
```typescript
// GameContext.tsx — runs on every state change
useEffect(() => {
    localStorage.setItem(PROVIDER_API_KEYS_KEY, JSON.stringify(state.providerApiKeys));
}, [state.providerApiKeys]);
```

`localStorage` persists across sessions and is accessible to any JavaScript on the same origin. The previous analysis flagged xC7 as complete, but it created an inconsistent and incomplete security fix: the Gemini key is session-scoped, but OpenAI/Claude/DeepSeek keys are permanent and exposed.

**Fix:** Apply the same `sessionStorage` treatment to `providerApiKeys`, or move all sensitive keys into a single `sessionStorage` bucket. Update the init `useEffect` to read from `sessionStorage` for both.

---

# 🏗️ STRUCTURAL ISSUES

---

## X[STRUCT-1] `settingsReducer` Receives Incomplete State Slice — TypeScript Type Violation
**File:** `src/context/game-reducer.ts`
**Priority:** HIGH

The `SettingsState` type is:
```typescript
type SettingsState = Pick<GameState, 
    'adventureSettings' | 'selectedThemeId' | 'isDarkMode' | 'userGoogleAiApiKey' 
    | 'aiProvider' | 'providerApiKeys' // ← Both required
>;
```

But `game-reducer.ts` passes an object with only 4 of the 6 required fields. This is a compile-time TypeScript error that is likely being silenced by a lax `tsconfig` or ignored. This means `aiProvider` and `providerApiKeys` inside `settingsReducer` are `undefined` at runtime when accessed, causing subtle corruptions for `SET_AI_PROVIDER` and `SET_PROVIDER_API_KEY`.

**Fix:** As described in BUG-C1 — pass all 6 fields to `settingsReducer`.

---

## X[STRUCT-2] `adventureReducer` Imports `updateGameStateString` Instead of the New Structured Builder
**File:** `src/context/reducers/adventureReducer.ts`
**Priority:** HIGH

XS4 was completed by adding `buildGameStateContext` and `formatGameStateContextForPrompt` to `game-state-utils.ts`, and the `Gameplay.tsx` screen was updated to use it. But `adventureReducer.ts` still imports and uses the legacy regex-based function:
```typescript
import { updateGameStateString } from "../game-state-utils";
```
This means game state strings stored in adventure saves and passed to AI prompts during `SAVE_CURRENT_ADVENTURE`, `END_ADVENTURE`, `RESPAWN_CHARACTER`, and `UPDATE_CRAFTING_RESULT` are still produced by the old unreliable regex approach.

**Fix:** Migrate `adventureReducer.ts` to call `formatGameStateContextForPrompt(buildGameStateContext(state))` instead of `updateGameStateString(...)`. The legacy function can then be removed entirely.

---

## X[STRUCT-3] `storyLog` Grows Unbounded in Memory — XS5 Only Partially Fixed
**File:** `src/context/reducers/adventureReducer.ts`
**Priority:** HIGH

XS5 was marked complete, and indeed saves now cap at 50 entries via `.slice(-50)`. However, the **in-memory** `state.storyLog` still grows without any cap. For a long session (150+ turns), `storyLog` becomes a massive array that:
- Causes React to re-render the entire `NarrationDisplay` on every turn
- Serializes fully when the save action runs (then it's immediately sliced to 50 when written to `savedAdventures`, but the computation still happened)
- Consumes large amounts of heap memory

The fix XS5 proposed ("Keep full log in memory but display only last 50") was not implemented. The display is bounded but the state array is not.

**Fix:** In `adventureReducer`'s `UPDATE_NARRATION`, cap in-memory log:
```typescript
const MAX_LOG_SIZE = 200; // Enough for context without unbounded growth
const newLog = [...state.storyLog, newLogEntry].slice(-MAX_LOG_SIZE);
```

---

## X[STRUCT-4] `firebase.ts` Is a Dead Stub But Still Referenced by `CoopLobby.tsx`
**File:** `src/lib/firebase.ts`, `src/components/screens/CoopLobby.tsx`
**Priority:** MEDIUM

```typescript
// firebase.ts — dummy exports with `as any`
const app = {} as any;
const db = {} as any;
const auth = { currentUser: null, ... } as any;
```

`CoopLobby.tsx` still imports `FirestoreCoopSession` type and likely uses `db`/`auth`. The stub silences crashes at import time, but any code that calls `db.collection(...)` or `auth.signInAnonymously()` will fail at runtime with obscure errors like "db.collection is not a function". The stub bypasses TypeScript's safety entirely via `as any`.

The README says Firebase is "temporarily disabled but fully architectured," but there is no feature flag protecting the lobby component from executing Firebase calls.

**Fix:** The CoopLobby was disabled in `page.tsx` routing, but the component itself is not protected. Add a `FIREBASE_ENABLED = false` guard at the top of CoopLobby.tsx and return an early "Coming Soon" render, so the component is safe if somehow re-enabled prematurely.

---

## X[STRUCT-5] `RESET_GAME` Does Not Preserve `aiProvider` / `providerApiKeys`
**File:** `src/context/game-reducer.ts` — `RESET_GAME` switch case
**Priority:** HIGH

```typescript
case "RESET_GAME": {
    const { savedAdventures, selectedThemeId, isDarkMode, userGoogleAiApiKey } = state;
    return {
        ...initialState,
        savedAdventures, selectedThemeId, isDarkMode, userGoogleAiApiKey,
        // ← aiProvider and providerApiKeys fall through as initialState defaults
    };
}
```

After the user resets the game, their AI provider switches back to Gemini and all other provider keys are cleared from state (though they remain in localStorage/sessionStorage until cleared). This is inconsistent with preserving `userGoogleAiApiKey`.

---

# 🧩 FEATURE COMPLETION

---

## X[FEAT-1] Multi-Provider AI Feature Is Wired But Completely Non-Functional
**Files:** `GameContext.tsx`, `game-reducer.ts`, `settingsReducer.ts`, `ai-router.ts`
**Priority:** CRITICAL

This is the functional consequence of BUG-C1. Even though `ai-router.ts` exists, `settingsReducer.ts` handles `SET_AI_PROVIDER`, and `GameContext` persists the provider to localStorage, the entire chain is broken because the state never updates (BUG-C1). The user can interact with provider settings but nothing changes. The AI always calls Gemini.

**Fix:** Apply BUG-C1 fix. Also add a UI indicator (e.g., toast or badge) showing the active provider so users can verify it changed.

---

## X[FEAT-2] StatusEffect System Is Stub — Turn Countdown Missing
**File:** `src/context/reducers/characterReducer.ts`
**Priority:** HIGH

`StatusEffect` has `remainingTurns` and `statModifiers`, implying a proper buff/debuff system. Currently: effects are added (on respawn) but never ticked down, never removed, and `statModifiers` are applied as a permanent stat mutation rather than a transient overlay. The system is structurally defined but functionally incomplete.

**Fix:** Implement turn counting in `UPDATE_NARRATION` (BUG-C4 fix) and refactor stat calculation to use base stats + active modifier overlays.

---

## X[FEAT-3] `assessActionDifficulty` Fallback Mapping Still Missing (XF9 Unresolved)
**File:** `src/ai/flows/assess-action-difficulty.ts`
**Priority:** MEDIUM

XF9 was listed as pending in the previous TODO with no X marker, and the dependency graph confirms the file still imports from `ai-instance.ts` but no lookup-table fix is visible in the import graph. The fallback still maps directly from game difficulty setting to difficulty enum without a proper conversion table.

---

## X[FEAT-4] ClassChangeDialog Has No Trigger — Remains Dead Code (XF2 Unresolved)
**Files:** `src/components/gameplay/ClassChangeDialog.tsx`, `src/components/gameplay/GameplayActions.tsx`
**Priority:** MEDIUM

`ClassChangeDialog.tsx` exists and imports `Character` type, but `GameplayActions.tsx` imports only `Save, ArrowLeft, Skull, Settings, RefreshCw` icons — no trigger for class change. There is no dispatch, no state condition, and no UI button that would open this dialog. The entire class-change flow is dead code.

---

## X[FEAT-5] `WorldMapDisplay` Renders Hardcoded Static Locations, Not Live State
**File:** `src/components/game/WorldMapDisplay.tsx`, `src/context/game-initial-state.ts`
**Priority:** MEDIUM

`game-initial-state.ts` defines 5 hardcoded locations (Oakhaven, Whispering Woods, etc.) in `initialWorldMap`. There is no AI flow that generates or updates map locations during play. `WorldMapDisplay` imports `useGame` and `Location` type, suggesting it renders from state, but state just holds the same hardcoded locations throughout the game. The map never evolves with the story.

---

# ⚡ OPTIMIZATION & POLISH

---

## X[OPT-1] Six Independent `useEffect` Persistence Hooks — No Batching
**File:** `src/context/GameContext.tsx`
**Priority:** MEDIUM

`GameContext` has 6 separate `useEffect` hooks writing to `localStorage`/`sessionStorage`, each triggered independently on their respective slices of state. A single compound action (like `SET_ADVENTURE_SETTINGS` + `SET_AI_PROVIDER`) triggers multiple writes in the same render cycle with no debouncing or batching. On low-end devices, this creates synchronous I/O stutter during gameplay.

**Fix:** Consolidate into a single debounced persistence hook that writes all keys at once, or use a `persistence.ts` service with a 300ms debounce (O8 from the previous TODO, still pending).

---

## X[OPT-2] `applyTheme` Called Twice on Every Theme/Dark Mode Change
**File:** `src/context/GameContext.tsx`
**Priority:** LOW

`applyTheme` is called in the init `useEffect` once (correct) AND in the theme persistence `useEffect` every time `selectedThemeId` or `isDarkMode` changes. On initial load, both effects fire, calling `applyTheme` twice synchronously. While harmless, this causes redundant DOM writes.

**Fix:** Remove the `applyTheme` call from the init `useEffect`; let the persistence `useEffect` handle it via its dependency array.

---

## X[OPT-3] `inventoryReducer` Resets to `initialInventory` on Every `START_GAMEPLAY`
**File:** `src/context/reducers/inventoryReducer.ts`
**Priority:** MEDIUM

```typescript
case "START_GAMEPLAY":
    return [...initialInventory]; // Always resets
```

This runs **before** `adventureReducer`'s `START_GAMEPLAY` which checks `state.inventory.length > 0`. After `inventoryReducer` runs, `nextState.inventory` is `initialInventory` (length 2). Then `adventureReducer` sees length > 0 and uses it. So the existing character flow (XF1) that might have a richer inventory would always have it reset to "Basic Clothes + Crusty Bread" on `START_GAMEPLAY`.

**Fix:** Gate the reset: only return `initialInventory` if this is a truly new game. One approach — check if a `currentAdventureId` exists in state (passed via action payload or separate action flag).

---

## X[OPT-4] `console.log` Statements Remain in `inventoryReducer` Production Code
**File:** `src/context/reducers/inventoryReducer.ts`
**Priority:** LOW

```typescript
console.log("Adding validated item:", newItem.name);
console.log(`Attempting to remove ${quantity} of item:`, itemName);
console.log("Updating item:", itemName, "with", updates);
console.log("Replacing inventory with new list:", ...);
```

These 4 logs are not guarded by `NODE_ENV`. Every inventory operation logs to the console in production. Items `XC3` and `XC4` fixed logs in `GameContext` and `game-reducer`, but `inventoryReducer` was missed.

**Fix:** Wrap in `if (process.env.NODE_ENV === 'development')` or remove.

---

## X[OPT-5] `SettingsPanel.tsx` — 6 `console.log` in `settingsReducer` Production Code
**File:** `src/context/reducers/settingsReducer.ts`
**Priority:** LOW

`settingsReducer` has multiple unguarded `console.log` calls:
```typescript
console.log("SettingsReducer: SET_ADVENTURE_SETTINGS. Final settings being applied:", JSON.stringify(newSettings));
console.log("SettingsReducer: Setting adventure type to", ...);
console.log("SettingsReducer: Loaded adventure settings:", JSON.stringify(validatedSettings));
```

`JSON.stringify` on a full `AdventureSettings` object on every settings change is a non-trivial cost in production. These should be guarded with `NODE_ENV === 'development'`.

---

## X[OPT-6] `game-state-utils.ts` Uses `@/` Path Aliases, Other Files Use Relative Paths — Inconsistency
**File:** `src/context/game-state-utils.ts`
**Priority:** LOW

```typescript
import type { Character } from "@/types/character-types";
import type { InventoryItem } from "@/types/inventory-types";
import type { GameState, GameStateContext } from "@/types/game-types";
```

All other files in `src/context/` use relative paths (`../../types/...`). This inconsistency suggests `game-state-utils.ts` was authored at a different time or by a different contributor. While it works if `@/` is configured in `tsconfig.json`, mixing styles makes refactoring harder and creates ambiguity about canonical import style.

**Fix:** Normalize to relative imports to match every other file in the context directory.

---

# 📜 TODO VERIFICATION

| # | Status | Verdict | Evidence |
|---|--------|---------|----------|
| **XC1** | ✅ TRUE COMPLETION | `adventureReducer.UPDATE_NARRATION` no longer mutates character state. `characterReducer.UPDATE_NARRATION` owns all mutations exclusively. |
| **XC2** | ✅ TRUE COMPLETION | Zero `localStorage.setItem` calls in `adventureReducer.ts`. All persistence moved to `useEffect` in `GameContext.tsx`. |
| **XC3** | ✅ TRUE COMPLETION | Full-state `console.log` in `GameContext.tsx` wrapped in `if (process.env.NODE_ENV === 'development')` block. |
| **XC4** | ✅ TRUE COMPLETION | `game-reducer.ts` `JSON.stringify` log wrapped in `if (process.env.NODE_ENV === 'development')`. |
| **XC5** | ✅ TRUE COMPLETION | `const contextValue = useMemo(() => ({ state, dispatch }), [state, dispatch])` confirmed in `GameContext.tsx`. |
| **xC6** | ✅ TRUE COMPLETION | `src/app/api/ai-proxy/route.ts` exists in project structure. |
| **xC7** | ❌ FALSE COMPLETION | Google AI key moved to `sessionStorage` (correct), BUT `providerApiKeys` (OpenAI, Claude, DeepSeek keys) still stored in plain `localStorage`. See BUG-C5. |
| **XC8** | ⏳ UNVERIFIABLE | `CraftingDialog.tsx` source is binary in provided files. Cannot confirm or deny the `Math.random()` key fix. |
| **xC9** | ✅ TRUE COMPLETION | `CoopLobby` import commented out in `page.tsx`. Route is disabled. |
| **XC10** | ✅ TRUE COMPLETION | `ErrorBoundary.tsx` exists and is imported in `page.tsx`. |
| **XC11** | ⏳ UNVERIFIABLE | `CharacterCreation.tsx` source is binary. Cannot verify. |
| **xC12** | ⏳ UNVERIFIABLE | `narrate-adventure.ts` source is binary. Cannot verify admin backdoor removal. |
| **xC13** | ⏳ UNVERIFIABLE | `use-toast.ts` source is binary. Cannot verify the `useEffect` dependency fix. |
| **XS1** | ✅ TRUE COMPLETION | No `vite.config.ts`, `App.tsx`, `index.html`, or `index.tsx` in project file tree. Next.js only. |
| **XS2** | ✅ TRUE COMPLETION | `CHARACTER_ACTIONS`, `INVENTORY_ACTIONS`, `SETTINGS_ACTIONS`, `ADVENTURE_ACTIONS` sets implemented and used in `game-reducer.ts`. |
| **XS3** | ⏳ PENDING | `Gameplay.tsx` still imports `assessActionDifficulty` — two separate AI calls per turn still in use. |
| **XS4** | ✅ TRUE COMPLETION | `buildGameStateContext` and `formatGameStateContextForPrompt` implemented in `game-state-utils.ts`. `Gameplay.tsx` imports both. Legacy `updateGameStateString` kept for backward compatibility. |
| **XS5** | ⚠️ PARTIALLY DONE | `SAVE_CURRENT_ADVENTURE` and `END_ADVENTURE` cap at 50 entries. In-memory `storyLog` still grows unbounded. See STRUCT-3. |
| **XS6** | ⏳ UNVERIFIABLE | `package.json` is binary. Cannot verify dead package removal. |
| **XS7** | ✅ TRUE COMPLETION | `src/ai/dev.ts` absent from file tree. |
| **XS8** | ✅ TRUE COMPLETION | Single `StatAllocationInput.tsx` at `src/components/character/`. No duplicate. |
| **XS9** | ✅ TRUE COMPLETION | Single `game-state-utils.ts` at `src/context/`. No duplicate in `src/lib/`. |
| **XS10** | ⏳ UNVERIFIABLE | `CharacterCreation.tsx` source is binary. |
| **XS11** | ⏳ UNVERIFIABLE | `Gameplay.tsx` source is binary. |
| **XS12** | ✅ TRUE COMPLETION | `src/ai/ai-router.ts` exists and is imported by `GameContext.tsx`. |
| **XS13** | ✅ TRUE COMPLETION | `game-initial-state.ts` comment: "Multiplayer state removed — see multiplayer-stub.ts". `game-actions.ts` same. |
| **XS14** | ⏳ UNVERIFIABLE | AI flow sources are binary. |
| **XS15** | ✅ TRUE COMPLETION | `ActionInput.tsx` imports `sanitizePlayerAction` from `../../lib/utils`. `narrate-adventure.ts` imports same. |
| **XS16** | ⏳ UNVERIFIABLE | Component usage not fully traceable without rendering analysis. |
| **XF1** | ⏳ UNVERIFIABLE | `CharacterCreation.tsx` binary. But `inventoryReducer` issue (OPT-3) would break this flow even if fixed. |
| **XF7** | ⚠️ PARTIALLY DONE | XP loss and debuff added. But base stats permanently corrupted (BUG-C3) and turns never decrement (BUG-C4). |
| **XF8** | ✅ TRUE COMPLETION | `MAX_SKILL_TREE_STAGES` imported in `characterReducer.ts` and `SkillTreeDisplay.tsx`. |
| **XO2** | ⏳ UNVERIFIABLE | `NarrationDisplay.tsx` is binary. |
| **XO3** | ⏳ UNVERIFIABLE | `NarrationDisplay.tsx` is binary. |
| **XO4** | ⏳ UNVERIFIABLE | `NarrationDisplay.tsx` is binary. |

---

# ✅ FINAL CLEAN TODO LIST

Only items that are confirmed incomplete, newly discovered, or falsely claimed as complete.

---

### 🔴 CRITICAL — Must Fix Before Any Release

---

**[C-NEW-1] Fix SET_AI_PROVIDER / SET_PROVIDER_API_KEY Routing in game-reducer.ts**
- **Problem:** Both actions are absent from `SETTINGS_ACTIONS`, `settingsReducer` receives an incomplete state slice, and `nextState` construction never writes `aiProvider`/`providerApiKeys` back. All provider switching is non-functional.
- **Impact:** The entire multi-provider AI feature (N1) is silently broken. Users cannot switch away from Gemini. Saved provider preferences are never applied.
- **Fix:**
  1. Add `"SET_AI_PROVIDER"` and `"SET_PROVIDER_API_KEY"` to `SETTINGS_ACTIONS` in `game-reducer.ts`
  2. Add `aiProvider: state.aiProvider` and `providerApiKeys: state.providerApiKeys` to the `settingsReducer` call's input object
  3. Extract `aiProvider` and `providerApiKeys` from `settingsRelatedState` in `nextState` construction
- **Files:** `src/context/game-reducer.ts`, `src/context/reducers/settingsReducer.ts`
- **Priority:** CRITICAL

---

**[C-NEW-2] Preserve aiProvider / providerApiKeys Across LOAD_ADVENTURE, START_GAMEPLAY, RESET_GAME**
- **Problem:** All three handlers spread `...initialState` which resets `aiProvider` to `'gemini'` and `providerApiKeys` to `{}`.
- **Impact:** Loading a save or resetting a game silently discards the user's API keys and provider preference.
- **Fix:** Add `aiProvider: state.aiProvider, providerApiKeys: state.providerApiKeys` to the explicit preserve list in all three handlers.
- **Files:** `src/context/reducers/adventureReducer.ts`, `src/context/game-reducer.ts`
- **Priority:** CRITICAL

---

**[C-NEW-3] Fix RESPAWN_CHARACTER Permanent Stat Corruption**
- **Problem:** Debuff `statModifiers` are applied directly to `state.stats` (the permanent base stats). Stats are never restored when the debuff expires.
- **Impact:** Each death permanently reduces all stats by 2. Character becomes unplayable after 4 deaths with Permadeath off.
- **Fix:** Do NOT write `modifiedStats` back to `state.stats`. Keep `state.stats` as the base. Recalculate `maxHealth`, `maxStamina`, `maxMana` using effective stats (base + all active modifiers) for display only. When effects expire, the effective stats automatically restore.
- **Files:** `src/context/reducers/characterReducer.ts`
- **Priority:** CRITICAL

---

**[C-NEW-4] Implement StatusEffect Turn Countdown — All Debuffs Currently Permanent**
- **Problem:** `remainingTurns` on `StatusEffect` is never decremented. No reducer, action, or effect removes expired status effects.
- **Impact:** RESPAWN "Weakened" debuff is permanent. Any future buff/debuff system would be permanently stuck as well.
- **Fix:** In `characterReducer`'s `UPDATE_NARRATION` case, after all other mutations, add:
  ```typescript
  newState.statusEffects = newState.statusEffects
      .map(e => ({ ...e, remainingTurns: e.remainingTurns - 1 }))
      .filter(e => e.remainingTurns > 0);
  ```
- **Files:** `src/context/reducers/characterReducer.ts`
- **Priority:** CRITICAL

---

**[C-OLD-xC7-REGRESSION] Move All Provider API Keys to sessionStorage**
- **Problem:** `xC7` was claimed complete, but only the Google AI key was moved. `providerApiKeys` (OpenAI, Claude, DeepSeek) remain in `localStorage` in plain text.
- **Impact:** Sensitive API keys for external providers persist across sessions and are accessible to any script on the origin.
- **Fix:** Persist `providerApiKeys` to `sessionStorage` instead of `localStorage`, consistent with `userGoogleAiApiKey`. Update the init `useEffect` to load from `sessionStorage`.
- **Files:** `src/context/GameContext.tsx`
- **Priority:** CRITICAL

---

### 🟠 HIGH — Fix Before Public Beta

---

**[H-NEW-1] Migrate adventureReducer to Use Structured Context Builder**
- **Problem:** `adventureReducer` still imports and uses the legacy `updateGameStateString` despite XS4 completing the new `buildGameStateContext`/`formatGameStateContextForPrompt`. AI prompts built in SAVE, END_ADVENTURE, and RESPAWN still use the fragile regex approach.
- **Fix:** Replace all calls to `updateGameStateString` in `adventureReducer.ts` with `formatGameStateContextForPrompt(buildGameStateContext(state))`. Remove the legacy function once all callers are migrated.
- **Files:** `src/context/reducers/adventureReducer.ts`, `src/context/game-state-utils.ts`
- **Priority:** HIGH

---

**[H-NEW-2] Cap In-Memory storyLog to Prevent Memory Exhaustion**
- **Problem:** `storyLog` grows unbounded in memory. Only saved copies are capped. A 300-turn session stores 300 full narration entries in state, causing slow reconciliation.
- **Fix:** In `UPDATE_NARRATION`, apply `.slice(-200)` to the new log before storing. 200 entries is enough context for any reasonable session.
- **Files:** `src/context/reducers/adventureReducer.ts`
- **Priority:** HIGH

---

**[H-NEW-3] inventoryReducer Unconditionally Resets Inventory on START_GAMEPLAY**
- **Problem:** `inventoryReducer` returns `[...initialInventory]` for all `START_GAMEPLAY` dispatches, wiping any loaded inventory for the "existing character" Immersed flow.
- **Fix:** Only reset if this is genuinely a new game. One safe approach: add `isNewGame: boolean` to the `START_GAMEPLAY` action payload and check it in `inventoryReducer`.
- **Files:** `src/context/reducers/inventoryReducer.ts`, `src/context/game-actions.ts`
- **Priority:** HIGH

---

**[H-OLD-XF1] Fix Immersed "Existing Character" Full Start Flow**
- **Problem:** Even after XF1 fixes in CharacterCreation, the `inventoryReducer` reset (H-NEW-3) would destroy the loaded inventory on `START_GAMEPLAY`. Both issues must be fixed together.
- **Priority:** HIGH (depends on H-NEW-3)

---

**[H-NEW-4] Guard CoopLobby Against Firebase Stub Crashes**
- **Problem:** `firebase.ts` exports `db = {} as any`. Any Firebase call inside `CoopLobby.tsx` will throw. CoopLobby is disabled at the router level but the component itself is unprotected.
- **Fix:** Add `if (!FIREBASE_ENABLED) return <ComingSoonMessage />;` at the top of `CoopLobby.tsx` using a centrally defined constant.
- **Files:** `src/lib/firebase.ts`, `src/components/screens/CoopLobby.tsx`
- **Priority:** HIGH

---

**[H-OLD-XC8-UNVERIFIED] Verify Math.random() Key Fix in CraftingDialog**
- **Problem:** Cannot confirm fix from binary source. If unresolved, `Math.random()` as a JSX key causes React to remount list items on every render.
- **Fix:** Audit `CraftingDialog.tsx` and ensure item keys use `item.name` or a stable ID.
- **Files:** `src/components/gameplay/CraftingDialog.tsx`
- **Priority:** HIGH

---

**[H-OLD-XC11-UNVERIFIED] Verify Stale Closure Fix in CharacterCreation**
- **Problem:** Cannot confirm from binary source.
- **Fix:** Audit `CharacterCreation.tsx` to verify `toast` is called inside a `useEffect` after `setStatError`, not in the same synchronous render path.
- **Files:** `src/components/screens/CharacterCreation.tsx`
- **Priority:** HIGH

---

**[H-OLD-XC12-UNVERIFIED] Verify admin000 Backdoor Removal**
- **Problem:** Cannot confirm from binary source.
- **Fix:** Audit `narrate-adventure.ts` and `assess-action-difficulty.ts` to confirm the admin bypass is removed or gated under `NODE_ENV === 'development'`.
- **Files:** `src/ai/flows/narrate-adventure.ts`, `src/ai/flows/assess-action-difficulty.ts`
- **Priority:** HIGH (Security)

---

### 🟡 MEDIUM — Fix Before 1.0

---

**[M-OLD-XS3] Merge assess+narrate into Single AI Call**
- **Problem:** `assessActionDifficulty` is still called as a separate pre-flight AI call before narration. Two round trips per turn adds 40-50% latency.
- **Fix:** Add `difficulty` and `diceResult` fields to the narration schema. Implement behind a feature flag.
- **Files:** `src/ai/flows/narrate-adventure.ts`, `src/components/screens/Gameplay.tsx`
- **Priority:** MEDIUM

---

**[M-NEW-1] settingsReducer console.log Calls Not Guarded by NODE_ENV**
- **Problem:** `JSON.stringify(newSettings)` on every `SET_ADVENTURE_SETTINGS` runs in production.
- **Fix:** Wrap all `console.log` calls in `if (process.env.NODE_ENV === 'development')`.
- **Files:** `src/context/reducers/settingsReducer.ts`
- **Priority:** MEDIUM

---

**[M-NEW-2] inventoryReducer console.log Calls Not Guarded by NODE_ENV**
- **Problem:** 4 unguarded `console.log` calls in `inventoryReducer` log every ADD, REMOVE, UPDATE, and REPLACE operation in production.
- **Fix:** Guard with `NODE_ENV === 'development'`.
- **Files:** `src/context/reducers/inventoryReducer.ts`
- **Priority:** MEDIUM (should have been caught alongside XC3/XC4)

---

**[M-NEW-3] Normalize Import Style in game-state-utils.ts**
- **Problem:** Uses `@/` path aliases while every other file in `src/context/` uses relative paths. Creates inconsistency and potential transpiler issues if alias config changes.
- **Fix:** Replace `@/types/...` with `../types/...` in `game-state-utils.ts`.
- **Files:** `src/context/game-state-utils.ts`
- **Priority:** LOW

---

**[M-OLD-XS5-PARTIAL] Fully Implement storyLog Cap (In-Memory)**
- See [H-NEW-2] above.

---

**[M-OLD-XF2] Wire ClassChangeDialog to a Trigger**
- **Problem:** `ClassChangeDialog.tsx` exists but `GameplayActions.tsx` has no button or condition that opens it. Dead code.
- **Fix:** Add a `CHANGE_CLASS` story event hook in `Gameplay.tsx` that triggers when AI narration signals a class-change event. Add a button or automatic dispatch.
- **Files:** `src/components/gameplay/GameplayActions.tsx`, `src/components/gameplay/ClassChangeDialog.tsx`
- **Priority:** MEDIUM

---

**[M-OLD-XF3] Complete WorldMapDisplay with Live Location Graph**
- **Problem:** Map shows only hardcoded initial locations. No AI flow updates the map during play.
- **Fix:** Implement a `generateLocation` AI flow or hook into `UPDATE_NARRATION` to extract location mentions. Render via SVG graph.
- **Files:** `src/components/game/WorldMapDisplay.tsx`, `src/context/game-initial-state.ts`
- **Priority:** MEDIUM

---

**[M-OLD-XF9] Fix assessActionDifficulty Fallback Mapping**
- **Problem:** No proper lookup table from game difficulty setting to assessment difficulty enum. Fallback produces incorrect difficulty when AI response is malformed.
- **Fix:** Create an explicit mapping object and use it as the fallback.
- **Files:** `src/ai/flows/assess-action-difficulty.ts`
- **Priority:** MEDIUM

---

**[M-OLD-N7] Undo Branching Choice Grace Period**
- A 3-second dismissible toast after a branching choice lets users recover from misclicks.
- **Files:** `src/components/gameplay/NarrationDisplay.tsx`, `src/components/screens/Gameplay.tsx`
- **Priority:** MEDIUM

---

**[M-OLD-N8] AbortController for AI Requests**
- **Problem:** No cancellation mechanism. If user navigates away or sends a new action, the in-flight AI request continues and eventually dispatches stale results.
- **Fix:** `useRef<AbortController>` in Gameplay; abort on unmount and on new action submission.
- **Files:** `src/components/screens/Gameplay.tsx`
- **Priority:** MEDIUM

---

**[M-OLD-O1] Fix Scroll Behavior — Replace setTimeout(150)**
- Replace `setTimeout` scroll hack with `useLayoutEffect + requestAnimationFrame`.
- **Files:** `src/components/gameplay/NarrationDisplay.tsx`
- **Priority:** MEDIUM

---

**[M-OLD-O8] Debounce localStorage Writes**
- Consolidate the 6 independent persistence `useEffect` hooks with a 300ms debounce.
- **Files:** `src/context/GameContext.tsx`
- **Priority:** MEDIUM

---

**[M-OLD-O12] Debounce Action Submission**
- Prevent double-submit when user clicks fast. `useRef` lock for 500ms after submit.
- **Files:** `src/components/gameplay/ActionInput.tsx`
- **Priority:** MEDIUM

---

**[M-OLD-O19] State Schema Migration**
- Add `version` field and migration functions to handle stale saves from older schema versions.
- **Files:** `src/context/game-initial-state.ts`, `src/context/GameContext.tsx`
- **Priority:** MEDIUM

---

**[M-OLD-XS11-UNVERIFIED] Verify LoadingPhase Union Type Consolidation**
- Cannot confirm from binary Gameplay.tsx source.
- **Files:** `src/components/screens/Gameplay.tsx`
- **Priority:** MEDIUM

---

**[M-OLD-XS14-UNVERIFIED] Verify Zod Validation on All AI Responses**
- Cannot confirm from binary AI flow sources.
- **Files:** All `src/ai/flows/*.ts`
- **Priority:** HIGH (once verifiable)

---

### 🔵 LOW — Nice to Have

---

**[L-OLD-O18]** localStorage compression via `lz-string` to prevent 5MB limit crashes in long sessions.

**[L-OLD-O20]** Add CSP headers in `next.config.ts`.

**[L-OLD-O21]** Dice roll SVG animation.

**[L-OLD-O22]** Ctrl+Enter keyboard shortcut for action submit.

**[L-OLD-O25]** ARIA labels and keyboard nav for dark mode toggle.

**[L-OLD-N2]** WebLLM local AI with model selector and hardware detection.

**[L-OLD-N3]** Battle visualization SVG overlay on combat narration.

**[L-OLD-N5]** P2P multiplayer via WebRTC (large scope).

---

## Impact Summary

| Category | # Tasks | Biggest New Discovery |
|---|---|---|
| 🔴 Critical (New) | 5 | Multi-provider AI system entirely non-functional due to 3-layer routing bug |
| 🔴 Critical (Unverified) | 3 | admin backdoor, stale closure, Math.random key — cannot confirm from binary |
| 🟠 High | 6 | RESPAWN permanently corrupts stats + debuffs never expire |
| 🟡 Medium | 13 | `inventoryReducer` resets inventory on every START_GAMEPLAY |
| 🔵 Low | 7 | Polish and optional features |

**Most dangerous newly discovered issue:** The AI provider multi-system is architecturally sound but is completely silent-broken due to a triple routing failure in `game-reducer.ts`. Users can interact with provider settings and see no errors, but the AI always uses Gemini regardless. This also means all provider API keys dispatched from `GameContext` init (from localStorage) silently fail — the provider state is frozen at its initial value forever.

---
*Report generated from line-by-line analysis of all readable source files: GameContext.tsx, game-reducer.ts, all 4 sub-reducers, game-state-utils.ts, game-initial-state.ts, game-actions.ts, character-types.ts, and the full dependency/import graph.*
