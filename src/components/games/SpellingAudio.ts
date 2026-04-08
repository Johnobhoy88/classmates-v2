/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 *
 * SPELLING AUDIO — Procedural ambient forest + enhanced SFX
 * Soft pad drone, cricket chirps, wind whispers, plus
 * premium correct/wrong/streak/complete sounds
 * All Web Audio API, zero audio files
 */

let ctx: AudioContext | null = null;
let ambientRunning = false;
let ambientNodes: AudioNode[] = [];

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// === AMBIENT FOREST ===

export function startAmbient() {
  if (ambientRunning) return;
  const c = getCtx();
  ambientRunning = true;

  // Soft pad drone — filtered sawtooth, very quiet
  const padOsc = c.createOscillator();
  const padOsc2 = c.createOscillator();
  const padFilter = c.createBiquadFilter();
  const padGain = c.createGain();
  padOsc.type = 'sawtooth';
  padOsc.frequency.value = 65; // Low C
  padOsc2.type = 'sawtooth';
  padOsc2.frequency.value = 65.5; // Slight detune for warmth
  padFilter.type = 'lowpass';
  padFilter.frequency.value = 200;
  padFilter.Q.value = 1;
  padGain.gain.value = 0;
  padOsc.connect(padFilter);
  padOsc2.connect(padFilter);
  padFilter.connect(padGain);
  padGain.connect(c.destination);
  padOsc.start();
  padOsc2.start();
  // Fade in
  padGain.gain.linearRampToValueAtTime(0.035, c.currentTime + 3);
  ambientNodes.push(padOsc, padOsc2, padFilter, padGain);

  // Wind — filtered noise
  const windSize = c.sampleRate * 2;
  const windBuf = c.createBuffer(1, windSize, c.sampleRate);
  const windData = windBuf.getChannelData(0);
  for (let i = 0; i < windSize; i++) windData[i] = Math.random() * 2 - 1;
  const windSrc = c.createBufferSource();
  windSrc.buffer = windBuf;
  windSrc.loop = true;
  const windFilter = c.createBiquadFilter();
  windFilter.type = 'bandpass';
  windFilter.frequency.value = 400;
  windFilter.Q.value = 0.5;
  const windGain = c.createGain();
  windGain.gain.value = 0;
  windSrc.connect(windFilter);
  windFilter.connect(windGain);
  windGain.connect(c.destination);
  windSrc.start();
  windGain.gain.linearRampToValueAtTime(0.02, c.currentTime + 4);
  // Modulate wind volume
  const windLfo = c.createOscillator();
  const windLfoGain = c.createGain();
  windLfo.frequency.value = 0.15;
  windLfoGain.gain.value = 0.008;
  windLfo.connect(windLfoGain);
  windLfoGain.connect(windGain.gain);
  windLfo.start();
  ambientNodes.push(windSrc, windFilter, windGain, windLfo, windLfoGain);

  // Cricket chirps — periodic high-frequency bursts
  scheduleCrickets(c);
}

function scheduleCrickets(c: AudioContext) {
  if (!ambientRunning) return;
  const delay = 0.5 + Math.random() * 2;
  setTimeout(() => {
    if (!ambientRunning) return;
    chirp(c);
    scheduleCrickets(c);
  }, delay * 1000);
}

function chirp(c: AudioContext) {
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'sine';
  osc.frequency.value = 4000 + Math.random() * 2000;
  gain.gain.value = 0.015 + Math.random() * 0.01;
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(c.currentTime);
  // Rapid chirp pattern
  const chirpLen = 0.03;
  const chirps = 2 + Math.floor(Math.random() * 4);
  for (let i = 0; i < chirps; i++) {
    gain.gain.setValueAtTime(0.015, c.currentTime + i * chirpLen * 2);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + i * chirpLen * 2 + chirpLen);
  }
  osc.stop(c.currentTime + chirps * chirpLen * 2 + 0.1);
}

export function stopAmbient() {
  ambientRunning = false;
  if (!ctx) return;
  const now = ctx.currentTime;
  for (const node of ambientNodes) {
    try {
      if (node instanceof GainNode) {
        node.gain.linearRampToValueAtTime(0, now + 1);
      }
      if (node instanceof OscillatorNode || node instanceof AudioBufferSourceNode) {
        (node as OscillatorNode).stop(now + 1.5);
      }
    } catch { /* already stopped */ }
  }
  ambientNodes = [];
}

// === ENHANCED SFX ===

function playNote(freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.3, delay = 0) {
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = 0;
    gain.gain.linearRampToValueAtTime(vol, c.currentTime + delay + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + dur);
    osc.start(c.currentTime + delay);
    osc.stop(c.currentTime + delay + dur + 0.05);
  } catch { /* audio not available */ }
}

export function sfxCorrectLetter() {
  // Bright ascending chime
  playNote(880, 0.08, 'sine', 0.15);
  playNote(1100, 0.1, 'sine', 0.12, 0.05);
}

export function sfxWrongLetter() {
  // Low buzz
  playNote(150, 0.12, 'square', 0.1);
  playNote(130, 0.15, 'square', 0.08, 0.08);
}

export function sfxWordComplete() {
  // Ascending arpeggio — C E G C
  playNote(523, 0.1, 'sine', 0.2);
  playNote(659, 0.1, 'sine', 0.2, 0.08);
  playNote(784, 0.1, 'sine', 0.2, 0.16);
  playNote(1047, 0.2, 'sine', 0.25, 0.24);
}

export function sfxWordFailed() {
  // Descending sad — E C
  playNote(330, 0.15, 'triangle', 0.15);
  playNote(262, 0.25, 'triangle', 0.12, 0.15);
}

export function sfxStreak() {
  // Fast ascending with shimmer
  playNote(523, 0.06, 'sine', 0.15);
  playNote(659, 0.06, 'sine', 0.15, 0.06);
  playNote(784, 0.06, 'sine', 0.15, 0.12);
  playNote(1047, 0.15, 'sine', 0.2, 0.18);
  // Shimmer overlay
  playNote(2093, 0.3, 'sine', 0.04, 0.18);
}

export function sfxGameComplete() {
  // Grand fanfare
  playNote(392, 0.12, 'sine', 0.2);
  playNote(523, 0.12, 'sine', 0.2, 0.12);
  playNote(659, 0.12, 'sine', 0.22, 0.24);
  playNote(784, 0.15, 'sine', 0.25, 0.36);
  playNote(1047, 0.4, 'sine', 0.3, 0.48);
  // Harmony
  playNote(659, 0.4, 'sine', 0.15, 0.48);
  playNote(784, 0.4, 'sine', 0.15, 0.48);
}

export function sfxKeyPress() {
  // Soft click
  playNote(600, 0.03, 'sine', 0.06);
}

export function sfxHeartLost() {
  // Glass break feel
  playNote(800, 0.05, 'square', 0.08);
  playNote(400, 0.1, 'square', 0.06, 0.05);
  playNote(200, 0.15, 'square', 0.04, 0.1);
}
