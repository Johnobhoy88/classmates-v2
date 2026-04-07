/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 */

import { useState, useCallback } from 'react';
import { sfxCorrect, sfxWrong, sfxClick, sfxLevelUp } from '../../game/systems/AudioSystem';
import { recordGameResult } from '../../game/systems/ProgressTracker';
import { useAuth } from '../auth/AuthProvider';

// Faithful port of V1 Memory Match: flip cards to find pairs

const ALL_PAIRS = [
  ['3+7','10'],['6+4','10'],['8+2','10'],['5+5','10'],['9+1','10'],
  ['2\u00D73','6'],['4\u00D75','20'],['3\u00D73','9'],['6\u00D72','12'],
  ['big','small'],['hot','cold'],['up','down'],['fast','slow'],['happy','sad'],['day','night'],
  ['half','\u00BD'],['quarter','\u00BC'],['three quarters','\u00BE'],
];

function shuffle<T>(arr: T[]): T[] { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

interface Card { id: number; text: string; pairId: number; flipped: boolean; matched: boolean; }

export function MemoryMatchQuiz({ onExit }: { onExit: () => void }) {
  const { pupil } = useAuth();
  const [cards, setCards] = useState<Card[]>(() => {
    const selected = shuffle([...ALL_PAIRS]).slice(0, 8);
    const deck: Card[] = [];
    selected.forEach((pair, i) => {
      deck.push({ id: i * 2, text: pair[0], pairId: i, flipped: false, matched: false });
      deck.push({ id: i * 2 + 1, text: pair[1], pairId: i, flipped: false, matched: false });
    });
    return shuffle(deck);
  });
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matched, setMatched] = useState(0);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const total = 8;

  const flipCard = useCallback((idx: number) => {
    if (busy || cards[idx].flipped || cards[idx].matched) return;
    sfxClick();
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
        sfxCorrect();
        newCards[a] = { ...newCards[a], matched: true };
        newCards[b] = { ...newCards[b], matched: true };
        const newMatched = matched + 1;
        setCards([...newCards]);
        setMatched(newMatched);
        setFlipped([]);
        setBusy(false);
        if (newMatched === total) { sfxLevelUp(); setDone(true); }
      } else {
        sfxWrong();
        setTimeout(() => {
          newCards[a] = { ...newCards[a], flipped: false };
          newCards[b] = { ...newCards[b], flipped: false };
          setCards([...newCards]);
          setFlipped([]);
          setBusy(false);
        }, 800);
      }
    }
  }, [busy, cards, flipped, matched]);

  if (done) {
    const stars = moves <= 12 ? 3 : moves <= 18 ? 2 : 1;
    if (pupil) recordGameResult({ pupilId: pupil.id, gameId: 'memorymatch', score: Math.max(0, 100 - moves * 3), stars, streak: 0, bestStreak: 0, correct: total, total });
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-slate-900 to-fuchsia-900/30">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full text-center border border-white/20">
          <div className="text-3xl mb-3">{'\u2B50'.repeat(stars)}{'\u2606'.repeat(3-stars)}</div>
          <h2 className="text-xl font-bold text-white mb-2">Memory Match!</h2>
          <p className="text-fuchsia-300 text-lg">{moves} moves</p>
          <div className="flex gap-3 mt-6">
            <button onClick={() => window.location.reload()} className="flex-1 py-3 bg-fuchsia-500 hover:bg-fuchsia-400 text-white font-bold rounded-xl">Again</button>
            <button onClick={onExit} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20">Back</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-900 to-fuchsia-900/20">
      <div className="px-4 pt-4 flex items-center justify-between">
        <button onClick={onExit} className="text-white/40 hover:text-white/70 text-sm px-3 py-2 rounded-lg hover:bg-white/5">&larr; Back</button>
        <span className="text-white/50 text-sm font-bold">{moves} moves · {matched}/{total} pairs</span>
      </div>
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="grid grid-cols-4 gap-2 w-full max-w-sm">
          {cards.map((card, i) => (
            <button key={card.id} onClick={() => flipCard(i)}
              className={`aspect-square rounded-xl font-bold text-sm transition-all duration-300 ${
                card.matched ? 'bg-emerald-500/30 border-emerald-400/50 text-emerald-200 border-2'
                : card.flipped ? 'bg-fuchsia-500/30 border-fuchsia-400/50 text-white border-2 scale-105'
                : 'bg-white/10 border-white/10 text-transparent border-2 hover:bg-white/15 active:scale-95'
              }`}>
              {(card.flipped || card.matched) ? card.text : '?'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
