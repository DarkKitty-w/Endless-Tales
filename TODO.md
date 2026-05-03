# Endless Tales - TODO List#

## Bugs#

### BUG-1: Malformed JSON in AI Proxy streaming responses#
**Severity:** Critical  
**Description:** The streaming response transformation in the AI proxy route has malformed JSON structure when converting OpenAI/Claude formats to Gemini format. The `JSON.stringify` calls on lines 232 and 373 have mismatched brackets, causing the streaming to fail with a SyntaxError.
**Location:** `src/app/api/ai-proxy/route.ts`, lines 232 and 373#
**Root Cause:** Extra closing braces in the JSON.stringify template. Line 232 has `parts: [{ text: content }]})` (extra `}`) and line 373 has `parts: [{ text }] }]})` (extra `}`).
**Reproduction Steps:**
1. Configure an OpenAI, DeepSeek, OpenRouter, or Claude provider#
2. Enable streaming mode#
3. Send a request that triggers streaming#
4. Observe SyntaxError in client when parsing the malformed JSON#

**Fix:** Correct the JSON structure:#
- Line 232: Change `JSON.stringify({ candidates: [{ content: { parts: [{ text: content }] }]})` to `JSON.stringify({ candidates: [{ content: { parts: [{ text: content }] } }] })`
- Line 373: Change `JSON.stringify({ candidates: [{ content: { parts: [{ text }] }]})` to `JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] })`

---

### BUG-2: Incomplete ICE Candidate Exchange for WebRTC#
**Severity:** Critical  
**Description:** ICE candidates are only exchanged during the initial offer/answer creation. The `onIceCandidate` callback pushes to a local array, but candidates gathered *after* `waitForIceGathering()` completes are never exchanged between peers. This causes WebRTC connections to fail in many NAT traversal scenarios.
**Location:** `src/lib/webrtc-signalling.ts`, functions `createOffer()`, `createAnswer()`, `applyAnswer()`#
**Root Cause:** The `waitForIceGathering()` function has a 5-second timeout. Any ICE candidates gathered after this timeout (which is common with TURN servers) are pushed to `iceCandidates` array but never sent to the peer.#
**Reproduction Steps:**#
1. Host a session behind NAT#
2. Guest tries to join from a different network#
3. ICE gathering takes longer than 5 seconds or produces candidates after timeout#
4. Connection fails or is extremely slow#

**Fix:** Implement a mechanism to exchange ICE candidates in real-time after the initial connection. This could be done by:#
1. Storing ICE candidates in a buffer during signalling#
2. After the connection is established, send buffered candidates via the established data channel#
3. Or implement a separate signalling channel for ongoing ICE candidate exchange#

---

### BUG-3: Missing systemMessage in non-streaming AI call#
**Severity:** High  
**Description:** The `narrateAdventure` function passes `systemMessage` to the streaming AI call but omits it in the non-streaming (assessDifficulty) path. This causes the AI to not receive the system prompt when difficulty assessment is enabled, potentially resulting in incorrect response format.#
**Location:** `src/ai/flows/narrate-adventure.ts`, lines 251-258#
**Root Cause:** The non-streaming path `client.models.generateContent()` doesn't include the `systemMessage` parameter.#
**Reproduction Steps:**#
1. Enable `assessDifficulty` in adventure settings#
2. Take an action that triggers AI narration#
3. The AI doesn't receive the system message, potentially affecting response quality/format#

**Fix:** Add `systemMessage: systemMsg` to the non-streaming generateContent call:#
```typescript#
const response = await client.models.generateContent({#
    contents: userPrompt,#
    systemMessage: systemMsg,  // ADD THIS#
    config: { responseMimeType: "application/json" },#
    signal: input.signal,#
});#
```

---

### BUG-4: Turn index can go out of bounds#
**Severity:** High  
**Description:** The `ADVANCE_TURN` action in `multiplayerReducer` doesn't validate that `newIndex` is within the bounds of `turnOrder` array. If `turnOrder` is empty or the index is invalid, this can cause runtime errors.#
**Location:** `src/context/reducers/multiplayerReducer.ts`, lines 69-76#
**Root Cause:** No bounds checking on `newIndex` before accessing `state.turnOrder[newIndex]`#
**Reproduction Steps:**#
1. Start a multiplayer game#
2. Have players disconnect such that turnOrder becomes empty or shorter#
3. Trigger ADVANCE_TURN with an invalid index#
4. `state.turnOrder[newIndex]` returns undefined, causing `isMyTurn` check to fail#

**Fix:** Add bounds checking:#
```typescript#
case "ADVANCE_TURN": {#
    const newIndex = action.payload;#
    if (newIndex < 0 || newIndex >= state.turnOrder.length) {#
        console.error('ADVANCE_TURN: Invalid turn index', newIndex);#
        return state;#
    }#
    return {#
        ...state,#
        currentTurnIndex: newIndex,#
        isMyTurn: state.turnOrder[newIndex] === state.peerId,#
    };#
}#
```

---

### BUG-5: Stale closure in handleMessage callback#
**Severity:** High  
**Description:** The `handleMessage` function in `useMultiplayer` hook captures `multiplayerState.isHost` and `multiplayerState.peerId` from the closure. Although these are listed in the dependency array, the function is used as a callback and may not update properly when the state changes between renders.#
**Location:** `src/hooks/use-multiplayer.ts`, lines 305-424#
**Root Cause:** The `useCallback` dependency array includes `multiplayerState.isHost` and `multiplayerState.peerId`, but these are primitive values from the current closure. If the callback is invoked after a state change but before React re-renders, stale values may be used.#
**Reproduction Steps:**#
1. Start as host (`isHost = true`)#
2. Quickly transition to guest role#
3. Receive a message before React re-renders#
4. The message handler may incorrectly use `isHost = true` from stale closure#

**Fix:** Use refs to track the current state values, or access state through a ref in the callback:#
```typescript#
const handleMessage = useCallback((data: MultiplayerMessage, channelLabel: string) => {#
    const currentState = multiplayerStateRef.current;  // Use ref instead of closure#
    // ... use currentState.isHost, currentState.peerId#
}, [/* remove state dependencies, use ref */]);#
```

---

### BUG-6: AI response normalizer can fail silently on malformed responses#
**Severity:** Medium  
**Description:** The `normalizer` function in `narrateAdventure` attempts to handle various AI response formats but may fail silently when the response structure is unexpected. Some properties like `data.character_defeated` (typo: should be `character_defeated` vs `isCharacterDefeated`) create confusion.#
**Location:** `src/ai/flows/narrate-adventure.ts`, lines 291-389#
**Root Cause:** Multiple inconsistent property names and lack of null checks on nested objects#
**Reproduction Steps:**#
1. Use an AI provider that returns non-standard JSON format#
2. The normalizer may return partial or incorrect data#
3. Game state becomes inconsistent#

**Fix:** #
1. Standardize property names in the normalizer#
2. Add more defensive null checks#
3. Validate the output against the schema more strictly#

---

### BUG-7: WebLLMProvider static properties can cause race conditions#
**Severity:** Medium  
**Description:** `WebLLMProvider` uses static properties (`engine`, `currentModel`, `loadingPromise`) that are shared across all instances. If multiple components try to use WebLLM simultaneously, this can cause race conditions or incorrect engine reuse.#
**Location:** `src/ai/ai-router.ts`, lines 690-822#
**Root Cause:** Static class properties are shared across all instances, and the `loadingPromise` is static, which can cause issues when multiple instances try to load different models.#
**Reproduction Steps:**#
1. Create multiple WebLLM provider instances#
2. Try to load different models simultaneously#
3. The static loadingPromise may cause one load to be "lost" or incorrect engine to be returned#

**Fix:** Consider using instance properties instead of static properties, or add proper locking mechanism for the loading state.#

---

### BUG-8: Character respawn calculates max stats with debuff modifiers#
**Severity:** Medium  
**Description:** In the `RESPAWN_CHARACTER` handler, the code calculates new max stats using `effectiveStats` which includes the newly added "Weakened" debuff (-2 to strength, stamina, wisdom). This means the character respawns with reduced max stats due to a debuff that's already being tracked separately.#
**Location:** `src/context/reducers/characterReducer.ts`, lines 270-319#
**Root Cause:** The respawn logic computes `effectiveStats` by applying all status effect modifiers, then uses these to calculate max stats. But max stats should be based on base stats, not debuffed stats.#
**Reproduction Steps:**#
1. Character dies#
2. Respawn occurs#
3. Max health/stamina/mana are calculated with the -2 debuff applied#
4. After debuff expires, max stats don't automatically restore#

**Fix:** Calculate max stats using `baseStats` (state.stats) instead of `effectiveStats`:#
```typescript#
const newMaxHealth = calculateMaxHealth(state.stats);  // Use base stats, not effectiveStats#
```

---

### BUG-9: Reconnect logic can cause infinite loops#
**Severity:** Medium  
**Description:** The `reconnect` function in `useMultiplayer` hook can be called multiple times rapidly (e.g., when multiple data channels close). The `isReconnectingRef` prevents simultaneous reconnects, but if reconnect fails, it doesn't implement exponential backoff or max retry limit properly.#
**Location:** `src/hooks/use-multiplayer.ts`, lines 260-281#
**Root Cause:** The reconnect attempt counter `reconnectAttempts` is reset on success but the reconnect function can be triggered multiple times. Also, there's no delay between retry attempts.#
**Reproduction Steps:**#
1. Connection drops#
2. Multiple data channels close rapidly#
3. Multiple reconnect attempts are triggered#
4. If all fail, the user may see repeated connection attempts without backoff#

**Fix:** #
1. Add exponential backoff delay between retries#
2. Ensure only one reconnect attempt happens at a time#
3. Consider showing a "reconnecting..." UI state with timeout#

---

### BUG-10: Typo in property name `progressedToStage` vs `progressedToStage`#
**Severity:** Low  
**Description:** In `src/ai/flows/narrate-adventure.ts` line 373, the normalizer accesses `data.progressedToStage` but the schema defines `progressedToStage` (line 74). This typo means the progressedToStage value from AI response is never properly captured.#
**Location:** `src/ai/flows/narrate-adventure.ts`, line 373#
**Root Cause:** Typo in property name - `progressedToStage` should be `progressedToStage`#
**Reproduction Steps:**#
1. AI returns a response with `progressedToStage` set#
2. The normalizer looks for `data.progressedToStage` (typo)#
3. Skill tree progression from narration doesn't work#

**Fix:** Correct the typo:#
```typescript#
progressedToStage: data.progressedToStage,  // Fix: progressedToStage (not progressedToStage)#
```

---

## Polish & UX#

### POLISH-1: Inconsistent Font Usage in MainMenu#
**Severity:** Medium  
**Description:** The CardTitle in MainMenu.tsx uses `font-['Comic_Sans_MS',_'Chalkboard_SE',_'Marker_Felt',_sans-serif']` with underscores instead of spaces, which is inconsistent with the global CSS in `globals.css` that uses proper spaces (`'Comic Sans MS', 'Chalkboard SE', 'Marker Felt', sans-serif`). This can cause the font fallback to not work correctly.#
**Location:** `src/components/screens/MainMenu.tsx`, line 69#
**Root Cause:** Incorrect Tailwind arbitrary value syntax - underscores are used instead of spaces in font-family names#
**Reproduction Steps:**#
1. Open the Main Menu#
2. Inspect the "Endless Tales" title font#
3. The font may not render as intended because of the syntax error#

**Fix:** Change the font class to use proper CSS font-family syntax:#
```tsx#
// Remove the incorrect arbitrary value and rely on global CSS, or fix the syntax:#
className="text-4xl font-bold text-foreground mb-4"#
// The global CSS already sets the body font to the hand-drawn style#
```

---

### POLISH-2: Hardcoded Color Classes in CoopLobby (Not Theme-Aware)#
**Severity:** Medium  
**Description:** The CoopLobby component uses hardcoded color classes like `text-green-500`, `bg-green-600 hover:bg-green-700` that don't adapt when users switch themes. The app supports multiple themes via `src/lib/themes.ts`, but these classes bypass the theme system.#
**Location:** `src/components/screens/CoopLobby.tsx`, lines 148, 157, 207, 232, 269, 311#
**Root Cause:** Using Tailwind's default color classes instead of theme-aware classes like `text-primary`, `bg-accent`, etc.#
**Reproduction Steps:**#
1. Go to Settings and change the theme#
2. Open Co-op Lobby#
3. The green colors for success states and buttons don't match the selected theme#

