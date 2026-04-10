/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 *
 * DICTATION QUIZ — Premium: listen to speech synthesis, type the word.
 * Motion animations, AudioEngine, Phaser forest background, ResultsScreen.
 * CfE: LIT 1-02a (listening and talking), LIT 1-13a (spelling patterns)
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
  sfxCoin, sfxBuzz, sfxComplete, sfxClick, sfxFanfare, sfxLevelUp,
  startMusic, stopMusic, updateMusic, getScale,
  THEME_FOREST,
} from '../premium';
import type { ThemeState } from '../premium';

export function DictationQuiz({ onExit }: { onExit: () => void }) {
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
  const [speaking, setSpeaking] = useState(false);
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
    if (!muted && !musicStarted.current) { startMusic(THEME_FOREST); musicStarted.current = true; }
  }, [muted]);

  useEffect(() => () => { stopMusic(); musicStarted.current = false; }, []);
  useEffect(() => { if (!muted) updateMusic(streak); }, [streak, muted]);

  function speakWord() {
    if (!window.speechSynthesis || !words[idx]) return;
    window.speechSynthesis.cancel();
    setSpeaking(true);
    const u = new SpeechSynthesisUtterance(words[idx].w);
    u.rate = 0.8; u.pitch = 1.1; u.lang = 'en-GB';
    u.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  }

  useEffect(() => {
    if (words.length > 0 && idx < words.length) {
      setTimeout(speakWord, 400);
      inputRef.current?.focus();
    }
  }, [idx, words.length]);

  function check() {
    const val = input.trim().toLowerCase();
    const word = words[idx].w.toLowerCase();
    if (!val) return;
    if (!muted) sfxClick();

    if (val === word) {
      const ns = streak + 1;
      setCorrect(c => c + 1); setStreak(ns);
      if (ns > bestStreak) setBestStreak(ns);
      setFlash('correct');
      if (!muted) sfxCoin();
      if (ns === 3) { if (!muted) sfxLevelUp(getScale()); toast('3 in a row! 🔥'); }
      if (ns === 5) { if (!muted) sfxLevelUp(getScale()); toast('5 streak — amazing! 🔥🔥'); }
      if (ns === 10) { if (!muted) sfxFanfare(getScale()); toast('10 IN A ROW! 🔥🔥🔥'); burst(30); }
      setThemeState({ progress: (idx + 1) / total, streak: ns, livesRatio: 1, event: 'correct' });
      setTimeout(advance, 600);
    } else {
      setStreak(0); setFlash('wrong');
      if (!muted) sfxBuzz();
      setMissed(m => [...m, { w: word, h: words[idx].h }]);
      setThemeState({ progress: (idx + 1) / total, streak: 0, livesRatio: 1, event: 'wrong' });
      setTimeout(advance, 1400);
    }
  }

  function advance() {
    setInput(''); setFlash(null);
    if (idx + 1 >= words.length) {
      setDone(true); stopMusic(); musicStarted.current = false;
      const stars = calcStars(correct / total);
      if (!muted) { stars >= 2 ? sfxFanfare(getScale()) : sfxComplete(getScale()); }
      if (stars >= 2) burst(25);
      if (pupil) recordGameResult({ pupilId: pupil.id, gameId: 'dictation', score: Math.round((correct / total) * 100), stars, streak: 0, bestStreak, correct, total });
      return;
    }
    setIdx(i => i + 1);
    setThemeState({ progress: (idx + 2) / total, streak, livesRatio: 1, event: 'none' });
  }

  if (!level) return <LevelSelect title="Dictation" color="#6a0572" icon="🔊" onSelect={(lv) => startGame(lv as 1 | 2 | 3)} onBack={onExit} />;

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

  if (words.length === 0) return null;

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
            <motion.div className="h-full bg-purple-500 rounded-full" animate={{ width: `${(idx / total) * 100}%` }} transition={{ type: 'spring', stiffness: 100 }} />
          </div>
        </div>

        <AnimatePresence>
          {streak >= 2 && (
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className="text-center mt-2">
              <span className="text-amber-300 text-sm font-bold drop-shadow-lg">{streakMessage(streak)}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col items-center justify-end pb-8 px-4 max-w-md mx-auto w-full gap-4">
          <motion.p key={idx} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-white/50 text-sm">
            Listen and type the word
          </motion.p>

          <motion.button
            onClick={speakWord}
            whileTap={{ scale: 0.9 }}
            animate={speaking ? { scale: [1, 1.15, 1], transition: { repeat: Infinity, duration: 0.6 } } : {}}
            className="text-6xl drop-shadow-xl"
          >
            🔊
          </motion.button>

          <p className="text-white/40 text-sm">{words[idx].h}</p>

          <motion.input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && check()}
            animate={flash === 'wrong' ? { x: [-6, 6, -4, 4, 0] } : {}}
            className={`w-full px-4 py-4 rounded-2xl text-center text-2xl font-bold bg-white/10 backdrop-blur-sm border-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-colors ${
              flash === 'correct' ? 'border-emerald-400 bg-emerald-500/10' : flash === 'wrong' ? 'border-red-400 bg-red-500/10' : 'border-white/20'
            }`}
            autoComplete="off"
            autoCapitalize="off"
            placeholder="Type what you hear..."
          />

          <div className="flex gap-3 w-full">
            <motion.button whileTap={{ scale: 0.95 }} onClick={speakWord}
              className="flex-1 py-3 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl border border-white/20">
              Hear again
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={check}
              className="flex-1 py-3 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30">
              Check
            </motion.button>
          </div>

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
