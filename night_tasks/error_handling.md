## Detailed Findings

### ERR‑1: Generic Error Messages in AI Router (Client-Side)
**Severity:** High  
**Description:** In ai-router.ts, all provider classes catch error responses with a generic pattern. The error object structure varies by provider, but the code assumes `error.error` exists. Provider-specific errors like rate limits, quota exceeded, or invalid API keys are not properly captured or differentiated.  
**Location:** `src/ai/ai-router.ts` - Lines 148-151 (GeminiProvider.generateContent), 189-192 (GeminiProvider.generateContentStream), 288-291 (OpenAIProvider.generateContent), 327-330 (OpenAIProvider.generateContentStream), 427-430 (ClaudeProvider), 467-470 (DeepSeekProvider), 567-570 (OpenRouterProvider)  
**Current Behaviour:** Generic error messages like "AI generation failed" without provider-specific details.  
**Expected:** Error messages should be provider-specific (e.g., "OpenAI rate limit exceeded", "Gemini invalid API key") to help users understand what went wrong.  
**Fix:** Parse provider-specific error structures and extract meaningful messages. Add provider name to error context.

### ERR‑2: AI Proxy Route Doesn't Preserve Raw Response on Parse Failure
**Severity:** High  
**Description:** When the AI proxy route receives a response and JSON parsing fails, the raw response text is not preserved or displayed. The error is caught but the original response that failed to parse is lost.  
**Location:** `src/app/api/ai-proxy/route.ts` (multiple locations where JSON parsing occurs)  
**Current Behaviour:** Parse errors are logged but raw response text is not saved or shown to user/developer.  
**Expected:** Raw AI response text must be preserved and displayed when parsing fails, as per the critical requirement.  
**Fix:** Catch parse errors, save the raw text to a variable, and include it in the error response or log it prominently for debugging.

### ERR‑3: No Provider-Specific Error Messages
**Severity:** Medium  
**Description:** Error messages from AI providers are generic. Users see "AI request failed" instead of "OpenAI rate limit exceeded" or "Gemini quota exceeded".  
**Location:** `src/ai/ai-router.ts`, `src/app/api/ai-proxy/route.ts`  
**Current Behaviour:** Generic error messages that don't help users understand the specific issue.  
**Expected:** Provider-specific error messages that clearly indicate what went wrong (rate limit, invalid key, quota, etc.).  
**Fix:** Parse provider error responses and extract specific error codes/messages. Pass these through to the UI.

### ERR‑4: Stream Processing Errors Not Showing Raw Text
**Severity:** High  
**Description:** During streaming AI responses, if an error occurs mid-stream, the partial/raw text accumulated so far is not preserved or displayed to the user.  
**Location:** `src/ai/ai-router.ts` - Stream processing loops in all provider classes  
**Current Behaviour:** Stream errors cause the stream to stop but accumulated text is lost.  
**Expected:** Raw accumulated text should be preserved and shown when stream processing fails.  
**Fix:** Save accumulated text in a variable accessible in the catch block. Include it in error messages or display it in the UI.

### ERR‑5: No Retry Button for AI Generation Failures
**Severity:** High  
**Description:** When AI generation fails, there is no retry button presented to the user. They must manually try again or refresh.  
**Location:** `src/components/gameplay/NarrationDisplay.tsx`, `src/components/screens/CharacterCreation.tsx`  
**Current Behaviour:** Error alerts display the error but offer no recovery option.  
**Expected:** Error alerts should include a retry button to re-attempt the failed AI operation.  
**Fix:** Add a retry button to error Alert components that calls the appropriate retry function (e.g., onRetryNarration).

### ERR‑6: Silent JSON Parse Failures in AI Flows
**Severity:** High  
**Description:** AI flows (generate-character-description.ts, suggest-existing-characters.ts, etc.) use JSON.parse directly without try-catch, or with try-catch that doesn't preserve the raw response text.  
**Location:** `src/ai/flows/generate-character-description.ts` (~L98-106), `src/ai/flows/suggest-existing-characters.ts` (~L40-48), `src/ai/flows/suggest-original-character-concepts.ts` (~L40-48), `src/ai/flows/summarize-adventure.ts` (~L40-48)  
**Current Behaviour:** Parse failures fall back to defaults silently without preserving the raw AI response.  
**Expected:** Raw AI response text must be preserved and displayed when parsing fails.  
**Fix:** Wrap JSON.parse in try-catch, save the raw text, and either display it in UI or log it prominently for debugging.

