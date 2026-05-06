## Detailed Findings

### NET-1: Turn Order Never Advances After Actions
**Severity:** Critical  
**Description:** The `ADVANCE_TURN` reducer case is defined in multiplayerReducer.ts but no code dispatches this action. The host processes player actions without incrementing the turn index, leaving all players stuck on the initial turn order.  
**Location:** `src/context/reducers/multiplayerReducer.ts` (lines 69-80), `src/components/screens/Gameplay.tsx` (no dispatch of `ADVANCE_TURN` found)  
**Scenario:** Host processes a guest action, but never advances the turn. The next player in the turn order never gets their turn, and all subsequent actions are either ignored (if not the first player) or processed out of order, leading to conflicting story state between host and guests.  
**Fix:** After processing an action in `handleGuestActionReceived` (Gameplay.tsx), calculate the next turn index as `(currentTurnIndex + 1) % turnOrder.length`, dispatch `{ type: "ADVANCE_TURN", payload: nextIndex }`, then broadcast the updated turn state via `broadcastPartyState()`.

### NET-2: No Lock/Queue for Simultaneous Player Actions
**Severity:** High  
**Description:** There is no locking mechanism or action queue for player actions. If multiple players act at the same time, their actions may be processed out of order or conflict with each other.  
**Location:** `src/hooks/use-multiplayer.ts` (action sending), `src/components/screens/Gameplay.tsx` (action processing)  
**Scenario:** Two players submit actions at the same time. Both actions are sent to the host, which processes them in quick succession without proper ordering, leading to desynced state.  
**Fix:** Implement a turn-based lock: only allow actions from the current player in the turn order. Queue actions from other players and process them when it's their turn.

### NET-3: Players Can Become Desynced (Different Turn States)
**Severity:** Critical  
**Description:** Without proper turn advancement and synchronization, players can end up with different turn states. The host may be on turn 3 while guests are still on turn 1.  
**Location:** `src/context/reducers/multiplayerReducer.ts`, `src/hooks/use-multiplayer.ts`  
**Scenario:** After processing several actions, the host's turn index advances (if manually updated) but guests never receive the updates, or vice versa. Players see different game states.  
**Fix:** Implement proper turn synchronization: broadcast turn state after every action, validate that all peers acknowledge the turn update before proceeding.

### NET-4: No Validation That Action Is From Current Player
**Severity:** High  
**Description:** The system does not validate that incoming actions are from the player whose turn it currently is. Any player can send actions at any time.  
**Location:** `src/hooks/use-multiplayer.ts` (handleGuestActionReceived), `src/context/reducers/multiplayerReducer.ts`  
**Scenario:** A player whose turn it isn't sends an action. The host processes it, advancing the story based on the wrong player's action, causing confusion and desync.  
**Fix:** Add validation in `handleGuestActionReceived`: check that `action.playerName` matches `turnOrder[currentTurnIndex]`. Ignore actions from players not currently in turn.

### NET-5: Message Queue Processes in Reverse Order (FIFO Violation)
**Severity:** High  
**Description:** The global message queue for handling data channel backpressure iterates from the end of the queue to the start when processing messages, sending the newest queued messages first instead of the oldest. This reverses the intended send order.  
**Location:** `src/lib/webrtc-signalling.ts` lines 396-406 (queue processor loop)  
**Scenario:** When rapid message sending fills the data channel buffer (>1MB), messages are queued. When the buffer clears, queued messages are sent in reverse order (newest first), leading to out-of-order processing on the receiving end.  
**Fix:** Change the queue iteration to process from index 0 to length-1 (oldest first). Use `shift()` to dequeue or iterate forward with a while loop.

### NET-6: No Message Acknowledgment or Retry Logic
**Severity:** High  
**Description:** The system does not implement message acknowledgments or retry logic. If a message is dropped or fails to send, it is lost forever.  
**Location:** `src/lib/webrtc-signalling.ts` (sendMessage), `src/hooks/use-multiplayer.ts`  
**Scenario:** A critical state update message (like turn advancement) is sent but dropped due to network issues. The receiving end never gets the update, leading to permanent desync.  
**Fix:** Implement message acknowledgment: receivers send ACK messages for critical updates. Senders retry unacknowledged messages with exponential backoff.

### NET-7: Dropped Messages Not Detected or Retransmitted
**Severity:** Medium  
**Description:** There is no detection mechanism for dropped messages. The data channel is "reliable" but in practice messages can still be lost during connection fluctuations.  
**Location:** `src/lib/webrtc-signalling.ts`, `src/hooks/use-multiplayer.ts`  
**Scenario:** During a temporary network hiccup, a state update message is dropped. The receiver never gets it, and neither side knows it was lost.  
**Fix:** Add sequence numbers to messages. Receivers detect gaps in the sequence and request retransmission of missing messages.

