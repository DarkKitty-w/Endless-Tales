// src/lib/webrtc-signalling.ts
// WebRTC signalling utilities for manual SDP offer/answer exchange (no signalling server)

export interface SignallingPackage {
  sdp: string;
  iceCandidates: RTCIceCandidateInit[];
  peerInfo: {
    peerId: string;
    name: string;
  };
  type: 'offer' | 'answer';
}

/**
 * Encode a signalling package to a base64 string for QR code or copy-paste
 */
export function encodeSignallingData(pkg: SignallingPackage): string {
  try {
    const json = JSON.stringify(pkg);
    // Use btoa for base64 encoding (browser-compatible)
    return btoa(unescape(encodeURIComponent(json)));
  } catch (error) {
    console.error('Failed to encode signalling data:', error);
    throw new Error('Failed to encode signalling data');
  }
}

/**
 * Decode a base64 string back to a signalling package
 */
export function decodeSignallingData(encoded: string): SignallingPackage {
  try {
    const json = decodeURIComponent(escape(atob(encoded)));
    const pkg = JSON.parse(json);
    if (!pkg.sdp || !pkg.type || !pkg.peerInfo) {
      throw new Error('Invalid signalling data format');
    }
    return pkg;
  } catch (error) {
    console.error('Failed to decode signalling data:', error);
    throw new Error('Invalid signalling data. Please check the code and try again.');
  }
}

// Store for the ICE candidate send callback
const iceCandidateSendCallbacks = new Map<string, (candidate: RTCIceCandidateInit) => void>();

/**
 * Create an RTCPeerConnection with ICE candidate collection
 * @param onIceCandidate Callback for each new ICE candidate (for initial collection)
 * @param onConnectionStateChange Optional callback for connection state changes
 * @param peerConnectionId Optional ID to register for ongoing ICE candidate sending
 * @param onIceCandidateForSending Optional callback to send ICE candidates via data channel
 */
export function createPeerConnection(
  onIceCandidate: (candidate: RTCIceCandidate) => void,
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void,
  peerConnectionId?: string
): RTCPeerConnection {
  const pc = new RTCPeerConnection({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  });

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      const candidateJson = event.candidate.toJSON();
      onIceCandidate(candidateJson);
      
      // If we have a registered send callback, call it
      if (peerConnectionId) {
        const sendCallback = iceCandidateSendCallbacks.get(peerConnectionId);
        if (sendCallback) {
          sendCallback(candidateJson);
        }
      }
    }
  };

  pc.onconnectionstatechange = () => {
    if (onConnectionStateChange) {
      onConnectionStateChange(pc.connectionState);
    }
  };

  return pc;
}

/**
 * Register a callback for sending ICE candidates via data channel
 * This allows exchanging ICE candidates in real-time after connection
 */
export function registerIceCandidateSendCallback(
  peerConnectionId: string,
  callback: (candidate: RTCIceCandidateInit) => void
): void {
  iceCandidateSendCallbacks.set(peerConnectionId, callback);
}

/**
 * Unregister the ICE candidate send callback
 */
export function unregisterIceCandidateSendCallback(peerConnectionId: string): void {
  iceCandidateSendCallbacks.delete(peerConnectionId);
}

/**
 * Handle an incoming ICE candidate received via data channel
 * This should be called when a 'webrtc-ice-candidate' message is received
 */
export async function handleIncomingIceCandidate(
  peerConnection: RTCPeerConnection,
  candidate: RTCIceCandidateInit
): Promise<void> {
  try {
    await peerConnection.addIceCandidate(candidate);
    console.log('Added ICE candidate received via data channel');
  } catch (error) {
    console.error('Failed to add ICE candidate:', error);
  }
}

/**
 * Host: Create an offer with ICE candidates
 * Returns a base64-encoded string containing the offer and ICE candidates
 */
export async function createOffer(
  peerId: string,
  name: string,
  onIceCandidate: (candidate: RTCIceCandidateInit) => void
): Promise<{ peerConnection: RTCPeerConnection; encodedOffer: string }> {
  const iceCandidates: RTCIceCandidateInit[] = [];
  const pcId = `offer-${peerId}`;
  
  const pc = createPeerConnection(
    (candidate) => {
      iceCandidates.push(candidate);
      onIceCandidate(candidate);
    },
    (state) => console.log('Host connection state:', state),
    pcId
  );

  // Create data channel
  pc.createDataChannel('game-actions', { ordered: true });
  pc.createDataChannel('story-update', { ordered: true });
  pc.createDataChannel('party-state', { ordered: true });
  pc.createDataChannel('chat', { ordered: true });
  pc.createDataChannel('control', { ordered: true });

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  // Wait for initial ICE candidates to be gathered
  await waitForIceGathering(pc);

  const pkg: SignallingPackage = {
    sdp: pc.localDescription!.sdp,
    iceCandidates,
    peerInfo: { peerId, name },
    type: 'offer',
  };

  const encodedOffer = encodeSignallingData(pkg);
  return { peerConnection: pc, encodedOffer };
}

