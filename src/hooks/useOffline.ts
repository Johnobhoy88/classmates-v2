import { useEffect, useState, useCallback } from 'react';
import { syncToSupabase } from '../data/sync';

export function useOffline() {
  const [online, setOnline] = useState(navigator.onLine);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const manualSync = useCallback(async () => {
    if (!navigator.onLine || syncing) return { synced: 0, errors: 0 };
    setSyncing(true);
    const result = await syncToSupabase();
    setSyncing(false);
    if (result.synced > 0) setLastSynced(new Date());
    return result;
  }, [syncing]);

  return { online, lastSynced, syncing, manualSync };
}
