import { useState } from 'react';
import { genMathQuestion, type MathLevel } from '../../game/content/maths-data';
import { QuizEngine, type QuizQuestion } from '../shared/QuizEngine';
import { LevelSelect } from '../shared/LevelSelect';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function genOptions(answer: number): string[] {
  const opts = [String(answer)];
  while (opts.length < 4) {
    const off = Math.floor(Math.random() * Math.max(3, Math.abs(answer) * 0.3 + 1)) + 1;
    const wrong = answer + (Math.random() < 0.5 ? off : -off);
    const val = wrong < 0 ? Math.abs(wrong) : wrong;
    if (!opts.includes(String(val))) opts.push(String(val));
  }
  return shuffle(opts);
}

function buildQuestions(level: MathLevel): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  for (let i = 0; i < 10; i++) {
    const q = genMathQuestion(level);
    questions.push({
      prompt: 'What is the answer?',
      display: q.text,
      answer: String(q.answer),
      options: genOptions(q.answer),
    });
  }
  return questions;
}

export function MathsQuiz({ onExit }: { onExit: () => void }) {
  const [level, setLevel] = useState<MathLevel | null>(null);

  if (!level) return <LevelSelect title="Maths" color="#0984e3" icon="1+2" onSelect={(lv) => setLevel(lv as MathLevel)} onBack={onExit} />;

  return (
    <QuizEngine
      config={{
        gameId: 'maths',
        title: 'Maths Done!',
        subtitle: `Level ${level}`,
        color: '#0984e3',
        icon: '1+2',
        questions: buildQuestions(level),
        adaptiveTopic: 'maths',
      }}
      onExit={onExit}
    />
  );
}
