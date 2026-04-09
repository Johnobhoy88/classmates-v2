/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 *
 * PREMIUM AUDIO ENGINE — Rich procedural SFX + dynamic music
 * ZzFX-inspired sound synthesis: frequency sweeps, noise, ADSR, filters
 * Dynamic music: tempo scales with streak, energy builds with progress
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// ========================================
// ZzFX-INSPIRED SOUND SYNTHESIS
// Rich game sounds via frequency sweeps + noise + envelopes
// ========================================

interface SynthParams {
  freq: number;
  attack?: number;   // seconds
  decay?: number;     // seconds
  sustain?: number;   // 0-1 volume ratio
  release?: number;   // seconds
  type?: OscillatorType;
  vol?: number;
  slide?: number;     // frequency slide per second (Hz/s)
  vibrato?: number;   // vibrato depth in Hz
  vibratoRate?: number;
  noise?: number;     // noise mix 0-1
  filterFreq?: number;
  filterQ?: number;
  delay?: number;     // start delay
}

function synth(p: SynthParams) {
  try {
    const c = getCtx();
    const t = c.currentTime + (p.delay || 0);
    const attack = p.attack ?? 0.01;
    const decay = p.decay ?? 0.1;
    const sustain = p.sustain ?? 0;
    const release = p.release ?? 0.1;
    const vol = p.vol ?? 0.15;
    const totalDur = attack + decay + release + 0.05;

    const gain = c.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol, t + attack);
    gain.gain.linearRampToValueAtTime(vol * sustain, t + attack + decay);
    gain.gain.linearRampToValueAtTime(0.001, t + totalDur);

    // Optional filter
    let target: AudioNode = gain;
    if (p.filterFreq) {
      const filter = c.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = p.filterFreq;
      filter.Q.value = p.filterQ ?? 1;
      gain.connect(filter);
      filter.connect(c.destination);
      target = gain;
    } else {
      gain.connect(c.destination);
    }

    // Oscillator
    const osc = c.createOscillator();
    osc.type = p.type ?? 'sine';
    osc.frequency.setValueAtTime(p.freq, t);
    if (p.slide) {
      osc.frequency.linearRampToValueAtTime(p.freq + p.slide * totalDur, t + totalDur);
    }
    if (p.vibrato) {
      const vib = c.createOscillator();
      const vibGain = c.createGain();
      vib.frequency.value = p.vibratoRate ?? 6;
      vibGain.gain.value = p.vibrato;
      vib.connect(vibGain);
      vibGain.connect(osc.frequency);
      vib.start(t);
      vib.stop(t + totalDur);
    }
    osc.connect(target);
    osc.start(t);
    osc.stop(t + totalDur);

    // Noise layer
    if (p.noise && p.noise > 0) {
      const noiseBuf = c.createBuffer(1, Math.round(c.sampleRate * totalDur), c.sampleRate);
      const data = noiseBuf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1);
      const noiseSrc = c.createBufferSource();
      noiseSrc.buffer = noiseBuf;
      const noiseGain = c.createGain();
      noiseGain.gain.setValueAtTime(0, t);
      noiseGain.gain.linearRampToValueAtTime(vol * p.noise, t + attack);
      noiseGain.gain.linearRampToValueAtTime(0.001, t + totalDur);
      const noiseFilter = c.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.value = p.freq * 2;
      noiseFilter.Q.value = 0.5;
      noiseSrc.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(c.destination);
      noiseSrc.start(t);
      noiseSrc.stop(t + totalDur);
    }
  } catch {}
}

// ========================================
// PREMIUM SFX — Rich game sounds
// ========================================

/** Coin/correct — bright upward sweep with shimmer */
export function sfxCoin() {
  synth({ freq: 900, attack: 0.005, decay: 0.08, release: 0.2, type: 'sine', vol: 0.15, slide: 600 });
  synth({ freq: 1800, attack: 0.005, decay: 0.05, release: 0.15, type: 'sine', vol: 0.05, slide: 400, delay: 0.02 });
  synth({ freq: 2700, attack: 0.005, decay: 0.03, release: 0.1, type: 'sine', vol: 0.02, slide: 200, delay: 0.03 });
}

