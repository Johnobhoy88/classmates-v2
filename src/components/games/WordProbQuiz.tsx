/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 */

import { useState } from 'react';
import { WORD_PROBLEMS, type WordProbLevel } from '../../game/content/wordprob-data';
import { QuizEngine, type QuizQuestion } from '../shared/QuizEngine';
import { LevelSelect } from '../shared/LevelSelect';

function shuffle<T>(arr: T[]): T[] { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function buildQuestions(level: WordProbLevel): QuizQuestion[] {
  return shuffle([...WORD_PROBLEMS[level]]).slice(0, 10).map((entry) => {
    const answer = String(entry.a);
    const opts = [answer];
    while (opts.length < 4) {
      const w = String(entry.a + rand(-3, 3));
      if (!opts.includes(w) && Number(w) >= 0) opts.push(w);
    }
    return { prompt: entry.q, answer, options: shuffle(opts) };
  });
}

export function WordProbQuiz({ onExit }: { onExit: () => void }) {
  const [level, setLevel] = useState<WordProbLevel | null>(null);
  if (!level) return <LevelSelect title="Word Problems" color="#e17055" icon="?" onSelect={(lv) => setLevel(lv as WordProbLevel)} onBack={onExit} />;
  return <QuizEngine config={{ gameId: 'wordprob', title: 'Word Problems Done!', subtitle: `Level ${level}`, color: '#e17055', icon: '?', questions: buildQuestions(level), adaptiveTopic: 'wordprob' }} onExit={onExit} />;
}
