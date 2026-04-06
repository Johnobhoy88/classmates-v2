import { useState, useCallback, useEffect } from 'react';
import { sfxCorrect, sfxWrong, sfxStreak, sfxLevelUp } from '../../game/systems/AudioSystem';
import { recordGameResult } from '../../game/systems/ProgressTracker';
import { useAuth } from '../auth/AuthProvider';

// ============================================================
// QUIZ ENGINE — Shared component for all Tier 1 Duolingo-style games
// Faithfully replicates V1 app.js quiz flow: question → options →
// feedback → streak → next → results with stars/missed/coins
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
  /** Color for results icon background (hex like '#f7971e') */
  color: string;
  /** Emoji or short text for results icon */
  icon: string;
  /** Questions to present */
  questions: QuizQuestion[];
  /** Topic for adaptive difficulty tracking */
  adaptiveTopic?: string;
  /** Delay ms after correct answer (default 500) */
  correctDelay?: number;
  /** Delay ms after wrong answer (default 1000) */
  wrongDelay?: number;
}

interface QuizResult {
  correct: number;
  total: number;
  stars: number;
  bestStreak: number;
  missed: Array<{ w: string; h: string }>;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface QuizEngineProps {
  config: QuizConfig;
  onExit: () => void;
}

export function QuizEngine({ config, onExit }: QuizEngineProps) {
  const { pupil } = useAuth();
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [missed, setMissed] = useState<Array<{ w: string; h: string }>>([]);
  const [answered, setAnswered] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);

  const q = config.questions[idx];
  const total = config.questions.length;
  const correctDelay = config.correctDelay ?? 500;
  const wrongDelay = config.wrongDelay ?? 1000;

  // Shuffle options when question changes
  useEffect(() => {
    if (q) setShuffledOptions(shuffle(q.options));
  }, [idx, q]);

  const finishGame = useCallback((finalCorrect: number, finalBestStreak: number, finalMissed: Array<{ w: string; h: string }>) => {
    const pct = finalCorrect / total;
    const stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : pct >= 0.3 ? 1 : 0;

    if (stars >= 3) sfxLevelUp();
    else if (stars >= 1) sfxStreak();

    // Save progress
    if (pupil) {
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
  }, [total, pupil, config.gameId, config.adaptiveTopic]);

  const selectAnswer = useCallback((optIdx: number) => {
    if (answered || !q) return;
    setAnswered(true);
    setSelectedIdx(optIdx);

    const chosen = shuffledOptions[optIdx];
    const isCorrect = chosen === q.answer;

    let newCorrect = correct;
    let newStreak = streak;
    let newBestStreak = bestStreak;
    let newMissed = missed;

    if (isCorrect) {
      newCorrect = correct + 1;
      newStreak = streak + 1;
      newBestStreak = Math.max(bestStreak, newStreak);
      sfxCorrect();
      if (newStreak >= 5) sfxLevelUp();
      else if (newStreak >= 3) sfxStreak();
    } else {
      newStreak = 0;
      newMissed = [...missed, { w: q.prompt, h: q.answer }];
      sfxWrong();
    }

    setCorrect(newCorrect);
    setStreak(newStreak);
    setBestStreak(newBestStreak);
    setMissed(newMissed);

    setTimeout(() => {
      const nextIdx = idx + 1;
      if (nextIdx >= total) {
        finishGame(newCorrect, newBestStreak, newMissed);
      } else {
        setIdx(nextIdx);
        setAnswered(false);
        setSelectedIdx(null);
      }
    }, isCorrect ? correctDelay : wrongDelay);
  }, [answered, q, shuffledOptions, correct, streak, bestStreak, missed, idx, total, correctDelay, wrongDelay, finishGame]);

  // Results screen
  if (result) {
    const pct = Math.round((result.correct / result.total) * 100);
    const starEmojis = '\u2B50'.repeat(result.stars) + '\u2606'.repeat(3 - result.stars);

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: `linear-gradient(to bottom, #0f172a, ${config.color}30)` }}>
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full text-center border border-white/20">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4" style={{ background: `linear-gradient(135deg, ${config.color}, ${config.color}99)` }}>
            {config.icon}
          </div>
          <div className="text-3xl mb-3">{starEmojis}</div>
          <h2 className="text-xl font-bold text-white mb-1">{config.title}</h2>
          <p className="text-white/60 text-sm mb-4">{config.subtitle}</p>
          <p className="text-emerald-300 text-lg mb-1">{result.correct}/{result.total} correct ({pct}%)</p>
          <p className="text-white/40 text-sm mb-6">
            {result.stars >= 3 ? 'Amazing work!' : result.stars >= 2 ? 'Great job!' : result.stars >= 1 ? 'Good try!' : 'Keep practising!'}
          </p>

