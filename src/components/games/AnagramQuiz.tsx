/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 *
 * ANAGRAM QUIZ — Premium rebuild: unscramble letters with Motion animations,
 * AudioEngine SFX, Phaser forest background, GameHeader, ResultsScreen, Confetti.
 * CfE: LIT 1-13a (spelling patterns)
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { SPELLING } from '../../game/content/spelling-data';
import { recordGameResult } from '../../game/systems/ProgressTracker';
import { useAuth } from '../auth/AuthProvider';
import { LevelSelect } from '../shared/LevelSelect';
import { QuizWorld } from '../shared/QuizWorld';
import { GameBackButton, streakMessage } from '../shared/GameNav';
import { shuffle } from '../../utils/shuffle';
import { calcStars } from '../../utils/stars';
import {
  ResultsScreen, useConfetti, ConfettiLayer,
  sfxCoin, sfxBuzz, sfxComplete, sfxClick, sfxFanfare, sfxLevelUp,
  startMusic, stopMusic, updateMusic, getScale,
  THEME_FOREST,
} from '../premium';
import type { ThemeState } from '../premium';

export function AnagramQuiz({ onExit }: { onExit: () => void }) {
  const { pupil } = useAuth();
  const [level, setLevel] = useState<1 | 2 | 3 | null>(null);
  const [words, setWords] = useState<Array<{ w: string; h: string }>>([]);
  const [idx, setIdx] = useState(0);
  const [pool, setPool] = useState<string[]>([]);
  const [ans, setAns] = useState<string[]>([]);
  const [correct, setCorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [missed, setMissed] = useState<Array<{ w: string; h: string }>>([]);
  const [flash, setFlash] = useState<'correct' | 'wrong' | null>(null);
  const [done, setDone] = useState(false);
  const [locked, setLocked] = useState(false);
  const [muted, setMuted] = useState(false);
  const [themeState, setThemeState] = useState<ThemeState>({ progress: 0, streak: 0, livesRatio: 1, event: 'none' });
  const { burst, pieces } = useConfetti();
  const musicStarted = useRef(false);

  const total = 10;

  const startGame = useCallback((lv: 1 | 2 | 3) => {
    setLevel(lv);
    const ws = shuffle([...SPELLING[lv]]).slice(0, total);
    setWords(ws);
    const letters = ws[0].w.toLowerCase().split('');
    setPool(shuffle([...letters]));
    setAns([]);
    setIdx(0);
    setCorrect(0);
    setStreak(0);
    setBestStreak(0);
    setMissed([]);
    setDone(false);
    if (!muted && !musicStarted.current) {
      startMusic(THEME_FOREST);
      musicStarted.current = true;
    }
  }, [muted]);

  useEffect(() => {
    return () => { stopMusic(); musicStarted.current = false; };
  }, []);

  useEffect(() => {
    if (!muted) updateMusic(streak);
  }, [streak, muted]);

  function tapPool(i: number) {
    if (locked) return;
    if (!muted) sfxClick();
    const newPool = [...pool];
    const ch = newPool.splice(i, 1)[0];
    const newAns = [...ans, ch];
    setPool(newPool);
    setAns(newAns);
    if (newAns.length === words[idx].w.length) checkAnswer(newAns);
  }

  function tapAns(i: number) {
    if (locked) return;
    if (!muted) sfxClick();
    const newAns = [...ans];
    const ch = newAns.splice(i, 1)[0];
    setAns(newAns);
    setPool([...pool, ch]);
  }

  function checkAnswer(attempt: string[]) {
    const word = words[idx].w.toLowerCase();
    const ok = attempt.join('') === word;
    setLocked(true);
    setFlash(ok ? 'correct' : 'wrong');

    if (ok) {
      const newStreak = streak + 1;
      setCorrect(c => c + 1);
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
      if (!muted) sfxCoin();
      if (newStreak === 3) { if (!muted) sfxLevelUp(getScale()); toast('3 in a row! 🔥'); }
      if (newStreak === 5) { if (!muted) sfxLevelUp(getScale()); toast('5 streak — amazing! 🔥🔥'); }
      if (newStreak === 10) { if (!muted) sfxFanfare(getScale()); toast('10 IN A ROW! 🔥🔥🔥'); burst(30); }
      setThemeState({ progress: (idx + 1) / total, streak: newStreak, livesRatio: 1, event: 'correct' });
      setTimeout(advance, 700);
    } else {
      setStreak(0);
      if (!muted) sfxBuzz();
      setMissed(m => [...m, { w: word, h: words[idx].h }]);
      setThemeState({ progress: (idx + 1) / total, streak: 0, livesRatio: 1, event: 'wrong' });
      setTimeout(advance, 1500);
    }
  }

  function advance() {
    setLocked(false);
    setFlash(null);
    if (idx + 1 >= words.length) {
      setDone(true);
      stopMusic();
      musicStarted.current = false;
      const stars = calcStars(correct / total);
      if (!muted) { stars >= 2 ? sfxFanfare(getScale()) : sfxComplete(getScale()); }
      if (stars >= 2) burst(25);
      if (pupil) {
        recordGameResult({
          pupilId: pupil.id, gameId: 'anagram',
          score: Math.round((correct / total) * 100),
          stars, streak: 0, bestStreak, correct, total,
        });
      }
      return;
    }
    const next = idx + 1;
    setIdx(next);
    const letters = words[next].w.toLowerCase().split('');
    setPool(shuffle([...letters]));
    setAns([]);
    setThemeState({ progress: (idx + 1) / total, streak, livesRatio: 1, event: 'none' });
  }

  if (!level) {
    return <LevelSelect title="Anagrams" color="#c44569" icon="ABC" onSelect={(lv) => startGame(lv as 1 | 2 | 3)} onBack={onExit} />;
  }

  if (done) {
    const stars = calcStars(correct / total);
    const result = { correct, total, stars, bestStreak, missed: missed.map(m => ({ w: m.w, h: m.h })) };
    return (
      <div className="min-h-screen relative">
        <QuizWorld theme="forest" state={themeState} />
        <ResultsScreen result={result} onPlayAgain={() => { setLevel(null); }} onExit={onExit} />
        <ConfettiLayer pieces={pieces} />
      </div>
    );
  }

  if (words.length === 0) return null;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Phaser background */}
      <QuizWorld theme="forest" state={themeState} />

      {/* Game UI */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <div className="px-4 pt-4 flex items-center justify-between">
          <GameBackButton onClick={onExit} />
          <span className="text-white/60 text-sm font-medium">{idx + 1} / {total}</span>
          <button onClick={() => setMuted(!muted)} className="p-2 text-white/40 hover:text-white/70">
            {muted ? '🔇' : '🔊'}
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-4 pt-2">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-pink-500 rounded-full"
              animate={{ width: `${(idx / total) * 100}%` }}
              transition={{ type: 'spring', stiffness: 100 }}
            />
          </div>
        </div>

        {/* Streak */}
        <AnimatePresence>
          {streak >= 2 && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="text-center mt-2"
            >
              <span className="text-amber-300 text-sm font-bold drop-shadow-lg">
                {streakMessage(streak)}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main game area */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 max-w-md mx-auto w-full gap-5">
          <motion.p
            key={idx}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white/50 text-sm text-center"
          >
            {words[idx].h}
          </motion.p>

          {/* Answer slots */}
          <div className="flex gap-2 justify-center flex-wrap">
            {ans.map((ch, i) => (
              <motion.button
                key={`a-${idx}-${i}`}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{
                  scale: flash === 'wrong' ? [1, 1.05, 0.95, 1.05, 0.95, 1] : 1,
                  opacity: 1,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                onClick={() => tapAns(i)}
                className={`w-12 h-14 sm:w-14 sm:h-16 rounded-xl font-bold text-xl transition-colors active:scale-90 border-2 shadow-lg ${
                  flash === 'correct'
                    ? 'bg-emerald-500/50 border-emerald-400 text-emerald-100 shadow-emerald-500/30'
                    : flash === 'wrong'
                    ? 'bg-red-500/50 border-red-400 text-red-100 shadow-red-500/30'
                    : 'bg-pink-500/30 border-pink-400/50 text-white shadow-pink-500/20'
                }`}
              >
                {ch.toUpperCase()}
              </motion.button>
            ))}
            {Array.from({ length: words[idx].w.length - ans.length }).map((_, i) => (
              <motion.div
                key={`e-${idx}-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: i * 0.05 }}
                className="w-12 h-14 sm:w-14 sm:h-16 rounded-xl border-2 border-dashed border-white/20"
              />
            ))}
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {flash && (
              <motion.p
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className={`text-sm font-bold drop-shadow-lg ${
                  flash === 'correct' ? 'text-emerald-300' : 'text-red-300'
                }`}
              >
                {flash === 'correct' ? '✓ Correct!' : `✗ It was: ${words[idx].w.toLowerCase()}`}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Letter pool */}
          <div className="flex gap-2 justify-center flex-wrap mt-2">
            <AnimatePresence>
              {pool.map((ch, i) => (
                <motion.button
                  key={`p-${idx}-${i}-${ch}`}
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 20 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20, delay: i * 0.03 }}
                  onClick={() => tapPool(i)}
                  className="w-12 h-14 sm:w-14 sm:h-16 rounded-xl bg-white/10 border-2 border-white/20 text-white font-bold text-xl hover:bg-white/20 hover:border-white/40 active:scale-90 transition-colors shadow-lg backdrop-blur-sm"
                >
                  {ch.toUpperCase()}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>

          <p className="text-white/30 text-xs">Tap letters to spell the word</p>
        </div>
      </div>

      <ConfettiLayer pieces={pieces} />
    </div>
  );
}
