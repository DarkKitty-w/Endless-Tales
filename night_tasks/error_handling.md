## Error Handling & Diagnostics

### Overall Error Handling Rating: **D**

**Rationale:**
- None of the AI provider calls have try-catch blocks (11 provider methods exposed)
- Raw AI responses are NOT preserved when parsing fails
- Error messages from AI proxy expose internal details
- WebRTC data channel errors are logged to console but not shown to users
- Save/load errors have no user-facing recovery options
- Multiple generic catch blocks swallow error details

---

### ERR-1: No Try-Catch in AI Provider Methods (11 Methods Exposed)
**Severity:** Critical  
**Description:** None of the AI provider methods (`generateContent` or `generateContentStream`) have try-catch blocks around their main API calls. All 11 methods across Gemini, OpenAI, Claude, DeepSeek, OpenRouter, and WebLLM providers will throw unhandled errors on network failures, timeouts or unexpected API responses.
**Location:** `src/ai/ai-router.ts` - lines 94, 131, 203, 241, 311, 349, 420, 458, 529, 567, 839, 866-873
**Root Cause:** Developers assumed the caller handles all errors, but the AI proxy route doesn't properly await the handler promises.
**Reproduction Steps:**
1. Trigger an AI call with invalid API key or network failure
2. The error propagates as unhandled promise rejection
3. No error response sent to client for async handler failures

**Fix:** Add try-catch blocks in each provider method:
```typescript
// Example for Gemini generateContent (line 94):
async generateContent(input: any): Promise<any> {
  try {
    const response = await this.fetch(/* ... */);
    if (!response.ok) {
      const errorText = await response.text();
      // PRESERVE RAW RESPONSE:
      return {
        error: true,
        errorText: errorText,
        status: response.status,
        rawResponse: errorText  // <-- Important for debugging
      };
    }
    return await response.json();
  } catch (error) {
    console.error('Gemini API Error:', error);
    return {
      error: true,
      errorMessage: error instanceof Error ? error.message : String(error),
      rawError: error  // <-- Preserve for diagnostics
    };
  }
}
```

---

### ERR-2: Raw AI Response Text Not Preserved on Parsing Failure
**Severity:** Critical  
**Description:** When `processAiResponse` or the `normalizer` fails in `narrate-adventure.ts`, the raw AI text (`text` variable) is NOT preserved or exposed. The `text` variable is scoped to the `try` block (lines 231-404) and inaccessible in the `catch` block (lines 406-437). Fallback responses use hardcoded strings without the raw AI output.
**Location:** `src/ai/flows/narrate-adventure.ts`, lines 231-437
**Root Cause:** Raw response variable scope is limited to try block; catch block can't access it.
**Reproduction Steps:**
1. AI returns invalid JSON or unexpected format
2. Parsing fails in `processAiResponse`
3. Catch block runs but `text` variable is undefined
4. User/developer cannot see what the AI actually returned

**Fix:** Hoist the `text` variable outside the try block and include it in error responses:
```typescript
// At the top of narrateAdventure function:
let rawAiText = '';  // <-- Hoist this variable

// In the streaming/non-streaming paths, assign:
rawAiText = text;  // <-- Store the raw text

// In the catch block (line 406):
catch (error) {
  console.error("AI Narration Error:", error);
  // Return fallback WITH raw text for debugging:
  return {
    narration: "The gamemaster ponders the mists of fate, but the arcane energies seem disrupted. Try again.",
    error: true,
    errorMessage: error instanceof Error ? error.message : String(error),
    rawAiResponse: rawAiText,  // <-- CRITICAL: Preserve raw response
    rawError: error
  };
}
```

---

### ERR-3: AI Proxy Route Doesn't Catch Async Handler Errors
**Severity:** High  
**Description:** The main POST handler in `route.ts` has a try-catch block (lines 46-52) that catches early request processing errors, but all async handler functions (`handleGemini`, `handleOpenAICompatible`, `handleClaude`) are returned as **unawaited promises**. Errors thrown inside these handlers propagate as unhandled promise rejections, NOT caught by the POST catch block.
**Location:** `src/app/api/ai-proxy/route.ts`, lines 7-53, 102-108, 196-202
**Root Cause:** Handlers are not properly awaited or wrapped in try-catch at the call site.
**Reproduction Steps:**
1. Send a request to `/api/ai-proxy`
2. Handler throws an error (e.g., non-JSON response from provider)
3. Error becomes unhandled promise rejection
4. Client receives no error response