**Fix:** Replace hardcoded colors with theme-aware classes:#
- `text-green-500` → `text-green-500 dark:text-green-400` (or use semantic colors like `text-success`)#
- `bg-green-600 hover:bg-green-700` → `bg-primary hover:bg-primary/90`#
```

---

### POLISH-3: PartySidebar Doesn't Show Player Stats (Health/Stamina/Mana)#
**Severity:** High  
**Description:** The "Connected Players" section in PartySidebar only displays player name, level, and class. It doesn't show health, stamina, or mana bars/values even though the `PlayerSummary` type likely contains this data (based on the `partyState` structure with `currentHealth`, `maxHealth`, etc.).#
**Location:** `src/components/gameplay/PartySidebar.tsx`, lines 185-226#
**Root Cause:** The UI was not implemented to display the stats that are already being tracked in the state#
**Reproduction Steps:**#
1. Start a multiplayer game#
2. Open the PartySidebar#
3. Notice only name, level, and class are shown#
4. No health/stamina/mana info is visible for other players#

**Fix:** Add stat display to the "Connected Players" section:#
```tsx#
<div className="flex items-center gap-2">#
  <div className="h-2 w-2 rounded-full bg-green-500" />#
  <span className="text-sm">{playerSummary.name}</span>#  <span className="text-xs text-muted-foreground">#
    (Lvl {playerSummary.level} {playerSummary.class})#
  </span>#  {/* ADD THIS: */}#
  <div className="ml-auto flex gap-2 text-xs">#
    <span className="text-red-500">{playerSummary.currentHealth}/{playerSummary.maxHealth}</span>#    <span className="text-blue-500">{playerSummary.currentStamina}/{playerSummary.maxStamina}</span>#    <span className="text-purple-500">{playerSummary.currentMana}/{playerSummary.maxMana}</span>#  </div>#</div>#
```

---

### POLISH-4: Unused Connection Step in CoopLobby#
**Severity:** Low  
**Description:** The `connectionStep` state in CoopLobby includes `'guest-input'` (line 25), and there's UI code for it (lines 298-315), but this step is never set in the component logic. The guest flow goes from `'idle'` → `'guest-waiting'` directly.#
**Location:** `src/components/screens/CoopLobby.tsx`, lines 25, 298-315#
**Root Cause:** Dead code from a previous UI flow design that was changed but not cleaned up#
**Reproduction Steps:**#
1. Review the code#
2. Notice `'guest-input'` is never set as `connectionStep`#
3. The UI block at lines 298-315 never renders#

**Fix:** Either implement the `'guest-input'` flow properly or remove the dead code:#
- Remove `'guest-input'` from the union type on line 25#
- Remove the UI block at lines 298-315#
- Or implement a separate screen for re-entering the offer code if needed#

---

### POLISH-5: ChatPanel Close Button Uses Text Instead of Icon#
**Severity:** Low  
**Description:** The ChatPanel close button uses the text character "✕" instead of a proper icon from lucide-react (like `X` icon). This is inconsistent with the rest of the app that uses lucide-react icons.#
**Location:** `src/components/gameplay/ChatPanel.tsx`, line 60#
**Root Cause:** Using a Unicode character instead of a proper icon component#
**Reproduction Steps:**#
1. Open the ChatPanel in multiplayer#
2. Observe the close button shows "✕" instead of a proper icon#
3. The styling and hover effects may not match other buttons#

**Fix:** Replace with lucide-react X icon:#
```tsx#
import { Send, X } from "lucide-react";#
// ...#
<Button variant="ghost" size="sm" onClick={onClose} aria-label="Close chat">#
  <X className="h-4 w-4" />#
</Button>#```

---

### POLISH-6: Duplicate Logic for Randomized Adventure in AdventureSetup#
**Severity:** Medium  
**Description:** The `handleProceed` function has duplicate logic for handling "Randomized" adventure type. Lines 182-184 handle it by starting gameplay if character exists, but lines 242-244 repeat a similar check with different behavior (going to CharacterCreation instead). This creates confusion and potential bugs.#
**Location:** `src/components/screens/AdventureSetup.tsx`, lines 182-184 and 242-244#
**Root Cause:** Logic was added twice during development, likely due to refactoring#
**Reproduction Steps:**#
1. Select "Randomized" adventure type#
2. If character exists: goes to Gameplay (line 182-184)#
3. If character doesn't exist: the flow reaches line 242-244 which sends to CharacterCreation#
4. But line 243-244 is actually dead code because line 182-184 already handles the Randomized case#

**Fix:** Remove the duplicate logic at lines 242-244 since the case is already handled above:#
```tsx#
// REMOVE this block (lines 242-244):#
} else if (adventureTypeFromContext === "Randomized") {#
    dispatch({ type: "SET_GAME_STATUS", payload: "CharacterCreation" });#
    toast({ title: "Adventure Setup Complete!", description: "Now, create your adventurer." });#
}#
```

---

### POLISH-7: Typo in Variable Name "startingSituation"#
**Severity:** Low  
**Description:** The variable `startingSituation` in AdventureSetup.tsx contains a typo - it should be `startingSituation` (with double 'u' in "Situation"). This appears in state declarations, useEffect, and the input field.#
**Location:** `src/components/screens/AdventureSetup.tsx`, lines 48, 85, 105, 280, 340#
**Root Cause:** Typo in variable naming - "Situation" is misspelled as "Situation" (missing a 'u')#
**Reproduction Steps:**#
1. Review the code#
2. Notice `startingSituation` is used instead of `startingSituation`#

**Fix:** Rename all occurrences of `startingSituation` to `startingSituation` (correct spelling)#

---

### POLISH-8: Missing Loading Spinner on ActionInput During Guest Action Wait#
**Severity:** Medium  
**Description:** When a guest player submits an action in multiplayer, the `pendingGuestAction` state shows a loading indicator in `NarrationDisplay`, but the `ActionInput` submit button only gets disabled without showing a spinner. This provides poor feedback to the guest player.#
**Location:** `src/components/gameplay/ActionInput.tsx` (referenced in subagent report)#
**Root Cause:** The button disabled state doesn't include a loading spinner#
**Reproduction Steps:**#
1. Join a multiplayer game as guest#
2. Submit an action#
3. The button disables but shows no visual loading indicator#
4. User may think the UI is frozen#

**Fix:** Add a loading spinner to the ActionInput submit button when waiting for host:#
```tsx#
<Button #
  onClick={handleSubmit} #
  disabled={isWaitingForHost || !inputValue.trim()}#
>#  {isWaitingForHost && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}#
  Submit#
</Button>#```

---

### POLISH-9: Inconsistent Icon Imports Across Components#
**Severity:** Low  
**Description:** Some components import icons with aliases (e.g., `Users as UsersIcon` in AdventureSetup.tsx line 12) while others import directly. This creates inconsistency in the codebase.#
**Location:** `src/components/screens/AdventureSetup.tsx`, line 12#
**Root Cause:** Inconsistent coding style across components#
**Reproduction Steps:**#
1. Compare icon imports across components#
2. Notice some use aliases, others don't#

**Fix:** Standardize icon imports - either always use aliases or never use them. Recommended: import directly without aliases for consistency:#
```tsx#
// Instead of:#import { Users as UsersIcon, ... } from "lucide-react";#
// Use:#import { Users, ... } from "lucide-react";#
// And use <Users /> directly#
```

---

### POLISH-10: Missing ARIA Labels on Form Elements in AdventureSetup#
**Severity:** Medium  
**Description:** Several form elements in AdventureSetup.tsx have `htmlFor` attributes on Labels but the associated inputs may not have proper `aria-describedby` or error states for screen readers. Also, the validation errors are shown via toast rather than inline with ARIA attributes.#
**Location:** `src/components/screens/AdventureSetup.tsx`, various form fields#
**Root Cause:** Accessibility was not fully implemented for form validation feedback#
**Reproduction Steps:**#
1. Use a screen reader#
2. Try to submit the form with missing required fields#
3. The error toast is not announced properly to screen readers#
4. Focus is not moved to the invalid fields#

**Fix:** Add proper ARIA attributes and inline error messages:#
```tsx#
<Input #
  id="worldType" #
  value={worldType} #
  onChange={(e) => setWorldType(e.target.value)}#
  aria-invalid={customError && !worldType.trim()}#
  aria-describedby={customError && !worldType.trim() ? "worldType-error" : undefined}#
/>#
{customError && !worldType.trim() && (#  <p id="worldType-error" className="text-sm text-destructive">#
    World Type is required.#
  </p>#)}#
```

---

## Performance#

### PERF-1: Context Value Changes Reference on Every Dispatch#
**Severity:** High  
**Description:** The context value in GameContext.tsx is memoized with `useMemo(() => ({ state, dispatch }), [state, dispatch])`, but the `state` object gets a new reference on **every single dispatch** because `gameReducer` always creates a new state object. Even when no sub-reducer makes changes, the spread `...state` creates a new reference. This causes **all consumers** of `useGame()` to re-render on every dispatch, regardless of whether they use the changed state.#
**Location:** `src/context/GameContext.tsx` line 244, `src/context/game-reducer.ts` lines 128-138#
**Root Cause:** Reducer always returns a new object even when no state changes occurred#
**Reproduction Steps:**#
1. Dispatch any action#
2. All components using `useGame()` re-render even if they don't use the changed parts#
3. Causes unnecessary re-renders across the entire component tree#

**Fix:** Compare new state with old state and return the old state reference if nothing changed:#
```typescript#
// At the end of gameReducer, before returning nextState:#if (#  nextState === state ||#  (nextState.character === state.character &&#   nextState.inventory === state.inventory &&#   nextState.adventureSettings === state.adventureSettings &&#   nextState.storyLog === state.storyLog &&#   nextState.turnCount === state.turnCount)#) {#  return state;  // Return OLD reference if nothing changed#}#
return nextState;#
```

---

### PERF-2: Excessive scrollToBottom Calls During Streaming#
**Severity:** Medium  
**Description:** The `scrollToBottom` function in NarrationDisplay.tsx is called on EVERY change to `streamingText`, which updates rapidly during AI streaming responses. This causes excessive scroll operations (potentially dozens per second) and forces layout recalculation.#
**Location:** `src/components/gameplay/NarrationDisplay.tsx`, lines 72-74#
**Root Cause:** The useEffect dependency array includes `streamingText` which changes rapidly during streaming#
**Reproduction Steps:**#
1. Start an AI narration with streaming enabled#
2. As text streams in, scrollToBottom is called on every chunk#
3. This causes layout thrashing and poor performance#

**Fix:** Debounce the scrollToBottom call, or only trigger it when `storyLog` length changes / new entries added, not on streaming text updates:#
```typescript#
// Use a separate effect for streaming that uses requestAnimationFrame with throttling#const [lastScrollTime, setLastScrollTime] = useState(0);#
useEffect(() => {#  const now = Date.now();#  if (now - lastScrollTime > 100) {  // Throttle to max 10 scrolls per second#    scrollToBottom();#    setLastScrollTime(now);#  }#}, [streamingText, scrollToBottom]);#
```

---

### PERF-3: Memory Leaks - Event Listeners Not Cleaned Up in useMultiplayer#
**Severity:** High  
**Description:** Several event listeners and timeouts are not properly cleaned up in the `useMultiplayer` hook:#
1. `peerConnection.ondatachannel` handlers (lines 182, 223) are assigned but never explicitly removed#
2. ICE candidate callbacks (lines 174, 215) push to `iceCandidatesRef` but are not cleaned up#
3. `setTimeout(() => reconnect(), 1000)` in data channel `onclose` handler (line 298) is not stored in a ref, so it cannot be cleared on unmount#
4. Data channel listeners added by `setupDataChannel` are never explicitly removed#

**Location:** `src/hooks/use-multiplayer.ts`, lines 182, 223, 174, 215, 298#
**Root Cause:** Missing cleanup functions for event listeners and timeouts#
**Reproduction Steps:**#
1. Connect to a multiplayer session#
2. Disconnect and unmount the component#
3. Event listeners may still be attached, causing memory leaks#
4. If reconnect timeout fires after unmount, it may try to call reconnect on an unmounted component#

