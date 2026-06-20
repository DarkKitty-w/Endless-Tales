# Multiplayer Scope Audit — Current Reality vs. 4–6 Player Target

_Last updated: 2026-06-20_

This audit supports `VISION-011: Audit Actual Multi-Peer Support Before Expanding`.

## Executive Summary

The current multiplayer implementation is best described as:

> **Manual WebRTC one-host / one-guest co-op with partial small-party UI/state concepts.**

It is **not currently a reliable 4–6 player architecture**. Some state names and comments imply multiple peers, but the actual connection and data-channel model is centered around a single `RTCPeerConnection` and one set of data channels.

The correct stabilization path is:

1. Stabilize one-host / one-guest co-op first.
2. Only then redesign the WebRTC layer for 4–6 players.
3. Do not promise unlimited multiplayer.

---

## Files Reviewed

- `src/hooks/use-multiplayer.ts`
- `src/lib/webrtc-signalling.ts`
- `src/components/screens/CoopLobby.tsx`
- `src/components/screens/Gameplay.tsx`
- `src/context/reducers/multiplayerReducer.ts`
- `src/types/multiplayer-types.ts`
- `README.md`

---

## Current Supported Flow

### Host flow

Location:

- `src/components/screens/CoopLobby.tsx`
- `src/hooks/use-multiplayer.ts`
- `src/lib/webrtc-signalling.ts`

Current sequence:

1. Host clicks create session.
2. `createSession()` creates one `RTCPeerConnection`.
3. `createOffer()` creates five data channels:
   - `control`
   - `game-actions`
   - `story-update`
   - `party-state`
   - `chat`
4. Host shares one encoded offer.
5. One guest creates one encoded answer.
6. Host applies that one answer to the same peer connection.

### Guest flow

1. Guest pastes host offer.
2. `joinSession()` creates one `RTCPeerConnection`.
3. Guest creates one answer.
4. Guest sends answer back to host manually.
5. Guest waits for host to apply it.

This is suitable for one host and one guest.

---

## Findings

### MP-SCOPE-001: Single RTCPeerConnection limits actual multi-peer support

**Severity:** High  
**Location:** `src/hooks/use-multiplayer.ts`, around `peerConnectionRef` and `createSession()` / `joinSession()`  

Current code stores only one peer connection:

```ts
const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
```

For 4–6 players, the host normally needs one `RTCPeerConnection` per remote guest, e.g.:

```ts
Record<peerId, RTCPeerConnection>
```

Current design means a new guest connection would overwrite or conflict with the existing peer connection.

**Conclusion:** Current architecture is one-peer oriented.

---

### MP-SCOPE-002: Data channels are keyed by channel type, not peer ID

**Severity:** High  
**Location:** `src/hooks/use-multiplayer.ts`, around `dataChannelsRef` and `sendMessage()`  

Current code stores data channels as:

```ts
const dataChannelsRef = useRef<Record<string, RTCDataChannel>>({});
```

And sends messages using:

```ts
const channel = dataChannelsRef.current[type];
```

Where `type` is a channel type like:

```text
game-actions
story-update
party-state
chat
control
```

For multiple guests, this is insufficient because the host needs channel sets per peer:

```ts
Record<peerId, Record<DataChannelType, RTCDataChannel>>
```

Otherwise, there is no way to send to guest A vs guest B reliably.

**Conclusion:** Broadcast/multicast semantics are not truly implemented. The current `broadcastStoryUpdate()` still sends to one channel for the channel type, not to all connected peers.

---

### MP-SCOPE-003: Host can apply only one guest answer to the active peer connection

**Severity:** High  
**Location:**

- `src/components/screens/CoopLobby.tsx`
- `src/hooks/use-multiplayer.ts`
- `src/lib/webrtc-signalling.ts`

The lobby has one `inputAnswer` field and calls:

```ts
applyGuestAnswer(inputAnswer.trim())
```

The hook applies the answer to:

```ts
peerConnectionRef.current
```

A WebRTC answer corresponds to one offer/peer connection. Applying multiple different guest answers to the same connection is not a correct multi-peer model.

**Conclusion:** The manual signalling UI and connection model currently support one guest answer at a time.

---

### MP-SCOPE-004: `onPeerConnected` exists but does not appear to be called by the hook

**Severity:** Medium  
**Location:** `src/hooks/use-multiplayer.ts`, `src/components/screens/Gameplay.tsx`  

`useMultiplayer()` accepts:

```ts
onPeerConnected?: (peer: PeerInfo) => void;
```

`Gameplay.tsx` registers a callback that dispatches:

```ts
PEER_CONNECTED
```

