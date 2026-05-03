## Security

### SEC-1: API Keys Stored in Plain Text in sessionStorage
**Severity:** High  
**Description:** The user's API keys (Google AI, and other providers) are stored in sessionStorage in plain text without any encryption. If an attacker gains access to the user's browser (via XSS or local access), they can extract the API keys.
**Location:** `src/context/GameContext.tsx`, lines 109-112, 122-129, 169-172, 182-185
**Root Cause:** API keys are stored directly in sessionStorage without encryption
**Reproduction Steps:**
1. Enter API keys in Settings
2. Open browser DevTools -> Application -> Session Storage
3. Keys are visible in plain text (keys: `userGoogleAiApiKey`, `endlessTales_providerApiKeys`)

**Fix:** Consider encrypting sensitive data before storing, or use a more secure storage mechanism. At minimum, warn users that keys are stored locally.

---

### SEC-2: AI Proxy Route Lacks Rate Limiting and Input Validation
**Severity:** High  
**Description:** The `/api/ai-proxy` route has no rate limiting, allowing potential abuse. It also doesn't validate the incoming request body beyond checking for API key presence. A malicious user could:
1. Send unlimited requests (costing the user money if using server-side keys)
2. Attempt prompt injection attacks by crafting special inputs
3. Send malformed requests that could crash the server

**Location:** `src/app/api/ai-proxy/route.ts`, lines 1-54
**Root Cause:** No rate limiting middleware, no input sanitization/validation beyond basic checks
**Reproduction Steps:**
1. Send many rapid requests to `/api/ai-proxy`
2. Observe no rate limit errors
3. Try sending malformed JSON or oversized payloads

**Fix:**
1. Add rate limiting (e.g., using `express-rate-limit` or Vercel Edge middleware)
2. Validate and sanitize all input parameters
3. Set maximum payload size limits
4. Consider adding CORS headers if the API should only be called from the same origin

---

### SEC-3: Crafted Signalling String Can Cause Parser Issues
**Severity:** Medium  
**Description:** The `decodeSignallingData` function in `webrtc-signalling.ts` doesn't properly validate the input base64 string before decoding. A malformed base64 string, extremely large payload, or crafted JSON could cause:
1. `atob()` to throw exceptions
2. `JSON.parse()` to throw on malformed JSON
3. Potential DoS via very large payloads (no size limit)

**Location:** `src/lib/webrtc-signalling.ts`, lines 31-43
**Root Cause:** Minimal validation - only checks for existence of `sdp`, `type`, and `peerInfo` fields
**Reproduction Steps:**
1. Create a crafted base64 string with malformed JSON
2. Try to join a session with it
3. The app may crash or show unhandled errors

**Fix:**
1. Validate base64 format before decoding
2. Add JSON schema validation for the decoded object
3. Add size limits for the input string (e.g., max 100KB)
4. Wrap parsing in try-catch and return user-friendly errors

---

### SEC-4: Error Messages May Expose Internal Paths or API Keys
**Severity:** Medium  
**Description:** Error responses from the AI proxy route include the raw error message from the AI provider, which may contain:
1. Internal API endpoint paths
2. Account identifiers
3. Detailed stack traces in development mode

**Location:** `src/app/api/ai-proxy/route.ts`, lines 47-53, 196-202, 336-342
**Root Cause:** Error messages are passed through directly without sanitization
**Reproduction Steps:**
1. Trigger an error from the AI provider (e.g., invalid API key)
2. Check the response - it may contain internal details
3. In development mode, stack traces may be exposed

**Fix:**
1. Sanitize error messages before returning to client
2. Use generic error messages for production
3. Log detailed errors server-side only, return generic messages to client

---

### SEC-5: No XSS Protection for User-Provided Text Rendering
**Severity:** Low (Protected by React)  
**Description:** The application uses React's built-in JSX escaping which automatically sanitizes user input rendered in components. However, one low-severity display bug was found: the `sanitizePlayerAction` function in `src/lib/utils.ts` uses simple regex replacement that may not catch all XSS vectors.
**Location:** `src/lib/utils.ts`, `src/ai/flows/narrate-adventure.ts`
**Root Cause:** React's automatic escaping protects against most XSS, but the custom sanitization function may be incomplete
**Reproduction Steps:**
1. Try entering script tags in player actions or chat messages
2. React escapes them properly - no XSS vulnerability found
3. However, the sanitize function could be more robust

**Fix:** The app is protected by React's built-in escaping. To improve:
1. Use a proper sanitization library like `DOMPurify` if HTML needs to be rendered
2. Strengthen the `sanitizePlayerAction` function

---

### SEC-6: Dependencies with Known Vulnerabilities
**Severity:** High  
**Description:** `npm audit` reveals **8 vulnerabilities** (4 high, 4 moderate):

