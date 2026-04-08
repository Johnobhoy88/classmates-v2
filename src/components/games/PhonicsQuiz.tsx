/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 *
 * PREMIUM PHONICS — Ocean theme, multiple choice with Motion springs
 * Uses shared PremiumQuizShell components
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, Star, Zap, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { PHONICS_DATA, type PhonicsLevel, type PhonicsEntry } from '../../game/content/phonics-data';
import { recordGameResult } from '../../game/systems/ProgressTracker';
import { useAuth } from '../auth/AuthProvider';
import { calcStars } from '../../utils/stars';
import { shuffle } from '../../utils/shuffle';
import { PhonicsOceanBg } from './PhonicsOceanBg';
import {
  startAmbient, stopAmbient, resetScale,
  sfxCorrect, sfxWrong, sfxWordComplete, sfxWordFailed,
  sfxStreak, sfxGameComplete,
} from './PhonicsAudio';
import { GameHeader, ResultsScreen, PremiumLevelSelect, useConfetti, ConfettiLayer } from '../premium';
import type { ThemeState, LevelDef, GameResult } from '../premium';

const LEVELS: LevelDef[] = [
  { level: 1, label: 'Easy', desc: 'Simple sounds', icon: Star, color: 'from-cyan-500 to-blue-600', lives: 7 },
  { level: 2, label: 'Medium', desc: 'Vowel pairs', icon: Zap, color: 'from-blue-500 to-indigo-600', lives: 6 },
  { level: 3, label: 'Hard', desc: 'Complex patterns', icon: Trophy, color: 'from-indigo-500 to-purple-600', lives: 5 },
];

interface Question {
  sound: string;
  answer: string;
  options: string[];
}

function buildQuestions(level: PhonicsLevel): Question[] {
  const entries = shuffle([...PHONICS_DATA[level]]).slice(0, 10);
  return entries.map((e: PhonicsEntry) => {
    const answer = e.words[Math.floor(Math.random() * e.words.length)];
    const distractors = shuffle([...e.wrong]).slice(0, 3);
    return { sound: e.sound, answer, options: shuffle([answer, ...distractors]) };
  });
}