**Fix:** Add proper cleanup:#
```typescript#
// Store timeout IDs in refs#const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);#

// In data channel onclose:#reconnectTimeoutRef.current = setTimeout(() => reconnect(), 1000);#

// In cleanup effect:#useEffect(() => {#  return () => {#    if (reconnectTimeoutRef.current) {#      clearTimeout(reconnectTimeoutRef.current);#    }#    // Close all data channels#    Object.values(dataChannelsRef.current).forEach(channel => {#      try {#        channel.onmessage = null;#        channel.onopen = null;#        channel.onclose = null;#        channel.close();#      } catch (e) {}#    });#  };#}, []);#
```

---

### PERF-4: String Concatenation in Loops (Streaming Buffer Accumulation)#
**Severity:** Medium  
**Description:** All streaming providers in `ai-router.ts` use `buffer += decoder.decode(value, { stream: true })` in a loop, which creates new string objects on each iteration since strings are immutable in JavaScript. This can cause memory pressure and GC overhead for large responses.#
**Location:** `src/ai/ai-router.ts`, lines 161, 269, 377, 486, 594#
**Root Cause:** String concatenation in loops creates many intermediate string objects#
**Reproduction Steps:**#
1. Use streaming with a provider that returns large responses#
2. Each chunk creates a new string object#
3. Can cause GC pressure and memory growth#

**Fix:** Use an array to collect chunks and join at the end, or use a more efficient buffering strategy:#
```typescript#
// Instead of:#let buffer = '';#
// ... in loop:#buffer += decoder.decode(value, { stream: true });#

// Use array:#const chunks: string[] = [];#
// ... in loop:#chunks.push(decoder.decode(value, { stream: true }));#
// At the end:#const text = chunks.join('');#
```

---

### PERF-5: Theme CSS Accumulation Bug#
**Severity:** Medium  
**Description:** The `applyTheme` function in GameContext.tsx explicitly clears ALL theme CSS custom properties before applying new ones. However, if themes define different sets of properties, properties from the old theme may persist if the new theme doesn't define them.#
**Location:** `src/context/GameContext.tsx`, lines 52-78#
**Root Cause:** The theme switching logic may not properly clean up all old theme properties#
**Reproduction Steps:**#
1. Apply a theme with many custom properties#
2. Switch to a theme with fewer properties#
3. Old properties may still be present in the DOM#

**Fix:** Ensure all theme properties are properly reset:#
```typescript#
const applyTheme = useCallback((themeId: string) => {#  const theme = themes.find(t => t.id === themeId);#  if (!theme) return;  #  const root = document.documentElement;  #  // Remove all existing theme custom properties#  const allThemeProps = new Set<string>();#  themes.forEach(t => {#    if (t.cssVars) {#      Object.keys(t.cssVars).forEach(prop => allThemeProps.add(prop));#    }#  });#  allThemeProps.forEach(prop => root.style.removeProperty(prop));  #  // Apply new theme#  if (theme.cssVars) {#    Object.entries(theme.cssVars).forEach(([key, value]) => {#      root.style.setProperty(key, value as string);#    });#  }#}, [themes]);#
```

---

### PERF-6: Unnecessary Array Copy on Every Render in NarrationDisplay#
**Severity:** Low  
**Description:** The `displayLog` constant in NarrationDisplay.tsx creates a new array on every render with `storyLog.slice(-50)`, even when `storyLog` hasn't changed. For 50 items this is minor, but it's still unnecessary work.#
**Location:** `src/components/gameplay/NarrationDisplay.tsx`, line 76#
**Root Cause:** Array copy happens on every render regardless of whether the input changed#
**Reproduction Steps:**#
1. Component re-renders for any reason#
2. A new array is created even if storyLog hasn't changed#

**Fix:** Memoize the displayLog calculation:#
```typescript#
const displayLog = useMemo(() => storyLog.slice(-50), [storyLog]);#
```

---

### PERF-7: Accordion Height Animations Cause Layout Thrashing#
**Severity:** Medium  
**Description:** The Tailwind config defines accordion keyframes that animate `height` property. Height animations trigger layout recalculations (reflows) which can cause performance issues, especially on lower-end devices. The Radix UI accordion content height is dynamic, and animating height from 0 to auto (via CSS variable) forces the browser to recalculate layout on each frame.#
**Location:** `tailwind.config.ts`, lines 72-98#
**Root Cause:** Height animations are not GPU-accelerated#
**Reproduction Steps:**#
1. Open a screen with accordion components#
2. Expand/collapse rapidly#
3. Notice layout thrashing#

**Fix:** Use `transform: scaleY()` or opacity animations instead, or use `transform: translateY` for slide effects which are GPU-accelerated:#
```javascript#
// In tailwind.config.ts, change from height animation to transform:#'accordion-down': { #  transform: 'scaleY(1)',#  transformOrigin: 'top'#},#'accordion-up': { #  transform: 'scaleY(0)',#  transformOrigin: 'top'#}#
```

---

### PERF-8: WebLLM Static Properties Race Condition (Performance Impact)#
**Severity:** Medium  
**Description:** `WebLLMProvider` uses static properties that are shared across all instances. If multiple components try to use WebLLM simultaneously, the static `loadingPromise` can cause one load to be "lost" or incorrect engine to be returned. This was listed as BUG-7 but also has performance implications.#
**Location:** `src/ai/ai-router.ts`, lines 690-822#
**Root Cause:** Static class properties cause contention#
**Reproduction Steps:**#
1. Multiple components try to initialize WebLLM#
2. Static loadingPromise gets overwritten#
3. One component may get a promise that doesn't belong to it#

**Fix:** Use instance properties instead of static properties to allow multiple independent WebLLM instances.#

---

### PERF-9: Dev Logging Still Active in Production#
**Severity:** Low  
**Description:** Multiple files have `console.log` statements that are active in production, including the WebLLM provider which has extensive logging. This can impact performance and expose internal state.#
**Location:** Multiple files - `ai-router.ts`, `use-multiplayer.ts`, `narrate-adventure.ts`, etc.#
**Root Cause:** Dev logging not stripped in production builds#
**Reproduction Steps:**#
1. Build the app for production#
2. Open browser console#
3. See many console.log statements still active#

**Fix:** Wrap all console.log in development checks or use a logging utility:#
```typescript#
// Instead of:#console.log('message');#

// Use:#if (process.env.NODE_ENV === 'development') {#  console.log('message');#}#

// Or create a logger utility that can be disabled:#const logger = {#  log: (...args) => {#    if (process.env.NODE_ENV === 'development') {#      console.log(...args);#    }#  }#};#
```

---

### PERF-10: No Backpressure for WebRTC Data Channel Sends#
**Severity:** Medium  
**Description:** The `sendDataChannelMessage` function in `webrtc-signalling.ts` doesn't implement any backpressure mechanism. If messages are sent faster than the data channel can handle, they may be buffered indefinitely or dropped silently.#
**Location:** `src/lib/webrtc-signalling.ts`, lines 248-259#
**Root Cause:** No buffering or backpressure handling for data channel sends#
**Reproduction Steps:**#
1. In multiplayer, send many messages rapidly#
2. Data channel buffer may fill up#
3. Messages may be lost or delayed#

**Fix:** Check the data channel buffer amount and implement queuing:#
```typescript#
export function sendDataChannelMessage(channel: RTCDataChannel, data: any): boolean {#  if (channel.readyState === 'open') {#    // Check buffer amount to implement backpressure#    if (channel.bufferedAmount > 1024 * 1024) {  // > 1MB buffered#      console.warn('Data channel buffer full, message queued');#      // Implement queuing logic here#      return false;#    }#    try {#      channel.send(JSON.stringify(data));#      return true;#    } catch (error) {#      console.error('Failed to send data channel message:', error);#      return false;#    }#  }#  return false;#}#
```

---

## Security#

### SEC-1: API Keys Stored in Plain Text in sessionStorage#
**Severity:** High  
**Description:** The user's API keys (Google AI, and other providers) are stored in sessionStorage in plain text without any encryption. If an attacker gains access to the user's browser (via XSS or local access), they can extract the API keys.#
**Location:** `src/context/GameContext.tsx`, lines 109-112, 122-129, 169-172, 182-185#
**Root Cause:** API keys are stored directly in sessionStorage without encryption#
**Reproduction Steps:**#
1. Enter API keys in Settings#
2. Open browser DevTools -> Application -> Session Storage#
3. Keys are visible in plain text (keys: `userGoogleAiApiKey`, `endlessTales_providerApiKeys`)#

**Fix:** Consider encrypting sensitive data before storing, or use a more secure storage mechanism. At minimum, warn users that keys are stored locally.#

---

### SEC-2: AI Proxy Route Lacks Rate Limiting and Input Validation#
**Severity:** High  
**Description:** The `/api/ai-proxy` route has no rate limiting, allowing potential abuse. It also doesn't validate the incoming request body beyond checking for API key presence. A malicious user could:#
1. Send unlimited requests (costing the user money if using server-side keys)#
2. Attempt prompt injection attacks by crafting special inputs#
3. Send malformed requests that could crash the server#

**Location:** `src/app/api/ai-proxy/route.ts`, lines 1-54#
**Root Cause:** No rate limiting middleware, no input sanitization/validation beyond basic checks#
**Reproduction Steps:**#
1. Send many rapid requests to `/api/ai-proxy`#
2. Observe no rate limit errors#
3. Try sending malformed JSON or oversized payloads#

**Fix:**#
1. Add rate limiting (e.g., using `express-rate-limit` or Vercel Edge middleware)#
2. Validate and sanitize all input parameters#
3. Set maximum payload size limits#
4. Consider adding CORS headers if the API should only be called from the same origin#

---

### SEC-3: Crafted Signalling String Can Cause Parser Issues#
**Severity:** Medium  
**Description:** The `decodeSignallingData` function in `webrtc-signalling.ts` doesn't properly validate the input base64 string before decoding. A malformed base64 string, extremely large payload, or crafted JSON could cause:#
1. `atob()` to throw exceptions#
2. `JSON.parse()` to throw on malformed JSON#
3. Potential DoS via very large payloads (no size limit)#

**Location:** `src/lib/webrtc-signalling.ts`, lines 31-43#
**Root Cause:** Minimal validation - only checks for existence of `sdp`, `type`, and `peerInfo` fields#
**Reproduction Steps:**#
1. Create a crafted base64 string with malformed JSON#
2. Try to join a session with it#
3. The app may crash or show unhandled errors#

**Fix:**#
1. Validate base64 format before decoding#
2. Add JSON schema validation for the decoded object#
3. Add size limits for the input string (e.g., max 100KB)#
4. Wrap parsing in try-catch and return user-friendly errors#

---

### SEC-4: Error Messages May Expose Internal Paths or API Keys#
**Severity:** Medium  
**Description:** Error responses from the AI proxy route include the raw error message from the AI provider, which may contain:#
1. Internal API endpoint paths#
2. Account identifiers#
3. Detailed stack traces in development mode#

**Location:** `src/app/api/ai-proxy/route.ts`, lines 47-53, 196-202, 336-342#
**Root Cause:** Error messages are passed through directly without sanitization#
**Reproduction Steps:**#
1. Trigger an error from the AI provider (e.g., invalid API key)#
2. Check the response - it may contain internal details#
3. In development mode, stack traces may be exposed#

**Fix:**#
1. Sanitize error messages before returning to client#
2. Use generic error messages for production#
3. Log detailed errors server-side only, return generic messages to client#

---

### SEC-5: No XSS Protection for User-Provided Text Rendering#
**Severity:** Low (Protected by React)  
**Description:** The application uses React's built-in JSX escaping which automatically sanitizes user input rendered in components. However, one low-severity display bug was found: the `sanitizePlayerAction` function in `src/lib/utils.ts` uses simple regex replacement that may not catch all XSS vectors.#
**Location:** `src/lib/utils.ts`, `src/ai/flows/narrate-adventure.ts`#
**Root Cause:** React's automatic escaping protects against most XSS, but the custom sanitization function may be incomplete#
**Reproduction Steps:**#
1. Try entering script tags in player actions or chat messages#
2. React escapes them properly - no XSS vulnerability found#
3. However, the sanitize function could be more robust#

