# Observability Audit Report

**Project:** Endless Tales  
**Date:** May 7, 2026  
**Scope:** Logging, Monitoring, and Observability

---

## Executive Summary

The Endless Tales project has a **structured logging infrastructure** in place with the custom `logger.ts` utility. The logger supports JSON output, log levels, sensitive data redaction, and request/trace ID correlation. It is widely adopted across the codebase (33 files). However, there are gaps in metrics collection, distributed tracing, and monitoring capabilities that need to be addressed for production readiness.

**Overall Observability Score: 6.5/10**
- ✅ Structured logging implemented
- ✅ Sensitive data redaction
- ✅ Log level control (dev vs production)
- ✅ Request ID correlation for AI calls
- ⚠️ No metrics collection/export
- ⚠️ No centralized error tracking
- ⚠️ No health check endpoint
- ⚠️ Inconsistent error handling in some catch blocks

---

## Detailed Findings

### OBS-1: Inconsistent Console.log Usage in UI Components
**Severity:** Medium  
**Description:** The `MainMenu.tsx` component uses `console.log` directly with `process.env.NODE_ENV` guards instead of using the structured logger. While this has basic protection, it bypasses the centralized logging system.
**Location:** `src/components/screens/MainMenu.tsx` (lines 32, 38, 57)  
**Impact:** Logs from this component won't appear in structured logs, making it harder to correlate user actions with system events.
**Fix:** Replace `console.log` with the structured `logger`.

---

### OBS-2: Duplicate Error Logging in ErrorBoundary
**Severity:** Low  
**Description:** The `ErrorBoundary.tsx` component logs the error via the structured logger but also outputs to `console.error` for developers. This creates duplicate log entries.
**Location:** `src/components/ErrorBoundary.tsx` (lines 31-34 and 51)  
**Impact:** Low - creates some noise in logs.
**Fix:** Remove the `console.error` on line 51 since the logger already captures this.

---

### OBS-3: No Centralized Metrics Collection
**Severity:** High  
**Description:** The application has no metrics collection system. There is no tracking of AI request latency, error rates, retry counts, multiplayer connection rates, or save/load performance.
**Location:** Project-wide  
**Impact:** Without metrics, it's impossible to identify performance degradation or track AI provider reliability.
**Fix:** Implement a metrics collection system (lightweight in-memory store to OpenTelemetry integration).

---

### OBS-4: AI API Calls Lack Structured Timing
**Severity:** Medium  
**Description:** While `ai-proxy/route.ts` captures `requestStartTime` and calculates `duration`, this data is only logged, not collected as a metric.
**Location:** `src/app/api/ai-proxy/route.ts` (lines 289, 308, 472, 675)  
**Impact:** Cannot track AI provider performance over time or identify slow providers.
**Fix:** Record AI request duration as a metric exported to a metrics endpoint.

---

### OBS-5: Streaming Responses Not Timed
**Severity:** Medium  
**Description:** Streaming AI responses don't have proper timing instrumentation. Cannot measure time-to-first-token or total streaming duration.
**Location:** `src/ai/ai-router.ts` (streaming methods)  
**Impact:** Cannot measure streaming performance.
**Fix:** Add timing for streaming with `firstTokenTime` and `totalDuration` tracking.

---

### OBS-6: Request ID Propagation Gaps
**Severity:** Medium  
**Description:** While `requestId` is well-propagated in AI calls, some code paths don't generate or propagate it properly.
**Location:** `src/ai/ai-router.ts` (WebLLM provider methods)  
**Impact:** Makes it harder to trace a request across the full stack.
**Fix:** Ensure `requestId` and `traceId` are always passed through all layers consistently.

---

### OBS-7: Trace ID Implementation Incomplete
**Severity:** Medium  
**Description:** The trace ID system uses `generateRequestId()` as a fallback, which means each request gets a new trace ID rather than related requests sharing one.
**Location:** `src/lib/logger.ts`, `src/app/api/ai-proxy/route.ts`  
**Impact:** Cannot trace a full user journey as a single trace.
**Fix:** Generate a proper trace ID at the start of user actions and consider adopting OpenTelemetry trace format.

---