export function PhonicsQuiz({ onExit }: { onExit: () => void }) {
  const { pupil } = useAuth();
  const [level, setLevel] = useState<PhonicsLevel | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [missed, setMissed] = useState<Array<{ w: string; h: string }>>([]);
  const [lives, setLives] = useState(7);
  const [maxLives, setMaxLives] = useState(7);
  const [answered, setAnswered] = useState<string | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const [audioOn, setAudioOn] = useState(true);
  const [themeEvent, setThemeEvent] = useState<ThemeState['event']>('none');
  const savedRef = useRef(false);
  const { pieces: confetti, burst: burstConfetti } = useConfetti();

  const themeState: ThemeState = {
    progress: questions.length > 0 ? idx / questions.length : 0,
    streak,
    livesRatio: maxLives > 0 ? lives / maxLives : 1,
    event: themeEvent,
  };

  useEffect(() => {
    if (themeEvent !== 'none') {
      const t = setTimeout(() => setThemeEvent('none'), 50);
      return () => clearTimeout(t);
    }
  }, [themeEvent]);

  useEffect(() => {
    if (level && audioOn) startAmbient();
    return () => stopAmbient();
  }, [level, audioOn]);

  const toggleAudio = useCallback(() => {
    setAudioOn(prev => { if (prev) stopAmbient(); else startAmbient(); return !prev; });
  }, []);

  function startGame(lv: PhonicsLevel) {
    const lvData = LEVELS.find(l => l.level === lv)!;
    setLevel(lv);
    setQuestions(buildQuestions(lv));
    setIdx(0); setCorrect(0); setStreak(0); setBestStreak(0);
    setMissed([]); setLives(lvData.lives); setMaxLives(lvData.lives);
    setAnswered(null); setResult(null); savedRef.current = false;
    resetScale();
  }

  function selectAnswer(option: string) {
    if (answered) return;
    const q = questions[idx];
    const isCorrect = option === q.answer;
    setAnswered(option);

    if (isCorrect) {
      const newStreak = streak + 1;
      setCorrect(c => c + 1);
      setStreak(newStreak);
      setBestStreak(bs => Math.max(bs, newStreak));
      setThemeEvent('correct');
      if (audioOn) sfxCorrect();
      if (newStreak === 3) toast('3 in a row! \u{1F525}', { duration: 2000 });
      else if (newStreak === 5) toast('5 streak! \u{1F525}\u{1F525}', { duration: 2500 });
    } else {
      setStreak(0);
      setLives(l => l - 1);
      setMissed(m => [...m, { w: q.sound, h: `"${q.sound}" → ${q.answer}` }]);
      setThemeEvent('wrong');
      if (audioOn) sfxWrong();
    }

    // Advance after delay
    setTimeout(() => {
      const nextIdx = idx + 1;
      const newLives = isCorrect ? lives : lives - 1;

      if (nextIdx >= questions.length || newLives <= 0) {
        // Game over
        const finalCorrect = isCorrect ? correct + 1 : correct;
        const pct = finalCorrect / questions.length;
        const stars = calcStars(pct);
        const finalBestStreak = isCorrect ? Math.max(bestStreak, streak + 1) : bestStreak;
        setThemeEvent('gameComplete');
        if (audioOn) sfxGameComplete();
        burstConfetti();
        setResult({ correct: finalCorrect, total: questions.length, stars, bestStreak: finalBestStreak, missed: isCorrect ? missed : [...missed, { w: q.answer, h: `"${q.sound}" → ${q.answer}` }] });
      } else {
        if (isCorrect) {
          setThemeEvent('wordComplete');
          if (audioOn) { if (streak + 1 >= 5) sfxStreak(); else sfxWordComplete(); }
          burstConfetti();
        } else {
          setThemeEvent('wordFailed');
          if (audioOn) sfxWordFailed();
        }
        setIdx(nextIdx);
        setAnswered(null);
        resetScale();
      }
    }, isCorrect ? 600 : 1200);
  }

  // Save result
  useEffect(() => {
    if (result && pupil && !savedRef.current) {
      savedRef.current = true;
      recordGameResult({
        pupilId: pupil.id, gameId: 'phonics', skillId: `level-${level}`,
        score: Math.round((result.correct / result.total) * 100),
        stars: result.stars, streak: 0, bestStreak: result.bestStreak,
        correct: result.correct, total: result.total,
      });
    }
  }, [result, pupil, level]);

  // === LEVEL SELECT ===
  if (!level || (questions.length === 0 && !result)) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <PhonicsOceanBg state={themeState} />
        <PremiumLevelSelect
          title="Sound Reef"
          subtitle="Find the word with the right sound!"
          icon={<Volume2 className="w-14 h-14 text-cyan-300" />}
          levels={LEVELS}
          audioOn={audioOn}
          onToggleAudio={toggleAudio}
          onSelect={(lv) => startGame(lv as PhonicsLevel)}
          onExit={onExit}
        />
      </div>
    );
  }

  // === RESULTS ===
  if (result) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <PhonicsOceanBg state={themeState} />
        <ResultsScreen
          result={result}
          onPlayAgain={() => { setQuestions([]); setResult(null); setLevel(null); }}
          onExit={() => { stopAmbient(); onExit(); }}
        />
      </div>
    );
  }

  // === GAMEPLAY ===
  const q = questions[idx];
  if (!q) return null;

  const streakMsg = streak >= 10 ? `\u{1F525}\u{1F525}\u{1F525} ${streak} on fire!`
    : streak >= 5 ? `\u{1F525}\u{1F525} ${streak} streak!`
    : streak >= 3 ? `\u{1F525} ${streak} in a row!`
    : streak >= 2 ? `\u2B50 ${streak} streak` : '';

  return (
    <div className="min-h-screen relative overflow-hidden">
      <PhonicsOceanBg state={themeState} />
      <ConfettiLayer pieces={confetti} />

      <div className="relative z-10 min-h-screen flex flex-col">
        <GameHeader
          lives={lives} maxLives={maxLives}
          idx={idx} total={questions.length}
          audioOn={audioOn} onToggleAudio={toggleAudio}
          onQuit={() => { stopAmbient(); onExit(); }}
          quitTitle="Leave the reef?"
        />

        {/* Sound prompt */}
        <div className="text-center px-6 pt-4 flex-shrink-0">
          <AnimatePresence mode="wait">
            <motion.div key={idx}
              initial={{ opacity: 0, y: 25, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ type: 'spring', damping: 12, stiffness: 130 }}
            >
              <p className="text-white/60 text-base mb-2">Which word has the sound...</p>
              <div className="inline-block bg-white/10 backdrop-blur-sm border-2 border-cyan-400/40 rounded-2xl px-8 py-4 mb-2">
                <span className="text-4xl sm:text-5xl font-bold text-cyan-300 drop-shadow-lg">"{q.sound}"</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Streak */}
        <div className="h-8 flex items-center justify-center">
          <AnimatePresence>
            {streakMsg && (
              <motion.p initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="text-amber-300 text-base font-bold drop-shadow-lg"
              >{streakMsg}</motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Options — 2x2 grid */}
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="grid grid-cols-2 gap-3 w-full max-w-md">
            <AnimatePresence mode="wait">
              {q.options.map((opt, i) => {
                let btnStyle = 'bg-white/10 border-white/15 text-white hover:bg-white/15 hover:border-white/25';
                if (answered) {
                  if (opt === q.answer) {
                    btnStyle = 'bg-emerald-500/40 border-emerald-400/60 text-white shadow-[0_0_20px_rgba(46,204,113,0.3)]';
                  } else if (opt === answered) {
                    btnStyle = 'bg-red-500/30 border-red-400/50 text-red-200';
                  } else {
                    btnStyle = 'bg-white/5 border-white/5 text-white/30';
                  }
                }
                return (
                  <motion.button key={`${idx}-${i}`}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={
                      answered && opt === q.answer ? { opacity: 1, y: 0, scale: [1, 1.08, 1] }
                      : answered && opt === answered && opt !== q.answer ? { opacity: 1, y: 0, scale: 1, x: [0, -4, 4, -4, 0] }
                      : { opacity: 1, y: 0, scale: 1 }
                    }
                    transition={{ type: 'spring', damping: 12, delay: i * 0.06 }}
                    onClick={() => selectAnswer(opt)}
                    disabled={!!answered}
                    className={`px-4 py-5 rounded-2xl border-2 font-bold text-lg backdrop-blur-sm transition-colors ${btnStyle} ${
                      answered ? 'cursor-default' : 'active:scale-95'
                    }`}
                  >
                    {opt}
                    {answered && opt === q.answer && ' \u2714'}
                    {answered && opt === answered && opt !== q.answer && ' \u2718'}
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Wrong answer feedback */}
        <AnimatePresence>
          {answered && answered !== q.answer && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center text-red-300/80 text-sm pb-6 px-4"
            >
              The answer was <strong className="text-white">{q.answer}</strong>
            </motion.p>
          )}
        </AnimatePresence>

        <div className="pb-6" />
      </div>
    </div>
  );
}