**Fix:** The app is protected by React's built-in escaping. To improve:#
1. Use a proper sanitization library like `DOMPurify` if HTML needs to be rendered#
2. Strengthen the `sanitizePlayerAction` function#

---

### SEC-6: Dependencies with Known Vulnerabilities#
**Severity:** High  
**Description:** `npm audit` reveals **8 vulnerabilities** (4 high, 4 moderate):#

| Package | Severity | Vulnerability | CVSS |#
|---------|----------|---------------|----------|#
| `brace-expansion` (2.0.0-2.0.2) | Moderate | ReDoS & process hang via zero-step sequence | 6.5 |#
| `glob` (10.2.0-10.4.5) | High | Command injection via `-c/--cmd` flag | 7.5 (CWE-78) |#
| `jws` (4.0.0) | High | Improper HMAC signature verification | 7.5 (CWE-347) |#
| `minimatch` (9.0.0-9.0.6) | High | Multiple ReDoS vulnerabilities | 7.5 (CWE-1333, CWE-407) |#
| `postcss` (<8.5.10) | Moderate | XSS via unescaped `</style>` in CSS output | 6.1 (CWE-79) |#
| `picomatch` (<=2.3.1) | High | Method injection in POSIX character classes | 7.5 |#

**Location:** `package.json` - dependency versions#
**Root Cause:** Outdated packages with known CVEs#
**Reproduction Steps:**#
1. Run `npm audit` in the project directory#
2. See 8 vulnerabilities listed#

**Fix:** Run `npm audit fix` to resolve most issues, then manually update packages that can't be auto-fixed:#
```bash#
npm audit fix#
npm update postcss glob minimatch picomatch jws brace-expansion#```

---

### SEC-7: WebRTC ICE Candidates Not Validated Before Adding#
**Severity:** Medium  
**Description:** In `applyAnswer()` and `createAnswer()`, ICE candidates from the remote peer are added directly via `pc.addIceCandidate(candidate)` without validation. A malicious peer could send crafted ICE candidate objects.#
**Location:** `src/lib/webrtc-signalling.ts`, lines 146-148, 182-185#
**Root Cause:** No validation of ICE candidate structure before adding#
**Reproduction Steps:**#
1. A malicious peer could send crafted signalling data with invalid ICE candidates#
2. The app adds them without validation#

**Fix:** Validate ICE candidate objects before adding:#
```typescript#
for (const candidate of pkg.iceCandidates) {#  // Validate candidate structure#  if (!candidate || typeof candidate !== 'object' || !candidate.candidate || !candidate.sdpMLineIndex) {#    console.warn('Invalid ICE candidate received, skipping');#    continue;#  }#  try {#    await pc.addIceCandidate(candidate);#  } catch (e) {#    console.warn('Failed to add ICE candidate:', e);#  }#}#
```

---

### SEC-8: No Authentication on Multiplayer Sessions#
**Severity:** Medium  
**Description:** The WebRTC signalling mechanism (QR code / invite code) is essentially a shared secret. Anyone with the code can join the session. There's no additional authentication:#
1. No user identity verification beyond the name they provide#
2. No ability to kick/ban malicious users (kick only works for the host, and only disconnects)#
3. No encryption of signalling data beyond what WebRTC provides#

**Location:** `src/lib/webrtc-signalling.ts`, `src/hooks/use-multiplayer.ts`#
**Root Cause:** Design choice - simplicity over security for P2P connections#
**Reproduction Steps:**#
1. Share an invite code#
2. Anyone with the code can join, even unintended recipients#

**Fix:** For a P2P game, this may be acceptable. To improve:#
1. Add a session password option#
2. Implement a "allow list" for known players#
3. Add warnings about sharing invite codes#

---

### SEC-9: AI Proxy Exposes API Key Configuration in Error Messages#
**Severity:** Low  
**Description:** When an API request fails, the error message may reveal which provider was being used and details about the API configuration. In some cases, if the server-side API key is missing, the error message says "Gemini API key not configured" which reveals the expected key name.#
**Location:** `src/app/api/ai-proxy/route.ts`, lines 14-27#
**Root Cause:** Error messages are too descriptive for production#
**Reproduction Steps:**#
1. Trigger an error (e.g., no API key configured)#
2. Check the error message - it reveals internal configuration details#

**Fix:** Use generic error messages in production:#
```typescript#
// Instead of:#return NextResponse.json(#  { error: `${providerName} API key not configured. Please add your ${providerName} API key in Settings.` },#  { status: 401 }#);#

// Use generic:#return NextResponse.json(#  { error: `API key not configured. Please check your settings.` },#  { status: 401 }#);#
```

---

### SEC-10: Large AI Proxy Payloads Not Limited#
**Severity:** Medium  
**Description:** The AI proxy route doesn't limit the size of the request body or the response. A user could send an extremely large prompt or receive a very long response, potentially causing:#
1. Memory exhaustion on the server#
2. Slow responses affecting other users#
3. Excessive API costs#

**Location:** `src/app/api/ai-proxy/route.ts`#
**Root Cause:** No payload size limits#
**Reproduction Steps:**#
1. Send a very large prompt (e.g., 1MB of text)#
2. The server will try to process it#

**Fix:** Add payload size limits:#
```typescript#
export async function POST(request: NextRequest) {#  // Check content length#  const contentLength = request.headers.get('content-length');#  if (contentLength && parseInt(contentLength) > 100 * 1024 * 1024) {  // 100KB limit#    return NextResponse.json(#      { error: 'Request too large' },#      { status: 413 }#    );#  }#  // ... rest of the function#}#
```

---

## Code Quality & Maintainability#

### Overall Maintainability Rating: **D+**

**Rationale:**
- 110 `any` type usages across the codebase (poor TypeScript usage)#
- 60+ unused imports (dead code)#
- Multiple files over 500 lines (Gameplay.tsx has 1276 lines)#
- Inconsistent patterns across codebase (mixing class-based and function-based providers)#
- Dead code not cleaned up (`firebase.ts`, `multiplayer-service.ts`)#
- Missing error boundaries for sub-components#
- Deprecated API usage (`substr`)#

---

### CODE-1: Dead Code - `buildMessages` Function Unused#
**Severity:** Low  
**Description:** The `buildMessages` function in `ai-router.ts` is exported but not used anywhere in the codebase. It appears to be a helper for providers that support system/user message separation, but none of the current providers use it.#
**Location:** `src/ai/ai-router.ts`, lines 34-41#
**Root Cause:** Leftover code from a previous design that was never fully implemented or was superseded.#
**Reproduction Steps:**#
1. Search for `buildMessages` usage across the codebase#
2. Find that it's only defined, never called#

**Fix:** Remove the dead function to reduce clutter:#
```typescript#
// DELETE lines 34-41:#export function buildMessages(systemMessage: string, userMessage: string) {#
  return [#    { role: 'user', parts: [{ text: systemMessage }] },#    { role: 'user', parts: [{ text: userMessage }] }#  ];#}#
```

---

### CODE-2: Dead Code - `currentPlayerUid` Field Never Used#
**Severity:** Low  
**Description:** The `currentPlayerUid` field is defined in the `GameState` interface and initialized in `initialState`, but it is **never used** anywhere in the reducers or context.#
**Location:** `src/types/game-types.ts` line 44, `src/context/game-initial-state.ts` line 142#
**Root Cause:** Field was likely planned for multiplayer identity but never implemented.#
**Reproduction Steps:**#
1. Search for `currentPlayerUid` across the codebase#
2. Find only definition and initialization, no actual usage#

**Fix:** Remove the field from `GameState` interface and `initialState` to avoid confusion.#

---

### CODE-3: Dead Code - `firebase.ts` File Entirely Unused#
**Severity:** Medium  
**Description:** The file `src/lib/firebase.ts` exports dummy objects (`app`, `db`, `auth`) with `as any` casts. The file comment states "Firebase is no longer used" and "exports dummy objects". No imports of this file exist anywhere in the codebase.#
**Location:** `src/lib/firebase.ts` (entire file)#
**Root Cause:** Firebase was removed but the file was left behind.#
**Reproduction Steps:**#
1. Search for imports of `firebase.ts` across the codebase#
2. Find zero imports#

**Fix:** Delete the file entirely:#
```bash#
rm src/lib/firebase.ts#
```

---

### CODE-4: Dead Code - `multiplayer-service.ts` File Entirely Unused#
**Severity:** Medium  
**Description:** The file `src/services/multiplayer-service.ts` contains stub functions that all throw "Multiplayer is now handled via WebRTC". The file comment states "kept for reference but is no longer used". No imports of this file exist anywhere in the codebase.#
**Location:** `src/services/multiplayer-service.ts` (entire file)#
**Root Cause:** Old multiplayer service was replaced by WebRTC but file was kept "for reference".#
**Reproduction Steps:**#
1. Search for imports of `multiplayer-service.ts` across the codebase#
2. Find zero imports#

**Fix:** Delete the file entirely:#
```bash#
rm src/services/multiplayer-service.ts#
```

---

### CODE-5: Dead Code - Unused Imports in Gameplay.tsx#
**Severity:** Low  
**Description:** The `Gameplay.tsx` component has several unused imports:#
- Line 5: `AssessedDifficultyLevel` imported but only used as type annotation#
- Line 36: `Alert, AlertDescription, AlertTitle` imported but **NOT USED**#
- Line 37: `Skeleton` imported but **NOT USED**#
- Multiple lucide-react icons imported but not used (`Settings, ArrowLeft, Skull, Info, Dice5, Hammer, BookCopy, CalendarClock, GitBranch, RefreshCw`)#

**Location:** `src/components/screens/Gameplay.tsx`, lines 5, 36-37, and various icon imports#
**Root Cause:** Components were likely planned but never added, or were removed without cleaning up imports.#
**Reproduction Steps:**#
1. Review the imports at the top of Gameplay.tsx#
2. Search for usage of `Alert`, `Skeleton`, and unused icons#
3. Find no references in the component#

**Fix:** Remove all unused imports to reduce bundle size and improve clarity.#

---

### CODE-6: Overly Complex Function - `WebLLMProvider.getEngine()` (113 lines)#
**Severity:** High  
**Description:** The `getEngine()` method in `WebLLMProvider` is 113 lines long (lines 710-822) and does too many things: checks engine state, loads WebLLM module, validates configuration, finds available models, handles fallbacks, creates engine with config, and manages loading promises.#
**Location:** `src/ai/ai-router.ts`, lines 710-822#
**Root Cause:** Function violates Single Responsibility Principle - handles too many concerns.#
**Reproduction Steps:**#
1. Open `ai-router.ts`#
2. Navigate to `WebLLMProvider.getEngine()`#
3. Observe the 113-line function with deep nesting#

**Fix:** Split into smaller functions:#
```typescript#
// Extract these helper functions:#async function getCachedEngine(): Promise<any> { ... }#async function loadWebLLMModule(): Promise<any> { ... }#async function findAvailableModel(models: any[], modelName: string): Promise<string> { ... }#async function createEngineWithConfig(model: string, systemPrompt: string): Promise<any> { ... }#

// Then getEngine becomes:#async getEngine(model: string, systemPrompt: string): Promise<any> {#  let engine = await getCachedEngine();#  if (engine) return engine;#  // ... simplified flow calling helpers#}#
```

---

### CODE-7: Overly Complex Function - `loadWebLLM()` (52 lines)#
**Severity:** Medium  
**Description:** The `loadWebLLM()` function (lines 623-674) exceeds the 50-line threshold. It handles module loading, caching, retry logic, and promise management.#
**Location:** `src/ai/ai-router.ts`, lines 623-674#
**Root Cause:** Function does too many things - should be split.#
**Reproduction Steps:**#
1. Open `ai-router.ts`#
2. Navigate to `loadWebLLM()` function#
3. Observe 52 lines with retry logic mixed with module loading#

**Fix:** Split into smaller functions:#
```typescript#
function getCachedModule(): any { ... }#function retryLoadModule(maxRetries: number): Promise<any> { ... }#async function loadWebLLMModule(): Promise<any> { ... }#

// Then loadWebLLM becomes simpler:#async function loadWebLLM(): Promise<any> {#  const cached = getCachedModule();#  if (cached) return cached;#  return await retryLoadModule(3);#}#
```

---