But in the current hook implementation, `onPeerConnected` appears to be destructured but not invoked when channels open or signalling completes.

**Impact:** Global game state may not reliably know which remote players are connected. This affects party lists, turn order, and small-party expansion.

---

### MP-SCOPE-005: Party/player state exists, but connection layer does not fully back it

**Severity:** Medium  
**Location:**

- `src/types/multiplayer-types.ts`
- `src/context/reducers/multiplayerReducer.ts`
- `src/components/gameplay/PartySidebar.tsx`
- `src/hooks/use-multiplayer.ts`

The app has types and reducer actions for multiple players:

```ts
players: string[]
partyState: Record<string, PlayerSummary>
turnOrder: string[]
```

But these structures are not currently backed by a true multi-peer transport layer.

**Conclusion:** Multi-player state modeling exists, but transport support is incomplete.

---

### MP-SCOPE-006: Current QR/manual signalling UX does not scale well to 4–6 players

**Severity:** Medium  
**Location:** `src/components/screens/CoopLobby.tsx`  

Manual offer-answer signalling works for one friend, but a 4–6 player host flow requires one offer/answer exchange per guest or a more complex negotiation model.

Current lobby has:

- one invitation code
- one return code input
- one guest return-code flow

For 4–6 players, the UI would need:

- separate invite/answer handling per joining guest, or
- repeated “add guest” flow with clear guest slots, or
- a signalling server, which is currently not desired.

**Conclusion:** Small-party support is possible but requires a deliberate UI and transport redesign.

---

### MP-SCOPE-007: Reconnection is one-peer oriented

**Severity:** Medium  
**Location:** `src/hooks/use-multiplayer.ts`  

The reconnection state stores:

```ts
lastInitParams: { type: 'host' } | { type: 'guest'; offer: string }
```

This is enough for one active connection context, but not for multiple guest connections with different offers/answers and peer IDs.

**Conclusion:** Reconnection should be considered one-friend-only until redesigned.

---

## What Is Safe to Claim Now

The project can honestly claim:

- Manual P2P co-op via WebRTC.
- Host-authoritative co-op design.
- One host + one guest is the current stabilization target.
- Small-party 4–6 players is the product target, but requires further transport work.
- No Firebase/signalling server is used.
- No unlimited/public matchmaking promise.

---

## What Should Not Be Claimed Yet

Avoid claiming:

- unlimited multiplayer
- no enforced player limit
- robust 4–6 player support
- fully reliable reconnection for multiple guests
- true broadcast to all peers
- mature small-party session management

---

## Recommended Path to 4–6 Players Later

If small-party support becomes the next priority after one-friend stabilization, the likely architecture should change to:

### 1. Store connections per peer

```ts
peerConnectionsRef: Record<string, RTCPeerConnection>
```

### 2. Store data channels per peer and type

```ts
dataChannelsRef: Record<peerId, Record<DataChannelType, RTCDataChannel>>
```

### 3. Split send helpers

Needed methods:

```ts
sendToPeer(peerId, type, payload)
broadcastToPeers(type, payload)
sendToHost(type, payload)
```

### 4. Make signalling per guest

The host needs a clear repeated flow:

```text
Add Guest Slot -> generate offer -> guest returns answer -> guest appears in party
```

### 5. Call peer lifecycle callbacks reliably

`onPeerConnected(peer)` and `onPeerDisconnected(peerId)` should fire from the transport layer.

### 6. Turn order must use real connected peer IDs

Turn order should be generated from:

```ts
hostPeerId + connectedGuestPeerIds
```

not from stale/optimistic state.

### 7. Keep manual P2P

All of the above can still be done without Firebase/Supabase/signalling server, but the UX becomes more manual.

---

## Recommended Immediate Stabilization Tasks

Before expanding to 4–6 players:

1. Verify one-host/one-guest connection in browser manually.
2. Ensure `onPeerConnected` fires and updates `players` / `partyState`.
3. Ensure host can start game only after guest is actually connected.
4. Ensure guest receives start/gameplay transition or has clear instructions if start is manual.
5. Ensure chat works both directions.
6. Ensure guest action reaches host.
7. Ensure host narration reaches guest.
8. Ensure turn state updates are visible and correct.
9. Ensure disconnect returns both sides to understandable UI state.

---

## Audit Conclusion

`VISION-011` conclusion:

> The current implementation should be treated as **one-friend co-op**. The codebase contains some multi-player state concepts, but the WebRTC transport and lobby signalling are not yet a true 4–6 player implementation.

This is not a failure; it simply means the next multiplayer work should stabilize the one-friend flow before attempting small-party expansion.
