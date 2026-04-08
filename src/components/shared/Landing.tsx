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

export function Landing() {
  const [mode, setMode] = useState<'select' | 'teacher' | 'pupil'>('select');

  if (mode === 'teacher') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative">
        <LandingScene />
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 relative z-10">
          <TeacherLogin />
          <div className="text-center pb-6">
            <button
              onClick={() => setMode('select')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              &larr; Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'pupil') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative">
        <LandingScene />
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 relative z-10">
          <PupilLogin />
          <div className="text-center pb-6">
            <button
              onClick={() => setMode('select')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              &larr; Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white relative">
      <LandingScene />

      <div className="text-center mb-12 relative z-10">
        <h1 className="text-5xl font-extrabold tracking-tight mb-3 drop-shadow-lg">
          Classmates
        </h1>
        <p className="text-lg font-medium drop-shadow-md" style={{ color: '#1a5c2e' }}>
          South Lodge Primary, Invergordon
        </p>
        <p className="text-sm mt-1 drop-shadow-sm" style={{ color: '#2e7d32' }}>
          Learning that feels like play
        </p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs relative z-10">
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

      <p className="mt-12 text-xs relative z-10 drop-shadow-sm" style={{ color: '#2e7d32aa' }}>
        Free. No tracking. No ads. Built for our school.
      </p>
    </div>
  );
}
