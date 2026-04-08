/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 *
 * REACTIVE AUDIO — Musical scale system + ambient forest
 * Correct letters play ascending scale notes, streaks add harmony,
 * wind maps to lives, cricket rate maps to streak excitement
 */

let ctx: AudioContext | null = null;
let ambientRunning = false;
let ambientNodes: AudioNode[] = [];
let cricketInterval: ReturnType<typeof setTimeout> | null = null;
let scaleIndex = 0;

// C major scale frequencies
const C_MAJOR = [261.6, 293.7, 329.6, 349.2, 392.0, 440.0, 493.9, 523.3];
// A minor for hard mode
const A_MINOR = [220.0, 246.9, 261.6, 293.7, 329.6, 349.2, 392.0, 440.0];

let currentScale = C_MAJOR;
let windGainNode: GainNode | null = null;
let padGainNode: GainNode | null = null;
let streakPadNode: OscillatorNode | null = null;
let streakPadGain: GainNode | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// === AMBIENT ===

export function startAmbient(difficulty: number = 1) {
  if (ambientRunning) return;
  const c = getCtx();
  ambientRunning = true;
  currentScale = difficulty >= 3 ? A_MINOR : C_MAJOR;
  scaleIndex = 0;

  // Pad drone
  const padOsc = c.createOscillator();
  const padOsc2 = c.createOscillator();
  const padFilter = c.createBiquadFilter();
  padGainNode = c.createGain();
  padOsc.type = 'sawtooth';
  padOsc.frequency.value = currentScale[0] / 4;
  padOsc2.type = 'sawtooth';
  padOsc2.frequency.value = currentScale[0] / 4 + 0.5;
  padFilter.type = 'lowpass';
  padFilter.frequency.value = 200;
  padFilter.Q.value = 1;
  padGainNode.gain.value = 0;
  padOsc.connect(padFilter); padOsc2.connect(padFilter);
  padFilter.connect(padGainNode); padGainNode.connect(c.destination);
  padOsc.start(); padOsc2.start();
  padGainNode.gain.linearRampToValueAtTime(0.03, c.currentTime + 3);
  ambientNodes.push(padOsc, padOsc2, padFilter, padGainNode);

  // Wind
  const windBuf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
  const d = windBuf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const windSrc = c.createBufferSource();
  windSrc.buffer = windBuf; windSrc.loop = true;
  const windFilter = c.createBiquadFilter();
  windFilter.type = 'bandpass'; windFilter.frequency.value = 400; windFilter.Q.value = 0.5;
  windGainNode = c.createGain();
  windGainNode.gain.value = 0;
  windSrc.connect(windFilter); windFilter.connect(windGainNode); windGainNode.connect(c.destination);
  windSrc.start();
  windGainNode.gain.linearRampToValueAtTime(0.015, c.currentTime + 4);
  const windLfo = c.createOscillator();
  const windLfoGain = c.createGain();
  windLfo.frequency.value = 0.15; windLfoGain.gain.value = 0.006;
  windLfo.connect(windLfoGain); windLfoGain.connect(windGainNode.gain);
  windLfo.start();
  ambientNodes.push(windSrc, windFilter, windGainNode, windLfo, windLfoGain);

  // Crickets
  scheduleCrickets(c, 1500);
}

function scheduleCrickets(c: AudioContext, baseDelay: number) {
  if (!ambientRunning) return;
  cricketInterval = setTimeout(() => {
    if (!ambientRunning) return;
    chirp(c);
    scheduleCrickets(c, baseDelay);
  }, baseDelay * (0.5 + Math.random()));
}

function chirp(c: AudioContext) {
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'sine';
  osc.frequency.value = 4000 + Math.random() * 2000;
  gain.gain.value = 0;
  osc.connect(gain); gain.connect(c.destination);
  osc.start(c.currentTime);
  const len = 0.03;
  const count = 2 + Math.floor(Math.random() * 4);
  for (let i = 0; i < count; i++) {
    gain.gain.setValueAtTime(0.012, c.currentTime + i * len * 2);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + i * len * 2 + len);
  }
  osc.stop(c.currentTime + count * len * 2 + 0.1);
}

/** Update ambient reactively based on game state */
export function updateAmbientState(livesRatio: number, streak: number) {
  if (!ctx || !ambientRunning) return;
  // Wind intensity inversely maps to lives
  if (windGainNode) {
    const target = 0.01 + (1 - livesRatio) * 0.03;
    windGainNode.gain.linearRampToValueAtTime(target, ctx.currentTime + 0.5);
  }
  // Streak adds harmony pad
  if (streak >= 3 && !streakPadNode) {
    streakPadNode = ctx.createOscillator();
    streakPadGain = ctx.createGain();
    streakPadNode.type = 'sine';
    streakPadNode.frequency.value = currentScale[4]; // 5th
    streakPadGain.gain.value = 0;
    streakPadNode.connect(streakPadGain); streakPadGain.connect(ctx.destination);
    streakPadNode.start();
    streakPadGain.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 1);
    ambientNodes.push(streakPadNode, streakPadGain);
  } else if (streak < 3 && streakPadGain) {
    streakPadGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
    try { streakPadNode?.stop(ctx.currentTime + 1); } catch {}
    streakPadNode = null; streakPadGain = null;
  }
}