### ERR‑7: No Timeout/Abort Handling for AI Requests
**Severity:** Medium  
**Description:** AI requests have no timeout or abort mechanism. If a provider hangs, the request waits indefinitely without user feedback.  
**Location:** `src/ai/ai-router.ts`, `src/app/api/ai-proxy/route.ts`  
**Current Behaviour:** Requests can hang forever with no timeout or user notification.  
**Expected:** Requests should have a timeout with a clear message to the user and a retry option.  
**Fix:** Add AbortController with timeout to all AI requests. Display timeout message and retry button on timeout.

### ERR‑8: Fallback to Default Values Without Informing User
**Severity:** Medium  
**Description:** When AI responses fail to parse or requests fail, the code often falls back to default values without informing the user that a fallback is active.  
**Location:** `src/ai/flows/*.ts` (multiple flows)  
**Current Behaviour:** Silent fallback to defaults.  
**Expected:** User should be informed that AI failed and defaults are being used, with an option to retry.  
**Fix:** Show a toast/alert when falling back to defaults, explaining that AI failed and offering retry.

### ERR‑9: No Network Error Differentiation
**Severity:** Medium  
**Description:** Network errors (connection refused, DNS failure, timeout) are not differentiated from API errors (bad request, unauthorized). Users see generic "AI request failed" for all error types.  
**Location:** `src/ai/ai-router.ts`, `src/app/api/ai-proxy/route.ts`  
**Current Behaviour:** All errors show the same generic message.  
**Expected:** Network errors should show specific messages like "Network connection failed - check your internet" vs API errors like "Invalid API key".  
**Fix:** Catch different error types and provide specific messages for network vs API errors.

### ERR‑10: ErrorBoundary Displays Raw Error Messages to Users
**Severity:** High  
**Description:** ErrorBoundary.tsx renders `this.state.error.message` inside a `<pre>` block without sanitization. If the error originates from AI JSON parsing failures, the raw AI response or internal error details are shown to the user. This violates the requirement that raw AI responses should be shown, BUT they should be shown in a developer-friendly way, not as a security risk to end users.  
**Location:** `src/components/ErrorBoundary.tsx` lines 57-61  
**Current Behaviour:** Displays `error.message` directly in a `<pre>` block.  
**Expected:** Should show a user-friendly message and optionally log the raw error to console. Raw error details should be hidden from end users but visible in developer tools.  
**Fix:** Show a generic "Something went wrong" message to users. Log the full error (including raw AI response if applicable) to console. Add an expandable "Technical Details" section for developers.

### ERR‑11: No Raw AI Response Preservation in UI
**Severity:** High  
**Description:** When AI response parsing fails, the raw text is not displayed in the UI for developers/users to diagnose the issue. This violates the critical requirement.  
**Location:** `src/components/gameplay/NarrationDisplay.tsx`, all AI flow components  
**Current Behaviour:** Parse errors are silent or show generic messages without the raw response.  
**Expected:** Raw AI response text must be displayed when parsing fails (in a developer mode or expandable section).  
**Fix:** Save raw AI response text when parsing fails. Display it in an expandable section or copyable text area in the UI.

### ERR‑12: No Retry Button for Errors in NarrationDisplay
**Severity:** High  
**Description:** When non-narrator errors occur, NarrationDisplay shows an Alert with the error message but no retry button. The "Retry AI" button only appears during loading states, not error states.  
**Location:** `src/components/gameplay/NarrationDisplay.tsx` lines 106-113  
**Current Behaviour:** Error alerts display the error text with no recovery option.  
**Expected:** Error alerts should include a retry button linked to onRetryNarration.  
**Fix:** Add a retry button to the error Alert component that calls onRetryNarration.

