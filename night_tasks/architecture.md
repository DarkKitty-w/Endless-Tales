# Architecture Audit Report: Endless Tales

## Summary
This audit identifies 8 key architectural issues ranging from high-severity god files to low-severity unused abstractions. The project uses a Next.js + React architecture with context-based state management, AI integration via Genkit flows, and WebRTC-based multiplayer. Major concerns include monolithic files, fragmented state management, deprecated context usage, and tight coupling between UI and AI logic.

## Detailed Findings


### ARCH-1: God File - GameContext
**Severity:** High  
**Description:** `GameContext.tsx` is 768 lines and ~30KB, combining context definitions, provider component, domain context creation, state migration logic, localStorage persistence, AI configuration, theme application, and deprecated hook exports. It nests 5 domain contexts within a single provider component.  
**Location:** `src/context/GameContext.tsx`  
**Problem:** Too many responsibilities in one file. The provider component contains storage event listeners, migration logic, theme application, and AI setup - all mixed with context definition. This makes the file hard to navigate and modify.  
**Recommendation:** Split into focused modules (proposed files - do not exist yet):
- `src/context/GameProvider.tsx` (provider component with nested domain providers) - **proposed, not yet created**
- `src/context/domain-contexts.ts` (domain context definitions and hooks) - **proposed, not yet created**
- `src/context/game-migrations.ts` (save migration logic) - **proposed, not yet created**
- `src/context/game-persistence.ts` (localStorage load/save logic) - **proposed, not yet created**
- `src/context/theme-manager.ts` (theme application logic) - **proposed, not yet created**

### ARCH-2: Deprecated Context Usage Causing Unnecessary Re-renders
**Severity:** High  
**Description:** While domain-specific contexts (AdventureContext, CharacterContext, InventoryContext, SettingsContext, MultiplayerContext) are defined with corresponding hooks, the vast majority of components still use the deprecated `useGame()` hook which returns the entire game state object. This causes components to re-render on any state change, even when they only depend on a small subset of state.  
**Location:** Multiple components including:
- `src/app/page.tsx`
- `src/components/game/InventoryDisplay.tsx`
- `src/components/game/LeftPanel.tsx`
- `src/components/game/CharacterDisplay.tsx`
- `src/components/game/WorldMapDisplay.tsx`
- `src/components/gameplay/AIStatusPanel.tsx`
- `src/components/screens/*.tsx` (most screen components)  
**Problem:** Performance degradation due to unnecessary re-renders. Components are tightly coupled to the entire state tree, making them harder to reuse or test in isolation.  
**Recommendation:** 
1. Migrate all components to use domain-specific hooks (`useAdventure()`, `useCharacter()`, `useInventory()`, `useSettings()`, `useMultiplayer()`)
2. Once migration is complete, remove the deprecated `GameContext` and `useGame()` hook
3. Consider adding an ESLint rule to prevent new usage of `useGame()`

### ARCH-3: Tight Coupling Between UI and AI Logic
**Severity:** Medium  
**Description:** The `Gameplay.tsx` screen directly imports and calls AI flow functions (`narrateAdventure`, `summarizeAdventure`, `assessActionDifficulty`, `generateSkillTree`, `attemptCrafting`) from `src/ai/flows/`. This couples the UI layer directly to AI implementation details and Genkit flow interfaces.  
**Location:** `src/components/screens/Gameplay.tsx` (lines 18-22)  
**Problem:** If AI flows change their interface, or if the project switches away from Genkit flows, all UI components importing them need modification. AI logic should be abstracted behind a service layer.  
**Recommendation:** Create an AI service layer (proposed files - do not exist yet):
- Create `src/services/ai-service.ts` that wraps all AI flow calls - **proposed, not yet created**
- Define clear interfaces for AI operations (narration, summarization, skill tree generation, etc.)
- Update UI components to call service methods instead of importing flows directly
- This also enables easier mocking for tests

### ARCH-4: Fragmented Multiplayer State Management
**Severity:** Medium  
**Description:** Multiplayer state is managed in two separate places: the `useMultiplayer` hook (in `src/hooks/use-multiplayer.ts`) maintains its own `multiplayerState`, while the `multiplayerReducer` (in `src/context/reducers/multiplayerReducer.ts`) also manages multiplayer state within the main game context. This creates duplicate state and potential inconsistencies.  
**Location:** 
- `src/hooks/use-multiplayer.ts` (lines 69-82: local state definition)
- `src/context/reducers/multiplayerReducer.ts` (manages state.sessionId, state.players, etc.)
- `src/context/game-reducer.ts` (routes to multiplayerReducer)  
**Problem:** State fragmentation can lead to synchronization bugs where the hook state and context state disagree. It's unclear which is the source of truth for multiplayer state.  
**Recommendation:** Unify multiplayer state management:
1. Option A: Move all multiplayer state into the context/reducer system and remove local state from `useMultiplayer` hook
2. Option B: Make the `useMultiplayer` hook the single source of truth and remove multiplayer state from the main game context
3. Ensure all multiplayer state updates go through a single, consistent path

### ARCH-5: Side Effects in Reducer
**Severity:** Medium  
**Description:** The `multiplayerReducer` in `APPLY_REMOTE_STATE` case performs side effects: creating sessionStorage backups (lines 104-130) and calling `sanitizeStateForPersistence()`. Reducers should be pure functions with no side effects, as they may be called multiple times or in different contexts (e.g., time-travel debugging).  
**Location:** `src/context/reducers/multiplayerReducer.ts` (lines 84-143)  
**Problem:** Violates the reducer purity principle. Side effects make the reducer hard to test, can cause unexpected behavior during state rehydration or migration, and complicate debugging.  
**Recommendation:** Move side effects to action creators or a middleware pattern:
1. Keep reducers pure - only return new state
2. Move backup creation to a thunk-like action creator or a custom middleware
3. Perform sanitization before dispatching the action, not inside the reducer
4. Consider using a library like Redux Toolkit if complex side effect management is needed

### ARCH-6: Unused Domain Context Abstraction
**Severity:** Low  
**Description:** Domain contexts (AdventureContext, CharacterContext, InventoryContext, SettingsContext, MultiplayerContext) are fully defined with corresponding hooks (`useAdventure()`, `useCharacter()`, etc.), but no components in the codebase use these domain-specific hooks. All components use the deprecated `useGame()` hook instead.  
**Location:** `src/context/GameContext.tsx` (lines 721-760: hook definitions)  
**Problem:** Wasted abstraction that adds complexity without providing benefits. The nested context providers and domain contexts increase the component tree depth and cognitive load without being utilized.  
**Recommendation:** Either:
1. Actively migrate components to use domain hooks (preferred, addresses ARCH-3)
2. If migration won't happen, remove the unused domain contexts and hooks to simplify the codebase

### ARCH-7: Legacy Utilities in game-state-utils
**Severity:** Low  
**Description:** `game-state-utils.ts` is 340 lines and contains both legacy methods (explicitly marked as "Legacy method – kept for backward compatibility") and current utilities. It handles game state string building, context building, and other state manipulation functions.  
**Location:** `src/context/game-state-utils.ts`  
**Problem:** Mixed legacy and current code increases file size and cognitive load. Developers may accidentally use deprecated methods.  
**Recommendation:**
1. Split into focused utility files (proposed - do not exist yet): `src/context/state-string-builder.ts` - **proposed, not yet created**, `src/context/game-context-builder.ts` - **proposed, not yet created**
2. Remove legacy methods once all references are updated
3. Add deprecation warnings to legacy methods if they must be kept temporarily
4. Consider moving these utilities closer to where they're used (e.g., AI flows for state string building)
