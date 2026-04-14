# TODO FILE — SYSTEM AUDIT RESULTS
Version: V4 Audit
Generated: 2026-04-14

--------------------------------------------------

# 1. EXECUTIVE OVERVIEW

**System Health Status:** 🟢 GOOD – STABLE CORE

All **CRITICAL** issues identified in the previous (V3) audit have been successfully resolved. The multi‑provider AI system, state preservation, status effects, and memory management are now functioning correctly. The codebase is in a production‑ready state for a beta release.

**Main Risk Areas:**
- Edge‑case async behavior (AbortController missing in some flows)
- Subtle resource recalculation after status effect expiry
- User experience around class change and provider validation

**Stability Assessment:**
- Core gameplay loop stable
- State persistence robust (versioned migrations in place)
- AI integration resilient (fallbacks, JSON repair, Zod validation)

--------------------------------------------------

# 2. CRITICAL ISSUES (BLOCKERS)

✅ **No critical issues remain.** All V3 critical bugs have been fixed and verified.

--------------------------------------------------

# 3. HIGH PRIORITY ISSUES

## [HIGH-1] Missing AbortSignal in AdventureSetup AI Calls
- **Problem:** `AdventureSetup` calls `generateCharacterDescription`, `suggestExistingCharacters`, and `suggestOriginalCharacterConcepts` without passing an `AbortSignal`. If the user navigates away quickly, the promises may resolve after the component unmounts, potentially causing React warnings or stale state updates.
- **Root Cause:** The `AbortController` pattern used in `Gameplay` was not applied to `AdventureSetup` AI flows.
- **Impact:** Console warnings, possible memory leaks, minor UX annoyance. Not a functional break, but violates best practices.
- **Affected Files:**
  - `src/components/screens/AdventureSetup.tsx`
  - `src/ai/flows/generate-character-description.ts`
  - `src/ai/flows/suggest-existing-characters.ts`
  - `src/ai/flows/suggest-original-character-concepts.ts`
- **Fix Steps:**
  1. In `AdventureSetup`, create an `AbortController` ref and abort on unmount.
  2. Pass the `signal` to each AI flow function.
  3. In each flow, forward the `signal` to `client.models.generateContent`.
- **Priority:** HIGH

## [HIGH-2] Max Resources Not Recalculated After Status Effect Expiry
- **Problem:** When a status effect (like the "Weakened" debuff) expires in `UPDATE_NARRATION`, the character's `maxHealth`, `maxStamina`, and `maxMana` are not recalculated. The lowered max values persist until the next turn where a stat‑affecting narration occurs.
- **Root Cause:** `UPDATE_NARRATION` removes expired effects but does not recompute derived max resources based on the new effective stats (base stats + remaining modifiers).
- **Impact:** Character remains artificially weakened for one extra turn after the debuff should have worn off.
- **Affected Files:** `src/context/reducers/characterReducer.ts`
- **Fix Steps:**
  1. In `UPDATE_NARRATION`, after filtering expired effects, compute `effectiveStats` by applying all *remaining* `statModifiers` to `state.stats`.
  2. Recalculate `maxHealth`, `maxStamina`, `maxMana` using `effectiveStats`.
  3. Clamp `currentHealth`/`currentStamina`/`currentMana` to the new max values.
  4. Return the updated state.
- **Priority:** HIGH

## [HIGH-3] No Confirmation for Skill Loss on Manual Class Change
- **Problem:** When a user manually triggers a class change (via the "Change Class" button), the action immediately resets `skillTreeStage` to 0 and replaces learned skills with starter skills. There is no warning about this permanent loss of progression.
- **Root Cause:** `handleConfirmClassChange` directly dispatches `CHANGE_CLASS_AND_RESET_SKILLS` without a confirmation step that explains the consequences.
- **Impact:** Users may accidentally lose high‑level skill progression with no way to undo.
- **Affected Files:**
  - `src/components/screens/Gameplay.tsx`
  - `src/components/gameplay/ClassChangeDialog.tsx`
