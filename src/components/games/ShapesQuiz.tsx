/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 */

import { useState } from 'react';
import { SHAPES_DATA, type ShapesLevel } from '../../game/content/shapes-data';
import { QuizEngine, type QuizQuestion } from '../shared/QuizEngine';
import { LevelSelect } from '../shared/LevelSelect';
import { shuffle } from '../../utils/shuffle';

function buildQuestions(level: ShapesLevel): QuizQuestion[] {
  return shuffle([...SHAPES_DATA[level]]).slice(0, 10).map((entry) => ({
    prompt: entry.q,
    displayHtml: entry.svg || undefined,
    answer: entry.correct,
    options: [...entry.opts],
  }));
}

export function ShapesQuiz({ onExit }: { onExit: () => void }) {
  const [level, setLevel] = useState<ShapesLevel | null>(null);
  if (!level) return <LevelSelect title="Shapes" color="#6c5ce7" icon="\u25B3" theme="cosmos" onSelect={(lv) => setLevel(lv as ShapesLevel)} onBack={onExit} />;
  return <QuizEngine config={{ gameId: 'shapes', title: 'Shapes Done!', subtitle: `Level ${level}`, color: '#6c5ce7', icon: '\u25B3', questions: buildQuestions(level), adaptiveTopic: 'shapes', theme: 'cosmos' }} onExit={onExit} />;
}
