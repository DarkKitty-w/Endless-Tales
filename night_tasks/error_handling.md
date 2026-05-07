# Error Handling & Diagnostics Audit

## Overview
This document audits the Endless Tales project's error handling robustness, with emphasis on AI failures and raw response preservation. The critical requirement is: **when the AI returns invalid JSON or fails, the raw AI response text must never be hidden from the user/developer.**

## Summary
- **Total Issues Found**: 15
- **High Severity**: 5
- **Medium Severity**: 7
- **Low Severity**: 3

---

## Detailed Findings

### ERR-1: Raw AI Response Not Shown to End Users in Production
**Severity:** High  
**Description:** When AI returns invalid JSON, the `processAiResponse` function in `utils.ts` returns a fallback silently. While the raw response is logged to console, it is NOT displayed to end users in production - only in development mode via the `errorRawResponse` prop.  
**Location:** `src/lib/utils.ts`, lines 346-349 and `src/components/gameplay/NarrationDisplay.tsx`, lines 154-158  
**Current Behaviour:** Raw response only shown when `process.env.NODE_ENV === 'development'`. In production, users only see generic error messages.  
**Expected:** Raw AI response (or at least the first 500 characters) should be visible to users in production for transparency and debugging.  
**Fix:** Remove the `process.env.NODE_ENV === 'development'` check or add a "Show Details" expandable section in production UI that reveals the raw response.

---

### ERR-2: AI Proxy Hides Provider Error Details from Clients
**Severity:** High  
**Description:** The server-side AI proxy (`/api/ai-proxy/route.ts`) catches errors and returns sanitized messages to clients (SEC-3 Fix). While this is good for security, it means the raw error details from providers (like rate limit specifics) are never shown to developers.  
**Location:** `src/app/api/ai-proxy/route.ts`, lines 225-231  
**Current Behaviour:** Returns generic "AI request failed" message to client, logs detailed error server-side only.  
**Expected:** For developer debugging, the raw provider error should be includable via a dev-mode flag or logged with correlation IDs that developers can look up.  
**Fix:** Add request ID/trace ID to error responses so developers can correlate client errors with server logs. Consider adding an optional `includeDetails` parameter for development.

---

### ERR-3: WebRTC Data Channel Errors Need Better User Visibility
**Severity:** High  
**Description:** When WebRTC data channels encounter errors, the `onError` callback is called, but the user may not see meaningful reconnection options or understand why the connection failed.  
**Location:** `src/lib/webrtc-signalling.ts`, lines 557-561; `src/hooks/use-multiplayer.ts`, lines 262-264  
**Current Behaviour:** Errors are logged and callback is called, but the UI may not clearly show reconnect buttons or explain what went wrong.  
**Expected:** Clear error messages like "Connection lost. Attempting to reconnect..." with manual reconnect button.  
**Fix:** Ensure the multiplayer UI components display `onError` callbacks with meaningful messages and reconnect options.

---

### ERR-4: WebLLM Streaming Errors Could Lose Partial Responses
**Severity:** Medium  
**Description:** In `ai-router.ts`, the WebLLM streaming handler accumulates text but if an error occurs mid-stream, the partial response may be lost to the user.  
**Location:** `src/ai/ai-router.ts`, lines 1828-1881  
**Current Behaviour:** On error, throws new Error with partial response included in message, but this may not be properly caught and displayed.  
**Expected:** Partial responses should be preserved and shown to the user even when streaming fails.  
**Fix:** Ensure the partial `accumulatedText` is returned or displayed even on error.

---

### ERR-5: Save/Load Migration Errors Could Be More Informative
**Severity:** Medium  
**Description:** When save data migration fails, the user gets a toast notification but may not understand which specific field caused the issue.  
**Location:** `src/context/GameContext.tsx`, lines 281-350; `src/context/schemas/migration-system.ts`  
**Current Behaviour:** Migration errors trigger toasts with generic messages. The `migrationErrorCallback` provides some info but could be more specific.  
**Expected:** Show which adventure failed and why (e.g., "Adventure 'John's Quest': Missing character data").  
**Fix:** Enhance `migrationErrorCallback` to include adventure identifier and specific validation errors.

---

### ERR-6: AI Flow Error Handling Swallows Raw Response
**Severity:** Medium  
**Description:** In some AI flows (e.g., `generate-character-description.ts`), when JSON parsing fails, the raw response is included in the error message, but the fallback return may not preserve this for the UI.  
**Location:** `src/ai/flows/generate-character-description.ts`, lines 126-148; similar patterns in `suggest-existing-characters.ts`, `suggest-original-character-concepts.ts`, `summarize-adventure.ts`  
**Current Behaviour:** Error includes raw response in message, but when caught by caller, only generic fallback may be used.  
**Expected:** The `rawResponse` field should always be populated on error and displayed in UI.  
**Fix:** Ensure all callers check for and display `rawResponse` from failed AI calls.

---

### ERR-7: Timeout Errors Don't Show in UI with Retry
**Severity:** Medium  
**Description:** When AI requests timeout (30s), the proxy returns an error but the UI may not clearly indicate this was a timeout vs. other error, and may not offer retry.  
**Location:** `src/app/api/ai-proxy/route.ts`, lines 195-201; `src/components/gameplay/NarrationDisplay.tsx`  
**Current Behaviour:** Timeout returns "AI request timed out" message, but UI shows generic error with retry button.  
**Expected:** Timeout errors should be distinctly identified with "Request timed out after 30 seconds" and suggest retrying with simpler prompt.  
**Fix:** Add specific styling/messaging for timeout errors in the UI.

