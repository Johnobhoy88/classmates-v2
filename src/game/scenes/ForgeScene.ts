import Phaser from 'phaser';
import { sfxCorrect, sfxWrong, sfxStreak, sfxLevelUp } from '../systems/AudioSystem';

type OnCompleteCallback = (result: {
  correct: number;
  total: number;
  stars: number;
  bestStreak: number;
  missed: Array<{ w: string; h: string }>;
}) => void;

interface ForgeQuestion {
  text: string;
  answer: number;
  options: number[];
}

interface ForgeState {
  questions: ForgeQuestion[];
  idx: number;
  correct: number;
  streak: number;
  bestStreak: number;
  missed: Array<{ w: string; h: string }>;
  answered: boolean;
  crafted: string[];
  onComplete: OnCompleteCallback | null;
}

const CRAFT_MILESTONES = [
  { threshold: 3, name: 'Iron Nail', emoji: '\u{1F528}' },
  { threshold: 5, name: 'Bronze Key', emoji: '\u{1F511}' },
  { threshold: 7, name: 'Silver Shield', emoji: '\u{1F6E1}' },
  { threshold: 9, name: 'Gold Crown', emoji: '\u{1F451}' },
];

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function genQuestion(level: number): { text: string; answer: number } {
  let a: number, b: number, op: string, ans: number;
  if (level === 1) {
    op = Math.random() < 0.5 ? '+' : '-';
    if (op === '+') { a = randInt(1, 9); b = randInt(1, 10 - a); ans = a + b; }
    else { a = randInt(2, 10); b = randInt(1, a); ans = a - b; }
  } else if (level === 2) {
    const r = Math.random();
    if (r < 0.4) { op = '+'; a = randInt(5, 20); b = randInt(1, 20 - a); ans = a + b; }
    else if (r < 0.8) { op = '-'; a = randInt(5, 20); b = randInt(1, a); ans = a - b; }
    else { op = '\u00D7'; a = randInt(2, 6); b = randInt(2, 6); ans = a * b; }
  } else {
    const r = Math.random();
    if (r < 0.3) { op = '+'; a = randInt(10, 90); b = randInt(5, 100 - a); ans = a + b; }
    else if (r < 0.6) { op = '-'; a = randInt(20, 100); b = randInt(5, a); ans = a - b; }
    else { op = '\u00D7'; a = randInt(2, 12); b = randInt(2, 12); ans = a * b; }
  }
  return { text: `${a} ${op} ${b}`, answer: ans! };
}

function genOptions(correct: number): number[] {
  const opts = [correct];
  while (opts.length < 4) {
    const off = randInt(1, Math.max(3, Math.floor(Math.abs(correct) * 0.3) + 1));
    const wrong = correct + (Math.random() < 0.5 ? off : -off);
    const val = wrong < 0 ? Math.abs(wrong) : wrong;
    if (!opts.includes(val)) opts.push(val);
  }
  Phaser.Utils.Array.Shuffle(opts);
  return opts;
}

export class ForgeScene extends Phaser.Scene {
  private state!: ForgeState;
  private questionText!: Phaser.GameObjects.Text;
  private feedbackText!: Phaser.GameObjects.Text;
  private craftText!: Phaser.GameObjects.Text;
  private streakText!: Phaser.GameObjects.Text;
  private progressFill!: Phaser.GameObjects.Rectangle;
  private optionButtons: Phaser.GameObjects.Container[] = [];
  private anvilGlow!: Phaser.GameObjects.Rectangle;
  private fireGlow!: Phaser.GameObjects.Arc;
  private sparks!: Phaser.GameObjects.Particles.ParticleEmitter;
  private heat = 0;

  constructor() {
    super({ key: 'ForgeScene' });
  }

  init(data: { level?: number; onComplete?: OnCompleteCallback }) {
    const level = data.level || 1;
    const questions: ForgeQuestion[] = [];
    for (let i = 0; i < 10; i++) {
      const q = genQuestion(level);
      questions.push({ ...q, options: genOptions(q.answer) });
    }
    this.state = {
      questions,
      idx: 0,
      correct: 0,
      streak: 0,
      bestStreak: 0,
      missed: [],
      answered: false,
      crafted: [],
      onComplete: data.onComplete || null,
    };
    this.heat = 0;
  }

