/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 */

// Procedural Web Audio sound effects — zero audio files needed
let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

function playTone(freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.3) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = vol;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + dur);
  } catch {
    // Audio not available
  }
}

export function sfxCorrect() {
  playTone(523, 0.1, 'sine', 0.25);
  setTimeout(() => playTone(659, 0.1, 'sine', 0.25), 100);
  setTimeout(() => playTone(784, 0.15, 'sine', 0.3), 200);
}

export function sfxWrong() {
  playTone(200, 0.15, 'square', 0.15);
  setTimeout(() => playTone(180, 0.2, 'square', 0.12), 150);
}

export function sfxStreak() {
  playTone(523, 0.08, 'sine', 0.2);
  setTimeout(() => playTone(659, 0.08, 'sine', 0.2), 80);
  setTimeout(() => playTone(784, 0.08, 'sine', 0.2), 160);
  setTimeout(() => playTone(1047, 0.2, 'sine', 0.3), 240);
}

export function sfxLevelUp() {
  playTone(392, 0.1, 'sine', 0.2);
  setTimeout(() => playTone(523, 0.1, 'sine', 0.2), 120);
  setTimeout(() => playTone(659, 0.1, 'sine', 0.25), 240);
  setTimeout(() => playTone(784, 0.15, 'sine', 0.3), 360);
  setTimeout(() => playTone(1047, 0.25, 'sine', 0.35), 480);
}

export function sfxClick() {
  playTone(800, 0.05, 'sine', 0.1);
}
