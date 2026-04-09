/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 *
 * LEVEL SELECT — Premium animated level picker for all quiz games
 * Motion spring animations, Phaser themed background, gradient level cards
 */

import { motion } from 'motion/react';
import { Star, Zap, Trophy } from 'lucide-react';
import { QuizWorld, type QuizTheme } from './QuizWorld';
import { GameBackButton } from './GameNav';
import { sfxClick } from '../premium';
import type { ThemeState } from '../premium';

interface LevelSelectProps {
  title: string;
  color: string;
  icon: string;
  onSelect: (level: number) => void;
  onBack: () => void;
  levels?: Array<{ level: number; label: string; desc: string }>;
  /** Visual theme for Phaser background */
  theme?: QuizTheme;
}

const DEFAULT_LEVELS = [
  { level: 1, label: 'Level 1 — Early (P1)', desc: 'Ages 5-6' },
  { level: 2, label: 'Level 2 — First (P2-P4)', desc: 'Ages 6-8' },
  { level: 3, label: 'Level 3 — Second (P5-P7)', desc: 'Ages 8-10' },
];

const LEVEL_ICONS = [Star, Zap, Trophy];
const LEVEL_GRADIENTS = [
  'from-emerald-500 to-teal-600',
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-pink-600',
];

// Static theme state for level select (no gameplay happening)
const IDLE_STATE: ThemeState = { progress: 0, streak: 0, livesRatio: 1, event: 'none' };

export function LevelSelect({ title, color, icon, onSelect, onBack, levels, theme }: LevelSelectProps) {
  const lvls = levels || DEFAULT_LEVELS;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Phaser background */}
      {theme && <QuizWorld theme={theme} state={IDLE_STATE} />}

      {/* Fallback gradient if no theme */}
      {!theme && (
        <div className="fixed inset-0" style={{ background: `linear-gradient(to bottom, #0f172a, ${color}20)`, zIndex: 0 }} />
      )}

      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="px-4 pt-4">
          <GameBackButton onClick={onBack} />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4">
          {/* Title section */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 12 }}
            className="text-center mb-8"
          >
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 8, delay: 0.1 }}
              className="text-5xl mb-3"
            >
              {icon}
            </motion.div>
            <h2 className="text-3xl font-extrabold text-white mb-2 drop-shadow-lg">{title}</h2>
            <p className="text-white/50 text-sm">Choose your level</p>
          </motion.div>

          {/* Level cards */}
          <div className="flex flex-col gap-4 w-full max-w-xs">
            {lvls.map((lv, i) => {
              const Icon = LEVEL_ICONS[i] || Star;
              const gradient = LEVEL_GRADIENTS[i] || LEVEL_GRADIENTS[0];

              return (
                <motion.button
                  key={lv.level}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: 'spring', damping: 12, delay: 0.15 + i * 0.1 }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => { sfxClick(); onSelect(lv.level); }}
                  className={`flex items-center gap-4 px-6 py-5 bg-gradient-to-r ${gradient} rounded-2xl text-white shadow-lg shadow-black/20 transition-shadow hover:shadow-xl`}
                >
                  <Icon className="w-7 h-7 flex-shrink-0 drop-shadow" />
                  <div className="text-left">
                    <p className="font-bold text-lg">{lv.label}</p>
                    <p className="text-white/70 text-sm">{lv.desc}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
