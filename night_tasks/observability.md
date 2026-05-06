## Detailed Findings

### OBS-1: Unstructured Main Logger
**Severity:** High  
**Description:** The project's centralized logger (`src/lib/logger.ts`) passes raw arguments directly to console methods without adding structured context. Logs are unstructured strings/args with no timestamp, module identification, severity metadata, or consistent formatting.  
**Location:** `src/lib/logger.ts`, lines 27-51 (all logger method implementations)  
**Impact:** Eliminates ability to aggregate, filter, or analyze logs. Missing context (e.g., source module, timestamp) makes debugging time-consuming, especially in production.  
**Fix:** Refactor logger to output structured JSON logs with mandatory fields: `timestamp` (ISO 8601), `severity`, `module`, `message`, `context`. Use a consistent format across all log calls.

### OBS-2: Logger Not Adopted (Direct console.log/error/warn Everywhere)
**Severity:** High  
**Description:** The centralized logger is entirely unused. All logging is done via direct `console.log/error/warn` statements scattered throughout the codebase. There's no consistent logging approach.  
**Location:** All files using `console.log`, `console.error`, `console.warn` directly (search for these patterns)  
**Impact:** Cannot enforce log formatting, cannot redirect logs, cannot filter by module or severity. Makes production debugging extremely difficult.  
**Fix:** Replace all direct `console` calls with the logger. Add ESLint rule to disallow direct console usage (except in logger itself).

### OBS-3: No Timestamps in Logs
**Severity:** Medium  
**Description:** Log entries don't include timestamps. When debugging issues, developers can't correlate events across different parts of the system.  
**Location:** `src/lib/logger.ts` (no timestamp added), all console.log calls  
**Impact:** Difficult to reconstruct event timelines. In production, can't correlate user actions with system responses.  
**Fix:** Add ISO 8601 timestamp to every log entry in the logger. Ensure it's included in both development and production.

### OBS-4: No Module/Source Identification
**Severity:** Medium  
**Description:** Log entries don't identify which module or file generated them. Developers must guess the source based on the message content.  
**Location:** `src/lib/logger.ts` (no module parameter), all direct console calls  
**Impact:** Time-consuming debugging. Can't filter logs by feature or component.  
**Fix:** Add `module` field to logger. Accept module name as parameter or infer from stack trace. Include in all log output.

### OBS-5: Inconsistent Environment Gating
**Severity:** Medium  
**Description:** Log filtering is based solely on `NODE_ENV`: development allows all non-error logs, production only allows errors. There's no granular control.  
**Location:** `src/lib/logger.ts` (lines 19-25, `shouldLog` function)  
**Impact:** Cannot enable debug logs in production for troubleshooting. Cannot reduce log noise in development.  
**Fix:** Implement configurable log levels via environment variable (e.g., `LOG_LEVEL=debug`). Support: debug < info < log < warn < error hierarchy.

### OBS-6: No Request/Correlation ID Generation or Propagation
**Severity:** High  
**Description:** The codebase does not generate or propagate any unique request identifiers. When a user action triggers an AI request, there's no way to trace that specific request across the UI component, API route, and external AI provider.  
**Location:** `src/components/gameplay/NarrationDisplay.tsx`, `src/ai/ai-router.ts`, `src/app/api/ai-proxy/route.ts`  
**Impact:** Developers cannot correlate user-reported errors with specific log entries. Debugging production issues requires guessing based on timestamps.  
**Fix:** Generate a unique `requestId` (UUID) at the start of each user action. Pass it through: UI → API route → AI provider. Include in all related log entries.

### OBS-7: Errors Not Traceable Across UI → Server → AI
**Severity:** High  
**Description:** Errors are logged independently at each layer without correlation. An error in the AI provider has no link to the UI action that triggered it.  
**Location:** `src/lib/logger.ts` (no correlation support), `src/ai/ai-router.ts` (error handling), `src/app/api/ai-proxy/route.ts` (error handling)  
**Impact:** Cannot trace the full error path. Developers see "AI request failed" but can't tell which user action caused it or what the input was.  
**Fix:** Implement distributed tracing: generate traceId at entry point, propagate through context. Log the traceId with every related log entry.

