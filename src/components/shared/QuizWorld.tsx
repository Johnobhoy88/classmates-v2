/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 *
 * QUIZ WORLD — React wrapper for Phaser 3 quiz background
 * Mounts a Phaser game behind the React quiz UI, forwards gameplay
 * events (correct/wrong/complete) to the scene for particle bursts,
 * camera effects, and mascot animations.
 */

import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { QuizWorldScene, type QuizTheme } from '../../game/scenes/QuizWorldScene';
import type { ThemeState } from '../premium/themes';

export type { QuizTheme };

interface QuizWorldProps {
  theme: QuizTheme;
  state: ThemeState;
}

export function QuizWorld({ theme, state }: QuizWorldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<QuizWorldScene | null>(null);
  const lastEvent = useRef<string>('none');

  // Create/destroy Phaser game on mount/theme change
  useEffect(() => {
    if (!containerRef.current) return;

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: containerRef.current.clientWidth || window.innerWidth,
      height: containerRef.current.clientHeight || window.innerHeight,
      backgroundColor: '#000000',
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [],
      // No physics needed for background
      physics: {
        default: 'arcade',
        arcade: { gravity: { x: 0, y: 0 }, debug: false },
      },
      // Disable input — background only, React handles interaction
      input: {
        mouse: false,
        touch: false,
        keyboard: false,
      },
      render: {
        pixelArt: false,
        antialias: true,
        transparent: false,
      },
      // Don't let Phaser grab focus from React
      autoFocus: false,
    });

    gameRef.current = game;

    // Add and start the scene with theme data
    game.scene.add('QuizWorld', QuizWorldScene, true, { theme });

    // Get scene reference once it's ready
    const checkScene = () => {
      const scene = game.scene.getScene('QuizWorld') as QuizWorldScene;
      if (scene && scene.scene.isActive()) {
        sceneRef.current = scene;
      } else {
        requestAnimationFrame(checkScene);
      }
    };
    requestAnimationFrame(checkScene);

    return () => {
      sceneRef.current = null;
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [theme]);

  // Forward events to Phaser scene
  useEffect(() => {
    if (state.event !== 'none' && state.event !== lastEvent.current) {
      lastEvent.current = state.event;
      sceneRef.current?.handleEvent(state.event);
    }
    if (state.event === 'none') {
      lastEvent.current = 'none';
    }
  }, [state.event]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0, pointerEvents: 'none' }}
    />
  );
}
