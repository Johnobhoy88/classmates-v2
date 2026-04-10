/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 *
 * SPELLING BEE — Premium: endless mode, 3 lives, type to spell.
 * Motion animations, AudioEngine, Phaser forest background.
 * CfE: LIT 1-13a (spelling patterns), LIT 1-21a (word recognition)
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { SPELLING } from '../../game/content/spelling-data';
import { recordGameResult } from '../../game/systems/ProgressTracker';
import { useAuth } from '../auth/AuthProvider';
import { QuizWorld } from '../shared/QuizWorld';
import { GameBackButton } from '../shared/GameNav';
import { shuffle } from '../../utils/shuffle';
import {
  ResultsScreen, useConfetti, ConfettiLayer,
  sfxCoin, sfxBuzz, sfxComplete, sfxFanfare, sfxLevelUp, sfxHeartLost, sfxClick,
  startMusic, stopMusic, updateMusic, getScale,
  THEME_FOREST,
} from '../premium';
import type { ThemeState } from '../premium';

export function SpellingBeeQuiz({ onExit }: { onExit: () => void }) {
  const { pupil } = useAuth();
  const [words] = useState(() => shuffle([...SPELLING[1], ...SPELLING[2], ...SPELLING[3]]));
  const [idx, setIdx] = useState(0);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [input, setInput] = useState('');
  const [flash, setFlash] = useState<'correct' | 'wrong' | null>(null);
  const [done, setDone] = useState(false);
  const [muted, setMuted] = useState(false);
  const [themeState, setThemeState] = useState<ThemeState>({ progress: 0, streak: 0, livesRatio: 1, event: 'none' });
  const { burst, pieces } = useConfetti();
  const inputRef = useRef<HTMLInputElement>(null);
  const musicStarted = useRef(false);
  const savedRef = useRef(false);

  useEffect(() => {
    if (!muted && !musicStarted.current) { startMusic(THEME_FOREST); musicStarted.current = true; }
    return () => { stopMusic(); musicStarted.current = false; };
  }, []);

  useEffect(() => { if (!muted) updateMusic(score); }, [score, muted]);
  useEffect(() => { inputRef.current?.focus(); }, [idx]);

  function check() {
    const val = input.trim().toLowerCase();
    const word = words[idx].w.toLowerCase();
    if (!val) return;
    if (!muted) sfxClick();

    if (val === word) {
      setScore(s => s + 1); setFlash('correct');
      if (!muted) sfxCoin();
      if (score + 1 === 5) toast('5 words! 🐝');
      if (score + 1 === 10) { if (!muted) sfxLevelUp(getScale()); toast('10 words! 🐝🔥'); }
      if (score + 1 === 15) { if (!muted) sfxFanfare(getScale()); toast('15 words! 🐝🔥🔥'); burst(20); }
      setThemeState({ progress: score / 20, streak: score + 1, livesRatio: lives / 3, event: 'correct' });
      setTimeout(() => { setInput(''); setFlash(null); setIdx(i => i + 1); }, 500);
    } else {
      const nl = lives - 1;
      setLives(nl); setFlash('wrong');
      if (!muted) { sfxBuzz(); sfxHeartLost(); }
      setThemeState({ progress: score / 20, streak: 0, livesRatio: nl / 3, event: 'wrong' });
      if (nl <= 0) {
        setTimeout(() => setDone(true), 1200);
      } else {
        toast(`${nl} ${nl === 1 ? 'life' : 'lives'} left!`);
        setTimeout(() => { setInput(''); setFlash(null); setIdx(i => i + 1); }, 1200);
      }
    }
  }

  useEffect(() => {
    if (done && pupil && !savedRef.current) {
      savedRef.current = true;
      stopMusic(); musicStarted.current = false;
      const stars = score >= 15 ? 3 : score >= 8 ? 2 : score >= 3 ? 1 : 0;
      if (!muted) { stars >= 2 ? sfxFanfare(getScale()) : sfxComplete(getScale()); }
      if (stars >= 2) burst(25);
      recordGameResult({ pupilId: pupil.id, gameId: 'spellingbee', score, stars, streak: 0, bestStreak: score, correct: score, total: score + (3 - lives) });
    }
  }, [done, pupil, score, lives, muted]);

  if (done) {
    const stars = score >= 15 ? 3 : score >= 8 ? 2 : score >= 3 ? 1 : 0;
    return (
      <div className="min-h-screen relative">
        <QuizWorld theme="forest" state={themeState} />
        <ResultsScreen
          result={{ correct: score, total: score + (3 - lives), stars, bestStreak: score, missed: [] }}
          onPlayAgain={() => { savedRef.current = false; setIdx(0); setLives(3); setScore(0); setInput(''); setFlash(null); setDone(false); }}
          onExit={onExit}
        />
        <ConfettiLayer pieces={pieces} />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <QuizWorld theme="forest" state={themeState} />
      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="px-4 pt-4 flex items-center justify-between">
          <GameBackButton onClick={onExit} />
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <motion.span
                key={i}
                animate={i >= lives ? { scale: 0.7, opacity: 0.3 } : { scale: 1, opacity: 1 }}
                className="text-xl"
              >
                {i < lives ? '❤️' : '🖤'}
              </motion.span>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-amber-300 font-bold text-lg">{score}</span>
            <button onClick={() => setMuted(!muted)} className="p-1 text-white/40 hover:text-white/70">{muted ? '🔇' : '🔊'}</button>
          </div>
        </div>

        <AnimatePresence>
          {score >= 5 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center mt-1">
              <span className="text-amber-300/70 text-xs font-bold">🐝 {score} words spelled</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col items-center justify-end pb-8 px-4 max-w-md mx-auto w-full gap-4">
          <motion.p key={idx} initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} className="text-white/50 text-sm">
            Spell the word from the hint
          </motion.p>

          <motion.p
            key={`hint-${idx}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-amber-300 text-lg font-bold text-center drop-shadow-lg"
          >
            {words[idx].h}
          </motion.p>

          <motion.input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && check()}
            animate={flash === 'wrong' ? { x: [-6, 6, -4, 4, 0] } : {}}
            className={`w-full px-4 py-4 rounded-2xl text-center text-2xl font-bold bg-white/10 backdrop-blur-sm border-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-400/50 transition-colors ${
              flash === 'correct' ? 'border-emerald-400 bg-emerald-500/10' : flash === 'wrong' ? 'border-red-400 bg-red-500/10' : 'border-white/20'
            }`}
            autoComplete="off"
            autoCapitalize="off"
            placeholder="Type the word..."
          />

          <motion.button whileTap={{ scale: 0.95 }} onClick={check}
            className="px-10 py-3 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl shadow-lg shadow-amber-500/30 text-lg">
            Check
          </motion.button>

          <AnimatePresence>
            {flash && (
              <motion.p initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className={`text-sm font-bold drop-shadow-lg ${flash === 'correct' ? 'text-emerald-300' : 'text-red-300'}`}>
                {flash === 'correct' ? '✓ Correct!' : `✗ It was: ${words[idx].w.toLowerCase()}`}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
      <ConfettiLayer pieces={pieces} />
    </div>
  );
}
