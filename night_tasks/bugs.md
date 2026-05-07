# Endless Tales Bug Report
*Generated: 2026-05-07*
*Scope: Functional bugs, logical errors, and runtime failures only*

## Detailed Findings

### BUG‑1: Unhandled AbortError from narrateAdventure leading to Unhandled Promise Rejection
**Severity:** Critical  
**Description:** The `narrateAdventure` AI flow explicitly re-throws `AbortError` (thrown when requests are cancelled, e.g., user retries, component unmounts) in its catch block. However, the `handlePlayerAction` function in `Gameplay.tsx` which calls `narrateAdventure` does not wrap these calls in a try-catch block. Additionally, callers of `handlePlayerAction` (lines 1035, 1054) invoke it without awaiting or catching errors, leading to unhandled promise rejections that can crash the application or leave it in an inconsistent state.  
**Location:** `src/components/screens/Gameplay.tsx`, lines 743, 745, 1035, 1054; `src/ai/flows/narrate-adventure.ts`, line 546  
**Root Cause:** Missing error handling around `await narrateAdventure` calls and non-awaited `handlePlayerAction` invocations. The `narrateAdventure` function re-throws `AbortError` for cancellation events, which propagates up to unhandled contexts.  
**Reproduction Steps:**  
1. Start a new game and enter any player action.  
2. Immediately click "Cancel" or trigger a component unmount (e.g., navigate away) before the AI responds.  
3. Observe an unhandled promise rejection error in the browser console/terminal.  
**Fix:**  
1. Wrap `await narrateAdventure` calls in `handlePlayerAction` with a try-catch block.  
2. Handle `AbortError` gracefully (e.g., reset loading states, log debug info) without re-throwing.  
3. Ensure all callers of `handlePlayerAction` either await it or attach a `.catch()` handler to prevent unhandled rejections.

---

### BUG‑2: Crafted Item Added to Inventory Without Validating Material Availability
**Severity:** Medium  
**Description:** The `UPDATE_CRAFTING_RESULT` reducer in `inventoryReducer.ts` adds the crafted item to the player's inventory even if the required consumed items are not found (and thus not removed). While the AI is expected to only return `success: true` when materials are available, there is no client-side validation to ensure the player actually has all required ingredients before processing the craft. This can lead to inventory duplication or invalid state if the AI incorrectly returns a success result.  
**Location:** `src/context/reducers/inventoryReducer.ts`, lines 75-93; `src/components/screens/Gameplay.tsx`, lines 1151-1170  
**Root Cause:** The `handleCrafting` function dispatches `UPDATE_CRAFTING_RESULT` without verifying that all `consumedItems` exist in the player's inventory. The reducer unconditionally adds `craftedItem` if it is truthy, regardless of whether materials were successfully removed.  
**Reproduction Steps:**  
1. Start a game and open the Crafting dialog.  
2. Select a crafting goal and ingredients that are not present in your inventory.  
3. Submit the craft. If the AI incorrectly returns `success: true`, the crafted item will be added to your inventory without consuming any materials.  
**Fix:**  
1. Add validation in `handleCrafting` to check if the player has all `usedIngredients` in their inventory before calling `attemptCrafting`.  
2. Only dispatch `UPDATE_CRAFTING_RESULT` with `craftedItem` if the AI returns `success: true` AND all consumed items were found in the inventory (verified by checking the reducer's removal count matches the input).

---

### BUG‑3: Missing Error Handling for WebLLM Module Load Failures in Initial Setup
**Severity:** Medium  
**Description:** The `performInitialSetup` function in `Gameplay.tsx` calls `triggerSkillTreeGeneration` and `handlePlayerAction` for initial narration, but the `triggerSkillTreeGeneration` callback is not wrapped in a try-catch block within the initial setup flow. If WebLLM module loading fails (e.g., network error, unsupported browser), this can lead to unhandled rejections during game initialization.  
**Location:** `src/components/screens/Gameplay.tsx`, lines 1112-1114  
**Root Cause:** The `triggerSkillTreeGeneration` callback (which calls `generateSkillTree`) is invoked without error handling in the initial setup path. While `performInitialSetup` has a top-level `.catch()`, intermediate async calls inside it may not be properly awaited or handled.  
**Reproduction Steps:**  
1. Start a new game with WebLLM as the selected provider on an unsupported browser.  
2. Observe if the initial skill tree generation failure is properly caught and handled.  
**Fix:** Wrap `triggerSkillTreeGeneration` and subsequent `handlePlayerAction` calls in the initial setup path with explicit try-catch blocks to ensure all initialization errors are caught by the top-level `.catch()` handler.

---

### BUG‑4: Inconsistent Dice Roll Display for Failed Difficulty Assessments
**Severity:** Low  
**Description:** When `assessActionDifficulty` fails (returns fallback), the `handlePlayerAction` function uses a default d10 dice roll, but the dice type displayed to the user is set to `d10` even though the fallback difficulty is based on the game's difficulty setting (which may map to a different dice type). This can lead to inconsistent user feedback.  
**Location:** `src/components/screens/Gameplay.tsx`, lines 664-665, 691-698  
**Root Cause:** The fallback dice type is hardcoded to `d10` when `assessActionDifficulty` fails, instead of using the `FALLBACK_DIFFICULTY_MAP` to determine the correct dice type for the current game difficulty.  
**Reproduction Steps:**  
1. Set game difficulty to "Hard" (maps to d20).  
2. Trigger a failed difficulty assessment (e.g., AI timeout).  
3. Observe that the dice roll uses d10 instead of d20.  
**Fix:** Use the `FALLBACK_DIFFICULTY_MAP` to look up the correct dice type when `assessActionDifficulty` fails, instead of hardcoding `d10`.
