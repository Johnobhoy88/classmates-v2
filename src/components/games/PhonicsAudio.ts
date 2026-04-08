/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 *
 * OCEAN AUDIO — Underwater ambient + F major musical SFX
 * Soft underwater pad, gentle bubbles, whale-like tones
 */

let ctx: AudioContext | null = null;
let ambientRunning = false;
let ambientNodes: AudioNode[] = [];
let bubbleInterval: ReturnType<typeof setTimeout> | null = null;
let arpeggioInterval: ReturnType<typeof setTimeout> | null = null;
let scaleIndex = 0;

// F major scale — warm, bright, oceanic
const F_MAJOR = [349.2, 392.0, 440.0, 466.2, 523.3, 587.3, 659.3, 698.5];
const currentScale = F_MAJOR;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function startAmbient() {
  if (ambientRunning) return;
  const c = getCtx();
  ambientRunning = true;
  scaleIndex = 0;

  // Underwater pad — soft filtered sine chord (F, A, C)
  const padGain = c.createGain();
  padGain.gain.value = 0;
  padGain.connect(c.destination);
  const padFreqs = [F_MAJOR[0] / 2, F_MAJOR[2] / 2, F_MAJOR[4] / 2]; // F3, A3, C4
  for (const freq of padFreqs) {
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const filter = c.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 500;
    osc.connect(filter);
    filter.connect(padGain);
    osc.start();
    ambientNodes.push(osc, filter);
  }
  // Gentle breathing LFO
  const lfo = c.createOscillator();
  const lfoGain = c.createGain();
  lfo.frequency.value = 0.08;
  lfoGain.gain.value = 0.006;
  lfo.connect(lfoGain);
  lfoGain.connect(padGain.gain);
  lfo.start();
  ambientNodes.push(padGain, lfo, lfoGain);
  padGain.gain.linearRampToValueAtTime(0.025, c.currentTime + 3);

  // Water texture — very soft filtered noise
  const noiseBuf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const noiseSrc = c.createBufferSource();
  noiseSrc.buffer = noiseBuf; noiseSrc.loop = true;
  const noiseFilter = c.createBiquadFilter();
  noiseFilter.type = 'lowpass'; noiseFilter.frequency.value = 300;
  const noiseGain = c.createGain();
  noiseGain.gain.value = 0;
  noiseSrc.connect(noiseFilter); noiseFilter.connect(noiseGain); noiseGain.connect(c.destination);
  noiseSrc.start();
  noiseGain.gain.linearRampToValueAtTime(0.012, c.currentTime + 4);
  ambientNodes.push(noiseSrc, noiseFilter, noiseGain);

  // Harp arpeggio — gentle cycling F-A-C-F'-C-A
  const arpPattern = [0, 2, 4, 7, 4, 2];
  let arpIdx = 0;
  function playArpNote() {
    if (!ambientRunning) return;
    const degree = arpPattern[arpIdx % arpPattern.length];
    const freq = currentScale[degree % currentScale.length] * (degree >= 7 ? 2 : 1);
    try {
      const osc = c.createOscillator();
      const osc2 = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'sine'; osc.frequency.value = freq;
      osc2.type = 'sine'; osc2.frequency.value = freq * 2;
      const g2 = c.createGain(); g2.gain.value = 0.25;
      osc.connect(gain); osc2.connect(g2); g2.connect(gain);
      gain.connect(c.destination);
      gain.gain.value = 0.05;
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 2);
      osc.start(); osc.stop(c.currentTime + 2.5);
      osc2.start(); osc2.stop(c.currentTime + 2);
    } catch {}
    arpIdx++;
    arpeggioInterval = setTimeout(playArpNote, 900 + (arpIdx % 2 === 0 ? 150 : 0) + Math.random() * 100);
  }
  arpeggioInterval = setTimeout(playArpNote, 2000);

  // Random bubble pops
  scheduleBubbles(c);
}

function scheduleBubbles(c: AudioContext) {
  if (!ambientRunning) return;
  bubbleInterval = setTimeout(() => {
    if (!ambientRunning) return;
    bubblePop(c);
    scheduleBubbles(c);
  }, 1500 + Math.random() * 2000);
}

function bubblePop(c: AudioContext) {
  try {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.value = 1200 + Math.random() * 800;
    osc.frequency.exponentialRampToValueAtTime(400, c.currentTime + 0.08);
    gain.gain.value = 0.015;
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.1);
    osc.connect(gain); gain.connect(c.destination);
    osc.start(); osc.stop(c.currentTime + 0.15);
  } catch {}
}

export function stopAmbient() {
  ambientRunning = false;
  if (bubbleInterval) clearTimeout(bubbleInterval);
  if (arpeggioInterval) clearTimeout(arpeggioInterval);
  bubbleInterval = null; arpeggioInterval = null;
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

// === SFX ===

function playNote(freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.15, delay = 0) {
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

function playBell(freq: number, dur: number, vol = 0.12, delay = 0) {
  playNote(freq, dur * 1.5, 'sine', vol, delay);
  playNote(freq * 2, dur * 0.7, 'sine', vol * 0.25, delay);
  playNote(freq, dur * 0.7, 'sine', vol * 0.1, delay + 0.1); // echo
}

export function sfxCorrect() {
  const freq = currentScale[scaleIndex % currentScale.length];
  playBell(freq, 0.3, 0.16);
  scaleIndex++;
}

export function sfxWrong() {
  const base = currentScale[scaleIndex % currentScale.length];
  playNote(base * 0.71, 0.2, 'triangle', 0.08);
  playNote(base * 0.5, 0.25, 'triangle', 0.05, 0.06);
}

export function sfxWordComplete() {
  playBell(currentScale[0], 0.3, 0.14);
  playBell(currentScale[2], 0.3, 0.12, 0.1);
  playBell(currentScale[4], 0.3, 0.12, 0.2);
  playBell(currentScale[0] * 2, 0.5, 0.16, 0.3);
  scaleIndex = 0;
}

export function sfxWordFailed() {
  playBell(currentScale[2], 0.4, 0.08);
  playBell(currentScale[0], 0.6, 0.06, 0.2);
  scaleIndex = 0;
}

export function sfxStreak() {
  for (let i = 0; i < currentScale.length; i++) {
    playBell(currentScale[i], 0.15, 0.09, i * 0.05);
  }
  playBell(currentScale[0] * 2, 0.5, 0.15, currentScale.length * 0.05);
}

export function sfxGameComplete() {
  playBell(currentScale[0], 0.3, 0.16);
  playBell(currentScale[2], 0.3, 0.14, 0.12);
  playBell(currentScale[4], 0.3, 0.16, 0.24);
  playBell(currentScale[0] * 2, 0.5, 0.2, 0.36);
  // Grand chord
  for (const f of [currentScale[0] * 2, currentScale[2] * 2, currentScale[4] * 2]) {
    playBell(f, 1, 0.08, 0.48);
  }
}

export function resetScale() { scaleIndex = 0; }
