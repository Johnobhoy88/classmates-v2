import Phaser from 'phaser';
import { SPELLING, type SpellingWord } from '../content/spelling-packs';
import { sfxCorrect, sfxWrong, sfxStreak, sfxLevelUp } from '../systems/AudioSystem';

type OnCompleteCallback = (result: {
  correct: number;
  total: number;
  stars: number;
  bestStreak: number;
  missed: Array<{ w: string; h: string }>;
}) => void;

interface ForestQuestion {
  prompt: string;
  display: string;
  answer: string;
  options: string[];
  hint: string;
  word: string;
}

interface ForestState {
  questions: ForestQuestion[];
  idx: number;
  correct: number;
  streak: number;
  bestStreak: number;
  missed: Array<{ w: string; h: string }>;
  answered: boolean;
  onComplete: OnCompleteCallback | null;
}

function generateLetterOptions(correct: string): string[] {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const opts = [correct];
  while (opts.length < 4) {
    const ch = letters[Math.floor(Math.random() * 26)];
    if (!opts.includes(ch)) opts.push(ch);
  }
  Phaser.Utils.Array.Shuffle(opts);
  return opts;
}

function generateQuestions(level: number): ForestQuestion[] {
  const pool = [...(SPELLING[level] || SPELLING[1])];
  Phaser.Utils.Array.Shuffle(pool);
  const words = pool.slice(0, 10);
  const questions: ForestQuestion[] = [];

  words.forEach((item: SpellingWord, i: number) => {
    const word = item.w.toLowerCase();
    if (i % 2 === 0) {
      // Missing letter
      const hideIdx = Math.floor(Math.random() * word.length);
      const display = word.split('').map((ch: string, idx: number) => idx === hideIdx ? '_' : ch).join('');
      questions.push({
        prompt: item.h,
        display,
        answer: word[hideIdx],
        options: generateLetterOptions(word[hideIdx]),
        hint: `The missing letter in "${word}" is "${word[hideIdx]}"`,
        word,
      });
    } else {
      // Missing vowel
      const vowels: number[] = [];
      for (let v = 0; v < word.length; v++) {
        if ('aeiou'.includes(word[v])) vowels.push(v);
      }
      if (vowels.length > 0) {
        const vIdx = vowels[Math.floor(Math.random() * vowels.length)];
        const display = word.split('').map((ch: string, idx: number) => idx === vIdx ? '_' : ch).join('');
        questions.push({
          prompt: `Fill the vowel: ${item.h}`,
          display,
          answer: word[vIdx],
          options: ['a', 'e', 'i', 'o', 'u'],
          hint: `The missing vowel is "${word[vIdx]}"`,
          word,
        });
      } else {
        // Fallback: missing letter
        const hideIdx = 0;
        const display = '_' + word.slice(1);
        questions.push({
          prompt: item.h,
          display,
          answer: word[0],
          options: generateLetterOptions(word[0]),
          hint: `The word starts with "${word[0]}"`,
          word,
        });
      }
    }
  });

  return questions;
}

export class ForestScene extends Phaser.Scene {
  private state!: ForestState;
  private trees: Phaser.GameObjects.Triangle[] = [];
  private pathGraphics!: Phaser.GameObjects.Graphics;
  private promptText!: Phaser.GameObjects.Text;
  private displayText!: Phaser.GameObjects.Text;
  private hintText!: Phaser.GameObjects.Text;
  private streakText!: Phaser.GameObjects.Text;
  private progressFill!: Phaser.GameObjects.Rectangle;
  private optionButtons: Phaser.GameObjects.Container[] = [];
  private pathProgress = 0;

  constructor() {
    super({ key: 'ForestScene' });
  }

  init(data: { level?: number; onComplete?: OnCompleteCallback }) {
    this.state = {
      questions: generateQuestions(data.level || 1),
      idx: 0,
      correct: 0,
      streak: 0,
      bestStreak: 0,
      missed: [],
      answered: false,
      onComplete: data.onComplete || null,
    };
    this.pathProgress = 0;
  }

  create() {
    const { width, height } = this.scale;

    // Night sky
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0b1a2e, 0x0b1a2e, 0x1a3a2a, 0x1a3a2a, 1);
    bg.fillRect(0, 0, width, height);

