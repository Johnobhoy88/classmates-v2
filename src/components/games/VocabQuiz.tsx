import { useState } from 'react';
import { VOCAB_DATA, type VocabLevel } from '../../game/content/vocab-data';
import { QuizEngine, type QuizQuestion } from '../shared/QuizEngine';
import { LevelSelect } from '../shared/LevelSelect';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function buildQuestions(level: VocabLevel): QuizQuestion[] {
  return shuffle([...VOCAB_DATA[level]]).slice(0, 10).map((entry) => ({
    prompt: entry.d,
    answer: entry.w,
    options: [entry.w, ...entry.wrong.slice(0, 3)],
  }));
}

export function VocabQuiz({ onExit }: { onExit: () => void }) {
  const [level, setLevel] = useState<VocabLevel | null>(null);

  if (!level) return <LevelSelect title="Vocabulary" color="#6c5ce7" icon="A-Z" onSelect={(lv) => setLevel(lv as VocabLevel)} onBack={onExit} />;

  return (
    <QuizEngine
      config={{ gameId: 'vocab', title: 'Vocabulary Done!', subtitle: `Level ${level}`, color: '#6c5ce7', icon: 'A-Z', questions: buildQuestions(level), adaptiveTopic: 'vocab' }}
      onExit={onExit}
    />
  );
}
