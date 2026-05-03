## Bugs

### BUG-1: Malformed JSON in AI Proxy streaming responses
**Severity:** Critical  
**Description:** The streaming response transformation in the AI proxy route has malformed JSON structure when converting OpenAI/Claude formats to Gemini format. The `JSON.stringify` calls on lines 232 and 373 have mismatched brackets, causing the streaming to fail with a SyntaxError.
**Location:** `src/app/api/ai-proxy/route.ts`, lines 232 and 373
**Root Cause:** Extra closing braces in the JSON.stringify template. Line 232 has `parts: [{ text: content }]})` (extra `}`) and line 373 has `parts: [{ text }] }]})` (extra `}`).
**Reproduction Steps:**
1. Configure an OpenAI, DeepSeek, OpenRouter, or Claude provider
2. Enable streaming mode
3. Send a request that triggers streaming
4. Observe SyntaxError in client when parsing the malformed JSON

**Fix:** Correct the JSON structure:
- Line 232: Change `JSON.stringify({ candidates: [{ content: { parts: [{ text: content }] }]})` to `JSON.stringify({ candidates: [{ content: { parts: [{ text: content }] } }] })`
- Line 373: Change `JSON.stringify({ candidates: [{ content: { parts: [{ text }] }]})` to `JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] })`

---

### BUG-2: Incomplete ICE Candidate Exchange for WebRTC
**Severity:** Critical  
**Description:** ICE candidates are only exchanged during the initial offer/answer creation. The `onIceCandidate` callback pushes to a local array, but candidates gathered *after* `waitForIceGathering()` completes are never exchanged between peers. This causes WebRTC connections to fail in many NAT traversal scenarios.
**Location:** `src/lib/webrtc-signalling.ts`, functions `createOffer()`, `createAnswer()`, `applyAnswer()`
**Root Cause:** The `waitForIceGathering()` function has a 5-second timeout. Any ICE candidates gathered after this timeout (which is common with TURN servers) are pushed to `iceCandidates` array but never sent to the peer.
**Reproduction Steps:**
1. Host a session behind NAT
2. Guest tries to join from a different network
3. ICE gathering takes longer than 5 seconds or produces candidates after timeout
4. Connection fails or is extremely slow

**Fix:** Implement a mechanism to exchange ICE candidates in real-time after the initial connection. This could be done by:
1. Storing ICE candidates in a buffer during signalling
2. After the connection is established, send buffered candidates via the established data channel
3. Or implement a separate signalling channel for ongoing ICE candidate exchange

---

### BUG-3: Missing systemMessage in non-streaming AI call
**Severity:** High  
**Description:** The `narrateAdventure` function passes `systemMessage` to the streaming AI call but omits it in the non-streaming (assessDifficulty) path. This causes the AI to not receive the system prompt when difficulty assessment is enabled, potentially resulting in incorrect response format.
**Location:** `src/ai/flows/narrate-adventure.ts`, lines 251-258
**Root Cause:** The non-streaming path `client.models.generateContent()` doesn't include the `systemMessage` parameter.
**Reproduction Steps:**
1. Enable `assessDifficulty` in adventure settings
2. Take an action that triggers AI narration
3. The AI doesn't receive the system message, potentially affecting response quality/format

**Fix:** Add `systemMessage: systemMsg` to the non-streaming generateContent call:
```typescript
const response = await client.models.generateContent({
    contents: userPrompt,
    systemMessage: systemMsg,  // ADD THIS
    config: { responseMimeType: "application/json" },
    signal: input.signal,
});
```

---

### BUG-4: Turn index can go out of bounds
**Severity:** High  
**Description:** The `ADVANCE_TURN` action in `multiplayerReducer` doesn't validate that `newIndex` is within the bounds of `turnOrder` array. If `turnOrder` is empty or the index is invalid, this can cause runtime errors.
**Location:** `src/context/reducers/multiplayerReducer.ts`, lines 69-76
**Root Cause:** No bounds checking on `newIndex` before accessing `state.turnOrder[newIndex]`
**Reproduction Steps:**
1. Start a multiplayer game
2. Have players disconnect such that turnOrder becomes empty or shorter
3. Trigger ADVANCE_TURN with an invalid index
4. `state.turnOrder[newIndex]` returns undefined, causing `isMyTurn` check to fail

**Fix:** Add bounds checking:
```typescript
case "ADVANCE_TURN": {
    const newIndex = action.payload;
    if (newIndex < 0 || newIndex >= state.turnOrder.length) {
        console.error('ADVANCE_TURN: Invalid turn index', newIndex);
        return state;
    }
    return {
        ...state,
        currentTurnIndex: newIndex,
        isMyTurn: state.turnOrder[newIndex] === state.peerId,
    };
}
```

---

### BUG-5: Stale closure in handleMessage callback
**Severity:** High  
**Description:** The `handleMessage` function in `useMultiplayer` hook captures `multiplayerState.isHost` and `multiplayerState.peerId` from the closure. Although these are listed in the dependency array, the function is used as a callback and may not update properly when the state changes between renders.
**Location:** `src/hooks/use-multiplayer.ts`, lines 305-424
**Root Cause:** The `useCallback` dependency array includes `multiplayerState.isHost` and `multiplayerState.peerId`, but these are primitive values from the current closure. If the callback is invoked after a state change but before React re-renders, stale values may be used.
**Reproduction Steps:**
1. Start as host (`isHost = true`)
2. Quickly transition to guest role
3. Receive a message before React re-renders
4. The message handler may incorrectly use `isHost = true` from stale closure

