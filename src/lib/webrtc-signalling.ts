// src/lib/webrtc-signalling.ts
// WebRTC signalling utilities for manual SDP offer/answer exchange (no signalling server)
import { logger } from "@/lib/logger";

export interface SignallingPackage {
  sdp: string;
  iceCandidates: RTCIceCandidateInit[];
  peerInfo: {
    peerId: string;
    name: string;
  };
  type: 'offer' | 'answer';
}

export interface IceCandidateMessage {
  type: 'ice-candidate';
  candidate: RTCIceCandidateInit;
}

/**
 * Encode a signalling package to a base64 string for QR code or copy-paste
 * SEC-10 Fix: Add size limits to prevent large payloads
 */
export function encodeSignallingData(pkg: SignallingPackage): string {
  try {
    const json = JSON.stringify(pkg);
    
    // SEC-10 Fix: Limit the size of the encoded data (max 50KB for JSON)
    const MAX_JSON_SIZE = 50 * 1024; // 50KB
    if (json.length > MAX_JSON_SIZE) {
      throw new Error('Signalling data too large');
    }
    
    // Use btoa for base64 encoding (browser-compatible)
    const encoded = btoa(unescape(encodeURIComponent(json)));
    
    // Also check the final encoded size
    if (encoded.length > MAX_JSON_SIZE * 2) { // base64 is ~4/3 the size of original
      throw new Error('Encoded signalling data too large');
    }
    
    return encoded;
  } catch (error) {
    logger.error('Failed to encode signalling data:', error);
    throw new Error('Failed to encode signalling data');
  }
}

/**
 * Decode a base64 string back to a signalling package
 * SEC-7 Fix: Add comprehensive input validation
 */
export function decodeSignallingData(encoded: string): SignallingPackage {
  try {
    // SEC-7 Fix: Limit input string size (max 100KB for base64-encoded data)
    const MAX_INPUT_SIZE = 100 * 1024; // 100KB
    if (typeof encoded !== 'string' || encoded.length > MAX_INPUT_SIZE) {
      throw new Error('Input too large or invalid type');
    }
    
    const json = decodeURIComponent(escape(atob(encoded)));
    
    // SEC-10 Fix: Also limit decoded JSON size
    if (json.length > MAX_INPUT_SIZE) {
      throw new Error('Decoded data too large');
    }
    
    const pkg = JSON.parse(json);
    
    // SEC-7 Fix: Comprehensive validation
    if (!pkg || typeof pkg !== 'object') {
      throw new Error('Invalid signalling data format: not an object');
    }
    
    // Validate required fields exist
    if (!pkg.sdp || !pkg.type || !pkg.peerInfo) {
      throw new Error('Invalid signalling data format: missing required fields');
    }
    
    // Validate type is valid enum value
    if (pkg.type !== 'offer' && pkg.type !== 'answer') {
      throw new Error('Invalid signalling data format: type must be "offer" or "answer"');
    }
    
    // Validate SDP is a non-empty string
    if (typeof pkg.sdp !== 'string' || pkg.sdp.trim().length === 0) {
      throw new Error('Invalid signalling data format: sdp must be a non-empty string');
    }
    
    // Basic SDP format validation (should start with v= or o=)
    if (!pkg.sdp.includes('v=') && !pkg.sdp.includes('o=')) {
      throw new Error('Invalid signalling data format: invalid SDP format');
    }
    
    // Validate peerInfo structure
    if (typeof pkg.peerInfo !== 'object' || pkg.peerInfo === null) {
      throw new Error('Invalid signalling data format: peerInfo must be an object');
    }
    if (typeof pkg.peerInfo.peerId !== 'string' || pkg.peerInfo.peerId.trim().length === 0) {
      throw new Error('Invalid signalling data format: peerInfo.peerId must be a non-empty string');
    }
    if (typeof pkg.peerInfo.name !== 'string') {
      throw new Error('Invalid signalling data format: peerInfo.name must be a string');
    }
    
    // Validate iceCandidates is an array
    if (!Array.isArray(pkg.iceCandidates)) {
      throw new Error('Invalid signalling data format: iceCandidates must be an array');
    }
    
    // Validate each iceCandidate has required structure
    for (const candidate of pkg.iceCandidates) {
      if (typeof candidate !== 'object' || candidate === null) {
        throw new Error('Invalid signalling data format: invalid ice candidate');
      }
      // RTCIceCandidateInit should have at least candidate or sdpMid or sdpMLineIndex
      if (!candidate.candidate && candidate.sdpMid === undefined && candidate.sdpMLineIndex === undefined) {
        throw new Error('Invalid signalling data format: invalid ice candidate structure');
      }
    }
    
    return pkg as SignallingPackage;
  } catch (error) {
    logger.error('Failed to decode signalling data:', error);
    if (error instanceof Error && error.message.includes('Invalid signalling data format')) {
      throw error; // Re-throw validation errors with specific message
    }
    throw new Error('Invalid signalling data. Please check the code and try again.');
  }
}

