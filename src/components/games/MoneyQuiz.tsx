/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 */

import { useState } from 'react';
import { QuizEngine, type QuizQuestion } from '../shared/QuizEngine';
import { LevelSelect } from '../shared/LevelSelect';
import { shuffle } from '../../utils/shuffle';
function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function formatMoney(p: number) { return p >= 100 ? '\u00A3' + (p/100).toFixed(2) : p + 'p'; }

function genQ(lv: number): QuizQuestion {
  const type = rand(0, 1);
  if (type === 0) {
    // Count coins
    const available = lv === 1 ? [1,1,2,2,5,5,10] : lv === 2 ? [1,2,5,10,10,20,20,50] : [10,20,20,50,50,100,100,200];
    const pool = shuffle([...available]);
    const picked: number[] = []; let sum = 0;
    for (const c of pool) { if (picked.length < 5) { picked.push(c); sum += c; } }
    const correct = formatMoney(sum);
    const wrongs: string[] = [];
    while (wrongs.length < 3) { const w = formatMoney(sum + rand(-10, 10) * (lv === 3 ? 10 : 1)); if (w !== correct && !wrongs.includes(w) && !w.startsWith('-')) wrongs.push(w); }
    const coinStr = picked.map(c => c >= 100 ? `\u00A3${c/100}` : `${c}p`).join(' + ');
    return { prompt: 'How much money is this?', display: coinStr, answer: correct, options: shuffle([correct, ...wrongs]) };
  }
  // Change
  const from = lv === 1 ? 20 : lv === 2 ? 100 : rand(2,5) * 100;
  const spent = rand(Math.floor(from * 0.2), Math.floor(from * 0.7));
  const change = from - spent;
  const correct = formatMoney(change);
  const wrongs: string[] = [];
  while (wrongs.length < 3) { const w = formatMoney(Math.max(1, change + rand(-15, 15) * (lv === 3 ? 5 : 1))); if (w !== correct && !wrongs.includes(w)) wrongs.push(w); }
  return { prompt: `You spend ${formatMoney(spent)}. Change from ${formatMoney(from)}?`, answer: correct, options: shuffle([correct, ...wrongs]) };
}

function build(level: number): QuizQuestion[] { return Array.from({length: 10}, () => genQ(level)); }

export function MoneyQuiz({ onExit }: { onExit: () => void }) {
  const [level, setLevel] = useState<number | null>(null);
  if (!level) return <LevelSelect title="Money" color="#1a5276" icon="\u00A3p" onSelect={setLevel} onBack={onExit} />;
  return <QuizEngine config={{ gameId: 'money', title: 'Money Done!', subtitle: `Level ${level}`, color: '#1a5276', icon: '\u00A3p', questions: build(level), adaptiveTopic: 'money' }} onExit={onExit} />;
}
