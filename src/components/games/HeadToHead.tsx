/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 *
 * HEAD TO HEAD — Premium: 2-player split-screen maths race, first to 10.
 * Motion animations, AudioEngine, Phaser cosmos background, Confetti.
 * CfE: MNU 1-02a (add/subtract), MNU 1-03a (multiply/divide)
 */

import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { genMathQuestion } from '../../game/content/maths-data';
import { recordGameResult } from '../../game/systems/ProgressTracker';
import { useAuth } from '../auth/AuthProvider';
import { QuizWorld } from '../shared/QuizWorld';
import { GameBackButton } from '../shared/GameNav';
import { calcStars } from '../../utils/stars';
import {
  useConfetti, ConfettiLayer,
  sfxCoin, sfxBuzz, sfxFanfare,
  startMusic, stopMusic, getScale,
  THEME_COSMOS,
} from '../premium';
import type { ThemeState } from '../premium';

interface PlayerState {
  name: string;
  score: number;
  question: { text: string; answer: number };
  input: string;
  flash: 'correct' | 'wrong' | null;
}

function newQuestion(): { text: string; answer: number } {
  return genMathQuestion(2);
}

export function HeadToHead({ onExit }: { onExit: () => void }) {
  const { pupil } = useAuth();
  const [started, setStarted] = useState(false);
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');
  const [p1, setP1] = useState<PlayerState>({ name: 'Player 1', score: 0, question: newQuestion(), input: '', flash: null });
  const [p2, setP2] = useState<PlayerState>({ name: 'Player 2', score: 0, question: newQuestion(), input: '', flash: null });
  const [winner, setWinner] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [themeState, setThemeState] = useState<ThemeState>({ progress: 0, streak: 0, livesRatio: 1, event: 'none' });
  const { burst, pieces } = useConfetti();
  const target = 10;
  const p1Ref = useRef<HTMLInputElement>(null);
  const p2Ref = useRef<HTMLInputElement>(null);
  const savedRef = useRef(false);
  const musicStarted = useRef(false);

  useEffect(() => () => { stopMusic(); musicStarted.current = false; }, []);

  useEffect(() => {
    if (winner && pupil && !savedRef.current) {
      savedRef.current = true;
      stopMusic(); musicStarted.current = false;
      const isP1 = winner === p1.name;
      const winnerScore = isP1 ? p1.score : p2.score;
      const pct = winnerScore / target;
      const stars = calcStars(pct);
      if (!muted) sfxFanfare(getScale());
      burst(30);
      recordGameResult({
        pupilId: pupil.id, gameId: 'h2h',
        score: Math.round(pct * 100), stars,
        streak: 0, bestStreak: Math.max(p1.score, p2.score),
        correct: winnerScore, total: target,
      });
    }
  }, [winner, pupil, p1, p2, muted]);

  function start() {
    savedRef.current = false;
    const n1 = name1.trim() || 'Player 1';
    const n2 = name2.trim() || 'Player 2';
    setP1({ name: n1, score: 0, question: newQuestion(), input: '', flash: null });
    setP2({ name: n2, score: 0, question: newQuestion(), input: '', flash: null });
    setStarted(true); setWinner(null);
    if (!muted && !musicStarted.current) { startMusic(THEME_COSMOS); musicStarted.current = true; }
    setTimeout(() => p1Ref.current?.focus(), 100);
  }

  function checkAnswer(player: 1 | 2) {
    if (winner) return;
    const p = player === 1 ? p1 : p2;
    const setP = player === 1 ? setP1 : setP2;
    const val = parseInt(p.input);
    if (isNaN(val)) return;

    if (val === p.question.answer) {
      const ns = p.score + 1;
      if (!muted) sfxCoin();
      if (ns >= target) {
        setP({ ...p, score: ns, flash: 'correct', input: '' });
        setWinner(p.name);
        toast(`${p.name} wins! 🏆`);
        return;
      }
      setP({ ...p, score: ns, question: newQuestion(), input: '', flash: 'correct' });
      setThemeState({ progress: ns / target, streak: ns, livesRatio: 1, event: 'correct' });
      setTimeout(() => setP(prev => ({ ...prev, flash: null })), 300);
    } else {
      if (!muted) sfxBuzz();
      setP({ ...p, input: '', flash: 'wrong' });
      setThemeState(s => ({ ...s, event: 'wrong' }));
      setTimeout(() => { setP(prev => ({ ...prev, flash: null })); setThemeState(s => ({ ...s, event: 'none' })); }, 300);
    }
  }

  if (!started) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <QuizWorld theme="cosmos" state={themeState} />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
          <GameBackButton onClick={onExit} />
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
            <div className="text-5xl mb-3">⚔️</div>
            <h2 className="text-2xl font-bold text-white mb-2">Head to Head</h2>
            <p className="text-white/50 text-sm mb-6">2-player maths race — first to {target} wins!</p>
            <div className="flex gap-4 mb-6">
              <input value={name1} onChange={e => setName1(e.target.value)} placeholder="Player 1"
                className="px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-blue-400/30 text-white text-center w-36 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30" />
              <span className="text-white/30 text-2xl font-bold self-center">vs</span>
              <input value={name2} onChange={e => setName2(e.target.value)} placeholder="Player 2"
                className="px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-red-400/30 text-white text-center w-36 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/30" />
            </div>
            <motion.button whileTap={{ scale: 0.95 }} onClick={start}
              className="px-10 py-4 bg-gradient-to-r from-blue-500 to-red-500 text-white font-bold rounded-2xl text-lg shadow-lg">
              Start!
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (winner) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <QuizWorld theme="cosmos" state={themeState} />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
          <motion.div initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', damping: 8 }} className="text-7xl mb-4">🏆</motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-white mb-2">{winner} WINS!</motion.h2>
          <p className="text-white/50 mb-6">{p1.score} - {p2.score}</p>
          <div className="flex gap-3">
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setStarted(false); setWinner(null); }}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/20">Play Again</motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={onExit}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20">Back</motion.button>
          </div>
        </div>
        <ConfettiLayer pieces={pieces} />
      </div>
    );
  }

  function renderSide(p: PlayerState, setP: React.Dispatch<React.SetStateAction<PlayerState>>, player: 1 | 2, color: string, ref: React.RefObject<HTMLInputElement | null>) {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center p-4 ${player === 1 ? 'border-r border-white/10' : ''}`}>
        <p className="text-white/60 text-sm font-bold mb-1">{p.name}</p>
        <motion.p animate={{ scale: p.flash === 'correct' ? [1, 1.3, 1] : 1 }} className="text-3xl font-bold mb-4" style={{ color }}>
          {p.score}/{target}
        </motion.p>
        <motion.p key={p.question.text} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="text-white text-2xl font-bold mb-4">{p.question.text}</motion.p>
        <motion.input
          ref={ref}
          type="number"
          inputMode="numeric"
          value={p.input}
          onChange={e => setP(prev => ({ ...prev, input: e.target.value }))}
          onKeyDown={e => { if (e.key === 'Enter') checkAnswer(player); }}
          animate={p.flash === 'wrong' ? { x: [-5, 5, -3, 3, 0] } : {}}
          className={`w-24 px-3 py-3 rounded-xl text-center text-2xl font-bold bg-white/10 backdrop-blur-sm border-2 text-white focus:outline-none transition-colors ${
            p.flash === 'correct' ? 'border-emerald-400 bg-emerald-500/10' : p.flash === 'wrong' ? 'border-red-400 bg-red-500/10' : 'border-white/20'
          }`}
          autoComplete="off"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <QuizWorld theme="cosmos" state={themeState} />
      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="px-4 pt-3 flex items-center justify-between">
          <GameBackButton onClick={() => { stopMusic(); musicStarted.current = false; onExit(); }} />
          <span className="text-white/30 text-sm">First to {target}</span>
          <button onClick={() => setMuted(!muted)} className="p-2 text-white/40 hover:text-white/70">{muted ? '🔇' : '🔊'}</button>
        </div>
        <div className="flex-1 flex">
          {renderSide(p1, setP1, 1, '#3b82f6', p1Ref)}
          {renderSide(p2, setP2, 2, '#ef4444', p2Ref)}
        </div>
      </div>
      <ConfettiLayer pieces={pieces} />
    </div>
  );
}
