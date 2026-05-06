## Detailed Findings

BUG‑1: Type/Payload Mismatch in UPDATE_NARRATION Action
Severity: High
Description: The UPDATE_NARRATION action type in game-actions.ts defines its payload as StoryLogEntry, but characterReducer.ts destructures additional properties (updatedStats, updatedTraits, etc.) not present in the type. This causes type errors and potential runtime issues if payloads don't match expectations.
Location: src/context/game-actions.ts, line 18; src/context/reducers/characterReducer.ts, line 226
Root Cause: Mismatch between the TypeScript type definition of the UPDATE_NARRATION payload and the actual properties used in the reducer.
Reproduction Steps: Trigger an UPDATE_NARRATION action with a payload containing extra properties; TypeScript will not catch the type mismatch, leading to potential undefined property access.
Fix: Update the UPDATE_NARRATION action payload type in game-actions.ts to include all properties used in characterReducer.ts.

BUG‑2: Stale State Persistence in GameContext
Severity: Medium
Description: The persistence effect in GameContext.tsx has a dependency array that may not include all relevant state properties, leading to stale state being persisted.
Location: src/context/GameContext.tsx, lines 155-207
Root Cause: Incorrect dependency array in the useEffect hook for state persistence, missing key state properties.
Reproduction Steps: Modify a state property not included in the dependency array; the persisted state will not update until another included property changes.
Fix: Audit the dependency array of the persistence useEffect to include all state properties that need to be persisted.

BUG‑3: Silent JSON Parse Failures in AI Flows
Severity: High
Description: Multiple AI flows (generate-character-description.ts, suggest-existing-characters.ts, etc.) use JSON.parse directly without try-catch, so malformed AI responses cause silent failures with no error logging.
Location: src/ai/flows/generate-character-description.ts (~L98-106), src/ai/flows/suggest-existing-characters.ts (~L40-48), src/ai/flows/suggest-original-character-concepts.ts (~L40-48), src/ai/flows/summarize-adventure.ts (~L40-48)
Root Cause: Missing try-catch blocks around JSON.parse calls for AI response handling.
Reproduction Steps: Have the AI return malformed JSON; the flow will fall back to defaults without any indication of the parse failure.
Fix: Wrap JSON.parse calls in try-catch blocks and log parse errors for debugging.

BUG‑4: Non-JSON Error Handling in AI Proxy Route
Severity: Critical
Description: The AI proxy route attempts to parse error responses as JSON, but if the provider returns non-JSON errors (plain text/HTML), this throws an unhandled exception, returning a 500 error instead of the provider's actual error.
Location: src/app/api/ai-proxy/route.ts (~L102-108, ~L196-203, ~L336-343)
Root Cause: No fallback for non-JSON error responses from AI providers.
Reproduction Steps: Trigger an error from an AI provider that returns a non-JSON error response; the proxy will return a 500 error with no useful error details.
Fix: Add a try-catch around response.json() calls for error handling, fall back to response.text() if JSON parsing fails.

BUG‑5: ActionInput Stale Ref Re-render Issue
Severity: Medium
Description: The submittingRef ref in ActionInput.tsx is used to track submission state, but refs don't trigger re-renders, so the submit button may not visually update to disabled immediately.
Location: src/components/gameplay/ActionInput.tsx, lines 26-27, 71
Root Cause: Using a ref for state that affects UI rendering, which doesn't trigger re-renders.
Reproduction Steps: Submit an action; the button may not appear disabled until another state change (like clearing input) occurs.
Fix: Replace submittingRef with a state variable (useState) to trigger re-renders when submission state changes.

BUG‑6: ActionInput Submission Lock Race Condition
Severity: High
Description: The submission lock (submittingRef.current = true) is released after a fixed 500ms timeout, regardless of whether the onSubmit callback has completed, leading to potential double-submission.
Location: src/components/gameplay/ActionInput.tsx, lines 43-54
Root Cause: Fixed timeout for releasing submission lock instead of waiting for async onSubmit to complete.
Reproduction Steps: Trigger an onSubmit that takes longer than 500ms; the lock will release prematurely, allowing another submission.
Fix: Release the submission lock only after the onSubmit promise resolves/rejects.

BUG‑7: ChatPanel Array Index as Key
Severity: Medium
Description: ChatPanel.tsx uses array index as the key for list items, which can cause rendering issues if the array is modified (e.g., items added/removed).
Location: src/components/gameplay/ChatPanel.tsx (relevant lines for mapping messages)
Root Cause: Using array index as React key for dynamic lists.
Reproduction Steps: Add or remove messages from the chat list; React may incorrectly reuse components, leading to stale UI.
Fix: Use a unique identifier (like message timestamp or ID) as the key instead of array index.

BUG‑8: Divide by Zero Errors in Character Display
Severity: Critical
Description: CharacterDisplay.tsx and LeftPanel.tsx calculate progress bar values by dividing by maxHealth, maxStamina, etc., without checking if the denominator is zero, leading to NaN/Infinity values.
Location: src/components/game/CharacterDisplay.tsx (lines 83, 114, 124, 135); src/components/screens/LeftPanel.tsx (line 88)
Root Cause: Missing null/zero checks for denominator values in progress bar calculations.
Reproduction Steps: Create a character with maxHealth, maxStamina, or maxMana set to 0; progress bars will display NaN or Infinity.
Fix: Add zero checks for denominator values, default to 0% if the denominator is zero.

BUG‑9: SkillTree Potential Null Pointer
Severity: Medium
Description: CharacterDisplay.tsx accesses character.skillTree.stages[character.skillTreeStage].skills without checking if the stage exists, potentially causing runtime errors if skillTreeStage is out of bounds.
Location: src/components/game/CharacterDisplay.tsx, lines 148-162
Root Cause: Insufficient checks when accessing skill tree stages and skills.
Reproduction Steps: Set character.skillTreeStage to a value larger than the number of stages in skillTree.stages; the app may crash when trying to access skills.
Fix: Add a check to ensure the stage exists before accessing its skills (e.g., character.skillTree.stages?.[character.skillTreeStage]?.skills).

BUG‑10: Missing AI API Key Handling
Severity: High
Description: The app does not gracefully handle missing or invalid AI API keys, leading to unhandled errors when making AI requests.
Location: src/ai/ai-instance.ts, src/app/api/ai-proxy/route.ts
Root Cause: No validation of API key presence before making AI calls.
Reproduction Steps: Remove or invalidate the AI API key; AI requests will fail with unhandled errors.
Fix: Add API key validation before making AI requests, and surface user-friendly error messages.

BUG‑11: Deprecated WebRTC Unicode Encoding
Severity: Medium
Description: webrtc-signalling.ts uses deprecated unescape/escape functions for Unicode encoding, which may corrupt signalling data with special characters.
Location: src/lib/webrtc-signalling.ts, lines 27, 39
Root Cause: Using deprecated escape/unescape functions instead of proper UTF-8 encoding.
Reproduction Steps: Send signalling data containing special Unicode characters; the data may be corrupted.
Fix: Replace unescape/escape with TextEncoder and TextDecoder for proper UTF-8 handling before base64 conversion.

BUG‑12: Module-Level WebRTC Message Queue
Severity: High
Description: The message queue in webrtc-signalling.ts is at module scope, so all peer connections share the same queue, leading to cross-connection message interference.
Location: src/lib/webrtc-signalling.ts, lines 378-382, 388-408
Root Cause: Module-level variables for message queue instead of per-connection instances.
Reproduction Steps: Establish multiple WebRTC connections; messages from one connection may be sent over another.
Fix: Move message queue variables to be per-connection instances instead of module-level.