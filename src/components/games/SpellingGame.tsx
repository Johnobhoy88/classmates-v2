/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 *
 * SPELLING GAME — "Spellbound Forest"
 * Phaser 3 forest background (particles, tweens, camera effects, owl mascot)
 * + React UI (Motion springs, glassmorphism keyboard, confetti)
 * + AudioEngine (forest music, dynamic SFX on every interaction)
 * + Premium components (GameHeader w/ Radix quit dialog, ResultsScreen, Confetti, Sonner toasts)
 *
 * CfE Outcomes: LIT 1-13a (Spelling — knowledge of spelling patterns)
 *               LIT 1-21a (Reading — word recognition, phonics)
 * CfE Levels:   Early (P1), First (P2-P4), Second (P5-P7)
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Zap, Trophy } from 'lucide-react';
import { toast } from 'sonner';
// Radix/Tooltip now in shared GameHeader
import { SPELLING, WORD_EMOJI, type SpellingWord, type SpellingLevel } from '../../game/content/spelling-data';
import { recordGameResult } from '../../game/systems/ProgressTracker';
import { useAuth } from '../auth/AuthProvider';
import { calcStars } from '../../utils/stars';
import { shuffle } from '../../utils/shuffle';
import { QuizWorld } from '../shared/QuizWorld';
import {
  GameHeader, ResultsScreen, PremiumLevelSelect, useConfetti, ConfettiLayer,
  sfxCoin, sfxBuzz, sfxComplete, sfxFail, sfxLevelUp, sfxHeartLost, sfxClick, sfxFanfare,
  startMusic, stopMusic, updateMusic, getScale, THEME_FOREST,
} from '../premium';
import type { ThemeState, LevelDef, GameResult } from '../premium';

const KEYBOARD_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
const LEVELS: LevelDef[] = [
  { level: 1, label: 'Easy', desc: '3-letter words', icon: Star, color: 'from-emerald-500 to-teal-600', lives: 7 },
  { level: 2, label: 'Medium', desc: '4-6 letter words', icon: Zap, color: 'from-blue-500 to-indigo-600', lives: 6 },
  { level: 3, label: 'Hard', desc: 'Big words!', icon: Trophy, color: 'from-purple-500 to-pink-600', lives: 5 },
];

interface GameState {
  words: SpellingWord[];
  idx: number;
  word: string;
  revealed: boolean[];
  usedKeys: Map<string, 'correct' | 'wrong'>;
  lives: number;
  maxLives: number;
  correct: number;
  total: number;
  streak: number;
  bestStreak: number;
  missed: Array<{ w: string; h: string }>;
  wordState: 'playing' | 'won' | 'lost';
}

function getEmoji(word: string): string {
  const code = WORD_EMOJI[word];
  if (!code) return '';
  try { return String.fromCodePoint(parseInt(code, 16)); } catch { return ''; }
}

