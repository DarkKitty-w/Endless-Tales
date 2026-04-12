# 🔬 Endless Tales — Deep Analysis Report (Part 2) — VALIDATED TODO LIST
### Focus: Core Engine, State Management, AI Pipeline, Rendering & Architecture

> **Based on:** Full source review of `GameContext`, `game-reducer`, all sub-reducers, `narrate-adventure`, `assess-action-difficulty`, `NarrationDisplay`, `ActionInput`, `game-state-utils`, `game-initial-state`, `use-toast` and `page.tsx`
> **Validation:** Cross-referenced with complete project dependency map (`analyse_structurelle.txt`) and full source (`projet_complet.txt`)

---

## UPDATED & INTEGRATED TODO LIST

> This list merges all items from the original analysis with adjustments based on dependency verification. Changes from the previous TODO are annotated with **[ADJUSTED]** and explained in the final section.

---

### 🔴 CRITICAL FIXES (Must Do First)

| # | Task | File(s) | Approach | Priority | Notes |
|---|---|---|---|---|---|
| XC1 | **Fix double UPDATE_NARRATION** — stats applied twice per turn | `game-reducer.ts`, `adventureReducer.ts`, `characterReducer.ts` | **[ADJUSTED]** Remove **only the character mutation block** from `adventureReducer`'s `UPDATE_NARRATION` case. Keep the story log and turn count updates. Let `characterReducer` own all character mutations exclusively. | 🔴 Critical | Previous suggestion to remove the entire case would have broken story logging. This surgical fix preserves log functionality. |
| XC2 | **Remove side effects from reducer** — localStorage in `adventureReducer` | `adventureReducer.ts`, `GameContext.tsx` | Move all `localStorage.setItem` calls to `useEffect` in `GameContext`, triggered by `savedAdventures` state changes. | 🔴 Critical | |
| XC3 | **Delete the full-state console.log in GameContext** | `GameContext.tsx` | Delete or guard with `NODE_ENV === 'development'`. Running on every state change is a serious perf issue. | 🔴 Critical | |
| XC4 | **Delete gameReducer JSON.stringify log** | `game-reducer.ts` | Delete or guard with `NODE_ENV === 'development'`. | 🔴 Critical | |
| XC5 | **Memoize GameContext value** | `GameContext.tsx` | `useMemo(() => ({ state, dispatch }), [state, dispatch])`. Consider splitting into StateContext + DispatchContext. | 🔴 Critical | |
| xC6 | **Fix API key security** — Remove from Vite define block | `vite.config.ts` / `next.config.ts` | Use a Next.js `/api/ai-proxy` server route that holds the key server-side. | 🔴 Critical | |
| xC7 | **Move user API key to sessionStorage** | `GameContext.tsx`, `settingsReducer.ts` | Exclude from localStorage serialization. Use `sessionStorage` or encrypt before storing. | 🔴 Critical | |
| XC8 | **Fix Math.random() in JSX key** | `CraftingDialog.tsx` | Replace with `item.name` as the unique key. | 🔴 Critical | |
| xC9 | **Remove broken CoopLobby from main menu** | `MainMenu.tsx` | Add feature flag or remove button until P2P is ready. | 🔴 Critical | |
| XC10 | **Add Error Boundaries** | `page.tsx`, screen components | Wrap `<Gameplay>`, `<CharacterCreation>`, `<AdventureSetup>` in `React.ErrorBoundary`. | 🔴 Critical | |
| XC11 | **Fix stale closure in CharacterCreation** | `CharacterCreation.tsx` | Use `useEffect` to call `toast` after `setStatError`, not immediately after. | 🔴 Critical | |
| xC12 | **Remove admin000 backdoor** | `narrate-adventure.ts`, `assess-action-difficulty.ts` | Wrap in `NODE_ENV === 'development'` check or remove entirely. | 🔴 Critical | |
| xC13 | **Fix use-toast memory leak** | `use-toast.ts` | Change `useEffect` dependency from `[state]` to `[]`. | 🔴 High | |