/**
 * Create an RTCPeerConnection with ICE candidate collection
 * Returns the peer connection and functions to manage ICE candidates
 */
export function createPeerConnection(
  onIceCandidate: (candidate: RTCIceCandidateInit) => void,
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void
): { 
  pc: RTCPeerConnection; 
  getBufferedCandidates: () => RTCIceCandidateInit[];
  setDataChannel: (dc: RTCDataChannel) => void;
} {
  const bufferedCandidates: RTCIceCandidateInit[] = [];
  let dataChannelForIce: RTCDataChannel | null = null;

  const pc = new RTCPeerConnection({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  });

  // Helper function to send a candidate via data channel
  const sendCandidate = (candidate: RTCIceCandidateInit): boolean => {
    if (dataChannelForIce && dataChannelForIce.readyState === 'open') {
      const message: IceCandidateMessage = {
        type: 'ice-candidate',
        candidate,
      };
      try {
        dataChannelForIce.send(JSON.stringify(message));
        return true;
      } catch (error) {
        logger.error('Failed to send ICE candidate via data channel:', error);
        return false;
      }
    }
    return false;
  };

  // Helper function to send all buffered candidates
  const sendBufferedCandidates = () => {
    const toSend = [...bufferedCandidates]; // Copy the array
    bufferedCandidates.length = 0; // Clear the buffer
    
    for (const candidate of toSend) {
      if (!sendCandidate(candidate)) {
        // Put it back in buffer if send fails
        bufferedCandidates.push(candidate);
      }
    }
  };

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      const candidateJson = event.candidate.toJSON();
      
      // Try to send immediately if data channel is open
      if (sendCandidate(candidateJson)) {
        onIceCandidate(candidateJson);
        return;
      }
      
      // Buffer candidates so they can be sent later via data channel
      bufferedCandidates.push(candidateJson);
      onIceCandidate(candidateJson);
    }
  };

  if (onConnectionStateChange) {
    pc.onconnectionstatechange = () => {
      onConnectionStateChange(pc.connectionState);
    };
  }

  return {
    pc,
    getBufferedCandidates: () => {
      // Return current buffered candidates (for initial signalling package)
      return [...bufferedCandidates];
    },
    setDataChannel: (dc: RTCDataChannel) => {
      dataChannelForIce = dc;
      
      // Send any buffered candidates when data channel opens
      const onOpen = () => {
        sendBufferedCandidates();
      };
      
      if (dc.readyState === 'open') {
        sendBufferedCandidates();
      } else {
        dc.onopen = onOpen;
      }
      
      // Also handle channel state changes - if channel reopens, resend buffered
      dc.onclose = () => {
        // Channel closed, will need to wait for reopen
      };
    }
  };
}

/**
 * Host: Create an offer with ICE candidates
 * Returns a base64-encoded string containing the offer and ICE candidates
 * ERR-28 Fix: Add SDP negotiation error handling with context
 */
