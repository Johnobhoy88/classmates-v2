import { genQuestion as genBondQuestion } from '../../game/content/bonds-data';
import { QuizEngine, type QuizQuestion } from '../shared/QuizEngine';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a;
}

function genOptions(answer: number, target: number): string[] {
  const opts = [String(answer)];
  while (opts.length < 4) {
    const wrong = Math.max(0, answer + Math.floor(Math.random() * 5) - 2);
    if (wrong !== answer && wrong <= target && !opts.includes(String(wrong))) opts.push(String(wrong));
  }
  return shuffle(opts);
}

function buildQuestions(): QuizQuestion[] {
  const targets = [5, 10, 10, 10, 20, 20, 10, 10, 5, 10];
  return targets.map((target) => {
    const q = genBondQuestion(target);
    return {
      prompt: q.display,
      display: `${q.display}`,
      answer: String(q.answer),
      options: genOptions(q.answer, target),
    };
  });
}

export function BondsQuiz({ onExit }: { onExit: () => void }) {
  return (
    <QuizEngine
      config={{ gameId: 'bonds', title: 'Number Bonds Done!', subtitle: '', color: '#11998e', icon: '10', questions: buildQuestions(), adaptiveTopic: 'bonds' }}
      onExit={onExit}
    />
  );
}
