import Phaser from 'phaser';
import { sfxCorrect, sfxWrong, sfxStreak, sfxLevelUp } from '../systems/AudioSystem';

type OnCompleteCallback = (result: {
  correct: number;
  total: number;
  stars: number;
  bestStreak: number;
  missed: Array<{ w: string; h: string }>;
}) => void;

interface BondQuestion {
  target: number;
  given: number;
  answer: number;
  options: number[];
  text: string;
}

interface BondsState {
  questions: BondQuestion[];
  idx: number;
  correct: number;
  streak: number;
  bestStreak: number;
  missed: Array<{ w: string; h: string }>;
  answered: boolean;
  onComplete: OnCompleteCallback | null;
}

function genBondQuestions(level: number): BondQuestion[] {
  const questions: BondQuestion[] = [];
  const targets = level === 1 ? [5, 10] : level === 2 ? [10, 20] : [20, 50, 100];

  for (let i = 0; i < 10; i++) {
    const target = targets[i % targets.length];
    const given = Phaser.Math.Between(1, target - 1);
    const answer = target - given;

    const opts = [answer];
    while (opts.length < 4) {
      const wrong = Phaser.Math.Between(Math.max(1, answer - 5), answer + 5);
      if (wrong > 0 && wrong !== answer && !opts.includes(wrong)) opts.push(wrong);
    }
    Phaser.Utils.Array.Shuffle(opts);

    questions.push({
      target,
      given,
      answer,
      options: opts,
      text: `${given} + ? = ${target}`,
    });
  }

  Phaser.Utils.Array.Shuffle(questions);
  return questions;
}

export class BondsScene extends Phaser.Scene {
  private state!: BondsState;
  private targetText!: Phaser.GameObjects.Text;
  private questionText!: Phaser.GameObjects.Text;
  private feedbackText!: Phaser.GameObjects.Text;
  private streakText!: Phaser.GameObjects.Text;
  private progressFill!: Phaser.GameObjects.Rectangle;
  private optionButtons: Phaser.GameObjects.Container[] = [];
  private bondCircle!: Phaser.GameObjects.Arc;
  private bondFill!: Phaser.GameObjects.Arc;

  constructor() {
    super({ key: 'BondsScene' });
  }

  init(data: { level?: number; onComplete?: OnCompleteCallback }) {
    this.state = {
      questions: genBondQuestions(data.level || 1),
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
    bg.fillGradientStyle(0x0a2020, 0x0a2020, 0x103030, 0x103030, 1);
    bg.fillRect(0, 0, width, height);

    // Bond visualization circle
    this.bondCircle = this.add.circle(width / 2, 100, 50, 0x1a4a4a, 1);
    this.bondCircle.setStrokeStyle(3, 0x11998e);
    this.bondFill = this.add.circle(width / 2, 100, 0, 0x11998e, 0.4);

    this.targetText = this.add.text(width / 2, 100, '', {
      fontSize: '28px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.questionText = this.add.text(width / 2, 185, '', {
      fontSize: '36px', color: '#6aeedd', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.feedbackText = this.add.text(width / 2, 230, '', {
      fontSize: '18px', color: '#6aee6a',
    }).setOrigin(0.5);

    this.streakText = this.add.text(width / 2, 260, '', {
      fontSize: '15px', color: '#ffd93d', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.rectangle(width / 2, height - 16, width - 40, 6, 0x1a3a3a).setOrigin(0.5);
    this.progressFill = this.add.rectangle(20, height - 16, 0, 6, 0x11998e).setOrigin(0, 0.5);

    this.loadQuestion();
  }

  private loadQuestion() {
    if (this.state.idx >= this.state.questions.length) {
      this.finishGame();
      return;
    }
    this.state.answered = false;
    const q = this.state.questions[this.state.idx];
    this.targetText.setText(String(q.target));
    this.questionText.setText(q.text);
    this.feedbackText.setText('');

    // Animate bond circle fill to show given portion
    const fillPct = q.given / q.target;
    this.tweens.add({
      targets: this.bondFill,
      radius: 50 * fillPct,
      duration: 300,
      ease: 'Cubic.easeOut',
    });

    this.progressFill.setSize(
      (this.scale.width - 40) * (this.state.idx / this.state.questions.length), 6
    );
    this.renderOptions(q);
  }

  private renderOptions(q: BondQuestion) {
    const { width, height } = this.scale;
    this.optionButtons.forEach((c) => c.destroy());
    this.optionButtons = [];

    const btnW = Math.min(100, (width - 50) / 2);
    const positions = [
      { x: width / 2 - btnW / 2 - 6, y: height * 0.5 },
      { x: width / 2 + btnW / 2 + 6, y: height * 0.5 },
      { x: width / 2 - btnW / 2 - 6, y: height * 0.5 + 56 },
      { x: width / 2 + btnW / 2 + 6, y: height * 0.5 + 56 },
    ];

    q.options.forEach((opt, i) => {
      const container = this.add.container(positions[i].x, positions[i].y);
      const bg = this.add.rectangle(0, 0, btnW, 48, 0x0e4a4a, 1)
        .setStrokeStyle(2, 0x1a6a6a)
        .setInteractive({ useHandCursor: true });
      const txt = this.add.text(0, 0, String(opt), {
        fontSize: '24px', color: '#b0ffe0', fontStyle: 'bold',
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

      // Fill the bond circle completely
      this.tweens.add({
        targets: this.bondFill,
        radius: 50,
        duration: 300,
        ease: 'Cubic.easeOut',
      });

      sfxCorrect();
      this.feedbackText.setText(this.state.streak >= 3 ? `\u{1F525} ${this.state.streak}!` : '\u2714');
      this.feedbackText.setColor('#6aee6a');
      if (this.state.streak >= 5) sfxLevelUp();
      else if (this.state.streak >= 3) sfxStreak();
    } else {
      this.state.streak = 0;
      const q = this.state.questions[this.state.idx];
      this.state.missed.push({ w: q.text, h: `Answer: ${correct}` });
      sfxWrong();
      this.feedbackText.setText(`${q.given} + ${correct} = ${q.target}`);
      this.feedbackText.setColor('#ee6a6a');
    }

    this.streakText.setText(this.state.streak >= 3 ? `\u{1F525} ${this.state.streak} in a row!` : '');

    this.time.delayedCall(isCorrect ? 600 : 1400, () => {
      this.state.idx++;
      this.loadQuestion();
    });
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