### CODE-8: Overly Complex Component - `Gameplay.tsx` (1276 lines)#
**Severity:** High  
**Description:** The `Gameplay.tsx` screen component has 1276 lines, making it extremely difficult to maintain, test, and debug. It contains multiple responsibilities: game state management, UI rendering for multiple panels, action handling, and more.#
**Location:** `src/components/screens/Gameplay.tsx` (1276 lines)#
**Root Cause:** Component violates Single Responsibility Principle - does too much.#
**Reproduction Steps:**#
1. Open `Gameplay.tsx`#
2. Scroll through 1276 lines of code#
3. Notice multiple logical sections that could be separate components#

**Fix:** Extract logical sections into separate components:#
1. Extract `GameHeader` component (title, status indicators)#
2. Extract `GameStats` component (character stats display)#
3. Extract `GameActions` component (action buttons)#
4. Consider using a layout component pattern#

---

### CODE-9: Missing TypeScript Types - 110 `any` Usages Across Codebase#
**Severity:** High  
**Description:** The codebase has **110 total `any` mentions**:#
- `": any"` type annotations: 83#
- `"as any"` type assertions: 9#
- `"catch (err: any)"` patterns: 18#

**Top files by `any` usage:**
1. `src/app/api/ai-proxy/route.ts` - 15 occurrences#
2. `src/ai/ai-router.ts` - 12 occurrences#
3. `src/components/screens/Gameplay.tsx` - 9 occurrences#
4. `src/context/game-actions.ts` - 7 occurrences#
5. `src/ai/flows/narrate-adventure.ts` - 5 occurrences#

**Location:** Multiple files across the codebase#
**Root Cause:** TypeScript types not properly defined, developers used `any` as a shortcut.#
**Reproduction Steps:**#
1. Run a search for `: any` and `as any` across the codebase#
2. Find 110 occurrences#

**Fix:** Replace `any` with proper TypeScript types:#
1. Define proper interfaces for AI provider responses#
2. Use `unknown` instead of `any` for error handling#
3. Create types for game actions, state, etc.#

---

### CODE-10: Deprecated API Usage - `substr()` in characterReducer#
**Severity:** Low  
**Description:** The code uses `Math.random().toString(36).substr(2, 6)` which uses the deprecated `String.prototype.substr()` method.#
**Location:** `src/context/reducers/characterReducer.ts`, line 9#
**Root Cause:** Using deprecated API - `substr` is deprecated in favor of `substring` or `slice`.#
**Reproduction Steps:**#
1. Open `characterReducer.ts`#
2. Find `substr` usage on line 9#

**Fix:** Replace with `substring` or `slice`:#
```typescript#
// Instead of:#Math.random().toString(36).substr(2, 6)#

// Use:#Math.random().toString(36).substring(2, 8)#// or#Math.random().toString(36).slice(2, 8)#
```

---

### CODE-11: No-op Action in Multiplayer Reducer#
**Severity:** Low  
**Description:** The `SEND_PLAYER_ACTION` case in `multiplayerReducer.ts` is explicitly a no-op - it just returns the state without doing anything. The action is handled elsewhere (via data channel messages).#
**Location:** `src/context/reducers/multiplayerReducer.ts`, lines 105-109#
**Root Cause:** Action was likely planned to be handled in reducer but implementation moved to data channel handling.#
**Reproduction Steps:**#
1. Open `multiplayerReducer.ts`#
2. Find `SEND_PLAYER_ACTION` case#
3. Observe it does nothing#

**Fix:** Either implement the action properly or remove it entirely to avoid confusion. If it's documented as "handled elsewhere", add a comment explaining why.#

---

### CODE-12: Missing Error Boundaries for Sub-Components#
**Severity:** High  
**Description:** While `ErrorBoundary.tsx` exists and is used in `page.tsx` to wrap screen-level components, there are **no error boundaries for sub-components**. If `NarrationDisplay`, `ActionInput`, or `LeftPanel` crash, they will take down the entire gameplay screen.#
**Location:** `src/components/screens/Gameplay.tsx`, `src/components/ui/ErrorBoundary.tsx`#
**Root Cause:** Error boundaries only applied at page level, not component level.#
**Reproduction Steps:**#
1. Open Gameplay screen#
2. If any sub-component throws an error, entire screen crashes#
3. No graceful degradation#

**Fix:** Wrap critical sub-components with error boundaries:#
```tsx#
// In Gameplay.tsx:#<ErrorBoundary>#  <NarrationDisplay ... />#</ErrorBoundary>#<ErrorBoundary>#  <ActionInput ... />#</ErrorBoundary>#<ErrorBoundary>#  <LeftPanel ... />#</ErrorBoundary>#
```

---

### CODE-13: Inconsistent Patterns - Mixing Class-Based and Function-Based AI Providers#
**Severity:** Medium  
**Description:** The AI router mixes class-based providers (`WebLLMProvider`) with function-based providers (`GeminiProvider`, `OpenAIProvider`, etc.). This inconsistency makes the codebase harder to understand and maintain.#
**Location:** `src/ai/ai-router.ts` - provider definitions#
**Root Cause:** Different providers were added at different times with different patterns.#
**Reproduction Steps:**#
1. Open `ai-router.ts`#
2. Observe `WebLLMProvider` is a class with static properties#
3. Observe other providers are plain objects with functions#

**Fix:** Standardize on one pattern:#
1. Convert `WebLLMProvider` to use instance properties instead of static#
2. Or convert all providers to classes for consistency#

---

### CODE-14: Inconsistent React.memo Usage#
**Severity:** Medium  
**Description:** Some components use `React.memo()` for performance optimization, while others don't. There's no consistent pattern for which components should be memoized.#
**Location:** Multiple component files#
**Root Cause:** Developers added memoization ad-hoc without a consistent strategy.#
**Reproduction Steps:**#
1. Search for `React.memo` usage across the codebase#
2. Find inconsistent application#

**Fix:** Define a clear strategy:#
1. Memoize components that receive complex props or render frequently#
2. Add `React.memo` to `PartySidebar`, `NarrationDisplay`, etc.#
3. Document the strategy for future development#

---

### CODE-15: Dead State Variables in useMultiplayer Hook#
**Severity:** Low  
**Description:** The `useMultiplayer` hook defines `lastSessionId` and `lastIsHost` state variables (lines 57-58) that are returned from the hook but never destructured or used by any consumer (CoopLobby.tsx or Gameplay.tsx).#
**Location:** `src/hooks/use-multiplayer.ts`, lines 57-58#
**Root Cause:** State variables were likely used in a previous version but consumers were updated without removing the dead state.#
**Reproduction Steps:**#
1. Check all consumers of `useMultiplayer` hook#
2. Find that `lastSessionId` and `lastIsHost` are never destructured#

**Fix:** Remove the dead state variables if they're not needed, or implement the missing functionality.#

---

### Top 10 Worst Offenders for Maintainability#

1. **`src/components/screens/Gameplay.tsx`** (1276 lines, 9 `any` usages, unused imports, no error boundary)#
2. **`src/ai/ai-router.ts`** (12 `any` usages, 113-line function, 52-line function, dead code)#
3. **`src/app/api/ai-proxy/route.ts`** (15 `any` usages, malformed JSON bugs, no rate limiting)#
4. **`src/context/game-actions.ts`** (7 `any` usages, unclear action flow)#
5. **`src/ai/flows/narrate-adventure.ts`** (5 `any` usages, complex normalizer, typos)#
6. **`src/hooks/use-multiplayer.ts`** (complex hook, memory leaks, stale closures, dead state)#
7. **`src/context/reducers/characterReducer.ts`** (deprecated `substr`, complex respawn logic)#
8. **`src/context/reducers/multiplayerReducer.ts`** (no-op actions, missing bounds checking)#
9. **`src/lib/webrtc-signalling.ts`** (complex WebRTC logic, no validation, no backpressure)#
10. **`src/context/GameContext.tsx`** (context value issues, theme CSS bugs, API key storage)#

---

## Error Handling & Diagnostics#

### Overall Error Handling Rating: **D**

**Rationale:**
- None of the AI provider calls have try-catch blocks (11 provider methods exposed)#
- Raw AI responses are NOT preserved when parsing fails#
- Error messages from AI proxy expose internal details#
- WebRTC data channel errors are logged to console but not shown to users#
- Save/load errors have no user-facing recovery options#
- Multiple generic catch blocks swallow error details#

---

### ERR-1: No Try-Catch in AI Provider Methods (11 Methods Exposed)#
**Severity:** Critical  
**Description:** None of the AI provider methods (`generateContent` or `generateContentStream`) have try-catch blocks around their main API calls. All 11 methods across Gemini, OpenAI, Claude, DeepSeek, OpenRouter, and WebLLM providers will throw unhandled errors on network failures, timeouts or unexpected API responses.#
**Location:** `src/ai/ai-router.ts` - lines 94, 131, 203, 241, 311, 349, 420, 458, 529, 567, 839, 866-873#
**Root Cause:** Developers assumed the caller handles all errors, but the AI proxy route doesn't properly await the handler promises.#
**Reproduction Steps:**#
1. Trigger an AI call with invalid API key or network failure#
2. The error propagates as unhandled promise rejection#
3. No error response sent to client for async handler failures#

**Fix:** Add try-catch blocks in each provider method:#
```typescript#
// Example for Gemini generateContent (line 94):#async generateContent(input: any): Promise<any> {#  try {#    const response = await this.fetch(/* ... */);#    if (!response.ok) {#      const errorText = await response.text();#      // PRESERVE RAW RESPONSE:#      return {#        error: true,#        errorText: errorText,#        status: response.status,#        rawResponse: errorText  // <-- Important for debugging#      };#    }#    return await response.json();#  } catch (error) {#    console.error('Gemini API Error:', error);#    return {#      error: true,#      errorMessage: error instanceof Error ? error.message : String(error),#      rawError: error  // <-- Preserve for diagnostics#    };#  }#}#
```

---

### ERR-2: Raw AI Response Text Not Preserved on Parsing Failure#
**Severity:** Critical  
**Description:** When `processAiResponse` or the `normalizer` fails in `narrate-adventure.ts`, the raw AI text (`text` variable) is NOT preserved or exposed. The `text` variable is scoped to the `try` block (lines 231-404) and inaccessible in the `catch` block (lines 406-437). Fallback responses use hardcoded strings without the raw AI output.#
**Location:** `src/ai/flows/narrate-adventure.ts`, lines 231-437#
**Root Cause:** Raw response variable scope is limited to try block; catch block can't access it.#
**Reproduction Steps:**#
1. AI returns invalid JSON or unexpected format#
2. Parsing fails in `processAiResponse`#
3. Catch block runs but `text` variable is undefined#
4. User/developer cannot see what the AI actually returned#

**Fix:** Hoist the `text` variable outside the try block and include it in error responses:#
```typescript#
// At the top of narrateAdventure function:#let rawAiText = '';  // <-- Hoist this variable#

// In the streaming/non-streaming paths, assign:#rawAiText = text;  // <-- Store the raw text#

// In the catch block (line 406):#catch (error) {#  console.error("AI Narration Error:", error);#  // Return fallback WITH raw text for debugging:#  return {#    narration: "The gamemaster ponders the mists of fate, but the arcane energies seem disrupted. Try again.",#    error: true,#    errorMessage: error instanceof Error ? error.message : String(error),#    rawAiResponse: rawAiText,  // <-- CRITICAL: Preserve raw response#    rawError: error#  };#}#
```

---

### ERR-3: AI Proxy Route Doesn't Catch Async Handler Errors#
**Severity:** High  
**Description:** The main POST handler in `route.ts` has a try-catch block (lines 46-52) that catches early request processing errors, but all async handler functions (`handleGemini`, `handleOpenAICompatible`, `handleClaude`) are returned as **unawaited promises**. Errors thrown inside these handlers propagate as unhandled promise rejections, NOT caught by the POST catch block.#
**Location:** `src/app/api/ai-proxy/route.ts`, lines 7-53, 102-108, 196-202#
**Root Cause:** Handlers are not properly awaited or wrapped in try-catch at the call site.#
**Reproduction Steps:**#
1. Send a request to `/api/ai-proxy`#
2. Handler throws an error (e.g., non-JSON response from provider)#
3. Error becomes unhandled promise rejection#
4. Client receives no error response#

