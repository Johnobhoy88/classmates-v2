/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 */

import { useState } from 'react';
import { QuizEngine, type QuizQuestion } from '../shared/QuizEngine';
import { LevelSelect } from '../shared/LevelSelect';

function shuffle<T>(arr: T[]): T[] { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function genQ(lv: number): QuizQuestion {
  const type = rand(0, 2);
  if (lv === 1) {
    const num = rand(11, 99); const tens = Math.floor(num / 10); const ones = num % 10;
    if (type === 0) return { prompt: `What is the tens digit in ${num}?`, display: String(num), answer: String(tens), options: shuffle([tens, ones, tens+1, rand(1,9)].filter((v,i,a) => a.indexOf(v)===i).map(String)).slice(0,4) };
    if (type === 1) { const t = rand(1,9); const o = rand(0,9); return { prompt: `${t} tens and ${o} ones = ?`, answer: String(t*10+o), options: shuffle([t*10+o, t+o, t*10+o+10, Math.max(1,t*10+o-10)].map(String)).slice(0,4) }; }
    const n = rand(11, 89); return { prompt: `What is 10 more than ${n}?`, answer: String(n+10), options: shuffle([n+10, n+1, Math.max(1,n-10), n+20].map(String)).slice(0,4) };
  }
  if (lv === 2) {
    const num = rand(100, 999); const h = Math.floor(num/100); const t = Math.floor((num%100)/10); const o = num%10;
    if (type === 0) return { prompt: `What is the hundreds digit in ${num}?`, display: String(num), answer: String(h), options: shuffle([h, t, o, h+1].filter((v,i,a)=>a.indexOf(v)===i).map(String)).slice(0,4) };
    if (type === 1) { const hv=rand(1,9); const tv=rand(0,9); const ov=rand(0,9); const ans=hv*100+tv*10+ov; return { prompt: `${hv} hundreds, ${tv} tens, ${ov} ones = ?`, answer: String(ans), options: shuffle([ans, ans+100, Math.max(1,ans-10), hv*10+tv+ov].filter(x=>x>0).map(String)).slice(0,4) }; }
    const n = rand(100, 899); return { prompt: `What is 100 more than ${n}?`, answer: String(n+100), options: shuffle([n+100, n+10, n+1, Math.max(1,n-100)].map(String)).slice(0,4) };
  }
  // Level 3
  const num = rand(1000, 9999); const th = Math.floor(num/1000);
  if (type === 0) return { prompt: `What is the value of ${th} in ${num}?`, display: String(num), answer: String(th*1000), options: shuffle([th*1000, th*100, th*10, th].map(String)).slice(0,4) };
  if (type === 1) return { prompt: `What is 1000 more than ${num}?`, answer: String(num+1000), options: shuffle([num+1000, num+100, num+10, Math.max(1,num-1000)].filter(x=>x>0).map(String)).slice(0,4) };
  const n = rand(10,99); const dec = rand(1,9); return { prompt: `What is the value of ${dec} in ${(n + dec/10).toFixed(1)}?`, display: (n + dec/10).toFixed(1), answer: String(dec), options: shuffle([dec, dec*10, n, +(dec/10).toFixed(1)].filter((v,i,a)=>a.indexOf(v)===i).map(String)).slice(0,4) };
}

function build(level: number): QuizQuestion[] { return Array.from({length: 10}, () => genQ(level)); }

export function PlaceValueQuiz({ onExit }: { onExit: () => void }) {
  const [level, setLevel] = useState<number | null>(null);
  if (!level) return <LevelSelect title="Place Value" color="#f46b45" icon="HTO" onSelect={setLevel} onBack={onExit} />;
  return <QuizEngine config={{ gameId: 'placeval', title: 'Place Value Done!', subtitle: `Level ${level}`, color: '#f46b45', icon: 'HTO', questions: build(level), adaptiveTopic: 'placeval' }} onExit={onExit} />;
}
