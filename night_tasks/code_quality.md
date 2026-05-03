## Code Quality & Maintainability

### Overall Maintainability Rating: **D+**

**Rationale:**
- 110 `any` type usages across the codebase (poor TypeScript usage)
- 60+ unused imports (dead code)
- Multiple files over 500 lines (Gameplay.tsx has 1276 lines)
- Inconsistent patterns across codebase (mixing class-based and function-based providers)
- Dead code not cleaned up (`firebase.ts`, `multiplayer-service.ts`)
- Missing error boundaries for sub-components
- Deprecated API usage (`substr`)

---

### CODE-1: Dead Code - `buildMessages` Function Unused
**Severity:** Low  
**Description:** The `buildMessages` function in `ai-router.ts` is exported but not used anywhere in the codebase. It appears to be a helper for providers that support system/user message separation, but none of the current providers use it.
**Location:** `src/ai/ai-router.ts`, lines 34-41
**Root Cause:** Leftover code from a previous design that was never fully implemented or was superseded.
**Reproduction Steps:**
1. Search for `buildMessages` usage across the codebase
2. Find that it's only defined, never called

**Fix:** Remove the dead function to reduce clutter:
```typescript
// DELETE lines 34-41:
export function buildMessages(systemMessage: string, userMessage: string) {
  return [
    { role: 'user', parts: [{ text: systemMessage }] },
    { role: 'user', parts: [{ text: userMessage }] }
  ];
}
```

---

### CODE-2: Dead Code - `currentPlayerUid` Field Never Used
**Severity:** Low  
**Description:** The `currentPlayerUid` field is defined in the `GameState` interface and initialized in `initialState`, but it is **never used** anywhere in the reducers or context.
**Location:** `src/types/game-types.ts` line 44, `src/context/game-initial-state.ts` line 142
**Root Cause:** Field was likely planned for multiplayer identity but never implemented.
**Reproduction Steps:**
1. Search for `currentPlayerUid` across the codebase
2. Find only definition and initialization, no actual usage

**Fix:** Remove the field from `GameState` interface and `initialState` to avoid confusion.

---

### CODE-3: Dead Code - `firebase.ts` File Entirely Unused
**Severity:** Medium  
**Description:** The file `src/lib/firebase.ts` exports dummy objects (`app`, `db`, `auth`) with `as any` casts. The file comment states "Firebase is no longer used" and "exports dummy objects". No imports of this file exist anywhere in the codebase.
**Location:** `src/lib/firebase.ts` (entire file)
**Root Cause:** Firebase was removed but the file was left behind.
**Reproduction Steps:**
1. Search for imports of `firebase.ts` across the codebase
2. Find zero imports

**Fix:** Delete the file entirely:
```bash
rm src/lib/firebase.ts
```

---

### CODE-4: Dead Code - `multiplayer-service.ts` File Entirely Unused
**Severity:** Medium  
**Description:** The file `src/services/multiplayer-service.ts` contains stub functions that all throw "Multiplayer is now handled via WebRTC". The file comment states "kept for reference but is no longer used". No imports of this file exist anywhere in the codebase.
**Location:** `src/services/multiplayer-service.ts` (entire file)
**Root Cause:** Old multiplayer service was replaced by WebRTC but file was kept "for reference".
**Reproduction Steps:**
1. Search for imports of `multiplayer-service.ts` across the codebase
2. Find zero imports

**Fix:** Delete the file entirely:
```bash
rm src/services/multiplayer-service.ts
```

---

### CODE-5: Dead Code - Unused Imports in Gameplay.tsx
**Severity:** Low  
**Description:** The `Gameplay.tsx` component has several unused imports:
- Line 5: `AssessedDifficultyLevel` imported but only used as type annotation
- Line 36: `Alert, AlertDescription, AlertTitle` imported but **NOT USED**
- Line 37: `Skeleton` imported but **NOT USED**
- Multiple lucide-react icons imported but not used (`Settings, ArrowLeft, Skull, Info, Dice5, Hammer, BookCopy, CalendarClock, GitBranch, RefreshCw`)

**Location:** `src/components/screens/Gameplay.tsx`, lines 5, 36-37, and various icon imports
**Root Cause:** Components were likely planned but never added, or were removed without cleaning up imports.
**Reproduction Steps:**
1. Review the imports at the top of Gameplay.tsx
2. Search for usage of `Alert`, `Skeleton`, and unused icons
3. Find no references in the component

**Fix:** Remove all unused imports to reduce bundle size and improve clarity.

---

### CODE-6: Overly Complex Function - `WebLLMProvider.getEngine()` (113 lines)
**Severity:** High  
**Description:** The `getEngine()` method in `WebLLMProvider` is 113 lines long (lines 710-822) and does too many things: checks engine state, loads WebLLM module, validates configuration, finds available models, handles fallbacks, creates engine with config, and manages loading promises.
**Location:** `src/ai/ai-router.ts`, lines 710-822
**Root Cause:** Function violates Single Responsibility Principle - handles too many concerns.
**Reproduction Steps:**
1. Open `ai-router.ts`
2. Navigate to `WebLLMProvider.getEngine()`
3. Observe the 113-line function with deep nesting