### NET-8: No Sequence Numbers for Message Ordering
**Severity:** High  
**Description:** Messages are sent without sequence numbers, making it impossible to detect out-of-order delivery or dropped messages.  
**Location:** `src/lib/webrtc-signalling.ts` (sendMessage function), `src/hooks/use-multiplayer.ts` (message handling)  
**Scenario:** Due to network routing, message B may arrive before message A. Without sequence numbers, the receiver processes them out of order, leading to incorrect state updates.  
**Fix:** Add a `sequenceNumber` field to all messages. Receivers buffer out-of-order messages and process them in sequence order.

### NET-9: Data Channel Flooding (No Rate Limiting)
**Severity:** Medium  
**Description:** There is no rate limiting on data channel sends. Rapid sending can flood the channel buffer, causing queuing and potential message loss.  
**Location:** `src/lib/webrtc-signalling.ts` (sendMessage), `src/hooks/use-multiplayer.ts` (broadcast functions)  
**Scenario:** A bug or malicious client sends hundreds of messages per second. The data channel buffer fills up, legitimate messages get queued or dropped, and the connection becomes unresponsive.  
**Fix:** Implement rate limiting: track messages sent per second, throttle or reject messages that exceed a reasonable rate (e.g., 10 messages/second).

### NET-10: Module-Level Message Queue Shared Across Peers
**Severity:** High  
**Description:** The message queue (`messageQueue`) is a module-level variable in webrtc-signalling.ts, meaning it's shared across all peer connections. Messages from one peer can leak into another's queue.  
**Location:** `src/lib/webrtc-signalling.ts` (lines ~15-20, module-level queue)  
**Scenario:** Two peers are connected. Peer A's messages get queued due to backpressure. Peer B's connection processes the queue, and Peer A's messages get sent to Peer B (or vice versa), causing corrupted state.  
**Fix:** Move the message queue into the peer connection state (inside `setupDataChannelForPeer`). Each peer should have its own isolated queue.

### NET-11: No Version Validation on APPLY_REMOTE_STATE
**Severity:** High  
**Description:** The `APPLY_REMOTE_STATE` handler blindly applies any remote state without checking if it's newer than current state. The `GameState` has a `version` field, but it's not used during reconciliation.  
**Location:** `src/context/reducers/multiplayerReducer.ts` lines 82-94  
**Scenario:** A client with an older state version (due to missed updates) sends its state to the host. The host applies this stale state, overwriting newer progress and causing data loss.  
**Fix:** Add version checking: only apply remote state if its version is greater than or equal to the current version. Track state versions and reject stale updates.

### NET-12: Host Is Sole Source of Truth But No Integrity Checks
**Severity:** Critical  
**Description:** The host is the sole source of truth, but there are no integrity checks on the state updates it sends. Malicious or buggy hosts can send invalid state.  
**Location:** `src/context/reducers/multiplayerReducer.ts` (APPLY_REMOTE_STATE), `src/hooks/use-multiplayer.ts`  
**Scenario:** A compromised host sends malformed state updates that crash clients or corrupt their game state. Clients blindly apply whatever the host sends.  
**Fix:** Add integrity checks: validate the structure of remote state before applying. Use checksums or digital signatures to verify state integrity.

### NET-13: Mismatched States Not Detected or Reconciled
**Severity:** High  
**Description:** When states become mismatched (due to missed messages, bugs, etc.), there is no detection or reconciliation mechanism.  
**Location:** `src/context/reducers/multiplayerReducer.ts`, `src/hooks/use-multiplayer.ts`  
**Scenario:** Due to network issues, a client misses several state updates. The host is on turn 5, but the client thinks it's turn 2. Actions are processed against the wrong state, leading to divergence.  
**Fix:** Implement periodic state reconciliation: exchange state checksums, detect mismatches, and request full state resync when divergence is detected.

### NET-14: Client Accepts Any Remote State Without Verification
**Severity:** High  
**Description:** Clients apply any state sent by the host without verifying it came from the legitimate host or checking its validity.  
**Location:** `src/context/reducers/multiplayerReducer.ts` (APPLY_REMOTE_STATE)  
**Scenario:** An attacker joins as a "guest" but sends `APPLY_REMOTE_STATE` messages pretending to be the host. Clients apply the attacker's state, leading to game manipulation or crashes.  
**Fix:** Add sender verification: only accept state updates from verified peers. Use peer IDs and cryptographic verification if possible.

