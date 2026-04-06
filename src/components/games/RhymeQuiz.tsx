import { useState } from 'react';
import { RHYME_DATA, type RhymeLevel } from '../../game/content/rhyme-data';
import { QuizEngine, type QuizQuestion } from '../shared/QuizEngine';
import { LevelSelect } from '../shared/LevelSelect';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function buildQuestions(level: RhymeLevel): QuizQuestion[] {
  return shuffle([...RHYME_DATA[level]]).slice(0, 10).map((entry) => {
    const correctRhyme = entry.r[Math.floor(Math.random() * entry.r.length)];
    const distractors = shuffle([...entry.wrong]).slice(0, 3);
    return {
      prompt: `Which word rhymes with "${entry.w}"?`,
      display: entry.w,
      answer: correctRhyme,
      options: [correctRhyme, ...distractors],
    };
  });
}

export function RhymeQuiz({ onExit }: { onExit: () => void }) {
  const [level, setLevel] = useState<RhymeLevel | null>(null);

  if (!level) return <LevelSelect title="Rhyming" color="#6c5ce7" icon="\u266B" onSelect={(lv) => setLevel(lv as RhymeLevel)} onBack={onExit} />;

  return (
    <QuizEngine
      config={{ gameId: 'rhyme', title: 'Rhyming Done!', subtitle: `Level ${level}`, color: '#6c5ce7', icon: '\u266B', questions: buildQuestions(level), adaptiveTopic: 'rhyme' }}
      onExit={onExit}
    />
  );
}