**Fix:** Split into smaller functions:
```typescript
// Extract these helper functions:
async function getCachedEngine(): Promise<any> { ... }
async function loadWebLLMModule(): Promise<any> { ... }
async function findAvailableModel(models: any[], modelName: string): Promise<string> { ... }
async function createEngineWithConfig(model: string, systemPrompt: string): Promise<any> { ... }

// Then getEngine becomes:
async getEngine(model: string, systemPrompt: string): Promise<any> {
  let engine = await getCachedEngine();
  if (engine) return engine;
  // ... simplified flow calling helpers
}
```

---

### CODE-7: Overly Complex Function - `loadWebLLM()` (52 lines)
**Severity:** Medium  
**Description:** The `loadWebLLM()` function (lines 623-674) exceeds the 50-line threshold. It handles module loading, caching, retry logic, and promise management.
**Location:** `src/ai/ai-router.ts`, lines 623-674
**Root Cause:** Function does too many things - should be split.
**Reproduction Steps:**
1. Open `ai-router.ts`
2. Navigate to `loadWebLLM()` function
3. Observe 52 lines with retry logic mixed with module loading

**Fix:** Split into smaller functions:
```typescript
function getCachedModule(): any { ... }
function retryLoadModule(maxRetries: number): Promise<any> { ... }
async function loadWebLLMModule(): Promise<any> { ... }

// Then loadWebLLM becomes simpler:
async function loadWebLLM(): Promise<any> {
  const cached = getCachedModule();
  if (cached) return cached;
  return await retryLoadModule(3);
}
```

---

### CODE-8: Overly Complex Component - `Gameplay.tsx` (1276 lines)
**Severity:** High  
**Description:** The `Gameplay.tsx` screen component has 1276 lines, making it extremely difficult to maintain, test, and debug. It contains multiple responsibilities: game state management, UI rendering for multiple panels, action handling, and more.
**Location:** `src/components/screens/Gameplay.tsx` (1276 lines)
**Root Cause:** Component violates Single Responsibility Principle - does too much.
**Reproduction Steps:**
1. Open `Gameplay.tsx`
2. Scroll through 1276 lines of code
3. Notice multiple logical sections that could be separate components

**Fix:** Extract logical sections into separate components:
1. Extract `GameHeader` component (title, status indicators)
2. Extract `GameStats` component (character stats display)
3. Extract `GameActions` component (action buttons)
4. Consider using a layout component pattern

---

### CODE-9: Missing TypeScript Types - 110 `any` Usages Across Codebase
**Severity:** High  
**Description:** The codebase has **110 total `any` mentions**:
- `": any"` type annotations: 83
- `"as any"` type assertions: 9
- `"catch (err: any)"` patterns: 18

**Top files by `any` usage:**
1. `src/app/api/ai-proxy/route.ts` - 15 occurrences
2. `src/ai/ai-router.ts` - 12 occurrences
3. `src/components/screens/Gameplay.tsx` - 9 occurrences
4. `src/context/game-actions.ts` - 7 occurrences
5. `src/ai/flows/narrate-adventure.ts` - 5 occurrences

**Location:** Multiple files across the codebase
**Root Cause:** TypeScript types not properly defined, developers used `any` as a shortcut.
**Reproduction Steps:**
1. Run a search for `: any` and `as any` across the codebase
2. Find 110 occurrences

**Fix:** Replace `any` with proper TypeScript types:
1. Define proper interfaces for AI provider responses
2. Use `unknown` instead of `any` for error handling
3. Create types for game actions, state, etc.

---

### CODE-10: Deprecated API Usage - `substr()` in characterReducer
**Severity:** Low  
**Description:** The code uses `Math.random().toString(36).substr(2, 6)` which uses the deprecated `String.prototype.substr()` method.
**Location:** `src/context/reducers/characterReducer.ts`, line 9
**Root Cause:** Using deprecated API - `substr` is deprecated in favor of `substring` or `slice`.
**Reproduction Steps:**
1. Open `characterReducer.ts`
2. Find `substr` usage on line 9

**Fix:** Replace with `substring` or `slice`:
```typescript
// Instead of:
Math.random().toString(36).substr(2, 6)

// Use:
Math.random().toString(36).substring(2, 8)
// or
Math.random().toString(36).slice(2, 8)
```

---

