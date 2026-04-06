import { useEffect, useRef, useCallback, useState } from 'react';
import Phaser from 'phaser';
import { createPhaserGame } from '../../game/PhaserGame';
import { SpellingScene } from '../../game/scenes/SpellingScene';
import { MathsScene } from '../../game/scenes/MathsScene';
import { ForestScene } from '../../game/scenes/ForestScene';
import { ForgeScene } from '../../game/scenes/ForgeScene';
import { TimesScene } from '../../game/scenes/TimesScene';
import { PhonicsScene } from '../../game/scenes/PhonicsScene';
import { BondsScene } from '../../game/scenes/BondsScene';
import { recordGameResult } from '../../game/systems/ProgressTracker';
import { useAuth } from '../auth/AuthProvider';

const SCENE_MAP: Record<string, { scene: typeof Phaser.Scene; key: string }> = {
  spelling: { scene: SpellingScene, key: 'SpellingScene' },
  maths: { scene: MathsScene, key: 'MathsScene' },
  spellforest: { scene: ForestScene, key: 'ForestScene' },
  numberforge: { scene: ForgeScene, key: 'ForgeScene' },
  times: { scene: TimesScene, key: 'TimesScene' },
  phonics: { scene: PhonicsScene, key: 'PhonicsScene' },
  bonds: { scene: BondsScene, key: 'BondsScene' },
};

interface GameShellProps {
  gameId: string;
  onExit: () => void;
}

export function GameShell({ gameId, onExit }: GameShellProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const { pupil } = useAuth();
  const [result, setResult] = useState<{
    correct: number;
    total: number;
    stars: number;
    bestStreak: number;
    missed: Array<{ w: string; h: string }>;
  } | null>(null);

  const handleComplete = useCallback(
    (res: { correct: number; total: number; stars: number; bestStreak: number; missed: Array<{ w: string; h: string }> }) => {
      setResult(res);

      // Save progress
      if (pupil) {
        recordGameResult({
          pupilId: pupil.id,
          gameId,
          score: Math.round((res.correct / res.total) * 100),
          stars: res.stars,
          streak: 0,
          bestStreak: res.bestStreak,
          correct: res.correct,
          total: res.total,
        });
      }

      // Destroy Phaser after a brief delay
      setTimeout(() => {
        if (gameRef.current) {
          gameRef.current.destroy(true);
          gameRef.current = null;
        }
      }, 200);
    },
    [pupil, gameId]
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const entry = SCENE_MAP[gameId];
    if (!entry) return;

    const sceneKey = entry.key;
    const completeCb = handleComplete;

    // Create a wrapper scene that passes data to the real scene
    class LauncherScene extends Phaser.Scene {
      constructor() {
        super({ key: 'Launcher' });
      }
      create() {
        this.scene.start(sceneKey, {
          level: 1,
          onComplete: completeCb,
        });
      }
    }

    const game = createPhaserGame({
      parent: containerRef.current,
      scenes: [LauncherScene, entry.scene],
    });
    gameRef.current = game;

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [gameId, handleComplete]);

  if (result) {
    const pct = Math.round((result.correct / result.total) * 100);
    const starEmojis = '\u2B50'.repeat(result.stars) + '\u2606'.repeat(3 - result.stars);

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-emerald-900 flex flex-col items-center justify-center px-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full text-center border border-white/20">
          <div className="text-4xl mb-4">{starEmojis}</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {result.stars >= 3 ? 'Amazing!' : result.stars >= 2 ? 'Great job!' : result.stars >= 1 ? 'Good try!' : 'Keep practising!'}
          </h2>
          <p className="text-emerald-300 text-lg mb-6">
            {result.correct}/{result.total} correct ({pct}%)
          </p>

          {result.bestStreak >= 3 && (
            <p className="text-amber-300 text-sm mb-4">
              Best streak: {result.bestStreak} words in a row!
            </p>
          )}

          {result.missed.length > 0 && (
            <div className="text-left mb-6">
              <p className="text-white/60 text-sm font-semibold mb-2">Words to practise:</p>
              {result.missed.map((m, i) => (
                <div
                  key={i}
                  className="bg-white/5 rounded-xl px-4 py-2 mb-2 border border-white/10"
                >
                  <span className="text-white font-bold capitalize">{m.w}</span>
                  <span className="text-white/50 text-sm ml-2">— {m.h}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => { setResult(null); }}
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
        onClick={() => {
          if (gameRef.current) {
            gameRef.current.destroy(true);
            gameRef.current = null;
          }
          onExit();
        }}
        className="absolute top-4 left-4 z-10 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-semibold backdrop-blur-sm border border-white/20"
      >
        &larr; Back
      </button>
      <div ref={containerRef} className="w-full h-screen" />
    </div>
  );
}
