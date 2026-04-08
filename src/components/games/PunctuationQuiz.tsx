/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 */

import { useState } from 'react';
import { PUNCT_DATA, type PunctLevel } from '../../game/content/punctuation-data';
import { QuizEngine, type QuizQuestion } from '../shared/QuizEngine';
import { LevelSelect } from '../shared/LevelSelect';
import { shuffle } from '../../utils/shuffle';

function buildQuestions(level: PunctLevel): QuizQuestion[] {
  return shuffle([...PUNCT_DATA[level]]).slice(0, 10).map((entry) => ({
    prompt: 'Which is correct?',
    display: entry.wrong,
    answer: entry.right,
    options: [entry.right, entry.wrong],
  }));
}

export function PunctuationQuiz({ onExit }: { onExit: () => void }) {
  const [level, setLevel] = useState<PunctLevel | null>(null);
  if (!level) return <LevelSelect title="Punctuation" color="#e44d26" icon=".?!" onSelect={(lv) => setLevel(lv as PunctLevel)} onBack={onExit} />;
  return <QuizEngine config={{ gameId: 'punctuation', title: 'Punctuation Done!', subtitle: `Level ${level}`, color: '#e44d26', icon: '.?!', questions: buildQuestions(level), adaptiveTopic: 'punctuation', wrongDelay: 1500 }} onExit={onExit} />;
}
