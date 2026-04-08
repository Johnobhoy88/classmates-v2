/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 *
 * PREMIUM SPELLING GAME — React + Motion + Canvas + Web Audio
 * Enchanted forest backdrop, spring-animated UI, procedural ambient audio,
 * emoji word hints, glassmorphism keyboard, confetti celebrations
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Zap, Trophy, ArrowLeft, Heart, Volume2, VolumeX } from 'lucide-react';
import { SPELLING, WORD_EMOJI, type SpellingWord, type SpellingLevel } from '../../game/content/spelling-data';
import { recordGameResult } from '../../game/systems/ProgressTracker';
import { useAuth } from '../auth/AuthProvider';
import { calcStars } from '../../utils/stars';
import { shuffle } from '../../utils/shuffle';
import { SpellingForestBg } from './SpellingForestBg';
import { GameBackButton } from '../shared/GameNav';
import {
  startAmbient, stopAmbient, updateAmbientState, resetScale,
  sfxCorrectLetter, sfxWrongLetter, sfxWordComplete, sfxWordFailed,
  sfxStreak, sfxGameComplete, sfxKeyPress, sfxHeartLost,
} from './SpellingAudio';
import type { ForestState } from './SpellingForestBg';

const KEYBOARD_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
const LEVELS = [
  { level: 1 as SpellingLevel, label: 'Easy', desc: '3-letter words', icon: Star, color: 'from-emerald-500 to-teal-600', lives: 7 },
  { level: 2 as SpellingLevel, label: 'Medium', desc: '4-6 letter words', icon: Zap, color: 'from-blue-500 to-indigo-600', lives: 6 },
  { level: 3 as SpellingLevel, label: 'Hard', desc: 'Big words!', icon: Trophy, color: 'from-purple-500 to-pink-600', lives: 5 },
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
  const [result, setResult] = useState<{ correct: number; total: number; stars: number; bestStreak: number; missed: Array<{ w: string; h: string }> } | null>(null);
  const [shake, setShake] = useState(false);
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; color: string }>>([]);
  const [audioOn, setAudioOn] = useState(true);
  const [forestEvent, setForestEvent] = useState<ForestState['event']>('none');
  const savedRef = useRef(false);
  const confettiId = useRef(0);

  // Compute forest state from game state
  const forestState: ForestState = game ? {
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

  // Update ambient audio reactively
  useEffect(() => {
    if (game && audioOn) {
      updateAmbientState(game.lives / game.maxLives, game.streak);
    }
  }, [game?.lives, game?.streak, audioOn]);

  // Start ambient on level select
  useEffect(() => {
    if (level && audioOn) startAmbient(level);
    return () => stopAmbient();
  }, [level, audioOn]);

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

    if (audioOn) sfxKeyPress();

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
      if (audioOn) sfxCorrectLetter();
      setForestEvent('correct');
      const allRevealed = newRevealed.every(Boolean);
      if (allRevealed) {
        // Word complete!
        const newCorrect = game.correct + 1;
        const newStreak = game.streak + 1;
        const newBestStreak = Math.max(game.bestStreak, newStreak);
        setForestEvent('wordComplete');
        if (audioOn) {
          if (newStreak >= 5) sfxStreak();
          else sfxWordComplete();
        }
        // Confetti burst
        const burst = Array.from({ length: 20 }, () => ({
          id: confettiId.current++,
          x: 30 + Math.random() * 40,
          color: ['#2ecc71', '#f1c40f', '#3498db', '#e74c3c', '#9b59b6', '#1abc9c'][Math.floor(Math.random() * 6)],
        }));
        setConfetti(burst);
        setTimeout(() => setConfetti([]), 1200);

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
      if (audioOn) sfxWrongLetter();
      setForestEvent('wrong');
      const newLives = game.lives - 1;
      if (audioOn) sfxHeartLost();
      setShake(true);
      setTimeout(() => setShake(false), 300);

      if (newLives <= 0) {
        // Word failed
        if (audioOn) sfxWordFailed();
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
          if (audioOn) sfxGameComplete();
          setResult({ correct: game.correct, total: game.total, stars, bestStreak: game.bestStreak, missed: game.missed });
        } else {
          const w = game.words[nextIdx].w.toLowerCase();
          resetScale();
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
        <SpellingForestBg state={forestState} />
        <div className="relative z-10 min-h-screen flex flex-col">
          <div className="px-4 pt-4 flex items-center justify-between">
            <GameBackButton onClick={onExit} />
            <button onClick={() => setAudioOn(!audioOn)} className="text-white/40 hover:text-white/70 p-2">
              {audioOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
              <div className="text-6xl mb-3">&#x2728;</div>
              <h2 className="text-3xl font-extrabold text-white mb-2 drop-shadow-lg">Spellbound Forest</h2>
              <p className="text-emerald-300/60 text-sm">Guess the word from the clue!</p>
            </motion.div>
            <div className="flex flex-col gap-4 w-full max-w-xs">
              {LEVELS.map((lv, i) => {
                const Icon = lv.icon;
                return (
                  <motion.button key={lv.level}
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.1 }}
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => startGame(lv.level)}
                    className={`flex items-center gap-4 px-6 py-5 bg-gradient-to-r ${lv.color} rounded-2xl text-white shadow-lg`}
                  >
                    <Icon className="w-7 h-7 flex-shrink-0" />
                    <div className="text-left">
                      <p className="font-bold text-lg">{lv.label}</p>
                      <p className="text-white/70 text-sm">{lv.desc} &middot; {lv.lives} lives</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === RESULTS ===
  if (result) {
    const pct = Math.round((result.correct / result.total) * 100);
    return (
      <div className="min-h-screen relative overflow-hidden">
        <SpellingForestBg state={forestState} />
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
          <motion.div initial={{ opacity: 0, scale: 0.8, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', damping: 15 }}
            className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full text-center border border-white/10"
          >
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3].map(s => (
                <motion.div key={s} initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2 + s * 0.15, type: 'spring', damping: 8 }}
                >
                  <Star className={`w-10 h-10 ${s <= result.stars ? 'text-amber-400 fill-amber-400' : 'text-white/20'}`} />
                </motion.div>
              ))}
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {result.stars >= 3 ? 'Amazing!' : result.stars >= 2 ? 'Great job!' : result.stars >= 1 ? 'Good try!' : 'Keep practising!'}
            </h2>
            <p className="text-emerald-300 text-lg mb-1">{result.correct}/{result.total} correct ({pct}%)</p>
            {result.bestStreak >= 3 && (
              <p className="text-amber-300 text-sm mb-4">{result.bestStreak} words in a row!</p>
            )}
            {result.missed.length > 0 && (
              <div className="text-left mb-6 mt-4">
                <p className="text-white/50 text-xs font-semibold mb-2">Words to practise:</p>
                {result.missed.map((m, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.05 }}
                    className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-2.5 mb-2 border border-white/10"
                  >
                    <span className="text-xl">{getEmoji(m.w)}</span>
                    <div>
                      <span className="text-white font-bold capitalize">{m.w}</span>
                      <span className="text-white/40 text-sm ml-2">— {m.h}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            <div className="flex gap-3 mt-4">
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => { setGame(null); setResult(null); setLevel(null); }}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl"
              >Play Again</motion.button>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => { stopAmbient(); onExit(); }}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20"
              >Back</motion.button>
            </div>
          </motion.div>
        </div>
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

  return (
    <div className="min-h-screen relative overflow-hidden">
      <SpellingForestBg state={forestState} />

      {/* Confetti layer */}
      <div className="fixed inset-0 z-20 pointer-events-none">
        <AnimatePresence>
          {confetti.map(c => (
            <motion.div key={c.id}
              initial={{ y: '40vh', x: `${c.x}%`, scale: 1, opacity: 1 }}
              animate={{ y: '-10vh', scale: 0, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 + Math.random() * 0.5, ease: 'easeOut' }}
              className="absolute w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: c.color }}
            />
          ))}
        </AnimatePresence>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top bar */}
        <div className="px-4 pt-3 flex items-center justify-between">
          <button onClick={() => { stopAmbient(); onExit(); }}
            className="text-white/30 hover:text-white/60 p-2 rounded-lg hover:bg-white/5 flex items-center gap-1.5 text-sm">
            <ArrowLeft className="w-4 h-4" /> Quit
          </button>
          <span className="text-white/30 text-sm font-medium">{game.idx + 1} / {game.total}</span>
          <button onClick={() => { setAudioOn(!audioOn); if (audioOn) stopAmbient(); else startAmbient(); }}
            className="text-white/30 hover:text-white/60 p-2">
            {audioOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

        {/* Hearts + word count */}
        <div className="flex justify-center items-center gap-3 pb-1">
          <div className="flex gap-1.5">
            {Array.from({ length: game.maxLives }, (_, i) => (
              <motion.div key={i}
                animate={i === game.lives ? { scale: [1, 1.5, 0.7, 1], opacity: [1, 1, 0.2, 0.2] } : {}}
                transition={{ duration: 0.35 }}
              >
                <Heart className={`w-6 h-6 ${i < game.lives ? 'text-red-400 fill-red-400 drop-shadow-[0_0_4px_rgba(248,113,113,0.5)]' : 'text-white/15'}`} />
              </motion.div>
            ))}
          </div>
          <span className="text-white/25 text-xs font-medium">{game.idx + 1}/{game.total}</span>
        </div>

        {/* Emoji + Hint — BIGGER */}
        <div className="text-center px-6 pt-3 flex-shrink-0">
          <AnimatePresence mode="wait">
            <motion.div key={game.idx}
              initial={{ opacity: 0, y: 20, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ type: 'spring', damping: 12, stiffness: 150 }}
            >
              {emoji && <div className="text-7xl mb-3 drop-shadow-lg">{emoji}</div>}
              <p className="text-white/80 text-lg font-medium leading-snug max-w-xs mx-auto">{game.words[game.idx].h}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Letter slots — BIGGER */}
        <div className="flex justify-center gap-2 sm:gap-3 px-4 pt-6 pb-2">
          <AnimatePresence mode="wait">
            <motion.div key={game.idx} className="flex gap-2 sm:gap-3"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              {game.word.split('').map((ch, i) => {
                const revealed = game.revealed[i];
                const failed = game.wordState === 'lost';
                return (
                  <motion.div key={`${game.idx}-${i}`}
                    initial={{ scale: 0, rotate: -10 }}
                    animate={shake && !revealed ? {
                      x: [0, -5, 5, -5, 5, 0], scale: 1, rotate: 0,
                    } : {
                      scale: revealed ? [1, 1.2, 1] : 1, rotate: 0, x: 0,
                    }}
                    transition={revealed ? { type: 'spring', damping: 10, delay: i * 0.04 } : { delay: i * 0.05, type: 'spring', damping: 12 }}
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

        {/* Streak */}
        <AnimatePresence>
          {streakMsg && (
            <motion.p initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="text-center text-amber-300 text-base font-bold py-2 drop-shadow-lg"
            >{streakMsg}</motion.p>
          )}
        </AnimatePresence>

        {/* Keyboard — BIGGER */}
        <div className="mt-auto pb-5 px-1 sm:px-3">
          {KEYBOARD_ROWS.map((row, ri) => (
            <div key={ri} className="flex justify-center gap-[3px] sm:gap-1.5 mb-[5px] sm:mb-2">
              {row.split('').map(ch => {
                const state = game.usedKeys.get(ch);
                const disabled = !!state || game.wordState !== 'playing';
                return (
                  <motion.button key={ch}
                    whileHover={disabled ? {} : { scale: 1.12, y: -3 }}
                    whileTap={disabled ? {} : { scale: 0.88 }}
                    animate={state === 'wrong' ? { x: [0, -4, 4, -4, 0] } : {}}
                    onClick={() => pressKey(ch)}
                    disabled={disabled}
                    className={`w-[8.5vw] max-w-[42px] h-[11vw] max-h-[52px] rounded-xl sm:rounded-2xl text-base sm:text-lg font-bold border-2 transition-colors uppercase ${
                      state === 'correct' ? 'bg-emerald-500/50 border-emerald-400/60 text-white shadow-[0_0_12px_rgba(46,204,113,0.4)]'
                      : state === 'wrong' ? 'bg-red-500/30 border-red-400/40 text-red-300/50'
                      : 'bg-white/10 border-white/15 text-white/90 hover:bg-white/18 hover:border-white/30 active:bg-white/25'
                    }`}
                  >
                    {ch}
                  </motion.button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