**Fix:** Properly await handlers with try-catch:
```typescript
// In the POST handler, wrap handler calls:
try {
  let result;
  switch (provider) {
    case 'gemini':
      result = await handleGemini(request, providerName, systemMessage);
      break;
    // ... other cases
  }
  return NextResponse.json(result);
} catch (error) {
  // Now this catches handler errors too:
  console.error('AI Proxy Error:', error);
  return NextResponse.json({
    error: 'AI request failed',
    details: error instanceof Error ? error.message : String(error),
    // Don't expose internal details in production
  }, { status: 500 });
}
```

---

### ERR-4: Provider-Specific Error Messages Exposed to Client
**Severity:** Medium  
**Description:** The AI proxy handlers include provider-specific error details in responses:
- `handleGemini` (line 106): Returns `error.error?.message` from Gemini API
- `handleOpenAICompatible` (line 200): Returns `error.error?.message` from OpenAI/DeepSeek/OpenRouter
- `handleClaude` (line 336): Returns `JSON.parse(errorText)` which may contain provider details

**Location:** `src/app/api/ai-proxy/route.ts`, lines 104-106, 198-202, 334-342
**Root Cause:** Raw error responses from providers are passed through without sanitization.
**Reproduction Steps:**
1. Trigger an error from AI provider (e.g., rate limit exceeded)
2. Response includes provider-specific message like "OpenAI rate limit exceeded"
3. This reveals which provider is being used

**Fix:** Sanitize error messages and provide generic responses in production:
```typescript
// Instead of returning provider error directly:
return NextResponse.json({ error: error.error?.message }, { status: response.status });

// Use generic message but log details server-side:
console.error('OpenAI API Error:', error.error?.message);
return NextResponse.json({
  error: 'AI request failed. Please try again.'
  // Generic message for client
}, { status: 500 });
```

---

### ERR-5: WebRTC Data Channel Errors Not Shown to Users
**Severity:** High  
**Description:** WebRTC data channel errors are logged to console but never propagated to the UI:
- `webrtc-signalling.ts` line 240-242: `channel.onerror` handler only logs to console
- `webrtc-signalling.ts` line 221-228: `channel.onmessage` JSON parse errors only logged to console
- `use-multiplayer.ts` line 86-88: Silent failure when data channel not available

**Location:** `src/lib/webrtc-signalling.ts` lines 221-228, 240-242, 248-259; `src/hooks/use-multiplayer.ts` lines 86-88
**Root Cause:** No callback mechanism to propagate errors to UI layer.
**Reproduction Steps:**
1. Data channel encounters an error
2. Error logged to console
3. User sees no indication of the problem

**Fix:** Add error callbacks and show errors in UI:
```typescript
// In webrtc-signalling.ts, accept error callback:
export function setupDataChannel(pc: RTCPeerConnection, channel: RTCDataChannel, onMessage: (data: any) => void, onError?: (error: any) => void) {
  channel.onerror = (event) => {
    console.error('Data channel error:', event);
    onError?.(event);  // <-- Propagate to caller
  };
  // ...
}

// In use-multiplayer.ts, show error to user:
setupDataChannel(pc, channel, handleMessage, (error) => {
  toast({
    title: "Connection Error",
    description: "Data channel encountered an error. Attempting to reconnect...",
    variant: "destructive"
  });
});
```

---

### ERR-6: Connection Failures Tracked but No Clear User Messages
**Severity:** Medium  
**Description:** `useMultiplayer` hook catches errors in `createSession` and `joinSession` and sets `connectionStatus: 'failed'`, but only logs to console. The UI (CoopLobby) may show the status but without meaningful error details.
**Location:** `src/hooks/use-multiplayer.ts`, lines 200, 239
**Root Cause:** Error details not passed to UI layer.
**Reproduction Steps:**
1. Session creation or joining fails
2. Status set to 'failed'
3. User sees "Connection failed" but doesn't know why

**Fix:** Include error details in state and show in UI:
```typescript
// In use-multiplayer.ts error handlers:
catch (error) {
  console.error('Failed to create session:', error);
  return {
    ...state,
    connectionStatus: 'failed',
    lastError: error instanceof Error ? error.message : String(error)  // <-- Store error details
  };
}

// In CoopLobby.tsx, show the error:
{connectionStatus === 'failed' && (
  <Alert variant="destructive">
    <AlertTitle>Connection Failed</AlertTitle>
    <AlertDescription>
      {lastError || 'Unknown error occurred. Please try again.'}
    </AlertDescription>
  </Alert>
)}
```

---

### ERR-7: Save/Load Game Errors Have No User-Facing Recovery
**Severity:** High  
**Description:** Save/load operations in `GameContext.tsx` have try-catch blocks that log to `console.error` but provide no UI feedback:
- Lines 97-99: Loading saved adventures catches error, removes corrupted data, but user is unaware
- Lines 136: Loading API keys catches error, logs, no UI feedback
- Lines 164-185: No try-catch around `localStorage.setItem` or `sessionStorage.setItem` - can throw on full storage