### NET-15: No Conflict Resolution for Divergent States
**Severity:** High  
**Description:** When the host and client states diverge (for any reason), there is no conflict resolution mechanism. The system simply applies the remote state, potentially losing local progress.  
**Location:** `src/context/reducers/multiplayerReducer.ts`, `src/hooks/use-multiplayer.ts`  
**Scenario:** A client has made local progress (e.g., completed a side quest) that isn't reflected in the host's state. When the host's state is applied, the client's progress is overwritten and lost.  
**Fix:** Implement conflict resolution: when applying remote state, detect local changes that aren't in the remote state. Prompt the user to choose which version to keep or merge the changes.

### NET-16: Reconnection Not Triggered on RTCPeerConnection State Changes
**Severity:** Medium  
**Description:** The reconnection logic only triggers from data channel `onclose` events. The `RTCPeerConnection.onconnectionstatechange` handler only logs the state but does not initiate reconnection.  
**Location:** `src/lib/webrtc-signalling.ts` lines 120-124, `src/hooks/use-multiplayer.ts` lines 326-335  
**Scenario:** Network connectivity is lost but data channels haven't detected closure yet; peer connection shows 'disconnected' state but no reconnection is attempted.  
**Fix:** Add reconnection trigger in the `onconnectionstatechange` handler: if state becomes 'disconnected' or 'failed', initiate reconnection after a timeout.

### NET-17: No Automatic Reconnection Logic (Manual Only)
**Severity:** High  
**Description:** There is no automatic reconnection logic. When a connection drops, the user must manually rejoin the session.  
**Location:** `src/hooks/use-multiplayer.ts`, `src/lib/webrtc-signalling.ts`  
**Scenario:** A player's network blips for 5 seconds. The connection drops. When it comes back, there's no automatic reconnection - the player must manually copy the invite code and rejoin, losing their place in the game.  
**Fix:** Implement automatic reconnection: on disconnect, attempt to reconnect with exponential backoff. Use the last known session ID and peer info to re-establish the connection.

### NET-18: Pending State Updates Lost on Disconnect
**Severity:** High  
**Description:** When a disconnect occurs, any pending state updates (messages in flight, unacknowledged actions) are lost.  
**Location:** `src/hooks/use-multiplayer.ts`, `src/lib/webrtc-signalling.ts`  
**Scenario:** A player sends an action to the host, but disconnects before receiving the state update. The action may or may not have been processed, and the player has no idea what happened.  
**Fix:** Persist pending actions to sessionStorage. On reconnection, resend pending actions and request the current state from the host.

### NET-19: ICE Candidate Errors Can Break Connection Silently
**Severity:** Medium  
**Description:** Errors when adding ICE candidates are caught but not properly surfaced or handled. A connection may fail without clear explanation.  
**Location:** `src/lib/webrtc-signalling.ts` (addIceCandidate calls)  
**Scenario:** Invalid ICE candidates are received (due to network changes, TURN server issues). Adding them fails silently. The connection never establishes, and users see "Connecting..." indefinitely.  
**Fix:** Improve error handling for ICE candidate operations. Surface errors to users with guidance (check firewall, try different STUN/TURN servers).

### NET-20: No Connection Health Checks/Heartbeat
**Severity:** Medium  
**Description:** There are no periodic health checks or heartbeat messages to detect silent connection failures (where the connection appears open but no data flows).  
**Location:** `src/hooks/use-multiplayer.ts`, `src/lib/webrtc-signalling.ts`  
**Scenario:** A network device drops all packets but doesn't close the connection. The data channel stays "open" but no messages get through. Players wait indefinitely for responses that will never arrive.  
**Fix:** Implement heartbeat: send periodic ping messages. If no pong is received within a timeout, consider the connection dead and trigger reconnection.

### NET-21: SDP Negotiation Failures Not Handled Gracefully
**Severity:** Medium  
**Description:** When SDP offer/answer negotiation fails, the error is not explained to the user. They see generic "Connection failed" without understanding it's an SDP issue.  
**Location:** `src/lib/webrtc-signalling.ts` (createOffer, createAnswer, setRemoteDescription calls)  
**Scenario:** SDP negotiation fails due to codec mismatches, network issues, or malformed offers. The connection fails with cryptic errors, leaving users confused.  
**Fix:** Catch SDP-specific errors and provide helpful messages. Suggest firewall/network troubleshooting steps.

