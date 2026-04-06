import { useState } from 'react';
import { PHONICS_DATA, type PhonicsLevel } from '../../game/content/phonics-data';
import { QuizEngine, type QuizQuestion } from '../shared/QuizEngine';
import { LevelSelect } from '../shared/LevelSelect';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function buildQuestions(level: PhonicsLevel): QuizQuestion[] {
  const entries = shuffle([...PHONICS_DATA[level]]);
  return entries.slice(0, 10).map((entry) => {
    const correctWord = entry.words[0];
    const distractors = shuffle([...entry.wrong]).slice(0, 3);
    return {
      prompt: `Which word has the "${entry.sound}" sound?`,
      display: `"${entry.sound}"`,
      answer: correctWord,
      options: [correctWord, ...distractors],
    };
  });
}

export function PhonicsQuiz({ onExit }: { onExit: () => void }) {
  const [level, setLevel] = useState<PhonicsLevel | null>(null);

  if (!level) return <LevelSelect title="Phonics" color="#0abde3" icon="ai" onSelect={(lv) => setLevel(lv as PhonicsLevel)} onBack={onExit} />;

  return (
    <QuizEngine
      config={{ gameId: 'phonics', title: 'Phonics Done!', subtitle: `Level ${level}`, color: '#0abde3', icon: 'ai', questions: buildQuestions(level), adaptiveTopic: 'phonics' }}
      onExit={onExit}
    />
  );
}
