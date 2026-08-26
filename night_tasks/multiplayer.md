## Objective: Stabilize real-time synchronization
**Investigation:** Examine the WebSocket/peer-to-peer connection logic. Check the lifecycle of connections (handshake, reconnection, disconnection). Analyze how state updates are broadcasted and resolved between clients.
**Action:** Fix any desync issues. Ensure clients reconcile state properly without overwriting valid changes. Implement a heartbeat to detect stale connections. Keep the gameplay responsive even under high latency.

## QA verification (2026-08-26, independent second pass)

**NET-14 — guest resync via `RECONNECT_SYNC`: verified end-to-end after fixes.**

Two residual defects were found in the first-pass fix and corrected in commit `ec614cf`:

1. **Missing host snapshot (`Gameplay.tsx`).** No caller provided the `getGameStateSnapshot` option of `useMultiplayer`, so the host answered a guest's `request-sync` with the hook's internal `MultiplayerState`. The reducer spreads that payload over `GameState`, overwriting transport fields (`peerId`, `sessionId`, `connectionStatus`, `isHost`, …) and preserving none of the host's gameplay state. *Fixed:* `Gameplay.tsx` now supplies `getGameStateSnapshot` returning the authoritative `GameState` from `gameStateRef`.
2. **Reducer `isMyTurn`/index bugs (`multiplayerReducer.ts`, case `RECONNECT_SYNC`).** `isMyTurn` was recomputed against the post-spread `state.peerId` (the host's id once the full snapshot is merged), making it always false for guests; and `currentTurnIndex || state.currentTurnIndex` clobbered a legitimate index `0`. *Fixed:* resolve optional values with `??` before merging, then recompute `isMyTurn = nextTurnOrder.length > 0 && nextTurnOrder[nextTurnIndex] === state.peerId` from the pre-merge state — same convention as `SET_TURN_ORDER` / `ADVANCE_TURN`.

Validated flow: guest reconnect → `request-sync` → host `sync-response` built from `getGameStateSnapshot()` → guest dispatches `RECONNECT_SYNC` (routed via `MULTIPLAYER_ACTIONS`) → state merged, `isMyTurn` recomputed for the guest's own peer id. `tsc --noEmit`: 0 errors. Remaining known limitation: no automated test runner in the repo and no two-peer runtime available, so the fix is validated by static analysis only (see REVIEW.md § Limites).

Note: `CoopLobby.tsx` also calls `useMultiplayer` without `getGameStateSnapshot`; acceptable today because it never handles `sync-complete`, but it should adopt the same callback if resync is added there.