### NET-22: No Timeout for Connection Establishment
**Severity:** Medium  
**Description:** When initiating a connection, there is no timeout. If the remote peer doesn't respond, the connection attempt hangs indefinitely.  
**Location:** `src/lib/webrtc-signalling.ts` (createOffer, wait for answer), `src/hooks/use-multiplayer.ts`  
**Scenario:** A player tries to join a session where the host is offline or unreachable. They see "Connecting..." forever with no feedback or ability to cancel.  
**Fix:** Add a timeout for connection establishment (e.g., 30 seconds). If the connection isn't established within the timeout, abort and show a "Connection failed" message with retry options.

### NET-23: Host Leaving Kills Session for All Guests
**Severity:** Critical  
**Description:** When the host leaves (intentionally or due to network issues), the session is effectively dead. There is no host migration or session persistence.  
**Location:** `src/hooks/use-multiplayer.ts`, `src/lib/webrtc-signalling.ts`  
**Scenario:** The host's network drops or they close the tab. All guests are disconnected with no way to continue the game. Hours of progress may be lost if the state wasn't saved.  
**Fix:** Implement host migration: when the host leaves, elect a new host from the remaining guests. Migrate the session state and continue the game.

### NET-24: Weak Validation of Decoded Signalling Data
**Severity:** Medium-High  
**Description:** The `decodeSignallingData` function performs minimal validation after decoding. It only checks if `pkg.sdp`, `pkg.type`, and `pkg.peerInfo` exist, but does not validate nested fields.  
**Location:** `src/lib/webrtc-signalling.ts` lines 37-49  
**Scenario:** An attacker or buggy client sends a modified base64 string where `peerInfo` exists but is missing `peerId`. When host applies the answer, the system may behave unpredictably or crash when trying to reference `peerInfo.peerId`.  
**Fix:** Add comprehensive validation: check that `peerInfo.peerId` and `peerInfo.name` are non-empty strings, validate that `type` is either 'offer' or 'answer', validate SDP format/structure, check that `iceCandidates` is an array.

### NET-25: Malformed Invite Data Can Break Session
**Severity:** Medium  
**Description:** Invite codes (base64-encoded signalling data) can be malformed or tampered with. The decode function doesn't handle all edge cases, potentially breaking the session.  
**Location:** `src/lib/webrtc-signalling.ts` (decodeSignallingData), `src/components/screens/CoopLobby.tsx` (join flow)  
**Scenario:** A player shares an invite code but it gets truncated (copy-paste error). The joiner tries to decode it, gets a malformed object, and the session breaks or crashes.  
**Fix:** Add robust validation and error handling for invite codes. Show clear error messages when decoding fails ("Invalid invite code - please check the code and try again").

### NET-26: Host Leaving During Join Process Not Handled
**Severity:** High  
**Description:** If the host leaves while a guest is in the middle of the join process (sent offer, waiting for answer), the guest is left hanging with no feedback.  
**Location:** `src/hooks/use-multiplayer.ts` (join flow), `src/lib/webrtc-signalling.ts`  
**Scenario:** A guest sends an offer to join. The host accepts and starts processing, but then their network drops. The guest never receives the answer and waits indefinitely.  
**Fix:** Add timeout for the join process. If the answer isn't received within a reasonable time, abort and show "Host not responding" with retry options.

### NET-27: No Flooding Protections on Data Channels
**Severity:** Medium  
**Description:** There are no protections against a client flooding the data channel with messages, which could disrupt the game for other players.  
**Location:** `src/lib/webrtc-signalling.ts` (sendMessage), `src/hooks/use-multiplayer.ts`  
**Scenario:** A malicious or buggy client sends hundreds of chat messages or action requests per second. The data channel buffer fills up, other players' messages get queued or dropped, and the game becomes unresponsive.  
**Fix:** Implement per-peer rate limiting. Track messages sent by each peer. If a peer exceeds a threshold (e.g., 10 messages/second), throttle or disconnect them.

### NET-28: No Size Limits on Signalling Data
**Severity:** Medium  
**Description:** The decodeSignallingData function does not limit the size of the input string or decoded JSON. Extremely large payloads could cause memory exhaustion or slow parsing.  
**Location:** `src/lib/webrtc-signalling.ts` (decodeSignallingData function)  
**Scenario:** An attacker sends a massive invite code (multi-megabyte base64 string). The decode function attempts to process it, causing memory exhaustion or parser slowdown, potentially crashing the browser tab.  
**Fix:** Add size limits to input strings (e.g., max 50KB for SDP + metadata). Reject oversized payloads before processing.