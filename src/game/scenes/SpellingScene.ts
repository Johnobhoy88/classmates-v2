/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 *
 * SPELLING SCENE — Premium "Spellbound Forest" visual design
 * Magical forest backdrop, floating fireflies, emoji word hints,
 * glowing letter slots, premium keyboard, animated hearts
 */

import Phaser from 'phaser';
import { SPELLING, WORD_EMOJI, type SpellingWord } from '../content/spelling-data';
import { sfxCorrect, sfxWrong, sfxStreak, sfxLevelUp } from '../systems/AudioSystem';
import { calcStars } from '../../utils/stars';

type OnCompleteCallback = (result: {
  correct: number;
  total: number;
  stars: number;
  bestStreak: number;
  missed: Array<{ w: string; h: string }>;
}) => void;

interface SpellingState {
  level: number;
  words: SpellingWord[];
  idx: number;
  word: string;
  revealed: boolean[];
  lives: number;
  maxLives: number;
  correct: number;
  total: number;
  streak: number;
  bestStreak: number;
  missed: Array<{ w: string; h: string }>;
  onComplete: OnCompleteCallback | null;
}

const KEYBOARD_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];

// Premium forest palette
const C = {
  skyTop: 0x0a0e27,
  skyMid: 0x0f1b3d,
  skyBot: 0x1a3a2a,
  ground: 0x0d2818,
  slotBg: 0x1a2d4a,
  slotBorder: 0x3a7a6a,
  slotFilled: 0x2ecc71,
  slotWrong: 0xe74c3c,
  slotGlow: 0x2ecc71,
  keyBg: 0x1a2840,
  keyBorder: 0x2a4a6a,
  keyCorrect: 0x27ae60,
  keyWrong: 0xc0392b,
  keyText: 0xc8d8e8,
  heartFull: 0xe74c3c,
  heartEmpty: 0x2a2a3a,
  textWhite: 0xf0f4f0,
  textDim: 0x7a8a9a,
  textHint: 0xa8c8d8,
  streakGold: 0xf1c40f,
  firefly: 0xffeaa7,
  treeTrunk: 0x3d2817,
  treeLeaf1: 0x1a6b3a,
  treeLeaf2: 0x2d8a4e,
  treeLeaf3: 0x1e7a42,
};

