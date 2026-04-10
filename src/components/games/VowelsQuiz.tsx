/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 *
 * MISSING VOWELS — Premium rebuild: type the complete word with vowels filled in.
 * Motion animations, AudioEngine SFX, Phaser forest background, ResultsScreen.
 * CfE: LIT 1-13a (spelling patterns)
 */

import { useState, useRef, useEffect, useCallback } from 'react';
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
  sfxCoin, sfxBuzz, sfxComplete, sfxLevelUp, sfxFanfare, sfxClick,
  startMusic, stopMusic, updateMusic, getScale,
  THEME_FOREST,
} from '../premium';
import type { ThemeState } from '../premium';

function removeVowels(w: string) {
  return w.split('').map(c => 'aeiou'.includes(c) ? '_' : c).join('');
}

export function VowelsQuiz({ onExit }: { onExit: () => void }) {
  const { pupil } = useAuth();
  const [level, setLevel] = useState<1 | 2 | 3 | null>(null);
  const [words, setWords] = useState<Array<{ w: string; h: string }>>([]);
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState('');
  const [correct, setCorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [missed, setMissed] = useState<Array<{ w: string; h: string }>>([]);
  const [flash, setFlash] = useState<'correct' | 'wrong' | null>(null);
  const [done, setDone] = useState(false);
  const [muted, setMuted] = useState(false);
  const [themeState, setThemeState] = useState<ThemeState>({ progress: 0, streak: 0, livesRatio: 1, event: 'none' });
  const { burst, pieces } = useConfetti();
  const inputRef = useRef<HTMLInputElement>(null);
  const musicStarted = useRef(false);
  const total = 10;

  const startGame = useCallback((lv: 1 | 2 | 3) => {
    setLevel(lv);
    setWords(shuffle([...SPELLING[lv]]).slice(0, total));
    setIdx(0); setCorrect(0); setStreak(0); setBestStreak(0);
    setMissed([]); setDone(false); setInput('');
    if (!muted && !musicStarted.current) {
      startMusic(THEME_FOREST);
      musicStarted.current = true;
    }
  }, [muted]);

  useEffect(() => {
    return () => { stopMusic(); musicStarted.current = false; };
  }, []);

  useEffect(() => { if (!muted) updateMusic(streak); }, [streak, muted]);
  useEffect(() => { inputRef.current?.focus(); }, [idx]);

  function check() {
    const val = input.trim().toLowerCase();
    const word = words[idx].w.toLowerCase();
    if (!val) return;
    if (!muted) sfxClick();

    if (val === word) {
      const newStreak = streak + 1;
      setCorrect(c => c + 1);
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
      setFlash('correct');
      if (!muted) sfxCoin();
      if (newStreak === 3) { if (!muted) sfxLevelUp(getScale()); toast('3 in a row! 🔥'); }
      if (newStreak === 5) { if (!muted) sfxLevelUp(getScale()); toast('5 streak — amazing! 🔥🔥'); }
      if (newStreak === 10) { if (!muted) sfxFanfare(getScale()); toast('10 IN A ROW! 🔥🔥🔥'); burst(30); }
      setThemeState({ progress: (idx + 1) / total, streak: newStreak, livesRatio: 1, event: 'correct' });
      setTimeout(advance, 600);
    } else {
      setStreak(0);
      setFlash('wrong');
      if (!muted) sfxBuzz();
      setMissed(m => [...m, { w: word, h: words[idx].h }]);
      setThemeState({ progress: (idx + 1) / total, streak: 0, livesRatio: 1, event: 'wrong' });
      setTimeout(advance, 1400);
    }
  }

  function advance() {
    setInput(''); setFlash(null);
    if (idx + 1 >= words.length) {
      setDone(true);
      stopMusic(); musicStarted.current = false;
      const stars = calcStars(correct / total);
      if (!muted) { stars >= 2 ? sfxFanfare(getScale()) : sfxComplete(getScale()); }
      if (stars >= 2) burst(25);
      if (pupil) {
        recordGameResult({
          pupilId: pupil.id, gameId: 'vowels',
          score: Math.round((correct / total) * 100),
          stars, streak: 0, bestStreak, correct, total,
        });
      }
      return;
    }
    setIdx(i => i + 1);
    setThemeState({ progress: (idx + 2) / total, streak, livesRatio: 1, event: 'none' });
  }

  if (!level) return <LevelSelect title="Missing Vowels" color="#0abde3" icon="_e_" onSelect={(lv) => startGame(lv as 1 | 2 | 3)} onBack={onExit} />;

  if (done) {
    const stars = calcStars(correct / total);
    const result = { correct, total, stars, bestStreak, missed };
    return (
      <div className="min-h-screen relative">
        <QuizWorld theme="forest" state={themeState} />
        <ResultsScreen result={result} onPlayAgain={() => setLevel(null)} onExit={onExit} />
        <ConfettiLayer pieces={pieces} />
      </div>
    );
  }

  if (words.length === 0) return null;
  const word = words[idx].w.toLowerCase();
  const stripped = removeVowels(word);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <QuizWorld theme="forest" state={themeState} />

      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="px-4 pt-4 flex items-center justify-between">
          <GameBackButton onClick={onExit} />
          <span className="text-white/60 text-sm font-medium">{idx + 1} / {total}</span>
          <button onClick={() => setMuted(!muted)} className="p-2 text-white/40 hover:text-white/70">
            {muted ? '🔇' : '🔊'}
          </button>
        </div>

        <div className="px-4 pt-2">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div className="h-full bg-cyan-400 rounded-full" animate={{ width: `${(idx / total) * 100}%` }} transition={{ type: 'spring', stiffness: 100 }} />
          </div>
        </div>

        <AnimatePresence>
          {streak >= 2 && (
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className="text-center mt-2">
              <span className="text-amber-300 text-sm font-bold drop-shadow-lg">{streakMessage(streak)}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col items-center justify-center px-4 max-w-md mx-auto w-full gap-4">
          <motion.p key={idx} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-white/50 text-sm">
            Fill in the missing vowels
          </motion.p>

          <motion.p
            key={`word-${idx}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl sm:text-5xl font-mono font-bold text-cyan-300 tracking-[0.3em] drop-shadow-lg"
          >
            {stripped}
          </motion.p>

          <p className="text-white/40 text-sm">{words[idx].h}</p>

          <motion.input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && check()}
            animate={flash === 'wrong' ? { x: [-6, 6, -4, 4, 0] } : {}}
            transition={{ duration: 0.3 }}
            className={`w-full px-4 py-4 rounded-2xl text-center text-2xl font-bold bg-white/10 backdrop-blur-sm border-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-colors ${
              flash === 'correct' ? 'border-emerald-400 bg-emerald-500/10' : flash === 'wrong' ? 'border-red-400 bg-red-500/10' : 'border-white/20'
            }`}
            autoComplete="off"
            autoCapitalize="off"
            placeholder="Type the word..."
          />

          <motion.button
            onClick={check}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-3 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/30 active:shadow-sm transition-all text-lg"
          >
            Check
          </motion.button>

          <AnimatePresence>
            {flash && (
              <motion.p
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className={`text-sm font-bold drop-shadow-lg ${flash === 'correct' ? 'text-emerald-300' : 'text-red-300'}`}
              >
                {flash === 'correct' ? '✓ Correct!' : `✗ It was: ${word}`}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ConfettiLayer pieces={pieces} />
    </div>
  );
}
