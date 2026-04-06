import { useState, useRef, useEffect } from 'react';
import { SPELLING } from '../../game/content/spelling-data';
import { sfxCorrect, sfxWrong, sfxLevelUp } from '../../game/systems/AudioSystem';
import { recordGameResult } from '../../game/systems/ProgressTracker';
import { useAuth } from '../auth/AuthProvider';

// Faithful port of V1 Spelling Bee: endless mode, 3 lives, type to spell

function shuffle<T>(arr: T[]): T[] { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

export function SpellingBeeQuiz({ onExit }: { onExit: () => void }) {
  const { pupil } = useAuth();
  const [words] = useState(() => {
    const all = [...SPELLING[1], ...SPELLING[2], ...SPELLING[3]];
    return shuffle(all);
  });
  const [idx, setIdx] = useState(0);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [flash, setFlash] = useState<'correct'|'wrong'|null>(null);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, [idx]);

  function check() {
    const val = input.trim().toLowerCase();
    const word = words[idx].w.toLowerCase();
    if (!val) return;
    if (val === word) {
      setScore(s => s + 1); setFlash('correct'); sfxCorrect();
      setFeedback('Correct!');
      setTimeout(() => { setInput(''); setFlash(null); setFeedback(''); setIdx(i => i + 1); }, 400);
    } else {
      const newLives = lives - 1;
      setLives(newLives); setFlash('wrong'); sfxWrong();
      setFeedback(`It was: ${word}`);
      if (newLives <= 0) {
        setTimeout(() => setDone(true), 1200);
      } else {
        setTimeout(() => { setInput(''); setFlash(null); setFeedback(''); setIdx(i => i + 1); }, 1200);
      }
    }
  }

  if (done) {
    const stars = score >= 15 ? 3 : score >= 8 ? 2 : score >= 3 ? 1 : 0;
    if (stars >= 3) sfxLevelUp();
    if (pupil) recordGameResult({ pupilId: pupil.id, gameId: 'spellingbee', score, stars, streak: 0, bestStreak: score, correct: score, total: score + 1 });
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-slate-900 to-amber-900/30">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full text-center border border-white/20">
          <div className="text-3xl mb-3">{'\u2B50'.repeat(stars)}{'\u2606'.repeat(3-stars)}</div>
          <h2 className="text-xl font-bold text-white mb-2">Spelling Bee!</h2>
          <p className="text-amber-300 text-2xl font-bold">Score: {score}</p>
          <div className="flex gap-3 mt-6">
            <button onClick={() => { setIdx(0); setLives(3); setScore(0); setInput(''); setFeedback(''); setFlash(null); setDone(false); }}
              className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl">Again</button>
            <button onClick={onExit} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20">Back</button>
          </div>
        </div>
      </div>
    );
  }

  const hearts = '\u2764\uFE0F'.repeat(lives) + '\u{1F5A4}'.repeat(3 - lives);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-900 to-amber-900/20">
      <div className="px-4 pt-4 flex items-center justify-between">
        <button onClick={onExit} className="text-white/40 hover:text-white/70 text-sm px-3 py-2 rounded-lg hover:bg-white/5">&larr; Back</button>
        <span className="text-xl">{hearts}</span>
        <span className="text-amber-300 font-bold text-lg">{score}</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 max-w-md mx-auto w-full gap-4">
        <p className="text-white/60 text-sm">Spell the word from the hint</p>
        <p className="text-amber-300 text-lg font-bold text-center">{words[idx].h}</p>
        <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && check()}
          className={`w-full px-4 py-4 rounded-2xl text-center text-2xl font-bold bg-white/10 border-2 text-white focus:outline-none ${flash === 'correct' ? 'border-emerald-400' : flash === 'wrong' ? 'border-red-400' : 'border-white/20'}`} autoComplete="off" autoCapitalize="off" placeholder="Type the word..." />
        <button onClick={check} className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl active:scale-95">Check</button>
        {feedback && <p className={`text-sm font-bold ${flash === 'correct' ? 'text-emerald-300' : 'text-red-300'}`}>{feedback}</p>}
      </div>
    </div>
  );
}