### OBS-8: No Distributed Tracing
**Severity:** Medium  
**Description:** There's no distributed tracing mechanism. The app doesn't use OpenTelemetry, tracing headers, or any tracing framework.  
**Location:** Entire codebase  
**Impact:** Cannot visualize request flows. Cannot measure time spent in each system component.  
**Fix:** Integrate OpenTelemetry or similar tracing framework. Instrument key paths: AI calls, API routes, multiplayer events. Export traces to a collector for analysis.

### OBS-9: Cannot Reproduce Failures from Logs
**Severity:** High  
**Description:** Logs don't include enough context to reproduce failures. Error messages lack input parameters, system state, or steps to reproduce.  
**Location:** `src/ai/ai-router.ts` (error handling), `src/lib/logger.ts`  
**Impact:** Developers can't reproduce bugs from log entries alone. Must ask users for steps to reproduce, causing delays.  
**Fix:** Include context in error logs: input parameters, relevant state, timestamp, user action. Log before/after state for critical operations.

### OBS-10: Missing AI API Request/Response Logs for Cloud Providers
**Severity:** High  
**Description:** Cloud-based AI providers (Gemini, OpenAI, Claude, DeepSeek, OpenRouter) do not log outgoing request details (model, prompt length, config) or incoming response details (status, duration, extracted text length). API errors are thrown without logging context.  
**Location:** `src/ai/ai-router.ts` - `generateContent` and `generateContentStream` methods of all providers  
**Impact:** Critical for debugging API failures, latency issues, or incorrect responses. No visibility into data sent to/received from AI providers.  
**Fix:** Add structured logs for each API call: log request parameters (masking API keys), response status, duration, token usage. Log errors with full context before throwing.

### OBS-11: Missing Multiplayer Event Logs
**Severity:** High  
**Description:** Multiplayer events (connect, disconnect, state sync, ICE candidates) are not logged. When connection issues occur, there's no trail to follow.  
**Location:** `src/hooks/use-multiplayer.ts`, `src/lib/webrtc-signalling.ts`  
**Impact:** Cannot diagnose connection issues. Don't know if a peer disconnected gracefully or due to error. No visibility into WebRTC negotiation.  
**Fix:** Add structured logs for all multiplayer events: connection state changes, data channel state, ICE candidate exchange, state synchronization. Include peer IDs and session context.

### OBS-12: Missing Save/Load Operation Logs
**Severity:** High  
**Description:** Save and load operations are not logged. When saves fail or load incorrectly, there's no record of what was attempted.  
**Location:** `src/context/GameContext.tsx` (save/load functions), `src/context/reducers/adventureReducer.ts`  
**Impact:** Cannot diagnose save/load failures. Don't know if corruption is during write or read. No audit trail for data loss incidents.  
**Fix:** Log all save/load operations: adventure ID, timestamp, success/failure, data size, validation results. Log corruption detection and recovery attempts.

### OBS-13: Missing WebRTC Signaling Logs
**Severity:** Medium  
**Description:** WebRTC signaling events (offer/answer creation, ICE candidate processing) are not logged. Debugging connection failures is extremely difficult.  
**Location:** `src/lib/webrtc-signalling.ts` (signaling functions)  
**Impact:** Cannot diagnose why connections fail. Don't know if offers/answers are malformed or if ICE candidates are invalid.  
**Fix:** Add logs for: offer/answer creation, SDP content (truncated), ICE candidate addition, connection state changes. Include error context for failed operations.

### OBS-14: Missing Error Context in Catch Blocks
**Severity:** Medium  
**Description:** Many catch blocks simply log the error without additional context. Developers don't know what operation failed or what the inputs were.  
**Location:** Multiple files with try/catch blocks  
**Impact:** Error logs say "Something failed" without saying what was being attempted. Wastes time investigating root causes.  
**Fix:** In catch blocks, log the operation being attempted, input parameters, and relevant state along with the error. Use structured logging with context object.

### OBS-15: API Keys Potentially Logged in Requests
**Severity:** Critical  
**Description:** The logger and console.log statements may inadvertently log API keys. The AI router logs requests but may include the full configuration object containing API keys.  
**Location:** `src/ai/ai-router.ts` (request logging), `src/lib/logger.ts` (no redaction)  
**Impact:** API keys could be exposed in logs, which may be stored in plain text or accessible to unauthorized users. Security risk.  
**Fix:** Implement field redaction in logger: automatically mask API keys, passwords, tokens. Use patterns to detect and redact sensitive data before logging.

