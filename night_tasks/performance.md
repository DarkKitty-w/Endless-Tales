## Detailed Findings

PERF‑1: Sub-reducers create new state references unnecessarily
Severity: High
Description: CharacterReducer returns new reputation/npcRelationships objects even when computed values match current values; InventoryReducer returns new arrays even when no items change. This causes main reducer to detect state change (reference inequality) and trigger re-renders.
Location: src/context/reducers/characterReducer.ts (lines 159, 166); src/context/reducers/inventoryReducer.ts (lines 27-38, 45-47)
Impact: Unnecessary re-renders of all components consuming useGame(), even when no meaningful state change occurs.
Fix: In sub-reducers, compare new values with current values before creating new objects/arrays. Return old state reference if no change detected.

PERF‑2: Single context causes widespread unnecessary re-renders
Severity: High
Description: Entire game state is exposed via single GameContext. Context value ({ state, dispatch }) is recreated every time state changes, causing all consumers to re-render even if they only use a small slice of state.
Location: src/context/GameContext.tsx (lines 49-252)
Impact: Widespread unnecessary re-renders across all components using useGame(), degrading UI responsiveness.
Fix: Split into multiple contexts by domain (adventure, character, inventory, multiplayer, settings) or use useMemo to stabilize context value.

PERF‑3: Module-level setInterval never cleared (WebRTC memory leak)
Severity: High
Description: initializeQueueProcessor in webrtc-signalling.ts creates a setInterval (every 50ms) to process message queue, which is never cleared even when all WebRTC connections close.
Location: src/lib/webrtc-signalling.ts, line 388
Impact: Major memory leak; interval runs indefinitely, consuming CPU and preventing event loop exit. Message queue and closures persist in memory.
Fix: Use setTimeout that reschedules only when queue has messages, or track active connections and clear interval when last connection closes.

PERF‑4: Direct console.error calls bypass logger (dev logging in production)
Severity: Low
Description: Multiple console.error calls in catch blocks (no environment check) bypass project's logger and output in production, potentially exposing internal details.
Location: src/context/GameContext.tsx (lines 99, 137)
Impact: Production builds output error logs, violating logging best practices and potentially leaking internal info.
Fix: Wrap in if (process.env.NODE_ENV === 'development') or use project's logger with environment awareness.

PERF‑5: Unmemoized array sorting in SavedAdventuresList
Severity: Medium
Description: SavedAdventuresList sorts adventures array on every render without memoization, causing O(n log n) work repeatedly.
Location: src/components/screens/SavedAdventuresList.tsx (sorting logic)
Impact: Unnecessary computation on every render, worsening with large adventure lists.
Fix: Wrap sorting logic in useMemo with proper dependencies.

PERF‑6: Missing React.memo on 6+ major components
Severity: Medium
Description: Key components like SavedAdventuresList, CharacterDisplay, InventoryDisplay lack React.memo, causing re-renders when parent re-renders even if props don't change.
Location: Multiple components in src/components/screens/, src/components/game/
Impact: Unnecessary re-renders of complex components, degrading performance.
Fix: Add React.memo to components that receive stable props and don't need to re-render on parent changes.

PERF‑7: Array index as key in dynamic lists
Severity: Medium
Description: ChatPanel, AdventureSummary use array index as key for dynamic lists, causing React to reuse components incorrectly when list order changes.
Location: src/components/gameplay/ChatPanel.tsx; src/components/screens/AdventureSummary.tsx
Impact: Stale UI, incorrect component state when list items are added/removed/reordered.
Fix: Use unique identifiers (timestamp, ID) as keys instead of array index.

PERF‑8: Bundle size concerns with lucide-react icon imports
Severity: Medium
Description: Lucide-react icons are imported as entire library or large subsets, increasing bundle size unnecessarily.
Location: Multiple component files importing from lucide-react
Impact: Larger bundle size, slower initial load for users.
Fix: Use tree-shaking imports (import { IconName } from 'lucide-react' with proper config) or switch to individual icon imports.

PERF‑9: Inline arrow functions in JSX loops
Severity: Low
Description: Inline arrow functions created in JSX loops (e.g., map callbacks) are recreated on every render, causing child components to re-render unnecessarily.
Location: Multiple component files with list rendering
Impact: Minor unnecessary re-renders of list items.
Fix: Extract inline functions to useCallback or define outside render scope.

PERF‑10: O(n*m) lookups in skill rendering
Severity: Medium
Description: Skill tree rendering performs nested loops (O(n*m)) to match skills with user progress, inefficient for large skill trees.
Location: src/components/game/SkillTreeDisplay.tsx
Impact: Slow rendering of skill trees with many skills/stages.
Fix: Precompute a map of skill IDs to progress for O(1) lookups.

PERF‑11: WebLLM heavy dependency bundled even when unused
Severity: Medium
Description: @mlc-ai/web-llm is listed in package.json and bundled even when users never select local AI, adding significant size.
Location: package.json; src/ai/ai-router.ts (line 989)
Impact: Increased install and bundle size for users who never use local AI models.
Fix: Move to optional peer dependency or lazy-load with fallback that doesn't require the package.

PERF‑12: AI proxy route decodes/re-encodes streaming responses
Severity: Medium
Description: AI proxy route reads entire streaming response, decodes chunks, reformats, and re-encodes, adding latency and memory overhead.
Location: src/app/api/ai-proxy/route.ts (lines 112-151, 206-259, 345-396)
Impact: Doubled memory usage during streaming, increased latency for AI responses.
Fix: Pipe streaming responses directly without decoding/re-encoding.

PERF‑13: Production dev logging (console.error without env check)
Severity: Low
Description: Console.error calls in production code bypass environment checks, outputting logs in production builds.
Location: Multiple files (src/context/GameContext.tsx, etc.)
Impact: Violates logging best practices, potential internal info leakage.
Fix: Wrap all console.error calls in environment checks or use project logger.

PERF‑14: Large dependencies (@mlc-ai/web-llm in package.json)
Severity: Medium
Description: @mlc-ai/web-llm is a large dependency (includes WASM files, model weights) bundled unconditionally.
Location: package.json
Impact: Significantly larger bundle/install size.
Fix: Make dependency optional or dynamically import only when local AI is selected.