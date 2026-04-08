/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 */

import { type ReactNode } from 'react';
import { motion } from 'motion/react';
import { Volume2, VolumeX } from 'lucide-react';
import { GameBackButton } from '../shared/GameNav';
import type { LevelDef } from './themes';

interface PremiumLevelSelectProps {
  title: string;
  subtitle: string;
  icon: ReactNode;
  levels: LevelDef[];
  audioOn: boolean;
  onToggleAudio: () => void;
  onSelect: (level: number) => void;
  onExit: () => void;
}

export function PremiumLevelSelect({
  title, subtitle, icon, levels,
  audioOn, onToggleAudio, onSelect, onExit,
}: PremiumLevelSelectProps) {
  return (
    <div className="relative z-10 min-h-screen flex flex-col">
      <div className="px-4 pt-4 flex items-center justify-between">
        <GameBackButton onClick={onExit} />
        <button onClick={onToggleAudio} className="text-white/40 hover:text-white/70 p-2">
          {audioOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="text-6xl mb-3">{icon}</div>
          <h2 className="text-3xl font-extrabold text-white mb-2 drop-shadow-lg">{title}</h2>
          <p className="text-emerald-300/60 text-sm">{subtitle}</p>
        </motion.div>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          {levels.map((lv, i) => {
            const Icon = lv.icon;
            return (
              <motion.button key={lv.level}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => onSelect(lv.level)}
                className={`flex items-center gap-4 px-6 py-5 bg-gradient-to-r ${lv.color} rounded-2xl text-white shadow-lg`}
              >
                <Icon className="w-7 h-7 flex-shrink-0" />
                <div className="text-left">
                  <p className="font-bold text-lg">{lv.label}</p>
                  <p className="text-white/70 text-sm">{lv.desc} &middot; {lv.lives} lives</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
