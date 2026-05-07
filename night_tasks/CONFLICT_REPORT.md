# Conflict Report: Night Tasks vs. README.md (Updated)

## Updated Conflicts Table

| File | Task ID | Task Summary | Conflict Category | Detailed Explanation |
|------|---------|--------------|-------------------|---------------------|
| `multiplayer.md` | NET-17 | Host Migration Not Supported | **Redefinition of existing feature** | Task suggests implementing host migration: "when host disconnects, trigger an election among remaining peers. The new host takes over authority." README: "Endless Tales uses **pure P2P WebRTC with no signalling server or Firebase dependency**" and "host-authoritative multiplayer". Host migration would require a signalling server or election protocol that contradicts the "no signalling server" design. |
| `multiplayer.md` | NET-9 Fix Suggestion | Session discovery mechanism | **Redefinition of existing feature** | Fix suggests: "Implement a session discovery mechanism or allow the guest to request a new offer from the host." README: Host creates SDP offer "shared via QR code or copy-paste" — explicitly manual signalling only. Session discovery implies automatic signalling, contradicting README. |
| `persistence.md` | SAVE-20 Fix | "Implement an IndexedDB storage backend as an option" | **Incompatible dependency** | Task suggests adding IndexedDB as a backend. README: "Save/Load System: Local browser storage with schema versioning" and "Persistence: Adventure state is saved to localStorage". Adding IndexedDB would expand the tech stack beyond what README specifies. |
| `security.md` | SEC-1 Description | "Next.js has not reached v16 as of this review" | **Tech stack break** | Task claims `package.json` specifies `"next": "^16.2.5"` which is invalid. README specifies "Next.js 16.2.3 (React 18, TypeScript 5+)". Either the README is wrong about the version, or the task is wrong about v16 not existing. |
| `security.md` | SEC-3 Fix | "Replace in-memory storage with Redis using @upstash/redis" | **Tech stack break** | Task suggests adding Redis via `@upstash/redis` for rate limiting. README tech stack does not include Redis. README: "No separate proxy server is required." Redis implies a server-side dependency. |
| `architecture.md` | ARCH-3 Fix | "Create `src/services/ai-service.ts`" | **Tech stack break** | Task suggests creating a new service layer. README: "State Management: React Context API with `useReducer`" and "AI Integration: `@google/genai` for cloud providers, `@mlc-ai/webllm` for local models, custom AI router." Adding a service layer changes the documented architecture. |
| `observability.md` | OBS-16 Fix | "Create a health check endpoint at `/api/health`" | **Feature excluded** | Task suggests adding health check endpoint. README: "Cloud AI requests are routed through the built-in Next.js API route... No separate proxy server is required." A health check endpoint implies production monitoring infrastructure not described in README. |
| `observability.md` | OBS-17 Fix | "Integrate with an error tracking service like Sentry" | **Incompatible dependency** | Task suggests adding Sentry. README tech stack does not include Sentry or any error tracking service. This is a new dependency. |
| `game_design.md` | GAME-2 | "The README mentions 'story arcs' but the codebase lacks story arc tracking" | **Design contradiction (doc-vs-reality)** | Task states: "README mentions 'story arcs' but the codebase lacks story arc tracking." README: "All features below are **fully implemented in the codebase**." If story arcs are mentioned but not implemented, it's a doc-vs-reality mismatch. |
| `game_design.md` | GAME-12 | "Story Arcs are mentioned but not implemented" | **Design contradiction (doc-vs-reality)** | Same as GAME-2. Task says: "Some features listed in the README are partially complete. Story Arcs are mentioned but not implemented." Direct contradiction if README claims features are "fully implemented." |
| `bugs.md` | BUG-1 through BUG-N | Various bugs in features README claims are "fully implemented" | **Design contradiction (doc-vs-reality)** | README: "All features below are **fully implemented in the codebase**." Bug reports (e.g., BUG-1 Unhandled AbortError) suggest features have bugs, contradicting "fully implemented." This is a pattern across many bug tasks. |

---

## Removed Conflicts (Per User Request)

| File | Task ID | Reason for Removal |
|------|---------|-------------------|
| `persistence.md` | SAVE-2 | User does NOT want Firebase/Supabase cloud sync - removed from conflicts |
| `observability.md` | OBS-3 | User does NOT want OpenTelemetry/metrics collection - removed from conflicts |
| `security.md` | SEC-5 | Updated to support persistent API key storage (not removed) - removed from conflicts |
| `polish_ux.md` | POLISH-4 | User WANTS persistent API key storage UI in SettingsPanel - removed from conflicts |

---

## Summary

- **Total tasks scanned**: ~90+ tasks across 12 night task files
- **Total conflicts found**: **11 entries** in the table above
- **Patterns identified**:
  1. **Multiple tasks assume server-side infrastructure** (Redis, Sentry, health endpoints) — contradicts README's client-first, no-separate-server architecture.
  2. **Multiple tasks suggest adding dependencies** (IndexedDB, OpenTelemetry removed, Redis, Sentry) — not in README tech stack.
  3. **Several tasks contradict the "pure P2P WebRTC with no signalling server" design** (host migration, session discovery).
  4. **Doc-vs-reality mismatches**: Tasks flag missing features (story arcs) that README claims are "fully implemented."
  5. **API key storage**: User wants persistent storage per provider (updated README and SEC-5 accordingly).

---

## README Updates Completed

1. ✅ Removed `firebase.ts` reference from project structure (file doesn't exist)
2. ✅ Added explicit statement: "NO Firebase or external services are used for multiplayer"
3. ✅ Changed API key storage from "sessionStorage only" to "persistent storage per provider"
4. ✅ Updated Environment Variables section to reflect persistent storage model
5. ✅ Updated Usage section to mention Settings panel for key management

---

## Night Tasks Files Updated

1. ✅ `night_tasks/security.md` - Modified SEC-5 to support persistent per-provider API key storage
2. ✅ `night_tasks/persistence.md` - Removed SAVE-2 Firebase/Supabase suggestion
3. ✅ `night_tasks/observability.md` - Removed OBS-3 OpenTelemetry metrics collection