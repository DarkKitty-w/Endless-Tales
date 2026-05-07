## 📁 Final `ORDERED_FILES` (bash)

```bash
ORDERED_FILES=(
  "bugs.md"
  "polish_ux.md"
  "performance.md"
  "security.md"
  "code_quality.md"
  "error_handling.md"
  "architecture.md"
  "persistence.md"
  "multiplayer.md"
  "ai_coherence.md"
  "observability.md"
  "game_design.md"
  "feature_gaps.md"
)
```

---

# 🐞 Prompt 1 – Bug Detection & Logical Errors

You are auditing the "Endless Tales" project at /workspaces/Endless-Tales for **bugs and logical errors only**. Do not focus on UI polish, performance, or security – only on functionality that is broken, unreliable, or throws unexpected errors at runtime.

Use Cline's subagent feature if it helps you scan many files in parallel.

1. **Read the full codebase.**
2. Identify every bug: race conditions, stale closures, incorrect reducer logic, missing null checks, unhandled promise rejections, broken feature handoffs, AI response handling that could fail silently, etc.
3. For each bug, prepare a detailed entry with:
   - A unique ID (BUG‑X)
   - Short title
   - Full explanation
   - File paths and line numbers (approximate if not exact)
   - Root cause and reproduction steps
   - Suggested fix
   - Severity (Critical / High / Medium / Low)

**Write to `night_tasks/bugs.md`:**
- Create the file if it doesn't exist. Keep any existing content intact; append your new findings under a `## Detailed Findings` section (or add to it if already present).
- Format each bug as:
  ```
  ### BUG‑1: Title  
  **Severity:** Critical / High / Medium / Low  
  **Description:** ...  
  **Location:** `path/file.ts`, lines X‑Y  
  **Root Cause:** ...  
  **Reproduction Steps:** ...  
  **Fix:** ...  
  ```

Output the **complete updated content** of `night_tasks/bugs.md` so I can save it.


# ✨ Prompt 2 – Polish & UX Consistency

Audit the "Endless Tales" project at /workspaces/Endless-Tales for **polish and user experience inconsistencies**. Look for anything that makes the game feel unfinished, confusing, or visually inconsistent. Use Cline subagents to scan components quickly.

Focus on:
- Features coded but **not reachable from the UI** (no button, menu item, or screen).
- Visually broken elements (layout issues, overflow, missing styles).
- Missing feedback: no loading states, no success/error messages, abrupt transitions.
- Inconsistent design language (different fonts, colors, spacing, icon styles).
- Labels or placeholders that are confusing or placeholdery ("Lorem ipsum").
- Missing keyboard accessibility or ARIA labels.
- Multiplayer UI issues: turn indicator not visible, party panel missing stats, chat input broken, etc.
- Verify that **every feature listed in the README is actually present and usable** in the UI.

For each issue, provide:
- Unique ID (POLISH‑X)
- Title and description
- Component/file location
- Severity (High/Medium/Low)
- Suggestion for improvement

**Write to `night_tasks/polish_ux.md`:**
- Create the file if it doesn't exist. Keep existing content; append new findings under `## Detailed Findings`.
- Format each item as:
  ```
  ### POLISH‑1: Title  
  **Severity:** High / Medium / Low  
  **Description:** ...  
  **Location:** `path/file.tsx`, lines X‑Y  
  **Current Behaviour:** ...  
  **Expected:** ...  
  **Fix:** ...  
  ```

Output the **complete updated content** of `night_tasks/polish_ux.md`.


# ⚡ Prompt 3 – Performance & Efficiency

Perform a **performance audit** on the Endless Tales codebase at /workspaces/Endless-Tales. Use Cline subagents to check many files simultaneously. Look for:

- Unnecessary re‑renders (missing `React.memo`, unstable props, inline objects/functions passed to JSX).
- Memory leaks: event listeners not cleaned up, intervals/timeouts not cleared, WebRTC connections not closed.
- Inefficient algorithms (large array operations, O(n²) on big data).
- Over‑fetching or duplicate network requests.
- Large bundle contributors (heavy deps that could be tree‑shaken).
- Dev logging still active in production.
- WebRTC data channel flooding or lack of backpressure.
- Verify that the earlier theme CSS accumulation bug is truly fixed.

