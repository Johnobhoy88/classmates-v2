/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 *
 * QUIZ ENGINE — Premium shared component for all quiz-format games
 * Full stack: Phaser 3 background (particles, tweens, camera, mascot)
 *           + Motion spring animations + AudioEngine (dynamic music + SFX)
 *           + Radix UI (quit dialog, tooltips) + Sonner (streak toasts)
 *           + GameHeader (animated hearts) + ResultsScreen (star animations)
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';
import { recordGameResult } from '../../game/systems/ProgressTracker';
import { useAuth } from '../auth/AuthProvider';
import { sanitizeHtml } from '../../utils/sanitize';
import { shuffle } from '../../utils/shuffle';
import { calcStars } from '../../utils/stars';
import { QuizWorld, type QuizTheme } from './QuizWorld';
import { GameBackButton, streakMessage } from './GameNav';
import {
  GameHeader, ResultsScreen, useConfetti, ConfettiLayer,
  sfxCoin, sfxBuzz, sfxComplete, sfxFail, sfxLevelUp, sfxFanfare, sfxHeartLost, sfxClick,
  startMusic, stopMusic, updateMusic, getScale,
  THEME_FOREST, THEME_COSMOS, THEME_EARTH,
} from '../premium';
import type { ThemeState, GameResult } from '../premium';

// ============================================================
// INTERFACES
// ============================================================

export interface QuizQuestion {
  /** Text shown as the question prompt */
  prompt: string;
  /** Optional display content (word, SVG, etc.) shown large */
  display?: string;
  /** Optional HTML content (for SVG shapes, bar charts, etc.) */
  displayHtml?: string;
  /** The correct answer text */
  answer: string;
  /** Array of option strings (including the correct one) */
  options: string[];
}

export interface QuizConfig {
  gameId: string;
  title: string;
  subtitle: string;
  /** Color for progress bar and display accent (hex like '#f7971e') */
  color: string;
  /** Emoji or short text for results icon */
  icon: string;
  /** Questions to present */
  questions: QuizQuestion[];
  /** Topic for adaptive difficulty tracking */
  adaptiveTopic?: string;
  /** Delay ms after correct answer (default 600) */
  correctDelay?: number;
  /** Delay ms after wrong answer (default 1200) */
  wrongDelay?: number;
  /** Visual theme: forest (literacy), cosmos (numeracy), earth (geography) */
  theme?: QuizTheme;
  /** Number of lives — omit for unlimited (no hearts shown) */
  lives?: number;
}

interface QuizEngineProps {
  config: QuizConfig;
  onExit: () => void;
}

// Music theme mapping
const MUSIC_MAP = {
  forest: THEME_FOREST,
  cosmos: THEME_COSMOS,
  earth: THEME_EARTH,
};

// ============================================================
// QUIZ ENGINE COMPONENT
// ============================================================

