## Objective: Stabilize real-time synchronization
**Investigation:** Examine the WebSocket/peer-to-peer connection logic. Check the lifecycle of connections (handshake, reconnection, disconnection). Analyze how state updates are broadcasted and resolved between clients.
**Action:** Fix any desync issues. Ensure clients reconcile state properly without overwriting valid changes. Implement a heartbeat to detect stale connections. Keep the gameplay responsive even under high latency.
