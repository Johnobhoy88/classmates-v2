/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 */

import { motion } from 'motion/react';
import { ArrowLeft, Heart, Volume2, VolumeX } from 'lucide-react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import * as Tooltip from '@radix-ui/react-tooltip';

interface GameHeaderProps {
  lives: number;
  maxLives: number;
  idx: number;
  total: number;
  audioOn: boolean;
  onToggleAudio: () => void;
  onQuit: () => void;
  quitTitle?: string;
  quitMessage?: string;
}

export function GameHeader({
  lives, maxLives, idx, total,
  audioOn, onToggleAudio, onQuit,
  quitTitle = 'Leave the game?',
  quitMessage = 'Your progress on this round won\'t be saved.',
}: GameHeaderProps) {
  return (
    <>
      {/* Top bar */}
      <div className="px-4 pt-3 flex items-center justify-between">
        <AlertDialog.Root>
          <AlertDialog.Trigger asChild>
            <button className="text-white/30 hover:text-white/60 p-2 rounded-lg hover:bg-white/5 flex items-center gap-1.5 text-sm">
              <ArrowLeft className="w-4 h-4" /> Quit
            </button>
          </AlertDialog.Trigger>
          <AlertDialog.Portal>
            <AlertDialog.Overlay className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" />
            <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-slate-800 border border-white/15 rounded-2xl p-6 max-w-sm w-[90vw] text-center shadow-2xl">
              <AlertDialog.Title className="text-lg font-bold text-white mb-2">{quitTitle}</AlertDialog.Title>
              <AlertDialog.Description className="text-white/60 text-sm mb-5">{quitMessage}</AlertDialog.Description>
              <div className="flex gap-3">
                <AlertDialog.Cancel asChild>
                  <button className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/15 text-sm">Keep playing</button>
                </AlertDialog.Cancel>
                <AlertDialog.Action asChild>
                  <button onClick={onQuit} className="flex-1 py-2.5 bg-red-500/80 hover:bg-red-500 text-white font-semibold rounded-xl text-sm">Leave</button>
                </AlertDialog.Action>
              </div>
            </AlertDialog.Content>
          </AlertDialog.Portal>
        </AlertDialog.Root>
        <button onClick={onToggleAudio} className="text-white/30 hover:text-white/60 p-2">
          {audioOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Hearts + word count */}
      <div className="flex justify-center items-center gap-3 pb-1">
        <Tooltip.Provider delayDuration={300}>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <div className="flex gap-1.5 cursor-default">
                {Array.from({ length: maxLives }, (_, i) => {
                  const justLost = i === lives;
                  const alive = i < lives;
                  return (
                    <motion.div key={i}
                      animate={justLost ? {
                        scale: [1, 1.6, 0], rotate: [0, -20, 40],
                        y: [0, -8, 20], opacity: [1, 1, 0],
                      } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      <Heart className={`w-6 h-6 transition-all duration-300 ${
                        alive ? 'text-red-400 fill-red-400 drop-shadow-[0_0_6px_rgba(248,113,113,0.6)]' : 'text-white/10 scale-75'
                      }`} />
                    </motion.div>
                  );
                })}
              </div>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content sideOffset={8} className="bg-slate-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg border border-white/10 shadow-lg z-50">
                {lives} {lives === 1 ? 'life' : 'lives'} remaining
                <Tooltip.Arrow className="fill-slate-800" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
        <span className="text-white/25 text-xs font-medium">{idx + 1}/{total}</span>
      </div>
    </>
  );
}
