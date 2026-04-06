import { supabase } from './supabase';
import { db } from './db';

let syncInProgress = false;

export async function syncToSupabase(): Promise<{ synced: number; errors: number }> {
  if (syncInProgress || !navigator.onLine) return { synced: 0, errors: 0 };
  syncInProgress = true;

  let synced = 0;
  let errors = 0;

  try {
    // Sync unsynced progress records
    const unsyncedProgress = await db.progress
      .filter((p) => p.synced_at === null)
      .toArray();

    for (const record of unsyncedProgress) {
      const { error } = await supabase.from('progress').upsert(
        {
          id: record.id,
          pupil_id: record.pupil_id,
          game_id: record.game_id,
          skill_id: record.skill_id,
          score: record.score,
          stars: record.stars,
          streak: record.streak,
          best_streak: record.best_streak,
          mastery_level: record.mastery_level,
          attempts: record.attempts,
          coins_earned: record.coins_earned,
          last_played_at: record.last_played_at,
        },
        { onConflict: 'pupil_id,game_id,skill_id' }
      );

      if (error) {
        errors++;
      } else {
        await db.progress.update(record.id, {
          synced_at: new Date().toISOString(),
        });
        synced++;
      }
    }

    // Sync rewards
    const unsyncedRewards = await db.rewards.toArray();
    for (const reward of unsyncedRewards) {
      await supabase.from('rewards').upsert({
        id: reward.id,
        pupil_id: reward.pupil_id,
        coins: reward.coins,
        unlocked_items: reward.unlocked_items,
        equipped: reward.equipped,
        achievements: reward.achievements,
      });
    }
  } catch {
    errors++;
  } finally {
    syncInProgress = false;
  }

  return { synced, errors };
}

export function startAutoSync(intervalMs = 30000): () => void {
  const handle = setInterval(() => {
    if (navigator.onLine) syncToSupabase();
  }, intervalMs);

  const onlineHandler = () => syncToSupabase();
  window.addEventListener('online', onlineHandler);

  return () => {
    clearInterval(handle);
    window.removeEventListener('online', onlineHandler);
  };
}
