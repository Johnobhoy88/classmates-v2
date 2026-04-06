import Phaser from 'phaser';
import { SPELLING, type SpellingWord } from '../content/spelling-data';
import { sfxCorrect, sfxWrong, sfxStreak, sfxLevelUp } from '../systems/AudioSystem';

// Callback for when the game ends
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
const COLORS = {
  bg: 0x0b1a2e,
  slotEmpty: 0x1a3a4a,
  slotFilled: 0x3aaa4a,
  slotWrong: 0xee4444,
  keyDefault: 0x1a3a4a,
  keyCorrect: 0x3aaa4a,
  keyWrong: 0xaa3333,
  heartFull: 0xff4444,
  heartEmpty: 0x333344,
  textLight: 0xe8f0e0,
  textDim: 0x667788,
  hintBg: 0x112233,
  streakGold: 0xffd93d,
};

export class SpellingScene extends Phaser.Scene {
  private state!: SpellingState;
  private letterSlots: Phaser.GameObjects.Rectangle[] = [];
  private letterTexts: Phaser.GameObjects.Text[] = [];
  private keyButtons: Map<string, Phaser.GameObjects.Rectangle> = new Map();
  private keyTexts: Map<string, Phaser.GameObjects.Text> = new Map();
  private hearts: Phaser.GameObjects.Arc[] = [];
  private hintText!: Phaser.GameObjects.Text;
  // @ts-expect-error assigned in create, used for layout
  private _progressBar!: Phaser.GameObjects.Rectangle;
  private progressFill!: Phaser.GameObjects.Rectangle;
  private streakText!: Phaser.GameObjects.Text;
  private wordGroup!: Phaser.GameObjects.Container;
  private particles!: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor() {
    super({ key: 'SpellingScene' });
  }

  init(data: { level?: number; onComplete?: OnCompleteCallback }) {
    const level = data.level || 1;
    const maxLives = level === 1 ? 7 : level === 2 ? 6 : 5;
    const lvl = (level === 1 || level === 2 || level === 3 ? level : 1) as 1 | 2 | 3;
    const pool = [...(SPELLING[lvl])];
    Phaser.Utils.Array.Shuffle(pool);
    const words = pool.slice(0, 10);

    this.state = {
      level,
      words,
      idx: 0,
      word: '',
      revealed: [],
      lives: maxLives,
      maxLives,
      correct: 0,
      total: words.length,
      streak: 0,
      bestStreak: 0,
      missed: [],
      onComplete: data.onComplete || null,
    };
  }