**Location:** `src/context/GameContext.tsx`, lines 85-100, 121-137, 161-206
**Root Cause:** Errors handled server-side only, no toast/alert to inform user.
**Reproduction Steps:**
1. Try to load corrupted saved adventure
2. Data is removed silently
3. User doesn't know what happened

**Fix:** Add toast notifications for save/load errors:
```typescript
// When loading saved adventures fails:
catch (error) {
  console.error("Failed to load saved adventures:", error);
  // Remove corrupted data
  localStorage.removeItem('endlessTalesSavedAdventures');
  // Notify user:
  toast({
    title: "Load Failed",
    description: "Saved game data was corrupted and has been reset. Starting fresh.",
    variant: "destructive"
  });
}

// Add try-catch for storage operations:
try {
  localStorage.setItem('endlessTalesSavedAdventures', JSON.stringify(saved));
} catch (error) {
  toast({
    title: "Save Failed",
    description: "Storage is full or unavailable. Try deleting old saves.",
    variant: "destructive"
  });
}
```

---

### ERR-8: No "Show Raw Response" Debug Option for AI Failures
**Severity:** Medium  
**Description:** When AI narration fails, the UI shows a generic error toast but provides no way to see what the AI actually returned. This makes debugging extremely difficult for both developers and users reporting issues.
**Location:** `src/components/gameplay/NarrationDisplay.tsx`, `src/ai/flows/narrate-adventure.ts`
**Root Cause:** Raw AI response not stored in state or exposed via UI.
**Reproduction Steps:**
1. AI returns invalid response
2. Error toast shown
3. No way to inspect what the AI actually said

**Fix:** Store raw AI response in state and provide expandable debug section:
```typescript
// In game-actions.ts, when AI fails:
if (result.error && result.rawAiResponse) {
  dispatch({
    type: "SET_LAST_AI_ERROR",
    payload: {
      message: result.errorMessage,
      rawResponse: result.rawAiResponse  // <-- Store for debugging
    }
  });
}

// In NarrationDisplay.tsx, show debug info:
{lastAiError && (
  <Alert variant="destructive">
    <AlertTitle>AI Response Error</AlertTitle>
    <AlertDescription>
      <p>{lastAiError.message}</p>
      <details>
        <summary>Show Raw AI Response</summary>
        <pre className="mt-2 whitespace-pre-wrap text-xs">
          {lastAiError.rawResponse}
        </pre>
      </details>
    </AlertDescription>
  </Alert>
)}
```

---

### ERR-9: Streaming Errors Mid-Stream Not Handled Gracefully
**Severity:** Medium  
**Description:** When a streaming response fails mid-stream (e.g., network error, API timeout), the streaming providers in `ai-router.ts` don't handle this gracefully. The stream may end abruptly without informing the caller.
**Location:** `src/ai/ai-router.ts`, streaming methods for all providers (lines 131, 241, 349, 458, 567, 866-873)
**Root Cause:** Stream reading loops don't have proper error handling for mid-stream failures.
**Reproduction Steps:**
1. Start AI streaming response
2. Network fails mid-stream
3. Stream ends abruptly
4. No error returned to caller

**Fix:** Add error handling in stream reading loops:
```typescript
// Example for Gemini streaming (line 131):
async *generateContentStream(input: any): AsyncGenerator<any> {
  try {
    const response = await this.fetch(/* ... */);
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    while (true) {
      try {
        const { done, value } = await reader.read();
        if (done) break;
        // ... process chunk
      } catch (streamError) {
        console.error('Stream error:', streamError);
        yield { error: true, message: 'Stream interrupted', details: streamError };
        break;
      }
    }
  } catch (error) {
    yield { error: true, message: error instanceof Error ? error.message : String(error) };
  }
}
```

---

### ERR-10: Generic Catch Blocks Swallow Error Details
**Severity:** Medium  
**Description:** Multiple catch blocks in the codebase swallow error details:
- `game-actions.ts`: Multiple catch blocks log to console but dispatch generic error actions
- `GameContext.tsx` line 97: `catch (error) { console.error("Failed to load saved adventures:", error); }` - error details not passed to user
- `use-multiplayer.ts`: Various catch blocks only log to console

**Location:** `src/context/game-actions.ts`, `src/context/GameContext.tsx`, `src/hooks/use-multiplayer.ts`
**Root Cause:** Errors caught but details not preserved or propagated.
**Reproduction Steps:**
1. Any error occurs in these try-catch blocks
2. Error logged to console
3. User/UI doesn't receive error details

