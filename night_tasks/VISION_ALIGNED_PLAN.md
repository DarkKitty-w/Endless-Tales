# Endless Tales — Vision-Aligned Stabilization & Polish Plan

_Last updated: 2026-06-20_

This file replaces the old audit checklist as the active task source. The older `night_tasks/*.md` files remain available as reference material, but this plan is filtered through the current project vision:

- BYOK only for cloud AI providers.
- WebLLM is experimental and lower priority.
- Multiplayer targets one friend to a small party of 4–6.
- Persistence is local only, with import/export.
- Randomized and Custom modes lean rule-enforced RPG.
- Immersed mode leans freeform AI sandbox.
- Priority is stabilization and polish, not large expansion.

---

## Phase 0 — Verify Reality Before Fixing

### VISION-000: Establish Current Baseline
**Priority:** Critical  
**Type:** Stabilization  
**Description:** Before changing behavior, run the actual project checks to identify build/type/runtime blockers.  
**Scope:** `package.json`, TypeScript, Next build, app startup.  
**Actions:**
- Run dependency install if needed.
- Run `npm run typecheck`.
- Run `npm run build`.
- Start dev server if possible.
- Record real errors separately from speculative audit tasks.
**Done When:** We have a factual list of current blockers.

---

## Phase 1 — Re-align AI Provider System with BYOK Vision

### VISION-001: Restore True BYOK Cloud Provider Flow
**Priority:** Critical  
**Type:** Stabilization / Product Alignment  
**Description:** Cloud AI must use user-provided API keys, not silently rely on server-owned keys. The current branch appears to have drifted toward server-side API configuration, which conflicts with the BYOK-only vision.  
**Locations:**
- `src/components/screens/SettingsPanel.tsx`
- `src/context/GameContext.tsx`
- `src/context/reducers/settingsReducer.ts`
- `src/ai/ai-router.ts`
- `src/app/api/ai-proxy/route.ts`
**Current Behaviour:** Settings UI says cloud providers are configured server-side. Provider keys are not exposed properly in UI and may not persist. AI router may not be configured from selected provider state.  
**Expected Behaviour:** User selects provider, enters their own key, and the selected provider/key is actually used for AI calls.  
**Implementation Notes:**
- Add clear API key fields for Gemini/OpenAI/Claude/DeepSeek/OpenRouter.
- Persist provider keys locally per provider, unless the user clears them.
- Show clear key status without exposing the full key.
- Ensure selected provider updates the AI router.
- Ensure requests fail with clear UX if a cloud provider has no key.
- Avoid using developer/server production keys as the normal gameplay path.

### VISION-002: Clarify API Key Storage UX
**Priority:** High  
**Type:** Polish / Trust  
**Description:** Players should understand where their keys are stored and how to remove them.  
**Locations:**
- `src/components/screens/SettingsPanel.tsx`
- `README.md`
**Expected Behaviour:** Settings explains that keys are stored locally in the browser, are provider-specific, and can be cleared.  
**Implementation Notes:**
- Add “Clear key” per provider.
- Add masked key preview, e.g. `sk-...abcd`.
- Add a short privacy note.

### VISION-003: Keep WebLLM Experimental and Non-Blocking
**Priority:** Medium  
**Type:** Stabilization  
**Description:** WebLLM is useful but not core priority. It should not block cloud BYOK flow or main gameplay.  
**Locations:**
- `src/components/screens/SettingsPanel.tsx`
- `src/components/gameplay/AIStatusPanel.tsx`
- `src/ai/ai-router.ts`
**Expected Behaviour:** WebLLM appears as experimental/local option when available; if unavailable, the app remains clean and functional.  
**Implementation Notes:**
- Label WebLLM clearly as experimental.
- Avoid intrusive polling or confusing “package not installed” messages for regular players.
- Keep model download UI but do not prioritize advanced WebLLM optimization.

---

## Phase 2 — Stabilize Core Gameplay Loop

### VISION-004: Fix Real TypeScript/Build Errors First
**Priority:** Critical  
**Type:** Stabilization  
**Description:** Any actual type/build errors should be fixed before feature work.  
**Locations:** Entire codebase.  
**Expected Behaviour:** `npm run typecheck` and `npm run build` pass.  
**Implementation Notes:**
- Prefer minimal changes.
- Avoid broad refactors unless necessary.
- Do not chase speculative checklist items until build is clean.

