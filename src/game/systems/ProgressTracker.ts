import { db } from '../../data/db';

export interface GameResult {
  pupilId: string;
  gameId: string;
  skillId?: string;
  score: number;
  stars: number;
  streak: number;
  bestStreak: number;
  correct: number;
  total: number;
}

export async function recordGameResult(result: GameResult): Promise<void> {
  const key = `${result.pupilId}-${result.gameId}-${result.skillId || 'general'}`;

  // Try to get existing progress
  const existing = await db.progress
    .where('[pupil_id+game_id+skill_id]')
    .equals([result.pupilId, result.gameId, result.skillId || 'general'])
    .first();

  if (existing) {
    await db.progress.update(existing.id, {
      score: Math.max(existing.score, result.score),
      stars: Math.max(existing.stars, result.stars),
      streak: result.streak,
      best_streak: Math.max(existing.best_streak, result.bestStreak),
      mastery_level: calculateMastery(existing.attempts + 1, Math.max(existing.stars, result.stars)),
      attempts: existing.attempts + 1,
      coins_earned: existing.coins_earned + calculateCoins(result.stars, result.correct, result.total),
      last_played_at: new Date().toISOString(),
      synced_at: null, // Mark for sync
    });
  } else {
    const coins = calculateCoins(result.stars, result.correct, result.total);
    await db.progress.add({
      id: key,
      pupil_id: result.pupilId,
      game_id: result.gameId,
      skill_id: result.skillId || 'general',
      score: result.score,
      stars: result.stars,
      streak: result.streak,
      best_streak: result.bestStreak,
      mastery_level: calculateMastery(1, result.stars),
      attempts: 1,
      coins_earned: coins,
      last_played_at: new Date().toISOString(),
      synced_at: null,
    });
  }

  // Update rewards (coins)
  await updateRewardCoins(result.pupilId, calculateCoins(result.stars, result.correct, result.total));
}

function calculateMastery(attempts: number, bestStars: number): number {
  if (bestStars >= 3 && attempts >= 3) return 3;
  if (bestStars >= 2 && attempts >= 2) return 2;
  if (bestStars >= 1) return 1;
  return 0;
}

function calculateCoins(stars: number, correct: number, total: number): number {
  const base = stars === 3 ? 5 : stars === 2 ? 3 : stars === 1 ? 2 : 1;
  const bonus = correct === total ? 5 : 0;
  return base + bonus;
}

async function updateRewardCoins(pupilId: string, coins: number): Promise<void> {
  const existing = await db.rewards.where('pupil_id').equals(pupilId).first();
  if (existing) {
    await db.rewards.update(existing.id, {
      coins: existing.coins + coins,
    });
  } else {
    await db.rewards.add({
      id: `reward-${pupilId}`,
      pupil_id: pupilId,
      coins,
      unlocked_items: [],
      equipped: {},
      achievements: [],
    });
  }
}

export async function getPupilProgress(pupilId: string): Promise<{
  totalStars: number;
  totalGames: number;
  totalCoins: number;
}> {
  const records = await db.progress.where('pupil_id').equals(pupilId).toArray();
  const reward = await db.rewards.where('pupil_id').equals(pupilId).first();

  return {
    totalStars: records.reduce((sum, r) => sum + r.stars, 0),
    totalGames: records.reduce((sum, r) => sum + r.attempts, 0),
    totalCoins: reward?.coins || 0,
  };
}
