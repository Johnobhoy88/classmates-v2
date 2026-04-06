import { useState } from 'react';
import { GRAMMAR_DATA, type GrammarLevel } from '../../game/content/grammar-data';
import { QuizEngine, type QuizQuestion } from '../shared/QuizEngine';
import { LevelSelect } from '../shared/LevelSelect';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function buildQuestions(level: GrammarLevel): QuizQuestion[] {
  return shuffle([...GRAMMAR_DATA[level]]).slice(0, 10).map((entry) => ({
    prompt: `What type of word is "${entry.w}"?`,
    display: entry.w,
    answer: entry.a,
    options: [...entry.opts],
  }));
}

export function GrammarQuiz({ onExit }: { onExit: () => void }) {
  const [level, setLevel] = useState<GrammarLevel | null>(null);

  if (!level) return <LevelSelect title="Grammar" color="#636e72" icon="N V" onSelect={(lv) => setLevel(lv as GrammarLevel)} onBack={onExit} />;

  return (
    <QuizEngine
      config={{ gameId: 'grammar', title: 'Grammar Done!', subtitle: `Level ${level}`, color: '#636e72', icon: 'N V', questions: buildQuestions(level), adaptiveTopic: 'grammar' }}
      onExit={onExit}
    />
  );
}