### VISION-005: Make AI Failure States Player-Understandable
**Priority:** High  
**Type:** Stabilization / Polish  
**Description:** If AI fails, invalid JSON is returned, a key is missing, or a provider is unavailable, the player should get a clear message and retry path.  
**Locations:**
- `src/components/screens/Gameplay.tsx`
- `src/components/gameplay/NarrationDisplay.tsx`
- `src/ai/flows/*`
- `src/lib/utils.ts`
**Expected Behaviour:** AI failures do not silently break the adventure. Raw response/debug info should be available when useful, but not overwhelm normal players.  
**Implementation Notes:**
- Keep retry button.
- Show provider-specific missing-key/rate-limit/auth errors.
- Preserve raw AI response in collapsible debug area.
- Avoid permanent fallback loops that make the game feel fake.

### VISION-006: Fix Action Loading and Duplicate Submission Risks
**Priority:** High  
**Type:** Stabilization / UX  
**Description:** The action input, branching choices, dice assessment, and AI narration should have clear loading states and prevent accidental duplicate submissions.  
**Locations:**
- `src/components/screens/Gameplay.tsx`
- `src/components/gameplay/ActionInput.tsx`
- `src/components/gameplay/NarrationDisplay.tsx`
**Expected Behaviour:** Player always knows when the game is thinking, rolling, saving, or waiting for host.  
**Implementation Notes:**
- Disable action submission during active narration/assessment/crafting/save.
- Keep undo grace for branching choices if it feels good.
- Make loading text specific to phase.

### VISION-007: Enforce Mode-Specific Gameplay Feel
**Priority:** High  
**Type:** Game Design / AI Coherence  
**Description:** Randomized and Custom should feel more like RPG systems; Immersed should feel more freeform and sandbox-like.  
**Locations:**
- `src/ai/flows/narrate-adventure.ts`
- `src/ai/prompt-templates/*`
- `src/components/screens/AdventureSetup.tsx`
**Expected Behaviour:** Prompts and mechanics adapt to the selected mode.  
**Implementation Notes:**
- Randomized: stronger dice/resource/stat consequences.
- Custom: respect configured settings and RPG constraints.
- Immersed: softer mechanics, more lore/roleplay freedom.
- Avoid one-size-fits-all prompt rules.

---

## Phase 3 — Save System: Local Only + Import/Export

### VISION-008: Keep Saves Local and Reliable
**Priority:** High  
**Type:** Persistence  
**Description:** Local save/load should be dependable and understandable.  
**Locations:**
- `src/context/GameContext.tsx`
- `src/context/reducers/adventureReducer.ts`
- `src/context/schemas/save-schema.ts`
- `src/lib/storage-utils.ts`
- `src/components/screens/SavedAdventuresList.tsx`
**Expected Behaviour:** Saves load cleanly, corrupted saves are handled gracefully, and players understand recovery options.  
**Implementation Notes:**
- Keep localStorage-based saves unless size/reliability proves impossible.
- Keep schema validation and migration only as much as needed.
- Avoid cloud/account assumptions.

### VISION-009: Add or Polish Save Import/Export
**Priority:** High  
**Type:** Feature Completion / Local Ownership  
**Description:** Players should be able to export saves to a file and import them later. This supports the local-only vision.  
**Locations:**
- `src/components/screens/SavedAdventuresList.tsx`
- `src/lib/storage-utils.ts`
- save schema files
**Expected Behaviour:** Player can export all saves or a single save, then import valid save files.  
**Implementation Notes:**
- Validate imported saves.
- Show friendly errors for invalid files.
- Do not require login/cloud.
- Consider `.json` export.

---

## Phase 4 — Multiplayer: Small Party 4–6, Manual P2P

### VISION-010: Define Honest Multiplayer Scope in Code and README
**Priority:** High  
**Type:** Product Alignment  
**Description:** The target is one friend to a small party of 4–6, not unlimited players. Documentation and UI should not overpromise.  
**Locations:**
- `README.md`
- `src/components/screens/CoopLobby.tsx`
- `src/hooks/use-multiplayer.ts`
**Expected Behaviour:** Co-op promises match implementation goals.  
**Implementation Notes:**
- Replace “no enforced player limit” language with “small-party co-op target.”
- Avoid promising unlimited connections.

### VISION-011: Audit Actual Multi-Peer Support Before Expanding
**Priority:** High  
**Type:** Stabilization / Architecture  
**Description:** Current multiplayer appears closer to one peer connection than true 4–6 player support. Confirm before building UI on top of it.  
**Locations:**
- `src/hooks/use-multiplayer.ts`
- `src/lib/webrtc-signalling.ts`
- `src/components/screens/CoopLobby.tsx`
**Expected Behaviour:** We know whether current architecture supports multiple guests.  
**Implementation Notes:**
- If current implementation is one-host-one-guest, document it honestly first.
- Plan small-party support only after core one-friend flow is stable.
- Keep manual P2P; no signalling server for now.

