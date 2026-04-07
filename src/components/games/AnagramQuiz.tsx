/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 */

import { useState, useCallback } from 'react';
import { SPELLING } from '../../game/content/spelling-data';
import { sfxCorrect, sfxWrong, sfxClick } from '../../game/systems/AudioSystem';
import { recordGameResult } from '../../game/systems/ProgressTracker';
import { useAuth } from '../auth/AuthProvider';
import { LevelSelect } from '../shared/LevelSelect';

// Faithful port of V1 anagram: scrambled letters, tap to build word

function shuffle<T>(arr: T[]): T[] { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

export function AnagramQuiz({ onExit }: { onExit: () => void }) {
  const { pupil } = useAuth();
  const [level, setLevel] = useState<1|2|3|null>(null);
  const [words, setWords] = useState<Array<{w:string;h:string}>>([]);
  const [idx, setIdx] = useState(0);
  const [pool, setPool] = useState<string[]>([]);
  const [ans, setAns] = useState<string[]>([]);
  const [correct, setCorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [missed, setMissed] = useState<Array<{w:string;h:string}>>([]);
  const [feedback, setFeedback] = useState('');
  const [flash, setFlash] = useState<'correct'|'wrong'|null>(null);
  const [done, setDone] = useState(false);
  const [locked, setLocked] = useState(false);

  const startGame = useCallback((lv: 1|2|3) => {
    setLevel(lv);
    const ws = shuffle([...SPELLING[lv]]).slice(0, 10);
    setWords(ws);
    const letters = ws[0].w.toLowerCase().split('');
    setPool(shuffle([...letters]));
    setAns([]);
  }, []);

  function tapPool(i: number) {
    if (locked) return;
    sfxClick();
    const newPool = [...pool]; const ch = newPool.splice(i, 1)[0];
    const newAns = [...ans, ch];
    setPool(newPool); setAns(newAns);
    if (newAns.length === words[idx].w.length) checkAnswer(newAns);
  }

  function tapAns(i: number) {
    if (locked) return;
    sfxClick();
    const newAns = [...ans]; const ch = newAns.splice(i, 1)[0];
    setAns(newAns); setPool([...pool, ch]);
  }

  function checkAnswer(attempt: string[]) {
    const word = words[idx].w.toLowerCase();
    const ok = attempt.join('') === word;
    setLocked(true); setFlash(ok ? 'correct' : 'wrong');
    if (ok) {
      setCorrect(c => c+1); setStreak(s => s+1); sfxCorrect();
      setFeedback(streak >= 2 ? `Yes! \u{1F525} ${streak+1}!` : 'Correct!');
      setTimeout(advance, 600);
    } else {
      setStreak(0); sfxWrong();
      setMissed(m => [...m, { w: word, h: words[idx].h }]);
      setFeedback(`It was: ${word}`);
      setTimeout(advance, 1500);
    }
  }

  function advance() {
    setLocked(false); setFlash(null); setFeedback('');
    if (idx + 1 >= words.length) { setDone(true); return; }
    const next = idx + 1;
    setIdx(next);
    const letters = words[next].w.toLowerCase().split('');
    setPool(shuffle([...letters])); setAns([]);
  }

  if (!level) return <LevelSelect title="Anagrams" color="#c44569" icon="ABC" onSelect={(lv) => startGame(lv as 1|2|3)} onBack={onExit} />;

  if (done) {
    const total = words.length; const pct = correct / total;
    const stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : pct >= 0.3 ? 1 : 0;
    if (pupil) recordGameResult({ pupilId: pupil.id, gameId: 'anagram', score: Math.round(pct*100), stars, streak: 0, bestStreak: streak, correct, total });
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-slate-900 to-pink-900/30">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full text-center border border-white/20">
          <div className="text-3xl mb-3">{'\u2B50'.repeat(stars)}{'\u2606'.repeat(3-stars)}</div>
          <h2 className="text-xl font-bold text-white mb-2">Anagrams Done!</h2>
          <p className="text-pink-300 text-lg">{correct}/{total} correct</p>
          {missed.length > 0 && <div className="text-left mt-4">{missed.map((m,i) => <div key={i} className="bg-white/5 rounded-lg px-3 py-2 mb-1 border border-white/10 text-sm"><span className="text-white font-bold">{m.w}</span><span className="text-white/40 ml-2">— {m.h}</span></div>)}</div>}
          <div className="flex gap-3 mt-6">
            <button onClick={() => { setLevel(null); setWords([]); setIdx(0); setCorrect(0); setStreak(0); setMissed([]); setDone(false); }} className="flex-1 py-3 bg-pink-500 hover:bg-pink-400 text-white font-bold rounded-xl">Again</button>
            <button onClick={onExit} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20">Back</button>
          </div>
        </div>
      </div>
    );
  }

  if (words.length === 0) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-900 to-pink-900/20">
      <div className="px-4 pt-4 flex items-center justify-between">
        <button onClick={onExit} className="text-white/40 hover:text-white/70 text-sm px-3 py-2 rounded-lg hover:bg-white/5">&larr; Back</button>
        <span className="text-white/30 text-sm">{idx+1}/{words.length}</span>
      </div>
      <div className="px-4 pt-2"><div className="h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-pink-500 rounded-full transition-all" style={{width:`${(idx/words.length)*100}%`}} /></div></div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 max-w-md mx-auto w-full gap-6">
        <p className="text-white/60 text-sm">Unscramble the letters</p>
        <p className="text-white/50 text-sm">{words[idx].h}</p>

        {/* Answer slots */}
        <div className="flex gap-2 justify-center flex-wrap">
          {ans.map((ch, i) => (
            <button key={`a${i}`} onClick={() => tapAns(i)}
              className={`w-12 h-12 rounded-xl font-bold text-xl transition-all active:scale-90 ${flash === 'correct' ? 'bg-emerald-500/40 border-emerald-400 text-emerald-200' : flash === 'wrong' ? 'bg-red-500/40 border-red-400 text-red-200' : 'bg-pink-500/30 border-pink-400/50 text-white'} border-2`}>
              {ch}
            </button>
          ))}
          {Array.from({length: words[idx].w.length - ans.length}).map((_, i) => (
            <div key={`e${i}`} className="w-12 h-12 rounded-xl border-2 border-dashed border-white/20" />
          ))}
        </div>

        {/* Letter pool */}
        <div className="flex gap-2 justify-center flex-wrap">
          {pool.map((ch, i) => (
            <button key={`p${i}`} onClick={() => tapPool(i)}
              className="w-12 h-12 rounded-xl bg-white/10 border-2 border-white/20 text-white font-bold text-xl hover:bg-white/15 hover:border-white/30 active:scale-90 transition-all">
              {ch}
            </button>
          ))}
        </div>

        {feedback && <p className={`text-sm font-bold ${flash === 'correct' ? 'text-emerald-300' : 'text-red-300'}`}>{feedback}</p>}
      </div>
    </div>
  );
}