For each issue, create:
- Unique ID (PERF‑X)
- Description and code location
- Estimated impact (lag, memory growth)
- Concrete optimization suggestion
- Severity (High/Medium/Low)

**Write to `night_tasks/performance.md`:**
- Create if not exists; keep existing content; append under `## Detailed Findings`.
- Format:
  ```
  ### PERF‑1: Title  
  **Severity:** High / Medium / Low  
  **Description:** ...  
  **Location:** `path/file.tsx`, lines X‑Y  
  **Impact:** ...  
  **Fix:** ...  
  ```

Output the **complete updated content** of `night_tasks/performance.md`.


# 🔒 Prompt 4 – Security & Data Exposure

Conduct a **security review** of Endless Tales at /workspaces/Endless-Tales. Use subagents if helpful for scanning many files.

Check:
- Are any API keys ever exposed to the browser, logged, or sent over the network in plain text?
- Is the server‑side AI proxy (`/api/ai-proxy`) resistant to abuse (prompt injection, rate limiting)?
- User‑provided text (actions, chat, character names) – is it sanitized against XSS? Look for `dangerouslySetInnerHTML` or direct innerHTML usage.
- WebRTC signalling strings: could a crafted invite code crash the parser or leak data?
- LocalStorage/sessionStorage: does it contain sensitive data (keys, tokens) in plain text?
- Dependencies with known vulnerabilities (check `package.json` if accessible).
- Are error messages exposed to the client revealing internal paths or API keys?

For each finding, create:
- Unique ID (SEC‑X)
- Title, detailed description, location
- Severity (Critical / High / Medium / Low)
- Recommended mitigation

**Write to `night_tasks/security.md`:**
- Create if not exists; keep existing content; append under `## Detailed Findings`.
- Format:
  ```
  ### SEC‑1: Title  
  **Severity:** Critical / High / Medium / Low  
  **Description:** ...  
  **Location:** `path/file.ts`, lines X‑Y  
  **Risk:** ...  
  **Mitigation:** ...  
  ```

Output the **complete updated content** of `night_tasks/security.md`.


# 🧹 Prompt 5 – Code Quality & Maintainability

Review the Endless Tales codebase at /workspaces/Endless-Tales for **code quality and maintainability**. Use Cline subagents to scan many files.

Identify:
- Dead code: unused components, functions, imports, stylesheets.
- Overly complex functions that should be split.
- Inconsistent naming, file structure, or coding patterns.
- Missing TypeScript types (any `any` usage that could be refined).
- Missing React error boundaries that could crash the whole app.
- Duplicate logic across files that could be extracted.
- Areas that lack comments where the logic is non‑obvious.
- Rate overall maintainability (A–F) and note the top 10 worst offenders.

For each issue, create:
- Unique ID (CODE‑X)
- Title, description, location
- Severity (High/Medium/Low)
- Refactoring suggestion

**Write to `night_tasks/code_quality.md`:**
- Create if not exists; keep existing content; append under `## Detailed Findings`.
- Format:
  ```
  ### CODE‑1: Title  
  **Severity:** High / Medium / Low  
  **Description:** ...  
  **Location:** `path/file.ts`, lines X‑Y  
  **Refactoring Suggestion:** ...  
  ```

Output the **complete updated content** of `night_tasks/code_quality.md`.


# ❗ Prompt 6 – Error Handling & Diagnostics

Audit the Endless Tales project at /workspaces/Endless-Tales for **error handling robustness**, with a special emphasis on AI failures. The critical requirement: **when the AI returns invalid JSON or fails, the raw AI response text must never be hidden from the user/developer.**

Use Cline subagents to check all error paths.