### VISION-012: Stabilize One-Friend Co-op First
**Priority:** High  
**Type:** Multiplayer Stabilization  
**Description:** Before 4–6 players, one host + one guest should be reliable.  
**Locations:**
- `src/components/screens/CoopLobby.tsx`
- `src/hooks/use-multiplayer.ts`
- `src/components/gameplay/PartySidebar.tsx`
- `src/components/gameplay/ChatPanel.tsx`
**Expected Behaviour:** Host and guest can connect, start, take turns, chat, and receive story updates predictably.  
**Implementation Notes:**
- Clear lobby instructions.
- Clear copy/paste offer-answer flow.
- Turn indicator visible.
- Reconnect/leave messages understandable.
- Do not implement host migration now.

---

## Phase 5 — UX Polish That Supports Stability

### VISION-013: Clean Main Menu and Settings Trust UX
**Priority:** Medium  
**Type:** Polish  
**Description:** First impression should clearly communicate what the game is, how AI keys work, and how to start.  
**Locations:**
- `src/components/screens/MainMenu.tsx`
- `src/components/screens/SettingsPanel.tsx`
**Expected Behaviour:** Player understands adventure modes and AI setup without reading README.  
**Implementation Notes:**
- Short mode descriptions.
- Clear BYOK notice.
- Avoid external image dependency for Ko-fi in preview-sensitive contexts if needed.

### VISION-014: Improve Empty States and Feedback
**Priority:** Medium  
**Type:** Polish  
**Description:** Panels like inventory, party, relationships, reputation, and map should not feel broken when empty.  
**Locations:**
- `src/components/game/*`
- `src/components/gameplay/PartySidebar.tsx`
**Expected Behaviour:** Empty states guide the player and reinforce immersion.  
**Implementation Notes:**
- “No known factions yet.”
- “No companions/party members connected.”
- “No discovered locations beyond your starting point.”

### VISION-015: Accessibility and Keyboard Polish
**Priority:** Medium  
**Type:** Polish  
**Description:** Add missing labels, focus states, and common keyboard support where low-risk.  
**Locations:** UI components and screens.  
**Expected Behaviour:** Buttons are accessible, forms are navigable, and common actions are comfortable.  
**Implementation Notes:**
- ARIA labels for icon-only buttons.
- Enter submits action.
- Escape closes dialogs where appropriate.
- Avoid large accessibility rewrites unless needed.

---

## Phase 6 — Code Quality, But Only Where It Reduces Risk

### VISION-016: Avoid Large Refactors Until Stable
**Priority:** High  
**Type:** Code Quality Policy  
**Description:** Files like `Gameplay.tsx` and `ai-router.ts` are large, but rewriting them too early may create bugs.  
**Locations:**
- `src/components/screens/Gameplay.tsx`
- `src/ai/ai-router.ts`
- `src/hooks/use-multiplayer.ts`
**Expected Behaviour:** Refactors happen only when they directly support a stability fix.  
**Implementation Notes:**
- Prefer extraction of small pure helpers.
- Avoid “architecture astronaut” rewrites.
- Keep behavior stable.

### VISION-017: Gradually Replace Dangerous `any` in Critical Paths
**Priority:** Medium  
**Type:** Code Quality / Stabilization  
**Description:** Focus typing improvements on save data, AI responses, and multiplayer messages, where mistakes cause real bugs.  
**Locations:**
- AI flows
- save schema
- multiplayer message handling
- reducers
**Expected Behaviour:** Critical data paths are safer without slowing progress.  
**Implementation Notes:**
- Do not chase every `any` immediately.
- Type runtime boundaries first.

---

## Tasks Explicitly De-Prioritized or Rejected for Now

These may exist in older audit files, but should not be active tasks now:

- Firebase/Supabase save or multiplayer integration.
- Cloud saves or user accounts.
- Redis-backed rate limiting as a required dependency.
- Sentry/OpenTelemetry integration.
- Health check endpoint.
- Host migration.
- Automatic public session discovery.
- Voice chat.
- Unlimited multiplayer claims.
- Large new gameplay systems such as achievements, loot, companions, sound, or journal before stabilization.
- Full architecture rewrite of AI router/gameplay/multiplayer before build and core UX are stable.

---

## Suggested Fix Order

1. Run baseline checks.
2. Fix build/type errors.
3. Fix BYOK/provider selection/key storage flow.
4. Stabilize AI error handling and retry UX.
5. Stabilize save/load and add import/export.
6. Stabilize one-friend co-op.
7. Polish mode descriptions, settings, empty states, loading states.
8. Only then consider small-party 4–6 multiplayer improvements.
