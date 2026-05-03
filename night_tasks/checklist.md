## Checklist

### Bugs
- [ ] BUG-1: Fix malformed JSON in AI proxy streaming responses
- [ ] BUG-2: Implement real-time ICE candidate exchange for WebRTC
- [ ] BUG-3: Pass systemMessage in non-streaming AI call
- [ ] BUG-4: Add bounds checking for turn index in multiplayer reducer
- [ ] BUG-5: Fix stale closure in handleMessage callback
- [ ] BUG-6: Improve AI response normalizer error handling
- [ ] BUG-7: Fix WebLLMProvider static property race conditions
- [ ] BUG-8: Fix character respawn max stat calculation with debuffs
- [ ] BUG-9: Add backoff and better reconnect logic
- [ ] BUG-10: Fix typo in progressedToStage property name

### Polish & UX
- [ ] POLISH-1: Fix inconsistent font usage in MainMenu
- [ ] POLISH-2: Replace hardcoded color classes with theme-aware classes in CoopLobby
- [ ] POLISH-3: Add player stats display (health/stamina/mana) to PartySidebar
- [ ] POLISH-4: Remove unused 'guest-input' connection step in CoopLobby
- [ ] POLISH-5: Replace text "✕" with X icon in ChatPanel close button
- [ ] POLISH-6: Remove duplicate logic for Randomized adventure in AdventureSetup
- [ ] POLISH-7: Fix typo "startingSituation" → "startingSituation"
- [ ] POLISH-8: Add loading spinner to ActionInput during guest action wait
- [ ] POLISH-9: Standardize icon imports across components
- [ ] POLISH-10: Add proper ARIA labels and inline error messages to AdventureSetup form

### Performance
- [ ] PERF-1: Fix context value changing reference on every dispatch
- [ ] PERF-2: Debounce scrollToBottom during streaming
- [ ] PERF-3: Clean up event listeners and timeouts in useMultiplayer
- [ ] PERF-4: Use array-based buffering for streaming responses
- [ ] PERF-5: Fix theme CSS accumulation bug
- [ ] PERF-6: Memoize displayLog in NarrationDisplay
- [ ] PERF-7: Use GPU-accelerated animations instead of height
- [ ] PERF-8: Fix WebLLM static properties (performance impact)
- [ ] PERF-9: Remove or guard dev logging in production
- [ ] PERF-10: Implement backpressure for WebRTC data channel sends

### Security
- [ ] SEC-1: Encrypt API keys in sessionStorage or warn users
- [ ] SEC-2: Add rate limiting and input validation to AI proxy
- [ ] SEC-3: Validate signalling strings and add size limits
- [ ] SEC-4: Sanitize error messages to not expose internal details
- [ ] SEC-5: Strengthen XSS protection (improve sanitize function)
- [ ] SEC-6: Update vulnerable dependencies (npm audit fix)
- [ ] SEC-7: Validate ICE candidates before adding to peer connection
- [ ] SEC-8: Add session password or allow-list for multiplayer
- [ ] SEC-9: Use generic error messages in production for API config
- [ ] SEC-10: Add payload size limits to AI proxy route

### Code Quality & Maintainability
- [ ] CODE-1: Remove unused `buildMessages` function from ai-router.ts
- [ ] CODE-2: Remove unused `currentPlayerUid` field from game-types.ts
- [ ] CODE-3: Delete dead file `firebase.ts`
- [ ] CODE-4: Delete dead file `multiplayer-service.ts`
- [ ] CODE-5: Remove unused imports from Gameplay.tsx
- [ ] CODE-6: Split `WebLLMProvider.getEngine()` into smaller functions
- [ ] CODE-7: Split `loadWebLLM()` into smaller functions
- [ ] CODE-8: Extract components from `Gameplay.tsx` (1276 lines)
- [ ] CODE-9: Replace 110 `any` type usages with proper TypeScript types
- [ ] CODE-10: Replace deprecated `substr()` with `substring()` or `slice()`
- [ ] CODE-11: Remove or implement `SEND_PLAYER_ACTION` no-op in reducer
- [ ] CODE-12: Add error boundaries for sub-components in Gameplay
- [ ] CODE-13: Standardize AI provider patterns (class vs function)
- [ ] CODE-14: Apply consistent React.memo strategy
- [ ] CODE-15: Remove dead state variables from useMultiplayer hook

### Error Handling & Diagnostics
- [ ] ERR-1: Add try-catch blocks to all 11 AI provider methods
- [ ] ERR-2: Preserve raw AI response text when parsing fails
- [ ] ERR-3: Fix AI proxy route to catch async handler errors
- [ ] ERR-4: Sanitize provider-specific error messages
- [ ] ERR-5: Propagate WebRTC data channel errors to UI
- [ ] ERR-6: Show clear error messages for connection failures
- [ ] ERR-7: Add user-facing recovery options for save/load errors
- [ ] ERR-8: Add "Show Raw Response" debug option for AI failures
- [ ] ERR-9: Handle streaming errors mid-stream gracefully
- [ ] ERR-10: Don't swallow error details in generic catch blocks
- [ ] ERR-11: Add retry button for failed AI requests
- [ ] ERR-12: Notify user of ICE candidate errors
- [ ] ERR-13: Handle abort/timeout errors with clear messages

### Accessibility
- [ ] A11Y-1: Make SVG circle elements keyboard accessible
- [ ] A11Y-2: Add aria-live regions for dynamic updates (NarrationDisplay, ChatPanel)
- [ ] A11Y-3: Add aria-label to all icon-only buttons
- [ ] A11Y-4: Add skip navigation link to main screens
- [ ] A11Y-5: Add aria-expanded to PartySidebar toggle button
- [ ] A11Y-6: Fix form inputs with proper labels and error linking (AdventureSetup)
- [ ] A11Y-7: Add text labels to StatAllocation (not color-only)
- [ ] A11Y-8: Hide decorative icons with aria-hidden="true"
- [ ] A11Y-9: Add reduced-motion option in Settings
- [ ] A11Y-10: Fix heading structure (use h1, h2, h3 properly)
- [ ] A11Y-11: Add aria-live to ChatPanel message container
- [ ] A11Y-12: Add role="alert" to error toasts