Check:
- AI provider calls (both client‑side router and server‑side proxy) – do they catch errors and preserve the raw response?
- AI response parsing (`processAiResponse`, skill tree generation, etc.) – if parsing fails, is the raw text displayed in the UI?
- Are error messages provider‑specific (e.g., "OpenAI rate limit exceeded")?
- Network timeouts / aborts: is there a clear message and a retry button?
- WebRTC data channel errors: are they shown meaningfully, with reconnect options?
- Save/load errors: does the UI explain *what* went wrong (e.g., missing field) and offer recovery?
- Any generic `catch` blocks that swallow errors without logging details.
- Does the game fall back gracefully while still informing the player that a fallback is active?

For each issue, create:
- Unique ID (ERR‑X)
- Title, description, file location, current behavior vs expected
- Severity (High/Medium/Low)
- Suggestion

**Write to `night_tasks/error_handling.md`:**
- Create if not exists; keep existing content; append under `## Detailed Findings`.
- Format:
  ```
  ### ERR‑1: Title  
  **Severity:** High / Medium / Low  
  **Description:** ...  
  **Location:** `path/file.ts`, lines X‑Y  
  **Current Behaviour:** ...  
  **Expected:** ...  
  **Fix:** ...  
  ```

Output the **complete updated content** of `night_tasks/error_handling.md`.


# 🏗️ Prompt 8 – Architecture & Data Flow

Audit the "Endless Tales" project at /workspaces/Endless-Tales for **architecture quality and data flow coherence**. This is a high-level structural audit, not a style or bug check. Use Cline subagents to scan broadly.

Focus on:
- State management: is state centralized or fragmented across contexts, reducers, and local state?
- Data flow clarity: are there confusing or circular data flows between components?
- Separation of concerns: is UI cleanly separated from business logic and AI logic?
- Tight coupling: are systems (AI, UI, multiplayer) overly dependent on each other?
- Folder and file structure scalability: can new features be added without chaos?
- Reusability: are shared utilities/components properly abstracted?
- Hidden dependencies: components relying on implicit global state or side effects.
- Any “god components” or “god files” doing too much.

For each issue, create:
- Unique ID (ARCH-X)
- Title and description
- Affected systems/files
- Severity (High/Medium/Low)
- Refactoring recommendation

**Write to `night_tasks/architecture.md`:**
- Create if not exists; keep existing content; append under `## Detailed Findings`.
- Format:
  ```
  ### ARCH-1: Title  
  **Severity:** High / Medium / Low  
  **Description:** ...  
  **Location:** `path/file.tsx`  
  **Problem:** ...  
  **Recommendation:** ...  
  ```

Output the **complete updated content** of `night_tasks/architecture.md`.


# 💾 Prompt 10 – Persistence & Save Integrity

Audit the "Endless Tales" project at /workspaces/Endless-Tales for **data persistence, save/load reliability, and integrity**. Use Cline subagents to inspect all storage-related logic.

Focus on:
- Save/load system correctness: does loading always restore a valid game state?
- Schema consistency: is there a defined structure for saves?
- Versioning: can old saves still be loaded after updates?
- Corruption handling: what happens if a save is partially invalid or missing fields?
- Atomicity: are saves written safely (no partial writes)?
- Multiplayer persistence: does syncing affect save integrity?
- LocalStorage/sessionStorage usage: risk of stale or conflicting data.
- Backup/recovery mechanisms (if any).

For each issue, create:
- Unique ID (SAVE-X)
- Title, description, location
- Severity (High/Medium/Low)
- Risk explanation
- Suggested fix

**Write to `night_tasks/persistence.md`:**
- Create if not exists; keep existing content; append under `## Detailed Findings`.
- Format:
  ```
  ### SAVE-1: Title  
  **Severity:** High / Medium / Low  
  **Description:** ...  
  **Location:** `path/file.ts`  
  **Risk:** ...  
  **Fix:** ...  
  ```

Output the **complete updated content** of `night_tasks/persistence.md`.


# 🌐 Prompt 11 – Multiplayer Consistency & Sync

Audit the "Endless Tales" project at /workspaces/Endless-Tales for **multiplayer consistency, synchronization, and reliability**. Use Cline subagents to analyze all multiplayer/WebRTC-related logic.