/** Wrong/error — descending buzz */
export function sfxBuzz() {
  synth({ freq: 250, attack: 0.01, decay: 0.15, release: 0.1, type: 'square', vol: 0.08, slide: -100 });
  synth({ freq: 180, attack: 0.01, decay: 0.1, release: 0.1, type: 'square', vol: 0.04, slide: -80, delay: 0.06 });
}

/** Level up / streak — ascending arpeggio with sparkle */
export function sfxLevelUp(scale: number[]) {
  for (let i = 0; i < Math.min(scale.length, 6); i++) {
    synth({ freq: scale[i], attack: 0.005, decay: 0.06, release: 0.15, type: 'sine', vol: 0.12, slide: 50, delay: i * 0.06 });
    synth({ freq: scale[i] * 2, attack: 0.005, decay: 0.04, release: 0.1, type: 'sine', vol: 0.03, delay: i * 0.06 + 0.01 });
  }
  // Sparkle noise burst at end
  synth({ freq: 3000, attack: 0.005, decay: 0.02, release: 0.15, type: 'sine', vol: 0.04, noise: 0.3, delay: scale.length * 0.06 });
}

/** Word/question complete — satisfying chord resolve */
export function sfxComplete(scale: number[]) {
  const root = scale[0];
  const third = scale[2] || root * 1.25;
  const fifth = scale[4] || root * 1.5;
  synth({ freq: root, attack: 0.01, decay: 0.15, sustain: 0.3, release: 0.4, type: 'sine', vol: 0.14 });
  synth({ freq: third, attack: 0.01, decay: 0.12, sustain: 0.25, release: 0.35, type: 'sine', vol: 0.1, delay: 0.08 });
  synth({ freq: fifth, attack: 0.01, decay: 0.12, sustain: 0.25, release: 0.35, type: 'sine', vol: 0.1, delay: 0.16 });
  synth({ freq: root * 2, attack: 0.01, decay: 0.2, sustain: 0.4, release: 0.5, type: 'sine', vol: 0.16, delay: 0.24 });
  // Shimmer
  synth({ freq: root * 4, attack: 0.01, decay: 0.05, release: 0.3, type: 'sine', vol: 0.03, delay: 0.24 });
}

/** Fail — sad descending with slight noise */
export function sfxFail(scale: number[]) {
  const third = scale[2] || 330;
  const root = scale[0] || 262;
  synth({ freq: third, attack: 0.01, decay: 0.2, release: 0.3, type: 'triangle', vol: 0.1, slide: -20 });
  synth({ freq: root, attack: 0.01, decay: 0.3, release: 0.4, type: 'triangle', vol: 0.08, slide: -15, delay: 0.15 });
}

/** Heart lost — glass shatter: fast descending noise burst */
export function sfxHeartLost() {
  synth({ freq: 1200, attack: 0.003, decay: 0.02, release: 0.08, type: 'square', vol: 0.06, slide: -2000 });
  synth({ freq: 800, attack: 0.003, decay: 0.03, release: 0.1, type: 'sine', vol: 0.04, noise: 0.4, slide: -1000, delay: 0.02 });
}

/** Key press — soft tactile click */
export function sfxClick() {
  synth({ freq: 800, attack: 0.003, decay: 0.01, release: 0.02, type: 'sine', vol: 0.04, noise: 0.1 });
}

