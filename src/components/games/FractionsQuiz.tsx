import { useState } from 'react';
import { QuizEngine, type QuizQuestion } from '../shared/QuizEngine';
import { LevelSelect } from '../shared/LevelSelect';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a;
}
function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function fracStr(n: number, d: number) { if (n===1&&d===2) return '\u00BD'; if (n===1&&d===4) return '\u00BC'; if (n===3&&d===4) return '\u00BE'; return n+'/'+d; }

function genQ(lv: number): QuizQuestion {
  if (lv === 1) {
    const d = [2,4][rand(0,1)]; const n = rand(1, d-1);
    if (Math.random() < 0.6) {
      const correct = fracStr(n, d);
      const wrongs = [fracStr(d-n, d), fracStr(1, d===2?4:2), fracStr(rand(1,3), 4)].filter(w => w !== correct);
      return { prompt: 'What fraction is shaded?', display: `${n} out of ${d} parts shaded`, answer: correct, options: shuffle([correct, ...wrongs]).slice(0, 4) };
    }
    const num = rand(2, 10) * 2; const ans = num / 2;
    return { prompt: `What is \u00BD of ${num}?`, answer: String(ans), options: shuffle([String(ans), String(num), String(ans+2), String(Math.max(1, ans-1))]).slice(0, 4) };
  } else if (lv === 2) {
    const type = rand(0, 2);
    if (type === 0) {
      const d = [2,3,4,5,8][rand(0,4)]; const n = rand(1, d-1);
      const correct = fracStr(n, d);
      const wrongs: string[] = [];
      for (let i = 0; wrongs.length < 3 && i < 10; i++) { const w = fracStr(rand(1,5), [2,3,4,5,8][rand(0,4)]); if (w !== correct && !wrongs.includes(w)) wrongs.push(w); }
      return { prompt: 'What fraction is shaded?', display: `${n} out of ${d} parts`, answer: correct, options: shuffle([correct, ...wrongs]).slice(0, 4) };
    } else if (type === 1) {
      const an = rand(1,3); const bn = rand(1,3); const b = bn === an ? (an < 3 ? an+1 : an-1) : bn;
      const bigger = an > b ? fracStr(an,4) : fracStr(b,4);
      return { prompt: `Which is bigger: ${fracStr(an,4)} or ${fracStr(b,4)}?`, answer: bigger, options: shuffle([fracStr(an,4), fracStr(b,4)]) };
    }
    const num = rand(2,8)*5; const ans = num/5;
    return { prompt: `What is 1/5 of ${num}?`, answer: String(ans), options: shuffle([String(ans), String(num), String(ans*2), String(ans+3)]).slice(0, 4) };
  }
  // Level 3
  const type = rand(0, 2);
  if (type === 0) return { prompt: '1/2 = ?/4', display: 'Equivalent fractions', answer: '2/4', options: shuffle(['2/4','1/4','3/4','4/4']) };
  if (type === 1) { const num = rand(3,20)*4; const ans = num/4; return { prompt: `What is \u00BC of ${num}?`, answer: String(ans), options: shuffle([String(ans), String(num/2), String(ans+2), String(Math.max(1,ans-1))]).slice(0, 4) }; }
  const pairs = [{f:'1/2',d:'0.5'},{f:'1/4',d:'0.25'},{f:'3/4',d:'0.75'},{f:'1/10',d:'0.1'}];
  const p = pairs[rand(0,3)]; return { prompt: `What is ${p.f} as a decimal?`, answer: p.d, options: shuffle(pairs.map(x => x.d)).slice(0, 4) };
}

function buildQuestions(level: number): QuizQuestion[] { return Array.from({length: 10}, () => genQ(level)); }

export function FractionsQuiz({ onExit }: { onExit: () => void }) {
  const [level, setLevel] = useState<number | null>(null);
  if (!level) return <LevelSelect title="Fractions" color="#c0392b" icon="\u00BD" onSelect={setLevel} onBack={onExit} />;
  return <QuizEngine config={{ gameId: 'fractions', title: 'Fractions Done!', subtitle: `Level ${level}`, color: '#c0392b', icon: '\u00BD', questions: buildQuestions(level), adaptiveTopic: 'fractions' }} onExit={onExit} />;
}
