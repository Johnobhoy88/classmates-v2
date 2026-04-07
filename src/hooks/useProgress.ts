/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 */

import { useEffect, useState } from 'react';
import { getPupilProgress } from '../game/systems/ProgressTracker';

export interface PupilStats {
  totalStars: number;
  totalGames: number;
  totalCoins: number;
}

export function useProgress(pupilId: string | undefined) {
  const [stats, setStats] = useState<PupilStats>({
    totalStars: 0,
    totalGames: 0,
    totalCoins: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pupilId) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    async function load() {
      const data = await getPupilProgress(pupilId!);
      if (!cancelled) {
        setStats(data);
        setLoading(false);
      }
    }
    load();

    return () => { cancelled = true; };
  }, [pupilId]);

  const refresh = async () => {
    if (!pupilId) return;
    const data = await getPupilProgress(pupilId);
    setStats(data);
  };

  return { stats, loading, refresh };
}
