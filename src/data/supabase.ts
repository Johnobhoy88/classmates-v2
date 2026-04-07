/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Teacher = {
  id: string;
  email: string;
  display_name: string | null;
  school_name: string;
  class_code: string;
  created_at: string;
};

export type Pupil = {
  id: string;
  teacher_id: string;
  display_name: string;
  pin: string;
  avatar_config: Record<string, unknown>;
  created_at: string;
};

export type Progress = {
  id: string;
  pupil_id: string;
  game_id: string;
  skill_id: string;
  score: number;
  stars: number;
  streak: number;
  best_streak: number;
  mastery_level: number;
  attempts: number;
  coins_earned: number;
  last_played_at: string;
  synced_at: string | null;
};

export type Assignment = {
  id: string;
  teacher_id: string;
  game_id: string;
  skill_id: string | null;
  message: string | null;
  active: boolean;
  created_at: string;
};

export type Reward = {
  id: string;
  pupil_id: string;
  coins: number;
  unlocked_items: string[];
  equipped: Record<string, string>;
  achievements: string[];
};
