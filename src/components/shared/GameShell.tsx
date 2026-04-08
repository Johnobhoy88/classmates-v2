/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import Phaser from 'phaser';
import { createPhaserGame } from '../../game/PhaserGame';
import { SpellingScene } from '../../game/scenes/SpellingScene';
import { recordGameResult } from '../../game/systems/ProgressTracker';
import { useAuth } from '../auth/AuthProvider';
import { motion } from 'motion/react';
import { Type, ArrowLeft, Star, Zap, Trophy } from 'lucide-react';
import { GameBackButton } from './GameNav';

// Tier 2: Phaser scenes for flagship immersive games
const PHASER_SCENES: Record<string, { scene: typeof Phaser.Scene; key: string }> = {
  spelling: { scene: SpellingScene, key: 'SpellingScene' },
  // Future: platformer, forest, forge scenes will go here
};

interface GameShellProps {
  gameId: string;
  onExit: () => void;
}

const LEVELS = [
  { level: 1, label: 'Easy', desc: '3-letter words', icon: Star, color: 'from-emerald-500 to-teal-600', lives: '7 lives' },
  { level: 2, label: 'Medium', desc: '4-6 letter words', icon: Zap, color: 'from-blue-500 to-indigo-600', lives: '6 lives' },
  { level: 3, label: 'Hard', desc: 'Big words!', icon: Trophy, color: 'from-purple-500 to-pink-600', lives: '5 lives' },
];

export function GameShell({ gameId, onExit }: GameShellProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const { pupil } = useAuth();
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
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
    if (!containerRef.current || selectedLevel === null) return;

    const entry = PHASER_SCENES[gameId];
    if (!entry) return;

    const sceneKey = entry.key;
    const completeCb = handleComplete;
    const lvl = selectedLevel;

    class LauncherScene extends Phaser.Scene {
      constructor() {
        super({ key: 'Launcher' });
      }
      create() {
        this.scene.start(sceneKey, {
          level: lvl,
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
  }, [gameId, selectedLevel, handleComplete]);

  // Level select screen
  if (selectedLevel === null && !result) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-900 flex flex-col">
        <div className="px-4 pt-4">
          <GameBackButton onClick={onExit} />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <Type className="w-12 h-12 text-emerald-400 mx-auto mb-3" strokeWidth={1.5} />
            <h2 className="text-3xl font-extrabold text-white mb-2">Spelling</h2>
            <p className="text-emerald-300/60 text-sm">Guess the word from the hint!</p>
          </motion.div>
          <div className="flex flex-col gap-4 w-full max-w-xs">
            {LEVELS.map((lv, i) => {
              const Icon = lv.icon;
              return (
                <motion.button
                  key={lv.level}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.1 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedLevel(lv.level)}
                  className={`flex items-center gap-4 px-6 py-5 bg-gradient-to-r ${lv.color} rounded-2xl text-white shadow-lg transition-all`}
                >
                  <Icon className="w-7 h-7 flex-shrink-0" />
                  <div className="text-left">
                    <p className="font-bold text-lg">{lv.label}</p>
                    <p className="text-white/70 text-sm">{lv.desc} &middot; {lv.lives}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (result) {
    const pct = Math.round((result.correct / result.total) * 100);
    const starEmojis = '\u2B50'.repeat(result.stars) + '\u2606'.repeat(3 - result.stars);

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-emerald-900 flex flex-col items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full text-center border border-white/20">
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
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="bg-white/5 rounded-xl px-4 py-2 mb-2 border border-white/10">
                  <span className="text-white font-bold capitalize">{m.w}</span>
                  <span className="text-white/50 text-sm ml-2">— {m.h}</span>
                </motion.div>
              ))}
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => { setResult(null); setSelectedLevel(null); }}
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
        </motion.div>
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
          setSelectedLevel(null);
          setResult(null);
        }}
        className="absolute top-4 left-4 z-10 px-4 py-2 bg-black/40 hover:bg-black/60 text-white rounded-xl text-sm font-semibold backdrop-blur-sm border border-white/10 flex items-center gap-1.5"
      >
        <ArrowLeft className="w-4 h-4" />
        Quit
      </button>
      <div ref={containerRef} className="w-full h-screen" />
    </div>
  );
}
