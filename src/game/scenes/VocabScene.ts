import Phaser from 'phaser';
import { VOCAB } from '../content/vocab-packs';
import { sfxCorrect, sfxWrong, sfxStreak, sfxLevelUp } from '../systems/AudioSystem';

type OnCompleteCallback = (result: {
  correct: number; total: number; stars: number;
  bestStreak: number; missed: Array<{ w: string; h: string }>;
}) => void;

interface VocabState {
  questions: typeof VOCAB[0];
  idx: number;
  correct: number;
  streak: number;
  bestStreak: number;
  missed: Array<{ w: string; h: string }>;
  answered: boolean;
  onComplete: OnCompleteCallback | null;
}

export class VocabScene extends Phaser.Scene {
  private state!: VocabState;
  private defText!: Phaser.GameObjects.Text;
  private feedbackText!: Phaser.GameObjects.Text;
  private streakText!: Phaser.GameObjects.Text;
  private progressFill!: Phaser.GameObjects.Rectangle;
  private optionButtons: Phaser.GameObjects.Container[] = [];

  constructor() { super({ key: 'VocabScene' }); }

  init(data: { level?: number; onComplete?: OnCompleteCallback }) {
    const level = Math.min((data.level || 1) - 1, VOCAB.length - 1);
    const questions = [...VOCAB[level]];
    Phaser.Utils.Array.Shuffle(questions);
    this.state = {
      questions, idx: 0, correct: 0, streak: 0, bestStreak: 0,
      missed: [], answered: false, onComplete: data.onComplete || null,
    };
  }

  create() {
    const { width, height } = this.scale;
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a30, 0x1a1a30, 0x2a2040, 0x2a2040, 1);
    bg.fillRect(0, 0, width, height);

    this.add.text(width / 2, 40, 'What does this mean?', {
      fontSize: '15px', color: '#8899aa',
    }).setOrigin(0.5);

    this.defText = this.add.text(width / 2, 100, '', {
      fontSize: '20px', color: '#c0d0ff', fontStyle: 'bold',
      align: 'center', wordWrap: { width: width - 50 },
    }).setOrigin(0.5);

    this.feedbackText = this.add.text(width / 2, height * 0.35, '', {
      fontSize: '18px', color: '#6aee6a',
    }).setOrigin(0.5);

    this.streakText = this.add.text(width / 2, 155, '', {
      fontSize: '15px', color: '#ffd93d', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.rectangle(width / 2, height - 16, width - 40, 6, 0x1a1a2a).setOrigin(0.5);
    this.progressFill = this.add.rectangle(20, height - 16, 0, 6, 0x6c5ce7).setOrigin(0, 0.5);

    this.loadQuestion();
  }

  private loadQuestion() {
    if (this.state.idx >= this.state.questions.length) { this.finish(); return; }
    this.state.answered = false;
    const q = this.state.questions[this.state.idx];
    this.defText.setText(q.definition);
    this.feedbackText.setText('');
    this.progressFill.setSize(
      (this.scale.width - 40) * (this.state.idx / this.state.questions.length), 6
    );
    this.renderOptions(q);
  }

  private renderOptions(q: typeof VOCAB[0][0]) {
    const { width, height } = this.scale;
    this.optionButtons.forEach(c => c.destroy());
    this.optionButtons = [];
    const btnW = Math.min(width - 40, 280);
    const shuffled = [...q.options];
    Phaser.Utils.Array.Shuffle(shuffled);

    shuffled.forEach((opt, i) => {
      const y = height * 0.43 + i * 52;
      const container = this.add.container(width / 2, y);
      const bg = this.add.rectangle(0, 0, btnW, 42, 0x2a2050, 1)
        .setStrokeStyle(2, 0x4a3a6a)
        .setInteractive({ useHandCursor: true });
      const txt = this.add.text(0, 0, opt, {
        fontSize: '18px', color: '#d0c0ff', fontStyle: 'bold',
      }).setOrigin(0.5);
      container.add([bg, txt]);
      this.optionButtons.push(container);
      bg.on('pointerdown', () => this.select(opt, q.word, i, shuffled));
    });
  }

  private select(chosen: string, correct: string, idx: number, shuffled: string[]) {
    if (this.state.answered) return;
    this.state.answered = true;
    const ok = chosen === correct;

    this.optionButtons.forEach((c, i) => {
      const bg = c.getAt(0) as Phaser.GameObjects.Rectangle;
      bg.disableInteractive();
      if (shuffled[i] === correct) bg.setFillStyle(0x2a8a4a);
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
      const q = this.state.questions[this.state.idx];
      this.state.missed.push({ w: q.word, h: q.definition });
      sfxWrong();
      this.feedbackText.setText(`It was "${correct}"`);
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
