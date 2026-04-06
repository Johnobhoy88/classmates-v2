import Phaser from 'phaser';
import { sfxCorrect, sfxWrong, sfxStreak, sfxLevelUp } from '../systems/AudioSystem';

type OnCompleteCallback = (result: {
  correct: number; total: number; stars: number;
  bestStreak: number; missed: Array<{ w: string; h: string }>;
}) => void;

interface FracQuestion {
  text: string;
  answer: string;
  options: string[];
  visual: { parts: number; filled: number };
}

interface FracState {
  questions: FracQuestion[];
  idx: number;
  correct: number;
  streak: number;
  bestStreak: number;
  missed: Array<{ w: string; h: string }>;
  answered: boolean;
  onComplete: OnCompleteCallback | null;
}

function genFracQuestions(level: number): FracQuestion[] {
  const questions: FracQuestion[] = [];

  if (level === 1) {
    // Simple halves and quarters
    const fracs: [number, number][] = [[1,2],[1,4],[2,4],[3,4],[1,3],[2,3]];
    for (const [n, d] of fracs) {
      const answer = `${n}/${d}`;
      const opts = [answer];
      // Distractors
      const disPool = fracs.filter(([a,b]) => !(a === n && b === d)).map(([a,b]) => `${a}/${b}`);
      Phaser.Utils.Array.Shuffle(disPool);
      for (const o of disPool) { if (opts.length < 4 && !opts.includes(o)) opts.push(o); }
      Phaser.Utils.Array.Shuffle(opts);
      questions.push({
        text: `What fraction is shaded?`,
        answer,
        options: opts,
        visual: { parts: d, filled: n },
      });
    }
  } else if (level === 2) {
    // Equivalent fractions and simple operations
    const pairs: [string, string, string[]][] = [
      ['1/2 = ?/4', '2/4', ['1/4','2/4','3/4','4/4']],
      ['1/3 = ?/6', '2/6', ['1/6','2/6','3/6','4/6']],
      ['2/4 = ?/2', '1/2', ['1/2','1/4','2/2','3/4']],
      ['1/4 + 1/4 = ?', '2/4', ['1/4','2/4','3/4','1/2']],
      ['1/2 + 1/4 = ?', '3/4', ['2/4','3/4','1/2','4/4']],
      ['3/4 - 1/4 = ?', '2/4', ['1/4','2/4','3/4','1/2']],
      ['1/3 + 1/3 = ?', '2/3', ['1/3','2/3','3/3','1/6']],
      ['2/5 + 1/5 = ?', '3/5', ['2/5','3/5','4/5','1/5']],
    ];
    for (const [text, answer, opts] of pairs) {
      Phaser.Utils.Array.Shuffle(opts);
      questions.push({ text, answer, options: opts, visual: { parts: 4, filled: 2 } });
    }
  } else {
    // Harder fractions
    const hard: [string, string, string[]][] = [
      ['3/8 + 2/8 = ?', '5/8', ['4/8','5/8','6/8','3/8']],
      ['7/10 - 3/10 = ?', '4/10', ['3/10','4/10','5/10','7/10']],
      ['What is 1/4 of 20?', '5', ['4','5','10','8']],
      ['What is 1/3 of 15?', '5', ['3','5','10','15']],
      ['What is 3/4 of 12?', '9', ['6','8','9','12']],
      ['Which is bigger: 3/5 or 1/2?', '3/5', ['1/2','3/5','equal','2/5']],
      ['Simplify 4/8', '1/2', ['1/2','2/4','1/4','3/4']],
      ['Simplify 6/9', '2/3', ['1/3','2/3','3/3','6/9']],
    ];
    for (const [text, answer, opts] of hard) {
      Phaser.Utils.Array.Shuffle(opts);
      questions.push({ text, answer, options: opts, visual: { parts: 8, filled: 5 } });
    }
  }

  Phaser.Utils.Array.Shuffle(questions);
  return questions.slice(0, 10);
}

export class FractionsScene extends Phaser.Scene {
  private state!: FracState;
  private questionText!: Phaser.GameObjects.Text;
  private feedbackText!: Phaser.GameObjects.Text;
  private streakText!: Phaser.GameObjects.Text;
  private progressFill!: Phaser.GameObjects.Rectangle;
  private optionButtons: Phaser.GameObjects.Container[] = [];
  private pieGroup!: Phaser.GameObjects.Container;

  constructor() { super({ key: 'FractionsScene' }); }

  init(data: { level?: number; onComplete?: OnCompleteCallback }) {
    this.state = {
      questions: genFracQuestions(data.level || 1),
      idx: 0, correct: 0, streak: 0, bestStreak: 0,
      missed: [], answered: false, onComplete: data.onComplete || null,
    };
  }