          {result.bestStreak >= 3 && (
            <p className="text-amber-300 text-sm mb-4">{result.bestStreak} in a row!</p>
          )}

          {result.missed.length > 0 && (
            <div className="text-left mb-6">
              <p className="text-white/60 text-xs font-semibold mb-2">Missed:</p>
              {result.missed.map((m, i) => (
                <div key={i} className="bg-white/5 rounded-lg px-3 py-2 mb-1.5 border border-white/10 text-sm">
                  <span className="text-white font-semibold">{m.w}</span>
                  <span className="text-white/40 ml-2">— {m.h}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => { setResult(null); setIdx(0); setCorrect(0); setStreak(0); setBestStreak(0); setMissed([]); setAnswered(false); setSelectedIdx(null); }}
              className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl">
              Play Again
            </button>
            <button onClick={onExit}
              className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20">
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!q) return null;

  // Question screen
  return (
    <div className="min-h-screen flex flex-col" style={{ background: `linear-gradient(to bottom, #0f172a, ${config.color}15)` }}>
      {/* Top bar */}
      <div className="px-4 pt-4 flex items-center justify-between">
        <button onClick={onExit} className="text-white/40 hover:text-white/70 text-sm font-semibold px-3 py-2 rounded-lg hover:bg-white/5">
          &larr; Back
        </button>
        <span className="text-white/30 text-sm">{idx + 1}/{total}</span>
      </div>

      {/* Progress bar */}
      <div className="px-4 pt-2 pb-4">
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(idx / total) * 100}%`, backgroundColor: config.color }} />
        </div>
      </div>

      {/* Streak */}
      {streak >= 2 && (
        <div className="text-center mb-2">
          <span className="text-amber-300 text-sm font-bold animate-pulse">
            {streak >= 5 ? `\u{1F525}\u{1F525} ${streak}!` : streak >= 3 ? `\u{1F525} ${streak} in a row!` : `\u2B50 ${streak} streak`}
          </span>
        </div>
      )}

      {/* Question content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 max-w-lg mx-auto w-full">
        {/* Prompt */}
        <p className="text-white/70 text-center text-sm mb-3">{q.prompt}</p>

        {/* Display (large word/number/etc.) */}
        {q.display && (
          <p className="text-3xl font-bold text-center mb-6" style={{ color: config.color }}>
            {q.display}
          </p>
        )}

        {/* HTML display (SVG shapes, etc.) */}
        {q.displayHtml && (
          <div className="mb-6 flex justify-center" dangerouslySetInnerHTML={{ __html: q.displayHtml }} />
        )}

        {/* Options */}
        <div className="grid grid-cols-2 gap-3 w-full">
          {shuffledOptions.map((opt, i) => {
            let btnClass = 'bg-white/10 border-white/15 hover:bg-white/15 hover:border-white/25 text-white';
            if (answered) {
              if (opt === q.answer) {
                btnClass = 'bg-emerald-500/30 border-emerald-400 text-emerald-200';
              } else if (i === selectedIdx) {
                btnClass = 'bg-red-500/30 border-red-400 text-red-200';
              } else {
                btnClass = 'bg-white/5 border-white/5 text-white/30';
              }
            }

            return (
              <button
                key={i}
                onClick={() => selectAnswer(i)}
                disabled={answered}
                className={`px-4 py-4 rounded-2xl border-2 font-semibold text-base transition-all ${btnClass} ${
                  answered ? 'cursor-default' : 'active:scale-95'
                }`}
              >
                {opt}
                {answered && opt === q.answer && ' \u2714'}
                {answered && i === selectedIdx && opt !== q.answer && streak >= 0 && ' \u2718'}
              </button>
            );
          })}
        </div>

        {/* Wrong answer feedback */}
        {answered && selectedIdx !== null && shuffledOptions[selectedIdx] !== q.answer && (
          <p className="text-red-300/80 text-sm mt-4 text-center">
            The answer was <strong className="text-white">{q.answer}</strong>
          </p>
        )}
      </div>
    </div>
  );
}
