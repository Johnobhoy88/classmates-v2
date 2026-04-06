import Phaser from 'phaser';
import { sfxCorrect, sfxWrong, sfxStreak } from '../systems/AudioSystem';

type OnCompleteCallback = (result: {
  correct: number;
  total: number;
  stars: number;
  bestStreak: number;
  missed: Array<{ w: string; h: string }>;
}) => void;

interface MathQuestion {
  text: string;
  answer: number;
  options: number[];
}

interface MathsState {
  level: number;
  questions: MathQuestion[];
  idx: number;
  correct: number;
  streak: number;
  bestStreak: number;
  missed: Array<{ w: string; h: string }>;
  answered: boolean;
  onComplete: OnCompleteCallback | null;
}

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
    if (r < 0.4) { op = '+'; a = randInt(1, 15); b = randInt(1, 20 - a); ans = a + b; }
    else if (r < 0.8) { op = '-'; a = randInt(5, 20); b = randInt(1, a); ans = a - b; }
    else { op = '\u00D7'; a = randInt(2, 5); b = randInt(2, 5); ans = a * b; }
  } else {
    const r = Math.random();
    if (r < 0.3) { op = '+'; a = randInt(10, 90); b = randInt(5, 100 - a); ans = a + b; }
    else if (r < 0.6) { op = '-'; a = randInt(20, 100); b = randInt(5, a); ans = a - b; }
    else if (r < 0.85) { op = '\u00D7'; a = randInt(2, 12); b = randInt(2, 12); ans = a * b; }
    else { ans = randInt(2, 12); b = randInt(2, 12); a = ans * b; op = '\u00F7'; }
  }
  return { text: `${a} ${op} ${b} = ?`, answer: ans! };
}

function genOptions(correct: number): number[] {
  const opts = [correct];
  while (opts.length < 4) {
    const offset = randInt(1, Math.max(3, Math.abs(correct) * 0.3 + 1));
    const wrong = correct + (Math.random() < 0.5 ? offset : -offset);
    const val = wrong < 0 ? Math.abs(wrong) : wrong;
    if (!opts.includes(val) && val !== correct) opts.push(val);
  }
  Phaser.Utils.Array.Shuffle(opts);
  return opts;
}

export class MathsScene extends Phaser.Scene {
  private state!: MathsState;
  private questionText!: Phaser.GameObjects.Text;
  private optionButtons: Phaser.GameObjects.Container[] = [];
  private feedbackText!: Phaser.GameObjects.Text;
  private progressFill!: Phaser.GameObjects.Rectangle;
  private streakText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'MathsScene' });
  }

  init(data: { level?: number; onComplete?: OnCompleteCallback }) {
    const level = data.level || 1;
    const questions: MathQuestion[] = [];
    for (let i = 0; i < 10; i++) {
      const q = genQuestion(level);
      questions.push({ ...q, options: genOptions(q.answer) });
    }
    this.state = {
      level,
      questions,
      idx: 0,
      correct: 0,
      streak: 0,
      bestStreak: 0,
      missed: [],
      answered: false,
      onComplete: data.onComplete || null,
    };
  }

  create() {
    const { width, height } = this.scale;

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a1628, 0x0a1628, 0x102040, 0x102040, 1);
    bg.fillRect(0, 0, width, height);

    // Question text
    this.questionText = this.add.text(width / 2, height * 0.25, '', {
      fontSize: '48px',
      color: '#ffd93d',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Feedback
    this.feedbackText = this.add.text(width / 2, height * 0.38, '', {
      fontSize: '20px',
      color: '#6aee6a',
    }).setOrigin(0.5);

    // Streak
    this.streakText = this.add.text(width / 2, height * 0.15, '', {
      fontSize: '16px',
      color: '#ffd93d',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Progress bar
    this.add.rectangle(width / 2, height - 20, width - 40, 8, 0x1a3a4a).setOrigin(0.5);
    this.progressFill = this.add.rectangle(20, height - 20, 0, 8, 0x0984e3).setOrigin(0, 0.5);

    this.loadQuestion();
  }

  private loadQuestion() {
    if (this.state.idx >= this.state.questions.length) {
      this.finishGame();
      return;
    }

    const q = this.state.questions[this.state.idx];
    this.state.answered = false;
    this.questionText.setText(q.text);
    this.feedbackText.setText('');
    this.updateProgress();
    this.renderOptions(q);
  }

  private renderOptions(q: MathQuestion) {
    const { width, height } = this.scale;
    this.optionButtons.forEach((c) => c.destroy());
    this.optionButtons = [];

    const btnW = Math.min(140, (width - 60) / 2);
    const btnH = 56;
    const positions = [
      { x: width / 2 - btnW / 2 - 8, y: height * 0.5 },
      { x: width / 2 + btnW / 2 + 8, y: height * 0.5 },
      { x: width / 2 - btnW / 2 - 8, y: height * 0.5 + btnH + 12 },
      { x: width / 2 + btnW / 2 + 8, y: height * 0.5 + btnH + 12 },
    ];

    q.options.forEach((opt, i) => {
      const container = this.add.container(positions[i].x, positions[i].y);
      const bg = this.add.rectangle(0, 0, btnW, btnH, 0x1a3a5a, 1)
        .setStrokeStyle(2, 0x2a5a7a)
        .setInteractive({ useHandCursor: true });
      const txt = this.add.text(0, 0, String(opt), {
        fontSize: '24px',
        color: '#e0f0ff',
        fontStyle: 'bold',
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

    // Highlight buttons
    this.optionButtons.forEach((c, i) => {
      const bg = c.getAt(0) as Phaser.GameObjects.Rectangle;
      const opt = this.state.questions[this.state.idx].options[i];
      bg.disableInteractive();
      if (opt === correct) bg.setFillStyle(0x2a8a4a);
      if (i === idx && !isCorrect) bg.setFillStyle(0x8a2a2a);
    });

    if (isCorrect) {
      this.state.correct++;
      this.state.streak++;
      this.state.bestStreak = Math.max(this.state.bestStreak, this.state.streak);
      sfxCorrect();
      this.feedbackText.setText(this.state.streak >= 3 ? `\u{1F525} ${this.state.streak} streak!` : 'Correct!');
      this.feedbackText.setColor('#6aee6a');
      if (this.state.streak >= 3) sfxStreak();
    } else {
      this.state.streak = 0;
      this.state.missed.push({ w: this.state.questions[this.state.idx].text, h: `Answer: ${correct}` });
      sfxWrong();
      this.feedbackText.setText(`The answer was ${correct}`);
      this.feedbackText.setColor('#ee6a6a');
    }

    this.updateStreak();

    this.time.delayedCall(isCorrect ? 800 : 1500, () => {
      this.state.idx++;
      this.loadQuestion();
    });
  }

  private updateProgress() {
    const pct = this.state.idx / this.state.questions.length;
    this.progressFill.setSize((this.scale.width - 40) * pct, 8);
  }

  private updateStreak() {
    if (this.state.streak >= 3) {
      this.streakText.setText(`\u{1F525} ${this.state.streak} in a row!`);
    } else {
      this.streakText.setText('');
    }
  }

  private finishGame() {
    const pct = this.state.correct / this.state.questions.length;
    const stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : pct >= 0.3 ? 1 : 0;

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