export async function createOffer(
  peerId: string,
  name: string,
  onIceCandidate: (candidate: RTCIceCandidateInit) => void
): Promise<{ peerConnection: RTCPeerConnection; encodedOffer: string }> {
  const { pc, getBufferedCandidates, setDataChannel } = createPeerConnection(
    (candidate) => {
      onIceCandidate(candidate);
    },
    (state) => logger.log('Host connection state:', state)
  );

  try {
    // Create data channels
    const controlChannel = pc.createDataChannel('control', { ordered: true });
    pc.createDataChannel('game-actions', { ordered: true });
    pc.createDataChannel('story-update', { ordered: true });
    pc.createDataChannel('party-state', { ordered: true });
    pc.createDataChannel('chat', { ordered: true });
    
    // Set up the control channel to send ICE candidates in real-time
    setDataChannel(controlChannel);

    // ERR-28 Fix: Wrap SDP operations in try-catch with context
    let offer;
    try {
      offer = await pc.createOffer();
    } catch (error) {
      logger.error('Host: Failed to create SDP offer', { peerId, error, connectionState: pc.connectionState });
      throw new Error(`Failed to create SDP offer: ${error instanceof Error ? error.message : 'Unknown error'}. This may be due to firewall or network restrictions.`);
    }
    
    try {
      await pc.setLocalDescription(offer);
    } catch (error) {
      logger.error('Host: Failed to set local description (offer)', { peerId, error, connectionState: pc.connectionState });
      throw new Error(`Failed to set local SDP description: ${error instanceof Error ? error.message : 'Unknown error'}. Check firewall/network settings.`);
    }

    // Wait for ICE candidates to be gathered
    await waitForIceGathering(pc);

    // Build the signalling package with all gathered candidates
    const pkg: SignallingPackage = {
      sdp: pc.localDescription!.sdp,
      iceCandidates: getBufferedCandidates(), // Use buffered candidates for initial exchange
      peerInfo: { peerId, name },
      type: 'offer',
    };

    const encodedOffer = encodeSignallingData(pkg);
    
    // Store the function to get any future buffered candidates (rare, but possible)
    (pc as any).__getBufferedCandidates = getBufferedCandidates;
    
    return { peerConnection: pc, encodedOffer };
  } catch (error) {
    // ERR-34 Fix: Log with full context
    logger.error('Host: createOffer failed', { 
      peerId, 
      name,
      error: error instanceof Error ? error.message : String(error),
      connectionState: pc.connectionState,
      iceConnectionState: pc.iceConnectionState,
      signalingState: pc.signalingState
    });
    throw error;
  }
}

/**
 * Guest: Create an answer from a host's offer string
 * Returns a base64-encoded string containing the answer and ICE candidates
 * ERR-28 Fix: Add SDP negotiation error handling with context
 */