/**
 * Guest: Create an answer from a host's offer string
 * Returns a base64-encoded string containing the answer and ICE candidates
 */
export async function createAnswer(
  encodedOffer: string,
  peerId: string,
  name: string,
  onIceCandidate: (candidate: RTCIceCandidateInit) => void
): Promise<{ peerConnection: RTCPeerConnection; encodedAnswer: string }> {
  const iceCandidates: RTCIceCandidateInit[] = [];
  const pcId = `answer-${peerId}`;
  
  const pc = createPeerConnection(
    (candidate) => {
      iceCandidates.push(candidate);
      onIceCandidate(candidate);
    },
    (state) => console.log('Guest connection state:', state),
    pcId
  );

  const pkg = decodeSignallingData(encodedOffer);
  if (pkg.type !== 'offer') {
    throw new Error('Invalid offer data');
  }

  const offerDesc = new RTCSessionDescription({ type: 'offer', sdp: pkg.sdp });
  await pc.setRemoteDescription(offerDesc);

  // Add host's ICE candidates
  for (const candidate of pkg.iceCandidates) {
    await pc.addIceCandidate(candidate);
  }

  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  // Wait for initial ICE candidates to be gathered
  await waitForIceGathering(pc);

  const answerPkg: SignallingPackage = {
    sdp: pc.localDescription!.sdp,
    iceCandidates,
    peerInfo: { peerId, name },
    type: 'answer',
  };

  const encodedAnswer = encodeSignallingData(answerPkg);
  return { peerConnection: pc, encodedAnswer };
}

/**
 * Host: Apply guest's answer to complete the connection
 */
export async function applyAnswer(
  peerConnection: RTCPeerConnection,
  encodedAnswer: string
): Promise<void> {
  const pkg = decodeSignallingData(encodedAnswer);
  if (pkg.type !== 'answer') {
    throw new Error('Invalid answer data');
  }

  const answerDesc = new RTCSessionDescription({ type: 'answer', sdp: pkg.sdp });
  await peerConnection.setRemoteDescription(answerDesc);

  // Add guest's ICE candidates
  for (const candidate of pkg.iceCandidates) {
    await peerConnection.addIceCandidate(candidate);
  }
}

/**
 * Wait for ICE gathering to complete (with timeout)
 * This only waits for the INITIAL batch of candidates
 */
function waitForIceGathering(pc: RTCPeerConnection, timeoutMs = 5000): Promise<void> {
  return new Promise((resolve) => {
    if (pc.iceGatheringState === 'complete') {
      resolve();
      return;
    }

    const timeout = setTimeout(() => {
      console.log('ICE gathering timeout, proceeding with collected candidates');
      resolve();
    }, timeoutMs);

    pc.onicegatheringstatechange = () => {
      if (pc.iceGatheringState === 'complete') {
        clearTimeout(timeout);
        resolve();
      }
    };
  });
}

/**
 * Setup data channel event handlers
 */
export function setupDataChannel(
  channel: RTCDataChannel,
  onMessage: (data: any) => void,
  onOpen?: () => void,
  onClose?: () => void
): void {
  channel.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (error) {
      console.error('Failed to parse data channel message:', error);
    }
  };

  channel.onopen = () => {
    console.log(`Data channel "${channel.label}" opened`);
    if (onOpen) onOpen();
  };

  channel.onclose = () => {
    console.log(`Data channel "${channel.label}" closed`);
    if (onClose) onClose();
  };

  channel.onerror = (error) => {
    console.error(`Data channel "${channel.label}" error:`, error);
  };
}

/**
 * Send a message via data channel
 */
export function sendDataChannelMessage(channel: RTCDataChannel, data: any): boolean {
  if (channel.readyState === 'open') {
    try {
      channel.send(JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Failed to send data channel message:', error);
      return false;
    }
  }
  return false;
}

/**
 * Handle an incoming ICE candidate received via data channel
 * This should be called when a 'webrtc-ice-candidate' message is received
 */
export async function handleIncomingIceCandidate(
  peerConnection: RTCPeerConnection,
  candidate: RTCIceCandidateInit
): Promise<void> {
  try {
    await peerConnection.addIceCandidate(candidate);
    console.log('Added ICE candidate received via data channel');
  } catch (error) {
    console.error('Failed to add ICE candidate:', error);
  }
}