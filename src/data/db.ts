import Dexie, { type Table } from 'dexie';

export interface LocalPupil {
  id: string;
  teacher_id: string;
  display_name: string;
  pin: string;
  avatar_config: Record<string, unknown>;
}

export interface LocalProgress {
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
}

export interface LocalReward {
  id: string;
  pupil_id: string;
  coins: number;
  unlocked_items: string[];
  equipped: Record<string, string>;
  achievements: string[];
}

export interface LocalAssignment {
  id: string;
  teacher_id: string;
  game_id: string;
  skill_id: string | null;
  message: string | null;
  active: boolean;
}

class ClassmatesDB extends Dexie {
  pupils!: Table<LocalPupil, string>;
  progress!: Table<LocalProgress, string>;
  rewards!: Table<LocalReward, string>;
  assignments!: Table<LocalAssignment, string>;

  constructor() {
    super('classmates-v2');
    this.version(1).stores({
      pupils: 'id, teacher_id, [teacher_id+pin]',
      progress: 'id, pupil_id, [pupil_id+game_id+skill_id]',
      rewards: 'id, pupil_id',
      assignments: 'id, teacher_id',
    });
  }
}

export const db = new ClassmatesDB();
