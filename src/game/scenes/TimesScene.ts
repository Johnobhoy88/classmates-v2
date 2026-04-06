import Phaser from 'phaser';
import { sfxCorrect, sfxWrong, sfxStreak, sfxLevelUp } from '../systems/AudioSystem';

type OnCompleteCallback = (result: {
  correct: number;
  total: number;
  stars: number;
  bestStreak: number;
  missed: Array<{ w: string; h: string }>;
}) => void;

interface TTQuestion {
  a: number;
  b: number;
  answer: number;
  options: number[];
}

interface TimesState {
  table: number;
  questions: TTQuestion[];
  idx: number;
  correct: number;
  streak: number;
  bestStreak: number;
  missed: Array<{ w: string; h: string }>;
  answered: boolean;
  startTime: number;
  onComplete: OnCompleteCallback | null;
}

function genQuestions(table: number): TTQuestion[] {
  const questions: TTQuestion[] = [];
  const factors = [];
  for (let i = 1; i <= 12; i++) factors.push(i);
  Phaser.Utils.Array.Shuffle(factors);

  for (const b of factors) {
    const answer = table * b;
    const opts = [answer];
    while (opts.length < 4) {
      // Near-miss distractors
      const off = Phaser.Math.Between(1, Math.max(table, 3));
      const wrong = answer + (Math.random() < 0.5 ? off : -off);
      if (wrong > 0 && !opts.includes(wrong)) opts.push(wrong);
    }
    Phaser.Utils.Array.Shuffle(opts);
    questions.push({ a: table, b, answer, options: opts });
  }
  return questions;
}

export class TimesScene extends Phaser.Scene {
  private state!: TimesState;
  private questionText!: Phaser.GameObjects.Text;
  private feedbackText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private streakText!: Phaser.GameObjects.Text;
  private progressFill!: Phaser.GameObjects.Rectangle;
  private optionButtons: Phaser.GameObjects.Container[] = [];
  private selectMode = false;
  private tableButtons: Phaser.GameObjects.Container[] = [];

  constructor() {
    super({ key: 'TimesScene' });
  }

  init(data: { level?: number; onComplete?: OnCompleteCallback }) {
    this.state = {
      table: data.level || 0, // 0 = show selector
      questions: [],
      idx: 0,
      correct: 0,
      streak: 0,
      bestStreak: 0,
      missed: [],
      answered: false,
      startTime: 0,
      onComplete: data.onComplete || null,
    };
    this.selectMode = this.state.table === 0;
  }

  create() {
    const { width, height } = this.scale;

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a0820, 0x1a0820, 0x2a1040, 0x2a1040, 1);
    bg.fillRect(0, 0, width, height);

