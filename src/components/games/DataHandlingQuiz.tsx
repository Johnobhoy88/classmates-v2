import { useState } from 'react';
import { QuizEngine, type QuizQuestion } from '../shared/QuizEngine';
import { LevelSelect } from '../shared/LevelSelect';

function shuffle<T>(arr: T[]): T[] { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

// Port of V1 genDataQ — procedural bar chart questions
function genQ(lv: number): QuizQuestion {
  const items = lv === 1 ? ['Apples','Bananas','Oranges'] : lv === 2 ? ['Mon','Tue','Wed','Thu','Fri'] : ['Ali','Beth','Callum','Isla','Finn'];
  const counts = items.map(() => rand(lv === 1 ? 1 : lv === 2 ? 2 : 5, lv === 1 ? 6 : lv === 2 ? 15 : 30));
  const total = counts.reduce((s, c) => s + c, 0);
  const maxIdx = counts.indexOf(Math.max(...counts));

  // Simple bar chart text representation
  const chart = items.map((item, i) => `${item}: ${'█'.repeat(Math.ceil(counts[i] / (lv === 1 ? 1 : lv === 2 ? 2 : 4)))} (${counts[i]})`).join('\n');

  const type = rand(0, 2);
  if (type === 0) {
    const idx = rand(0, items.length - 1);
    return { prompt: `How many for ${items[idx]}?`, display: chart, answer: String(counts[idx]),
      options: shuffle([String(counts[idx]), String(counts[idx] + rand(1,3)), String(Math.max(0, counts[idx] - rand(1,3))), String(counts[(idx+1) % items.length])]) };
  }
  if (type === 1) {
    return { prompt: 'Which has the most?', display: chart, answer: items[maxIdx],
      options: shuffle([...items]).slice(0, 4) };
  }
  return { prompt: 'What is the total?', display: chart, answer: String(total),
    options: shuffle([String(total), String(total + rand(1,5)), String(Math.max(0, total - rand(1,5))), String(total + rand(6,10))]) };
}

function build(level: number): QuizQuestion[] { return Array.from({length: 10}, () => genQ(level)); }

export function DataHandlingQuiz({ onExit }: { onExit: () => void }) {
  const [level, setLevel] = useState<number | null>(null);
  if (!level) return <LevelSelect title="Data Handling" color="#00b894" icon="\u{1F4CA}" onSelect={setLevel} onBack={onExit} />;
  return <QuizEngine config={{ gameId: 'datahandling', title: 'Data Handling Done!', subtitle: `Level ${level}`, color: '#00b894', icon: '\u{1F4CA}', questions: build(level) }} onExit={onExit} />;
}