Focus on:
- Turn synchronization: can players become desynced?
- Conflict scenarios: what happens if multiple players act at the same time?
- Message ordering: are events processed in the correct order?
- Network instability: disconnects, reconnections, partial state updates.
- Host/client authority: who is the source of truth?
- WebRTC data channel reliability: flooding, dropped messages, retries.
- Invite/join flows: can malformed data break the session?
- State reconciliation: how mismatched states are resolved.

For each issue, create:
- Unique ID (NET-X)
- Title, description, location
- Severity (Critical / High / Medium / Low)
- Scenario (how it breaks)
- Suggested fix

**Write to `night_tasks/multiplayer.md`:**
- Create if not exists; keep existing content; append under `## Detailed Findings`.
- Format:
  ```
  ### NET-1: Title  
  **Severity:** Critical / High / Medium / Low  
  **Description:** ...  
  **Location:** `path/file.ts`  
  **Scenario:** ...  
  **Fix:** ...  
  ```

Output the **complete updated content** of `night_tasks/multiplayer.md`.


# 🎭 Prompt 12 – AI Narrative & Gameplay Coherence

Audit the "Endless Tales" project at /workspaces/Endless-Tales for **AI narrative quality, gameplay coherence, and rule consistency**. This is not about error handling, but about whether the AI produces a good and consistent experience.

Focus on:
- Does the AI respect game rules and constraints?
- Character consistency: personality, memory, relationships.
- Narrative coherence over time (no contradictions or resets).
- Prompt design: are prompts structured, modular, and controllable?
- Repetition or degeneration in AI output.
- Balance between player freedom and narrative structure.
- Handling of unexpected or adversarial player inputs.
- Does AI break immersion (meta comments, system leakage)?

For each issue, create:
- Unique ID (AI-X)
- Title, description, location (prompt or handler)
- Severity (High/Medium/Low)
- Impact on gameplay
- Suggested improvement

**Write to `night_tasks/ai_coherence.md`:**
- Create if not exists; keep existing content; append under `## Detailed Findings`.
- Format:
  ```
  ### AI-1: Title  
  **Severity:** High / Medium / Low  
  **Description:** ...  
  **Location:** `path/file.ts`  
  **Impact:** ...  
  **Fix:** ...  
  ```

Output the **complete updated content** of `night_tasks/ai_coherence.md`.


# 📊 Prompt 13 – Logging & Observability

Audit the "Endless Tales" project at /workspaces/Endless-Tales for **logging, monitoring, and observability**. The goal is to ensure that issues can be diagnosed quickly in development and production.

Focus on:
- Logging structure: consistent, structured logs vs scattered console logs.
- Error traceability: can errors be traced across systems (UI → server → AI)?
- Missing logs in critical paths (AI calls, multiplayer events, saves).
- Sensitive data exposure in logs.
- Log verbosity control (dev vs production).
- Metrics: latency, error rates, retries (if present).
- Debuggability: can developers reproduce and understand failures easily?

For each issue, create:
- Unique ID (OBS-X)
- Title, description, location
- Severity (High/Medium/Low)
- Impact
- Suggested improvement

**Write to `night_tasks/observability.md`:**
- Create if not exists; keep existing content; append under `## Detailed Findings`.
- Format:
  ```
  ### OBS-1: Title  
  **Severity:** High / Medium / Low  
  **Description:** ...  
  **Location:** `path/file.ts`  
  **Impact:** ...  
  **Fix:** ...  
  ```

Output the **complete updated content** of `night_tasks/observability.md`.


# 🎮 Prompt 15 – Game Design & Feature Completeness

Audit the "Endless Tales" project at /workspaces/Endless-Tales for **game design quality, feature completeness, and gameplay coherence**. This is a product-level audit, not just code.

Focus on:
- Core gameplay loop: is it clear, engaging, and complete?
- Missing or partially implemented features.
- Player agency vs AI control balance.
- Progression systems (skills, story arcs, consequences).
- Dead ends: situations where the game stalls or becomes unplayable.
- Feedback systems: does the player understand what is happening and why?
- Consistency between intended design (README or concept) and actual implementation.
- Replayability and variability.