export class SpellingScene extends Phaser.Scene {
  private state!: SpellingState;
  private letterSlots: Phaser.GameObjects.Graphics[] = [];
  private letterTexts: Phaser.GameObjects.Text[] = [];
  private keyButtons: Map<string, { bg: Phaser.GameObjects.Graphics; zone: Phaser.GameObjects.Zone }> = new Map();
  private keyTexts: Map<string, Phaser.GameObjects.Text> = new Map();
  private hearts: Phaser.GameObjects.Graphics[] = [];
  private hintText!: Phaser.GameObjects.Text;
  private emojiText!: Phaser.GameObjects.Text;
  private progressBg!: Phaser.GameObjects.Graphics;
  private progressFill!: Phaser.GameObjects.Graphics;
  private streakText!: Phaser.GameObjects.Text;
  private wordContainer!: Phaser.GameObjects.Container;
  private wordCountText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'SpellingScene' });
  }

  init(data: { level?: number; onComplete?: OnCompleteCallback }) {
    const level = data.level || 1;
    const maxLives = level === 1 ? 7 : level === 2 ? 6 : 5;
    const lvl = (level >= 1 && level <= 3 ? level : 1) as 1 | 2 | 3;
    const pool = [...(SPELLING[lvl])];
    Phaser.Utils.Array.Shuffle(pool);
    const words = pool.slice(0, 10);

    this.state = {
      level, words, idx: 0, word: '', revealed: [],
      lives: maxLives, maxLives, correct: 0, total: words.length,
      streak: 0, bestStreak: 0, missed: [], onComplete: data.onComplete || null,
    };
  }

  create() {
    const { width: W, height: H } = this.scale;

    // === BACKGROUND: Magical forest night sky ===
    this.drawForestBackground(W, H);

    // Floating fireflies
    for (let i = 0; i < 20; i++) {
      const ff = this.add.circle(
        Phaser.Math.Between(0, W),
        Phaser.Math.Between(0, H * 0.6),
        Phaser.Math.Between(1, 3),
        C.firefly,
        Phaser.Math.FloatBetween(0.15, 0.5)
      );
      this.tweens.add({
        targets: ff,
        x: ff.x + Phaser.Math.Between(-40, 40),
        y: ff.y + Phaser.Math.Between(-30, 30),
        alpha: { from: ff.alpha, to: ff.alpha * 0.2 },
        duration: Phaser.Math.Between(2000, 4000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    // === EMOJI hint (large, above text hint) ===
    this.emojiText = this.add.text(W / 2, 55, '', {
      fontSize: '48px',
      align: 'center',
    }).setOrigin(0.5);

    // Text hint
    this.hintText = this.add.text(W / 2, 100, '', {
      fontSize: '17px',
      color: '#a8c8d8',
      align: 'center',
      fontStyle: 'italic',
      wordWrap: { width: W - 80 },
    }).setOrigin(0.5);

    // Word container
    this.wordContainer = this.add.container(W / 2, 165);

    // Streak text
    this.streakText = this.add.text(W / 2, 215, '', {
      fontSize: '15px',
      color: '#f1c40f',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Word counter (top right)
    this.wordCountText = this.add.text(W - 20, 28, '', {
      fontSize: '13px',
      color: '#7a8a9a',
    }).setOrigin(1, 0.5);

    // Progress bar
    this.progressBg = this.add.graphics();
    this.progressBg.fillStyle(0x1a2a3a, 0.6);
    this.progressBg.fillRoundedRect(20, H - 24, W - 40, 10, 5);

    this.progressFill = this.add.graphics();

    // Hearts
    this.createHearts(W);

    // Keyboard
    this.createKeyboard(W, H);

    // Keyboard input
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (/^[a-z]$/i.test(event.key)) {
        this.pressKey(event.key.toLowerCase());
      }
    });

    // Load first word
    this.loadWord();
  }

  private drawForestBackground(W: number, H: number) {
    // Sky gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(C.skyTop, C.skyTop, C.skyBot, C.skyBot, 1);
    bg.fillRect(0, 0, W, H);

    // Stars
    for (let i = 0; i < 50; i++) {
      const s = this.add.circle(
        Phaser.Math.Between(0, W),
        Phaser.Math.Between(0, H * 0.35),
        Phaser.Math.FloatBetween(0.5, 1.5),
        0xffffff,
        Phaser.Math.FloatBetween(0.15, 0.6)
      );
      this.tweens.add({
        targets: s,
        alpha: { from: s.alpha, to: s.alpha * 0.2 },
        duration: Phaser.Math.Between(1500, 4000),
        yoyo: true,
        repeat: -1,
      });
    }

    // Moon glow
    const moonX = W * 0.82, moonY = H * 0.1;
    const moonGlow = this.add.graphics();
    moonGlow.fillStyle(0xffeedd, 0.06);
    moonGlow.fillCircle(moonX, moonY, 80);
    moonGlow.fillStyle(0xffeedd, 0.1);
    moonGlow.fillCircle(moonX, moonY, 45);
    // Moon disc
    moonGlow.fillStyle(0xfff8e7, 0.85);
    moonGlow.fillCircle(moonX, moonY, 22);

    // Ground
    const ground = this.add.graphics();
    ground.fillGradientStyle(C.ground, C.ground, 0x0a1a10, 0x0a1a10, 1);
    ground.fillRect(0, H * 0.75, W, H * 0.25);

    // Trees (silhouettes)
    const treePosns = [
      { x: W * 0.05, h: 120, w: 40 },
      { x: W * 0.15, h: 160, w: 50 },
      { x: W * 0.35, h: 100, w: 35 },
      { x: W * 0.65, h: 140, w: 45 },
      { x: W * 0.85, h: 170, w: 55 },
      { x: W * 0.95, h: 110, w: 38 },
    ];

    const treeG = this.add.graphics();
    for (const t of treePosns) {
      const baseY = H * 0.75;
      // Trunk
      treeG.fillStyle(C.treeTrunk, 0.7);
      treeG.fillRect(t.x - 4, baseY - t.h * 0.4, 8, t.h * 0.45);
      // Foliage layers
      const colors = [C.treeLeaf1, C.treeLeaf2, C.treeLeaf3];
      for (let j = 0; j < 3; j++) {
        treeG.fillStyle(colors[j], 0.6 + j * 0.1);
        treeG.fillCircle(
          t.x + (j - 1) * t.w * 0.25,
          baseY - t.h * (0.5 + j * 0.12),
          t.w * (0.5 - j * 0.05)
        );
      }
    }

    // Ground detail — little grass tufts
    const grassG = this.add.graphics();
    grassG.fillStyle(0x1a5a2a, 0.4);
    for (let i = 0; i < 30; i++) {
      const gx = Phaser.Math.Between(0, W);
      const gy = H * 0.75 + Phaser.Math.Between(0, 15);
      grassG.fillTriangle(gx - 3, gy, gx, gy - Phaser.Math.Between(6, 14), gx + 3, gy);
    }
  }

  private createHearts(_W: number) {
    this.hearts = [];
    const startX = 24;
    const y = 28;
    for (let i = 0; i < this.state.maxLives; i++) {
      const g = this.add.graphics();
      this.drawHeart(g, startX + i * 26, y, 8, C.heartFull);
      this.hearts.push(g);
    }
  }

  private drawHeart(g: Phaser.GameObjects.Graphics, x: number, y: number, size: number, color: number) {
    g.clear();
    g.fillStyle(color, 1);
    // Simple heart shape using circles + triangle
    g.fillCircle(x - size * 0.3, y - size * 0.2, size * 0.5);
    g.fillCircle(x + size * 0.3, y - size * 0.2, size * 0.5);
    g.fillTriangle(x - size * 0.7, y, x + size * 0.7, y, x, y + size * 0.7);
  }

  private updateHearts() {
    this.hearts.forEach((g, i) => {
      const color = i < this.state.lives ? C.heartFull : C.heartEmpty;
      const x = 24 + i * 26;
      this.drawHeart(g, x, 28, 8, color);
      if (i === this.state.lives) {
        this.tweens.add({
          targets: g,
          scaleX: 1.4, scaleY: 1.4,
          duration: 120,
          yoyo: true,
        });
      }
    });
  }

  private createKeyboard(W: number, H: number) {
    const kbStartY = H - 175;
    const keyW = Math.min(34, (W - 50) / 10 - 3);
    const keyH = keyW + 4;
    const gap = 3;

    KEYBOARD_ROWS.forEach((row, rowIdx) => {
      const rowWidth = row.length * (keyW + gap) - gap;
      const startX = (W - rowWidth) / 2;

      for (let i = 0; i < row.length; i++) {
        const ch = row[i];
        const x = startX + i * (keyW + gap);
        const y = kbStartY + rowIdx * (keyH + 5);

        const bg = this.add.graphics();
        this.drawKey(bg, x, y, keyW, keyH, C.keyBg, C.keyBorder);

        // Interactive zone
        const zone = this.add.zone(x + keyW / 2, y + keyH / 2, keyW, keyH)
          .setInteractive({ useHandCursor: true })
          .on('pointerdown', () => this.pressKey(ch));

        const txt = this.add.text(x + keyW / 2, y + keyH / 2, ch, {
          fontSize: `${Math.round(keyW * 0.48)}px`,
          color: '#c8d8e8',
          fontStyle: 'bold',
        }).setOrigin(0.5);

        this.keyButtons.set(ch, { bg, zone });
        this.keyTexts.set(ch, txt);
      }
    });
  }

  private drawKey(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, fill: number, stroke: number) {
    g.clear();
    g.fillStyle(fill, 0.85);
    g.fillRoundedRect(x, y, w, h, 6);
    g.lineStyle(1, stroke, 0.6);
    g.strokeRoundedRect(x, y, w, h, 6);
  }

  private loadWord() {
    const item = this.state.words[this.state.idx];
    this.state.word = item.w.toLowerCase();
    this.state.revealed = new Array(this.state.word.length).fill(false);
    this.state.lives = this.state.maxLives;

    // Emoji hint
    const emojiCode = WORD_EMOJI[this.state.word];
    if (emojiCode) {
      this.emojiText.setText(String.fromCodePoint(parseInt(emojiCode, 16)));
      this.emojiText.setAlpha(0);
      this.tweens.add({ targets: this.emojiText, alpha: 1, y: 55, duration: 300, ease: 'Back.easeOut' });
    } else {
      this.emojiText.setText('');
    }

    this.hintText.setText(item.h);
    this.hintText.setAlpha(0);
    this.tweens.add({ targets: this.hintText, alpha: 1, duration: 400, delay: 100 });

    this.wordCountText.setText(`${this.state.idx + 1} / ${this.state.total}`);
    this.updateHearts();
    this.updateProgress();
    this.renderWord();
    this.resetKeyboard();
    this.updateStreakDisplay();
  }

  private renderWord() {
    this.wordContainer.removeAll(true);
    this.letterSlots = [];
    this.letterTexts = [];

    const word = this.state.word;
    const W = this.scale.width;
    const slotSize = Math.min(42, (W - 70) / word.length - 6);
    const totalWidth = word.length * (slotSize + 6) - 6;
    const startX = -totalWidth / 2 + slotSize / 2;

    for (let i = 0; i < word.length; i++) {
      const x = startX + i * (slotSize + 6);

      const g = this.add.graphics();
      if (this.state.revealed[i]) {
        g.fillStyle(C.slotFilled, 0.9);
        g.fillRoundedRect(x - slotSize / 2, -slotSize / 2, slotSize, slotSize + 2, 8);
        // Glow
        g.lineStyle(2, C.slotGlow, 0.4);
        g.strokeRoundedRect(x - slotSize / 2, -slotSize / 2, slotSize, slotSize + 2, 8);
      } else {
        g.fillStyle(C.slotBg, 0.7);
        g.fillRoundedRect(x - slotSize / 2, -slotSize / 2, slotSize, slotSize + 2, 8);
        g.lineStyle(1.5, C.slotBorder, 0.5);
        g.strokeRoundedRect(x - slotSize / 2, -slotSize / 2, slotSize, slotSize + 2, 8);
      }
      this.wordContainer.add(g);
      this.letterSlots.push(g);

      const txt = this.add.text(x, 1, this.state.revealed[i] ? word[i] : '', {
        fontSize: `${Math.round(slotSize * 0.55)}px`,
        color: '#ffffff',
        fontStyle: 'bold',
      }).setOrigin(0.5);
      this.wordContainer.add(txt);
      this.letterTexts.push(txt);
    }
  }

  private resetKeyboard() {
    const W = this.scale.width;
    const H = this.scale.height;
    const kbStartY = H - 175;
    const keyW = Math.min(34, (W - 50) / 10 - 3);
    const keyH = keyW + 4;
    const gap = 3;

    KEYBOARD_ROWS.forEach((row, rowIdx) => {
      const rowWidth = row.length * (keyW + gap) - gap;
      const startX = (W - rowWidth) / 2;
      for (let i = 0; i < row.length; i++) {
        const ch = row[i];
        const x = startX + i * (keyW + gap);
        const y = kbStartY + rowIdx * (keyH + 5);
        const entry = this.keyButtons.get(ch);
        if (entry) {
          this.drawKey(entry.bg, x, y, keyW, keyH, C.keyBg, C.keyBorder);
          entry.zone.setInteractive();
        }
        const txt = this.keyTexts.get(ch);
        if (txt) txt.setColor('#c8d8e8');
      }
    });
  }

  private pressKey(ch: string) {
    const entry = this.keyButtons.get(ch);
    if (!entry || !entry.zone.input?.enabled) return;

    let found = false;
    for (let i = 0; i < this.state.word.length; i++) {
      if (this.state.word[i] === ch && !this.state.revealed[i]) {
        this.state.revealed[i] = true;
        found = true;
      }
    }

    // Find key position for visual update
    const W = this.scale.width;
    const H = this.scale.height;
    const kbStartY = H - 175;
    const keyW = Math.min(34, (W - 50) / 10 - 3);
    const keyH = keyW + 4;
    const gap = 3;
    let kx = 0, ky = 0;
    for (let r = 0; r < KEYBOARD_ROWS.length; r++) {
      const idx = KEYBOARD_ROWS[r].indexOf(ch);
      if (idx >= 0) {
        const rowWidth = KEYBOARD_ROWS[r].length * (keyW + gap) - gap;
        kx = (W - rowWidth) / 2 + idx * (keyW + gap);
        ky = kbStartY + r * (keyH + 5);
        break;
      }
    }

    if (found) {
      this.drawKey(entry.bg, kx, ky, keyW, keyH, C.keyCorrect, C.keyCorrect);
      entry.zone.disableInteractive();
      const txt = this.keyTexts.get(ch);
      if (txt) txt.setColor('#ffffff');
      sfxCorrect();
      this.renderWord();

      if (this.state.revealed.every(Boolean)) {
        this.onWordCorrect();
      }
    } else {
      this.drawKey(entry.bg, kx, ky, keyW, keyH, C.keyWrong, C.keyWrong);
      entry.zone.disableInteractive();
      const txt = this.keyTexts.get(ch);
      if (txt) txt.setColor('#ff8888');
      this.state.lives--;
      this.updateHearts();
      sfxWrong();

      // Shake word
      this.tweens.add({
        targets: this.wordContainer,
        x: { from: this.scale.width / 2 - 8, to: this.scale.width / 2 + 8 },
        duration: 50,
        yoyo: true,
        repeat: 3,
        onComplete: () => this.wordContainer.setX(this.scale.width / 2),
      });

      if (this.state.lives <= 0) {
        this.onWordFailed();
      }
    }
  }

  private onWordCorrect() {
    this.state.correct++;
    this.state.streak++;
    this.state.bestStreak = Math.max(this.state.bestStreak, this.state.streak);

    // Celebration particles — green/gold burst
    const cx = this.scale.width / 2;
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2;
      const speed = Phaser.Math.Between(80, 180);
      const colors = [0x2ecc71, 0xf1c40f, 0x3498db, 0xe74c3c, 0x9b59b6];
      const dot = this.add.circle(cx, 165, Phaser.Math.Between(2, 5), Phaser.Utils.Array.GetRandom(colors));
      this.tweens.add({
        targets: dot,
        x: cx + Math.cos(angle) * speed,
        y: 165 + Math.sin(angle) * speed,
        alpha: 0,
        scale: 0,
        duration: Phaser.Math.Between(400, 800),
        ease: 'Cubic.easeOut',
        onComplete: () => dot.destroy(),
      });
    }

    if (this.state.streak >= 5) sfxLevelUp();
    else if (this.state.streak >= 3) sfxStreak();

    this.updateStreakDisplay();
    this.time.delayedCall(800, () => this.nextWord());
  }

  private onWordFailed() {
    this.state.streak = 0;
    this.state.missed.push({
      w: this.state.word,
      h: this.state.words[this.state.idx].h,
    });

    // Reveal all letters with red slots
    this.state.revealed = this.state.revealed.map(() => true);
    this.renderWord();

    // Turn slots red
    const word = this.state.word;
    const slotSize = Math.min(42, (this.scale.width - 70) / word.length - 6);
    const totalWidth = word.length * (slotSize + 6) - 6;
    const startX = -totalWidth / 2 + slotSize / 2;
    this.letterSlots.forEach((g, i) => {
      g.clear();
      const x = startX + i * (slotSize + 6);
      g.fillStyle(C.slotWrong, 0.8);
      g.fillRoundedRect(x - slotSize / 2, -slotSize / 2, slotSize, slotSize + 2, 8);
    });

    this.updateStreakDisplay();
    this.time.delayedCall(1500, () => this.nextWord());
  }

  private nextWord() {
    this.state.idx++;
    if (this.state.idx >= this.state.total) {
      this.finishGame();
    } else {
      this.loadWord();
    }
  }

  private finishGame() {
    const pct = this.state.correct / this.state.total;
    const stars = calcStars(pct);
    if (stars >= 3) sfxLevelUp();
    else if (stars >= 1) sfxStreak();
    if (this.state.onComplete) {
      this.state.onComplete({
        correct: this.state.correct,
        total: this.state.total,
        stars,
        bestStreak: this.state.bestStreak,
        missed: this.state.missed,
      });
    }
  }

  private updateProgress() {
    const W = this.scale.width;
    const H = this.scale.height;
    const pct = this.state.idx / this.state.total;
    const barW = (W - 40) * pct;
    this.progressFill.clear();
    if (barW > 0) {
      this.progressFill.fillStyle(C.slotFilled, 0.8);
      this.progressFill.fillRoundedRect(20, H - 24, barW, 10, 5);
    }
  }

  private updateStreakDisplay() {
    const s = this.state.streak;
    if (s >= 10) this.streakText.setText(`\u{1F525}\u{1F525}\u{1F525} ${s} on fire!`);
    else if (s >= 5) this.streakText.setText(`\u{1F525}\u{1F525} ${s} streak!`);
    else if (s >= 3) this.streakText.setText(`\u{1F525} ${s} in a row!`);
    else if (s >= 2) this.streakText.setText(`\u2B50 ${s} streak`);
    else this.streakText.setText('');

    if (s >= 2) {
      this.streakText.setAlpha(0);
      this.tweens.add({ targets: this.streakText, alpha: 1, duration: 200 });
    }
  }
}