export async function createAnswer(
  encodedOffer: string,
  peerId: string,
  name: string,
  onIceCandidate: (candidate: RTCIceCandidateInit) => void
): Promise<{ peerConnection: RTCPeerConnection; encodedAnswer: string }> {
  const { pc, getBufferedCandidates, setDataChannel } = createPeerConnection(
    (candidate) => {
      onIceCandidate(candidate);
    },
    (state) => logger.log('Guest connection state:', state)
  );

  try {
    const pkg = decodeSignallingData(encodedOffer);
    if (pkg.type !== 'offer') {
      throw new Error('Invalid offer data');
    }

    // ERR-28 Fix: Wrap SDP operations in try-catch with context
    try {
      const offerDesc = new RTCSessionDescription({ type: 'offer', sdp: pkg.sdp });
      await pc.setRemoteDescription(offerDesc);
    } catch (error) {
      logger.error('Guest: Failed to set remote description (offer)', { peerId, name, error, connectionState: pc.connectionState });
      throw new Error(`Failed to process SDP offer: ${error instanceof Error ? error.message : 'Unknown error'}. The offer may be invalid or corrupted.`);
    }

    // Add host's ICE candidates
    for (const candidate of pkg.iceCandidates) {
      try {
        await pc.addIceCandidate(candidate);
      } catch (error) {
        logger.warn('Guest: Failed to add host ICE candidate during initial setup', { peerId, error });
        // Continue - non-fatal
      }
    }

    let answer;
    try {
      answer = await pc.createAnswer();
    } catch (error) {
      logger.error('Guest: Failed to create SDP answer', { peerId, name, error, connectionState: pc.connectionState });
      throw new Error(`Failed to create SDP answer: ${error instanceof Error ? error.message : 'Unknown error'}. Check firewall/network settings.`);
    }

    try {
      await pc.setLocalDescription(answer);
    } catch (error) {
      logger.error('Guest: Failed to set local description (answer)', { peerId, name, error, connectionState: pc.connectionState });
      throw new Error(`Failed to set local SDP description: ${error instanceof Error ? error.message : 'Unknown error'}. Check firewall/network settings.`);
    }

    // Wait for ICE candidates to be gathered
    await waitForIceGathering(pc);

    // Build the signalling package with all gathered candidates
    const answerPkg: SignallingPackage = {
      sdp: pc.localDescription!.sdp,
      iceCandidates: getBufferedCandidates(), // Use buffered candidates for initial exchange
      peerInfo: { peerId, name },
      type: 'answer',
    };

    const encodedAnswer = encodeSignallingData(answerPkg);
    
    // Set up handler for the incoming data channels (including control)
    pc.ondatachannel = (event) => {
      const channel = event.channel;
      if (channel.label === 'control') {
        // Set this channel for sending ICE candidates in real-time
        setDataChannel(channel);
      }
      // The channel setup is handled elsewhere
    };
    
    // Store the function to get any future buffered candidates (rare, but possible)
    (pc as any).__getBufferedCandidates = getBufferedCandidates;
    
    return { peerConnection: pc, encodedAnswer };
  } catch (error) {
    // ERR-34 Fix: Log with full context
    logger.error('Guest: createAnswer failed', { 
      peerId, 
      name,
      error: error instanceof Error ? error.message : String(error),
      connectionState: pc.connectionState,
      iceConnectionState: pc.iceConnectionState,
      signalingState: pc.signalingState
    });
    throw error;
  }
}

/**
 * Host: Apply guest's answer to complete the connection
 * ERR-28 Fix: Add SDP negotiation error handling with context
 */
export async function applyAnswer(
  peerConnection: RTCPeerConnection,
  encodedAnswer: string,
  peerId?: string
): Promise<void> {
  try {
    const pkg = decodeSignallingData(encodedAnswer);
    if (pkg.type !== 'answer') {
      throw new Error('Invalid answer data');
    }

    // ERR-28 Fix: Wrap SDP operations in try-catch with context
    try {
      const answerDesc = new RTCSessionDescription({ type: 'answer', sdp: pkg.sdp });
      await peerConnection.setRemoteDescription(answerDesc);
    } catch (error) {
      const context = peerId ? `from peer ${peerId}` : '';
      logger.error(`Host: Failed to set remote description (answer) ${context}:`, { 
        error, 
        connectionState: peerConnection.connectionState,
        signalingState: peerConnection.signalingState 
      });
      throw new Error(`Failed to process SDP answer ${context}: ${error instanceof Error ? error.message : 'Unknown error'}. The answer may be invalid.`);
    }

    // Add guest's ICE candidates
    for (const candidate of pkg.iceCandidates) {
      try {
        await peerConnection.addIceCandidate(candidate);
      } catch (error) {
        const context = peerId ? `from peer ${peerId}` : '';
        logger.warn(`Host: Failed to add guest ICE candidate ${context}:`, error);
        // Continue - non-fatal for initial setup
      }
    }
  } catch (error) {
    // ERR-34 Fix: Log with full context
    logger.error('Host: applyAnswer failed', { 
      peerId,
      error: error instanceof Error ? error.message : String(error),
      connectionState: peerConnection.connectionState,
      iceConnectionState: peerConnection.iceConnectionState,
      signalingState: peerConnection.signalingState
    });
    throw error;
  }
}

/**
 * Send buffered ICE candidates via an established data channel
 * Note: With the new implementation, candidates are sent automatically via setDataChannel.
 * This function is kept for backward compatibility but may not be needed.
 */