For each issue, create:
- Unique ID (GAME-X)
- Title, description
- Severity (High/Medium/Low)
- Impact on player experience
- Suggested improvement

**Write to `night_tasks/game_design.md`:**
- Create if not exists; keep existing content; append under `## Detailed Findings`.
- Format:
  ```
  ### GAME-1: Title  
  **Severity:** High / Medium / Low  
  **Description:** ...  
  **Impact:** ...  
  **Fix:** ...  
  ```

Output the **complete updated content** of `night_tasks/game_design.md`.


# ❗ Prompt 7 – Features and tweaks addition

You are a senior product-focused auditor for the **Endless Tales** project at `/workspaces/Endless-Tales`.  
You have access to the full codebase and the up‑to‑date README (provided below).  
Use **Cline's subagent feature** if it helps you explore multiple files in parallel.

### Objective
Find every feature that is **not yet fully implemented**, every existing feature that would benefit from **further refinement**, any **small tweaks** that would noticeably improve the user experience, and any **additions** that would enrich the game (within the existing architectural boundaries – no massive new systems unless they are a natural extension of what’s already there).

Do **not** re‑report bugs that are purely about broken functionality – those already have their own audit. Focus on what’s *missing* or *could be better*, not what’s *broken*.

### Categories to Search For

#### A. Features Not Completely Implemented
- A feature exists in the code (component, reducer, hook, API) but the UI doesn’t allow the user to complete its flow.
- A feature is partially wired up but lacks final integration (e.g., a multiplayer host menu button that never appears).
- Functionality that is commented out, hidden behind a flag that is never set to true, or only accessible via a debug shortcut.
- Variables that are initialised but never updated by any action.

#### B. Further Refinements to Existing Features
- A feature works but could be made more intuitive or powerful without a full rewrite.  
  Examples:  
  - The skill tree shows skills but doesn’t allow unlearning or respeccing.  
  - Crafting uses materials but there’s no visual feedback when materials are insufficient.  
  - The world map has locations that can be visited but no visual indication of which ones are discovered vs. undiscovered.
  - Multiplayer turn order could be customisable (drag to reorder) but isn’t yet.
- Enhancements that stay within the current tech stack (no heavy new libraries).

#### C. Tweaks to Refine User Experience
- Small UI/UX improvements that take minimal effort but greatly impact feel:  
  - Smooth transitions/animations missing on important elements.  
  - Better empty states (e.g., “No party members yet” instead of a blank panel).  
  - Tooltips on icons that currently have none.  
  - Keyboard shortcuts for common actions.  
  - Confirmation dialogs for irreversible actions (delete save, leave game, kick player).  
  - Visual polish like hover effects, focus rings, skeleton loaders.

#### D. Additions to Enrich the Experience
- New small‑to‑medium gameplay or narrative elements that would deepen engagement **without overhauling the game’s architecture**.  
  Examples:  
  - A “loot” system for crafting materials found during adventures.  
  - Ambient music / sound effects toggle (if simple to add).  
  - An NPC companion system (since NPC relationships are already tracked).  
  - A “journal” that records key story events automatically.  
  - Achievement badges for milestones (first crafted item, first death, etc.) – purely client‑side, no backend needed.  
  - A simple “hardcore” mode with permanent death toggle – but the code already hints at perma‑death, maybe it’s just not exposed.
- These should feel like natural next steps, not pie‑in‑the‑sky ideas.

### How to Perform the Audit
1. Read the **README.md** (pasted below) – it lists every official feature. Verify that each feature **can be fully used by a player** from start to finish.
2. Read every major component, reducer, hook, and utility. Look for incomplete wiring, placeholder code, TODO comments, or functions that are exported but never called.
3. For refinement/tweak ideas, think like a player: what would make the current interactions smoother, more informative, or more satisfying?
4. For enrichment, consider what conventional RPG/adventure games offer and whether your codebase could support it with minor additions.

### Output Requirements
You will create **one file**: `night_tasks/feature_gaps.md`.  
This file will contain all findings, exactly following the style in the example below.  
Use sections: `## Features Not Completely Implemented`, `## Refinements`, `## Tweaks`, `## Enrichment Ideas`.