---

### 🟠 STRUCTURAL IMPROVEMENTS

| # | Task | File(s) | Approach | Priority | Notes |
|---|---|---|---|---|---|
| XS1 | **Kill dual build system** | Root files | Delete `vite.config.ts`, `App.tsx`, `index.html`, `index.tsx`. Commit to Next.js App Router. | 🔴 High | |
| XS2 | **Implement action routing in gameReducer** | `game-reducer.ts` | Route each action to only the relevant sub-reducer(s) using Sets of action types. | 🟠 High | |
| XS3 | **Merge assess+narrate into single AI call** | `narrate-adventure.ts`, `Gameplay.tsx` | Add difficulty/dice fields to the narration schema. Remove the separate `assessActionDifficulty` call. Cuts latency 40–50%. | 🟠 High | **High Risk** — implement behind a feature flag. |
| XS4 | **Replace gameStateString regex with structured context** | `game-state-utils.ts`, all AI flows | Define `GameStateContext` interface. Build structured object for AI prompts. No more regex. | 🟠 High | **Provide migration path**; fallback to old format. |
| XS5 | **Cap storyLog size** | `adventureReducer.ts`, `NarrationDisplay.tsx` | Keep full log in memory but display only last 50. Strip narrative text from saves for older entries. | 🟠 High | |
| XS6 | **Remove dead packages** | `package.json` | **[ADJUSTED]** `npm uninstall firebase @tanstack-query-firebase recharts react-day-picker patch-package`. **Keep `date-fns`** (used in `SavedAdventuresList`). | 🔴 High | Verified `date-fns` is actually used. |
| XS7 | **Remove dead AI file** | `src/ai/dev.ts` | Delete Genkit leftover. | 🔴 High | |
| XS8 | **Deduplicate StatAllocationInput** | Both file locations | Keep `character/` version. Update all imports (none found). | 🟠 High | |
| XS9 | **Deduplicate game-state-utils** | `src/lib/` + `src/context/` | Keep `context/` version. Update imports in `adventureReducer.ts` and `Gameplay.tsx`. | 🟠 High | |
| XS10 | **Remove global mutable vars in CharacterCreation** | `CharacterCreation.tsx` | Replace with `useRef` or derive from state. | 🟠 High | |
| XS11 | **Consolidate 8 boolean loading states to union type** | `Gameplay.tsx`, `NarrationDisplay.tsx` | Define `LoadingPhase` union type. Reduces prop count from 11 to ~5. | 🟠 High | |
| XS12 | **Create unified AI Router** | `src/ai/ai-router.ts` | Single `AIProvider` interface for all providers. | 🟠 High | |
| XS13 | **Remove dead multiplayer state and actions** | `game-initial-state.ts`, `game-actions.ts` | **[ADJUSTED]** Move to `multiplayer-stub.ts` file; only re‑introduce with P2P feature. | 🟡 Medium | Keeps code clean and prevents accidental re‑introduction. |
| XS14 | **Add Zod validation to all AI responses** | All `src/ai/flows/` | `safeParse` every AI response. Return typed fallback on validation failure. | 🟠 High | |
| XS15 | **Add input sanitization for player actions** | `ActionInput.tsx`, `narrate-adventure.ts` | Strip code blocks, limit to 500 chars, filter injection patterns. | 🟠 High | |
| XS16 | **Remove unused Shadcn components** | `src/components/ui/` | Audit and delete calendar, chart, sidebar, menubar, avatar if unused. | 🟡 Medium | |

---

### 🟡 FEATURE COMPLETION

