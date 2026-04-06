// Ported from classmates/src/scripts/games/number-bonds.js
// All logic exactly preserved.

export interface BondQuestionA {
  format: 'A';
  target: number;
  shown: number;
  answer: number;
  display: string;
}

export interface BondQuestionB {
  format: 'B';
  target: number;
  shown: number;
  answer: number;
  display: string;
}

export interface BondQuestionC {
  format: 'C';
  target: number;
  left: number | '?';
  right: number | '?';
  answer: number;
  display: 'bar';
}

export type BondQuestion = BondQuestionA | BondQuestionB | BondQuestionC;

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function genQuestion(target: number): BondQuestion {
  const format = (['A', 'B', 'C'] as const)[Math.floor(Math.random() * 3)];
  let a: number, missing: number;
  if (target <= 10) {
    a = rand(1, target - 1);
  } else if (target <= 20) {
    a = rand(1, target - 1);
  } else {
    a = rand(5, target - 5);
    a = Math.round(a / 5) * 5;
  }
  missing = target - a;
  if (format === 'B') {
    return { format: format, target: target, shown: missing, answer: a, display: '? + ' + missing + ' = ' + target };
  } else if (format === 'C') {
    const showFirst = Math.random() < 0.5;
    return { format: format, target: target, left: showFirst ? a : '?', right: showFirst ? '?' : missing, answer: showFirst ? missing : a, display: 'bar' };
  } else {
    return { format: format, target: target, shown: a, answer: missing, display: a + ' + ? = ' + target };
  }
}