---

### ERR-8: Network Errors Not Differentiated in UI
**Severity:** Medium  
**Description:** Network errors (502, 503, connection refused) from AI providers are caught and return generic messages. The UI doesn't differentiate these from other errors.  
**Location:** `src/app/api/ai-proxy/route.ts`, lines 203-215  
**Current Behaviour:** Returns "Network connection failed. Please check your internet connection and try again."  
**Expected:** The UI should show a specific "Network Error" indicator with connection status.  
**Fix:** Add network error type to error response and handle it specifically in UI components.

---

### ERR-9: AbortError Handling Inconsistent Across Flows
**Severity:** Low  
**Description:** While most AI flows check for `AbortError` and re-throw, some generic catch blocks may swallow these errors.  
**Location:** `src/ai/flows/*.ts` (various files)  
**Current Behaviour:** Most flows have `if (error.name === 'AbortError') throw error;` but consistency should be verified.  
**Expected:** All AI flows should consistently handle AbortError and not log it as a regular error.  
**Fix:** Audit all flows to ensure AbortError is always re-thrown and not logged.

---

### ERR-10: Generic Catch Blocks in WebRTC Signalling
**Severity:** Medium  
**Description:** Some catch blocks in `webrtc-signalling.ts` silently ignore errors (e.g., line 444-446: "Continue - non-fatal"). While some are truly non-fatal, they should at least be logged at debug level.  
**Location:** `src/lib/webrtc-signalling.ts`, lines 348-350, 444-446  
**Current Behaviour:** Some ICE candidate errors are logged as warnings but then execution continues silently.  
**Expected:** Non-fatal errors should still be tracked for diagnostics, perhaps with a counter or health metric.  
**Fix:** Add error counting for non-fatal errors to detect patterns.

---


### ERR-11: Fallback Indicators Not Always Visible to Users
**Severity:** Medium  
**Description:** AI responses include `usedFallback: true` and `rawResponse` fields, but the UI doesn't always indicate to the user that a fallback is being used.  
**Location:** `src/ai/flows/narrate-adventure.ts`, lines 71-73; `src/components/gameplay/NarrationDisplay.tsx`  
**Current Behaviour:** Fallback flag exists in data but UI may not show "Using fallback response" indicator.  
**Expected:** When a fallback is used, the UI should subtly indicate this (e.g., "(AI fallback used)" text or different styling).  
**Fix:** Check for `usedFallback` in AI response data and display indicator in narration.

---

### ERR-12: LocalStorage Quota Errors Not Handled Gracefully
**Severity:** Low  
**Description:** While `storage-utils.ts` has quota checking, the UI doesn't proactively warn users before hitting localStorage limits.  
**Location:** `src/lib/storage-utils.ts`, lines 130-157; `src/context/GameContext.tsx`  
**Current Behaviour:** `isLocalStorageQuotaLow()` exists but may not be called before save operations.  
**Expected:** Warn user when storage is above 90% capacity and suggest deleting old saves.  
**Fix:** Call quota check before saving and show warning toast.

---

### ERR-13: Multiplayer Reconnection State Not Clearly Communicated
**Severity:** Low  
**Description:** When WebRTC reconnects, the user may see brief disconnection but not understand that automatic reconnection is in progress.  
**Location:** `src/hooks/use-multiplayer.ts`, lines 580-585  
**Current Behaviour:** "Data channel closed unexpectedly, attempting reconnect..." is logged but UI may not show this.  
**Expected:** Show a toast or banner "Reconnecting to host..." during reconnection attempts.  
**Fix:** Pass reconnection state to UI components and display appropriate messaging.

---

### ERR-14: JSON Parse Errors in processAiResponse Fail Silently
**Severity:** High  
**Description:** The `processAiResponse` function tries multiple extraction strategies, but if all fail, it returns the fallback without any user-visible indication that parsing failed (unless in dev mode).  
**Location:** `src/lib/utils.ts`, lines 333-349  
**Current Behaviour:** Logs error to console, returns fallback. Only dev mode shows raw response.  
**Expected:** The fallback should include an error flag and the raw response should be accessible.  
**Fix:** Modify `processAiResponse` to always attach `rawResponse` and `parseError` to the fallback object.

---

### ERR-15: AI Proxy Doesn't Preserve Raw Response for All Error Types
**Severity:** High  
**Description:** While the proxy does preserve raw response for JSON parse errors (lines 393-403, 561-571, 772-781), other error types (like HTTP 500 from provider) may not include the raw error response in the client response.  
**Location:** `src/app/api/ai-proxy/route.ts`, lines 310-349 (Gemini handler), 474-517 (OpenAI-compatible handler)  
**Current Behaviour:** For HTTP errors, the raw error text is logged but a sanitized message is sent to client.  
**Expected:** For debugging, the raw provider error response should be includable (at least in dev mode or with proper sanitization).  
**Fix:** Include `providerRawError` field in error responses (sanitized for secrets) so developers can diagnose provider-specific issues.

---
