## Performance

### PERF-1: Context Value Changes Reference on Every Dispatch
**Severity:** High  
**Description:** The context value in GameContext.tsx is memoized with `useMemo(() => ({ state, dispatch }), [state, dispatch])`, but the `state` object gets a new reference on **every single dispatch** because `gameReducer` always creates a new state object. Even when no sub-reducer makes changes, the spread `...state` creates a new reference. This causes **all consumers** of `useGame()` to re-render on every dispatch, regardless of whether they use the changed state.
**Location:** `src/context/GameContext.tsx` line 244, `src/context/game-reducer.ts` lines 128-138
**Root Cause:** Reducer always returns a new object even when no state changes occurred
**Reproduction Steps:**
1. Dispatch any action
2. All components using `useGame()` re-render even if they don't use the changed parts
3. Causes unnecessary re-renders across the entire component tree

**Fix:** Compare new state with old state and return the old state reference if nothing changed:
```typescript
// At the end of gameReducer, before returning nextState:
if (
  nextState === state ||
  (nextState.character === state.character &&
   nextState.inventory === state.inventory &&
   nextState.adventureSettings === state.adventureSettings &&
   nextState.storyLog === state.storyLog &&
   nextState.turnCount === state.turnCount)
) {
  return state;  // Return OLD reference if nothing changed
}
return nextState;
```

---

### PERF-2: Excessive scrollToBottom Calls During Streaming
**Severity:** Medium  
**Description:** The `scrollToBottom` function in NarrationDisplay.tsx is called on EVERY change to `streamingText`, which updates rapidly during AI streaming responses. This causes excessive scroll operations (potentially dozens per second) and forces layout recalculation.
**Location:** `src/components/gameplay/NarrationDisplay.tsx`, lines 72-74
**Root Cause:** The useEffect dependency array includes `streamingText` which changes rapidly during streaming
**Reproduction Steps:**
1. Start an AI narration with streaming enabled
2. As text streams in, scrollToBottom is called on every chunk
3. This causes layout thrashing and poor performance

**Fix:** Debounce the scrollToBottom call, or only trigger it when `storyLog` length changes / new entries added, not on streaming text updates:
```typescript
// Use a separate effect for streaming that uses requestAnimationFrame with throttling
const [lastScrollTime, setLastScrollTime] = useState(0);
useEffect(() => {
  const now = Date.now();
  if (now - lastScrollTime > 100) {  // Throttle to max 10 scrolls per second
    scrollToBottom();
    setLastScrollTime(now);
  }
}, [streamingText, scrollToBottom]);
```

---

### PERF-3: Memory Leaks - Event Listeners Not Cleaned Up in useMultiplayer
**Severity:** High  
**Description:** Several event listeners and timeouts are not properly cleaned up in the `useMultiplayer` hook:
1. `peerConnection.ondatachannel` handlers (lines 182, 223) are assigned but never explicitly removed
2. ICE candidate callbacks (lines 174, 215) push to `iceCandidatesRef` but are not cleaned up
3. `setTimeout(() => reconnect(), 1000)` in data channel `onclose` handler (line 298) is not stored in a ref, so it cannot be cleared on unmount
4. Data channel listeners added by `setupDataChannel` are never explicitly removed

**Location:** `src/hooks/use-multiplayer.ts`, lines 182, 223, 174, 215, 298
**Root Cause:** Missing cleanup functions for event listeners and timeouts
**Reproduction Steps:**
1. Connect to a multiplayer session
2. Disconnect and unmount the component
3. Event listeners may still be attached, causing memory leaks
4. If reconnect timeout fires after unmount, it may try to call reconnect on an unmounted component

**Fix:** Add proper cleanup:
```typescript
// Store timeout IDs in refs
const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

// In data channel onclose:
reconnectTimeoutRef.current = setTimeout(() => reconnect(), 1000);

// In cleanup effect:
useEffect(() => {
  return () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    // Close all data channels
    Object.values(dataChannelsRef.current).forEach(channel => {
      try {
        channel.onmessage = null;
        channel.onopen = null;
        channel.onclose = null;
        channel.close();
      } catch (e) {}
    });
  };
}, []);
```

---

### PERF-4: String Concatenation in Loops (Streaming Buffer Accumulation)
**Severity:** Medium  
**Description:** All streaming providers in `ai-router.ts` use `buffer += decoder.decode(value, { stream: true })` in a loop, which creates new string objects on each iteration since strings are immutable in JavaScript. This can cause memory pressure and GC overhead for large responses.
**Location:** `src/ai/ai-router.ts`, lines 161, 269, 377, 486, 594
**Root Cause:** String concatenation in loops creates many intermediate string objects
**Reproduction Steps:**
1. Use streaming with a provider that returns large responses
2. Each chunk creates a new string object
3. Can cause GC pressure and memory growth

**Fix:** Use an array to collect chunks and join at the end, or use a more efficient buffering strategy:
```typescript
// Instead of:
let buffer = '';
// ... in loop:
buffer += decoder.decode(value, { stream: true });

// Use array:
const chunks: string[] = [];
// ... in loop:
chunks.push(decoder.decode(value, { stream: true }));
// At the end:
const text = chunks.join('');
```

---

### PERF-5: Theme CSS Accumulation Bug
**Severity:** Medium  
**Description:** The `applyTheme` function in GameContext.tsx explicitly clears ALL theme CSS custom properties before applying new ones. However, if themes define different sets of properties, properties from the old theme may persist if the new theme doesn't define them.
**Location:** `src/context/GameContext.tsx`, lines 52-78
**Root Cause:** The theme switching logic may not properly clean up all old theme properties
**Reproduction Steps:**
1. Apply a theme with many custom properties
2. Switch to a theme with fewer properties
3. Old properties may still be present in the DOM

