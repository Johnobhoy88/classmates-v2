/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 */

import { useState, useRef, useEffect } from 'react';
import { genMathQuestion } from '../../game/content/maths-data';
import { sfxCorrect, sfxWrong, sfxLevelUp } from '../../game/systems/AudioSystem';
import { recordGameResult } from '../../game/systems/ProgressTracker';
import { useAuth } from '../auth/AuthProvider';
import { calcStars } from '../../utils/stars';

// Faithful port of V1 Head to Head: 2-player split-screen maths race, first to 10

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
  const target = 10;
  const p1Ref = useRef<HTMLInputElement>(null);
  const p2Ref = useRef<HTMLInputElement>(null);
  const savedRef = useRef(false);

  // Save result once when winner is determined
  useEffect(() => {
    if (winner && pupil && !savedRef.current) {
      savedRef.current = true;
      const isP1 = winner === p1.name;
      const winnerScore = isP1 ? p1.score : p2.score;
      const totalAnswered = p1.score + p2.score;
      const pct = totalAnswered > 0 ? winnerScore / target : 0;
      const stars = calcStars(pct);
      recordGameResult({
        pupilId: pupil.id,
        gameId: 'h2h',
        score: Math.round(pct * 100),
        stars,
        streak: 0,
        bestStreak: Math.max(p1.score, p2.score),
        correct: winnerScore,
        total: target,
      });
    }
  }, [winner, pupil, p1, p2]);

  function start() {
    savedRef.current = false;
    const n1 = name1.trim() || 'Player 1';
    const n2 = name2.trim() || 'Player 2';
    setP1({ name: n1, score: 0, question: newQuestion(), input: '', flash: null });
    setP2({ name: n2, score: 0, question: newQuestion(), input: '', flash: null });
    setStarted(true);
    setWinner(null);
    setTimeout(() => p1Ref.current?.focus(), 100);
  }

  function checkAnswer(player: 1 | 2) {
    if (winner) return;
    const p = player === 1 ? p1 : p2;
    const setP = player === 1 ? setP1 : setP2;
    const val = parseInt(p.input);
    if (isNaN(val)) return;

    if (val === p.question.answer) {
      const newScore = p.score + 1;
      sfxCorrect();
      if (newScore >= target) {
        setP({ ...p, score: newScore, flash: 'correct', input: '' });
        setWinner(p.name);
        sfxLevelUp();
        return;
      }
      setP({ ...p, score: newScore, question: newQuestion(), input: '', flash: 'correct' });
      setTimeout(() => setP(prev => ({ ...prev, flash: null })), 300);
    } else {
      sfxWrong();
      setP({ ...p, input: '', flash: 'wrong' });
      setTimeout(() => setP(prev => ({ ...prev, flash: null })), 300);
    }
  }

  if (!started) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-slate-900 to-red-900/20">
        <button onClick={onExit} className="absolute top-4 left-4 text-white/40 hover:text-white/70 text-sm px-3 py-2 rounded-lg hover:bg-white/5">&larr; Back</button>
        <h2 className="text-2xl font-bold text-white mb-6">Head to Head</h2>
        <p className="text-white/50 text-sm mb-4">2-player maths race — first to {target} wins!</p>
        <div className="flex gap-4 mb-6">
          <input value={name1} onChange={e => setName1(e.target.value)} placeholder="Player 1" className="px-4 py-3 rounded-xl bg-white/10 border border-blue-400/30 text-white text-center w-36 focus:outline-none focus:border-blue-400" />
          <span className="text-white/30 text-2xl font-bold self-center">vs</span>
          <input value={name2} onChange={e => setName2(e.target.value)} placeholder="Player 2" className="px-4 py-3 rounded-xl bg-white/10 border border-red-400/30 text-white text-center w-36 focus:outline-none focus:border-red-400" />
        </div>
        <button onClick={start} className="px-8 py-4 bg-gradient-to-r from-blue-500 to-red-500 text-white font-bold rounded-2xl text-lg active:scale-95">Start!</button>
      </div>
    );
  }

  if (winner) {
    const isP1 = winner === p1.name;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: `linear-gradient(to bottom, #0f172a, ${isP1 ? '#1e3a8a' : '#7f1d1d'}40)` }}>
        <div className="text-6xl mb-4">{'\u{1F3C6}'}</div>
        <h2 className="text-3xl font-bold text-white mb-2">{winner} WINS!</h2>
        <p className="text-white/50 mb-6">{p1.score} - {p2.score}</p>
        <div className="flex gap-3">
          <button onClick={() => { setStarted(false); setWinner(null); }} className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/20">Play Again</button>
          <button onClick={onExit} className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20">Back</button>
        </div>
      </div>
    );
  }

  function renderSide(p: PlayerState, setP: React.Dispatch<React.SetStateAction<PlayerState>>, player: 1 | 2, color: string, ref: React.RefObject<HTMLInputElement | null>) {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center p-4 border-${player === 1 ? 'r' : 'l'} border-white/10`}>
        <p className="text-white/60 text-sm font-bold mb-1">{p.name}</p>
        <p className={`text-3xl font-bold mb-4`} style={{ color }}>{p.score}/{target}</p>
        <p className="text-white text-2xl font-bold mb-4">{p.question.text}</p>
        <input
          ref={ref}
          type="number"
          inputMode="numeric"
          value={p.input}
          onChange={e => setP(prev => ({ ...prev, input: e.target.value }))}
          onKeyDown={e => { if (e.key === 'Enter') checkAnswer(player); }}
          className={`w-24 px-3 py-3 rounded-xl text-center text-2xl font-bold bg-white/10 border-2 text-white focus:outline-none ${
            p.flash === 'correct' ? 'border-emerald-400' : p.flash === 'wrong' ? 'border-red-400' : 'border-white/20'
          }`}
          autoComplete="off"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="px-4 pt-3 flex items-center justify-between">
        <button onClick={onExit} className="text-white/40 hover:text-white/70 text-sm px-3 py-2 rounded-lg hover:bg-white/5">&larr; Quit</button>
        <span className="text-white/30 text-sm">First to {target}</span>
      </div>
      <div className="flex-1 flex">
        {renderSide(p1, setP1, 1, '#3b82f6', p1Ref)}
        {renderSide(p2, setP2, 2, '#ef4444', p2Ref)}
      </div>
    </div>
  );
}