**Fix:** Properly await handlers with try-catch:#
```typescript#
// In the POST handler, wrap handler calls:#try {#  let result;#  switch (provider) {#    case 'gemini':#      result = await handleGemini(request, providerName, systemMessage);#      break;#    // ... other cases#  }#  return NextResponse.json(result);#} catch (error) {#  // Now this catches handler errors too:#  console.error('AI Proxy Error:', error);#  return NextResponse.json({#
    error: 'AI request failed',#    details: error instanceof Error ? error.message : String(error),#    // Don't expose internal details in production#  }, { status: 500 });#}#
```

---

### ERR-4: Provider-Specific Error Messages Exposed to Client#
**Severity:** Medium  
**Description:** The AI proxy handlers include provider-specific error details in responses:#
- `handleGemini` (line 106): Returns `error.error?.message` from Gemini API#
- `handleOpenAICompatible` (line 200): Returns `error.error?.message` from OpenAI/DeepSeek/OpenRouter#
- `handleClaude` (line 336): Returns `JSON.parse(errorText)` which may contain provider details#

**Location:** `src/app/api/ai-proxy/route.ts`, lines 104-106, 198-202, 334-342#
**Root Cause:** Raw error responses from providers are passed through without sanitization.#
**Reproduction Steps:**#
1. Trigger an error from AI provider (e.g., rate limit exceeded)#
2. Response includes provider-specific message like "OpenAI rate limit exceeded"#
3. This reveals which provider is being used#

**Fix:** Sanitize error messages and provide generic responses in production:#
```typescript#
// Instead of returning provider error directly:#return NextResponse.json({ error: error.error?.message }, { status: response.status });#

// Use generic message but log details server-side:#console.error('OpenAI API Error:', error.error?.message);#return NextResponse.json({#
  error: 'AI request failed. Please try again.'#  // Generic message for client#}, { status: 500 });#
```

---

### ERR-5: WebRTC Data Channel Errors Not Shown to Users#
**Severity:** High  
**Description:** WebRTC data channel errors are logged to console but never propagated to the UI:#
- `webrtc-signalling.ts` line 240-242: `channel.onerror` handler only logs to console#
- `webrtc-signalling.ts` line 221-228: `channel.onmessage` JSON parse errors only logged to console#
- `use-multiplayer.ts` line 86-88: Silent failure when data channel not available#

**Location:** `src/lib/webrtc-signalling.ts` lines 221-228, 240-242, 248-259; `src/hooks/use-multiplayer.ts` lines 86-88#
**Root Cause:** No callback mechanism to propagate errors to UI layer.#
**Reproduction Steps:**#
1. Data channel encounters an error#
2. Error logged to console#
3. User sees no indication of the problem#

**Fix:** Add error callbacks and show errors in UI:#
```typescript#
// In webrtc-signalling.ts, accept error callback:#export function setupDataChannel(pc: RTCPeerConnection, channel: RTCDataChannel, onMessage: (data: any) => void, onError?: (error: any) => void) {#  channel.onerror = (event) => {#    console.error('Data channel error:', event);#    onError?.(event);  // <-- Propagate to caller#  };#  // ...#}#

// In use-multiplayer.ts, show error to user:#setupDataChannel(pc, channel, handleMessage, (error) => {#  toast({#
    title: "Connection Error",#    description: "Data channel encountered an error. Attempting to reconnect...",#    variant: "destructive"#  });#});#
```

---

### ERR-6: Connection Failures Tracked but No Clear User Messages#
**Severity:** Medium  
**Description:** `useMultiplayer` hook catches errors in `createSession` and `joinSession` and sets `connectionStatus: 'failed'`, but only logs to console. The UI (CoopLobby) may show the status but without meaningful error details.#
**Location:** `src/hooks/use-multiplayer.ts`, lines 200, 239#
**Root Cause:** Error details not passed to UI layer.#
**Reproduction Steps:**#
1. Session creation or joining fails#
2. Status set to 'failed'#
3. User sees "Connection failed" but doesn't know why#

**Fix:** Include error details in state and show in UI:#
```typescript#
// In use-multiplayer.ts error handlers:#catch (error) {#  console.error('Failed to create session:', error);#  return {#    ...state,#    connectionStatus: 'failed',#    lastError: error instanceof Error ? error.message : String(error)  // <-- Store error details#  };#}#

// In CoopLobby.tsx, show the error:#{connectionStatus === 'failed' && (#  <Alert variant="destructive">#    <AlertTitle>Connection Failed</AlertTitle>#    <AlertDescription>#      {lastError || 'Unknown error occurred. Please try again.'}#    </AlertDescription>#  </Alert>#)}#
```

---

### ERR-7: Save/Load Game Errors Have No User-Facing Recovery#
**Severity:** High  
**Description:** Save/load operations in `GameContext.tsx` have try-catch blocks that log to `console.error` but provide no UI feedback:#
- Lines 97-99: Loading saved adventures catches error, removes corrupted data, but user is unaware#
- Lines 136: Loading API keys catches error, logs, no UI feedback#
- Lines 164-185: No try-catch around `localStorage.setItem` or `sessionStorage.setItem` - can throw on full storage#

**Location:** `src/context/GameContext.tsx`, lines 85-100, 121-137, 161-206#
**Root Cause:** Errors handled server-side only, no toast/alert to inform user.#
**Reproduction Steps:**#
1. Try to load corrupted saved adventure#
2. Data is removed silently#
3. User doesn't know what happened#

**Fix:** Add toast notifications for save/load errors:#
```typescript#
// When loading saved adventures fails:#catch (error) {#  console.error("Failed to load saved adventures:", error);#  // Remove corrupted data#  localStorage.removeItem('endlessTalesSavedAdventures');#  // Notify user:#  toast({#
    title: "Load Failed",#    description: "Saved game data was corrupted and has been reset. Starting fresh.",#    variant: "destructive"#  });#}#

// Add try-catch for storage operations:#try {#  localStorage.setItem('endlessTalesSavedAdventures', JSON.stringify(saved));#} catch (error) {#  toast({#
    title: "Save Failed",#    description: "Storage is full or unavailable. Try deleting old saves.",#    variant: "destructive"#  });#}#
```

---

### ERR-8: No "Show Raw Response" Debug Option for AI Failures#
**Severity:** Medium  
**Description:** When AI narration fails, the UI shows a generic error toast but provides no way to see what the AI actually returned. This makes debugging extremely difficult for both developers and users reporting issues.#
**Location:** `src/components/gameplay/NarrationDisplay.tsx`, `src/ai/flows/narrate-adventure.ts`#
**Root Cause:** Raw AI response not stored in state or exposed via UI.#
**Reproduction Steps:**#
1. AI returns invalid response#
2. Error toast shown#
3. No way to inspect what the AI actually said#

**Fix:** Store raw AI response in state and provide expandable debug section:#
```typescript#
// In game-actions.ts, when AI fails:#if (result.error && result.rawAiResponse) {#  dispatch({#
    type: "SET_LAST_AI_ERROR",#    payload: {#      message: result.errorMessage,#      rawResponse: result.rawAiResponse  // <-- Store for debugging#    }#  });#}#

// In NarrationDisplay.tsx, show debug info:#{lastAiError && (#  <Alert variant="destructive">#    <AlertTitle>AI Response Error</AlertTitle>#    <AlertDescription>#      <p>{lastAiError.message}</p>#      <details>#        <summary>Show Raw AI Response</summary>#        <pre className="mt-2 whitespace-pre-wrap text-xs">#          {lastAiError.rawResponse}#        </pre>#      </details>#    </AlertDescription>#  </Alert>#)}#
```

---

### ERR-9: Streaming Errors Mid-Stream Not Handled Gracefully#
**Severity:** Medium  
**Description:** When a streaming response fails mid-stream (e.g., network error, API timeout), the streaming providers in `ai-router.ts` don't handle this gracefully. The stream may end abruptly without informing the caller.#
**Location:** `src/ai/ai-router.ts`, streaming methods for all providers (lines 131, 241, 349, 458, 567, 866-873)#
**Root Cause:** Stream reading loops don't have proper error handling for mid-stream failures.#
**Reproduction Steps:**#
1. Start AI streaming response#
2. Network fails mid-stream#
3. Stream ends abruptly#
4. No error returned to caller#

**Fix:** Add error handling in stream reading loops:#
```typescript#
// Example for Gemini streaming (line 131):#async *generateContentStream(input: any): AsyncGenerator<any> {#  try {#    const response = await this.fetch(/* ... */);#    const reader = response.body?.getReader();#    const decoder = new TextDecoder();#    while (true) {#      try {#        const { done, value } = await reader.read();#        if (done) break;#        // ... process chunk#      } catch (streamError) {#        console.error('Stream error:', streamError);#        yield { error: true, message: 'Stream interrupted', details: streamError };#        break;#      }#    }#  } catch (error) {#    yield { error: true, message: error instanceof Error ? error.message : String(error) };#  }#}#
```

---

### ERR-10: Generic Catch Blocks Swallow Error Details#
**Severity:** Medium  
**Description:** Multiple catch blocks in the codebase swallow error details:#
- `game-actions.ts`: Multiple catch blocks log to console but dispatch generic error actions#
- `GameContext.tsx` line 97: `catch (error) { console.error("Failed to load saved adventures:", error); }` - error details not passed to user#
- `use-multiplayer.ts`: Various catch blocks only log to console#

**Location:** `src/context/game-actions.ts`, `src/context/GameContext.tsx`, `src/hooks/use-multiplayer.ts`#
**Root Cause:** Errors caught but details not preserved or propagated.#
**Reproduction Steps:**#
1. Any error occurs in these try-catch blocks#
2. Error logged to console#
3. User/UI doesn't receive error details#

**Fix:** Preserve error details and propagate to UI:#
```typescript#
// Instead of just logging:#catch (error) {#
  console.error("Error:", error);#}#

// Preserve and propagate:#catch (error) {#  const errorMessage = error instanceof Error ? error.message : String(error);#  console.error("Error:", error);#  // Dispatch with details:#  dispatch({#
    type: "SET_ERROR",#    payload: { message: errorMessage, details: error }#  });#}#
```

---

### ERR-11: No Retry Button for Failed AI Requests#
**Severity:** Medium  
**Description:** When an AI request fails (network error, API error, timeout), the UI shows an error toast but provides no "Retry" button. The user must manually re-submit their action.#
**Location:** `src/components/gameplay/NarrationDisplay.tsx`, `src/context/game-actions.ts`#
**Root Cause:** Error UI doesn't include retry action.#
**Reproduction Steps:**#
1. AI request fails#
2. Error toast shown#
3. User must manually type their action again#

**Fix:** Add retry button to error UI:#
```typescript#
// In NarrationDisplay.tsx error state:#{aiError && (#  <Alert variant="destructive">#    <AlertTitle>AI Response Failed</AlertTitle>#    <AlertDescription className="flex items-center gap-2">#      <span>{aiError}</span>#      <Button size="sm" variant="outline" onClick={() => retryLastAction()}>#        Retry#      </Button>#    </AlertDescription>#  </Alert>#)}#
```

---

### ERR-12: ICE Candidate Errors Silently Ignored#
**Severity:** Low  
**Description:** When adding ICE candidates via `pc.addIceCandidate()`, errors are caught and logged to console but not shown to the user. Multiple failed ICE candidates could indicate connection problems.#
**Location:** `src/lib/webrtc-signalling.ts`, lines 146-148, 182-185#
**Root Cause:** Errors logged but not propagated to UI.#
**Reproduction Steps:**#
1. Invalid ICE candidate received#
2. Error logged to console#
3. User unaware of connection issues#

**Fix:** Count failures and notify user if threshold exceeded:#
```typescript#
let iceCandidateErrors = 0;#

for (const candidate of pkg.iceCandidates) {#  try {#    await pc.addIceCandidate(candidate);#  } catch (e) {#    iceCandidateErrors++;#    console.warn('Failed to add ICE candidate:', e);#    if (iceCandidateErrors > 3) {#      toast({#
        title: "Connection Issues",#        description: "Multiple ICE candidate failures. Connection may be unstable.",#        variant: "warning"#      });#    }#  }#}#
```

---