/** Grand fanfare — for game complete */
export function sfxFanfare(scale: number[]) {
  const root = scale[0];
  // Ascending bells
  for (let i = 0; i < 4; i++) {
    const f = scale[i * 2 % scale.length] * (i >= 2 ? 2 : 1);
    synth({ freq: f, attack: 0.01, decay: 0.12, sustain: 0.2, release: 0.3, type: 'sine', vol: 0.14, delay: i * 0.12 });
    synth({ freq: f * 2, attack: 0.01, decay: 0.08, release: 0.2, type: 'sine', vol: 0.04, delay: i * 0.12 });
  }
  // Grand chord
  const chordDelay = 0.5;
  synth({ freq: root * 2, attack: 0.01, decay: 0.3, sustain: 0.5, release: 0.8, type: 'sine', vol: 0.18, delay: chordDelay });
  synth({ freq: (scale[2] || root * 1.25) * 2, attack: 0.01, decay: 0.25, sustain: 0.4, release: 0.7, type: 'sine', vol: 0.1, delay: chordDelay });
  synth({ freq: (scale[4] || root * 1.5) * 2, attack: 0.01, decay: 0.25, sustain: 0.4, release: 0.7, type: 'sine', vol: 0.1, delay: chordDelay });
  // Bass
  synth({ freq: root / 2, attack: 0.02, decay: 0.3, sustain: 0.3, release: 0.8, type: 'sine', vol: 0.08, delay: chordDelay });
  // Sparkle
  synth({ freq: root * 6, attack: 0.005, decay: 0.03, release: 0.4, type: 'sine', vol: 0.03, noise: 0.15, delay: chordDelay + 0.05 });
}

// ========================================
// DYNAMIC AMBIENT MUSIC
// ========================================

interface AmbientConfig {
  scale: number[];        // 8-note scale
  tempo: number;          // base BPM (arpeggio notes per minute)
  arpPattern: number[];   // scale degrees to cycle
  padChord: number[];     // scale degrees for pad (e.g. [0, 2, 4])
  padFilterFreq?: number;
  noiseType?: 'wind' | 'water';
}

let ambientRunning = false;
let ambientNodes: AudioNode[] = [];
let arpInterval: ReturnType<typeof setTimeout> | null = null;
let ambientConfig: AmbientConfig | null = null;
let arpIdx = 0;
let currentStreak = 0;

// Preset themes
export const THEME_FOREST: AmbientConfig = {
  scale: [261.6, 293.7, 329.6, 349.2, 392.0, 440.0, 493.9, 523.3], // C major
  tempo: 140,
  arpPattern: [0, 2, 4, 7, 4, 2, 0, 4],
  padChord: [0, 2, 4],
  padFilterFreq: 800,
  noiseType: 'wind',
};

export const THEME_OCEAN: AmbientConfig = {
  scale: [349.2, 392.0, 440.0, 466.2, 523.3, 587.3, 659.3, 698.5], // F major
  tempo: 130,
  arpPattern: [0, 2, 4, 7, 4, 2, 0, 7],
  padChord: [0, 2, 4],
  padFilterFreq: 600,
  noiseType: 'water',
};

/** Cosmos — mysterious space feel, D Dorian, slow and ethereal */
export const THEME_COSMOS: AmbientConfig = {
  scale: [293.7, 329.6, 349.2, 392.0, 440.0, 466.2, 523.3, 587.3], // D Dorian
  tempo: 105,
  arpPattern: [0, 4, 2, 7, 4, 0, 2, 7],
  padChord: [0, 2, 4],
  padFilterFreq: 450,
  noiseType: 'wind',
};

/** Earth — warm and grounded, G major, moderate tempo */
export const THEME_EARTH: AmbientConfig = {
  scale: [392.0, 440.0, 493.9, 523.3, 587.3, 659.3, 740.0, 784.0], // G major
  tempo: 120,
  arpPattern: [0, 2, 4, 7, 4, 2, 0, 4],
  padChord: [0, 2, 4],
  padFilterFreq: 650,
  noiseType: 'wind',
};

