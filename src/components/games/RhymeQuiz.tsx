/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 */

import { useState } from 'react';
import { RHYME_DATA, type RhymeLevel } from '../../game/content/rhyme-data';
import { QuizEngine, type QuizQuestion } from '../shared/QuizEngine';
import { LevelSelect } from '../shared/LevelSelect';
import { shuffle } from '../../utils/shuffle';

function buildQuestions(level: RhymeLevel): QuizQuestion[] {
  return shuffle([...RHYME_DATA[level]]).slice(0, 10).map((entry) => {
    const correctRhyme = entry.r[Math.floor(Math.random() * entry.r.length)];
    const distractors = shuffle([...entry.wrong]).slice(0, 3);
    return {
      prompt: `Which word rhymes with "${entry.w}"?`,
      display: entry.w,
      answer: correctRhyme,
      options: [correctRhyme, ...distractors],
    };
  });
}

export function RhymeQuiz({ onExit }: { onExit: () => void }) {
  const [level, setLevel] = useState<RhymeLevel | null>(null);

  if (!level) return <LevelSelect title="Rhyming" color="#6c5ce7" icon="\u266B" theme="forest" onSelect={(lv) => setLevel(lv as RhymeLevel)} onBack={onExit} />;

  return (
    <QuizEngine
      config={{ gameId: 'rhyme', title: 'Rhyming Done!', subtitle: `Level ${level}`, color: '#6c5ce7', icon: '\u266B', questions: buildQuestions(level), adaptiveTopic: 'rhyme', theme: 'forest' }}
      onExit={onExit}
    />
  );
}
