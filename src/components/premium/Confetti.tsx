/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 */

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const COLORS = ['#2ecc71', '#f1c40f', '#3498db', '#e74c3c', '#9b59b6', '#1abc9c'];

interface ConfettiPiece { id: number; x: number; color: string; }

export function useConfetti() {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const idRef = useRef(0);

  const burst = useCallback((count = 20) => {
    const newPieces = Array.from({ length: count }, () => ({
      id: idRef.current++,
      x: 10 + Math.random() * 80,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));
    setPieces(newPieces);
    setTimeout(() => setPieces([]), 1500);
  }, []);

  return { pieces, burst };
}

export function ConfettiLayer({ pieces }: { pieces: ConfettiPiece[] }) {
  return (
    <div className="fixed inset-0 z-20 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {pieces.map(c => (
          <motion.div key={c.id}
            initial={{ y: -20, x: `${c.x}%`, scale: 1, opacity: 1, rotate: 0 }}
            animate={{ y: '105vh', opacity: 0.6, rotate: 360 + Math.random() * 360 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 + Math.random() * 1, ease: 'linear' }}
            className="absolute w-2 h-3 rounded-sm"
            style={{ backgroundColor: c.color }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
