/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 */

import { useState } from 'react';
import { QuizEngine, type QuizQuestion } from '../shared/QuizEngine';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a;
}

function genTimesQuestions(table: number): QuizQuestion[] {
  const factors = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  return factors.map((b) => {
    const answer = table * b;
    const opts = [String(answer)];
    while (opts.length < 4) {
      const off = Math.floor(Math.random() * Math.max(table, 3)) + 1;
      const wrong = answer + (Math.random() < 0.5 ? off : -off);
      if (wrong > 0 && !opts.includes(String(wrong))) opts.push(String(wrong));
    }
    return {
      prompt: 'What is the answer?',
      display: `${table} \u00D7 ${b}`,
      answer: String(answer),
      options: shuffle(opts),
    };
  });
}

function genMixedQuestions(): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  for (let i = 0; i < 12; i++) {
    const a = Math.floor(Math.random() * 11) + 2;
    const b = Math.floor(Math.random() * 11) + 2;
    const answer = a * b;
    const opts = [String(answer)];
    while (opts.length < 4) {
      const off = Math.floor(Math.random() * Math.max(a, 3)) + 1;
      const wrong = answer + (Math.random() < 0.5 ? off : -off);
      if (wrong > 0 && !opts.includes(String(wrong))) opts.push(String(wrong));
    }
    questions.push({
      prompt: 'What is the answer?',
      display: `${a} \u00D7 ${b}`,
      answer: String(answer),
      options: shuffle(opts),
    });
  }
  return questions;
}

export function TimesQuiz({ onExit }: { onExit: () => void }) {
  const [table, setTable] = useState<number | null>(null);

  if (table === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-slate-900 to-purple-900/30">
        <button onClick={onExit} className="absolute top-4 left-4 text-white/40 hover:text-white/70 text-sm font-semibold px-3 py-2 rounded-lg hover:bg-white/5">&larr; Back</button>
        <div className="text-4xl mb-3">{'\u00D7'}</div>
        <h2 className="text-2xl font-bold text-white mb-6">Times Tables</h2>
        <div className="grid grid-cols-4 gap-3 mb-4">
          {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((t) => (
            <button key={t} onClick={() => setTable(t)}
              className="w-16 h-16 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 hover:border-white/25 text-white font-bold text-lg transition-all active:scale-95">
              {t}&times;
            </button>
          ))}
          <button onClick={() => setTable(0)}
            className="w-16 h-16 rounded-2xl bg-purple-500/30 hover:bg-purple-500/40 border border-purple-400/30 text-purple-200 font-bold text-sm transition-all active:scale-95">
            Mix
          </button>
        </div>
      </div>
    );
  }

  const questions = table === 0 ? genMixedQuestions() : genTimesQuestions(table);
  const subtitle = table === 0 ? 'Mixed tables' : `${table}\u00D7 table`;

  return (
    <QuizEngine
      config={{
        gameId: 'times',
        title: 'Times Tables Done!',
        subtitle,
        color: '#8a4aba',
        icon: '\u00D7',
        questions,
        adaptiveTopic: 'times',
        correctDelay: 400,
        wrongDelay: 1000,
      }}
      onExit={onExit}
    />
  );
}