**Fix:** Preserve error details and propagate to UI:
```typescript
// Instead of just logging:
catch (error) {
  console.error("Error:", error);
}

// Preserve and propagate:
catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error("Error:", error);
  // Dispatch with details:
  dispatch({
    type: "SET_ERROR",
    payload: { message: errorMessage, details: error }
  });
}
```

---

### ERR-11: No Retry Button for Failed AI Requests
**Severity:** Medium  
**Description:** When an AI request fails (network error, API error, timeout), the UI shows an error toast but provides no "Retry" button. The user must manually re-submit their action.
**Location:** `src/components/gameplay/NarrationDisplay.tsx`, `src/context/game-actions.ts`
**Root Cause:** Error UI doesn't include retry action.
**Reproduction Steps:**
1. AI request fails
2. Error toast shown
3. User must manually type their action again

**Fix:** Add retry button to error UI:
```typescript
// In NarrationDisplay.tsx error state:
{aiError && (
  <Alert variant="destructive">
    <AlertTitle>AI Response Failed</AlertTitle>
    <AlertDescription className="flex items-center gap-2">
      <span>{aiError}</span>
      <Button size="sm" variant="outline" onClick={() => retryLastAction()}>
        Retry
      </Button>
    </AlertDescription>
  </Alert>
)}
```

---

### ERR-12: ICE Candidate Errors Silently Ignored
**Severity:** Low  
**Description:** When adding ICE candidates via `pc.addIceCandidate()`, errors are caught and logged to console but not shown to the user. Multiple failed ICE candidates could indicate connection problems.
**Location:** `src/lib/webrtc-signalling.ts`, lines 146-148, 182-185
**Root Cause:** Errors logged but not propagated to UI.
**Reproduction Steps:**
1. Invalid ICE candidate received
2. Error logged to console
3. User unaware of connection issues

**Fix:** Count failures and notify user if threshold exceeded:
```typescript
let iceCandidateErrors = 0;

for (const candidate of pkg.iceCandidates) {
  try {
    await pc.addIceCandidate(candidate);
  } catch (e) {
    iceCandidateErrors++;
    console.warn('Failed to add ICE candidate:', e);
    if (iceCandidateErrors > 3) {
      toast({
        title: "Connection Issues",
        description: "Multiple ICE candidate failures. Connection may be unstable.",
        variant: "warning"
      });
    }
  }
}
```

---

### ERR-13: Abort/Timeout Errors Not Handled with Clear Messages
**Severity:** Medium  
**Description:** The AI proxy route and AI router use `AbortSignal.timeout()` for request timeouts, but when the timeout fires, the error message may not be clear to the user. The `signal: input.signal` is passed to providers but timeout errors may not be user-friendly.
**Location:** `src/ai/flows/narrate-adventure.ts` line 233, `src/ai/ai-router.ts` various provider methods
**Root Cause:** Timeout/abort errors not caught and translated to user-friendly messages.
**Reproduction Steps:**
1. AI request times out
2. User sees generic error or unhandled rejection
3. No indication that timeout occurred

**Fix:** Catch abort errors and show clear message:
```typescript
// In narrateAdventure:
try {
  const result = await aiProvider.generateContent(input);
  // ...
} catch (error) {
  if (error instanceof DOMException && error.name === 'AbortError') {
    return {
      narration: "The arcane energies are taking too long to respond. Please try again.",
      error: true,
      errorMessage: 'Request timed out. Please check your connection or try a different AI provider.'
    };
  }
  // ... other error handling
}
```

---

### Top 10 Worst Offenders for Error Handling

1. **`src/ai/ai-router.ts`** (11 methods without try-catch, streaming errors not handled)
2. **`src/app/api/ai-proxy/route.ts`** (async handlers not awaited, error details exposed)
3. **`src/ai/flows/narrate-adventure.ts`** (raw response not preserved, no debug option)
4. **`src/hooks/use-multiplayer.ts`** (WebRTC errors not shown to users, no clear messages)
5. **`src/lib/webrtc-signalling.ts`** (data channel errors only logged, ICE errors ignored)
6. **`src/context/GameContext.tsx`** (save/load errors no UI feedback, storage errors not caught)
7. **`src/context/game-actions.ts`** (generic catch blocks swallow details)
8. **`src/components/gameplay/NarrationDisplay.tsx`** (no retry button, no raw response debug)
9. **`src/components/screens/CoopLobby.tsx`** (connection errors not shown with details)
10. **`src/ai/flows/`** (all flows - no "show raw response" debug option)
