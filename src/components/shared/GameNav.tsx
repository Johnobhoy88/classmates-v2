/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 */

import { ArrowLeft, Loader2 } from 'lucide-react';

/** Consistent back/quit button for all games */
export function GameBackButton({ onClick, label = 'Back' }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      className="text-white/40 hover:text-white/70 text-sm font-semibold px-3 py-2 rounded-lg hover:bg-white/5 flex items-center gap-1.5 transition-colors"
    >
      <ArrowLeft className="w-4 h-4" />
      {label}
    </button>
  );
}

/** Consistent loading spinner for all games */
export function GameLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="flex items-center gap-3 text-white text-lg font-bold">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
        Loading game...
      </div>
    </div>
  );
}

/** Streak badge messages — consistent across all games */
export function streakMessage(streak: number): string {
  if (streak >= 10) return `\u{1F525}\u{1F525}\u{1F525} ${streak} on fire!`;
  if (streak >= 5) return `\u{1F525}\u{1F525} ${streak} streak!`;
  if (streak >= 3) return `\u{1F525} ${streak} in a row!`;
  if (streak >= 2) return `\u2B50 ${streak} streak`;
  return '';
}
