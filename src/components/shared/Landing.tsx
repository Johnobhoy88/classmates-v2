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

function Logo({ size = 180 }: { size?: number }) {
  return (
    <div className="relative inline-block mb-4">
      {/* Glow */}
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

export function Landing() {
  const [mode, setMode] = useState<'select' | 'teacher' | 'pupil'>('select');

  if (mode === 'teacher') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative">
        <LandingScene />
        <div className="relative z-10 flex flex-col items-center">
          <Logo size={70} />
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
            <TeacherLogin />
            <div className="text-center pb-6">
              <button onClick={() => setMode('select')} className="text-sm text-gray-500 hover:text-gray-700">
                &larr; Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'pupil') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative">
        <LandingScene />
        <div className="relative z-10 flex flex-col items-center">
          <Logo size={70} />
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
            <PupilLogin />
            <div className="text-center pb-6">
              <button onClick={() => setMode('select')} className="text-sm text-gray-500 hover:text-gray-700">
                &larr; Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white relative">
      <LandingScene />

      <div className="text-center relative z-10 flex flex-col items-center">
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
          <button
            onClick={() => setMode('pupil')}
            className="px-8 py-5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-2xl text-xl transition-all hover:scale-[1.02] shadow-lg shadow-emerald-500/30"
          >
            I'm a Pupil
          </button>
          <button
            onClick={() => setMode('teacher')}
            className="px-8 py-4 bg-white/80 hover:bg-white text-emerald-800 font-semibold rounded-2xl text-lg transition-all border border-white/40 shadow-md"
          >
            Teacher Sign In
          </button>
        </div>
      </div>

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
