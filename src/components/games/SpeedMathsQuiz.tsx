/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 *
 * SPEED MATHS — Premium: 60-second timed numpad challenge with combo system.
 * Motion animations, AudioEngine, Phaser cosmos background.
 * CfE: MNU 1-02a (add/subtract), MNU 1-03a (multiply/divide)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { genMathQuestion, type MathLevel } from '../../game/content/maths-data';
import { recordGameResult } from '../../game/systems/ProgressTracker';
import { useAuth } from '../auth/AuthProvider';
import { LevelSelect } from '../shared/LevelSelect';
import { QuizWorld } from '../shared/QuizWorld';
import { GameBackButton } from '../shared/GameNav';
import {
  ResultsScreen, useConfetti, ConfettiLayer,
  sfxCoin, sfxBuzz, sfxComplete, sfxClick, sfxFanfare, sfxLevelUp,
  startMusic, stopMusic, updateMusic, getScale,
  THEME_COSMOS,
} from '../premium';
import type { ThemeState } from '../premium';

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
  const [muted, setMuted] = useState(false);
  const [themeState, setThemeState] = useState<ThemeState>({ progress: 0, streak: 0, livesRatio: 1, event: 'none' });
  const { burst, pieces } = useConfetti();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const savedRef = useRef(false);
  const musicStarted = useRef(false);

  const loadQ = useCallback(() => {
    if (!level) return;
    setQuestion(genMathQuestion(level));
    setAnswer(''); setFlash(null);
  }, [level]);

  useEffect(() => {
    if (!level) return;
    loadQ();
    if (!muted && !musicStarted.current) { startMusic(THEME_COSMOS); musicStarted.current = true; }
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { if (timerRef.current) clearInterval(timerRef.current); setFinished(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [level, loadQ, muted]);

  useEffect(() => () => { stopMusic(); musicStarted.current = false; }, []);
  useEffect(() => { if (!muted) updateMusic(combo); }, [combo, muted]);

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
    if (!muted) sfxClick();
    setAnswer(a => a.length < 4 ? a + v : a);
  }

  function checkAnswer() {
    if (!answer || !question || finished) return;
    const ok = parseInt(answer) === question.answer;
    setAttempted(a => a + 1);
    if (ok) {
      const nc = combo + 1;
      const bonus = nc >= 5 ? 3 : nc >= 3 ? 2 : 1;
      setCombo(nc); setMaxCombo(m => Math.max(m, nc));
      setScore(s => s + bonus);
      setFlash('correct');
      if (!muted) sfxCoin();
      if (nc === 3) toast('x2 combo! 🔥');
      if (nc === 5) { if (!muted) sfxLevelUp(getScale()); toast('x3 COMBO! 🔥🔥'); }
      if (nc === 10) { if (!muted) sfxFanfare(getScale()); toast('10 IN A ROW! 🔥🔥🔥'); burst(20); }
      setThemeState({ progress: timeLeft / 60, streak: nc, livesRatio: 1, event: 'correct' });
      setTimeout(loadQ, 100);
    } else {
      setCombo(0); setFlash('wrong');
      if (!muted) sfxBuzz();
      setThemeState({ progress: timeLeft / 60, streak: 0, livesRatio: 1, event: 'wrong' });
      setTimeout(loadQ, 200);
    }
  }

  // Save result
  useEffect(() => {
    if (finished && pupil && level && !savedRef.current) {
      savedRef.current = true;
      stopMusic(); musicStarted.current = false;
      const thresholds = { 1: 15, 2: 10, 3: 7 } as const;
      const t = thresholds[level];
      const stars = score >= t * 1.5 ? 3 : score >= t ? 2 : score >= Math.floor(t / 2) ? 1 : 0;
      if (!muted) { stars >= 2 ? sfxFanfare(getScale()) : sfxComplete(getScale()); }
      if (stars >= 2) burst(25);
      recordGameResult({ pupilId: pupil.id, gameId: 'speed', score, stars, streak: 0, bestStreak: maxCombo, correct: score, total: attempted });
    }
  }, [finished, pupil, level, score, maxCombo, attempted, muted]);

  if (!level) return <LevelSelect title="Speed Maths" color="#0984e3" icon="60s" onSelect={lv => setLevel(lv as MathLevel)} onBack={onExit} />;

  if (finished) {
    const thresholds = { 1: 15, 2: 10, 3: 7 } as const;
    const t = thresholds[level];
    const stars = score >= t * 1.5 ? 3 : score >= t ? 2 : score >= Math.floor(t / 2) ? 1 : 0;
    return (
      <div className="min-h-screen relative">
        <QuizWorld theme="cosmos" state={themeState} />
        <ResultsScreen
          result={{ correct: score, total: attempted || 1, stars, bestStreak: maxCombo, missed: [] }}
          onPlayAgain={() => { savedRef.current = false; setLevel(null); setTimeLeft(60); setScore(0); setAttempted(0); setCombo(0); setMaxCombo(0); setFinished(false); }}
          onExit={onExit}
        />
        <ConfettiLayer pieces={pieces} />
      </div>
    );
  }

  const timerColor = timeLeft <= 5 ? 'text-red-400' : timeLeft <= 15 ? 'text-amber-400' : 'text-white/60';
  const timerPct = (timeLeft / 60) * 100;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <QuizWorld theme="cosmos" state={themeState} />
      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="px-4 pt-4 flex items-center justify-between">
          <GameBackButton onClick={() => { if (timerRef.current) clearInterval(timerRef.current); stopMusic(); musicStarted.current = false; onExit(); }} />
          <motion.span
            key={timeLeft}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            className={`text-2xl font-bold font-mono ${timerColor}`}
          >
            {timeLeft}s
          </motion.span>
          <div className="flex items-center gap-3">
            <span className="text-blue-300 font-bold text-xl">{score}</span>
            <button onClick={() => setMuted(!muted)} className="p-1 text-white/40 hover:text-white/70">{muted ? '🔇' : '🔊'}</button>
          </div>
        </div>

        {/* Timer bar */}
        <div className="px-4 pt-2">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${timeLeft <= 5 ? 'bg-red-500' : timeLeft <= 15 ? 'bg-amber-500' : 'bg-blue-500'}`}
              animate={{ width: `${timerPct}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Combo indicator */}
        <AnimatePresence>
          {combo >= 3 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="text-center mt-2"
            >
              <span className="text-amber-300 text-sm font-bold drop-shadow-lg">
                {combo >= 5 ? `🔥🔥 x3 COMBO! (${combo})` : `🔥 x2 combo! (${combo})`}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col items-center justify-end pb-8 px-4">
          <motion.p
            key={question?.text}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl sm:text-5xl font-bold text-white mb-6 drop-shadow-lg"
          >
            {question?.text}
          </motion.p>

          <motion.p
            animate={flash === 'wrong' ? { x: [-8, 8, -5, 5, 0] } : flash === 'correct' ? { scale: [1, 1.15, 1] } : {}}
            className={`text-3xl font-mono font-bold mb-8 min-w-[80px] text-center ${
              flash === 'correct' ? 'text-emerald-400' : flash === 'wrong' ? 'text-red-400' : 'text-white'
            }`}
          >
            {answer || '_'}
          </motion.p>

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-2 w-64">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
              <motion.button
                key={n}
                whileTap={{ scale: 0.9 }}
                onClick={() => pressKey(String(n))}
                className="h-14 bg-white/10 hover:bg-white/15 rounded-xl text-white text-xl font-bold border border-white/10 active:scale-95 shadow-lg backdrop-blur-sm"
              >
                {n}
              </motion.button>
            ))}
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => pressKey('C')}
              className="h-14 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-red-300 text-lg font-bold border border-red-500/20 shadow-lg">C</motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => pressKey('0')}
              className="h-14 bg-white/10 hover:bg-white/15 rounded-xl text-white text-xl font-bold border border-white/10 shadow-lg">0</motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => checkAnswer()}
              className="h-14 bg-emerald-500/30 hover:bg-emerald-500/40 rounded-xl text-emerald-300 text-lg font-bold border border-emerald-500/20 shadow-lg">✔</motion.button>
          </div>
        </div>
      </div>
      <ConfettiLayer pieces={pieces} />
    </div>
  );
}