### ERR-13: Abort/Timeout Errors Not Handled with Clear Messages#
**Severity:** Medium  
**Description:** The AI proxy route and AI router use `AbortSignal.timeout()` for request timeouts, but when the timeout fires, the error message may not be clear to the user. The `signal: input.signal` is passed to providers but timeout errors may not be user-friendly.#
**Location:** `src/ai/flows/narrate-adventure.ts` line 233, `src/ai/ai-router.ts` various provider methods#
**Root Cause:** Timeout/abort errors not caught and translated to user-friendly messages.#
**Reproduction Steps:**#
1. AI request times out#
2. User sees generic error or unhandled rejection#
3. No indication that timeout occurred#

**Fix:** Catch abort errors and show clear message:#
```typescript#
// In narrateAdventure:#try {#  const result = await aiProvider.generateContent(input);#  // ...#} catch (error) {#  if (error instanceof DOMException && error.name === 'AbortError') {#    return {#      narration: "The arcane energies are taking too long to respond. Please try again.",#      error: true,#      errorMessage: 'Request timed out. Please check your connection or try a different AI provider.'#    };#  }#  // ... other error handling#}#
```

---

### Top 10 Worst Offenders for Error Handling#

1. **`src/ai/ai-router.ts`** (11 methods without try-catch, streaming errors not handled)#
2. **`src/app/api/ai-proxy/route.ts`** (async handlers not awaited, error details exposed)#
3. **`src/ai/flows/narrate-adventure.ts`** (raw response not preserved, no debug option)#
4. **`src/hooks/use-multiplayer.ts`** (WebRTC errors not shown to users, no clear messages)#
5. **`src/lib/webrtc-signalling.ts`** (data channel errors only logged, ICE errors ignored)#
6. **`src/context/GameContext.tsx`** (save/load errors no UI feedback, storage errors not caught)#
7. **`src/context/game-actions.ts`** (generic catch blocks swallow details)#
8. **`src/components/gameplay/NarrationDisplay.tsx`** (no retry button, no raw response debug)#
9. **`src/components/screens/CoopLobby.tsx`** (connection errors not shown with details)#
10. **`src/ai/flows/`** (all flows - no "show raw response" debug option)#

---

## Accessibility#

### Overall Accessibility Rating: **C-**

**Rationale:**
- SVG elements with onClick handlers not keyboard accessible (WCAG 2.1.1)#
- Missing aria-live regions for dynamic content updates (WCAG 4.1.3)#
- Some icon-only buttons missing aria-label (WCAG 4.1.2)#
- No skip navigation link (WCAG 2.4.1)#
- Color contrast issues in some themes#
- No reduced-motion option for animations (WCAG 2.3.3)#

---

### A11Y-1: SVG Circle Elements Not Keyboard Accessible#
**Severity:** High  
**Description:** SVG `<circle>` elements in WorldMapDisplay.tsx have `onClick` handlers for selecting locations but are not reachable via Tab key. SVG elements without proper roles and tabindex cannot receive keyboard focus.#
**Location:** `src/components/game/WorldMapDisplay.tsx`, lines 102-111, 195-200#
**WCAG Criterion:** 2.1.1 Keyboard (Level A), 4.1.2 Name, Role, Value (Level A)#
**Root Cause:** SVG elements missing `role="button"`, `tabindex="0"`, and keyboard event handlers (onKeyDown)#
**Reproduction Steps:**#
1. Navigate to Gameplay screen with World Map#
2. Try to tab to location circles on the map#
3. Circles are not focusable#
4. Cannot activate with Enter or Space key#

**Fix:** Add proper ARIA attributes and keyboard handlers:#
```tsx#
<circle#
  cx={`${loc.x}%`}#
  cy={`${loc.y}%`}#
  r={nodeSize}#
  fill={nodeColor}#
  stroke="hsl(var(--background))"#
  strokeWidth="2"#
  className="cursor-pointer transition-all hover:scale-125"#
  role="button"#
  tabIndex={0}#
  aria-label={`Select location: ${loc.name}`}#
  onClick={() => setSelectedLocationId(loc.id)}#
  onKeyDown={(e) => {#    if (e.key === 'Enter' || e.key === ' ') {#      e.preventDefault();#      setSelectedLocationId(loc.id);#    }#  }}#
/>#
```

---

### A11Y-2: Missing aria-live Regions for Dynamic Updates#
**Severity:** High  
**Description:** Dynamic content updates (new narration entries, chat messages) are not announced to screen readers because the containers lack `aria-live` regions.#
**Location:**#
- `src/components/gameplay/NarrationDisplay.tsx` - story log updates#
- `src/components/gameplay/ChatPanel.tsx` - new chat messages#
**WCAG Criterion:** 4.1.3 Status Messages (Level AA)#
**Root Cause:** No `aria-live="polite"` or `aria-live="assertive"` on containers that update dynamically#
**Reproduction Steps:**#
1. Use a screen reader#
2. New narration entry appears#
3. Screen reader does not announce the new content#
4. User must manually navigate to find new content#

**Fix:** Add aria-live regions:#
```tsx#
// In NarrationDisplay.tsx:#<ScrollArea#  ref={scrollAreaRef}#  className="..."#  aria-live="polite"#  aria-atomic="false"#>
  {/* story log entries */}#
</ScrollArea>#

// In ChatPanel.tsx:#<div#  className="flex-1 overflow-y-auto p-2 space-y-2"#  aria-live="polite"#  aria-atomic="false"#>
  {/* chat messages */}#
</div>#
```

---

### A11Y-3: Icon-Only Buttons Missing aria-label#
**Severity:** High  
**Description:** Several icon-only buttons (buttons with only an icon, no text) are missing `aria-label` attribute, making them unintelligible to screen readers.#
**Location:**#
- `src/components/gameplay/ChatPanel.tsx` line 60 - Close button with "✕" text#
- `src/components/screens/Gameplay.tsx` - PartySidebar toggle button (lines 1193-1201)#
- Various icon buttons throughout the app#
**WCAG Criterion:** 4.1.2 Name, Role, Value (Level A)#
**Root Cause:** Icon-only buttons don't have descriptive labels for assistive technology#
**Reproduction Steps:**#
1. Use a screen reader#
2. Navigate to icon-only buttons#
3. Screen reader announces "button" without context#
4. User doesn't know what the button does#

**Fix:** Add aria-label to all icon-only buttons:#
```tsx#
// ChatPanel close button:#<Button#  variant="ghost"#  size="sm"#  onClick={onClose}#  aria-label="Close chat"#>
  <X className="h-4 w-4" />#
</Button>#

// PartySidebar toggle button:#<Button#  variant="ghost"#  size="icon"#  onClick={() => setIsPartySidebarOpen(!isPartySidebarOpen)}#  aria-label={isPartySidebarOpen ? "Close party sidebar" : "Open party sidebar"}#  aria-expanded={isPartySidebarOpen}#>
  <Users className="h-4 w-4" />#
</Button>#
```

---

### A11Y-4: No Skip Navigation Link#
**Severity:** Medium  
**Description:** The MainMenu.tsx and other screens lack a skip-to-content or skip-navigation link that allows keyboard and screen reader users to bypass repetitive navigation and jump directly to main content.#
**Location:** `src/components/screens/MainMenu.tsx`, lines 55-117 (entire component)#
**WCAG Criterion:** 2.4.1 Bypass Blocks (Level A)#
**Root Cause:** No skip link at the top of the page#
**Reproduction Steps:**#
1. Navigate to Main Menu#
2. Use Tab key to navigate#
3. Must tab through all elements to reach main content#
4. No way to skip to main card#

**Fix:** Add a skip link at the top of the page:#
```tsx#
// In MainMenu.tsx, at the very top:#<a#  href="#main-content"#  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-background focus:p-2 focus:rounded"#>
  Skip to main content#
</a>#

// Add id to main content:#<Card id="main-content" className="...">#  {/* card content */}#</Card>#
```

---

### A11Y-5: Missing aria-expanded on PartySidebar Toggle#
**Severity:** Medium  
**Description:** The button that toggles the PartySidebar open/closed has no `aria-expanded` attribute to indicate its state to assistive technology. It only contains an icon with no text or aria-label.#
**Location:** `src/components/screens/Gameplay.tsx`, lines 1193-1201#
**WCAG Criterion:** 4.1.2 Name, Role, Value (Level A)#
**Root Cause:** Toggle button state not communicated to assistive technology#
**Reproduction Steps:**#
1. Use a screen reader#
2. Navigate to PartySidebar toggle button#
3. Screen reader doesn't announce whether sidebar is open or closed#

**Fix:** Add aria-expanded and aria-label:#
```tsx#
<Button#
  variant="ghost"#
  size="icon"#  onClick={() => setIsPartySidebarOpen(!isPartySidebarOpen)}#  aria-label={isPartySidebarOpen ? "Close party sidebar" : "Open party sidebar"}#  aria-expanded={isPartySidebarOpen}#>
  <Users className="h-4 w-4" />#
</Button>#
```

---

### A11Y-6: Form Inputs Missing Proper Labels in AdventureSetup#
**Severity:** Medium  
**Description:** While some form inputs in AdventureSetup.tsx have associated `<label>` elements, error messages are shown via toast rather than inline with `aria-describedby`. Also, required fields are not marked with `aria-required` or text indication.#
**Location:** `src/components/screens/AdventureSetup.tsx`, various form fields#
**WCAG Criterion:** 3.3.3 Error Suggestion (Level AA), 3.3.1 Error Identification (Level A)#
**Root Cause:** Form validation errors not properly linked to inputs for screen readers#
**Reproduction Steps:**#
1. Use a screen reader#
2. Submit form with missing required fields#
3. Error toast appears but is not announced properly#
4. Focus is not moved to the invalid field#

**Fix:** Add proper ARIA attributes and inline error messages:#
```tsx#
<Label htmlFor="worldType">World Type *</Label>#<Input#  id="worldType"#  value={worldType}#  onChange={(e) => setWorldType(e.target.value)}#  aria-required="true"#  aria-invalid={customError && !worldType.trim()}#  aria-describedby={customError && !worldType.trim() ? "worldType-error" : undefined}#/>#
{customError && !worldType.trim() && (#  <p id="worldType-error" className="text-sm text-destructive">#
    World Type is required.#
  </p>#)}#
```

---

### A11Y-7: Color-Only Information in Stat Allocation#
**Severity:** Medium  
**Description:** StatAllocationInput.tsx uses `text-destructive` (red) for Strength, `text-green-600` for Stamina, `text-purple-500` for Wisdom without additional text differentiation. Users who cannot perceive color may not distinguish between stats.#
**Location:** `src/components/character/StatAllocationInput.tsx`#
**WCAG Criterion:** 1.4.1 Use of Color (Level A)#
**Root Cause:** Color is primary differentiator without text labels#
**Reproduction Steps:**#
1. Use a screen reader or color-blind simulation#
2. View stat allocation inputs#
3. Cannot distinguish which stat is which based on color alone#

**Fix:** Add text labels or icons to differentiate stats:#
```tsx#
<div className="flex items-center gap-2">#
  <span className="text-destructive font-semibold">STR</span>#  <Input ... />#
</div>#<div className="flex items-center gap-2">#
  <span className="text-green-600 font-semibold">STA</span>#  <Input ... />#
</div>#```

---

### A11Y-8: Decorative Icons Not Hidden from Screen Readers#
**Severity:** Low  
**Description:** Some decorative icons (lucide-react icons used purely for visual enhancement) may not be hidden with `aria-hidden="true"`, causing screen readers to announce them unnecessarily.#
**Location:** Multiple components using lucide-react icons#
**WCAG Criterion:** 4.1.2 Name, Role, Value (Level A)#
**Root Cause:** Decorative icons not marked as aria-hidden#
**Reproduction Steps:**#
1. Use a screen reader#
2. Navigate to elements with decorative icons#
3. Screen reader announces "icon" or similar for decorative elements#

**Fix:** Add aria-hidden="true" to decorative icons:#
```tsx#
// For decorative icons:#<Dice5 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />#

// For informative icons (with aria-label on parent):#<Button aria-label="Roll dice">#
  <Dice5 className="h-4 w-4" />#
</Button>#
```

---

