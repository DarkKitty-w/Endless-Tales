## Detailed Findings

SEC-1: API Keys Transmitted from Client to Server in Request Body
Severity: High
Description: The client-side AI providers (Gemini, OpenAI, Claude, DeepSeek, OpenRouter) explicitly send API keys in the request body to the /api/ai-proxy route via fetch calls. API keys are present in client-side JavaScript memory, traverse the network (visible in browser DevTools Network tab), and are embedded in the request JSON body.
Location: src/ai/ai-router.ts (lines 143, 184, 283, 322, 422, 462, 563, 602, 702, 742); src/app/api/ai-proxy/route.ts (line 9)
Risk: API keys can be intercepted via network sniffing (if not using HTTPS), extracted from browser memory, or exposed in browser DevTools. Compromised keys can lead to quota theft or unauthorized API access.
Mitigation: Store user-provided API keys server-side (encrypted database, HTTP-only cookies, or server-side session). Have the client send only a session reference or key ID. Use environment variables for server-side keys.

SEC-2: API Keys Stored in sessionStorage in Plain Text
Severity: High
Description: API keys are stored in sessionStorage without encryption, making them accessible to any JavaScript running on the origin. While sessionStorage is cleared when the tab closes, keys remain exposed during the session.
Location: src/context/GameContext.tsx (sessionStorage usage for API keys)
Risk: Any XSS vulnerability or malicious script on the origin can access and exfiltrate API keys from sessionStorage.
Mitigation: Encrypt API keys before storing in sessionStorage, or better yet, avoid client-side storage entirely and use server-side session management.

SEC-3: Sensitive Error Message Exposure in AI Proxy
Severity: High
Description: Error responses from the AI proxy may leak internal details such as API keys, internal server paths, or provider error details that should not be exposed to clients.
Location: src/app/api/ai-proxy/route.ts (error handling sections)
Risk: Attackers can gain intelligence about internal infrastructure, API keys, or use error messages to craft more targeted attacks.
Mitigation: Sanitize all error messages sent to clients. Log detailed errors server-side only, and return generic error messages to clients (e.g., "AI request failed" instead of provider error details).

SEC-4: Missing Rate Limiting on AI Proxy
Severity: High
Description: The /api/ai-proxy POST endpoint has no rate limiting mechanisms. Unthrottled requests allow abuse including excessive API quota consumption, denial of service, and brute force attacks.
Location: src/app/api/ai-proxy/route.ts (entire POST handler, no rate limiting logic present)
Risk: Attackers can exhaust API quotas, incur unexpected costs, or overwhelm the server with requests.
Mitigation: Implement IP-based or session-based rate limiting using a library like @upstash/ratelimit or next-rate-limiter. Configure limits such as 10 requests per minute per IP.

SEC-5: Missing Input Validation on AI Proxy
Severity: High
Description: All request body parameters (provider, model, messages, apiKey, etc.) are used without validation. The proxy does not verify that required fields are present, that provider is a valid value, or that message content is within expected bounds.
Location: src/app/api/ai-proxy/route.ts (POST handler, no input validation)
Risk: Malformed requests can cause unexpected errors, crashes, or be used to probe the system for vulnerabilities.
Mitigation: Validate all input parameters using a schema validation library like Zod. Check for required fields, valid enum values, and reasonable string lengths.

SEC-6: No Protection Against Prompt Injection
Severity: High
Description: User input (actions, chat messages) is sent directly to AI providers without sanitization or injection protection. Malicious users can attempt prompt injection attacks to override system instructions or extract sensitive information.
Location: src/ai/ai-router.ts (user input passed directly to AI); src/lib/utils.ts (sanitizePlayerAction only escapes < and >)
Risk: Attackers can manipulate AI behavior, bypass safety guards, or extract system prompts and internal instructions.
Mitigation: Implement prompt injection detection and sanitization. Wrap user input in clear delimiters and add system instructions to ignore injected prompts. Consider using a dedicated prompt injection protection library.

