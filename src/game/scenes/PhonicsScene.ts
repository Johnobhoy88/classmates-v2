import Phaser from 'phaser';
import { PHONICS } from '../content/phonics-packs';
import { sfxCorrect, sfxWrong, sfxStreak, sfxLevelUp } from '../systems/AudioSystem';

type OnCompleteCallback = (result: {
  correct: number;
  total: number;
  stars: number;
  bestStreak: number;
  missed: Array<{ w: string; h: string }>;
}) => void;

interface PhonicsQuestion {
  sound: string;
  correctWord: string;
  options: string[];
}

interface PhonicsState {
  questions: PhonicsQuestion[];
  idx: number;
  correct: number;
  streak: number;
  bestStreak: number;
  missed: Array<{ w: string; h: string }>;
  answered: boolean;
  onComplete: OnCompleteCallback | null;
}

function buildQuestions(level: number): PhonicsQuestion[] {
  const pack = PHONICS[Math.min(level - 1, PHONICS.length - 1)] || PHONICS[0];
  const entries = [...pack];
  Phaser.Utils.Array.Shuffle(entries);
  const selected = entries.slice(0, 10);

  return selected.map((entry) => {
    const correctWord = entry.words[0];
    const distractors = [...entry.wrong];
    Phaser.Utils.Array.Shuffle(distractors);
    const options = [correctWord, ...distractors.slice(0, 3)];
    Phaser.Utils.Array.Shuffle(options);
    return { sound: entry.sound, correctWord, options };
  });
}

export class PhonicsScene extends Phaser.Scene {
  private state!: PhonicsState;
  private soundText!: Phaser.GameObjects.Text;
  private promptText!: Phaser.GameObjects.Text;
  private feedbackText!: Phaser.GameObjects.Text;
  private streakText!: Phaser.GameObjects.Text;
  private progressFill!: Phaser.GameObjects.Rectangle;
  private optionButtons: Phaser.GameObjects.Container[] = [];

  constructor() {
    super({ key: 'PhonicsScene' });
  }

  init(data: { level?: number; onComplete?: OnCompleteCallback }) {
    this.state = {
      questions: buildQuestions(data.level || 1),
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

    // Warm gradient background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a2040, 0x1a2040, 0x2a3060, 0x2a3060, 1);
    bg.fillRect(0, 0, width, height);

    this.promptText = this.add.text(width / 2, 50, 'Which word has this sound?', {
      fontSize: '16px', color: '#aabbcc',
    }).setOrigin(0.5);

    this.soundText = this.add.text(width / 2, 120, '', {
      fontSize: '56px', color: '#6ab8ee', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.feedbackText = this.add.text(width / 2, height * 0.38, '', {
      fontSize: '18px', color: '#6aee6a',
    }).setOrigin(0.5);

    this.streakText = this.add.text(width / 2, 175, '', {
      fontSize: '15px', color: '#ffd93d', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.rectangle(width / 2, height - 16, width - 40, 6, 0x1a2a3a).setOrigin(0.5);
    this.progressFill = this.add.rectangle(20, height - 16, 0, 6, 0x6ab8ee).setOrigin(0, 0.5);

    this.loadQuestion();
  }

  private loadQuestion() {
    if (this.state.idx >= this.state.questions.length) {
      this.finishGame();
      return;
    }
    this.state.answered = false;
    const q = this.state.questions[this.state.idx];
    this.soundText.setText(`"${q.sound}"`);
    this.feedbackText.setText('');
    this.progressFill.setSize(
      (this.scale.width - 40) * (this.state.idx / this.state.questions.length), 6
    );
    this.renderOptions(q);
  }

  private renderOptions(q: PhonicsQuestion) {
    const { width, height } = this.scale;
    this.optionButtons.forEach((c) => c.destroy());
    this.optionButtons = [];

    const btnW = Math.min(width - 40, 300);
    const startY = height * 0.45;

    q.options.forEach((opt, i) => {
      const y = startY + i * 54;
      const container = this.add.container(width / 2, y);
      const bg = this.add.rectangle(0, 0, btnW, 44, 0x1a3a5a, 1)
        .setStrokeStyle(2, 0x2a5a7a)
        .setInteractive({ useHandCursor: true });
      const txt = this.add.text(0, 0, opt, {
        fontSize: '20px', color: '#e0f0ff', fontStyle: 'bold',
      }).setOrigin(0.5);

      container.add([bg, txt]);
      this.optionButtons.push(container);
      bg.on('pointerdown', () => this.selectAnswer(opt, q.correctWord, i));
    });
  }

  private selectAnswer(chosen: string, correct: string, idx: number) {
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
      this.feedbackText.setText(this.state.streak >= 3 ? `\u{1F525} ${this.state.streak}!` : 'Correct!');
      this.feedbackText.setColor('#6aee6a');
      if (this.state.streak >= 5) sfxLevelUp();
      else if (this.state.streak >= 3) sfxStreak();
    } else {
      this.state.streak = 0;
      this.state.missed.push({ w: q.correctWord, h: `Has the "${q.sound}" sound` });
      sfxWrong();
      this.feedbackText.setText(`"${correct}" has the "${q.sound}" sound`);
      this.feedbackText.setColor('#ee6a6a');
    }

    this.streakText.setText(this.state.streak >= 3 ? `\u{1F525} ${this.state.streak} in a row!` : '');

    this.time.delayedCall(isCorrect ? 700 : 1500, () => {
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
