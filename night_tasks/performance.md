# Performance Audit Report

## Summary
Performance audit conducted on Endless Tales codebase. Issues found range from memory leaks to bundle size concerns.

## Detailed Findings

### PERF-1: Sub-reducers creating new state references unnecessarily
**Severity:** Medium  
**Description:** The reducers in `src/context/reducers/*.ts` create new state objects for every action, even when values haven't changed.
**Location:** `src/context/reducers/adventureReducer.ts`, `characterReducer.ts`, `inventoryReducer.ts`, `multiplayerReducer.ts`, `settingsReducer.ts`  
**Impact:** Widespread unnecessary re-renders; lag when state updates frequently.  
**Fix:** Use shallow comparison to avoid returning new objects when nothing changed.

### PERF-2: Single context causing widespread unnecessary re-renders [FIXED]
**Severity:** N/A (Fixed)  
**Description:** Fixed by implementing domain-specific contexts (AdventureContext, CharacterContext, etc.)
**Location:** `src/context/GameContext.tsx` lines 607-690  
**Impact:** N/A - Fixed.

### PERF-3: Module-level setInterval never cleared (rate-limit.ts memory leak)
**Severity:** High  
**Description:** The `setInterval` in `rate-limit.ts` at module level runs every 5 minutes but is never cleared.
**Location:** `src/lib/rate-limit.ts`, line 9  
**Impact:** Major memory leak; interval runs indefinitely.  
**Fix:** Convert to lazy-initialized interval with cleanup function.

### PERF-4: Direct console.log/error calls bypassing logger
**Severity:** Medium  
**Description:** Several files use `console.log/error` directly instead of using the logger utility.
**Location:** `src/components/screens/MainMenu.tsx` (lines 32, 38, 57), `src/components/ErrorBoundary.tsx` (line 51)  
**Impact:** Sensitive data may be exposed in production console logs.  
**Fix:** Replace all direct console calls with the logger utility.

### PERF-5: Unmemoized array sorting in SavedAdventuresList [FIXED]
**Severity:** N/A (Fixed)  
**Description:** Fixed with useMemo wrapper.
**Location:** `src/components/screens/SavedAdventuresList.tsx`, lines 65-67  
**Impact:** N/A - Fixed.

### PERF-6: Missing React.memo on components
**Severity:** Medium  
**Description:** Some key components that receive stable props may still be missing memoization.
**Location:** Various components in `src/components/`  
**Impact:** Unnecessary re-renders when parent components update.  
**Fix:** Add React.memo to components that receive stable props.

### PERF-7: Fire-and-forget setTimeout without cleanup in InteractionDialog
**Severity:** Medium  
**Description:** InteractionDialog.tsx uses setTimeout without storing the timeout ID.
**Location:** `src/components/gameplay/InteractionDialog.tsx`, lines 108, 114, 120  
**Impact:** Potential state updates on unmounted components.  
**Fix:** Store timeout IDs in refs and clear them on unmount.

### PERF-8: Theme CSS accumulation bug [FIXED]
**Severity:** N/A (Fixed)  
**Description:** Fixed by clearing all theme CSS properties before applying new ones.
**Location:** `src/context/GameContext.tsx`, lines 188-211  
**Impact:** N/A - Fixed.

### PERF-9: Reconciliation interval not properly cleaned up in use-multiplayer
**Severity:** Medium  
**Description:** The reconciliationInterval may not be properly cleared in all code paths.
**Location:** `src/hooks/use-multiplayer.ts`, line 197  
**Impact:** Potential memory leak if the interval continues after component unmounts.  
**Fix:** Ensure the interval is cleared in the cleanup effect.

### PERF-10: Large bundle contributor - lucide-react icons
**Severity:** Low  
**Description:** The lucide-react package is imported across many components.
**Location:** Multiple files importing from `lucide-react`  
**Impact:** Increased bundle size; slower initial page load.  
**Fix:** Consider using a single icon barrel file or SVG sprites.

### PERF-11: Inline className functions in JSX
**Severity:** Low  
**Description:** Many components create new objects or call functions on every render for className props.
**Location:** Throughout `src/components/`  
**Impact:** Minor performance degradation; unnecessary re-renders.  
**Fix:** Memoize complex className calculations with useMemo.

### PERF-12: WebRTC data channel flooding [IMPLEMENTED]
**Severity:** N/A (Well Implemented)  
**Description:** Has per-peer queue management and backpressure handling.
**Location:** `src/hooks/use-multiplayer.ts`, `src/lib/webrtc-signalling.ts`  
**Impact:** N/A - Well implemented.  
**Fix:** N/A - Current implementation is good.

### PERF-13: Unnecessary development-only logging in production build
**Severity:** Low  
**Description:** Debug log effect still runs (and does the check) in production.
**Location:** `src/context/GameContext.tsx`, lines 572-605  
**Impact:** Minor performance hit in production.  
**Fix:** Use a build-time check or move to a separate development-only module.

### PERF-14: Potential O(n²) operations in Gameplay.tsx
**Severity:** Low  
**Description:** Arrays are mapped/filtered during rendering which could cause lag with large state.
**Location:** `src/components/screens/Gameplay.tsx`  
**Impact:** UI lag with large game state.  
**Fix:** Memoize derived data with useMemo.

## Detailed Findings

### PERF-1: Sub-reducers creating new state references unnecessarily
**Severity:** Medium
