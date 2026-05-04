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
  // Optional password protection (SEC-8)
  passwordHash?: string; // Simple hash of the session password (base64 encoded)
}

// Simple password hashing function (SEC-8)
// Note: This is not cryptographically secure - just a basic deterrent
export function hashPassword(password: string): string {
  // Use a simple encoding - in production, use a proper hashing library
  return btoa(password).replace(/=/g, '');
}

// Validate password against hash (SEC-8)
export function validatePassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
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
 * Includes validation for security (SEC-3)
 */
export function decodeSignallingData(encoded: string): SignallingPackage {
  try {
    // SEC-3: Validate input
    if (!encoded || typeof encoded !== 'string') {
      throw new Error('Invalid input: encoded data must be a non-empty string');
    }
    
    // Check size limit (max 100KB when decoded)
    if (encoded.length > 150000) { // base64 is ~4/3 of original size
      throw new Error('Input too large: maximum size is 100KB');
    }
    
    // Validate base64 format (basic check)
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    if (!base64Regex.test(encoded)) {
      throw new Error('Invalid base64 format');
    }
    
    const json = decodeURIComponent(escape(atob(encoded)));
    
    // Check JSON size after decoding
    if (json.length > 100 * 1024) {
      throw new Error('Decoded data too large: maximum size is 100KB');
    }
    
    const pkg = JSON.parse(json);
    
    // Validate required fields
    if (!pkg || typeof pkg !== 'object') {
      throw new Error('Invalid signalling data: not an object');
    }
    
    // Validate SDP
    if (!pkg.sdp || typeof pkg.sdp !== 'string') {
      throw new Error('Invalid signalling data: missing or invalid sdp');
    }
    
    // Validate type
    if (!pkg.type || !['offer', 'answer'].includes(pkg.type)) {
      throw new Error('Invalid signalling data: missing or invalid type (must be offer or answer)');
    }
    
    // Validate peerInfo
    if (!pkg.peerInfo || typeof pkg.peerInfo !== 'object') {
      throw new Error('Invalid signalling data: missing or invalid peerInfo');
    }
    if (!pkg.peerInfo.peerId || typeof pkg.peerInfo.peerId !== 'string') {
      throw new Error('Invalid signalling data: missing or invalid peerInfo.peerId');
    }
    if (!pkg.peerInfo.name || typeof pkg.peerInfo.name !== 'string') {
      throw new Error('Invalid signalling data: missing or invalid peerInfo.name');
    }
    
    // Validate ICE candidates (if present)
    if (pkg.iceCandidates) {
      if (!Array.isArray(pkg.iceCandidates)) {
        throw new Error('Invalid signalling data: iceCandidates must be an array');
      }
      
      // Validate each ICE candidate (basic structure check)
      for (const candidate of pkg.iceCandidates) {
        if (!candidate || typeof candidate !== 'object') {
          throw new Error('Invalid signalling data: invalid ICE candidate');
        }
        // At minimum, candidate should have a candidate string or be null
        if (candidate.candidate && typeof candidate.candidate !== 'string') {
          throw new Error('Invalid signalling data: invalid ICE candidate format');
        }
      }
      
      // Limit number of ICE candidates
      if (pkg.iceCandidates.length > 50) {
        throw new Error('Invalid signalling data: too many ICE candidates (max 50)');
      }
    }
    
    return pkg;
  } catch (error) {
    console.error('Failed to decode signalling data:', error);
    if (error instanceof Error) {
      throw new Error(`Invalid signalling data: ${error.message}`);
    }
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
 * @param password Optional password to protect the session (SEC-8)
 */
export async function createOffer(
  peerId: string,
  name: string,
  onIceCandidate: (candidate: RTCIceCandidateInit) => void,
  password?: string
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
  
  // Add password hash if password is provided (SEC-8)
  if (password) {
    pkg.passwordHash = hashPassword(password);
  }

  const encodedOffer = encodeSignallingData(pkg);
  return { peerConnection: pc, encodedOffer };
}

/**
 * Guest: Create an answer from a host's offer string
 * Returns a base64-encoded string containing the answer and ICE candidates
 * @param password Optional password to validate against the offer (SEC-8)
 * @throws Error if password is required but incorrect
 */
export async function createAnswer(
  encodedOffer: string,
  peerId: string,
  name: string,
  onIceCandidate: (candidate: RTCIceCandidateInit) => void,
  password?: string
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

  // SEC-8: Validate password if required
  if (pkg.passwordHash) {
    if (!password) {
      throw new Error('PASSWORD_REQUIRED: This session requires a password');
    }
    if (!validatePassword(password, pkg.passwordHash)) {
      throw new Error('INVALID_PASSWORD: Incorrect password for this session');
    }
  }

  const offerDesc = new RTCSessionDescription({ type: 'offer', sdp: pkg.sdp });
  await pc.setRemoteDescription(offerDesc);

  // Add host's ICE candidates (SEC-7: validate before adding)
  if (pkg.iceCandidates && Array.isArray(pkg.iceCandidates)) {
    for (const candidate of pkg.iceCandidates) {
      // Validate ICE candidate structure before adding
      if (!candidate || typeof candidate !== 'object') {
        console.warn('Invalid ICE candidate received, skipping');
        continue;
      }
      // Basic validation: candidate should have candidate string or be null/empty
      if (candidate.candidate && typeof candidate.candidate !== 'string') {
        console.warn('Invalid ICE candidate format, skipping');
        continue;
      }
      try {
        await pc.addIceCandidate(candidate);
      } catch (e) {
        console.warn('Failed to add ICE candidate:', e);
      }
    }
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

  // Add guest's ICE candidates (SEC-7: validate before adding)
  if (pkg.iceCandidates && Array.isArray(pkg.iceCandidates)) {
    for (const candidate of pkg.iceCandidates) {
      // Validate ICE candidate structure before adding
      if (!candidate || typeof candidate !== 'object') {
        console.warn('Invalid ICE candidate received, skipping');
        continue;
      }
      // Basic validation: candidate should have candidate string or be null/empty
      if (candidate.candidate && typeof candidate.candidate !== 'string') {
        console.warn('Invalid ICE candidate format, skipping');
        continue;
      }
      try {
        await peerConnection.addIceCandidate(candidate);
      } catch (e) {
        console.warn('Failed to add ICE candidate:', e);
      }
    }
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