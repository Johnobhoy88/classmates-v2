import { useState } from 'react';
import { WORD_PROBLEMS, type WordProbLevel } from '../../game/content/wordprob-data';
import { QuizEngine, type QuizQuestion } from '../shared/QuizEngine';
import { LevelSelect } from '../shared/LevelSelect';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a;
}

function buildQuestions(level: WordProbLevel): QuizQuestion[] {
  return shuffle([...WORD_PROBLEMS[level]]).slice(0, 10).map((entry) => ({
    prompt: entry.q,
    answer: entry.correct,
    options: [...entry.opts],
  }));
}

export function WordProbQuiz({ onExit }: { onExit: () => void }) {
  const [level, setLevel] = useState<WordProbLevel | null>(null);
  if (!level) return <LevelSelect title="Word Problems" color="#e17055" icon="?" onSelect={(lv) => setLevel(lv as WordProbLevel)} onBack={onExit} />;
  return <QuizEngine config={{ gameId: 'wordprob', title: 'Word Problems Done!', subtitle: `Level ${level}`, color: '#e17055', icon: '?', questions: buildQuestions(level), adaptiveTopic: 'wordprob' }} onExit={onExit} />;
}
