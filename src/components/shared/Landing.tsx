import { useState } from 'react';
import { TeacherLogin } from '../auth/TeacherLogin';
import { PupilLogin } from '../auth/PupilLogin';

export function Landing() {
  const [mode, setMode] = useState<'select' | 'teacher' | 'pupil'>('select');

  if (mode === 'teacher') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-teal-900 to-teal-700">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-emerald-800 to-emerald-600">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-teal-900 to-emerald-900 text-white">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold tracking-tight mb-3">
          Classmates
        </h1>
        <p className="text-lg text-teal-200 font-medium">
          South Lodge Primary, Invergordon
        </p>
        <p className="text-sm text-teal-300/60 mt-1">
          Learning that feels like play
        </p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          onClick={() => setMode('pupil')}
          className="px-8 py-5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-2xl text-xl transition-all hover:scale-[1.02] shadow-lg shadow-emerald-500/30"
        >
          I'm a Pupil
        </button>
        <button
          onClick={() => setMode('teacher')}
          className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl text-lg transition-all border border-white/20"
        >
          Teacher Sign In
        </button>
      </div>

      <p className="mt-12 text-xs text-teal-300/40">
        Free. No tracking. No ads. Built for our school.
      </p>
    </div>
  );
}