| # | Task | File(s) | Approach | Priority |
|---|---|---|---|---|
| XF1 | **Fix Immersed "existing character" flow** | `CharacterCreation.tsx` | Ensure `START_GAMEPLAY` is dispatched correctly for existing character path. | 🔴 High |
| XF2 | **Wire ClassChangeDialog** | `GameplayActions.tsx`, `ClassChangeDialog.tsx` | Add trigger action in GameplayActions when story conditions are met. | 🟡 Medium |
| XF3 | **Complete WorldMapDisplay** | `WorldMapDisplay.tsx`, `game-types.ts` | Store location graph in state; render as SVG network. | 🟡 Medium |
| XF4 | **Complete SkillTreeDisplay with interaction** | `SkillTreeDisplay.tsx` | Expandable skill cards with description, costs, and "Use Skill" quick-fill button. | 🟡 Medium |
| XF5 | **Surface Faction Reputation in UI** | `LeftPanel.tsx` or new tab | Reputation bars per faction in the character panel. | 🟡 Medium |
| XF6 | **Surface NPC Relationships in UI** | `LeftPanel.tsx` or new tab | Known NPCs list with relationship score. | 🟡 Medium |
| XF7 | **Implement RESPAWN_CHARACTER penalties** | `characterReducer.ts` | XP loss, debuff status effect on respawn. Remove the TODO comment. | 🟠 High |
| XF8 | **Extract `MAX_SKILL_TREE_STAGES` constant** | `constants.ts`, `characterReducer.ts` | Replace magic number `5` everywhere with the constant. | 🟡 Low |
| XF9 | **Fix assessActionDifficulty fallback mapping** | `assess-action-difficulty.ts` | Add proper lookup table from game difficulty setting to difficulty enum. | 🟡 Medium |
| XF10 | **Narration streaming** | `narrate-adventure.ts`, `NarrationDisplay.tsx` | Switch to `generateContentStream`. Stream tokens into display. | 🟠 High |

---

### 🔵 NEW FEATURES

| # | Task | Approach | Priority |
|---|---|---|---|
| N1 | **Multi-provider AI** (OpenAI, Claude, DeepSeek) | `AIProvider` interface + per-provider implementations | 🟠 High |
| N2 | **WebLLM local AI** with model selector screen | `@mlc-ai/web-llm` + hardware detection + progress bar | 🟡 Medium |
| N3 | **Battle visualization** | `BattleScene.tsx` SVG overlay on combat narration | 🟡 Medium |
| N4 | **Player-written skills** | Replace `generate-skill-tree` flow; `SkillEditor.tsx` component | 🟡 Medium |
| N5 | **P2P Multiplayer** | WebRTC data channels + signaling server + state sync | 🔵 Low (large) |
| N6 | **Ollama local provider** | HTTP wrapper to `localhost:11434` | 🔵 Low |
| N7 | **Undo branching choice** | 3-second grace period + dismissible toast after choice click | 🟡 Medium |
| N8 | **AbortController for AI requests** | `useRef(AbortController)` in Gameplay; abort on unmount/new action | 🟡 Medium |

---

### ⚪ OPTIMIZATION & POLISH

