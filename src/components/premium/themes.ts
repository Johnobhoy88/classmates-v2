/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 */

import type { ComponentType } from 'react';
import { Star, Zap, Trophy } from 'lucide-react';

/** Reactive state passed to background + audio every frame */
export interface ThemeState {
  progress: number;      // 0-1
  streak: number;
  livesRatio: number;    // 0-1
  event: 'none' | 'correct' | 'wrong' | 'wordComplete' | 'wordFailed' | 'gameComplete';
}

/** Level definition for level select */
export interface LevelDef {
  level: number;
  label: string;
  desc: string;
  icon: ComponentType<{ className?: string }>;
  color: string; // tailwind gradient classes e.g. 'from-emerald-500 to-teal-600'
  lives: number;
}

/** Standard 3-level preset */
export const STANDARD_LEVELS: LevelDef[] = [
  { level: 1, label: 'Easy', desc: 'Getting started', icon: Star, color: 'from-emerald-500 to-teal-600', lives: 7 },
  { level: 2, label: 'Medium', desc: 'A bit harder', icon: Zap, color: 'from-blue-500 to-indigo-600', lives: 6 },
  { level: 3, label: 'Hard', desc: 'Challenge mode', icon: Trophy, color: 'from-purple-500 to-pink-600', lives: 5 },
];

/** Result from a completed game */
export interface GameResult {
  correct: number;
  total: number;
  stars: number;
  bestStreak: number;
  missed: Array<{ w: string; h: string; emoji?: string }>;
}
