import { useState } from 'react';
import { QuizEngine, type QuizQuestion } from '../shared/QuizEngine';
import { LevelSelect } from '../shared/LevelSelect';

function shuffle<T>(arr: T[]): T[] { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

// Port of V1 genSeqQ — number sequences with missing term
function genQ(lv: number): QuizQuestion {
  const step = lv === 1 ? rand(1, 3) : lv === 2 ? rand(2, 5) : rand(3, 10);
  const start = lv === 1 ? rand(1, 10) : lv === 2 ? rand(1, 20) : rand(5, 50);
  const seq = Array.from({length: 6}, (_, i) => start + step * i);
  const miss = rand(1, 4);
  const answer = seq[miss];
  const display = seq.map((v, i) => i === miss ? '?' : String(v)).join(', ');
  const opts = [answer];
  while (opts.length < 4) { const w = answer + rand(-2, 2) * step; if (w > 0 && !opts.includes(w)) opts.push(w); }
  return { prompt: 'What is the missing number?', display, answer: String(answer), options: shuffle(opts.map(String)) };
}

function build(level: number): QuizQuestion[] { return Array.from({length: 10}, () => genQ(level)); }

export function SequencesQuiz({ onExit }: { onExit: () => void }) {
  const [level, setLevel] = useState<number | null>(null);
  if (!level) return <LevelSelect title="Sequences" color="#00cec9" icon="1,2,?" onSelect={setLevel} onBack={onExit} />;
  return <QuizEngine config={{ gameId: 'sequence', title: 'Sequences Done!', subtitle: `Level ${level}`, color: '#00cec9', icon: '1,2,?', questions: build(level), adaptiveTopic: 'sequence' }} onExit={onExit} />;
}
