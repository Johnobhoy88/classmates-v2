/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 */

import { useState, useRef, useEffect } from 'react';
import { SPELLING } from '../../game/content/spelling-data';
import { sfxCorrect, sfxWrong } from '../../game/systems/AudioSystem';
import { recordGameResult } from '../../game/systems/ProgressTracker';
import { useAuth } from '../auth/AuthProvider';
import { LevelSelect } from '../shared/LevelSelect';

function shuffle<T>(arr: T[]): T[] { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function removeVowels(w: string) { return w.split('').map(c => 'aeiou'.includes(c) ? '_' : c).join(''); }

export function VowelsQuiz({ onExit }: { onExit: () => void }) {
  const { pupil } = useAuth();
  const [level, setLevel] = useState<1|2|3|null>(null);
  const [words, setWords] = useState<Array<{w:string;h:string}>>([]);
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState('');
  const [correct, setCorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [missed, setMissed] = useState<Array<{w:string;h:string}>>([]);
  const [feedback, setFeedback] = useState('');
  const [flash, setFlash] = useState<'correct'|'wrong'|null>(null);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (level && words.length === 0) setWords(shuffle([...SPELLING[level]]).slice(0, 10)); }, [level, words.length]);
  useEffect(() => { inputRef.current?.focus(); }, [idx]);

  function check() {
    const val = input.trim().toLowerCase();
    const word = words[idx].w.toLowerCase();
    if (!val) return;
    if (val === word) {
      setCorrect(c => c+1); setStreak(s => s+1); setFlash('correct'); sfxCorrect();
      setFeedback(streak >= 2 ? `Yes! \u{1F525} ${streak+1}!` : 'Correct!');
      setTimeout(advance, 500);
    } else {
      setStreak(0); setFlash('wrong'); sfxWrong();
      setMissed(m => [...m, { w: word, h: words[idx].h }]);
      setFeedback(`It was: ${word}`);
      setTimeout(advance, 1200);
    }
  }

  function advance() { setInput(''); setFlash(null); setFeedback(''); if (idx+1 >= words.length) setDone(true); else setIdx(i => i+1); }

  if (!level) return <LevelSelect title="Missing Vowels" color="#0abde3" icon="_e_" onSelect={(lv) => setLevel(lv as 1|2|3)} onBack={onExit} />;

  if (done) {
    const total = words.length; const pct = correct/total;
    const stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : pct >= 0.3 ? 1 : 0;
    if (pupil) recordGameResult({ pupilId: pupil.id, gameId: 'vowels', score: Math.round(pct*100), stars, streak: 0, bestStreak: streak, correct, total });
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-slate-900 to-cyan-900/30">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full text-center border border-white/20">
          <div className="text-3xl mb-3">{'\u2B50'.repeat(stars)}{'\u2606'.repeat(3-stars)}</div>
          <h2 className="text-xl font-bold text-white mb-2">Missing Vowels Done!</h2>
          <p className="text-cyan-300 text-lg">{correct}/{total} correct</p>
          {missed.length > 0 && <div className="text-left mt-4">{missed.map((m,i) => <div key={i} className="bg-white/5 rounded-lg px-3 py-2 mb-1 border border-white/10 text-sm"><span className="text-white font-bold">{m.w}</span><span className="text-white/40 ml-2">— {m.h}</span></div>)}</div>}
          <div className="flex gap-3 mt-6">
            <button onClick={() => { setLevel(null); setWords([]); setIdx(0); setCorrect(0); setStreak(0); setMissed([]); setDone(false); }} className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-xl">Again</button>
            <button onClick={onExit} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20">Back</button>
          </div>
        </div>
      </div>
    );
  }
  if (words.length === 0) return null;
  const word = words[idx].w.toLowerCase();
  const stripped = removeVowels(word);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-900 to-cyan-900/20">
      <div className="px-4 pt-4 flex items-center justify-between">
        <button onClick={onExit} className="text-white/40 hover:text-white/70 text-sm px-3 py-2 rounded-lg hover:bg-white/5">&larr; Back</button>
        <span className="text-white/30 text-sm">{idx+1}/{words.length}</span>
      </div>
      <div className="px-4 pt-2"><div className="h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-cyan-500 rounded-full transition-all" style={{width:`${(idx/words.length)*100}%`}} /></div></div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 max-w-md mx-auto w-full gap-4">
        <p className="text-white/60 text-sm">Fill in the missing vowels</p>
        <p className="text-4xl font-mono font-bold text-cyan-300 tracking-widest">{stripped}</p>
        <p className="text-white/40 text-sm">{words[idx].h}</p>
        <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && check()}
          className={`w-full px-4 py-4 rounded-2xl text-center text-2xl font-bold bg-white/10 border-2 text-white focus:outline-none ${flash === 'correct' ? 'border-emerald-400' : flash === 'wrong' ? 'border-red-400' : 'border-white/20'}`} autoComplete="off" autoCapitalize="off" />
        <button onClick={check} className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-xl active:scale-95">Check</button>
        {feedback && <p className={`text-sm font-bold ${flash === 'correct' ? 'text-emerald-300' : 'text-red-300'}`}>{feedback}</p>}
      </div>
    </div>
  );
}