export function stopAmbient() {
  ambientRunning = false;
  if (cricketInterval) clearTimeout(cricketInterval);
  cricketInterval = null;
  streakPadNode = null; streakPadGain = null;
  windGainNode = null; padGainNode = null;
  if (!ctx) return;
  const now = ctx.currentTime;
  for (const node of ambientNodes) {
    try {
      if (node instanceof GainNode) node.gain.linearRampToValueAtTime(0, now + 1);
      if (node instanceof OscillatorNode || node instanceof AudioBufferSourceNode) {
        (node as OscillatorNode).stop(now + 1.5);
      }
    } catch {}
  }
  ambientNodes = [];
}

// === MUSICAL SCALE SFX ===

function playNote(freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.3, delay = 0) {
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain); gain.connect(c.destination);
    osc.type = type; osc.frequency.value = freq;
    gain.gain.value = 0;
    gain.gain.linearRampToValueAtTime(vol, c.currentTime + delay + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + dur);
    osc.start(c.currentTime + delay);
    osc.stop(c.currentTime + delay + dur + 0.05);
  } catch {}
}

/** Correct letter — plays next note in ascending scale */
export function sfxCorrectLetter() {
  const freq = currentScale[scaleIndex % currentScale.length];
  // Play note + octave shimmer
  playNote(freq, 0.12, 'sine', 0.18);
  playNote(freq * 2, 0.08, 'sine', 0.04, 0.02);
  scaleIndex++;
}

/** Wrong letter — discordant note (tritone off current) */
export function sfxWrongLetter() {
  const baseFreq = currentScale[scaleIndex % currentScale.length];
  playNote(baseFreq * 0.71, 0.15, 'triangle', 0.1); // tritone below
  playNote(baseFreq * 0.5, 0.2, 'square', 0.05, 0.06);
}

/** Word complete — resolve chord (I-III-V-I) */
export function sfxWordComplete() {
  const root = currentScale[0];
  playNote(root, 0.15, 'sine', 0.18);
  playNote(currentScale[2], 0.15, 'sine', 0.15, 0.08);
  playNote(currentScale[4], 0.15, 'sine', 0.15, 0.16);
  playNote(root * 2, 0.25, 'sine', 0.2, 0.24);
  // Reset scale for next word
  scaleIndex = 0;
}

/** Word failed — sad descending */
export function sfxWordFailed() {
  playNote(currentScale[2], 0.15, 'triangle', 0.12);
  playNote(currentScale[0], 0.3, 'triangle', 0.1, 0.15);
  scaleIndex = 0;
}

/** Streak milestone — fast ascending arpeggio + shimmer */
export function sfxStreak() {
  for (let i = 0; i < currentScale.length; i++) {
    playNote(currentScale[i], 0.06, 'sine', 0.12, i * 0.04);
  }
  playNote(currentScale[0] * 2, 0.3, 'sine', 0.15, currentScale.length * 0.04);
  playNote(currentScale[0] * 4, 0.4, 'sine', 0.03, currentScale.length * 0.04); // shimmer
}

/** Game complete — grand fanfare */
export function sfxGameComplete() {
  const root = currentScale[0];
  playNote(root, 0.12, 'sine', 0.2);
  playNote(currentScale[2], 0.12, 'sine', 0.18, 0.1);
  playNote(currentScale[4], 0.12, 'sine', 0.2, 0.2);
  playNote(root * 2, 0.15, 'sine', 0.25, 0.3);
  playNote(root * 2, 0.5, 'sine', 0.3, 0.42);
  // Harmony
  playNote(currentScale[2] * 2, 0.5, 'sine', 0.12, 0.42);
  playNote(currentScale[4] * 2, 0.5, 'sine', 0.12, 0.42);
  // Shimmer
  playNote(root * 4, 0.6, 'sine', 0.04, 0.42);
}

/** Soft key press click */
export function sfxKeyPress() {
  playNote(600, 0.02, 'sine', 0.04);
}

/** Heart lost — glass shatter */
export function sfxHeartLost() {
  playNote(800, 0.04, 'square', 0.06);
  playNote(400, 0.08, 'square', 0.04, 0.04);
  playNote(200, 0.12, 'square', 0.03, 0.08);
}

/** Reset scale index (called on new word) */
export function resetScale() {
  scaleIndex = 0;
}