- **Fix Steps:**
  1. Modify `ClassChangeDialog` to display a warning message when triggered manually (vs. AI‑suggested change).
  2. Add a prop like `isManual` to differentiate and show a more detailed warning about losing current stage and skills.
  3. Ensure the confirmation button clearly states "Reset and Change Class".
- **Priority:** HIGH

--------------------------------------------------

# 4. MEDIUM / LOW PRIORITY ISSUES

## [MEDIUM-1] ActionInput Submission Lock Not Released on Synchronous Error
- **Problem:** If `onSubmit` throws a synchronous error (e.g., `sanitizePlayerAction` throws), `submittingRef.current` remains `true` and only the 500ms timeout clears it. During that window, the user cannot submit again.
- **Root Cause:** The lock is set before the `try` block and only cleared in `finally` if the async path completes; synchronous errors bypass the `finally` logic.
- **Impact:** Temporary (500ms) submission lockout after an input validation error.
- **Affected Files:** `src/components/gameplay/ActionInput.tsx`
- **Fix Steps:** Wrap the `onSubmit` call in a `try { ... } finally { submittingRef.current = false; }` block.
- **Priority:** MEDIUM

## [MEDIUM-2] No Pre‑flight Validation When Switching AI Provider Without API Key
- **Problem:** The user can select an AI provider (e.g., OpenAI) for which no API key is configured. The next AI request will fail with an error.
- **Root Cause:** `SettingsPanel` dispatches `SET_AI_PROVIDER` without checking if a key exists for the selected provider.
- **Impact:** Confusing runtime errors; user must return to settings to fix.
- **Affected Files:** `src/components/screens/SettingsPanel.tsx`
- **Fix Steps:** In `handleProviderChange`, check `providerApiKeys[provider]`. If missing, show a warning toast and optionally keep the previous provider selected.
- **Priority:** MEDIUM

## [MEDIUM-3] Streaming Narration Not Used for Assessed Actions
- **Problem:** Only passive actions (`!needsAssessment`) use streaming. Most player actions require difficulty assessment and therefore show only a loading spinner, increasing perceived latency.
- **Root Cause:** `handlePlayerAction` disables streaming when `needsAssessment` is true because the combined prompt currently waits for the full response.
- **Impact:** User experience feels slower than necessary.
- **Affected Files:** `src/components/screens/Gameplay.tsx`, `src/ai/flows/narrate-adventure.ts`
- **Fix Steps:** Refactor the combined AI call to support streaming while still including assessment fields (e.g., using server‑sent events that first yield metadata then narration chunks). Alternatively, perform assessment in parallel via a separate non‑blocking call.
- **Priority:** MEDIUM

## [MEDIUM-4] WebLLM Model Download May Exceed IndexedDB Quota
- **Problem:** Large models (>2 GB) stored persistently may hit browser IndexedDB quotas. The download fails without a clear user‑friendly message.
- **Root Cause:** No quota check before initiating the download.
- **Impact:** Failed downloads, user confusion, especially on devices with limited storage.
- **Affected Files:** `src/ai/ai-router.ts` (WebLLMProvider), `src/components/screens/SettingsPanel.tsx`
- **Fix Steps:**
  1. Use `navigator.storage.estimate()` to check available space.
  2. Compare with estimated model size before download.
  3. Show a warning if space is insufficient, and suggest using `temporary` persistence or clearing cache.
- **Priority:** MEDIUM

## [LOW] Remaining V3 Low‑Priority Items
The following items from V3 are still pending and remain as **LOW** priority enhancements:
- `lz-string` compression for localStorage (`L-OLD-O18`)
- CSP headers in `next.config.ts` (`L-OLD-O20`)
- Dice roll SVG animation (`L-OLD-O21`)
- Ctrl+Enter keyboard shortcut (`L-OLD-O22`)
- ARIA labels for dark mode toggle (`L-OLD-O25`)
- Battle visualization SVG overlay (`L-OLD-N3`)
- P2P multiplayer via WebRTC (`L-OLD-N5`)