### OBS-16: User Inputs Not Sanitized Before Logging
**Severity:** High  
**Description:** User inputs (player actions, chat messages) may be logged directly without sanitization. This could include PII, malicious content, or excessively long strings.  
**Location:** `src/lib/logger.ts` (no input sanitization), `src/components/gameplay/ActionInput.tsx` (potential logging)  
**Impact:** Logs may contain sensitive user data. Malicious users could inject log injection attacks (e.g., newline characters to forge log entries).  
**Fix:** Sanitize log inputs: truncate long strings, escape special characters, remove PII patterns (emails, phone numbers). Validate before logging.

### OBS-17: Client-Side Logs Accessible to Users
**Severity:** Medium  
**Description:** Since this is a client-side React app, all "logs" (console output) are accessible to users via browser DevTools. Sensitive information logged to console is visible.  
**Location:** All `console.log/error` calls in the codebase  
**Impact:** Users can see internal state, error details, and potentially sensitive data via DevTools console.  
**Fix:** In production builds, disable all non-essential logging. Use a logger that respects environment and only logs critical errors to console in production.

### OBS-18: No Redaction of Sensitive Fields
**Severity:** High  
**Description:** The logger doesn't redact sensitive fields in objects being logged. If an object contains `apiKey`, `password`, `token`, etc., these are logged in plain text.  
**Location:** `src/lib/logger.ts` (no redaction logic)  
**Impact:** Sensitive data exposed in logs. If logs are stored or transmitted, this is a security breach.  
**Fix:** Implement automatic redaction: before logging any object, recursively walk and redact fields matching sensitive patterns (apiKey, password, token, secret, authorization).

### OBS-19: Basic Log Level Control Missing Granular Configuration
**Severity:** Medium  
**Description:** The logger defines a `LogLevel` type but does not implement severity-based filtering. Logging is controlled solely by `NODE_ENV`. There's no support for configuring a log level via environment variable.  
**Location:** `src/lib/logger.ts` (lines 6, 19-25)  
**Impact:** Developers cannot adjust log verbosity (e.g., enable debug logs in production for troubleshooting, or reduce log noise in development).  
**Fix:** Add configurable log level (e.g., via `LOG_LEVEL` env var) with hierarchy (debug < info < log < warn < error). Update `shouldLog` to only allow messages at or above the configured level.

### OBS-20: No Support for Enabling/Disabling Specific Log Categories
**Severity:** Medium  
**Description:** There's no log category system. Cannot enable/disable logs for specific features (e.g., "enable AI logs but disable multiplayer logs").  
**Location:** `src/lib/logger.ts` (no category support)  
**Impact:** Log noise cannot be reduced. When debugging AI issues, multiplayer logs create noise and vice versa.  
**Fix:** Add category support to logger: `logger.info("message", { category: "AI" })`. Allow enabling/disabling categories via config.

### OBS-21: No Metrics (Latency, Error Rates, Retries)
**Severity:** High  
**Description:** The app doesn't collect or expose any metrics. No tracking of API latency, error rates, retry attempts, or success rates.  
**Location:** `src/ai/ai-router.ts` (no metrics), `src/hooks/use-multiplayer.ts` (no metrics)  
**Impact:** Cannot identify performance degradation. Don't know if AI provider is slowing down. No data to make infrastructure decisions.  
**Fix:** Implement metrics collection: track API call duration, success/error counts, retry counts. Expose metrics via a `/metrics` endpoint or send to a metrics service.

### OBS-22: No Performance Monitoring
**Severity:** Medium  
**Description:** There's no performance monitoring. No tracking of component render times, AI response times, or multiplayer latency.  
**Location:** `src/components/`, `src/ai/`, `src/hooks/`  
**Impact:** Cannot identify performance bottlenecks. Users may experience slowness without developers knowing.  
**Fix:** Add performance marks/measures for critical paths. Use React DevTools profiler in development. Consider integrating a performance monitoring service.

### OBS-23: Debuggability Issues (Cannot Reproduce Failures)
**Severity:** High  
**Description:** When failures occur, there's insufficient information to reproduce them. Logs don't include the sequence of events, state snapshots, or user actions leading up to the failure.  
**Location:** `src/lib/logger.ts`, all error handling code  
**Impact:** Developers cannot reproduce bugs from logs. Must rely on user reports and guesswork. Increases time to resolution.  
**Fix:** Implement debug mode: log state before/after critical operations. Log user action history. Include stack traces for errors. Consider session replay for critical failures.