**Fix:** Ensure all theme properties are properly reset:
```typescript
const applyTheme = useCallback((themeId: string) => {
  const theme = themes.find(t => t.id === themeId);
  if (!theme) return;  
  
  const root = document.documentElement;  
  
  // Remove all existing theme custom properties
  const allThemeProps = new Set<string>();
  themes.forEach(t => {
    if (t.cssVars) {
      Object.keys(t.cssVars).forEach(prop => allThemeProps.add(prop));
    }
  });
  allThemeProps.forEach(prop => root.style.removeProperty(prop));  
  
  // Apply new theme
  if (theme.cssVars) {
    Object.entries(theme.cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value as string);
    });
  }
}, [themes]);
```

---

### PERF-6: Unnecessary Array Copy on Every Render in NarrationDisplay
**Severity:** Low  
**Description:** The `displayLog` constant in NarrationDisplay.tsx creates a new array on every render with `storyLog.slice(-50)`, even when `storyLog` hasn't changed. For 50 items this is minor, but it's still unnecessary work.
**Location:** `src/components/gameplay/NarrationDisplay.tsx`, line 76
**Root Cause:** Array copy happens on every render regardless of whether the input changed
**Reproduction Steps:**
1. Component re-renders for any reason
2. A new array is created even if storyLog hasn't changed

**Fix:** Memoize the displayLog calculation:
```typescript
const displayLog = useMemo(() => storyLog.slice(-50), [storyLog]);
```

---

### PERF-7: Accordion Height Animations Cause Layout Thrashing
**Severity:** Medium  
**Description:** The Tailwind config defines accordion keyframes that animate `height` property. Height animations trigger layout recalculations (reflows) which can cause performance issues, especially on lower-end devices. The Radix UI accordion content height is dynamic, and animating height from 0 to auto (via CSS variable) forces the browser to recalculate layout on each frame.
**Location:** `tailwind.config.ts`, lines 72-98
**Root Cause:** Height animations are not GPU-accelerated
**Reproduction Steps:**
1. Open a screen with accordion components
2. Expand/collapse rapidly
3. Notice layout thrashing

**Fix:** Use `transform: scaleY()` or opacity animations instead, or use `transform: translateY` for slide effects which are GPU-accelerated:
```javascript
// In tailwind.config.ts, change from height animation to transform:
'accordion-down': { 
  transform: 'scaleY(1)',
  transformOrigin: 'top'
},
'accordion-up': { 
  transform: 'scaleY(0)',
  transformOrigin: 'top'
}
```

---

### PERF-8: WebLLM Static Properties Race Condition (Performance Impact)
**Severity:** Medium  
**Description:** `WebLLMProvider` uses static properties that are shared across all instances. If multiple components try to use WebLLM simultaneously, the static `loadingPromise` can cause one load to be "lost" or incorrect engine to be returned. This was listed as BUG-7 but also has performance implications.
**Location:** `src/ai/ai-router.ts`, lines 690-822
**Root Cause:** Static class properties cause contention
**Reproduction Steps:**
1. Multiple components try to initialize WebLLM
2. Static loadingPromise gets overwritten
3. One component may get a promise that doesn't belong to it

**Fix:** Use instance properties instead of static properties to allow multiple independent WebLLM instances.

---

### PERF-9: Dev Logging Still Active in Production
**Severity:** Low  
**Description:** Multiple files have `console.log` statements that are active in production, including the WebLLM provider which has extensive logging. This can impact performance and expose internal state.
**Location:** Multiple files - `ai-router.ts`, `use-multiplayer.ts`, `narrate-adventure.ts`, etc.
**Root Cause:** Dev logging not stripped in production builds
**Reproduction Steps:**
1. Build the app for production
2. Open browser console
3. See many console.log statements still active

**Fix:** Wrap all console.log in development checks or use a logging utility:
```typescript
// Instead of:
console.log('message');

// Use:
if (process.env.NODE_ENV === 'development') {
  console.log('message');
}

// Or create a logger utility that can be disabled:
const logger = {
  log: (...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(...args);
    }
  }
};
```

---

### PERF-10: No Backpressure for WebRTC Data Channel Sends
**Severity:** Medium  
**Description:** The `sendDataChannelMessage` function in `webrtc-signalling.ts` doesn't implement any backpressure mechanism. If messages are sent faster than the data channel can handle, they may be buffered indefinitely or dropped silently.
**Location:** `src/lib/webrtc-signalling.ts`, lines 248-259
**Root Cause:** No buffering or backpressure handling for data channel sends
**Reproduction Steps:**
1. In multiplayer, send many messages rapidly
2. Data channel buffer may fill up
3. Messages may be lost or delayed

**Fix:** Check the data channel buffer amount and implement queuing:
```typescript
export function sendDataChannelMessage(channel: RTCDataChannel, data: any): boolean {
  if (channel.readyState === 'open') {
    // Check buffer amount to implement backpressure
    if (channel.bufferedAmount > 1024 * 1024) {  // > 1MB buffered
      console.warn('Data channel buffer full, message queued');
      // Implement queuing logic here
      return false;
    }
    try {
      channel.send(JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Failed to send data channel message:', error);
      return false;
    }
  }
  return false;
}