export function QuizEngine({ config, onExit }: QuizEngineProps) {
  const { pupil } = useAuth();

  // Game state
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [missed, setMissed] = useState<GameResult['missed']>([]);
  const [answered, setAnswered] = useState<string | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);

  // Premium state
  const [audioOn, setAudioOn] = useState(true);
  const [lives, setLives] = useState(config.lives ?? Infinity);
  const [themeEvent, setThemeEvent] = useState<ThemeState['event']>('none');
  const savedRef = useRef(false);
  const { pieces: confetti, burst: burstConfetti } = useConfetti();

  // Derived
  const theme = config.theme ?? 'forest';
  const hasLives = config.lives != null && isFinite(config.lives);
  const maxLives = config.lives ?? 0;
  const q = config.questions[idx];
  const total = config.questions.length;
  const correctDelay = config.correctDelay ?? 600;
  const wrongDelay = config.wrongDelay ?? 1200;

  // Theme state for Phaser background
  const themeState: ThemeState = {
    progress: total > 0 ? idx / total : 0,
    streak,
    livesRatio: hasLives ? lives / maxLives : 1,
    event: themeEvent,
  };

  // ============================================================
  // EFFECTS
  // ============================================================

  // Clear theme event after Phaser processes it
  useEffect(() => {
    if (themeEvent !== 'none') {
      const t = setTimeout(() => setThemeEvent('none'), 80);
      return () => clearTimeout(t);
    }
  }, [themeEvent]);

  // Dynamic music — start on mount, stop on unmount
  useEffect(() => {
    if (audioOn) startMusic(MUSIC_MAP[theme]);
    return () => stopMusic();
  }, [audioOn, theme]);

  // Music tempo scales with streak
  useEffect(() => {
    if (audioOn) updateMusic(streak);
  }, [streak, audioOn]);

  // Shuffle options when question changes
  useEffect(() => {
    if (q) setShuffledOptions(shuffle(q.options));
  }, [idx, q]);

  // ============================================================
  // HANDLERS
  // ============================================================

  const toggleAudio = useCallback(() => {
    setAudioOn(prev => {
      if (prev) stopMusic(); else startMusic(MUSIC_MAP[theme]);
      return !prev;
    });
  }, [theme]);

  const finishGame = useCallback((finalCorrect: number, finalBestStreak: number, finalMissed: GameResult['missed']) => {
    const pct = finalCorrect / total;
    const stars = calcStars(pct);

    setThemeEvent('gameComplete');
    if (audioOn) sfxFanfare(getScale());
    burstConfetti(40);

    if (pupil && !savedRef.current) {
      savedRef.current = true;
      recordGameResult({
        pupilId: pupil.id,
        gameId: config.gameId,
        skillId: config.adaptiveTopic,
        score: Math.round(pct * 100),
        stars,
        streak: 0,
        bestStreak: finalBestStreak,
        correct: finalCorrect,
        total,
      });
    }

    setResult({ correct: finalCorrect, total, stars, bestStreak: finalBestStreak, missed: finalMissed });
  }, [total, pupil, config.gameId, config.adaptiveTopic, audioOn, burstConfetti]);

  const selectAnswer = useCallback((optIdx: number) => {
    if (answered != null || !q) return;
    const chosen = shuffledOptions[optIdx];
    const isCorrect = chosen === q.answer;
    setAnswered(chosen);
    if (audioOn) sfxClick();

    let newCorrect = correct;
    let newStreak = streak;
    let newBestStreak = bestStreak;
    let newMissed = missed;
    let newLives = lives;

    if (isCorrect) {
      newCorrect = correct + 1;
      newStreak = streak + 1;
      newBestStreak = Math.max(bestStreak, newStreak);
      setThemeEvent('correct');
      if (audioOn) sfxCoin();
      burstConfetti(10);
      if (newStreak === 3) toast('3 in a row! \u{1F525}', { duration: 2000 });
      else if (newStreak === 5) toast('5 streak! \u{1F525}\u{1F525}', { duration: 2500 });
      else if (newStreak === 10) toast('10 STREAK! \u{1F525}\u{1F525}\u{1F525}', { duration: 3000 });
    } else {
      newStreak = 0;
      newMissed = [...missed, { w: q.prompt, h: q.answer }];
      setThemeEvent('wrong');
      if (audioOn) { sfxBuzz(); if (hasLives) sfxHeartLost(); }
      if (hasLives) { newLives = lives - 1; setLives(newLives); }
    }

    setCorrect(newCorrect);
    setStreak(newStreak);
    setBestStreak(newBestStreak);
    setMissed(newMissed);

    setTimeout(() => {
      const nextIdx = idx + 1;
      if (nextIdx >= total || (hasLives && newLives <= 0)) {
        finishGame(newCorrect, newBestStreak, newMissed);
      } else {
        setThemeEvent(isCorrect ? 'wordComplete' : 'wordFailed');
        if (audioOn) {
          if (isCorrect) {
            if (newStreak >= 5) sfxLevelUp(getScale());
            else sfxComplete(getScale());
          } else {
            sfxFail(getScale());
          }
        }
        setIdx(nextIdx);
        setAnswered(null);
      }
    }, isCorrect ? correctDelay : wrongDelay);
  }, [answered, q, shuffledOptions, correct, streak, bestStreak, missed, idx, total,
      correctDelay, wrongDelay, finishGame, lives, hasLives, audioOn, burstConfetti]);

  const handleQuit = useCallback(() => { stopMusic(); onExit(); }, [onExit]);

  const handlePlayAgain = useCallback(() => {
    setResult(null); setIdx(0); setCorrect(0); setStreak(0); setBestStreak(0);
    setMissed([]); setAnswered(null); setLives(config.lives ?? Infinity);
    savedRef.current = false;
  }, [config.lives]);

  // ============================================================
  // RESULTS SCREEN
  // ============================================================

  if (result) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <QuizWorld theme={theme} state={themeState} />
        <ConfettiLayer pieces={confetti} />
        <ResultsScreen
          result={result}
          onPlayAgain={handlePlayAgain}
          onExit={handleQuit}
        />
      </div>
    );
  }

  if (!q) return null;

  // ============================================================
  // GAMEPLAY SCREEN
  // ============================================================

  const streakMsg = streakMessage(streak);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Phaser background — particles, tweens, camera effects, mascot */}
      <QuizWorld theme={theme} state={themeState} />
      {/* DOM confetti layer */}
      <ConfettiLayer pieces={confetti} />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header — hearts + quit dialog (Radix) or simple nav */}
        {hasLives ? (
          <GameHeader
            lives={lives} maxLives={maxLives}
            idx={idx} total={total}
            audioOn={audioOn} onToggleAudio={toggleAudio}
            onQuit={handleQuit}
          />
        ) : (
          <div className="px-4 pt-3 flex items-center justify-between">
            <GameBackButton onClick={handleQuit} />
            <span className="text-white/30 text-sm font-medium">{idx + 1}/{total}</span>
            <button onClick={toggleAudio} className="text-white/30 hover:text-white/60 p-2 rounded-lg hover:bg-white/5">
              {audioOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        )}

        {/* Progress bar — animated with Motion spring */}
        <div className="px-4 pt-1 pb-2">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: config.color }}
              animate={{ width: `${(idx / total) * 100}%` }}
              transition={{ type: 'spring', damping: 15, stiffness: 100 }}
            />
          </div>
        </div>

        {/* Streak badge — Motion scale pop */}
        <div className="h-8 flex items-center justify-center">
          <AnimatePresence>
            {streakMsg && (
              <motion.p
                key={streak}
                initial={{ opacity: 0, scale: 0.5, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', damping: 10 }}
                className="text-amber-300 text-sm font-bold drop-shadow-lg"
              >
                {streakMsg}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Question content — Motion AnimatePresence for smooth transitions */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 max-w-lg mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30, scale: 0.88 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 14, stiffness: 120 }}
              className="w-full text-center"
            >
              {/* Prompt */}
              <p className="text-white/70 text-center text-sm mb-3">{q.prompt}</p>

              {/* Display — word/number shown large with glassmorphic card */}
              {q.display && (
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 8 }}
                  className="inline-block bg-white/8 backdrop-blur-sm border-2 border-white/15 rounded-2xl px-8 py-4 mb-5"
                >
                  <span className="text-3xl sm:text-4xl font-bold drop-shadow-lg" style={{ color: config.color }}>
                    {q.display}
                  </span>
                </motion.div>
              )}

              {/* HTML display — SVG shapes, bar charts, etc. */}
              {q.displayHtml && (
                <div className="mb-5 flex justify-center" dangerouslySetInnerHTML={{ __html: sanitizeHtml(q.displayHtml) }} />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Answer options — 2x2 grid with Motion spring animations */}
          <div className="grid grid-cols-2 gap-3 w-full">
            {shuffledOptions.map((opt, i) => {
              let btnStyle = 'bg-white/10 border-white/15 text-white hover:bg-white/15 hover:border-white/25';
              if (answered != null) {
                if (opt === q.answer) {
                  btnStyle = 'bg-emerald-500/40 border-emerald-400/60 text-white shadow-[0_0_20px_rgba(46,204,113,0.3)]';
                } else if (opt === answered) {
                  btnStyle = 'bg-red-500/30 border-red-400/50 text-red-200';
                } else {
                  btnStyle = 'bg-white/5 border-white/5 text-white/30';
                }
              }

              return (
                <motion.button
                  key={`${idx}-${i}`}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={
                    answered != null && opt === q.answer
                      ? { opacity: 1, y: 0, scale: [1, 1.08, 1] }
                      : answered != null && opt === answered && opt !== q.answer
                      ? { opacity: 1, y: 0, scale: 1, x: [0, -5, 5, -5, 0] }
                      : { opacity: 1, y: 0, scale: 1 }
                  }
                  transition={{ type: 'spring', damping: 12, delay: i * 0.05 }}
                  onClick={() => selectAnswer(i)}
                  disabled={answered != null}
                  className={`px-4 py-5 rounded-2xl border-2 font-bold text-lg backdrop-blur-sm transition-colors ${btnStyle} ${
                    answered != null ? 'cursor-default' : 'active:scale-95'
                  }`}
                >
                  {opt}
                  {answered != null && opt === q.answer && ' \u2714'}
                  {answered != null && opt === answered && opt !== q.answer && ' \u2718'}
                </motion.button>
              );
            })}
          </div>

          {/* Wrong answer feedback — slides in with Motion */}
          <AnimatePresence>
            {answered != null && answered !== q.answer && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-red-300/80 text-sm mt-4 text-center"
              >
                The answer was <strong className="text-white">{q.answer}</strong>
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="pb-6" />
      </div>
    </div>
  );
}
