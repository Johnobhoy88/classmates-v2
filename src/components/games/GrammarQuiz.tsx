/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 */

import { useState } from 'react';
import { GRAMMAR_DATA, type GrammarLevel } from '../../game/content/grammar-data';
import { QuizEngine, type QuizQuestion } from '../shared/QuizEngine';
import { LevelSelect } from '../shared/LevelSelect';
import { shuffle } from '../../utils/shuffle';

function buildQuestions(level: GrammarLevel): QuizQuestion[] {
  return shuffle([...GRAMMAR_DATA[level]]).slice(0, 10).map((entry) => ({
    prompt: `What type of word is "${entry.w}"?`,
    display: entry.w,
    answer: entry.a,
    options: [...entry.opts],
  }));
}

export function GrammarQuiz({ onExit }: { onExit: () => void }) {
  const [level, setLevel] = useState<GrammarLevel | null>(null);

  if (!level) return <LevelSelect title="Grammar" color="#636e72" icon="N V" theme="forest" onSelect={(lv) => setLevel(lv as GrammarLevel)} onBack={onExit} />;

  return (
    <QuizEngine
      config={{ gameId: 'grammar', title: 'Grammar Done!', subtitle: `Level ${level}`, color: '#636e72', icon: 'N V', questions: buildQuestions(level), adaptiveTopic: 'grammar', theme: 'forest' }}
      onExit={onExit}
    />
  );
}
