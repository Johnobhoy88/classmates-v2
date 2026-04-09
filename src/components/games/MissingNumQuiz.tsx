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

function genQ(lv: number): QuizQuestion {
  const isSeq = Math.random() < 0.3;
  if (isSeq) {
    const step = lv === 1 ? rand(1,2) : lv === 2 ? rand(2,5) : rand(5,10) * rand(1,3);
    const start = lv === 1 ? rand(1,5) : lv === 2 ? rand(1,10) : rand(1,20);
    const seq = Array.from({length: 5}, (_, i) => start + step * i);
    const miss = rand(1, 3); const ans = seq[miss];
    const display = seq.map((v, i) => i === miss ? '?' : String(v)).join(', ');
    const opts = [ans]; while (opts.length < 4) { const w = ans + rand(-3, 3) * step; if (w > 0 && !opts.includes(w)) opts.push(w); }
    return { prompt: 'What is the missing number?', display, answer: String(ans), options: shuffle(opts.map(String)) };
  }
  let ans: number, display: string;
  if (lv === 1) {
    if (Math.random() < 0.5) { const a = rand(1,9); ans = rand(1, 10-a); display = `${a} + ? = ${a+ans}`; }
    else { const a = rand(3,10); ans = rand(1, a-1); display = `${a} - ? = ${a-ans}`; }
  } else if (lv === 2) {
    const r = Math.random();
    if (r < 0.3) { ans = rand(1,15); const b = rand(1, 20-ans); display = `? + ${b} = ${ans+b}`; }
    else if (r < 0.6) { const a = rand(5,20); ans = rand(1, a); display = `${a} - ? = ${a-ans}`; }
    else { const a = rand(2,5); ans = rand(2,5); display = `${a} \u00D7 ? = ${a*ans}`; }
  } else {
    const r = Math.random();
    if (r < 0.25) { ans = rand(10,80); const b = rand(5, 100-ans); display = `? + ${b} = ${ans+b}`; }
    else if (r < 0.5) { const a = rand(20,100); ans = rand(5, a); display = `${a} - ? = ${a-ans}`; }
    else if (r < 0.75) { const a = rand(2,12); ans = rand(2,12); display = `${a} \u00D7 ? = ${a*ans}`; }
    else { const a = rand(2,12); const b = rand(2,12); ans = b; display = `${a*b} \u00F7 ? = ${a}`; }
  }
  const opts = [ans]; while (opts.length < 4) { const w = Math.max(1, ans + rand(-3, 3)); if (!opts.includes(w)) opts.push(w); }
  return { prompt: 'Find the missing number', display, answer: String(ans), options: shuffle(opts.map(String)) };
}

function build(level: number): QuizQuestion[] { return Array.from({length: 10}, () => genQ(level)); }

export function MissingNumQuiz({ onExit }: { onExit: () => void }) {
  const [level, setLevel] = useState<number | null>(null);
  if (!level) return <LevelSelect title="Missing Number" color="#e17055" icon="?" theme="cosmos" onSelect={setLevel} onBack={onExit} />;
  return <QuizEngine config={{ gameId: 'missnum', title: 'Missing Number Done!', subtitle: `Level ${level}`, color: '#e17055', icon: '?', questions: build(level), adaptiveTopic: 'missnum', theme: 'cosmos' }} onExit={onExit} />;
}
