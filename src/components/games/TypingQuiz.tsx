/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 */

import { useState, useEffect, useRef } from 'react';
import { sfxCorrect, sfxWrong } from '../../game/systems/AudioSystem';
import { recordGameResult } from '../../game/systems/ProgressTracker';
import { useAuth } from '../auth/AuthProvider';
import { shuffle } from '../../utils/shuffle';

// Faithful port of V1 Typing Speed: 60 seconds, type as many words as possible

const WORD_BANK = [
  'the','and','for','are','but','not','you','all','can','had','her','was','one','our','out',
  'day','get','has','him','his','how','its','may','new','now','old','see','way','who','boy',
  'did','cat','dog','run','big','red','sun','hat','cup','bed','pig','hen','bus','map','box',
  'happy','house','water','light','green','table','river','magic','brave','think','climb',
  'castle','forest','bridge','garden','school','friend','family','animal','morning','evening',
  'mountain','beautiful','adventure','different','together','Scotland','Highland','knowledge',
];

export function TypingQuiz({ onExit }: { onExit: () => void }) {
  const { pupil } = useAuth();
  const [words] = useState(() => shuffle([...WORD_BANK]));
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState('');
  const [correct, setCorrect] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const savedRef = useRef(false);

  useEffect(() => {
    if (!started) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { if (timerRef.current) clearInterval(timerRef.current); setDone(true); return 0; }
        return t - 1;
      });
    }, 1000);
    inputRef.current?.focus();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [started]);

  function handleInput(val: string) {
    if (done) return;
    if (val.endsWith(' ') || val.endsWith('\n')) {
      const typed = val.trim().toLowerCase();
      if (typed === words[idx % words.length].toLowerCase()) {
        setCorrect(c => c + 1); sfxCorrect();
      } else {
        sfxWrong();
      }
      setIdx(i => i + 1); setInput('');
    } else {
      setInput(val);
    }
  }

  if (!started) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-slate-900 to-indigo-900/30">
        <button onClick={onExit} className="absolute top-4 left-4 text-white/40 hover:text-white/70 text-sm px-3 py-2 rounded-lg hover:bg-white/5">&larr; Back</button>
        <div className="text-4xl mb-3">{'\u2328'}</div>
        <h2 className="text-2xl font-bold text-white mb-2">Typing Speed</h2>
        <p className="text-white/50 text-sm mb-6">Type as many words as you can in 60 seconds!</p>
        <button onClick={() => setStarted(true)} className="px-8 py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-2xl text-lg active:scale-95">Start!</button>
      </div>
    );
  }

  // Save result once when done
  useEffect(() => {
    if (done && pupil && !savedRef.current) {
      savedRef.current = true;
      const wpm = correct;
      const stars = wpm >= 20 ? 3 : wpm >= 12 ? 2 : wpm >= 5 ? 1 : 0;
      recordGameResult({ pupilId: pupil.id, gameId: 'typing', score: wpm, stars, streak: 0, bestStreak: wpm, correct: wpm, total: idx });
    }
  }, [done, pupil, correct, idx]);

  if (done) {
    const wpm = correct;
    const stars = wpm >= 20 ? 3 : wpm >= 12 ? 2 : wpm >= 5 ? 1 : 0;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-slate-900 to-indigo-900/30">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full text-center border border-white/20">
          <div className="text-3xl mb-3">{'\u2B50'.repeat(stars)}{'\u2606'.repeat(3-stars)}</div>
          <h2 className="text-xl font-bold text-white mb-2">Typing Speed!</h2>
          <p className="text-indigo-300 text-2xl font-bold">{wpm} words per minute</p>
          <p className="text-white/40 text-sm mt-1">{correct}/{idx} correct</p>
          <div className="flex gap-3 mt-6">
            <button onClick={() => { savedRef.current = false; setIdx(0); setCorrect(0); setTimeLeft(60); setInput(''); setStarted(false); setDone(false); }}
              className="flex-1 py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl">Again</button>
            <button onClick={onExit} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20">Back</button>
          </div>
        </div>
      </div>
    );
  }

  const timerColor = timeLeft <= 5 ? 'text-red-400' : timeLeft <= 15 ? 'text-amber-400' : 'text-white/60';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-900 to-indigo-900/20">
      <div className="px-4 pt-4 flex items-center justify-between">
        <button onClick={() => { if (timerRef.current) clearInterval(timerRef.current); onExit(); }} className="text-white/40 hover:text-white/70 text-sm px-3 py-2 rounded-lg hover:bg-white/5">&larr; Quit</button>
        <span className={`text-2xl font-bold font-mono ${timerColor}`}>{timeLeft}s</span>
        <span className="text-indigo-300 font-bold">{correct} wpm</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 max-w-md mx-auto w-full gap-6">
        <p className="text-4xl font-bold text-white">{words[idx % words.length]}</p>
        <input ref={inputRef} type="text" value={input} onChange={e => handleInput(e.target.value)}
          className="w-full px-4 py-4 rounded-2xl text-center text-2xl font-bold bg-white/10 border-2 border-white/20 text-white focus:outline-none focus:border-indigo-400" autoComplete="off" autoCapitalize="off" autoFocus />
        <p className="text-white/30 text-sm">Press space after each word</p>
      </div>
    </div>
  );
}
