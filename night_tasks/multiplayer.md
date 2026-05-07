# Multiplayer Consistency & Sync Audit Report

**Date:** 2026-05-07  
**Scope:** Endless Tales WebRTC Multiplayer Implementation  
**Files Audited:**
- `src/hooks/use-multiplayer.ts`
- `src/lib/webrtc-signalling.ts`
- `src/types/multiplayer-types.ts`
- `src/context/reducers/multiplayerReducer.ts`

---

## Executive Summary

The Endless Tales multiplayer implementation uses a WebRTC-based P2P architecture with host authority. The system uses 5 data channels (game-actions, story-update, party-state, chat, control) with ordered delivery. Several fixes have been applied (NET-4, NET-8, NET-10, NET-11, NET-13), but several issues remain that could cause desynchronization or reliability problems.

---

## Detailed Findings

### NET-1: Turn Desynchronization Risk
**Severity:** High  
**Description:** While the host validates that incoming game actions are from the player whose turn it is (NET-4 fix), there's a race condition where a guest player may send an action before receiving the updated turn order from the host. The guest has no local mechanism to verify it's actually their turn.  
**Location:** `src/hooks/use-multiplayer.ts` lines 611-633 (handleMessage for 'game-actions')  
**Scenario:** Host advances turn and sends party-state update. Due to network latency, guest doesn't receive the update before the new current player sends their action. The guest's UI may still show it's their turn.  
**Fix:** Implement a turn lock token system where the host includes a unique token with each turn assignment. The guest must include this token when sending actions, and the host validates it.

---

### NET-2: No Conflict Resolution for Simultaneous Actions
**Severity:** Medium  
**Description:** If two players somehow send actions at the same time (e.g., network race condition, or if turn validation is bypassed), there's no queue or conflict resolution mechanism on the host side.  
**Location:** `src/hooks/use-multiplayer.ts` handleMessage for 'game-actions'  
**Scenario:** Two players send actions simultaneously. Host processes one and advances turn, then the second action arrives for a player who is no longer the current turn. While NET-4 catches this, the action is silently dropped with no feedback to the sending player.  
**Fix:** Implement an action queue on the host that buffers actions and processes them in turn order. Provide feedback to players when their action is rejected due to turn order.

---

### NET-3: Out-of-Order Message Handling Incomplete
**Severity:** Medium  
**Description:** The sequence number implementation (NET-8) only ignores old/duplicate messages but doesn't buffer out-of-sequence messages for later processing. If messages arrive out of order (rare with ordered:true channels, but possible during reconnection), they are dropped.  
**Location:** `src/hooks/use-multiplayer.ts` lines 594-606  
**Scenario:** During reconnection or network fluctuation, messages might arrive out of sequence. The current implementation drops any message with sequenceNumber < expectedSeq, rather than buffering it.  
**Fix:** Implement a per-peer message buffer that holds out-of-sequence messages until the missing messages arrive. Process buffered messages when gaps are filled.

---

### NET-4: [FIXED] Turn Order Validation
**Severity:** N/A (Fixed)  
**Description:** Previously, the host did not validate that incoming game actions were from the player whose turn it was. This has been fixed by adding validation at lines 617-624 in use-multiplayer.ts.  
**Location:** `src/hooks/use-multiplayer.ts` lines 617-624  
**Fix Applied:** Added check to verify `msg.payload.playerId === expectedPlayerId` before processing game actions.

---

### NET-5: Limited Host Authority Validation
**Severity:** Low  
**Description:** While the host checks for turn order (NET-4), there's no cryptographic or strong validation that messages are actually from who they claim to be. The `senderId` in messages is set by the sender, not cryptographically verified.  
**Location:** `src/hooks/use-multiplayer.ts` and `src/context/reducers/multiplayerReducer.ts`  
**Scenario:** A malicious client could forge messages with another player's peerId. In a P2P context this is hard to fully prevent, but additional validation could help.  
**Fix:** Consider implementing a simple challenge-response or shared secret for message authentication. At minimum, log suspicious messages where senderId doesn't match expected peer.