  create() {
    const { width, height } = this.scale;

    // Background gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0b1a2e, 0x0b1a2e, 0x1a3a2a, 0x1a3a2a, 1);
    bg.fillRect(0, 0, width, height);

    // Stars
    for (let i = 0; i < 40; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height * 0.3),
        Phaser.Math.Between(1, 2),
        0xffffff,
        Phaser.Math.FloatBetween(0.2, 0.7)
      );
      this.tweens.add({
        targets: star,
        alpha: { from: star.alpha, to: star.alpha * 0.3 },
        duration: Phaser.Math.Between(1500, 3000),
        yoyo: true,
        repeat: -1,
      });
    }

    // Hint text
    this.hintText = this.add.text(width / 2, 80, '', {
      fontSize: '18px',
      color: '#aabbcc',
      align: 'center',
      wordWrap: { width: width - 60 },
    }).setOrigin(0.5);

    // Word container
    this.wordGroup = this.add.container(width / 2, 150);

    // Streak text
    this.streakText = this.add.text(width / 2, 200, '', {
      fontSize: '16px',
      color: '#ffd93d',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Progress bar
    this._progressBar = this.add.rectangle(width / 2, height - 20, width - 40, 8, 0x1a3a4a).setOrigin(0.5);
    this.progressFill = this.add.rectangle(20, height - 20, 0, 8, 0x3aaa4a).setOrigin(0, 0.5);

    // Hearts (lives)
    this.createHearts();

    // Keyboard
    this.createKeyboard();

    // Particle emitter for celebrations
    this.particles = this.add.particles(width / 2, 150, undefined as unknown as string, {
      speed: { min: 50, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.6, end: 0 },
      lifespan: 800,
      gravityY: 100,
      emitting: false,
      quantity: 12,
    });

    // Keyboard input
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (/^[a-z]$/i.test(event.key)) {
        this.pressKey(event.key.toLowerCase());
      }
    });

    // Load first word
    this.loadWord();
  }

  private createHearts() {
    const startX = 30;
    const y = 30;
    this.hearts = [];
    for (let i = 0; i < this.state.maxLives; i++) {
      const heart = this.add.circle(startX + i * 28, y, 10, COLORS.heartFull);
      this.hearts.push(heart);
    }
  }

  private updateHearts() {
    this.hearts.forEach((heart, i) => {
      heart.setFillStyle(i < this.state.lives ? COLORS.heartFull : COLORS.heartEmpty);
      if (i === this.state.lives) {
        this.tweens.add({
          targets: heart,
          scaleX: 1.5,
          scaleY: 1.5,
          duration: 150,
          yoyo: true,
        });
      }
    });
  }

  private createKeyboard() {
    const { width, height } = this.scale;
    const kbStartY = height - 180;
    const keySize = Math.min(36, (width - 40) / 10 - 4);

    KEYBOARD_ROWS.forEach((row, rowIdx) => {
      const rowWidth = row.length * (keySize + 4);
      const startX = (width - rowWidth) / 2 + keySize / 2;

      for (let i = 0; i < row.length; i++) {
        const ch = row[i];
        const x = startX + i * (keySize + 4);
        const y = kbStartY + rowIdx * (keySize + 6);

        const btn = this.add.rectangle(x, y, keySize, keySize, COLORS.keyDefault, 1)
          .setInteractive({ useHandCursor: true })
          .on('pointerdown', () => this.pressKey(ch));

        btn.setStrokeStyle(1, 0x2a4a5a);

        const txt = this.add.text(x, y, ch, {
          fontSize: `${Math.round(keySize * 0.5)}px`,
          color: '#c0d0e0',
          fontStyle: 'bold',
        }).setOrigin(0.5);

        this.keyButtons.set(ch, btn);
        this.keyTexts.set(ch, txt);
      }
    });
  }

  private loadWord() {
    const item = this.state.words[this.state.idx];
    this.state.word = item.w.toLowerCase();
    this.state.revealed = new Array(this.state.word.length).fill(false);
    this.state.lives = this.state.maxLives;

    this.hintText.setText(item.h);
    this.updateHearts();
    this.updateProgress();
    this.renderWord();
    this.resetKeyboard();
    this.updateStreakDisplay();
  }

  private renderWord() {
    this.wordGroup.removeAll(true);
    this.letterSlots = [];
    this.letterTexts = [];

    const word = this.state.word;
    const slotSize = Math.min(40, (this.scale.width - 60) / word.length - 6);
    const totalWidth = word.length * (slotSize + 6) - 6;
    const startX = -totalWidth / 2 + slotSize / 2;

    for (let i = 0; i < word.length; i++) {
      const x = startX + i * (slotSize + 6);
      const slot = this.add.rectangle(x, 0, slotSize, slotSize + 4, COLORS.slotEmpty, 1);
      slot.setStrokeStyle(2, 0x2a5a4a);
      this.wordGroup.add(slot);
      this.letterSlots.push(slot);

      const txt = this.add.text(x, 0, '', {
        fontSize: `${Math.round(slotSize * 0.6)}px`,
        color: '#ffffff',
        fontStyle: 'bold',
      }).setOrigin(0.5);
      this.wordGroup.add(txt);
      this.letterTexts.push(txt);

      if (this.state.revealed[i]) {
        txt.setText(word[i]);
        slot.setFillStyle(COLORS.slotFilled);
      }
    }
  }

  private resetKeyboard() {
    this.keyButtons.forEach((btn, ch) => {
      btn.setFillStyle(COLORS.keyDefault);
      btn.setInteractive();
      const txt = this.keyTexts.get(ch);
      if (txt) txt.setColor('#c0d0e0');
    });
  }

  private pressKey(ch: string) {
    const btn = this.keyButtons.get(ch);
    if (!btn || !btn.input?.enabled) return;

    let found = false;
    for (let i = 0; i < this.state.word.length; i++) {
      if (this.state.word[i] === ch && !this.state.revealed[i]) {
        this.state.revealed[i] = true;
        found = true;
      }
    }

    if (found) {
      btn.setFillStyle(COLORS.keyCorrect);
      btn.disableInteractive();
      sfxCorrect();
      this.renderWord();

      // Check if word complete
      if (this.state.revealed.every(Boolean)) {
        this.onWordCorrect();
      }
    } else {
      btn.setFillStyle(COLORS.keyWrong);
      btn.disableInteractive();
      this.state.lives--;
      this.updateHearts();
      sfxWrong();

      // Shake the word
      this.tweens.add({
        targets: this.wordGroup,
        x: { from: this.scale.width / 2 - 8, to: this.scale.width / 2 + 8 },
        duration: 60,
        yoyo: true,
        repeat: 2,
        onComplete: () => this.wordGroup.setX(this.scale.width / 2),
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

    // Celebrate
    this.particles.explode(15, this.scale.width / 2, 150);

    if (this.state.streak >= 5) {
      sfxLevelUp();
    } else if (this.state.streak >= 3) {
      sfxStreak();
    }

    this.updateStreakDisplay();

    this.time.delayedCall(800, () => this.nextWord());
  }

  private onWordFailed() {
    this.state.streak = 0;
    this.state.missed.push({
      w: this.state.word,
      h: this.state.words[this.state.idx].h,
    });

    // Reveal the word
    this.state.revealed = this.state.revealed.map(() => true);
    this.renderWord();
    this.letterSlots.forEach((slot) => slot.setFillStyle(COLORS.slotWrong));

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
    const stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : pct >= 0.3 ? 1 : 0;

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
    const pct = this.state.idx / this.state.total;
    const barWidth = (this.scale.width - 40) * pct;
    this.progressFill.setSize(barWidth, 8);
  }

  private updateStreakDisplay() {
    if (this.state.streak >= 5) {
      this.streakText.setText(`\u{1F525}\u{1F525} ${this.state.streak} words! On fire!`);
    } else if (this.state.streak >= 3) {
      this.streakText.setText(`\u{1F525} ${this.state.streak} in a row!`);
    } else if (this.state.streak >= 2) {
      this.streakText.setText(`\u2B50 ${this.state.streak} streak!`);
    } else {
      this.streakText.setText('');
    }
  }
}