### OBS-8: Sensitive Data Redaction Needs Testing
**Severity:** High  
**Description:** The `logger.ts` redaction system attempts to redact sensitive fields, but it only redacts known field names and there's no test coverage.
**Location:** `src/lib/logger.ts` (redactSensitiveData function)  
**Impact:** Sensitive data could be exposed in logs if the redaction fails.
**Fix:** Add unit tests for redaction and expand sensitive field patterns.

---

### OBS-9: Silent Error Ignorance in Stream Parsing
**Severity:** Medium  
**Description:** Multiple streaming implementations have `catch (e) { // ignore malformed JSON }` blocks. Silently ignoring errors makes debugging impossible.
**Location:** `src/ai/ai-router.ts` (multiple streaming methods)  
**Impact:** Malformed responses won't be logged.
**Fix:** Log the parsing failure at debug level with the chunk that failed to parse.

---

### OBS-10: AI Proxy Duration Not Exposed as Metric
**Severity:** Medium  
**Description:** The AI proxy calculates request duration but only logs it. This data isn't aggregated or exposed for monitoring.
**Location:** `src/app/api/ai-proxy/route.ts`  
**Impact:** Cannot monitor AI provider performance trends.
**Fix:** Integrate with metrics system and expose an endpoint for metrics scraping.

---

### OBS-11: No Retry Metrics
**Severity:** Low  
**Description:** The WebLLM module loading has retry logic but doesn't track retry attempts or success rates.
**Location:** `src/ai/ai-router.ts` (retryLoadModule function)  
**Impact:** Cannot determine if WebLLM loading issues are frequent.
**Fix:** Add metrics for retry operations.

---

### OBS-12: Multiplayer Event Logging Without Aggregation
**Severity:** Medium  
**Description:** Multiplayer events are logged individually but there's no aggregation of connection success rates or message throughput.
**Location:** `src/hooks/use-multiplayer.ts`  
**Impact:** Cannot assess multiplayer system health.
**Fix:** Add aggregated metrics for peer connections, disconnections, and reconnection attempts.

---

### OBS-13: Save/Load Operations Lack Performance Tracking
**Severity:** Medium  
**Description:** Save and load operations have error logging but no performance tracking.
**Location:** `src/lib/storage-utils.ts`, `src/context/GameContext.tsx`  
**Impact:** Cannot identify slow save operations.
**Fix:** Add timing to save/load operations and log warnings for slow operations (>1000ms).

---

### OBS-14: Debug-Level Logs Disabled in Production
**Severity:** Low  
**Description:** The dice roller uses `logger.debug()` which won't appear in production. Dice roll outcomes aren't auditable in production.
**Location:** `src/services/dice-roller.ts` (line 26)  
**Impact:** In production, dice rolls aren't logged for debugging.
**Fix:** Consider using `logger.info()` for dice rolls or make it configurable.

---

### OBS-15: LOG_LEVEL Environment Variable Not Documented
**Severity:** Low  
**Description:** The `logger.ts` checks `process.env.LOG_LEVEL` but this isn't documented in `.env.example` or README.
**Location:** `src/lib/logger.ts` (line 117), `.env.example`  
**Impact:** Developers don't know how to control log verbosity.
**Fix:** Add LOG_LEVEL documentation to `.env.example`.

---

### OBS-16: No Health Check Endpoint
**Severity:** High  
**Description:** There's no health check endpoint for monitoring system status. Critical for load balancer health checks and monitoring systems.
**Location:** Should be at `src/app/api/health/route.ts`  
**Impact:** Cannot monitor application health in production.
**Fix:** Create a health check endpoint at `/api/health`.

---

### OBS-17: No Error Tracking Service Integration
**Severity:** High  
**Description:** The application logs errors locally but doesn't integrate with any error tracking service (Sentry, Rollbar, etc.).
**Location:** Project-wide  
**Impact:** Errors in production aren't captured centrally.
**Fix:** Integrate with an error tracking service like Sentry.

---

### OBS-18: WebLLM Load Success/Failure Not Metrics-Tracked
**Severity:** Low  
**Description:** WebLLM loading attempts log failures but don't track success/failure rates as metrics.
**Location:** `src/ai/ai-router.ts` (WebLLM loading functions)  
**Impact:** Cannot monitor WebLLM reliability.
**Fix:** Add metrics tracking for module load attempts.