| # | Task | Approach | Priority |
|---|---|---|---|
| O1 | **Fix scroll behavior** — replace `setTimeout(150)` | `useLayoutEffect + requestAnimationFrame` | 🟠 High |
| XO2 | **Fix Date.now() key in dice display** | Use stable `dice-${diceResult}-${diceType}` key | 🟠 High |
| XO3 | **Fix storyLog index-based keys** | Use `log.timestamp` or a UUID as sole key | 🟠 High |
| XO4 | **Fix branchingChoices index keys** | Use `choice.text` as key | 🟠 High |
| O5 | **Memoize ActionInput callbacks** | `useCallback` in Gameplay + `React.memo` on ActionInput | 🟠 High |
| O6 | **Autofocus ActionInput after AI response** | `useEffect` watching loading → false transition | 🟡 Medium |
| O7 | **Batch applyTheme CSS writes** | Single `cssText` assignment instead of per-property loop | 🟡 Medium |
| O8 | **Debounce localStorage writes** | 300ms debounce in `persistence.ts` service | 🟡 Medium |
| O9 | **Add localStorage hydration loading state** | `isHydrating: boolean` in state; show spinner before first render | 🟡 Medium |
| O10 | **Clear branchingChoices on action submit** | Dispatch a clear action before the AI calls begin | 🟡 Medium |
| O11 | **Distinguish player vs AI in story log visually** | Right-align player actions; badge-style system events | 🟡 Medium |
| O12 | **Debounce action submission** | `useRef` lock for 500ms after submit | 🟠 High |
| O13 | **Add character count to ActionInput** | Counter label, red at >450/500 chars | 🟡 Low |
| O14 | **Fix `character: any` in narrate-adventure** | Use typed `Pick<Character, ...>` | 🟠 High |
| O15 | **Page transition animations** | `framer-motion` between screens | 🟡 Medium |
| O16 | **Stat change floating indicators** | `StatChangeBadge` component triggered by state diffs | 🟡 Medium |
| O17 | **Auto-scroll to latest narration** | Covered by O1 fix | 🟠 High |
| O18 | **localStorage compression** | `lz-string` to solve 5MB limit | 🟡 Medium |
| O19 | **State schema migration** | `version` field + migration functions | 🟡 Medium |
| O20 | **Add CSP headers** | `next.config.ts` `headers()` function | 🟡 Medium |
| O21 | **Dice roll animation** | SVG die face using existing `fadeInOut` keyframe | 🟡 Low |
| O22 | **Keyboard shortcut for action submit** | Ctrl+Enter in ActionInput | 🟡 Medium |
| O23 | **Eliminate all `as any` casts** | Replace with proper error typing and type guards | 🟡 Medium |
| O24 | **Debounce Suggest Action button** | 2-second cooldown after clicking suggest | 🟡 Medium |
| O25 | **ARIA labels and keyboard nav for dark mode toggle** | `aria-label`, `role="switch"`, keyboard shortcut | 🟡 Low |

---

## 📝 Summary of Adjustments from Previous TODO

The following changes were made after cross-referencing the codebase with the provided dependency map (`analyse_structurelle.txt`) and full source (`projet_complet.txt`):

| Original Task | Issue Identified | Adjusted Recommendation |
|---|---|---|
| **Remove `date-fns` package** (S6) | `date-fns` is **actively used** in `SavedAdventuresList.tsx` to format save timestamps. | **Keep `date-fns`** — it is not dead code. |
| **Fix double `UPDATE_NARRATION`** (C1) | Original fix suggested removing the **entire** `UPDATE_NARRATION` case from `adventureReducer`. | Remove **only the character mutation block**; keep story log and turn count updates. This prevents breaking the logging system. |
| **Merge AI calls** (S3) | High-risk change to core game loop. | Implement **behind a feature flag** for safe testing and rollback. |
| **Replace `gameStateString` regex** (S4) | Major change that affects saved games and AI prompts. | Provide a **migration path and fallback** to old format to maintain backward compatibility. |
| **Remove dead multiplayer state** (S13) | Previously suggested deleting outright. | **Move to a stub file** (`multiplayer-stub.ts`) to keep the codebase clean while preserving the ability to re‑implement later. |
| **Deduplicate `game-state-utils.ts`** (S9) | Needed explicit import updates. | Specified files to update: `adventureReducer.ts` and `Gameplay.tsx`. |

---

## Impact Summary

| Category | # Tasks | Biggest Win |
|---|---|---|
| 🔴 Critical Fixes | 13 | Fix double stat application — directly affects gameplay correctness |
| 🟠 Structural | 16 | Single AI call per turn — cuts response time by ~40% |
| 🟡 Feature Completion | 10 | Narration streaming — makes the game feel alive |
| 🔵 New Features | 8 | Multi-provider AI — removes Google lock-in |
| ⚪ Polish | 25 | Scroll fix + key fixes — eliminates visible jank |

**Total: 72 tracked tasks across both reports (with adjustments).**

---

*Report based on line-by-line analysis of 18,000+ lines across 80+ source files in the Endless Tales project, validated against the complete dependency graph.*