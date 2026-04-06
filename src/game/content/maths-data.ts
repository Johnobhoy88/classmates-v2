// Ported from classmates/src/scripts/games/maths.js
// All logic exactly preserved.

export interface MathQuestion {
  text: string;
  answer: number;
}

export type MathLevel = 1 | 2 | 3;

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function genMathQuestion(lv: MathLevel): MathQuestion {
  let a: number, b: number, op: string, ans: number;
  if (lv === 1) {
    op = Math.random() < .5 ? '+' : '-';
    if (op === '+') {
      a = rand(1, 9);
      b = rand(1, 10 - a);
      ans = a + b;
    } else {
      a = rand(2, 10);
      b = rand(1, a);
      ans = a - b;
    }
  } else if (lv === 2) {
    const r = Math.random();
    if (r < .4) {
      op = '+';
      a = rand(1, 15);
      b = rand(1, 20 - a);
      ans = a + b;
    } else if (r < .8) {
      op = '-';
      a = rand(5, 20);
      b = rand(1, a);
      ans = a - b;
    } else {
      op = '\u00D7';
      a = rand(2, 5);
      b = rand(2, 5);
      ans = a * b;
    }
  } else {
    const r = Math.random();
    if (r < .3) {
      op = '+';
      a = rand(10, 90);
      b = rand(5, 100 - a);
      ans = a + b;
    } else if (r < .6) {
      op = '-';
      a = rand(20, 100);
      b = rand(5, a);
      ans = a - b;
    } else if (r < .85) {
      op = '\u00D7';
      a = rand(2, 12);
      b = rand(2, 12);
      ans = a * b;
    } else {
      ans = rand(2, 12);
      b = rand(2, 12);
      a = ans * b;
      op = '\u00F7';
    }
  }
  return { text: a! + ' ' + op! + ' ' + b! + ' = ?', answer: ans! };
}
