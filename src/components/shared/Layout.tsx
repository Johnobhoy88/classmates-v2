import type { ReactNode } from 'react';
import { useOffline } from '../../hooks/useOffline';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}

export function OfflineBanner() {
  const { online, syncing, manualSync } = useOffline();

  if (online) return null;

  return (
    <div className="bg-amber-500 text-white text-center text-sm py-2 px-4 font-semibold flex items-center justify-center gap-3">
      <span>You're offline — progress saves locally and syncs when you reconnect</span>
      {!syncing && (
        <button
          onClick={() => manualSync()}
          className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors"
        >
          Retry
        </button>
      )}
      {syncing && <span className="text-xs opacity-70">Syncing...</span>}
    </div>
  );
}