### ERR‑13: Network Errors Without Clear Message/Recovery
**Severity:** Medium  
**Description:** Network errors during gameplay (AI requests, multiplayer) show generic messages without clear explanation or recovery options.  
**Location:** `src/components/gameplay/GameplayLayout.tsx`, `src/components/screens/Gameplay.tsx`  
**Current Behaviour:** Generic error messages, no clear next steps for users.  
**Expected:** Clear error messages explaining what went wrong and what the user can do (retry, check connection, etc.).  
**Fix:** Improve error messages for network errors. Add retry buttons and connection check options.

### ERR‑14: No Fallback Notification to Players
**Severity:** Medium  
**Description:** When AI falls back to default values or cached responses, players are not notified that a fallback is active.  
**Location:** `src/components/gameplay/NarrationDisplay.tsx`, `src/context/GameContext.tsx`  
**Current Behaviour:** Silent fallback without user notification.  
**Expected:** Toast or alert notifying the player that AI failed and a fallback is active.  
**Fix:** Show a toast notification when falling back to defaults, with an option to retry the AI request.

### ERR‑15: Silent Action Failures
**Severity:** Medium  
**Description:** When player actions fail (AI processing fails, state updates fail), the user may not receive clear feedback about what went wrong.  
**Location:** `src/components/gameplay/ActionInput.tsx`, `src/components/screens/Gameplay.tsx`  
**Current Behaviour:** Action failures may be silent or show generic errors.  
**Expected:** Clear error messages for action failures with guidance on what to do next.  
**Fix:** Improve error handling for action processing. Show specific error messages and retry options.

### ERR‑16: ChatPanel Errors Not Surfaced
**Severity:** Low  
**Description:** Errors in chat functionality (multiplayer chat, local chat) are not properly surfaced to users.  
**Location:** `src/components/gameplay/ChatPanel.tsx`  
**Current Behaviour:** Chat errors may fail silently.  
**Expected:** Chat errors should show toast notifications or inline error messages.  
**Fix:** Add error handling and user feedback for chat operations.

### ERR‑17: No Error Toast for Save/Load Operations
**Severity:** Medium  
**Description:** Save and load operations can fail silently or with minimal feedback. Users don't get clear error messages explaining what went wrong.  
**Location:** `src/context/GameContext.tsx` (save/load functions)  
**Current Behaviour:** Errors are logged to console but not shown to user.  
**Expected:** Toast notifications for save/load failures with specific error messages (e.g., "Storage full", "Corrupted data").  
**Fix:** Add toast notifications for all save/load operations. Explain what went wrong and offer recovery options.

### ERR‑18: Silent Save/Load Failure for Adventures
**Severity:** High  
**Description:** In GameContext.tsx, when loading saved adventures from localStorage, if JSON parsing fails or data is corrupted, the error is only logged to console and the corrupted data is removed. The user receives no explanation of what went wrong.  
**Location:** `src/context/GameContext.tsx` lines 86-101  
**Current Behaviour:** Silent failure with console log only. Corrupted data is removed without user consent or explanation.  
**Expected:** User should receive a clear error message explaining that save data is corrupted, which field is missing/invalid, and offer recovery options (delete corrupted data, try loading older backup, etc.).  
**Fix:** Show toast/alert with specific error details. Offer recovery options like "Delete corrupted data" or "Try loading backup".

### ERR‑19: Generic Catch Blocks Swallow Error Details
**Severity:** Medium  
**Description:** Multiple catch blocks in context files catch errors generically and only log them, swallowing important error details that could help diagnose issues.  
**Location:** `src/context/GameContext.tsx`, `src/context/game-reducer.ts`, all reducers in `src/context/reducers/`  
**Current Behaviour:** `catch (error) { console.error(...); }` - error details are lost.  
**Expected:** Errors should be logged with full context (what operation failed, what data was being processed) and surfaced to the user when appropriate.  
**Fix:** Improve error logging with context. Surface user-facing errors via toasts. Don't swallow error details.

### ERR‑20: No Recovery Option for Corrupted Data
**Severity:** Medium  
**Description:** When saved adventure data is corrupted, there is no recovery option. The data is simply removed without offering to repair or restore from backup.  
**Location:** `src/context/GameContext.tsx` lines 86-101  
**Current Behaviour:** Corrupted data is removed silently.  
**Expected:** Offer recovery options: "Delete corrupted data", "Restore from backup", "Try repairing".  
**Fix:** Implement recovery options for corrupted save data. Store backups before overwriting.

