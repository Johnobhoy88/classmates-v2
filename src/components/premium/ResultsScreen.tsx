/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 */

import { motion } from 'motion/react';
import { Star } from 'lucide-react';
import type { GameResult } from './themes';

interface ResultsScreenProps {
  result: GameResult;
  onPlayAgain: () => void;
  onExit: () => void;
}

export function ResultsScreen({ result, onPlayAgain, onExit }: ResultsScreenProps) {
  const pct = Math.round((result.correct / result.total) * 100);

  return (
    <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full text-center border border-white/10"
      >
        {/* Stars */}
        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3].map(s => (
            <motion.div key={s}
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
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
          <p className="text-amber-300 text-sm mb-4">{result.bestStreak} in a row!</p>
        )}

        {/* Missed items */}
        {result.missed.length > 0 && (
          <div className="text-left mb-6 mt-4">
            <p className="text-white/50 text-xs font-semibold mb-2">To practise:</p>
            {result.missed.map((m, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-2.5 mb-2 border border-white/10"
              >
                {m.emoji && <span className="text-xl">{m.emoji}</span>}
                <div>
                  <span className="text-white font-bold capitalize">{m.w}</span>
                  <span className="text-white/40 text-sm ml-2">&mdash; {m.h}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="flex gap-3 mt-4">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={onPlayAgain}
            className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl"
          >Play Again</motion.button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={onExit}
            className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20"
          >Back</motion.button>
        </div>
      </motion.div>
    </div>
  );
}