---

### NET-6: No Rate Limiting on Incoming Messages
**Severity:** Medium  
**Description:** A peer could flood the data channel with messages. While there's queuing for outgoing messages (NET-10), there's no rate limiting or throttling on incoming message processing.  
**Location:** `src/hooks/use-multiplayer.ts` handleMessage function  
**Scenario:** A buggy or malicious peer sends hundreds of messages per second. This could cause the receiving peer to slow down or run out of memory processing messages.  
**Fix:** Implement a rate limiter that tracks messages per second per peer. Drop or delay processing of messages that exceed a reasonable threshold (e.g., 10 messages/second).

### NET-7: Incomplete SDP Validation
**Severity:** Low  
**Description:** The `decodeSignallingData` function has basic SDP format validation (checks for 'v=' or 'o='), but doesn't deeply validate SDP content. Malformed SDP could cause connection failures.  
**Location:** `src/lib/webrtc-signalling.ts` lines 90-93  
**Scenario:** A malformed but technically passing SDP could cause WebRTC connection issues that are hard to debug.  
**Fix:** Add more robust SDP validation, perhaps using a simple regex to validate SDP structure more thoroughly.

---

### NET-8: [FIXED] Sequence Number Tracking
**Severity:** N/A (Fixed)  
**Description:** Added sequence number tracking per peer for message ordering. Outgoing messages get incrementing sequence numbers, and incoming messages are checked for ordering.  
**Location:** `src/hooks/use-multiplayer.ts` lines 97-98, 269-273, 594-606  
**Fix Applied:** Implemented `peerSequenceNumbers` for tracking expected sequence per peer, and `peerOutboxSequence` for outgoing messages.

---

### NET-9: Reconnection Uses Stale Offer
**Severity:** High  
**Description:** When reconnecting, the guest uses the old offer stored in `lastInitParams.current`. If the host has restarted or the session has changed, this offer is invalid and reconnection will fail even if the host is available.  
**Location:** `src/hooks/use-multiplayer.ts` lines 85, 457, 517-522  
**Scenario:** Host disconnects and creates a new session. Guest tries to reconnect using the old offer from the previous session. The reconnection fails, and after maxReconnectAttempts, the guest gives up permanently.  
**Fix:** Implement a session discovery mechanism or allow the guest to request a new offer from the host during reconnection. Consider using a session ID that persists across reconnections.

---

### NET-10: [FIXED] Per-Peer Message Queues
**Severity:** N/A (Fixed)  
**Description:** Previously, message queues were shared across peers, which could cause cross-peer message leakage. Implemented per-peer message queues.  
**Location:** `src/hooks/use-multiplayer.ts` lines 95-96, 216-256, 293-313  
**Fix Applied:** Created `peerMessageQueues` (Record<string, message[]>) and `peerQueueTimeouts` for per-peer queue management.

---

### NET-11: [FIXED] Remote State Version Validation
**Severity:** N/A (Fixed)  
**Description:** Added validation to ensure remote state being applied is not older than the current state.  
**Location:** `src/context/reducers/multiplayerReducer.ts` lines 87-96  
**Fix Applied:** Added version comparison before applying remote state.

---

### NET-12: No Message Acknowledgment System
**Severity:** High  
**Description:** There's no ACK/NACK mechanism for critical messages (game actions, state updates). If a message is dropped by the WebRTC data channel (can happen even with ordered:true during connection issues), the game state will desync without any indication.  
**Location:** Throughout multiplayer code  
**Scenario:** Host sends a critical story-update or party-state message. The message is dropped due to connection issues. The guest doesn't receive the update, and the game desyncs. Neither side knows the message was lost.  
**Fix:** Implement a simple acknowledgment system for critical messages. The receiver sends an ACK with the message ID/sequence number. The sender retransmits if no ACK is received within a timeout.

