/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 */

interface LevelSelectProps {
  title: string;
  color: string;
  icon: string;
  onSelect: (level: number) => void;
  onBack: () => void;
  levels?: Array<{ level: number; label: string; desc: string }>;
}

const DEFAULT_LEVELS = [
  { level: 1, label: 'Level 1 — Early (P1)', desc: 'Ages 5-6' },
  { level: 2, label: 'Level 2 — First (P2-P4)', desc: 'Ages 6-8' },
  { level: 3, label: 'Level 3 — Second (P5-P7)', desc: 'Ages 8-10' },
];

export function LevelSelect({ title, color, icon, onSelect, onBack, levels }: LevelSelectProps) {
  const lvls = levels || DEFAULT_LEVELS;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: `linear-gradient(to bottom, #0f172a, ${color}20)` }}>
      <button onClick={onBack}
        className="absolute top-4 left-4 text-white/40 hover:text-white/70 text-sm font-semibold px-3 py-2 rounded-lg hover:bg-white/5">
        &larr; Back
      </button>

      <div className="text-center mb-8">
        <div className="text-4xl mb-3">{icon}</div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <p className="text-white/50 text-sm mt-1">Choose your level</p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        {lvls.map((lv) => (
          <button
            key={lv.level}
            onClick={() => onSelect(lv.level)}
            className="px-6 py-5 rounded-2xl border-2 border-white/15 bg-white/10 hover:bg-white/15 hover:border-white/25 transition-all active:scale-[0.97] text-left"
          >
            <span className="text-white font-bold text-lg">{lv.label}</span>
            <span className="text-white/40 text-sm block mt-0.5">{lv.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
