/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { genMathQuestion, type MathLevel } from '../../game/content/maths-data';
import { sfxWrong, sfxClick } from '../../game/systems/AudioSystem';
import { recordGameResult } from '../../game/systems/ProgressTracker';
import { useAuth } from '../auth/AuthProvider';
import { LevelSelect } from '../shared/LevelSelect';

// Faithful port of V1 Speed Maths: 60-second timed challenge with numpad, combo system

export function SpeedMathsQuiz({ onExit }: { onExit: () => void }) {
  const { pupil } = useAuth();
  const [level, setLevel] = useState<MathLevel | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [attempted, setAttempted] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [answer, setAnswer] = useState('');
  const [question, setQuestion] = useState<{ text: string; answer: number } | null>(null);
  const [flash, setFlash] = useState<'correct' | 'wrong' | null>(null);
  const [finished, setFinished] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadQ = useCallback(() => {
    if (!level) return;
    setQuestion(genMathQuestion(level));
    setAnswer('');
    setFlash(null);
  }, [level]);

  // Start timer when level selected
  useEffect(() => {
    if (!level) return;
    loadQ();
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setFinished(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [level, loadQ]);

  // Keyboard input
  useEffect(() => {
    if (!level || finished) return;
    const handler = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) pressKey(e.key);
      else if (e.key === 'Enter') checkAnswer();
      else if (e.key === 'Backspace') setAnswer('');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  function pressKey(v: string) {
    if (finished || !question) return;
    if (v === 'C') { setAnswer(''); return; }
    if (v === 'enter') { checkAnswer(); return; }
    setAnswer((a) => a.length < 4 ? a + v : a);
  }

  function checkAnswer() {
    if (!answer || !question || finished) return;
    const ok = parseInt(answer) === question.answer;
    setAttempted((a) => a + 1);
    if (ok) {
      const newCombo = combo + 1;
      const bonus = newCombo >= 5 ? 3 : newCombo >= 3 ? 2 : 1;
      setCombo(newCombo);
      setMaxCombo((m) => Math.max(m, newCombo));
      setScore((s) => s + bonus);
      setFlash('correct');
      sfxClick();
      setTimeout(loadQ, 100);
    } else {
      setCombo(0);
      setFlash('wrong');
      sfxWrong();
      setTimeout(loadQ, 200);
    }
  }

  if (!level) return <LevelSelect title="Speed Maths" color="#0984e3" icon="60s" onSelect={(lv) => setLevel(lv as MathLevel)} onBack={onExit} />;

  // Results
  if (finished) {
    const thresholds = { 1: 15, 2: 10, 3: 7 } as const;
    const t = thresholds[level];
    const stars = score >= t * 1.5 ? 3 : score >= t ? 2 : score >= Math.floor(t / 2) ? 1 : 0;

    if (pupil) {
      recordGameResult({ pupilId: pupil.id, gameId: 'speed', score, stars, streak: 0, bestStreak: maxCombo, correct: score, total: attempted });
    }

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-slate-900 to-blue-900/30">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full text-center border border-white/20">
          <div className="text-3xl mb-3">{'\u2B50'.repeat(stars)}{'\u2606'.repeat(3 - stars)}</div>
          <h2 className="text-xl font-bold text-white mb-1">Speed Maths!</h2>
          <p className="text-blue-300 text-2xl font-bold mb-2">{score} points</p>
          <p className="text-white/50 text-sm mb-1">{attempted} attempted</p>
          {maxCombo >= 3 && <p className="text-purple-300 text-sm mb-4">Best combo: {maxCombo >= 5 ? 'x3' : 'x2'} ({maxCombo} in a row)</p>}
          <div className="flex gap-3">
            <button onClick={() => { setLevel(null); setTimeLeft(60); setScore(0); setAttempted(0); setCombo(0); setMaxCombo(0); setFinished(false); }}
              className="flex-1 py-3 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl">Play Again</button>
            <button onClick={onExit} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20">Back</button>
          </div>
        </div>
      </div>
    );
  }

  const timerColor = timeLeft <= 5 ? 'text-red-400' : timeLeft <= 15 ? 'text-amber-400' : 'text-white/60';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-900 to-blue-900/20">
      <div className="px-4 pt-4 flex items-center justify-between">
        <button onClick={() => { if (timerRef.current) clearInterval(timerRef.current); onExit(); }} className="text-white/40 hover:text-white/70 text-sm font-semibold px-3 py-2 rounded-lg hover:bg-white/5">&larr; Quit</button>
        <span className={`text-2xl font-bold font-mono ${timerColor}`}>{timeLeft}s</span>
        <span className="text-blue-300 font-bold text-xl">{score}</span>
      </div>

      {combo >= 3 && (
        <div className="text-center text-amber-300 text-sm font-bold animate-pulse">
          {combo >= 5 ? `\u{1F525}\u{1F525} x3 COMBO!` : `\u{1F525} x2 combo!`}
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <p className="text-4xl font-bold text-white mb-6">{question?.text}</p>
        <p className={`text-3xl font-mono font-bold mb-8 ${flash === 'correct' ? 'text-emerald-400' : flash === 'wrong' ? 'text-red-400' : 'text-white'}`}>
          {answer || '_'}
        </p>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-2 w-64">
          {[1,2,3,4,5,6,7,8,9].map((n) => (
            <button key={n} onClick={() => pressKey(String(n))}
              className="h-14 bg-white/10 hover:bg-white/15 rounded-xl text-white text-xl font-bold border border-white/10 active:scale-95">{n}</button>
          ))}
          <button onClick={() => pressKey('C')} className="h-14 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-red-300 text-lg font-bold border border-red-500/20 active:scale-95">C</button>
          <button onClick={() => pressKey('0')} className="h-14 bg-white/10 hover:bg-white/15 rounded-xl text-white text-xl font-bold border border-white/10 active:scale-95">0</button>
          <button onClick={() => checkAnswer()} className="h-14 bg-emerald-500/30 hover:bg-emerald-500/40 rounded-xl text-emerald-300 text-lg font-bold border border-emerald-500/20 active:scale-95">{'\u2714'}</button>
        </div>
      </div>
    </div>
  );
}