    if (this.selectMode) {
      this.showTableSelector();
    } else {
      this.startDrill(this.state.table);
    }
  }

  private showTableSelector() {
    const { width, height } = this.scale;

    this.add.text(width / 2, 50, 'Pick your table', {
      fontSize: '24px', color: '#e0d0ff', fontStyle: 'bold',
    }).setOrigin(0.5);

    const btnSize = Math.min(64, (width - 60) / 4 - 8);
    const cols = 4;

    for (let i = 2; i <= 12; i++) {
      const col = (i - 2) % cols;
      const row = Math.floor((i - 2) / cols);
      const x = (width - cols * (btnSize + 8) + 8) / 2 + col * (btnSize + 8) + btnSize / 2;
      const y = 120 + row * (btnSize + 10) + btnSize / 2;

      const container = this.add.container(x, y);
      const bg = this.add.rectangle(0, 0, btnSize, btnSize, 0x3a1a5a, 1)
        .setStrokeStyle(2, 0x6a3a8a)
        .setInteractive({ useHandCursor: true });
      const txt = this.add.text(0, -2, `${i}\u00D7`, {
        fontSize: `${Math.round(btnSize * 0.35)}px`,
        color: '#e0d0ff',
        fontStyle: 'bold',
      }).setOrigin(0.5);

      container.add([bg, txt]);
      this.tableButtons.push(container);

      bg.on('pointerdown', () => {
        this.tableButtons.forEach((c) => c.destroy());
        this.tableButtons = [];
        this.startDrill(i);
      });
    }

    // Mixed option
    const mixY = 120 + Math.ceil(11 / cols) * (btnSize + 10) + 30;
    const mixBtn = this.add.container(width / 2, mixY);
    const mixBg = this.add.rectangle(0, 0, 160, 44, 0x5a2a8a, 1)
      .setStrokeStyle(2, 0x8a4aba)
      .setInteractive({ useHandCursor: true });
    const mixTxt = this.add.text(0, 0, 'Mixed tables', {
      fontSize: '16px', color: '#e0d0ff', fontStyle: 'bold',
    }).setOrigin(0.5);
    mixBtn.add([mixBg, mixTxt]);
    this.tableButtons.push(mixBtn);

    mixBg.on('pointerdown', () => {
      this.tableButtons.forEach((c) => c.destroy());
      this.tableButtons = [];
      this.startMixedDrill();
    });
  }

  private startDrill(table: number) {
    this.state.table = table;
    this.state.questions = genQuestions(table);
    this.state.startTime = Date.now();
    this.setupDrillUI();
    this.loadQuestion();
  }

  private startMixedDrill() {
    const questions: TTQuestion[] = [];
    for (let t = 2; t <= 12; t++) {
      const b = Phaser.Math.Between(2, 12);
      const answer = t * b;
      const opts = [answer];
      while (opts.length < 4) {
        const off = Phaser.Math.Between(1, t);
        const wrong = answer + (Math.random() < 0.5 ? off : -off);
        if (wrong > 0 && !opts.includes(wrong)) opts.push(wrong);
      }
      Phaser.Utils.Array.Shuffle(opts);
      questions.push({ a: t, b, answer, options: opts });
    }
    Phaser.Utils.Array.Shuffle(questions);
    this.state.questions = questions.slice(0, 12);
    this.state.table = 0;
    this.state.startTime = Date.now();
    this.setupDrillUI();
    this.loadQuestion();
  }

  private setupDrillUI() {
    const { width, height } = this.scale;

    this.questionText = this.add.text(width / 2, height * 0.2, '', {
      fontSize: '48px', color: '#e0d0ff', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.feedbackText = this.add.text(width / 2, height * 0.33, '', {
      fontSize: '20px', color: '#6aee6a',
    }).setOrigin(0.5);

    this.timerText = this.add.text(width - 20, 20, '', {
      fontSize: '14px', color: '#8a7aaa',
    }).setOrigin(1, 0);

    this.streakText = this.add.text(width / 2, height * 0.12, '', {
      fontSize: '15px', color: '#ffd93d', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.rectangle(width / 2, height - 16, width - 40, 6, 0x1a1a2a).setOrigin(0.5);
    this.progressFill = this.add.rectangle(20, height - 16, 0, 6, 0x8a4aba).setOrigin(0, 0.5);

    // Timer update
    this.time.addEvent({
      delay: 100,
      loop: true,
      callback: () => {
        if (this.state.startTime) {
          const elapsed = ((Date.now() - this.state.startTime) / 1000).toFixed(1);
          this.timerText.setText(`${elapsed}s`);
        }
      },
    });
  }

  private loadQuestion() {
    if (this.state.idx >= this.state.questions.length) {
      this.finishGame();
      return;
    }
    this.state.answered = false;
    const q = this.state.questions[this.state.idx];
    this.questionText.setText(`${q.a} \u00D7 ${q.b} = ?`);
    this.feedbackText.setText('');
    this.progressFill.setSize(
      (this.scale.width - 40) * (this.state.idx / this.state.questions.length), 6
    );
    this.renderOptions(q);
  }

  private renderOptions(q: TTQuestion) {
    const { width, height } = this.scale;
    this.optionButtons.forEach((c) => c.destroy());
    this.optionButtons = [];

    const btnW = Math.min(120, (width - 50) / 2);
    const positions = [
      { x: width / 2 - btnW / 2 - 6, y: height * 0.45 },
      { x: width / 2 + btnW / 2 + 6, y: height * 0.45 },
      { x: width / 2 - btnW / 2 - 6, y: height * 0.45 + 56 },
      { x: width / 2 + btnW / 2 + 6, y: height * 0.45 + 56 },
    ];

    q.options.forEach((opt, i) => {
      const container = this.add.container(positions[i].x, positions[i].y);
      const bg = this.add.rectangle(0, 0, btnW, 48, 0x3a1a5a, 1)
        .setStrokeStyle(2, 0x5a3a7a)
        .setInteractive({ useHandCursor: true });
      const txt = this.add.text(0, 0, String(opt), {
        fontSize: '24px', color: '#e0d0ff', fontStyle: 'bold',
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

    const q = this.state.questions[this.state.idx];
    if (isCorrect) {
      this.state.correct++;
      this.state.streak++;
      this.state.bestStreak = Math.max(this.state.bestStreak, this.state.streak);
      sfxCorrect();
      this.feedbackText.setText(this.state.streak >= 3 ? `\u{1F525} ${this.state.streak}!` : '\u2714');
      this.feedbackText.setColor('#6aee6a');
      if (this.state.streak >= 5) sfxLevelUp();
      else if (this.state.streak >= 3) sfxStreak();
    } else {
      this.state.streak = 0;
      this.state.missed.push({ w: `${q.a} \u00D7 ${q.b}`, h: `= ${correct}` });
      sfxWrong();
      this.feedbackText.setText(`${correct}`);
      this.feedbackText.setColor('#ee6a6a');
    }

    this.streakText.setText(this.state.streak >= 3 ? `\u{1F525} ${this.state.streak} in a row!` : '');

    this.time.delayedCall(isCorrect ? 500 : 1200, () => {
      this.state.idx++;
      this.loadQuestion();
    });
  }

  private finishGame() {
    const elapsed = ((Date.now() - this.state.startTime) / 1000).toFixed(1);
    const pct = this.state.correct / this.state.questions.length;
    const stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : pct >= 0.3 ? 1 : 0;
    if (stars >= 3) sfxLevelUp();
    if (this.state.onComplete) {
      this.state.onComplete({
        correct: this.state.correct,
        total: this.state.questions.length,
        stars,
        bestStreak: this.state.bestStreak,
        missed: this.state.missed.map((m) => ({ ...m, h: `${m.h} (${elapsed}s total)` })),
      });
    }
  }
}
