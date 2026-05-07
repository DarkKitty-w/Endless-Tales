# Performance Audit Report - Endless Tales

**Date:** 2025-05-07
**Scope:** Full codebase performance analysis
**Tools Used:** Cline search, code analysis, pattern matching

---

## Executive Summary


The Endless Tales codebase shows generally good performance practices with some notable issues that could impact user experience, particularly in long gaming sessions. The most critical issues involve memory leaks from uncleared intervals, bundle size concerns from large dependencies, and potential WebRTC data channel flooding under poor network conditions.

**Key Statistics:**
- 13 components properly use React.memo
- 27+ setTimeout/setInterval usages found
- 10+ console.log/error/warn statements active
- 4+ large dependencies that could impact bundle size

---

## Detailed Findings

### PERF-1: Rate Limit setInterval Memory Leak
**Severity:** High  
**Description:** The rate limiting module uses setInterval to clean up old entries every 5 minutes, but the interval is never cleared. This creates a permanent memory leak where the interval continues running even if the module is reloaded (HMR in development).  
**Location:** src/lib/rate-limit.ts, lines 9-16  
**Impact:** Memory growth over time; interval continues indefinitely. In Next.js development with hot module replacement, this can accumulate multiple intervals.  
**Fix:** Store interval ID and provide cleanup function. Add cleanupRateLimit() export.

---

### PERF-2: Console Logging in Production via Logger
**Severity:** Medium  
**Description:** The logger utility (src/lib/logger.ts) falls back to console.error, console.warn, and console.log for all log levels. While this is expected in development, there's no guard to completely disable logging in production builds.  
**Location:** src/lib/logger.ts, lines 246, 254, 257, 266  
**Impact:** Potential exposure of internal state in production; minor performance impact from string formatting.  
**Fix:** Wrap console calls with process.env.NODE_ENV check or use a logging service in production.

---

### PERF-3: Full Lodash Import Instead of Tree-Shaking
**Severity:** Medium  
**Description:** The CharacterCreation component imports the entire lodash library (import _ from 'lodash') to use only _.isEqual and _.pick. This prevents tree-shaking and adds ~70KB (minified) to the bundle.  
**Location:** src/components/screens/CharacterCreation.tsx, line 8  
**Impact:** Increased bundle size; slower initial page load.  
**Fix:** Replace with specific imports: import { isEqual, pick } from 'lodash';

---

### PERF-4: Inline Functions in JSX Causing Re-renders
**Severity:** Medium  
**Description:** Multiple components pass inline arrow functions to event handlers (onClick, onChange), creating new function instances on every render. This defeats React.memo optimizations.  
**Locations:** 
- src/components/game/SkillTreeDisplay.tsx lines 128, 140, 281
- src/components/game/WorldMapDisplay.tsx lines 119, 225
- src/components/gameplay/ActionInput.tsx line 195
- src/components/gameplay/CraftingDialog.tsx lines 175, 193, 218
- src/components/gameplay/PartySidebar.tsx lines 139, 153, 173, 428
- src/components/gameplay/TradeDialog.tsx lines 120, 132

**Impact:** Unnecessary re-renders of child components; degraded UI responsiveness during rapid state changes.  
**Fix:** Wrap inline functions with useCallback.


---

### PERF-5: Theme CSS Accumulation Bug - VERIFIED FIXED
**Severity:** N/A (Fixed)  
**Description:** Previously, changing themes could accumulate CSS custom properties from multiple themes. The fix in GameContext.tsx properly clears ALL theme properties before applying a new theme.  
**Location:** src/context/GameContext.tsx, lines 194-207  
**Verification:** The code now:
1. Collects ALL properties from ALL themes into a Set
2. Removes each property from document.documentElement
3. Only then applies the new theme's properties
4. Properly toggles the dark class

**Status:** ✅ Fix is properly implemented.

---

### PERF-6: WebRTC Data Channel Backpressure Handling
**Severity:** Medium  
**Description:** The multiplayer hook implements message queuing with a 1MB buffer limit and 50ms retry interval. While functional, the buffer limit is quite large and there's no mechanism to prioritize critical messages (like control messages) over game state updates.  
**Location:** src/hooks/use-multiplayer.ts, lines 225, 236, 246-254, 298-313  
**Impact:** Under poor network conditions, large queues could form; game state messages might be delayed by less important chat messages.  
**Fix:** 
- Consider priority queues (control > game-actions > chat)
- Lower BUFFER_LIMIT to 256KB
- Add backpressure feedback to pause sending when queue is large

