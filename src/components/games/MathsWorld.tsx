/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 */

import { useEffect, useRef, useState } from 'react';
import { recordGameResult } from '../../game/systems/ProgressTracker';
import { useAuth } from '../../hooks/useAuth';

interface GodotResult {
  type: string;
  gameId: string;
  score: number;
  total: number;
  stars: number;
  streak: number;
  bestStreak: number;
  correct: number;
}

export default function MathsWorld({ onExit }: { onExit: () => void }) {
  const { pupil } = useAuth();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<GodotResult | null>(null);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const data = event.data;
      if (data && data.type === 'godot-game-result' && data.gameId === 'maths-world') {
        setResult(data as GodotResult);
        if (pupil) {
          recordGameResult({
            pupilId: pupil.id,
            gameId: 'maths-world',
            score: Math.round((data.correct / data.total) * 100),
            stars: data.stars,
            streak: data.streak,
            bestStreak: data.bestStreak,
            correct: data.correct,
            total: data.total,
          });
        }
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [pupil]);

  if (result) {
    const pct = Math.round((result.correct / result.total) * 100);
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-emerald-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full text-center border border-white/20">
          <div className="text-5xl mb-4">
            {[0, 1, 2].map(i => (
              <span key={i} className={i < result.stars ? 'text-amber-400' : 'text-white/20'}>★</span>
            ))}
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {result.stars >= 3 ? 'Amazing!' : result.stars >= 2 ? 'Great job!' : result.stars >= 1 ? 'Good try!' : 'Keep practising!'}
          </h2>
          <p className="text-emerald-300 text-lg mb-2">
            {result.correct}/{result.total} correct ({pct}%)
          </p>
          {result.bestStreak >= 3 && (
            <p className="text-amber-300 text-sm mb-4">
              Best streak: {result.bestStreak} in a row!
            </p>
          )}
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => { setResult(null); setLoading(true); }}
              className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-colors"
            >
              Play Again
            </button>
            <button
              onClick={onExit}
              className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors border border-white/20"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 relative">
      <button
        onClick={onExit}
        className="absolute top-4 left-4 z-10 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-semibold backdrop-blur-sm border border-white/20"
      >
        &larr; Back
      </button>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-5">
          <div className="text-white text-xl animate-pulse">Loading Maths World...</div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src="/godot/maths-world/index.html"
        className="w-full h-screen border-0"
        onLoad={() => setLoading(false)}
        allow="autoplay; fullscreen"
      />
    </div>
  );
}
