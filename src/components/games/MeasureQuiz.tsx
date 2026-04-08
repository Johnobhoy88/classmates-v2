/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 */

import { useState } from 'react';
import { MEASURE_DATA, type MeasureLevel } from '../../game/content/measure-data';
import { QuizEngine, type QuizQuestion } from '../shared/QuizEngine';
import { LevelSelect } from '../shared/LevelSelect';
import { shuffle } from '../../utils/shuffle';

function buildQuestions(level: MeasureLevel): QuizQuestion[] {
  return shuffle([...MEASURE_DATA[level]]).slice(0, 10).map((entry) => ({
    prompt: entry.q,
    answer: entry.correct,
    options: [...entry.opts],
  }));
}

export function MeasureQuiz({ onExit }: { onExit: () => void }) {
  const [level, setLevel] = useState<MeasureLevel | null>(null);

  if (!level) return <LevelSelect title="Measurement" color="#0984e3" icon="cm" onSelect={(lv) => setLevel(lv as MeasureLevel)} onBack={onExit} />;

  return (
    <QuizEngine
      config={{ gameId: 'measure', title: 'Measurement Done!', subtitle: `Level ${level}`, color: '#0984e3', icon: 'cm', questions: buildQuestions(level), adaptiveTopic: 'measure' }}
      onExit={onExit}
    />
  );
}