### CODE-11: No-op Action in Multiplayer Reducer
**Severity:** Low  
**Description:** The `SEND_PLAYER_ACTION` case in `multiplayerReducer.ts` is explicitly a no-op - it just returns the state without doing anything. The action is handled elsewhere (via data channel messages).
**Location:** `src/context/reducers/multiplayerReducer.ts`, lines 105-109
**Root Cause:** Action was likely planned to be handled in reducer but implementation moved to data channel handling.
**Reproduction Steps:**
1. Open `multiplayerReducer.ts`
2. Find `SEND_PLAYER_ACTION` case
3. Observe it does nothing

**Fix:** Either implement the action properly or remove it entirely to avoid confusion. If it's documented as "handled elsewhere", add a comment explaining why.

---

### CODE-12: Missing Error Boundaries for Sub-Components
**Severity:** High  
**Description:** While `ErrorBoundary.tsx` exists and is used in `page.tsx` to wrap screen-level components, there are **no error boundaries for sub-components**. If `NarrationDisplay`, `ActionInput`, or `LeftPanel` crash, they will take down the entire gameplay screen.
**Location:** `src/components/screens/Gameplay.tsx`, `src/components/ui/ErrorBoundary.tsx`
**Root Cause:** Error boundaries only applied at page level, not component level.
**Reproduction Steps:**
1. Open Gameplay screen
2. If any sub-component throws an error, entire screen crashes
3. No graceful degradation

**Fix:** Wrap critical sub-components with error boundaries:
```tsx
// In Gameplay.tsx:
<ErrorBoundary>
  <NarrationDisplay ... />
</ErrorBoundary>
<ErrorBoundary>
  <ActionInput ... />
</ErrorBoundary>
<ErrorBoundary>
  <LeftPanel ... />
</ErrorBoundary>
```

---

### CODE-13: Inconsistent Patterns - Mixing Class-Based and Function-Based AI Providers
**Severity:** Medium  
**Description:** The AI router mixes class-based providers (`WebLLMProvider`) with function-based providers (`GeminiProvider`, `OpenAIProvider`, etc.). This inconsistency makes the codebase harder to understand and maintain.
**Location:** `src/ai/ai-router.ts` - provider definitions
**Root Cause:** Different providers were added at different times with different patterns.
**Reproduction Steps:**
1. Open `ai-router.ts`
2. Observe `WebLLMProvider` is a class with static properties
3. Observe other providers are plain objects with functions

**Fix:** Standardize on one pattern:
1. Convert `WebLLMProvider` to use instance properties instead of static
2. Or convert all providers to classes for consistency

---

### CODE-14: Inconsistent React.memo Usage
**Severity:** Medium  
**Description:** Some components use `React.memo()` for performance optimization, while others don't. There's no consistent pattern for which components should be memoized.
**Location:** Multiple component files
**Root Cause:** Developers added memoization ad-hoc without a consistent strategy.
**Reproduction Steps:**
1. Search for `React.memo` usage across the codebase
2. Find inconsistent application

**Fix:** Define a clear strategy:
1. Memoize components that receive complex props or render frequently
2. Add `React.memo` to `PartySidebar`, `NarrationDisplay`, etc.
3. Document the strategy for future development

---

### CODE-15: Dead State Variables in useMultiplayer Hook
**Severity:** Low  
**Description:** The `useMultiplayer` hook defines `lastSessionId` and `lastIsHost` state variables (lines 57-58) that are returned from the hook but never destructured or used by any consumer (CoopLobby.tsx or Gameplay.tsx).
**Location:** `src/hooks/use-multiplayer.ts`, lines 57-58
**Root Cause:** State variables were likely used in a previous version but consumers were updated without removing the dead state.
**Reproduction Steps:**
1. Check all consumers of `useMultiplayer` hook
2. Find that `lastSessionId` and `lastIsHost` are never destructured

**Fix:** Remove the dead state variables if they're not needed, or implement the missing functionality.

---

### Top 10 Worst Offenders for Maintainability

1. **`src/components/screens/Gameplay.tsx`** (1276 lines, 9 `any` usages, unused imports, no error boundary)
2. **`src/ai/ai-router.ts`** (12 `any` usages, 113-line function, 52-line function, dead code)
3. **`src/app/api/ai-proxy/route.ts`** (15 `any` usages, malformed JSON bugs, no rate limiting)
4. **`src/context/game-actions.ts`** (7 `any` usages, unclear action flow)
5. **`src/ai/flows/narrate-adventure.ts`** (5 `any` usages, complex normalizer, typos)
6. **`src/hooks/use-multiplayer.ts`** (complex hook, memory leaks, stale closures, dead state)
7. **`src/context/reducers/characterReducer.ts`** (deprecated `substr`, complex respawn logic)
8. **`src/context/reducers/multiplayerReducer.ts`** (no-op actions, missing bounds checking)
9. **`src/lib/webrtc-signalling.ts`** (complex WebRTC logic, no validation, no backpressure)
10. **`src/context/GameContext.tsx`** (context value issues, theme CSS bugs, API key storage)
