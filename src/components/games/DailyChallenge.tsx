/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 */

import { genMathQuestion } from '../../game/content/maths-data';
import { SPELLING } from '../../game/content/spelling-data';
import { GRAMMAR_DATA } from '../../game/content/grammar-data';
import { VOCAB_DATA } from '../../game/content/vocab-data';
import { QuizEngine, type QuizQuestion } from '../shared/QuizEngine';

// Faithful port of V1 Daily Challenge: mixed questions from all subjects
// Uses today's date as seed so every pupil gets the same daily set

function seededRandom(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
}

function seededShuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDailyQuestions(): QuizQuestion[] {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const rng = seededRandom(seed);
  const questions: QuizQuestion[] = [];

  // 3 maths questions
  for (let i = 0; i < 3; i++) {
    const q = genMathQuestion(2);
    const answer = String(q.answer);
    const opts = [answer];
    while (opts.length < 4) {
      const off = Math.floor(rng() * 6) + 1;
      const wrong = String(q.answer + (rng() < 0.5 ? off : -off));
      if (!opts.includes(wrong) && Number(wrong) >= 0) opts.push(wrong);
    }
    questions.push({ prompt: 'What is the answer?', display: q.text, answer, options: seededShuffle(opts, rng) });
  }

  // 2 spelling hints
  const spellingPool = seededShuffle([...SPELLING[2]], rng);
  for (let i = 0; i < 2 && i < spellingPool.length; i++) {
    const item = spellingPool[i]; const word = item.w.toLowerCase();
    const hideIdx = Math.floor(rng() * word.length);
    const display = word.split('').map((ch, idx) => idx === hideIdx ? '_' : ch).join('');
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    const opts = [word[hideIdx]];
    while (opts.length < 4) { const ch = letters[Math.floor(rng() * 26)]; if (!opts.includes(ch)) opts.push(ch); }
    questions.push({ prompt: item.h, display, answer: word[hideIdx], options: seededShuffle(opts, rng) });
  }

  // 2 grammar
  const grammarPool = seededShuffle([...GRAMMAR_DATA[1]], rng);
  for (let i = 0; i < 2 && i < grammarPool.length; i++) {
    const g = grammarPool[i];
    questions.push({ prompt: `What type of word is "${g.w}"?`, display: g.w, answer: g.a, options: [...g.opts] });
  }

  // 2 vocab
  const vocabPool = seededShuffle([...VOCAB_DATA[1]], rng);
  for (let i = 0; i < 2 && i < vocabPool.length; i++) {
    const v = vocabPool[i];
    questions.push({ prompt: v.d, answer: v.w, options: seededShuffle([v.w, ...v.wrong.slice(0, 3)], rng) });
  }

  // 1 bonus maths
  const bonus = genMathQuestion(1);
  const bonusAns = String(bonus.answer);
  const bonusOpts = [bonusAns];
  while (bonusOpts.length < 4) { const w = String(bonus.answer + Math.floor(rng() * 5) - 2); if (!bonusOpts.includes(w) && Number(w) >= 0) bonusOpts.push(w); }
  questions.push({ prompt: 'Bonus!', display: bonus.text, answer: bonusAns, options: seededShuffle(bonusOpts, rng) });

  return seededShuffle(questions, rng);
}

export function DailyChallenge({ onExit }: { onExit: () => void }) {
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <QuizEngine
      config={{
        gameId: 'daily',
        title: 'Daily Challenge Complete!',
        subtitle: today,
        color: '#f7971e',
        icon: '\u{1F31F}',
        questions: buildDailyQuestions(),
        theme: 'cosmos',
      }}
      onExit={onExit}
    />
  );
}