### ERR‑21: Migration Errors Not Explained to User
**Severity:** Medium  
**Description:** When saved adventure migration fails (version mismatch, missing fields), the user is not informed about what went wrong or how to fix it.  
**Location:** `src/context/GameContext.tsx` (migrateSavedAdventure function)  
**Current Behaviour:** Migration failures are silent or show generic errors.  
**Expected:** Clear error messages explaining which field is missing or invalid, and what version is expected.  
**Fix:** Add specific error messages for migration failures. Explain what's wrong and how to fix it.

### ERR‑22: localStorage Errors Silently Ignored
**Severity:** Medium  
**Description:** Errors from localStorage operations (quota exceeded, access denied) are caught but not properly surfaced to the user.  
**Location:** `src/context/GameContext.tsx` (save/load functions)  
**Current Behaviour:** localStorage errors are logged but user is not notified.  
**Expected:** Toast notification explaining "Storage full" or "Cannot access storage" with guidance.  
**Fix:** Catch localStorage errors and show user-friendly messages with guidance on how to free up space.

### ERR‑23: No Validation Error Messages
**Severity:** Low  
**Description:** When form validation fails (character creation, adventure setup), error messages may not be specific enough to help users understand what to fix.  
**Location:** `src/components/screens/CharacterCreation.tsx`, `src/components/screens/AdventureSetup.tsx`  
**Current Behaviour:** Generic validation errors or silent failures.  
**Expected:** Specific validation error messages (e.g., "Name must be at least 3 characters", "Stat points remaining: 5").  
**Fix:** Improve form validation error messages to be specific and actionable.

### ERR‑24: State Persistence Errors Not Shown
**Severity:** Medium  
**Description:** Errors during state persistence (saving to localStorage) are not shown to the user, who may think their progress is saved when it isn't.  
**Location:** `src/context/GameContext.tsx` (persistence effect)  
**Current Behaviour:** Persistence errors are logged but user is not notified.  
**Expected:** Toast notification when save fails, so user knows their progress isn't being saved.  
**Fix:** Add error toasts for persistence failures. Consider a "Save failed - click to retry" message.

### ERR‑25: Data Channel Errors Not Surfaced to Users
**Severity:** Medium  
**Description:** When a WebRTC data channel encounters an error via the onerror event handler, the error is only logged to the console via logger.error. Users receive no notification that a channel error occurred, and no reconnect option is presented.  
**Location:** `src/lib/webrtc-signalling.ts`, lines 368-370 (setupDataChannel function)  
**Current Behaviour:** Channel errors are only logged, no user notification or reconnect option.  
**Expected:** Channel errors should be surfaced to the user through a callback or state update. Critical channel errors should trigger reconnection with user notification.  
**Fix:** Add an onError callback parameter to setupDataChannel. Surface errors to users with reconnect buttons.

### ERR‑26: No Reconnect Button/Option After Connection Failure
**Severity:** High  
**Description:** When WebRTC connection fails (ICE candidate errors, SDP negotiation failures), there is no reconnect button or option presented to the user. They must manually refresh or rejoin.  
**Location:** `src/hooks/use-multiplayer.ts`, `src/lib/webrtc-signalling.ts`  
**Current Behaviour:** Connection failures may show errors but offer no recovery option.  
**Expected:** Clear error message with a "Reconnect" button that attempts to re-establish the connection.  
**Fix:** Add reconnect UI for connection failures. Implement automatic retry with exponential backoff and manual retry button.

### ERR‑27: ICE Candidate Errors Silently Ignored
**Severity:** Medium  
**Description:** Errors when adding ICE candidates (invalid candidate, connection closed) are caught but not surfaced to users or logged with sufficient context.  
**Location:** `src/lib/webrtc-signalling.ts` (addIceCandidate calls)  
**Current Behaviour:** ICE errors are silently ignored or minimally logged.  
**Expected:** ICE errors should be logged with context and surfaced to users if they cause connection failures.  
**Fix:** Improve error handling for ICE candidate operations. Surface critical ICE errors to users.

