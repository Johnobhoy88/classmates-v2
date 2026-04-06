import { useState } from 'react';
import { SHAPES_DATA, type ShapesLevel } from '../../game/content/shapes-data';
import { QuizEngine, type QuizQuestion } from '../shared/QuizEngine';
import { LevelSelect } from '../shared/LevelSelect';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a;
}

function buildQuestions(level: ShapesLevel): QuizQuestion[] {
  return shuffle([...SHAPES_DATA[level]]).slice(0, 10).map((entry) => ({
    prompt: entry.q,
    displayHtml: entry.svg || undefined,
    answer: entry.correct,
    options: [...entry.opts],
  }));
}

export function ShapesQuiz({ onExit }: { onExit: () => void }) {
  const [level, setLevel] = useState<ShapesLevel | null>(null);
  if (!level) return <LevelSelect title="Shapes" color="#6c5ce7" icon="\u25B3" onSelect={(lv) => setLevel(lv as ShapesLevel)} onBack={onExit} />;
  return <QuizEngine config={{ gameId: 'shapes', title: 'Shapes Done!', subtitle: `Level ${level}`, color: '#6c5ce7', icon: '\u25B3', questions: buildQuestions(level), adaptiveTopic: 'shapes' }} onExit={onExit} />;
}