SEC-7: Insufficient Input Validation in decodeSignallingData
Severity: High
Description: The decodeSignallingData function performs only basic existence checks on the decoded object (sdp, type, peerInfo). It does not validate that type is 'offer' or 'answer', validate peerInfo structure, validate SDP format, verify iceCandidates is an array, or limit input size.
Location: src/lib/webrtc-signalling.ts (lines 37-49)
Risk: Crafted invite codes/offers can crash the parser, cause runtime errors, or potentially leak data through malformed payloads.
Mitigation: Add comprehensive validation: check type is valid enum value, validate peerInfo has required fields, limit input string size, verify decoded JSON matches expected schema.

SEC-8: Insufficient Input Sanitization in sanitizePlayerAction
Severity: Medium
Description: The sanitizePlayerAction function only escapes < and > characters using simple string replacement. It does not handle other dangerous characters or patterns. While React's JSX escaping provides primary XSS protection, this function would not prevent XSS if output were used in a non-JSX context.
Location: src/lib/utils.ts (lines 29-57)
Risk: If sanitized content is ever used with dangerouslySetInnerHTML or similar, XSS is still possible. Limited protection against advanced injection.
Mitigation: Use a proper sanitization library like DOMPurify if HTML output is needed. For React JSX, rely on built-in escaping and remove the false sense of security from weak sanitization.

SEC-9: No Sanitization of AI-Generated Content Before Rendering
Severity: Medium
Description: AI-generated content (narrations, character descriptions) is rendered without sanitization. If an AI is compromised or returns malicious content, it could contain scripts or dangerous HTML.
Location: src/components/gameplay/NarrationDisplay.tsx and other components rendering AI content
Risk: If AI is compromised or returns unexpected content, malicious scripts could be executed. Also, if dangerouslySetInnerHTML is ever used, XSS is possible.
Mitigation: Sanitize all AI-generated content before rendering. Use DOMPurify or similar library. Avoid dangerouslySetInnerHTML entirely; use React's built-in escaping.

SEC-10: No Size Limits on Signalling Data
Severity: Medium
Description: The decodeSignallingData function does not limit the size of the input string or decoded JSON. Extremely large payloads could cause memory exhaustion or slow parsing.
Location: src/lib/webrtc-signalling.ts (decodeSignallingData function)
Risk: Denial of service through large payloads causing memory exhaustion or parser slowdown.
Mitigation: Add size limits to input strings (e.g., max 50KB for SDP + metadata). Reject oversized payloads before processing.

SEC-11: Vulnerable to Model Parameter Injection
Severity: Medium
Description: The AI proxy passes model parameters (temperature, maxTokens, etc.) directly from the request body to AI providers without validation. Attackers can inject extreme values or unexpected parameters.
Location: src/app/api/ai-proxy/route.ts (model parameter handling)
Risk: Attackers can manipulate AI behavior by injecting parameters, cause excessive resource usage, or trigger provider errors.
Mitigation: Validate and sanitize all model parameters. Use a schema to enforce reasonable ranges (e.g., temperature 0-2, maxTokens reasonable limits).

SEC-12: Outdated Legacy Dependencies
Severity: Low
Description: The project uses several outdated or legacy dependencies: lodash 4.18.1 (no longer actively maintained), @mlc-ai/web-llm 0.2.82 (pre-1.0 with limited security support), Radix UI packages pinned to ^1.x (may have unpatched vulnerabilities).
Location: package.json (lines 15, 41, 16-35)
Risk: Known vulnerabilities in dependencies may be exploitable. Legacy packages may lack security updates.
Mitigation: Audit lodash usage and migrate to lodash 5.x if compatible. Pin @mlc-ai/web-llm to a specific stable version and monitor security advisories. Update Radix UI packages to latest stable 2.x releases.