### ERR‑28: SDP Negotiation Failures Not Explained
**Severity:** Medium  
**Description:** When SDP offer/answer negotiation fails, the error is not explained to the user. They see generic "Connection failed" without understanding it's an SDP issue.  
**Location:** `src/lib/webrtc-signalling.ts` (createOffer, createAnswer, setRemoteDescription calls)  
**Current Behaviour:** SDP errors show generic messages.  
**Expected:** Specific error messages for SDP negotiation failures, with guidance (e.g., "Firewall may be blocking WebRTC").  
**Fix:** Catch SDP-specific errors and provide helpful messages. Suggest firewall/network troubleshooting steps.

### ERR‑29: Multiplayer State Errors Not Shown
**Severity:** Medium  
**Description:** Errors in multiplayer state management (failed to send game state, invalid state received) are not shown to users.  
**Location:** `src/hooks/use-multiplayer.ts`, `src/context/reducers/multiplayerReducer.ts`  
**Current Behaviour:** Multiplayer state errors may fail silently.  
**Expected:** Toast notifications for multiplayer state errors with specific messages.  
**Fix:** Add error handling and user feedback for multiplayer state operations.

### ERR‑30: No User Notification for Peer Disconnect
**Severity:** Low  
**Description:** When a peer disconnects (gracefully or due to error), the user may not receive a clear notification. They might wonder why a player disappeared.  
**Location:** `src/hooks/use-multiplayer.ts`, `src/components/gameplay/PartySidebar.tsx`  
**Current Behaviour:** Peer disconnects may be silent or show minimal UI update.  
**Expected:** Toast notification "Player X disconnected" with reason if available (left, connection lost, etc.).  
**Fix:** Add user notifications for peer connect/disconnect events with clear reasons.

### ERR‑31: Signalling Errors Swallowed
**Severity:** Medium  
**Description:** Errors in signalling (invalid offer/answer, decode failures) are caught but not properly surfaced with enough context to diagnose issues.  
**Location:** `src/lib/webrtc-signalling.ts` (decodeSignallingData, encodeSignallingData)  
**Current Behaviour:** Signalling errors are logged but context (what data failed to parse) is lost.  
**Expected:** Signalling errors should include the problematic data (safely truncated) and specific validation failure.  
**Fix:** Improve error messages for signalling failures. Include safe snippets of invalid data for debugging.

### ERR‑32: No Fallback for Data Channel Failure
**Severity:** Medium  
**Description:** When a data channel fails (error event, closes unexpectedly), there is no fallback mechanism. Messages may be lost without user notification.  
**Location:** `src/lib/webrtc-signalling.ts`, `src/hooks/use-multiplayer.ts`  
**Current Behaviour:** Data channel failures may cause message loss without notification.  
**Expected:** Fallback to alternative channel or queue messages for retry. Notify user of potential message loss.  
**Fix:** Implement fallback mechanisms for data channel failures. Queue messages and retry when channel reconnects.

### ERR‑33: Connection Timeout Without Retry UI
**Severity:** Medium  
**Description:** When WebRTC connection times out (no ICE candidate, connection takes too long), there is no retry UI. User sees "Connecting..." indefinitely or a generic timeout error.  
**Location:** `src/hooks/use-multiplayer.ts`, `src/lib/webrtc-signalling.ts`  
**Current Behaviour:** Timeouts may not be handled or show generic errors.  
**Expected:** Clear timeout message with "Retry Connection" button and guidance (check firewall, try different STUN server).  
**Fix:** Add timeout handling with user-friendly messages and retry UI.

### ERR‑34: WebRTC Errors Not Logged with Context
**Severity:** Low  
**Description:** WebRTC errors are logged without sufficient context (which peer, which channel, what operation was being attempted), making debugging difficult.  
**Location:** `src/lib/webrtc-signalling.ts`, `src/hooks/use-multiplayer.ts`  
**Current Behaviour:** Errors logged with minimal context.  
**Expected:** Errors logged with full context: peerId, channel label, operation being attempted, state of connection.  
**Fix:** Enhance error logging with structured context. Include peer info, channel info, and operation details.