---

### OBS-19: Game Reducer Verbose Logging in Development
**Severity:** Low  
**Description:** The game reducer logs every action in development mode which could impact performance.
**Location:** `src/context/game-reducer.ts` (lines 95-98)  
**Impact:** Minor performance impact in development; very verbose logs.
**Fix:** Consider throttling or sampling high-frequency actions.

---

### OBS-20: No Alerting Mechanism
**Severity:** High  
**Description:** There's no mechanism to alert developers/operators about critical issues.
**Location:** Project-wide  
**Impact:** Issues may go unnoticed until users report them.
**Fix:** Implement alerting through error tracking service with alert rules and metrics system with threshold-based alerts.

---

## Summary Table

| ID | Title | Severity | Status |
|----|-------|----------|--------|
| OBS-1 | Inconsistent Console.log Usage | Medium | Open |
| OBS-2 | Duplicate Error Logging in ErrorBoundary | Low | Open |
| OBS-3 | No Centralized Metrics Collection | High | Open |
| OBS-4 | AI API Calls Lack Structured Timing | Medium | Open |
| OBS-5 | Streaming Responses Not Timed | Medium | Open |
| OBS-6 | Request ID Propagation Gaps | Medium | Open |
| OBS-7 | Trace ID Implementation Incomplete | Medium | Open |
| OBS-8 | Sensitive Data Redaction Needs Testing | High | Open |
| OBS-9 | Silent Error Ignorance in Stream Parsing | Medium | Open |
| OBS-10 | AI Proxy Duration Not Exposed as Metric | Medium | Open |
| OBS-11 | No Retry Metrics | Low | Open |
| OBS-12 | Multiplayer Event Logging Without Aggregation | Medium | Open |
| OBS-13 | Save/Load Operations Lack Performance Tracking | Medium | Open |
| OBS-14 | Debug-Level Logs Disabled in Production | Low | Open |
| OBS-15 | LOG_LEVEL Environment Variable Not Documented | Low | Open |
| OBS-16 | No Health Check Endpoint | High | Open |
| OBS-17 | No Error Tracking Service Integration | High | Open |
| OBS-18 | WebLLM Load Success/Failure Not Metrics-Tracked | Low | Open |
| OBS-19 | Game Reducer Verbose Logging in Development | Low | Open |
| OBS-20 | No Alerting Mechanism | High | Open |

---

## Recommendations by Priority

### High Priority (Address Immediately)
1. **OBS-16**: Implement health check endpoint
2. **OBS-17**: Integrate error tracking service (e.g., Sentry)
3. **OBS-3**: Implement basic metrics collection
4. **OBS-8**: Test and enhance sensitive data redaction

### Medium Priority (Address in Next Sprint)
5. **OBS-4**: Add structured timing to AI API calls
6. **OBS-5**: Time streaming responses
7. **OBS-6/OBS-7**: Improve request/trace ID propagation
8. **OBS-12**: Add multiplayer event aggregation
9. **OBS-13**: Add save/load performance tracking
10. **OBS-9**: Stop ignoring errors silently

### Low Priority (Backlog)
11. **OBS-1**: Replace remaining console.log usage
12. **OBS-2**: Clean up duplicate error logging
13. **OBS-11/OBS-18**: Add retry metrics
14. **OBS-14**: Review debug logging strategy
15. **OBS-15**: Document LOG_LEVEL configuration
16. **OBS-19**: Optimize reducer logging

---

## Conclusion

The Endless Tales project has a solid foundation for observability with its structured logging system. However, to achieve production readiness, the project needs:

1. **Metrics collection** to track performance and error rates
2. **Error tracking integration** for centralized error management
3. **Health check endpoint** for monitoring systems
4. **Enhanced testing** of sensitive data redaction

The recommended approach is to start with High Priority items, focusing on the health endpoint and error tracking integration, then build out the metrics system incrementally.

---

*Report generated on May 7, 2026*  
*Next review recommended: After implementing High Priority fixes*