  create() {
    const { width, height } = this.scale;

    // Dark forge background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a0a0a, 0x1a0a0a, 0x2a1208, 0x2a1208, 1);
    bg.fillRect(0, 0, width, height);

    // Fire glow (grows with heat)
    this.fireGlow = this.add.circle(width / 2, height * 0.55, 40, 0xff6a1a, 0);

    // Anvil
    this.add.rectangle(width / 2, height * 0.6, 80, 20, 0x3a3a4a);
    this.add.rectangle(width / 2, height * 0.62, 100, 12, 0x2a2a3a);
    this.anvilGlow = this.add.rectangle(width / 2, height * 0.595, 30, 6, 0xff4400, 0);

    // Spark emitter
    this.sparks = this.add.particles(width / 2, height * 0.55, undefined as unknown as string, {
      speed: { min: 30, max: 150 },
      angle: { min: 220, max: 320 },
      scale: { start: 0.4, end: 0 },
      lifespan: 600,
      gravityY: 80,
      tint: [0xffd93d, 0xffffee, 0xff6a1a],
      emitting: false,
      quantity: 8,
    });

    // Question
    this.questionText = this.add.text(width / 2, height * 0.2, '', {
      fontSize: '42px', color: '#ffd93d', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Feedback
    this.feedbackText = this.add.text(width / 2, height * 0.32, '', {
      fontSize: '18px', color: '#6aee6a',
    }).setOrigin(0.5);

    // Craft progress
    this.craftText = this.add.text(width / 2, height * 0.74, '', {
      fontSize: '14px', color: '#ffd93d', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Streak
    this.streakText = this.add.text(width / 2, height * 0.12, '', {
      fontSize: '15px', color: '#ffd93d', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Progress bar
    this.add.rectangle(width / 2, height - 16, width - 40, 6, 0x1a1a1a).setOrigin(0.5);
    this.progressFill = this.add.rectangle(20, height - 16, 0, 6, 0xcc4400).setOrigin(0, 0.5);

    this.loadQuestion();
  }

  private loadQuestion() {
    if (this.state.idx >= this.state.questions.length) {
      this.finishGame();
      return;
    }
    this.state.answered = false;
    const q = this.state.questions[this.state.idx];
    this.questionText.setText(q.text + ' = ?');
    this.feedbackText.setText('');
    this.updateProgress();
    this.updateCraft();
    this.renderOptions(q);
  }

  private renderOptions(q: ForgeQuestion) {
    const { width, height } = this.scale;
    this.optionButtons.forEach((c) => c.destroy());
    this.optionButtons = [];

    const btnW = Math.min(120, (width - 50) / 2);
    const positions = [
      { x: width / 2 - btnW / 2 - 6, y: height * 0.42 },
      { x: width / 2 + btnW / 2 + 6, y: height * 0.42 },
      { x: width / 2 - btnW / 2 - 6, y: height * 0.42 + 56 },
      { x: width / 2 + btnW / 2 + 6, y: height * 0.42 + 56 },
    ];

    q.options.forEach((opt, i) => {
      const container = this.add.container(positions[i].x, positions[i].y);
      const bg = this.add.rectangle(0, 0, btnW, 48, 0x4a1a08, 1)
        .setStrokeStyle(2, 0x6a3a1a)
        .setInteractive({ useHandCursor: true });
      const txt = this.add.text(0, 0, String(opt), {
        fontSize: '22px', color: '#f0e0d0', fontStyle: 'bold',
      }).setOrigin(0.5);
      container.add([bg, txt]);
      this.optionButtons.push(container);
      bg.on('pointerdown', () => this.selectAnswer(opt, q.answer, i));
    });
  }

  private selectAnswer(chosen: number, correct: number, idx: number) {
    if (this.state.answered) return;
    this.state.answered = true;
    const isCorrect = chosen === correct;

    this.optionButtons.forEach((c, i) => {
      const bg = c.getAt(0) as Phaser.GameObjects.Rectangle;
      bg.disableInteractive();
      if (this.state.questions[this.state.idx].options[i] === correct) bg.setFillStyle(0x2a8a4a);
      if (i === idx && !isCorrect) bg.setFillStyle(0x8a2a2a);
    });

    if (isCorrect) {
      this.state.correct++;
      this.state.streak++;
      this.state.bestStreak = Math.max(this.state.bestStreak, this.state.streak);
      this.heat = Math.min(1, this.state.correct / this.state.questions.length + 0.1);

      // Fire and anvil glow
      this.fireGlow.setAlpha(this.heat * 0.5);
      this.fireGlow.setScale(1 + this.heat);
      this.anvilGlow.setAlpha(this.heat * 0.8);

      // Sparks
      this.sparks.explode(10);

      sfxCorrect();
      this.feedbackText.setText(this.state.streak >= 3 ? `\u{1F525} ${this.state.streak} streak!` : 'Correct!');
      this.feedbackText.setColor('#6aee6a');
      if (this.state.streak >= 5) sfxLevelUp();
      else if (this.state.streak >= 3) sfxStreak();

      // Check craft milestones
      for (const m of CRAFT_MILESTONES) {
        if (this.state.correct === m.threshold && !this.state.crafted.includes(m.emoji)) {
          this.state.crafted.push(m.emoji);
          this.feedbackText.setText(`${m.emoji} Crafted: ${m.name}!`);
          sfxLevelUp();
          break;
        }
      }
    } else {
      this.state.streak = 0;
      this.state.missed.push({ w: this.state.questions[this.state.idx].text, h: `Answer: ${correct}` });
      sfxWrong();
      this.feedbackText.setText(`The answer was ${correct}`);
      this.feedbackText.setColor('#ee6a6a');
      this.heat = Math.max(0, this.heat - 0.1);
      this.fireGlow.setAlpha(this.heat * 0.5);
    }

    this.streakText.setText(this.state.streak >= 3 ? `\u{1F525} ${this.state.streak} in a row!` : '');

    this.time.delayedCall(isCorrect ? 800 : 1500, () => {
      this.state.idx++;
      this.loadQuestion();
    });
  }

  private updateProgress() {
    const pct = this.state.idx / this.state.questions.length;
    this.progressFill.setSize((this.scale.width - 40) * pct, 6);
  }

  private updateCraft() {
    const next = CRAFT_MILESTONES.find((m) => this.state.correct < m.threshold);
    if (next) {
      this.craftText.setText(`Next: ${next.emoji} ${next.name} (${this.state.correct}/${next.threshold})`);
    } else {
      this.craftText.setText(this.state.crafted.join(' ') + ' All crafted!');
    }
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
