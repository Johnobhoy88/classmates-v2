/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 *
 * SOUTHLODGE RUNNERS — Temple Run / Subway Surfers style endless runner.
 * Phaser 3 scene with React wrapper for audio, results, and progress.
 * Highland-themed: mountains, lochs, castles, sheep obstacles.
 * CfE: LIT 1-13a (spelling), LIT 1-21a (word recognition)
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import Phaser from 'phaser';
import { RunnerScene } from '../../game/scenes/RunnerScene';
import { buildMissionWords } from '../../game/content/racers-packs';
import { recordGameResult } from '../../game/systems/ProgressTracker';
import { useAuth } from '../auth/AuthProvider';
import { calcStars } from '../../utils/stars';
import {
  ResultsScreen, useConfetti, ConfettiLayer,
  sfxCoin, sfxBuzz, sfxComplete, sfxFanfare, sfxLevelUp, sfxHeartLost,
  startMusic, stopMusic, getScale,
  THEME_FOREST,
} from '../premium';
import type { GameResult } from '../premium';

export function SouthlodgeRunners({ onExit }: { onExit: () => void }) {
  const { pupil } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [muted, setMuted] = useState(false);
  const [started, setStarted] = useState(false);
  const [result, setResult] = useState<GameResult | null>(null);
  const { burst, pieces } = useConfetti();
  const musicStarted = useRef(false);
  const savedRef = useRef(false);

  const handleGameOver = useCallback((_score: number, wordsCorrect: number, wordsTotal: number, bestStreak: number) => {
    stopMusic();
    musicStarted.current = false;

    const pct = wordsTotal > 0 ? wordsCorrect / wordsTotal : 0;
    const stars = calcStars(pct);

    if (!muted) {
      stars >= 2 ? sfxFanfare(getScale()) : sfxComplete(getScale());
    }
    if (stars >= 2) burst(30);

    const gameResult: GameResult = {
      correct: wordsCorrect,
      total: wordsTotal || 1,
      stars,
      bestStreak,
      missed: [],
    };
    setResult(gameResult);

    if (pupil && !savedRef.current) {
      savedRef.current = true;
      recordGameResult({
        pupilId: pupil.id,
        gameId: 'hdash',
        score: Math.round(pct * 100),
        stars,
        streak: 0,
        bestStreak,
        correct: wordsCorrect,
        total: wordsTotal || 1,
      });
    }
  }, [muted, pupil, burst]);

  const startGame = useCallback(() => {
    if (!containerRef.current) return;

    savedRef.current = false;
    setResult(null);
    setStarted(true);

    if (!muted && !musicStarted.current) {
      startMusic(THEME_FOREST);
      musicStarted.current = true;
    }

    // Build word challenges from existing content
    const words = buildMissionWords('mixed', 20).map(w => ({
      word: w.word,
      confusions: w.confusions,
      sentence: w.sentence,
    }));

    // Destroy previous game if exists
    if (gameRef.current) {
      gameRef.current.destroy(true);
      gameRef.current = null;
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      transparent: false,
      backgroundColor: '#7fb5d4',
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      physics: { default: 'arcade' },
      scene: RunnerScene,
      input: {
        touch: true,
        keyboard: true,
      },
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    // Pass data to scene
    game.scene.start('RunnerScene', {
      words,
      callbacks: {
        onCoinCollect: () => { if (!muted) sfxCoin(); },
        onCorrectWord: (streak: number) => {
          if (!muted) sfxCoin();
          if (streak === 3) { if (!muted) sfxLevelUp(getScale()); toast('3 in a row! 🔥'); }
          if (streak === 5) { if (!muted) sfxLevelUp(getScale()); toast('5 streak! 🔥🔥'); }
          if (streak === 10) { if (!muted) sfxFanfare(getScale()); toast('10 IN A ROW! 🔥🔥🔥'); burst(20); }
        },
        onWrongWord: () => { if (!muted) sfxBuzz(); },
        onLifeLost: (remaining: number) => {
          if (!muted) sfxHeartLost();
          toast(`${remaining} ${remaining === 1 ? 'life' : 'lives'} left!`);
        },
        onGameOver: handleGameOver,
      },
    });
  }, [muted, handleGameOver, burst]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
      stopMusic();
      musicStarted.current = false;
    };
  }, []);

  // Start screen
  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-400 to-emerald-700 flex flex-col items-center justify-center px-4 relative overflow-hidden">
        {/* Decorative mountains */}
        <div className="absolute inset-0 opacity-20">
          <svg viewBox="0 0 960 540" className="w-full h-full" preserveAspectRatio="none">
            <polygon points="0,400 200,200 400,350 500,180 700,320 960,250 960,540 0,540" fill="#1a5c2e" />
            <polygon points="0,450 150,300 350,400 600,280 800,380 960,300 960,540 0,540" fill="#2d7a3f" />
          </svg>
        </div>

        <button onClick={onExit} className="absolute top-4 left-4 z-10 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-sm font-semibold backdrop-blur-sm border border-white/20">
          &larr; Back
        </button>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 12 }}
          className="text-center relative z-10"
        >
          <div className="text-7xl mb-4">🏃‍♂️</div>
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Southlodge Runners</h1>
          <p className="text-white/80 text-lg mb-2">Endless Highland Runner</p>
          <p className="text-white/60 text-sm mb-8 max-w-xs mx-auto">
            Swipe left/right to change lanes. Tap to jump. Dodge obstacles and run through the correct spelling!
          </p>

          <div className="flex gap-4 justify-center mb-6 text-white/70 text-sm">
            <div className="flex items-center gap-1">👈👉 Swipe lanes</div>
            <div className="flex items-center gap-1">👆 Tap to jump</div>
            <div className="flex items-center gap-1">👇 Swipe to slide</div>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={startGame}
            className="px-12 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-2xl text-xl shadow-lg shadow-emerald-500/40"
          >
            RUN!
          </motion.button>

          <button
            onClick={() => setMuted(!muted)}
            className="mt-4 block mx-auto text-white/40 hover:text-white/70 text-sm"
          >
            {muted ? '🔇 Sound off' : '🔊 Sound on'}
          </button>
        </motion.div>
      </div>
    );
  }

  // Results screen
  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-400 to-emerald-700 relative">
        <ResultsScreen
          result={result}
          onPlayAgain={() => { setStarted(false); setResult(null); }}
          onExit={onExit}
        />
        <ConfettiLayer pieces={pieces} />
      </div>
    );
  }

  // Game running
  return (
    <div className="min-h-screen relative">
      <button
        onClick={() => {
          if (gameRef.current) { gameRef.current.destroy(true); gameRef.current = null; }
          stopMusic(); musicStarted.current = false;
          onExit();
        }}
        className="absolute top-2 left-2 z-50 px-3 py-1.5 bg-black/30 hover:bg-black/50 text-white rounded-lg text-xs font-semibold backdrop-blur-sm border border-white/10"
      >
        ✕ Quit
      </button>
      <button
        onClick={() => setMuted(!muted)}
        className="absolute top-2 right-2 z-50 px-3 py-1.5 bg-black/30 hover:bg-black/50 text-white rounded-lg text-xs backdrop-blur-sm border border-white/10"
      >
        {muted ? '🔇' : '🔊'}
      </button>
      <div ref={containerRef} className="w-full h-screen" />
      <ConfettiLayer pieces={pieces} />
    </div>
  );
}

// Default export for lazy loading
export default SouthlodgeRunners;
