import type { ReactNode } from 'react';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}

export function OfflineBanner() {
  return (
    <div className="bg-amber-500 text-white text-center text-sm py-1 font-semibold">
      You're offline — progress saves locally and syncs when you reconnect
    </div>
  );
}
