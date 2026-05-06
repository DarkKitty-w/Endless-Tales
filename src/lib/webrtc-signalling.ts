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
 */
export function encodeSignallingData(pkg: SignallingPackage): string {
  try {
    const json = JSON.stringify(pkg);
    // Use btoa for base64 encoding (browser-compatible)
    return btoa(unescape(encodeURIComponent(json)));
  } catch (error) {
    logger.error('Failed to encode signalling data:', error);
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
    logger.error('Failed to decode signalling data:', error);
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

  // Create data channels
  const controlChannel = pc.createDataChannel('control', { ordered: true });
  pc.createDataChannel('game-actions', { ordered: true });
  pc.createDataChannel('story-update', { ordered: true });
  pc.createDataChannel('party-state', { ordered: true });
  pc.createDataChannel('chat', { ordered: true });
  
  // Set up the control channel to send ICE candidates in real-time
  setDataChannel(controlChannel);

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

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
  const { pc, getBufferedCandidates, setDataChannel } = createPeerConnection(
    (candidate) => {
      onIceCandidate(candidate);
    },
    (state) => logger.log('Guest connection state:', state)
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
 */
export async function handleIceCandidateMessage(
  pc: RTCPeerConnection,
  message: IceCandidateMessage
): Promise<void> {
  if (message.type === 'ice-candidate' && message.candidate) {
    try {
      await pc.addIceCandidate(message.candidate);
    } catch (error) {
      logger.error('Failed to add ICE candidate:', error);
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
  };
}

/**
 * Send a message via data channel with backpressure handling
 * Returns true if message was sent or queued, false if it was dropped
 */
// Queue for storing messages when buffer is full
const messageQueue: { channel: RTCDataChannel; data: any; timestamp: number }[] = [];
const MAX_QUEUE_SIZE = 100;
const BUFFER_LIMIT = 1024 * 1024; // 1MB
const QUEUE_PROCESS_INTERVAL = 50; // ms
let queueProcessorInitialized = false;
let queueProcessorTimeoutId: ReturnType<typeof setTimeout> | null = null;

function processMessageQueue() {
  const now = Date.now();
  // Remove messages older than 30 seconds
  const validMessages = messageQueue.filter(msg => now - msg.timestamp < 30000);
  messageQueue.length = 0;
  messageQueue.push(...validMessages);
  
  // Try to send queued messages
  for (let i = messageQueue.length - 1; i >= 0; i--) {
    const msg = messageQueue[i];
    if (msg.channel.readyState === 'open' && msg.channel.bufferedAmount < BUFFER_LIMIT / 2) {
      try {
        msg.channel.send(JSON.stringify(msg.data));
        messageQueue.splice(i, 1); // Remove from queue on successful send
      } catch (error) {
        // Keep in queue, will retry next time
      }
    }
  }
  
  // Reschedule if there are still messages in the queue
  if (messageQueue.length > 0) {
    queueProcessorTimeoutId = setTimeout(processMessageQueue, QUEUE_PROCESS_INTERVAL);
  } else {
    queueProcessorTimeoutId = null;
  }
}

function initializeQueueProcessor() {
  if (queueProcessorInitialized) return;
  queueProcessorInitialized = true;
  
  // Start processing if there are messages
  if (messageQueue.length > 0 && !queueProcessorTimeoutId) {
    queueProcessorTimeoutId = setTimeout(processMessageQueue, QUEUE_PROCESS_INTERVAL);
  }
}

// Helper function to schedule queue processing when a new message is queued
function scheduleQueueProcessing() {
  if (!queueProcessorTimeoutId && messageQueue.length > 0) {
    queueProcessorTimeoutId = setTimeout(processMessageQueue, QUEUE_PROCESS_INTERVAL);
  }
}

export function sendDataChannelMessage(channel: RTCDataChannel, data: any): boolean {
  if (channel.readyState !== 'open') {
    return false;
  }
  
  // Check buffer amount to implement backpressure
  if (channel.bufferedAmount > BUFFER_LIMIT) {
    logger.warn('Data channel buffer full, message queued');
    
    // Queue the message if not too many already
    if (messageQueue.length < MAX_QUEUE_SIZE) {
      messageQueue.push({ channel, data, timestamp: Date.now() });
      // Schedule processing for queued messages
      scheduleQueueProcessing();
      return true; // Message is queued (will be sent later)
    } else {
      logger.error('Message queue full, dropping message');
      return false; // Queue is full, message dropped
    }
  }
  
  try {
    channel.send(JSON.stringify(data));
    return true;
  } catch (error) {
    logger.error('Failed to send data channel message:', error);
    return false;
  }
}