**Fix:** Use refs to track the current state values, or access state through a ref in the callback:
```typescript
const handleMessage = useCallback((data: MultiplayerMessage, channelLabel: string) => {
    const currentState = multiplayerStateRef.current;  // Use ref instead of closure
    // ... use currentState.isHost, currentState.peerId
}, [/* remove state dependencies, use ref */]);
```

---

### BUG-6: AI response normalizer can fail silently on malformed responses
**Severity:** Medium  
**Description:** The `normalizer` function in `narrateAdventure` attempts to handle various AI response formats but may fail silently when the response structure is unexpected. Some properties like `data.character_defeated` (typo: should be `character_defeated` vs `isCharacterDefeated`) create confusion.
**Location:** `src/ai/flows/narrate-adventure.ts`, lines 291-389
**Root Cause:** Multiple inconsistent property names and lack of null checks on nested objects
**Reproduction Steps:**
1. Use an AI provider that returns non-standard JSON format
2. The normalizer may return partial or incorrect data
3. Game state becomes inconsistent

**Fix:** 
1. Standardize property names in the normalizer
2. Add more defensive null checks
3. Validate the output against the schema more strictly

---

### BUG-7: WebLLMProvider static properties can cause race conditions
**Severity:** Medium  
**Description:** `WebLLMProvider` uses static properties (`engine`, `currentModel`, `loadingPromise`) that are shared across all instances. If multiple components try to use WebLLM simultaneously, this can cause race conditions or incorrect engine reuse.
**Location:** `src/ai/ai-router.ts`, lines 690-822
**Root Cause:** Static class properties are shared across all instances, and the `loadingPromise` is static, which can cause issues when multiple instances try to load different models.
**Reproduction Steps:**
1. Create multiple WebLLM provider instances
2. Try to load different models simultaneously
3. The static loadingPromise may cause one load to be "lost" or incorrect engine to be returned

**Fix:** Consider using instance properties instead of static properties, or add proper locking mechanism for the loading state.

---

### BUG-8: Character respawn calculates max stats with debuff modifiers
**Severity:** Medium  
**Description:** In the `RESPAWN_CHARACTER` handler, the code calculates new max stats using `effectiveStats` which includes the newly added "Weakened" debuff (-2 to strength, stamina, wisdom). This means the character respawns with reduced max stats due to a debuff that's already being tracked separately.
**Location:** `src/context/reducers/characterReducer.ts`, lines 270-319
**Root Cause:** The respawn logic computes `effectiveStats` by applying all status effect modifiers, then uses these to calculate max stats. But max stats should be based on base stats, not debuffed stats.
**Reproduction Steps:**
1. Character dies
2. Respawn occurs
3. Max health/stamina/mana are calculated with the -2 debuff applied
4. After debuff expires, max stats don't automatically restore

**Fix:** Calculate max stats using `baseStats` (state.stats) instead of `effectiveStats`:
```typescript
const newMaxHealth = calculateMaxHealth(state.stats);  // Use base stats, not effectiveStats
```

---

### BUG-9: Reconnect logic can cause infinite loops
**Severity:** Medium  
**Description:** The `reconnect` function in `useMultiplayer` hook can be called multiple times rapidly (e.g., when multiple data channels close). The `isReconnectingRef` prevents simultaneous reconnects, but if reconnect fails, it doesn't implement exponential backoff or max retry limit properly.
**Location:** `src/hooks/use-multiplayer.ts`, lines 260-281
**Root Cause:** The reconnect attempt counter `reconnectAttempts` is reset on success but the reconnect function can be triggered multiple times. Also, there's no delay between retry attempts.
**Reproduction Steps:**
1. Connection drops
2. Multiple data channels close rapidly
3. Multiple reconnect attempts are triggered
4. If all fail, the user may see repeated connection attempts without backoff

**Fix:** 
1. Add exponential backoff delay between retries
2. Ensure only one reconnect attempt happens at a time
3. Consider showing a "reconnecting..." UI state with timeout

---

### BUG-10: Typo in property name `progressedToStage` vs `progressedToStage`
**Severity:** Low  
**Description:** In `src/ai/flows/narrate-adventure.ts` line 373, the normalizer accesses `data.progressedToStage` but the schema defines `progressedToStage` (line 74). This typo means the progressedToStage value from AI response is never properly captured.
**Location:** `src/ai/flows/narrate-adventure.ts`, line 373
**Root Cause:** Typo in property name - `progressedToStage` should be `progressedToStage`
**Reproduction Steps:**
1. AI returns a response with `progressedToStage` set
2. The normalizer looks for `data.progressedToStage` (typo)
3. Skill tree progression from narration doesn't work

**Fix:** Correct the typo:
```typescript
progressedToStage: data.progressedToStage,  // Fix: progressedToStage (not progressedToStage)
```