// Web Audio API sound generator for seamless, zero-dependency audio notifications

let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Play a sequence of harmonic notes
 * @param {Array<{freq: number, start: number, duration: number, gain?: number}>} notes 
 */
export function playChime(type = 'study-end', enabled = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.3, ctx.currentTime);
    masterGain.connect(ctx.destination);

    if (type === 'study-end') {
      // Pleasant relaxing break transition chime: E5 -> G#5 -> B5 -> E6
      const freqs = [659.25, 830.61, 987.77, 1318.51];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const startTime = ctx.currentTime + idx * 0.16;
        const endTime = startTime + 0.8;

        noteGain.gain.setValueAtTime(0.001, startTime);
        noteGain.gain.exponentialRampToValueAtTime(0.35, startTime + 0.04);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, endTime);

        osc.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(startTime);
        osc.stop(endTime);
      });
    } else if (type === 'break-end') {
      // Energizing study alert: C5 -> E5 -> G5 -> C6
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const startTime = ctx.currentTime + idx * 0.14;
        const endTime = startTime + 0.9;

        noteGain.gain.setValueAtTime(0.001, startTime);
        noteGain.gain.exponentialRampToValueAtTime(0.4, startTime + 0.03);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, endTime);

        osc.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(startTime);
        osc.stop(endTime);
      });
    } else if (type === 'click') {
      // Subtle click feedback
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      noteGain.gain.setValueAtTime(0.08, ctx.currentTime);
      noteGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(noteGain);
      noteGain.connect(masterGain);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    }
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
}