    // Stars
    for (let i = 0; i < 30; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height * 0.35),
        Phaser.Math.Between(1, 2),
        0xffffff,
        Phaser.Math.FloatBetween(0.2, 0.6)
      );
      this.tweens.add({
        targets: star,
        alpha: { from: star.alpha, to: star.alpha * 0.3 },
        duration: Phaser.Math.Between(1500, 3000),
        yoyo: true,
        repeat: -1,
      });
    }

    // Ground
    this.add.rectangle(width / 2, height * 0.8, width, height * 0.4, 0x1a3a2a);

    // Forest path
    this.pathGraphics = this.add.graphics();
    this.drawPath();

    // Trees (dim initially, glow on correct answers)
    this.trees = [];
    for (let i = 0; i < 12; i++) {
      const tx = Phaser.Math.Between(20, width - 20);
      const ty = height * 0.5 + Phaser.Math.Between(0, height * 0.25);
      const size = Phaser.Math.Between(20, 40);
      const tree = this.add.triangle(tx, ty, 0, size, size / 2, 0, size, size, 0x1a5a2a);
      tree.setAlpha(0.3);
      this.trees.push(tree);
      // Trunk
      this.add.rectangle(tx + size / 4, ty + size / 2, 4, 10, 0x4a3020);
    }

    // UI
    this.promptText = this.add.text(width / 2, 60, '', {
      fontSize: '16px', color: '#aabbcc', align: 'center',
      wordWrap: { width: width - 40 },
    }).setOrigin(0.5);

    this.displayText = this.add.text(width / 2, 110, '', {
      fontSize: '36px', color: '#7fdd6a', fontStyle: 'bold',
      letterSpacing: 6,
    }).setOrigin(0.5);

    this.hintText = this.add.text(width / 2, height * 0.42, '', {
      fontSize: '13px', color: '#6ab8ee', align: 'center',
      wordWrap: { width: width - 60 },
    }).setOrigin(0.5).setAlpha(0);

    this.streakText = this.add.text(width / 2, 150, '', {
      fontSize: '15px', color: '#ffd93d', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Progress bar
    this.add.rectangle(width / 2, height - 16, width - 40, 6, 0x1a3a4a).setOrigin(0.5);
    this.progressFill = this.add.rectangle(20, height - 16, 0, 6, 0x3aaa4a).setOrigin(0, 0.5);

    this.loadQuestion();
  }

  private drawPath() {
    const { width, height } = this.scale;
    const g = this.pathGraphics;
    g.clear();

    // Dim path
    g.lineStyle(20, 0x3a4a3a, 1);
    g.beginPath();
    g.moveTo(width * 0.1, height * 0.7);
    g.lineTo(width * 0.9, height * 0.65);
    g.strokePath();

    // Glowing portion
    if (this.pathProgress > 0) {
      const endX = width * 0.1 + (width * 0.8) * this.pathProgress;
      g.lineStyle(16, 0x7fdd6a, 0.8);
      g.beginPath();
      g.moveTo(width * 0.1, height * 0.7);
      g.lineTo(endX, height * 0.7 - this.pathProgress * 5);
      g.strokePath();
    }
  }

  private loadQuestion() {
    if (this.state.idx >= this.state.questions.length) {
      this.finishGame();
      return;
    }
    this.state.answered = false;
    const q = this.state.questions[this.state.idx];
    this.promptText.setText(q.prompt);
    this.displayText.setText(q.display);
    this.hintText.setAlpha(0);
    this.updateProgress();
    this.renderOptions(q);
  }

  private renderOptions(q: ForestQuestion) {
    const { width, height } = this.scale;
    this.optionButtons.forEach((c) => c.destroy());
    this.optionButtons = [];

    const btnW = Math.min(90, (width - 50) / q.options.length - 8);
    const totalW = q.options.length * (btnW + 8) - 8;
    const startX = (width - totalW) / 2 + btnW / 2;
    const y = height * 0.32;

    q.options.forEach((opt, i) => {
      const container = this.add.container(startX + i * (btnW + 8), y);
      const bg = this.add.rectangle(0, 0, btnW, 48, 0x2a5a3a, 1)
        .setStrokeStyle(2, 0x3a8a5a)
        .setInteractive({ useHandCursor: true });
      const txt = this.add.text(0, 0, opt, {
        fontSize: '20px', color: '#e8f0e0', fontStyle: 'bold',
      }).setOrigin(0.5);

      container.add([bg, txt]);
      this.optionButtons.push(container);
      bg.on('pointerdown', () => this.selectAnswer(opt, q.answer, i));
    });
  }

  private selectAnswer(chosen: string, correct: string, idx: number) {
    if (this.state.answered) return;
    this.state.answered = true;
    const isCorrect = chosen === correct;

    this.optionButtons.forEach((c, i) => {
      const bg = c.getAt(0) as Phaser.GameObjects.Rectangle;
      bg.disableInteractive();
      const opt = this.state.questions[this.state.idx].options[i];
      if (opt === correct) bg.setFillStyle(0x3aaa4a);
      if (i === idx && !isCorrect) bg.setFillStyle(0xaa3333);
    });

    if (isCorrect) {
      this.state.correct++;
      this.state.streak++;
      this.state.bestStreak = Math.max(this.state.bestStreak, this.state.streak);
      this.pathProgress = this.state.correct / this.state.questions.length;
      this.drawPath();

      // Light up trees
      const treeIdx = this.state.correct % this.trees.length;
      this.tweens.add({
        targets: this.trees[treeIdx],
        alpha: 1,
        fillColor: { from: 0x1a5a2a, to: 0x3aaa4a },
        duration: 400,
      });

      sfxCorrect();
      if (this.state.streak >= 5) sfxLevelUp();
      else if (this.state.streak >= 3) sfxStreak();

      this.streakText.setText(
        this.state.streak >= 3 ? `\u{1F525} ${this.state.streak} in a row!` : ''
      );
    } else {
      this.state.streak = 0;
      this.state.missed.push({ w: this.state.questions[this.state.idx].word, h: this.state.questions[this.state.idx].hint });
      sfxWrong();
      this.streakText.setText('');

      // Show hint
      this.hintText.setText(this.state.questions[this.state.idx].hint);
      this.tweens.add({ targets: this.hintText, alpha: 1, duration: 300 });
    }

    this.time.delayedCall(isCorrect ? 800 : 2000, () => {
      this.state.idx++;
      this.loadQuestion();
    });
  }

  private updateProgress() {
    const pct = this.state.idx / this.state.questions.length;
    this.progressFill.setSize((this.scale.width - 40) * pct, 6);
  }

  private finishGame() {
    const pct = this.state.correct / this.state.questions.length;
    const stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : pct >= 0.3 ? 1 : 0;
    if (stars >= 3) sfxLevelUp();
    if (this.state.onComplete) {
      this.state.onComplete({
        correct: this.state.correct,
        total: this.state.questions.length,
        stars,
        bestStreak: this.state.bestStreak,
        missed: this.state.missed,
      });
    }
  }
}