| Package | Severity | Vulnerability | CVSS |
|---------|----------|---------------|----------|
| `brace-expansion` (2.0.0-2.0.2) | Moderate | ReDoS & process hang via zero-step sequence | 6.5 |
| `glob` (10.2.0-10.4.5) | High | Command injection via `-c/--cmd` flag | 7.5 (CWE-78) |
| `jws` (4.0.0) | High | Improper HMAC signature verification | 7.5 (CWE-347) |
| `minimatch` (9.0.0-9.0.6) | High | Multiple ReDoS vulnerabilities | 7.5 (CWE-1333, CWE-407) |
| `postcss` (<8.5.10) | Moderate | XSS via unescaped `</style>` in CSS output | 6.1 (CWE-79) |
| `picomatch` (<=2.3.1) | High | Method injection in POSIX character classes | 7.5 |

**Location:** `package.json` - dependency versions
**Root Cause:** Outdated packages with known CVEs
**Reproduction Steps:**
1. Run `npm audit` in the project directory
2. See 8 vulnerabilities listed

**Fix:** Run `npm audit fix` to resolve most issues, then manually update packages that can't be auto-fixed:
```bash
npm audit fix
npm update postcss glob minimatch picomatch jws brace-expansion
```

---

### SEC-7: WebRTC ICE Candidates Not Validated Before Adding
**Severity:** Medium  
**Description:** In `applyAnswer()` and `createAnswer()`, ICE candidates from the remote peer are added directly via `pc.addIceCandidate(candidate)` without validation. A malicious peer could send crafted ICE candidate objects.
**Location:** `src/lib/webrtc-signalling.ts`, lines 146-148, 182-185
**Root Cause:** No validation of ICE candidate structure before adding
**Reproduction Steps:**
1. A malicious peer could send crafted signalling data with invalid ICE candidates
2. The app adds them without validation

**Fix:** Validate ICE candidate objects before adding:
```typescript
for (const candidate of pkg.iceCandidates) {
  // Validate candidate structure
  if (!candidate || typeof candidate !== 'object' || !candidate.candidate || !candidate.sdpMLineIndex) {
    console.warn('Invalid ICE candidate received, skipping');
    continue;
  }
  try {
    await pc.addIceCandidate(candidate);
  } catch (e) {
    console.warn('Failed to add ICE candidate:', e);
  }
}
```

---

### SEC-8: No Authentication on Multiplayer Sessions
**Severity:** Medium  
**Description:** The WebRTC signalling mechanism (QR code / invite code) is essentially a shared secret. Anyone with the code can join the session. There's no additional authentication:
1. No user identity verification beyond the name they provide
2. No ability to kick/ban malicious users (kick only works for the host, and only disconnects)
3. No encryption of signalling data beyond what WebRTC provides

**Location:** `src/lib/webrtc-signalling.ts`, `src/hooks/use-multiplayer.ts`
**Root Cause:** Design choice - simplicity over security for P2P connections
**Reproduction Steps:**
1. Share an invite code
2. Anyone with the code can join, even unintended recipients

**Fix:** For a P2P game, this may be acceptable. To improve:
1. Add a session password option
2. Implement a "allow list" for known players
3. Add warnings about sharing invite codes

---

### SEC-9: AI Proxy Exposes API Key Configuration in Error Messages
**Severity:** Low  
**Description:** When an API request fails, the error message may reveal which provider was being used and details about the API configuration. In some cases, if the server-side API key is missing, the error message says "Gemini API key not configured" which reveals the expected key name.
**Location:** `src/app/api/ai-proxy/route.ts`, lines 14-27
**Root Cause:** Error messages are too descriptive for production
**Reproduction Steps:**
1. Trigger an error (e.g., no API key configured)
2. Check the error message - it reveals internal configuration details

**Fix:** Use generic error messages in production:
```typescript
// Instead of:
return NextResponse.json(
  { error: `${providerName} API key not configured. Please add your ${providerName} API key in Settings.` },
  { status: 401 }
);

// Use generic:
return NextResponse.json(
  { error: `API key not configured. Please check your settings.` },
  { status: 401 }
);
```

---

### SEC-10: Large AI Proxy Payloads Not Limited
**Severity:** Medium  
**Description:** The AI proxy route doesn't limit the size of the request body or the response. A user could send an extremely large prompt or receive a very long response, potentially causing:
1. Memory exhaustion on the server
2. Slow responses affecting other users
3. Excessive API costs

**Location:** `src/app/api/ai-proxy/route.ts`
**Root Cause:** No payload size limits
**Reproduction Steps:**
1. Send a very large prompt (e.g., 1MB of text)
2. The server will try to process it

**Fix:** Add payload size limits:
```typescript
export async function POST(request: NextRequest) {
  // Check content length
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > 100 * 1024 * 1024) {  // 100KB limit
    return NextResponse.json(
      { error: 'Request too large' },
      { status: 413 }
    );
  }
  // ... rest of the function
}