Each item must have:
- Unique ID (F-XXX, R-XXX, T-XXX, E-XXX)
- Title
- Severity (Critical / High / Medium / Low)
- Description (explain what's missing, why it matters)
- Location(s) in code (files, line numbers if helpful)
- Current behaviour vs. expected
- Suggestion for implementation

**Example format (for reference):**
```
## Tweaks
### T-001: Skill Tree Respect Confirmation
**Severity:** Medium
**Description:** Players can spend skill points but cannot reset or reallocate them. This can lead to regret and discouragement.
**Location:** `src/components/game/SkillTreePanel.tsx`
**Current Behaviour:** Points are permanently assigned.
**Expected:** Offer a "Respec" button (maybe with a cost) that allows the player to refund all points and re‑assign them, using the existing `SET_SKILL_POINTS` reducer action.
**Suggestion:** Add a `respecSkillPoints` function that resets the tree and dispatches the necessary actions. Show a confirmation dialog before proceeding.
```

Output the **complete content** of `night_tasks/feature_gaps.md`.


# 🔍 Prompt DEDUP – Cross‑File Task Deduplication & Merging

You are responsible for ensuring the task files in `night_tasks/` contain **no duplicate or overlapping tasks** across different `.md` files.  
Read **all** the following files (use sub‑agents if you wish):  
`bugs.md`, `polish_ux.md`, `performance.md`, `security.md`, `code_quality.md`, `error_handling.md`, `architecture.md`, `persistence.md`, `multiplayer.md`, `ai_coherence.md`, `observability.md`, `game_design.md`, `feature_gaps.md`.

### Your job
1. **Find exact duplicates** – tasks that are word‑for‑word identical or describe the same code change with the same scope.
2. **Find overlapping tasks** – tasks that target the same code area, same feature, or same objective, even if worded differently.
3. **For each duplicate/overlap**, decide:
   - Which task to **keep** (the most precise or the one in the most relevant category).
   - Which task(s) to **remove** (delete them from their file).
   - Whether to **merge** details from the removed task into the kept one (e.g., add a note, combine descriptions).
4. **Apply the changes directly** to the `.md` files:
   - Remove duplicate entries entirely.
   - Update the kept entry if more details have been merged.
   - Do **not** create a checklist; only edit the existing task files.

### Rules
- Never remove a task without ensuring the same intent is covered elsewhere.
- If the same intent exists in two categories, merge into the **most specific** category (e.g., a performance‑related bug fix goes into `bugs.md`, not `performance.md`).
- Keep the existing ID and format of the kept task; add a note like `(merged with POLISH‑X)` if helpful.
- Preserve all non‑duplicate content in every file.

### Output
After processing, output the **complete updated content** of each modified `.md` file, one after the other, so they can be saved. Also provide a short summary of every change made (what was removed, what was merged).


# ✅ Prompt CHECKLIST – Generate Final `checklist.md`

Read **all** the following task files in `night_tasks/`:  
`bugs.md`, `polish_ux.md`, `performance.md`, `security.md`, `code_quality.md`, `error_handling.md`, `architecture.md`, `persistence.md`, `multiplayer.md`, `ai_coherence.md`, `observability.md`, `game_design.md`, `feature_gaps.md`.

From these, generate a **single** `night_tasks/checklist.md` file.

### Format
```markdown
## Checklist

### Bugs
- [ ] BUG‑1: Fix type/payload mismatch in UPDATE_NARRATION action
- [ ] BUG‑2: Fix stale state persistence in GameContext
...

### Polish & UX
- [ ] POLISH‑1: Fix inline styles on Ko‑fi image in MainMenu
...
```

### Rules
- Include **every** unique task ID and title from all files.
- Group by category, using the heading names exactly as shown above (matching the file prefixes).
- Do not re‑evaluate or change the task descriptions – just aggregate.
- If a task appears in more than one file (shouldn’t happen after dedup), include it only once under its primary category.
- The file must be self‑contained and ready to be used by the automated fix script.

Output the **complete content** of `night_tasks/checklist.md`.