---

### NET-13: [FIXED] State Reconciliation with Checksums
**Severity:** N/A (Fixed)  
**Description:** Implemented state checksum calculation and periodic reconciliation to detect mismatched states between host and guests.  
**Location:** `src/hooks/use-multiplayer.ts` lines 18-37, 102-105, 117-214  
**Fix Applied:** Added `calculateStateChecksum()`, `sendStateChecksum()`, `requestStateResync()`, `startReconciliation()`, and related state management.

---

### NET-14: Chat Message Size Limit Not Enforced on Receive
**Severity:** Low  
**Description:** The `sendChatMessage` function truncates messages to 300 characters, but there's no validation on the receiving end. A malicious or buggy peer could send arbitrarily large chat messages.  
**Location:** `src/hooks/use-multiplayer.ts` lines 345-352 (sendChatMessage), lines 655-663 (receive handling)  
**Scenario:** A peer sends a 1MB chat message. This could cause performance issues or even crash the receiving peer's browser when trying to render it.  
**Fix:** Add size validation on the receiving end in the handleMessage function for 'chat' type. Reject messages with text longer than the expected limit.

---

### NET-15: ICE Candidate Gathering Timeout Not Handled Gracefully
**Severity:** Medium  
**Description:** The `waitForIceGathering` function has a 60-second timeout, after which it proceeds with whatever candidates have been gathered. However, there's no indication to the user that ICE gathering timed out, and no retry logic.  
**Location:** `src/lib/webrtc-signalling.ts` lines 506-525  
**Scenario:** ICE gathering takes too long (e.g., STUN server unreachable). After 60 seconds, the connection proceeds with fewer candidates than optimal, potentially causing suboptimal P2P connectivity.  
**Fix:** Add user-facing feedback when ICE gathering times out. Consider implementing a retry mechanism or allowing the user to manually trigger ICE restart.

---

### NET-16: No Connection Quality Metrics
**Severity:** Low  
**Description:** The system doesn't track or expose any connection quality metrics (latency, packet loss, throughput). This makes it difficult to diagnose connection issues.  
**Location:** Throughout multiplayer code  
**Scenario:** Players experience lag or desync but there's no way to measure or display connection quality to help diagnose the issue.  
**Fix:** Implement simple connection quality tracking: measure time between sending a message and receiving an ACK (for critical messages that have ACKs). Expose this as a connection quality indicator in the UI.

---

### NET-17: Host Migration Not Supported
**Severity:** Medium  
**Description:** If the host disconnects, there's no mechanism for another peer to take over as host. The session essentially ends.  
**Location:** `src/hooks/use-multiplayer.ts` and `src/context/reducers/multiplayerReducer.ts`  
**Scenario:** Host's browser crashes or network disconnects. All guests lose connection and must create a completely new session. Game state may be lost if not saved.  
**Fix:** Implement host migration: when host disconnects, trigger an election among remaining peers. The new host takes over authority and can continue the game. Requires state synchronization to the new host.

---

### NET-18: Data Channel Buffer Management Could Be Improved
**Severity:** Low  
**Description:** The current implementation checks `bufferedAmount < BUFFER_LIMIT / 2` before sending, but doesn't account for different message sizes. Large messages could still cause buffer overflow.  
**Location:** `src/hooks/use-multiplayer.ts` lines 225-244  
**Scenario:** Sending a large state update when the buffer is near the limit could cause issues.  
**Fix:** Check the size of the message being sent against the remaining buffer space: `channel.bufferedAmount + messageSize < BUFFER_LIMIT`.

---

### NET-19: Invite Code Security
**Severity:** Low  
**Description:** The invite/offer code is shared via copy-paste or QR code. There's no mechanism to revoke an invite or limit who can join with a given code.  
**Location:** `src/lib/webrtc-signalling.ts` encode/decode functions  
**Scenario:** An invite code is shared publicly. Anyone with the code could attempt to join the session.  
**Fix:** Consider adding a simple shared secret or PIN that must be provided along with the invite code. This is optional for a casual game but adds security.