export function sendBufferedIceCandidates(
  pc: RTCPeerConnection,
  dataChannel: RTCDataChannel
): void {
  // The new implementation sends candidates automatically when data channel is ready
  // This is a no-op now, but kept for API compatibility
  logger.log('sendBufferedIceCandidates: Candidates are now sent automatically via data channel');
}

/**
 * Handle incoming ICE candidate message from data channel
 * ERR-27 Fix: Surface ICE errors with context
 */
export async function handleIceCandidateMessage(
  pc: RTCPeerConnection,
  message: IceCandidateMessage,
  peerId?: string
): Promise<void> {
  if (message.type === 'ice-candidate' && message.candidate) {
    try {
      await pc.addIceCandidate(message.candidate);
    } catch (error) {
      // ERR-27 Fix: Log with context
      const context = peerId ? `peer ${peerId}` : 'unknown peer';
      logger.error(`Failed to add ICE candidate from ${context}:`, error);
      logger.error('Candidate that failed:', JSON.stringify(message.candidate).substring(0, 200));
      logger.error('Connection state:', pc.connectionState, 'ICE state:', pc.iceConnectionState);
      
      // If the connection is already closed or failed, this is expected
      if (pc.connectionState === 'closed' || pc.iceConnectionState === 'failed') {
        logger.warn('Connection already closed/failed, ignoring ICE candidate error');
      }
    }
  }
}

/**
 * Wait for ICE gathering to complete (with timeout)
 * Collects candidates incrementally and provides a way to retrieve them
 */
function waitForIceGathering(pc: RTCPeerConnection, timeoutMs = 60000): Promise<void> {
  return new Promise((resolve) => {
    if (pc.iceGatheringState === 'complete') {
      resolve();
      return;
    }

    const timeout = setTimeout(() => {
      logger.log('ICE gathering timeout, proceeding with collected candidates');
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
 * ERR-25 Fix: Add onError callback to surface errors to users
 */
export function setupDataChannel(
  channel: RTCDataChannel,
  onMessage: (data: any) => void,
  onOpen?: () => void,
  onClose?: () => void,
  onError?: (error: Event) => void
): void {
  channel.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (error) {
      logger.error('Failed to parse data channel message:', error);
    }
  };

  channel.onopen = () => {
    logger.log(`Data channel "${channel.label}" opened`);
    if (onOpen) onOpen();
  };

  channel.onclose = () => {
    logger.log(`Data channel "${channel.label}" closed`);
    if (onClose) onClose();
  };

  channel.onerror = (error) => {
    logger.error(`Data channel "${channel.label}" error:`, error);
    // ERR-25 Fix: Call the onError callback if provided
    if (onError) onError(error);
  };
}

/**
 * Send a message via data channel with backpressure handling
 * Returns true if message was sent or queued, false if it was dropped
 */
// Queue for storing messages when buffer is full - now managed per-channel in use-multiplayer.ts
// These are kept for backward compatibility but queues are now per-channel
const MAX_QUEUE_SIZE = 100;
const BUFFER_LIMIT = 1024 * 1024; // 1MB
const QUEUE_PROCESS_INTERVAL = 50; // ms

/**
 * Send a message via data channel
 * Returns true if message was sent, false otherwise
 * Note: For queuing messages with backpressure handling, use the per-peer
 * queue management in use-multiplayer.ts
 */
export function sendDataChannelMessage(channel: RTCDataChannel, data: any): boolean {
  if (channel.readyState !== 'open') {
    return false;
  }
  
  try {
    channel.send(JSON.stringify(data));
    return true;
  } catch (error) {
    logger.error('Failed to send data channel message:', error);
    return false;
  }
}

/**
 * Clean up queue processor - kept for backward compatibility
 * Queue processing is now handled per-peer in use-multiplayer.ts
 * @deprecated Use per-peer queue management in use-multiplayer.ts
 */
export function cleanupQueueProcessor() {
  // No-op: queue processing is now handled per-peer in use-multiplayer.ts
  logger.log('cleanupQueueProcessor: Queue processing moved to per-peer management in use-multiplayer.ts');
}