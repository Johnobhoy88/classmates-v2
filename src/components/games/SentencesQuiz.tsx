/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 *
 * SENTENCES QUIZ — Premium rebuild: tap words into correct sentence order.
 * Motion animations, AudioEngine, Phaser forest background, ResultsScreen.
 * CfE: LIT 1-11a (creating texts), ENG 1-12a (grammar and punctuation)
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { SENTENCES, type PunctLevel } from '../../game/content/punctuation-data';
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

export function SentencesQuiz({ onExit }: { onExit: () => void }) {
  const { pupil } = useAuth();
  const [level, setLevel] = useState<PunctLevel | null>(null);
  const [sentences, setSentences] = useState<string[]>([]);
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

  const startGame = useCallback((lv: PunctLevel) => {
    setLevel(lv);
    const sents = shuffle([...SENTENCES[lv]]).slice(0, total);
    setSentences(sents);
    setPool(shuffle([...sents[0].split(' ')]));
    setAns([]); setIdx(0); setCorrect(0); setStreak(0); setBestStreak(0);
    setMissed([]); setDone(false);
    if (!muted && !musicStarted.current) { startMusic(THEME_FOREST); musicStarted.current = true; }
  }, [muted]);

  useEffect(() => () => { stopMusic(); musicStarted.current = false; }, []);
  useEffect(() => { if (!muted) updateMusic(streak); }, [streak, muted]);

  function tapPool(i: number) {
    if (locked) return;
    if (!muted) sfxClick();
    const newPool = [...pool]; const word = newPool.splice(i, 1)[0];
    const newAns = [...ans, word];
    setPool(newPool); setAns(newAns);
    if (newPool.length === 0) check(newAns);
  }

  function tapAns(i: number) {
    if (locked) return;
    if (!muted) sfxClick();
    const newAns = [...ans]; const word = newAns.splice(i, 1)[0];
    setAns(newAns); setPool([...pool, word]);
  }

  function check(attempt: string[]) {
    const original = sentences[idx];
    const ok = attempt.join(' ') === original;
    setLocked(true); setFlash(ok ? 'correct' : 'wrong');
    if (ok) {
      const ns = streak + 1;
      setCorrect(c => c + 1); setStreak(ns);
      if (ns > bestStreak) setBestStreak(ns);
      if (!muted) sfxCoin();
      if (ns === 3) { if (!muted) sfxLevelUp(getScale()); toast('3 in a row! 🔥'); }
      if (ns === 5) { if (!muted) sfxLevelUp(getScale()); toast('5 streak — amazing! 🔥🔥'); }
      if (ns === 10) { if (!muted) sfxFanfare(getScale()); toast('10 IN A ROW! 🔥🔥🔥'); burst(30); }
      setThemeState({ progress: (idx + 1) / total, streak: ns, livesRatio: 1, event: 'correct' });
      setTimeout(advance, 700);
    } else {
      setStreak(0);
      if (!muted) sfxBuzz();
      setMissed(m => [...m, { w: original, h: 'Correct order' }]);
      setThemeState({ progress: (idx + 1) / total, streak: 0, livesRatio: 1, event: 'wrong' });
      setTimeout(advance, 2000);
    }
  }

  function advance() {
    setLocked(false); setFlash(null);
    if (idx + 1 >= sentences.length) {
      setDone(true); stopMusic(); musicStarted.current = false;
      const stars = calcStars(correct / total);
      if (!muted) { stars >= 2 ? sfxFanfare(getScale()) : sfxComplete(getScale()); }
      if (stars >= 2) burst(25);
      if (pupil) recordGameResult({ pupilId: pupil.id, gameId: 'sentence', score: Math.round((correct / total) * 100), stars, streak: 0, bestStreak, correct, total });
      return;
    }
    const next = idx + 1; setIdx(next);
    setPool(shuffle([...sentences[next].split(' ')])); setAns([]);
    setThemeState({ progress: (next) / total, streak, livesRatio: 1, event: 'none' });
  }

  if (!level) return <LevelSelect title="Sentences" color="#e17055" icon="1 2 3" onSelect={(lv) => startGame(lv as PunctLevel)} onBack={onExit} />;

  if (done) {
    const stars = calcStars(correct / total);
    return (
      <div className="min-h-screen relative">
        <QuizWorld theme="forest" state={themeState} />
        <ResultsScreen result={{ correct, total, stars, bestStreak, missed }} onPlayAgain={() => setLevel(null)} onExit={onExit} />
        <ConfettiLayer pieces={pieces} />
      </div>
    );
  }

  if (sentences.length === 0) return null;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <QuizWorld theme="forest" state={themeState} />
      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="px-4 pt-4 flex items-center justify-between">
          <GameBackButton onClick={onExit} />
          <span className="text-white/60 text-sm font-medium">{idx + 1} / {total}</span>
          <button onClick={() => setMuted(!muted)} className="p-2 text-white/40 hover:text-white/70">{muted ? '🔇' : '🔊'}</button>
        </div>

        <div className="px-4 pt-2">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div className="h-full bg-orange-500 rounded-full" animate={{ width: `${(idx / total) * 100}%` }} transition={{ type: 'spring', stiffness: 100 }} />
          </div>
        </div>

        <AnimatePresence>
          {streak >= 2 && (
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className="text-center mt-2">
              <span className="text-amber-300 text-sm font-bold drop-shadow-lg">{streakMessage(streak)}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col items-center justify-center px-4 max-w-lg mx-auto w-full gap-5">
          <motion.p key={idx} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-white/50 text-sm">
            Put the words in the right order
          </motion.p>

          {/* Answer area */}
          <motion.div
            animate={flash === 'wrong' ? { x: [-6, 6, -4, 4, 0] } : {}}
            className={`flex gap-2 flex-wrap justify-center min-h-[56px] p-3 rounded-2xl border-2 w-full transition-colors ${
              flash === 'correct' ? 'border-emerald-400 bg-emerald-500/10' : flash === 'wrong' ? 'border-red-400 bg-red-500/10' : 'border-white/15 bg-white/5'
            }`}
          >
            <AnimatePresence>
              {ans.map((word, i) => (
                <motion.button
                  key={`a-${idx}-${i}-${word}`}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  onClick={() => tapAns(i)}
                  className="px-4 py-2.5 rounded-xl bg-orange-500/30 border border-orange-400/40 text-white font-semibold text-sm active:scale-90 transition-all shadow-md"
                >
                  {word}
                </motion.button>
              ))}
            </AnimatePresence>
            {ans.length === 0 && <span className="text-white/20 text-sm self-center">Tap words below...</span>}
          </motion.div>

          {/* Feedback */}
          <AnimatePresence>
            {flash && (
              <motion.p initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className={`text-sm font-bold drop-shadow-lg text-center ${flash === 'correct' ? 'text-emerald-300' : 'text-red-300'}`}>
                {flash === 'correct' ? '✓ Correct!' : sentences[idx]}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Word pool */}
          <div className="flex gap-2 flex-wrap justify-center">
            <AnimatePresence>
              {pool.map((word, i) => (
                <motion.button
                  key={`p-${idx}-${i}-${word}`}
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20, delay: i * 0.03 }}
                  onClick={() => tapPool(i)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white font-semibold text-sm hover:bg-white/20 active:scale-90 transition-all shadow-lg backdrop-blur-sm"
                >
                  {word}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <ConfettiLayer pieces={pieces} />
    </div>
  );
}