export function startMusic(config: AmbientConfig) {
  if (ambientRunning) return;
  const c = getCtx();
  ambientRunning = true;
  ambientConfig = config;
  arpIdx = 0;
  currentStreak = 0;

  // Pad chord
  const padGain = c.createGain();
  padGain.gain.value = 0;
  padGain.connect(c.destination);
  for (const deg of config.padChord) {
    const freq = config.scale[deg % config.scale.length] / 2;
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const filter = c.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = config.padFilterFreq || 800;
    osc.connect(filter); filter.connect(padGain);
    osc.start();
    ambientNodes.push(osc, filter);
  }
  // Breathing LFO
  const lfo = c.createOscillator();
  const lfoG = c.createGain();
  lfo.frequency.value = 0.1; lfoG.gain.value = 0.006;
  lfo.connect(lfoG); lfoG.connect(padGain.gain);
  lfo.start();
  ambientNodes.push(padGain, lfo, lfoG);
  padGain.gain.linearRampToValueAtTime(0.02, c.currentTime + 2);

  // Background noise
  const noiseBuf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const noiseSrc = c.createBufferSource();
  noiseSrc.buffer = noiseBuf; noiseSrc.loop = true;
  const noiseFilter = c.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.value = config.noiseType === 'water' ? 300 : 500;
  noiseFilter.Q.value = 0.3;
  const noiseGain = c.createGain();
  noiseGain.gain.value = 0;
  noiseSrc.connect(noiseFilter); noiseFilter.connect(noiseGain); noiseGain.connect(c.destination);
  noiseSrc.start();
  noiseGain.gain.linearRampToValueAtTime(0.008, c.currentTime + 3);
  ambientNodes.push(noiseSrc, noiseFilter, noiseGain);

  // Start arpeggio
  scheduleArp();
}

function scheduleArp() {
  if (!ambientRunning || !ambientConfig) return;
  // Tempo increases with streak: base + 20% at streak 5, +40% at 10
  const streakBoost = 1 + Math.min(currentStreak, 10) * 0.04;
  const msPerNote = (60000 / ambientConfig.tempo / streakBoost);
  // Slight swing feel
  const swing = arpIdx % 2 === 0 ? 0 : msPerNote * 0.08;

  arpInterval = setTimeout(() => {
    if (!ambientRunning || !ambientConfig) return;
    const deg = ambientConfig.arpPattern[arpIdx % ambientConfig.arpPattern.length];
    const freq = ambientConfig.scale[deg % ambientConfig.scale.length] * (deg >= 7 ? 2 : 1);

    // Plucked bell tone — brighter than before
    synth({ freq, attack: 0.005, decay: 0.08, release: 0.25, type: 'sine', vol: 0.06 });
    synth({ freq: freq * 2, attack: 0.005, decay: 0.05, release: 0.15, type: 'sine', vol: 0.015 });
    // Tiny noise transient for pluck feel
    synth({ freq: freq * 3, attack: 0.002, decay: 0.008, release: 0.02, type: 'sine', vol: 0.008, noise: 0.15 });

    arpIdx++;
    scheduleArp();
  }, msPerNote + swing);
}

export function updateMusic(streak: number) {
  currentStreak = streak;
}

export function stopMusic() {
  ambientRunning = false;
  ambientConfig = null;
  if (arpInterval) clearTimeout(arpInterval);
  arpInterval = null;
  if (!ctx) return;
  const now = ctx.currentTime;
  for (const node of ambientNodes) {
    try {
      if (node instanceof GainNode) node.gain.linearRampToValueAtTime(0, now + 0.8);
      if (node instanceof OscillatorNode || node instanceof AudioBufferSourceNode) {
        (node as OscillatorNode).stop(now + 1);
      }
    } catch {}
  }
  ambientNodes = [];
}

/** Get the current theme's scale (for SFX that need it) */
export function getScale(): number[] {
  return ambientConfig?.scale || [261.6, 293.7, 329.6, 349.2, 392.0, 440.0, 493.9, 523.3];
}
