import { useState } from 'react';
import { QuizEngine, type QuizQuestion } from '../shared/QuizEngine';
import { LevelSelect } from '../shared/LevelSelect';

function shuffle<T>(arr: T[]): T[] { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

const HOURS = ['twelve','one','two','three','four','five','six','seven','eight','nine','ten','eleven'];
function timeToWords(h: number, m: number): string {
  if (m === 0) return HOURS[h % 12] + " o'clock";
  if (m === 15) return 'quarter past ' + HOURS[h % 12];
  if (m === 30) return 'half past ' + HOURS[h % 12];
  if (m === 45) return 'quarter to ' + HOURS[(h + 1) % 12];
  if (m < 30) return m + ' past ' + HOURS[h % 12];
  return (60 - m) + ' to ' + HOURS[(h + 1) % 12];
}

function genQ(lv: number): QuizQuestion {
  const h = rand(1, 12);
  const m = lv === 1 ? [0, 30][rand(0, 1)] : lv === 2 ? [0, 15, 30, 45][rand(0, 3)] : rand(0, 11) * 5;
  const correct = timeToWords(h, m);
  const wrongs: string[] = [];
  while (wrongs.length < 3) {
    const wh = rand(1, 12); const wm = lv === 1 ? [0,30][rand(0,1)] : lv === 2 ? [0,15,30,45][rand(0,3)] : rand(0,11)*5;
    const w = timeToWords(wh, wm);
    if (w !== correct && !wrongs.includes(w)) wrongs.push(w);
  }
  return { prompt: 'What time does this clock show?', display: `${h}:${m.toString().padStart(2, '0')}`, answer: correct, options: shuffle([correct, ...wrongs]) };
}

function build(level: number): QuizQuestion[] { return Array.from({length: 10}, () => genQ(level)); }

export function TellingTimeQuiz({ onExit }: { onExit: () => void }) {
  const [level, setLevel] = useState<number | null>(null);
  if (!level) return <LevelSelect title="Telling Time" color="#2c3e50" icon="3:00" onSelect={setLevel} onBack={onExit} />;
  return <QuizEngine config={{ gameId: 'telltime', title: 'Telling Time Done!', subtitle: `Level ${level}`, color: '#2c3e50', icon: '3:00', questions: build(level), adaptiveTopic: 'time' }} onExit={onExit} />;
}