--------------------------------------------------

# 5. ARCHITECTURAL IMPROVEMENTS

These are not immediate bugs but areas where the codebase could benefit from structural changes to improve maintainability and scalability.

### 5.1 Unify AI Call Patterns Across Screens
- **Observation:** `Gameplay` uses a robust pattern with `AbortController`, error handling, and streaming. `AdventureSetup` uses a simpler, less resilient pattern.
- **Suggestion:** Extract a shared `useAIFlow` hook or service that standardizes AI calls with abort, loading states, and error toasts.

### 5.2 Remove Legacy `updateGameStateString`
- **Observation:** The legacy regex‑based game state string builder is no longer used (verified in V4). It remains in `game-state-utils.ts`.
- **Suggestion:** Delete the function and its tests to reduce dead code.

### 5.3 Consolidate Character Creation Validation
- **Observation:** Stat point validation logic is split between `handleStatChange` and `onSubmit` in `CharacterCreation`.
- **Suggestion:** Centralize validation in a custom hook (e.g., `useStatAllocation`) to reduce duplication.

### 5.4 Consistent Import Style
- **Observation:** Most files now use relative paths; `game-state-utils.ts` was fixed in V3. Verify that all `@/` aliases have been normalized.

--------------------------------------------------

# 6. SAFE IMPROVEMENTS (NO RISK PATCHES)

These changes can be applied immediately with minimal risk.

- **Remove dead `updateGameStateString` function** from `game-state-utils.ts`.
- **Add missing `displayName` to a few React components** (if any) for better DevTools experience.
- **Convert `console.log` statements** in remaining files (if any unguarded) to `if (process.env.NODE_ENV === 'development')`.
- **Add TypeScript `satisfies` operator** to action type sets for stricter type checking.

--------------------------------------------------

# 7. EXECUTION ROADMAP

**Step 1 – Fix High‑Priority Async Issues**
- Implement [HIGH‑1] (AbortController in AdventureSetup)
- Implement [HIGH‑2] (Resource recalculation after effect expiry)

*Why:* These address the most immediate functional gaps and improve stability.

**Step 2 – Address High‑Priority UX Issues**
- Implement [HIGH‑3] (Class change confirmation)

*Why:* Prevents accidental loss of user progression.

**Step 3 – Tackle Medium‑Priority Polish Items**
- Implement [MEDIUM‑1] (ActionInput lock fix)
- Implement [MEDIUM‑2] (Provider key validation)
- Implement [MEDIUM‑3] (Streaming for assessed actions) – optional but recommended
- Implement [MEDIUM‑4] (WebLLM quota check)

*Why:* These improve overall user experience and reduce support friction.

**Step 4 – Clean Up and Low‑Priority Features**
- Remove dead code (`updateGameStateString`)
- Address LOW items as time permits (CSP headers recommended for security)

**Step 5 – Optional Architectural Refactors**
- Extract `useAIFlow` hook
- Consolidate validation in `CharacterCreation`

--------------------------------------------------

# 8. FINAL SYSTEM STATUS AFTER FIXES

After completing **Steps 1–3**, the system will reach:

- **Stability:** All known functional gaps closed; AI calls properly aborted; status effects fully correct.
- **Performance:** Streaming for most actions reduces perceived latency; localStorage writes debounced and compressed (if LOW item implemented).
- **Remaining Risks:**
  - WebLLM quota limitations (mitigated by warning in MEDIUM‑4)
  - Browser compatibility for cutting‑edge WebGPU features (acceptable for beta)
  - Multiplayer remains stubbed (explicitly disabled)

The application will be **ready for public beta release** with a high degree of confidence in core gameplay stability.