  create() {
    const { width, height } = this.scale;
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1020, 0x1a1020, 0x2a1a38, 0x2a1a38, 1);
    bg.fillRect(0, 0, width, height);

    this.pieGroup = this.add.container(width / 2, 90);

    this.questionText = this.add.text(width / 2, 170, '', {
      fontSize: '28px', color: '#fd79a8', fontStyle: 'bold',
      align: 'center', wordWrap: { width: width - 40 },
    }).setOrigin(0.5);

    this.feedbackText = this.add.text(width / 2, 215, '', {
      fontSize: '18px', color: '#6aee6a',
    }).setOrigin(0.5);

    this.streakText = this.add.text(width / 2, 245, '', {
      fontSize: '15px', color: '#ffd93d', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.rectangle(width / 2, height - 16, width - 40, 6, 0x1a1a2a).setOrigin(0.5);
    this.progressFill = this.add.rectangle(20, height - 16, 0, 6, 0xfd79a8).setOrigin(0, 0.5);

    this.loadQuestion();
  }

  private drawPie(parts: number, filled: number) {
    this.pieGroup.removeAll(true);
    const r = 50;
    const g = this.add.graphics();

    for (let i = 0; i < parts; i++) {
      const startAngle = (i / parts) * Math.PI * 2 - Math.PI / 2;
      const endAngle = ((i + 1) / parts) * Math.PI * 2 - Math.PI / 2;
      const isFilled = i < filled;

      g.fillStyle(isFilled ? 0xfd79a8 : 0x2a1a38, isFilled ? 0.8 : 0.3);
      g.beginPath();
      g.moveTo(0, 0);
      g.arc(0, 0, r, startAngle, endAngle, false);
      g.closePath();
      g.fillPath();

      // Slice borders
      g.lineStyle(2, 0x4a3a5a, 0.8);
      g.beginPath();
      g.moveTo(0, 0);
      g.lineTo(Math.cos(startAngle) * r, Math.sin(startAngle) * r);
      g.strokePath();
    }
    // Outer circle
    g.lineStyle(2, 0x6a5a7a, 1);
    g.strokeCircle(0, 0, r);

    this.pieGroup.add(g);
  }

  private loadQuestion() {
    if (this.state.idx >= this.state.questions.length) { this.finish(); return; }
    this.state.answered = false;
    const q = this.state.questions[this.state.idx];
    this.questionText.setText(q.text);
    this.feedbackText.setText('');
    this.drawPie(q.visual.parts, q.visual.filled);
    this.progressFill.setSize(
      (this.scale.width - 40) * (this.state.idx / this.state.questions.length), 6
    );
    this.renderOptions(q);
  }

  private renderOptions(q: FracQuestion) {
    const { width, height } = this.scale;
    this.optionButtons.forEach(c => c.destroy());
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
      const bg = this.add.rectangle(0, 0, btnW, 48, 0x3a1a38, 1)
        .setStrokeStyle(2, 0x5a3a58)
        .setInteractive({ useHandCursor: true });
      const txt = this.add.text(0, 0, opt, {
        fontSize: '22px', color: '#f0d0ee', fontStyle: 'bold',
      }).setOrigin(0.5);
      container.add([bg, txt]);
      this.optionButtons.push(container);
      bg.on('pointerdown', () => this.select(opt, q.answer, i));
    });
  }

  private select(chosen: string, correct: string, idx: number) {
    if (this.state.answered) return;
    this.state.answered = true;
    const ok = chosen === correct;

    this.optionButtons.forEach((c, i) => {
      const bg = c.getAt(0) as Phaser.GameObjects.Rectangle;
      bg.disableInteractive();
      if (this.state.questions[this.state.idx].options[i] === correct) bg.setFillStyle(0x2a8a4a);
      if (i === idx && !ok) bg.setFillStyle(0x8a2a2a);
    });

    if (ok) {
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
      this.state.missed.push({ w: this.state.questions[this.state.idx].text, h: `Answer: ${correct}` });
      sfxWrong();
      this.feedbackText.setText(`Answer: ${correct}`);
      this.feedbackText.setColor('#ee6a6a');
    }
    this.streakText.setText(this.state.streak >= 3 ? `\u{1F525} ${this.state.streak} in a row!` : '');

    this.time.delayedCall(ok ? 700 : 1400, () => { this.state.idx++; this.loadQuestion(); });
  }

  private finish() {
    const pct = this.state.correct / this.state.questions.length;
    const stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : pct >= 0.3 ? 1 : 0;
    if (stars >= 3) sfxLevelUp();
    this.state.onComplete?.({
      correct: this.state.correct, total: this.state.questions.length,
      stars, bestStreak: this.state.bestStreak, missed: this.state.missed,
    });
  }
}
