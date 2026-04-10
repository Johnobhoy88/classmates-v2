/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 *
 * TYPING SPEED — Premium: 60-second typing challenge.
 * Motion animations, AudioEngine, Phaser forest background.
 * CfE: LIT 1-21a (word recognition)
 */

import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { recordGameResult } from '../../game/systems/ProgressTracker';
import { useAuth } from '../auth/AuthProvider';
import { QuizWorld } from '../shared/QuizWorld';
import { GameBackButton } from '../shared/GameNav';
import { shuffle } from '../../utils/shuffle';
import {
  ResultsScreen, useConfetti, ConfettiLayer,
  sfxCoin, sfxBuzz, sfxComplete, sfxFanfare,
  startMusic, stopMusic, getScale,
  THEME_FOREST,
} from '../premium';
import type { ThemeState } from '../premium';

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
  const [muted, setMuted] = useState(false);
  const [themeState, setThemeState] = useState<ThemeState>({ progress: 0, streak: 0, livesRatio: 1, event: 'none' });
  const { burst, pieces } = useConfetti();
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const savedRef = useRef(false);
  const musicStarted = useRef(false);

  useEffect(() => () => { stopMusic(); musicStarted.current = false; }, []);

  useEffect(() => {
    if (!started) return;
    if (!muted && !musicStarted.current) { startMusic(THEME_FOREST); musicStarted.current = true; }
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { if (timerRef.current) clearInterval(timerRef.current); setDone(true); return 0; }
        return t - 1;
      });
    }, 1000);
    inputRef.current?.focus();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [started, muted]);

  function handleInput(val: string) {
    if (done) return;
    if (val.endsWith(' ') || val.endsWith('\n')) {
      const typed = val.trim().toLowerCase();
      if (typed === words[idx % words.length].toLowerCase()) {
        const nc = correct + 1;
        setCorrect(nc);
        if (!muted) sfxCoin();
        if (nc === 10) toast('10 words! ⌨️🔥');
        if (nc === 20) { if (!muted) sfxFanfare(getScale()); toast('20 words! ⌨️🔥🔥'); burst(15); }
        setThemeState({ progress: timeLeft / 60, streak: nc, livesRatio: 1, event: 'correct' });
      } else {
        if (!muted) sfxBuzz();
        setThemeState({ progress: timeLeft / 60, streak: 0, livesRatio: 1, event: 'wrong' });
      }
      setIdx(i => i + 1); setInput('');
    } else {
      setInput(val);
    }
  }

  useEffect(() => {
    if (done && pupil && !savedRef.current) {
      savedRef.current = true;
      stopMusic(); musicStarted.current = false;
      const wpm = correct;
      const stars = wpm >= 20 ? 3 : wpm >= 12 ? 2 : wpm >= 5 ? 1 : 0;
      if (!muted) { stars >= 2 ? sfxFanfare(getScale()) : sfxComplete(getScale()); }
      if (stars >= 2) burst(25);
      recordGameResult({ pupilId: pupil.id, gameId: 'typing', score: wpm, stars, streak: 0, bestStreak: wpm, correct: wpm, total: idx });
    }
  }, [done, pupil, correct, idx, muted]);

  if (!started) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <QuizWorld theme="forest" state={themeState} />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
          <GameBackButton onClick={onExit} />
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
            <div className="text-5xl mb-4">⌨️</div>
            <h2 className="text-2xl font-bold text-white mb-2">Typing Speed</h2>
            <p className="text-white/50 text-sm mb-6">Type as many words as you can in 60 seconds!</p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setStarted(true)}
              className="px-10 py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-2xl text-lg shadow-lg shadow-indigo-500/30"
            >
              Start!
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (done) {
    const wpm = correct;
    const stars = wpm >= 20 ? 3 : wpm >= 12 ? 2 : wpm >= 5 ? 1 : 0;
    return (
      <div className="min-h-screen relative">
        <QuizWorld theme="forest" state={themeState} />
        <ResultsScreen
          result={{ correct: wpm, total: idx || 1, stars, bestStreak: wpm, missed: [] }}
          onPlayAgain={() => { savedRef.current = false; setIdx(0); setCorrect(0); setTimeLeft(60); setInput(''); setStarted(false); setDone(false); }}
          onExit={onExit}
        />
        <ConfettiLayer pieces={pieces} />
      </div>
    );
  }

  const timerColor = timeLeft <= 5 ? 'text-red-400' : timeLeft <= 15 ? 'text-amber-400' : 'text-white/60';

  return (
    <div className="min-h-screen relative overflow-hidden">
      <QuizWorld theme="forest" state={themeState} />
      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="px-4 pt-4 flex items-center justify-between">
          <GameBackButton onClick={() => { if (timerRef.current) clearInterval(timerRef.current); stopMusic(); musicStarted.current = false; onExit(); }} />
          <motion.span key={timeLeft} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className={`text-2xl font-bold font-mono ${timerColor}`}>{timeLeft}s</motion.span>
          <div className="flex items-center gap-3">
            <span className="text-indigo-300 font-bold">{correct} wpm</span>
            <button onClick={() => setMuted(!muted)} className="p-1 text-white/40 hover:text-white/70">{muted ? '🔇' : '🔊'}</button>
          </div>
        </div>

        <div className="px-4 pt-2">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div className={`h-full rounded-full ${timeLeft <= 5 ? 'bg-red-500' : timeLeft <= 15 ? 'bg-amber-500' : 'bg-indigo-500'}`} animate={{ width: `${(timeLeft / 60) * 100}%` }} transition={{ duration: 0.3 }} />
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-end pb-8 px-4 max-w-md mx-auto w-full gap-6">
          <motion.p
            key={idx}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="text-4xl sm:text-5xl font-bold text-white drop-shadow-lg"
          >
            {words[idx % words.length]}
          </motion.p>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => handleInput(e.target.value)}
            className="w-full px-4 py-4 rounded-2xl text-center text-2xl font-bold bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/50"
            autoComplete="off"
            autoCapitalize="off"
            autoFocus
          />
          <p className="text-white/30 text-sm">Press space after each word</p>
        </div>
      </div>
      <ConfettiLayer pieces={pieces} />
    </div>
  );
}
