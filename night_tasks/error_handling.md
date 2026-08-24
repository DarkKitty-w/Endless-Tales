## Objective: Build resilience against failures
**Investigation:** Review all network requests, file operations, and external service calls. Identify what happens when these operations fail (network offline, server error, invalid response).
**Action:** Implement graceful fallbacks. Add user-friendly error messages that guide the user on what to do next. Ensure the application state remains consistent even when an operation fails. Do not display raw technical stack traces to the end-user.
