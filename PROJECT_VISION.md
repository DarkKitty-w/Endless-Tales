# Endless Tales — Project Vision & Fix Priorities

_Last updated: 2026-06-20_

This file records the product direction that should guide future fixes. It overrides the older broad `night_tasks/` audit backlog when there is a conflict.

## Core Vision

Endless Tales is a browser-first AI text adventure RPG. The game should feel playful, immersive, player-owned, and lightweight. The priority is to stabilize and polish the existing experience before adding large new systems.

## Product Decisions

### 1. AI Provider Model

**Decision:** Bring Your Own Key only.

- Cloud providers must use user-provided API keys.
- Supported cloud providers may include Gemini, OpenAI, Claude, DeepSeek, and OpenRouter.
- The app should not depend on developer/server-owned production API keys for normal gameplay.
- API key UX must be clear, user-controlled, and provider-specific.
- WebLLM/local AI remains available but is experimental and not a priority.
- WebLLM should not block stabilization work or complicate the main UX.

### 2. Multiplayer Scope

**Decision:** Small-party co-op, not unlimited scale.

- Target party size: one friend at minimum, ideally 4–6 players.
- Multiplayer should remain manual P2P WebRTC unless explicitly changed later.
- No Firebase/Supabase/signalling server requirement.
- No host migration requirement for now.
- Focus on reliability, clear lobby flow, turn sync, chat, and party state.

### 3. Persistence

**Decision:** Local only plus import/export.

- Saves stay local to the browser/device.
- Add or improve import/export so players can back up and move saves manually.
- No cloud saves.
- No account system.
- No Firebase/Supabase persistence.
- Keep migrations and validation only if they help protect local saves without overcomplicating UX.

### 4. Game Feel by Mode

Different modes should support different levels of rule enforcement.

#### Randomized
- More rule-enforced RPG.
- Stronger mechanics and constraints.
- Clearer dice/difficulty/resource consequences.

#### Custom
- More rule-enforced RPG by default.
- Player settings should shape how strict the adventure is.
- Custom worlds should respect the configured genre, tone, magic, tech, combat/puzzle/social mix.

#### Immersed
- More freeform AI sandbox.
- Prioritize fantasy fulfillment, lore flavor, and player freedom.
- Rules should be softer unless the player explicitly configures stricter play.

### 5. Current Priority

**Decision:** Stabilize and polish before expansion.

Current focus:
1. Make existing features work reliably.
2. Align implementation with BYOK/local-first vision.
3. Improve UX clarity and error feedback.
4. Fix real runtime/type/build bugs.
5. Avoid major new systems until the core experience is stable.

### 6. Night Tasks Policy

The existing `night_tasks/` audit files are useful references, but they should not be followed blindly.

- Keep old audit files as background material.
- Use `night_tasks/VISION_ALIGNED_PLAN.md` as the active task source.
- Do not implement tasks that contradict this vision.
- Do not add heavy infrastructure unless explicitly requested.
- Prefer small, safe, user-visible improvements.

## Explicit Non-Goals for Now

Do not prioritize:

- Firebase/Supabase multiplayer or saves.
- Cloud save/account systems.
- Redis-backed production infrastructure.
- Sentry/OpenTelemetry-style observability integrations.
- Health-check endpoints unless deployment later requires them.
- Host migration.
- Public session discovery.
- Enterprise-level monitoring/metrics.
- Large rewrites before stability fixes.
- New gameplay systems before the current systems are reliable.

## Guiding Principle

When choosing between two fixes, prefer the one that makes the game more stable, more understandable, more fun, and closer to the browser-first BYOK vision.