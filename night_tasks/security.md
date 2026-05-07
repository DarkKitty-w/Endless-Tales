## Detailed Findings

### SEC-1: Invalid Next.js Version in package.json
**Severity:** High  
**Description:** The project specifies `"next": "^16.2.5"` in package.json, which is an invalid version (Next.js has not reached v16 as of this review). This is likely a typo, but could lead to installation failures or accidental use of untrusted packages if a malicious v16 release is published to npm.  
**Location:** `/workspaces/Endless-Tales/package.json`, line 47  
**Risk:** Broken builds, supply chain attacks if a malicious Next.js v16 package is published, or dependency confusion.  
**Mitigation:** Correct the version to a valid Next.js release (e.g., `^14.2.5` or `^15.x` depending on project requirements).

### SEC-2: Raw AI API Responses Exposed to Client on Parse Failure
**Severity:** Medium  
**Description:** When the AI proxy fails to parse AI provider responses as JSON, it returns the first 1000 characters of the raw response to the client. This could expose sensitive information from provider error messages (e.g., API key snippets, internal paths, or account details).  
**Location:** `/workspaces/Endless-Tales/src/app/api/ai-proxy/route.ts`:
- Lines 397-403 (Gemini handler)
- Lines 564-571 (OpenAI-compatible handler)
- Lines 774-783 (Claude handler)  
**Risk:** Information leakage of sensitive provider response data to end users.  
**Mitigation:** Remove the `rawResponse` field from client-facing error responses. Log raw responses server-side only with appropriate redaction of sensitive data.

### SEC-3: In-Memory Rate Limiting Insufficient for Production
**Severity:** Medium  
**Description:** The rate limiting implementation uses an in-memory `Map` that is reset on server restart and does not work across multiple server instances. This allows attackers to bypass rate limits by triggering server restarts or targeting different instances in a load-balanced deployment.  
**Location:** `/workspaces/Endless-Tales/src/lib/rate-limit.ts`, lines 4-63  
**Risk:** Rate limit bypass leading to AI API quota exhaustion, denial of service, or cost overruns from abusive requests.  
**Mitigation:** Replace in-memory storage with Redis using the already-included `@upstash/redis` dependency for distributed, persistent rate limiting.

### SEC-4: No Prompt Injection Protection in AI Proxy
**Severity:** Medium  
**Description:** The AI proxy passes user-provided `contents` directly to AI providers without sanitization or prompt injection guards. Malicious users could inject prompts to manipulate AI output, leak conversational context, or execute unauthorized actions (especially risky in multiplayer where guest inputs are processed by the host's AI).  
**Location:** `/workspaces/Endless-Tales/src/app/api/ai-proxy/route.ts`, lines 168-184 (provider handler switch)  
**Risk:** Prompt injection attacks leading to manipulated game narratives, leaked user data, or unauthorized AI behavior.  
**Mitigation:** Implement input sanitization for user-provided contents, add system prompt guards to prevent instruction override, and enforce length/format constraints on user input.

### SEC-5: Update API Key Storage to Persistent Per-Provider Model
**Severity:** Medium  
**Description:** The project currently has deprecated `userGoogleAiApiKey` state and references to old key storage patterns. Per the updated README, API keys should now be stored persistently per provider in browser storage (not session-only). The Settings panel needs UI for users to enter and save API keys for each cloud provider (Gemini, OpenAI, Claude, DeepSeek, OpenRouter).  
**Location:**
- `/workspaces/Endless-Tales/src/lib/constants.ts`, line 29
- `/workspaces/Endless-Tales/src/context/GameContext.tsx` (multiple references to `userGoogleAiApiKey`)
- `/workspaces/Endless-Tales/src/context/reducers/settingsReducer.ts`, line 87  
- `/workspaces/Endless-Tales/src/components/screens/SettingsPanel.tsx` (needs API key input fields per provider)
**Risk:** Confusing UX if users cannot save their API keys persistently across sessions.  
**Mitigation:** Implement per-provider API key storage in Settings panel with option to save keys in browser storage. Update state management to support multiple provider keys. Remove deprecated single-key state in favor of new per-provider model.


### SEC-6: WebRTC Signalling SDP Validation Missing Length Limits
**Severity:** Low  
**Description:** The WebRTC signalling validation checks that SDP strings are non-empty and start with valid markers, but does not enforce a maximum length. A crafted oversized SDP string could cause memory exhaustion or denial of service when processed by the WebRTC stack.  
**Location:** `/workspaces/Endless-Tales/src/lib/webrtc-signalling.ts`, lines 85-92  
**Risk:** Denial of service via crafted oversized SDP payloads in invite codes.  
**Mitigation:** Add a maximum SDP length check (e.g., 50KB, matching the existing JSON size limit in `encodeSignallingData`).

### SEC-7: No XSS Vulnerabilities Found
**Severity:** Info  
**Description:** No instances of `dangerouslySetInnerHTML` or direct `innerHTML` usage were found in client-side code. React's default JSX escaping properly protects against XSS for user-provided text (actions, chat, character names) rendered in components.  
**Location:** N/A  
**Risk:** None identified.  
**Mitigation:** Maintain current practice of avoiding dangerous DOM manipulation methods and always rendering user input via JSX rather than direct HTML injection.

### SEC-8: LocalStorage Contains No Sensitive Data
**Severity:** Info  
**Description:** LocalStorage is used only for non-sensitive data: adventure saves, theme preferences, and AI provider selection. API keys are confirmed to be server-side only (via environment variables) and not persisted to client-side storage.  
**Location:** `/workspaces/Endless-Tales/src/context/GameContext.tsx`, lines 432-513 (localStorage write logic)  
**Risk:** None identified.  
**Mitigation:** Continue excluding sensitive data (keys, tokens, personal information) from client-side storage.

### SEC-9: Error Messages Properly Sanitized for Clients
**Severity:** Info  
**Description:** Generic error messages are returned to clients for unhandled exceptions, with detailed error context logged server-side only. This prevents exposure of internal paths, API keys, or stack traces to end users.  
**Location:** `/workspaces/Endless-Tales/src/app/api/ai-proxy/route.ts`, lines 226-230  
**Risk:** None identified.  
**Mitigation:** Continue current practice of sanitizing client-facing error messages and logging detailed errors server-side.

