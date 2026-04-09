/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 *
 * MEMORY MATCH — Premium: flip cards to find pairs.
 * Motion flip animations, AudioEngine, Phaser cosmos background, Confetti.
 * CfE: MNU 1-02a (addition), ENG 1-17a (vocabulary)
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { recordGameResult } from '../../game/systems/ProgressTracker';
import { useAuth } from '../auth/AuthProvider';
import { QuizWorld } from '../shared/QuizWorld';
import { GameBackButton } from '../shared/GameNav';
import { shuffle } from '../../utils/shuffle';
import {
  ResultsScreen, useConfetti, ConfettiLayer,
  sfxCoin, sfxBuzz, sfxComplete, sfxFanfare, sfxClick,
  startMusic, stopMusic, getScale,
  THEME_COSMOS,
} from '../premium';
import type { ThemeState } from '../premium';

const ALL_PAIRS = [
  ['3+7','10'],['6+4','10'],['8+2','10'],['5+5','10'],['9+1','10'],
  ['2×3','6'],['4×5','20'],['3×3','9'],['6×2','12'],
  ['big','small'],['hot','cold'],['up','down'],['fast','slow'],['happy','sad'],['day','night'],
  ['half','½'],['quarter','¼'],['three quarters','¾'],
];

interface Card { id: number; text: string; pairId: number; flipped: boolean; matched: boolean; }

export function MemoryMatchQuiz({ onExit }: { onExit: () => void }) {
  const { pupil } = useAuth();
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matched, setMatched] = useState(0);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [muted, setMuted] = useState(false);
  const [themeState, setThemeState] = useState<ThemeState>({ progress: 0, streak: 0, livesRatio: 1, event: 'none' });
  const { burst, pieces } = useConfetti();
  const savedRef = useRef(false);
  const musicStarted = useRef(false);
  const total = 8;

  // Initialize deck
  useEffect(() => {
    const selected = shuffle([...ALL_PAIRS]).slice(0, total);
    const deck: Card[] = [];
    selected.forEach((pair, i) => {
      deck.push({ id: i * 2, text: pair[0], pairId: i, flipped: false, matched: false });
      deck.push({ id: i * 2 + 1, text: pair[1], pairId: i, flipped: false, matched: false });
    });
    setCards(shuffle(deck));
    if (!muted && !musicStarted.current) { startMusic(THEME_COSMOS); musicStarted.current = true; }
  }, []);

  useEffect(() => () => { stopMusic(); musicStarted.current = false; }, []);

  const flipCard = useCallback((idx: number) => {
    if (busy || cards[idx].flipped || cards[idx].matched) return;
    if (!muted) sfxClick();
    const newCards = [...cards];
    newCards[idx] = { ...newCards[idx], flipped: true };
    const newFlipped = [...flipped, idx];
    setCards(newCards);
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setBusy(true);
      setMoves(m => m + 1);
      const [a, b] = newFlipped;
      if (newCards[a].pairId === newCards[b].pairId) {
        if (!muted) sfxCoin();
        newCards[a] = { ...newCards[a], matched: true };
        newCards[b] = { ...newCards[b], matched: true };
        const nm = matched + 1;
        setCards([...newCards]);
        setMatched(nm);
        setFlipped([]); setBusy(false);
        setThemeState({ progress: nm / total, streak: nm, livesRatio: 1, event: 'correct' });
        if (nm === 4) toast('Halfway! 🧠');
        if (nm === total) {
          if (!muted) sfxFanfare(getScale());
          burst(30);
          setDone(true);
        }
      } else {
        if (!muted) sfxBuzz();
        setThemeState(s => ({ ...s, event: 'wrong' }));
        setTimeout(() => {
          newCards[a] = { ...newCards[a], flipped: false };
          newCards[b] = { ...newCards[b], flipped: false };
          setCards([...newCards]);
          setFlipped([]); setBusy(false);
          setThemeState(s => ({ ...s, event: 'none' }));
        }, 800);
      }
    }
  }, [busy, cards, flipped, matched, muted, burst]);

  useEffect(() => {
    if (done && pupil && !savedRef.current) {
      savedRef.current = true;
      stopMusic(); musicStarted.current = false;
      const stars = moves <= 12 ? 3 : moves <= 18 ? 2 : 1;
      if (!muted && stars < 3) sfxComplete(getScale());
      recordGameResult({ pupilId: pupil.id, gameId: 'memorymatch', score: Math.max(0, 100 - moves * 3), stars, streak: 0, bestStreak: 0, correct: total, total });
    }
  }, [done, pupil, moves, muted]);

  function resetGame() {
    savedRef.current = false;
    const selected = shuffle([...ALL_PAIRS]).slice(0, total);
    const deck: Card[] = [];
    selected.forEach((pair, i) => {
      deck.push({ id: i * 2, text: pair[0], pairId: i, flipped: false, matched: false });
      deck.push({ id: i * 2 + 1, text: pair[1], pairId: i, flipped: false, matched: false });
    });
    setCards(shuffle(deck));
    setFlipped([]); setMoves(0); setMatched(0); setDone(false); setBusy(false);
    if (!muted && !musicStarted.current) { startMusic(THEME_COSMOS); musicStarted.current = true; }
  }

  if (done) {
    const stars = moves <= 12 ? 3 : moves <= 18 ? 2 : 1;
    return (
      <div className="min-h-screen relative">
        <QuizWorld theme="cosmos" state={themeState} />
        <ResultsScreen
          result={{ correct: total, total, stars, bestStreak: 0, missed: [] }}
          onPlayAgain={resetGame}
          onExit={onExit}
        />
        <ConfettiLayer pieces={pieces} />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <QuizWorld theme="cosmos" state={themeState} />
      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="px-4 pt-4 flex items-center justify-between">
          <GameBackButton onClick={onExit} />
          <span className="text-white/60 text-sm font-bold">{moves} moves · {matched}/{total} pairs</span>
          <button onClick={() => setMuted(!muted)} className="p-2 text-white/40 hover:text-white/70">{muted ? '🔇' : '🔊'}</button>
        </div>

        <div className="px-4 pt-2">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div className="h-full bg-fuchsia-500 rounded-full" animate={{ width: `${(matched / total) * 100}%` }} transition={{ type: 'spring', stiffness: 100 }} />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 py-4">
          <div className="grid grid-cols-4 gap-2 sm:gap-3 w-full max-w-sm">
            {cards.map((card, i) => (
              <motion.button
                key={card.id}
                onClick={() => flipCard(i)}
                animate={
                  card.matched ? { scale: [1, 1.1, 1], transition: { duration: 0.3 } }
                  : card.flipped ? { rotateY: 180 }
                  : { rotateY: 0 }
                }
                whileTap={!card.flipped && !card.matched ? { scale: 0.9 } : {}}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={`aspect-square rounded-xl font-bold text-xs sm:text-sm transition-colors duration-200 border-2 shadow-lg ${
                  card.matched
                    ? 'bg-emerald-500/30 border-emerald-400/50 text-emerald-200 shadow-emerald-500/20'
                    : card.flipped
                    ? 'bg-fuchsia-500/30 border-fuchsia-400/50 text-white shadow-fuchsia-500/20'
                    : 'bg-white/10 border-white/15 text-transparent hover:bg-white/15 backdrop-blur-sm'
                }`}
              >
                {(card.flipped || card.matched) ? card.text : '?'}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
      <ConfettiLayer pieces={pieces} />
    </div>
  );
}
