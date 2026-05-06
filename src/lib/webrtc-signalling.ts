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
  let isDataChannelReady = false;

  const pc = new RTCPeerConnection({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  });

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      const candidateJson = event.candidate.toJSON();
      
      // If we have an established data channel, send candidate immediately
      if (dataChannelForIce && isDataChannelReady) {
        const message: IceCandidateMessage = {
          type: 'ice-candidate',
          candidate: candidateJson,
        };
        try {
          dataChannelForIce.send(JSON.stringify(message));
          onIceCandidate(candidateJson);
          return;
        } catch (error) {
          console.error('Failed to send ICE candidate via data channel:', error);
          // Fall through to buffering if send fails
        }
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
      return [...bufferedCandidates]; // Don't clear here - will be cleared when sent
    },
    setDataChannel: (dc: RTCDataChannel) => {
      dataChannelForIce = dc;
      
      // Track ready state properly
      const sendBufferedCandidates = () => {
        isDataChannelReady = true;
        // Send any buffered candidates now
        const toSend = [...bufferedCandidates]; // Copy the array
        bufferedCandidates.length = 0; // Clear the buffer
        
        for (const candidate of toSend) {
          const message: IceCandidateMessage = {
            type: 'ice-candidate',
            candidate,
          };
          try {
            dc.send(JSON.stringify(message));
          } catch (error) {
            console.error('Failed to send buffered ICE candidate:', error);
            // Put it back in buffer if send fails
            bufferedCandidates.push(candidate);
          }
        }
      };
      
      if (dc.readyState === 'open') {
        sendBufferedCandidates();
      } else {
        // When data channel opens, send any buffered candidates
        const originalOnOpen = dc.onopen;
        dc.onopen = (event) => {
          sendBufferedCandidates();
          // Call original onopen if it exists
          if (originalOnOpen) {
            if (typeof originalOnOpen === 'function') {
              originalOnOpen.call(dc, event);
            }
          }
        };
      }
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
    (state) => console.log('Host connection state:', state)
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
    (state) => console.log('Guest connection state:', state)
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
  console.log('sendBufferedIceCandidates: Candidates are now sent automatically via data channel');
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
      console.error('Failed to add ICE candidate:', error);
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