---

### PERF-7: Missing React.memo on List Items
**Severity:** Low  
**Description:** Some components that render as list items or in iterating contexts don't use React.memo, causing unnecessary re-renders when parent state changes.  
**Potential Locations to Review:**
- src/components/game/WorldMapDisplay.tsx - Location items in SVG
- src/components/gameplay/ChatPanel.tsx - Chat message items
- src/components/game/InventoryDisplay.tsx - Inventory items (has memo on parent, but items could benefit)

**Impact:** Decreased rendering performance with large inventories, long chat histories, or many map locations.  
**Fix:** Wrap list item components with React.memo and ensure stable props.

---

### PERF-8: setTimeout Without Proper Cleanup in Gameplay
**Severity:** Medium  
**Description:** Several setTimeout calls in Gameplay.tsx may not be properly cleaned up on unmount.  
**Location:** src/components/screens/Gameplay.tsx, lines 214, 685, 695, 1032, 1140  
**Impact:** Potential memory leaks; state updates on unmounted components.  
**Fix:** Store timeout IDs in refs and clear in cleanup functions.


---

### PERF-9: Inefficient Array Operations on Large Datasets
**Severity:** Low  
**Description:** Several places use filter(), map(), and forEach() on arrays that could potentially grow large.  
**Locations:**
- src/context/reducers/multiplayerReducer.ts lines 292, 312, 316
- src/components/gameplay/NarrationDisplay.tsx line 126 - Good use of useMemo
- src/lib/utils.ts line 179

**Impact:** Negligible for current data sizes, but could become noticeable with very long games.  
**Fix:** Use useMemo for computed values, maintain preprocessed indexes.

---

### PERF-10: Large Bundle Contributors
**Severity:** Medium  
**Description:** Several large dependencies are included that could impact initial bundle size.  
**Dependencies:**
1. **@mlc-ai/web-llm** (~50MB download) - Fix: Ensure dynamically imported
2. **lodash** (~70KB) - Fix: Use specific imports
3. **lucide-react** - Current usage appears to import specific icons

**Location:** package.json, src/components/screens/CharacterCreation.tsx  
**Impact:** Slower initial page loads; larger JavaScript bundles.  

---

### PERF-11: Dev Logging in MainMenu Component
**Severity:** Low  
**Description:** MainMenu component has console.log statements wrapped in NODE_ENV check.  
**Location:** src/components/screens/MainMenu.tsx, lines 32, 38, 57  
**Impact:** Minor; code cleanliness issue.  
**Fix:** Remove console.log statements or replace with logger.debug().

---

### PERF-12: Event Listener Cleanup Verification
**Severity:** Low  
**Description:** Most event listeners are properly cleaned up.  
**Properly Cleaned:**
- ✅ src/components/screens/Gameplay.tsx line 196 - keydown listener
- ✅ src/context/GameContext.tsx line 414 - storage event listener  
- ✅ src/hooks/use-mobile.tsx line 15 - media query listener

**Status:** ✅ Event listener cleanup appears to be properly implemented.


---

## Summary of Recommendations

| ID | Issue | Severity | Estimated Effort |
|-----|-------|----------|-------------------|
| PERF-1 | Rate limit setInterval leak | High | 1 hour |
| PERF-2 | Console logging in production | Medium | 2 hours |
| PERF-3 | Full lodash import | Medium | 1 hour |
| PERF-4 | Inline functions in JSX | Medium | 4-6 hours |
| PERF-6 | WebRTC backpressure | Medium | 3-4 hours |
| PERF-7 | Missing React.memo on list items | Low | 2-3 hours |
| PERF-8 | setTimeout cleanup in Gameplay | Medium | 2 hours |
| PERF-10 | Large bundle contributors | Medium | 3-4 hours |

**Total Estimated Effort:** 18-23 hours

---

## Positive Findings

1. **✅ Theme CSS accumulation bug is FIXED** - Proper cleanup implemented in GameContext.tsx
2. **✅ Good use of React.memo** - 13 components properly memoized
3. **✅ useCallback/useMemo usage** - Many components properly optimize with these hooks
4. **✅ WebRTC message queuing** - Per-peer queues with size limits implemented
5. **✅ Debounced state persistence** - GameContext uses debounced localStorage writes
6. **✅ Event listener cleanup** - Most listeners properly cleaned up on unmount
7. **✅ Story log limiting** - NarrationDisplay memoizes last 50 entries