export function SpellingGame({ onExit }: { onExit: () => void }) {
  const { pupil } = useAuth();
  const [level, setLevel] = useState<SpellingLevel | null>(null);
  const [game, setGame] = useState<GameState | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const [shake, setShake] = useState(false);
  const [audioOn, setAudioOn] = useState(true);
  const [forestEvent, setForestEvent] = useState<ThemeState['event']>('none');
  const savedRef = useRef(false);
  const { pieces: confetti, burst: burstConfetti } = useConfetti();

  // Compute theme state from game state — drives Phaser forest background
  const forestState: ThemeState = game ? {
    progress: game.idx / game.total,
    streak: game.streak,
    livesRatio: game.lives / game.maxLives,
    event: forestEvent,
  } : { progress: 0, streak: 0, livesRatio: 1, event: 'none' };

  // Clear forest event after a frame so it only fires once
  useEffect(() => {
    if (forestEvent !== 'none') {
      const t = setTimeout(() => setForestEvent('none'), 50);
      return () => clearTimeout(t);
    }
  }, [forestEvent]);

  // Update music reactively
  useEffect(() => {
    if (game && audioOn) updateMusic(game.streak);
  }, [game?.streak, audioOn]);

  // Start music on level select
  useEffect(() => {
    if (level && audioOn) startMusic(THEME_FOREST);
    return () => stopMusic();
  }, [level, audioOn]);

  const toggleAudio = useCallback(() => {
    setAudioOn(prev => {
      if (prev) stopMusic(); else startMusic(THEME_FOREST);
      return !prev;
    });
  }, []);

  const startGame = useCallback((lv: SpellingLevel) => {
    const lvData = LEVELS.find(l => l.level === lv)!;
    const pool = shuffle([...SPELLING[lv]]);
    const words = pool.slice(0, 10);
    const w = words[0].w.toLowerCase();
    setLevel(lv);
    setResult(null);
    savedRef.current = false;
    setGame({
      words, idx: 0, word: w,
      revealed: new Array(w.length).fill(false),
      usedKeys: new Map(),
      lives: lvData.lives, maxLives: lvData.lives,
      correct: 0, total: words.length,
      streak: 0, bestStreak: 0, missed: [],
      wordState: 'playing',
    });
  }, []);

  const pressKey = useCallback((ch: string) => {
    if (!game || game.wordState !== 'playing') return;
    if (game.usedKeys.has(ch)) return;

    if (audioOn) sfxClick();

    const word = game.word;
    let found = false;
    const newRevealed = [...game.revealed];
    for (let i = 0; i < word.length; i++) {
      if (word[i] === ch && !newRevealed[i]) {
        newRevealed[i] = true;
        found = true;
      }
    }

    const newUsed = new Map(game.usedKeys);
    newUsed.set(ch, found ? 'correct' : 'wrong');

    if (found) {
      if (audioOn) sfxCoin();
      setForestEvent('correct');
      const allRevealed = newRevealed.every(Boolean);
      if (allRevealed) {
        // Word complete!
        const newCorrect = game.correct + 1;
        const newStreak = game.streak + 1;
        const newBestStreak = Math.max(game.bestStreak, newStreak);
        setForestEvent('wordComplete');
        // Toast milestones
        if (newStreak === 3) toast('3 in a row! \u{1F525}', { duration: 2000 });
        else if (newStreak === 5) toast('5 streak — amazing! \u{1F525}\u{1F525}', { duration: 2500 });
        else if (newStreak === 10) toast('10 IN A ROW! \u{1F525}\u{1F525}\u{1F525}', { duration: 3000 });
        // Perfect word toast (no wrong guesses)
        if (game.usedKeys.size === new Set(game.word).size) toast('Perfect spell! \u2728', { duration: 2000 });
        if (audioOn) {
          if (newStreak >= 5) sfxLevelUp(getScale());
          else sfxComplete(getScale());
        }
        burstConfetti(newStreak >= 5 ? 20 : 10);

        setGame(g => g ? {
          ...g, revealed: newRevealed, usedKeys: newUsed,
          correct: newCorrect, streak: newStreak, bestStreak: newBestStreak,
          wordState: 'won',
        } : null);
      } else {
        setGame(g => g ? { ...g, revealed: newRevealed, usedKeys: newUsed } : null);
      }
    } else {
      // Wrong letter
      if (audioOn) sfxBuzz();
      setForestEvent('wrong');
      const newLives = game.lives - 1;
      if (audioOn) sfxHeartLost();
      setShake(true);
      setTimeout(() => setShake(false), 300);

      if (newLives <= 0) {
        // Word failed
        if (audioOn) sfxFail(getScale());
        setForestEvent('wordFailed');
        const newMissed = [...game.missed, { w: game.word, h: game.words[game.idx].h }];
        setGame(g => g ? {
          ...g, usedKeys: newUsed, lives: 0, streak: 0, missed: newMissed,
          revealed: new Array(game.word.length).fill(true), wordState: 'lost',
        } : null);
      } else {
        setGame(g => g ? { ...g, usedKeys: newUsed, lives: newLives } : null);
      }
    }
  }, [game, audioOn]);

  // Keyboard listener
  useEffect(() => {
    if (!game || game.wordState !== 'playing') return;
    const handler = (e: KeyboardEvent) => {
      if (/^[a-z]$/i.test(e.key)) pressKey(e.key.toLowerCase());
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  // Auto-advance after win/lose
  useEffect(() => {
    if (!game) return;
    if (game.wordState === 'won' || game.wordState === 'lost') {
      const delay = game.wordState === 'won' ? 1000 : 1800;
      const timeout = setTimeout(() => {
        const nextIdx = game.idx + 1;
        if (nextIdx >= game.total) {
          // Game over
          const pct = game.correct / game.total;
          const stars = calcStars(pct);
          setForestEvent('gameComplete');
          if (audioOn) sfxFanfare(getScale());
          burstConfetti(stars >= 3 ? 40 : stars >= 2 ? 25 : 12);
          setResult({ correct: game.correct, total: game.total, stars, bestStreak: game.bestStreak, missed: game.missed });
        } else {
          const w = game.words[nextIdx].w.toLowerCase();

          setGame(g => g ? {
            ...g, idx: nextIdx, word: w,
            revealed: new Array(w.length).fill(false),
            usedKeys: new Map(),
            lives: g.maxLives,
            wordState: 'playing',
          } : null);
        }
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [game?.wordState, game?.idx, audioOn]);

  // Save result
  useEffect(() => {
    if (result && pupil && !savedRef.current) {
      savedRef.current = true;
      recordGameResult({
        pupilId: pupil.id, gameId: 'spelling', skillId: `level-${level}`,
        score: Math.round((result.correct / result.total) * 100),
        stars: result.stars, streak: 0, bestStreak: result.bestStreak,
        correct: result.correct, total: result.total,
      });
    }
  }, [result, pupil, level]);

  // === LEVEL SELECT ===
  if (!level || (!game && !result)) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <QuizWorld theme="forest" state={forestState} />
        <PremiumLevelSelect
          title="Spellbound Forest"
          subtitle="Guess the word from the clue!"
          icon={<span className="text-6xl">&#x2728;</span>}
          levels={LEVELS}
          audioOn={audioOn}
          onToggleAudio={toggleAudio}
          onSelect={(lv) => { sfxClick(); startGame(lv as SpellingLevel); }}
          onExit={onExit}
        />
      </div>
    );
  }

  // === RESULTS ===
  if (result) {
    // Add emoji to missed items for display
    const missedWithEmoji = result.missed.map(m => ({ ...m, emoji: getEmoji(m.w) }));
    return (
      <div className="min-h-screen relative overflow-hidden">
        <QuizWorld theme="forest" state={forestState} />
        <ResultsScreen
          result={{ ...result, missed: missedWithEmoji }}
          onPlayAgain={() => { setGame(null); setResult(null); setLevel(null); }}
          onExit={() => { stopMusic(); onExit(); }}
        />
      </div>
    );
  }

  // === GAMEPLAY ===
  if (!game) return null;
  const emoji = getEmoji(game.word);
  const streakMsg = game.streak >= 10 ? `\u{1F525}\u{1F525}\u{1F525} ${game.streak} on fire!`
    : game.streak >= 5 ? `\u{1F525}\u{1F525} ${game.streak} streak!`
    : game.streak >= 3 ? `\u{1F525} ${game.streak} in a row!`
    : game.streak >= 2 ? `\u2B50 ${game.streak} streak` : '';
  const wordWon = game.wordState === 'won';

  return (
    <div className="min-h-screen relative overflow-hidden">
      <QuizWorld theme="forest" state={forestState} />

      <ConfettiLayer pieces={confetti} />

      <div className="relative z-10 min-h-screen flex flex-col">
        <GameHeader
          lives={game.lives} maxLives={game.maxLives}
          idx={game.idx} total={game.total}
          audioOn={audioOn} onToggleAudio={toggleAudio}
          onQuit={() => { stopMusic(); onExit(); }}
          quitTitle="Leave the forest?"
        />

        {/* Emoji + Hint */}
        <div className="text-center px-6 pt-3 flex-shrink-0">
          <AnimatePresence mode="wait">
            <motion.div key={game.idx}
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ type: 'spring', damping: 12, stiffness: 120 }}
            >
              {emoji && (
                <motion.div
                  className="text-7xl mb-3 drop-shadow-lg inline-block"
                  animate={wordWon ? {
                    scale: [1, 1.3, 1.1, 1.25, 1],
                    rotate: [0, -8, 8, -4, 0],
                  } : {}}
                  transition={{ duration: 0.6 }}
                >{emoji}</motion.div>
              )}
              <p className="text-white/80 text-lg font-medium leading-snug max-w-xs mx-auto">{game.words[game.idx].h}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Letter slots — drop-in from above, fly-out upward */}
        <div className="flex justify-center gap-2 sm:gap-3 px-4 pt-6 pb-2">
          <AnimatePresence mode="wait">
            <motion.div key={game.idx} className="flex gap-2 sm:gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.2 }}
            >
              {game.word.split('').map((ch, i) => {
                const revealed = game.revealed[i];
                const failed = game.wordState === 'lost';
                return (
                  <motion.div key={`${game.idx}-${i}`}
                    initial={{ y: -40, opacity: 0, scale: 0.7 }}
                    animate={shake && !revealed ? {
                      x: [0, -6, 6, -6, 6, 0], y: 0, opacity: 1, scale: 1,
                    } : revealed ? {
                      y: 0, opacity: 1, scale: [1, 1.25, 1],
                    } : {
                      y: 0, opacity: 1, scale: 1, x: 0,
                    }}
                    transition={revealed
                      ? { type: 'spring', damping: 8, stiffness: 200, delay: i * 0.04 }
                      : { type: 'spring', damping: 14, delay: i * 0.06 }
                    }
                    className={`w-12 h-14 sm:w-14 sm:h-16 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-bold border-2 backdrop-blur-sm ${
                      failed && revealed ? 'bg-red-500/30 border-red-400/50 text-red-200'
                      : revealed ? 'bg-emerald-500/30 border-emerald-400/50 text-white shadow-[0_0_20px_rgba(46,204,113,0.4)]'
                      : 'bg-white/8 border-white/20 text-transparent'
                    }`}
                  >
                    {revealed ? ch : '\u00A0'}
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Streak — pulsing flame effect */}
        <div className="h-8 flex items-center justify-center">
          <AnimatePresence>
            {streakMsg && (
              <motion.p
                initial={{ opacity: 0, scale: 0.5, y: 10 }}
                animate={{ opacity: 1, scale: [1, 1.08, 1], y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -10 }}
                transition={{ type: 'spring', damping: 10 }}
                className="text-amber-300 text-base font-bold drop-shadow-lg"
              >{streakMsg}</motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Keyboard */}
        <div className="mt-auto pb-5 px-1 sm:px-3">
          {KEYBOARD_ROWS.map((row, ri) => (
            <div key={ri} className="flex justify-center gap-[3px] sm:gap-1.5 mb-[5px] sm:mb-2">
              {row.split('').map(ch => {
                const state = game.usedKeys.get(ch);
                const disabled = !!state || game.wordState !== 'playing';
                return (
                  <div key={ch} className="relative">
                    {/* Expanding ring on correct */}
                    {state === 'correct' && (
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0.8 }}
                        animate={{ scale: 2.5, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 rounded-2xl border-2 border-emerald-400 pointer-events-none"
                      />
                    )}
                    <motion.button
                      whileHover={disabled ? {} : { scale: 1.12, y: -3 }}
                      whileTap={disabled ? {} : { scale: 0.85 }}
                      animate={state === 'correct' ? { scale: [1, 1.15, 1] } : state === 'wrong' ? { x: [0, -5, 5, -5, 5, 0] } : {}}
                      transition={state === 'correct' ? { type: 'spring', damping: 8 } : { duration: 0.3 }}
                      onClick={() => pressKey(ch)}
                      disabled={disabled}
                      className={`w-[8.5vw] max-w-[42px] h-[11vw] max-h-[52px] rounded-xl sm:rounded-2xl text-base sm:text-lg font-bold border-2 uppercase relative ${
                        state === 'correct' ? 'bg-emerald-500/50 border-emerald-400/60 text-white shadow-[0_0_14px_rgba(46,204,113,0.5)]'
                        : state === 'wrong' ? 'bg-red-500/30 border-red-400/40 text-red-300/40'
                        : 'bg-white/10 border-white/15 text-white/90 hover:bg-white/18 hover:border-white/30 active:bg-white/25'
                      }`}
                    >
                      {ch}
                    </motion.button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
