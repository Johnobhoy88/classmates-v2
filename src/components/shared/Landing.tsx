/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 */

import { useState } from 'react';
import { TeacherLogin } from '../auth/TeacherLogin';
import { PupilLogin } from '../auth/PupilLogin';
import { LandingScene } from './LandingScene';
import { AnimatePresence, motion } from 'motion/react';
import { GraduationCap, Users, Gamepad2 } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';

function Logo({ size = 180 }: { size?: number }) {
  return (
    <div className="relative inline-block mb-4">
      <div
        className="absolute rounded-full animate-pulse"
        style={{
          inset: -size * 0.18,
          background: 'radial-gradient(circle, rgba(255,235,59,0.25) 0%, rgba(255,255,255,0.1) 50%, transparent 70%)',
        }}
      />
      <img
        src="/logo.jpg"
        alt="South Lodge Primary"
        className="relative block rounded-full object-cover border-4 border-white shadow-xl"
        style={{
          width: size,
          height: size,
          boxShadow: '0 12px 40px rgba(0,0,0,0.15), 0 0 0 8px rgba(255,255,255,0.4)',
          animation: 'floatLogo 4s ease-in-out infinite',
        }}
      />
      <style>{`@keyframes floatLogo { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-6px) } }`}</style>
    </div>
  );
}

const pageVariants = {
  initial: { opacity: 0, y: 20, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.97 },
};

export function Landing() {
  const { loginAsGuest } = useAuth();
  const [mode, setMode] = useState<'select' | 'teacher' | 'pupil'>('select');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      <LandingScene />

      <AnimatePresence mode="wait">
        {mode === 'teacher' && (
          <motion.div
            key="teacher"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.25 }}
            className="relative z-10 flex flex-col items-center"
          >
            <Logo size={70} />
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
              <TeacherLogin />
              <div className="text-center pb-6">
                <button onClick={() => setMode('select')} className="text-sm text-gray-500 hover:text-gray-700">
                  &larr; Back
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {mode === 'pupil' && (
          <motion.div
            key="pupil"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.25 }}
            className="relative z-10 flex flex-col items-center"
          >
            <Logo size={70} />
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
              <PupilLogin />
              <div className="text-center pb-6">
                <button onClick={() => setMode('select')} className="text-sm text-gray-500 hover:text-gray-700">
                  &larr; Back
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {mode === 'select' && (
          <motion.div
            key="select"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.25 }}
            className="text-center relative z-10 flex flex-col items-center text-white"
          >
            <Logo size={180} />

            <h1 className="text-5xl font-extrabold tracking-tight mb-2 drop-shadow-lg">
              Classmates
            </h1>
            <p className="text-lg font-medium drop-shadow-md" style={{ color: '#1a5c2e' }}>
              South Lodge Primary, Invergordon
            </p>
            <p className="text-sm mt-1 mb-10 drop-shadow-sm" style={{ color: '#2e7d32' }}>
              Learning that feels like play
            </p>

            <div className="flex flex-col gap-4 w-full max-w-xs">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setMode('pupil')}
                className="px-8 py-5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-2xl text-xl shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-3"
              >
                <Users className="w-6 h-6" />
                I'm a Pupil
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setMode('teacher')}
                className="px-8 py-4 bg-white/80 hover:bg-white text-emerald-800 font-semibold rounded-2xl text-lg border border-white/40 shadow-md flex items-center justify-center gap-3"
              >
                <GraduationCap className="w-5 h-5" />
                Teacher Sign In
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={loginAsGuest}
                className="px-8 py-3 bg-white/20 hover:bg-white/30 text-white/80 font-medium rounded-2xl text-sm border border-white/20 flex items-center justify-center gap-2"
              >
                <Gamepad2 className="w-4 h-4" />
                Guest Play
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-3 right-4 z-10 text-right">
        <p className="text-xs font-medium text-white/80 drop-shadow-md">
          Free. No tracking. No ads.
        </p>
        <p className="text-xs font-medium text-white/70 drop-shadow-md">
          &copy; 2026 HighlandAI &middot; CC BY-NC 4.0
        </p>
      </div>
    </div>
  );
}