### A11Y-9: No Reduced Motion Option in Settings#
**Severity:** Medium  
**Description:** The app uses animations (accordion expansions, loading spinners, etc.) but doesn't respect `prefers-reduced-motion` media query or provide a user toggle in Settings. Users with motion sensitivity may experience discomfort.#
**Location:** `tailwind.config.ts` (animations), `src/lib/themes.ts`, `src/components/screens/SettingsPanel.tsx`#
**WCAG Criterion:** 2.3.3 Animation from Interactions (Level AAA), 2.3.1 Three Flashes (Level A)#
**Root Cause:** No reduced-motion support in the app#
**Reproduction Steps:**#
1. Enable "Reduce motion" in OS settings#
2. Open the app#
3. Animations still play at full speed#

**Fix:** Add reduced-motion support:#
```typescript#
// In tailwind.config.ts, add:#const config: Config = {#  // ...#  plugins: [#    plugin(function ({ addBase }) {#      addBase({#
        '@media (prefers-reduced-motion: reduce)': {#
          '*': {#            animationDuration: '0.01ms !important',#            animationIterationCount: '1 !important',#            transitionDuration: '0.01ms !important',#          },#        },#      });#    }),#  ],#};#

// Or add a setting in SettingsPanel:#<div className="flex items-center justify-between">#
  <Label>Reduce motion</Label>#  <Switch#    checked={reducedMotion}#    onCheckedChange={setReducedMotion}#  />#</div>#
```

---

### A11Y-10: Improper Heading Structure#
**Severity:** Medium  
**Description:** The app may not have proper heading structure (h1, h2, h3) for screen reader navigation. Some screens use CardTitle or other elements instead of semantic heading tags.#
**Location:** `src/components/screens/MainMenu.tsx`, `src/components/screens/Gameplay.tsx`, and other screens#
**WCAG Criterion:** 1.3.1 Info and Relationships (Level A)#
**Root Cause:** Heading hierarchy not properly implemented#
**Reproduction Steps:**#
1. Use a screen reader#
2. Navigate by headings#
3. Headings may be missing or out of order#

**Fix:** Use proper heading tags:#
```tsx#
// In MainMenu.tsx:#<h1 className="text-4xl font-bold text-foreground">Endless Tales</h1>#

// In Gameplay.tsx:#<h2 className="text-2xl font-semibold">Gameplay</h2>#

// Or use CardTitle with aria-level:#<CardTitle asChild>#  <h2>Card Title</h2>#</CardTitle>#
```

---

### A11Y-11: ChatPanel Messages Not Announced#
**Severity:** High  
**Description:** New chat messages are added to ChatPanel but the container lacks an `aria-live` region. Screen readers will not announce new messages as they arrive.#
**Location:** `src/components/gameplay/ChatPanel.tsx`#
**WCAG Criterion:** 4.1.3 Status Messages (Level AA)#
**Root Cause:** No aria-live on message container#
**Reproduction Steps:**#
1. Use a screen reader#
2. Receive a new chat message#
3. Screen reader does not announce the new message#

**Fix:** Add aria-live region to message container:#
```tsx#
<div#  className="flex-1 overflow-y-auto p-2 space-y-2"#  aria-live="polite"#  aria-atomic="false"#  role="log"#>
  {messages.map((msg) => (#    <div key={msg.id}>/* message content */</div>#  ))}#
</div>#
```

---

### A11Y-12: Error Toasts Missing role="alert"#
**Severity:** Medium  
**Description:** Error toasts (from `use-toast.ts`) may not have `role="alert"` or `aria-live="assertive"`, causing them to not be announced immediately to screen readers.#
**Location:** `src/hooks/use-toast.ts`, toast rendering in `src/components/ui/toaster.tsx`#
**WCAG Criterion:** 4.1.3 Status Messages (Level AA)#
**Root Cause:** Error toasts not properly marked for immediate announcement#
**Reproduction Steps:**#
1. Use a screen reader#
2. Trigger an error (e.g., form validation)#
3. Toast appears but may not be announced immediately#

**Fix:** Add role="alert" to error toasts:#
```tsx#
// In toaster.tsx, for error toasts:#{toast.variant === 'destructive' && (#  <Toast role="alert" className={cn(toastClass)}>#    {/* toast content */}#  </Toast>#)}#
```

---

### A11Y-13: Character Creation Form Accessibility Issues#
**Severity:** Medium  
**Description:** CharacterCreation.tsx has form inputs that may not have proper `<label>` elements or `aria-describedby` for error messages. The form also uses radio buttons and other inputs that need proper labeling.#
**Location:** `src/components/screens/CharacterCreation.tsx`#
**WCAG Criterion:** 3.3.2 Labels or Instructions (Level A), 4.1.2 Name, Role, Value (Level A)#
**Root Cause:** Form accessibility not fully implemented#
**Reproduction Steps:**#
1. Use a screen reader#
2. Navigate through Character Creation form#
3. Some inputs may not have proper labels#

**Fix:** Ensure all inputs have proper labels:#
```tsx#
<Label htmlFor="characterName">Character Name *</Label>#<Input#  id="characterName"#  value={name}#  onChange={(e) => setName(e.target.value)}#  aria-required="true"#  aria-invalid={nameError ? "true" : "false"}#  aria-describedby={nameError ? "name-error" : undefined}#/>#
```

---

### Top 10 Worst Offenders for Accessibility#

1. **`src/components/game/WorldMapDisplay.tsx`** (SVG circles not keyboard accessible)#
2. **`src/components/gameplay/NarrationDisplay.tsx`** (no aria-live region)#
3. **`src/components/gameplay/ChatPanel.tsx`** (no aria-live, icon buttons not labeled)#
4. **`src/components/screens/Gameplay.tsx`** (PartySidebar toggle missing aria-expanded)#
5. **`src/components/screens/MainMenu.tsx`** (no skip navigation link)#
6. **`src/components/screens/AdventureSetup.tsx`** (form errors not linked to inputs)#
7. **`src/components/character/StatAllocationInput.tsx`** (color-only information)#
8. **`src/components/screens/CharacterCreation.tsx`** (form accessibility issues)#
9. **`src/components/ui/toaster.tsx`** (error toasts missing role="alert")#
10. **`tailwind.config.ts`** (no reduced-motion support)#

---

## Checklist#

### Bugs#
- [ ] BUG-1: Fix malformed JSON in AI proxy streaming responses#
- [ ] BUG-2: Implement real-time ICE candidate exchange for WebRTC#
- [ ] BUG-3: Pass systemMessage in non-streaming AI call#
- [ ] BUG-4: Add bounds checking for turn index in multiplayer reducer#
- [ ] BUG-5: Fix stale closure in handleMessage callback#
- [ ] BUG-6: Improve AI response normalizer error handling#
- [ ] BUG-7: Fix WebLLMProvider static property race conditions#
- [ ] BUG-8: Fix character respawn max stat calculation with debuffs#
- [ ] BUG-9: Add backoff and better reconnect logic#
- [ ] BUG-10: Fix typo in progressedToStage property name#

### Polish & UX#
- [ ] POLISH-1: Fix inconsistent font usage in MainMenu#
- [ ] POLISH-2: Replace hardcoded color classes with theme-aware classes in CoopLobby#
- [ ] POLISH-3: Add player stats display (health/stamina/mana) to PartySidebar#
- [ ] POLISH-4: Remove unused 'guest-input' connection step in CoopLobby#
- [ ] POLISH-5: Replace text "✕" with X icon in ChatPanel close button#
- [ ] POLISH-6: Remove duplicate logic for Randomized adventure in AdventureSetup#
- [ ] POLISH-7: Fix typo "startingSituation" → "startingSituation"#
- [ ] POLISH-8: Add loading spinner to ActionInput during guest action wait#
- [ ] POLISH-9: Standardize icon imports across components#
- [ ] POLISH-10: Add proper ARIA labels and inline error messages to AdventureSetup form#

### Performance#
- [ ] PERF-1: Fix context value changing reference on every dispatch#
- [ ] PERF-2: Debounce scrollToBottom during streaming#
- [ ] PERF-3: Clean up event listeners and timeouts in useMultiplayer#
- [ ] PERF-4: Use array-based buffering for streaming responses#
- [ ] PERF-5: Fix theme CSS accumulation bug#
- [ ] PERF-6: Memoize displayLog in NarrationDisplay#
- [ ] PERF-7: Use GPU-accelerated animations instead of height#
- [ ] PERF-8: Fix WebLLM static properties (performance impact)#
- [ ] PERF-9: Remove or guard dev logging in production#
- [ ] PERF-10: Implement backpressure for WebRTC data channel sends#

### Security#
- [ ] SEC-1: Encrypt API keys in sessionStorage or warn users#
- [ ] SEC-2: Add rate limiting and input validation to AI proxy#
- [ ] SEC-3: Validate signalling strings and add size limits#
- [ ] SEC-4: Sanitize error messages to not expose internal details#
- [ ] SEC-5: Strengthen XSS protection (improve sanitize function)#
- [ ] SEC-6: Update vulnerable dependencies (npm audit fix)#
- [ ] SEC-7: Validate ICE candidates before adding to peer connection#
- [ ] SEC-8: Add session password or allow-list for multiplayer#
- [ ] SEC-9: Use generic error messages in production for API config#
- [ ] SEC-10: Add payload size limits to AI proxy route#

### Code Quality & Maintainability#
- [ ] CODE-1: Remove unused `buildMessages` function from ai-router.ts#
- [ ] CODE-2: Remove unused `currentPlayerUid` field from game-types.ts#
- [ ] CODE-3: Delete dead file `firebase.ts`#
- [ ] CODE-4: Delete dead file `multiplayer-service.ts`#
- [ ] CODE-5: Remove unused imports from Gameplay.tsx#
- [ ] CODE-6: Split `WebLLMProvider.getEngine()` into smaller functions#
- [ ] CODE-7: Split `loadWebLLM()` into smaller functions#
- [ ] CODE-8: Extract components from `Gameplay.tsx` (1276 lines)#
- [ ] CODE-9: Replace 110 `any` type usages with proper TypeScript types#
- [ ] CODE-10: Replace deprecated `substr()` with `substring()` or `slice()`#
- [ ] CODE-11: Remove or implement `SEND_PLAYER_ACTION` no-op in reducer#
- [ ] CODE-12: Add error boundaries for sub-components in Gameplay#
- [ ] CODE-13: Standardize AI provider patterns (class vs function)#
- [ ] CODE-14: Apply consistent React.memo strategy#
- [ ] CODE-15: Remove dead state variables from useMultiplayer hook#

### Error Handling & Diagnostics#
- [ ] ERR-1: Add try-catch blocks to all 11 AI provider methods#
- [ ] ERR-2: Preserve raw AI response text when parsing fails#
- [ ] ERR-3: Fix AI proxy route to catch async handler errors#
- [ ] ERR-4: Sanitize provider-specific error messages#
- [ ] ERR-5: Propagate WebRTC data channel errors to UI#
- [ ] ERR-6: Show clear error messages for connection failures#
- [ ] ERR-7: Add user-facing recovery options for save/load errors#
- [ ] ERR-8: Add "Show Raw Response" debug option for AI failures#
- [ ] ERR-9: Handle streaming errors mid-stream gracefully#
- [ ] ERR-10: Don't swallow error details in generic catch blocks#
- [ ] ERR-11: Add retry button for failed AI requests#
- [ ] ERR-12: Notify user of ICE candidate errors#
- [ ] ERR-13: Handle abort/timeout errors with clear messages#

### Accessibility#
- [ ] A11Y-1: Make SVG circle elements keyboard accessible#
- [ ] A11Y-2: Add aria-live regions for dynamic updates (NarrationDisplay, ChatPanel)#
- [ ] A11Y-3: Add aria-label to all icon-only buttons#
- [ ] A11Y-4: Add skip navigation link to main screens#
- [ ] A11Y-5: Add aria-expanded to PartySidebar toggle button#
- [ ] A11Y-6: Fix form inputs with proper labels and error linking (AdventureSetup)#
- [ ] A11Y-7: Add text labels to StatAllocation (not color-only)#
- [ ] A11Y-8: Hide decorative icons with aria-hidden="true"#
- [ ] A11Y-9: Add reduced-motion option in Settings#
- [ ] A11Y-10: Fix heading structure (use h1, h2, h3 properly)#
- [ ] A11Y-11: Add aria-live to ChatPanel message container#
- [ ] A11Y-12: Add role="alert" to error toasts#
- [ ] A11Y-13: Fix Character Creation form accessibility#