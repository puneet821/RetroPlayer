// Web Audio API Equalizer and Reverb Pipeline Manager

let audioContext: AudioContext | null = null;
let sourceNode: MediaElementAudioSourceNode | null = null;
let bassFilterNode: BiquadFilterNode | null = null;
let convolverNode: ConvolverNode | null = null;
let dryGainNode: GainNode | null = null;
let wetGainNode: GainNode | null = null;

// Generate a procedural impulse response buffer for rich reverb/hall simulation
function createImpulseResponse(context: AudioContext, duration: number, decay: number): AudioBuffer {
  const sampleRate = context.sampleRate;
  const length = sampleRate * duration;
  const impulse = context.createBuffer(2, length, sampleRate);
  
  const left = impulse.getChannelData(0);
  const right = impulse.getChannelData(1);
  
  for (let i = 0; i < length; i++) {
    const decayValue = Math.exp(-i / (sampleRate * decay));
    // High-fidelity stereo ambient reverberation using randomized noise decay
    left[i] = (Math.random() * 2 - 1) * decayValue;
    right[i] = (Math.random() * 2 - 1) * decayValue;
  }
  
  return impulse;
}

let outputAudioElement: HTMLAudioElement | null = null;
let mediaStreamDestination: MediaStreamAudioDestinationNode | null = null;

export function initializeAudioPipeline(audioElement: HTMLAudioElement) {
  if (audioContext) return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioContext = new AudioContextClass();
    
    // Create nodes
    sourceNode = audioContext.createMediaElementSource(audioElement);
    bassFilterNode = audioContext.createBiquadFilter();
    dryGainNode = audioContext.createGain();
    wetGainNode = audioContext.createGain();
    
    // Create a MediaStream destination to pipe audio back to an HTML5 Audio element
    mediaStreamDestination = audioContext.createMediaStreamDestination();

    // Configure Bass Filter (Low-shelf boost)
    bassFilterNode.type = 'lowshelf';
    bassFilterNode.frequency.value = 180; // Extended range for richer bass
    bassFilterNode.Q.value = 1;
    bassFilterNode.gain.value = 0; // Flat initially

    // Configure Dry/Wet Reverb Paths
    dryGainNode.gain.value = 1.0;
    wetGainNode.gain.value = 0.0;

    // Connections:
    // source -> bassFilter
    sourceNode.connect(bassFilterNode);

    // Split: 
    // 1. Dry Path: bassFilter -> dryGain -> destination
    bassFilterNode.connect(dryGainNode);
    dryGainNode.connect(mediaStreamDestination);

    // 2. Wet Path: wetGain -> destination (convolver connects dynamically)
    wetGainNode.connect(mediaStreamDestination);

    // Create a secondary hidden audio element to play the stream
    // This is the CRITICAL fix for iOS background playback:
    // iOS will suspend audioContext.destination in the background, but it will
    // keep playing an HTMLAudioElement with a stream source.
    if (!outputAudioElement) {
      outputAudioElement = new Audio();
      outputAudioElement.crossOrigin = 'anonymous';
      outputAudioElement.srcObject = mediaStreamDestination.stream;
      
      // Keep play/pause in sync with the main audio element
      audioElement.addEventListener('play', () => {
        if (audioContext?.state === 'suspended') {
          audioContext.resume();
        }
        outputAudioElement?.play().catch(e => console.warn('Output audio play failed:', e));
      });
      
      audioElement.addEventListener('pause', () => {
        outputAudioElement?.pause();
      });
    }

  } catch (error) {
    console.error('Failed to initialize Web Audio API equalizer pipeline:', error);
  }
}

// Cache variables to prevent repeated heavy procedural buffer generation
let cachedReverbBuffer: AudioBuffer | null = null;
let cachedHallBuffer: AudioBuffer | null = null;

export function resumeAudioContext() {
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume();
  }
}

export function suspendAudioContext() {
  if (audioContext && audioContext.state === 'running') {
    audioContext.suspend();
  }
}
export function setEqualizerPreset(mode: 'flat' | 'bass' | 'reverb' | 'hall') {
  if (!audioContext || !bassFilterNode || !dryGainNode || !wetGainNode) {
    return;
  }

  // Ensure AudioContext is active
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  const now = audioContext.currentTime;

  // Crucial: Disconnect old convolver node because Web Audio API ConvolverNode 
  // buffers can only be set ONCE. Re-creating the node on preset switch is the 
  // standard high-fidelity way to transition presets dynamically.
  if (convolverNode) {
    try {
      convolverNode.disconnect();
    } catch (e) {}
    convolverNode = null;
  }

  switch (mode) {
    case 'flat':
      // Reset low-shelf filter
      bassFilterNode.gain.setTargetAtTime(0, now, 0.02);
      // Reverb wet mix to 0, dry mix to 1
      dryGainNode.gain.setTargetAtTime(1.0, now, 0.02);
      wetGainNode.gain.setTargetAtTime(0.0, now, 0.02);
      break;

    case 'bass':
      // Heavy deep low boost (+14 dB) for a very warm, prominent bass response!
      bassFilterNode.gain.setTargetAtTime(14, now, 0.02);
      // Reverb wet mix to 0, dry mix to 1
      dryGainNode.gain.setTargetAtTime(1.0, now, 0.02);
      wetGainNode.gain.setTargetAtTime(0.0, now, 0.02);
      break;

    case 'reverb':
      // Reset low-shelf filter
      bassFilterNode.gain.setTargetAtTime(0, now, 0.02);
      
      // Dynamically instantiate new convolver with warm room IR
      convolverNode = audioContext.createConvolver();
      if (!cachedReverbBuffer) {
        cachedReverbBuffer = createImpulseResponse(audioContext, 1.8, 1.1);
      }
      convolverNode.buffer = cachedReverbBuffer;
      
      // Connect: filter -> convolver -> wetGain
      bassFilterNode.connect(convolverNode);
      convolverNode.connect(wetGainNode);

      // Pronounced reverb mix (high wet gain, lower dry gain to make room acoustics clear)
      dryGainNode.gain.setTargetAtTime(0.55, now, 0.02);
      wetGainNode.gain.setTargetAtTime(0.85, now, 0.02);
      break;

    case 'hall':
      // Reset low-shelf filter
      bassFilterNode.gain.setTargetAtTime(0, now, 0.02);
      
      // Dynamically instantiate new convolver with deep grand hall IR
      convolverNode = audioContext.createConvolver();
      if (!cachedHallBuffer) {
        cachedHallBuffer = createImpulseResponse(audioContext, 3.8, 2.5);
      }
      convolverNode.buffer = cachedHallBuffer;
      
      // Connect: filter -> convolver -> wetGain
      bassFilterNode.connect(convolverNode);
      convolverNode.connect(wetGainNode);

      // Deep grand cathedral echoes (very high wet gain, low dry gain to emphasize echo tail)
      dryGainNode.gain.setTargetAtTime(0.35, now, 0.02);
      wetGainNode.gain.setTargetAtTime(1.15, now, 0.02);
      break;
  }
}