---

### NET-20: State Checksum Doesn't Cover Full Game State
**Severity:** Medium  
**Description:** The `calculateStateChecksum` function only covers a few fields (storyLogLength, turnCount, currentTurnIndex, players, partyStateKeys). It doesn't include actual game state like character health, inventory, world map state, etc.  
**Location:** `src/hooks/use-multiplayer.ts` lines 19-37  
**Scenario:** A desync occurs where character stats or inventory don't match between host and guest. The checksum mechanism won't detect this mismatch.  
**Fix:** Expand the checksum to include more game state fields, or implement a more comprehensive state hash that covers the full relevant game state.

---

## Summary Table

| ID | Title | Severity | Status |
|----|-------|----------|--------|
| NET-1 | Turn Desynchronization Risk | High | Open |
| NET-2 | No Conflict Resolution for Simultaneous Actions | Medium | Open |
| NET-3 | Out-of-Order Message Handling Incomplete | Medium | Open |
| NET-4 | Turn Order Validation | N/A | Fixed |
| NET-5 | Limited Host Authority Validation | Low | Open |
| NET-6 | No Rate Limiting on Incoming Messages | Medium | Open |
| NET-7 | Incomplete SDP Validation | Low | Open |
| NET-8 | Sequence Number Tracking | N/A | Fixed |
| NET-9 | Reconnection Uses Stale Offer | High | Open |
| NET-10 | Per-Peer Message Queues | N/A | Fixed |
| NET-11 | Remote State Version Validation | N/A | Fixed |
| NET-12 | No Message Acknowledgment System | High | Open |
| NET-13 | State Reconciliation with Checksums | N/A | Fixed |
| NET-14 | Chat Message Size Limit Not Enforced on Receive | Low | Open |
| NET-15 | ICE Candidate Gathering Timeout | Medium | Open |
| NET-16 | No Connection Quality Metrics | Low | Open |
| NET-17 | Host Migration Not Supported | Medium | Open |
| NET-18 | Data Channel Buffer Management | Low | Open |
| NET-19 | Invite Code Security | Low | Open |
| NET-20 | State Checksum Doesn't Cover Full Game State | Medium | Open |

---

## Recommendations

### High Priority (Address Immediately)
1. **NET-1**: Implement turn lock token system to prevent race conditions
2. **NET-9**: Fix reconnection to handle stale offers (implement session discovery or offer refresh)
3. **NET-12**: Add message acknowledgment system for critical messages

### Medium Priority (Address in Near Term)
1. **NET-2**: Implement action queue with conflict resolution on host
2. **NET-3**: Complete out-of-order message handling with buffering
3. **NET-6**: Add rate limiting for incoming messages
4. **NET-15**: Improve ICE gathering timeout handling
5. **NET-17**: Consider host migration for better session reliability
6. **NET-20**: Expand state checksum to cover more game state

### Low Priority (Nice to Have)
1. **NET-5**: Add message authentication
2. **NET-7**: Improve SDP validation
3. **NET-14**: Enforce message size limits on receive
4. **NET-16**: Add connection quality metrics
5. **NET-18**: Improve buffer management for large messages
6. **NET-19**: Add invite code security (PIN)

---

## Testing Recommendations

To validate the fixes, the following test scenarios should be implemented:

1. **Turn Order Race Condition Test**: Simulate network delay between turn order update and action submission
2. **Reconnection Test**: Disconnect guest, restart host with new session, attempt reconnection
3. **Message Drop Test**: Simulate dropped messages and verify ACK/retransmission works
4. **State Checksum Mismatch Test**: Artificially create state mismatch and verify reconciliation
5. **Rate Limiting Test**: Flood a peer with messages and verify rate limiting kicks in
6. **Large Message Test**: Send messages near the buffer limit and verify handling

---

*End of Report*
