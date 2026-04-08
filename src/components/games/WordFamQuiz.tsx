/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 */

import { useState } from 'react';
import { WORDFAM_DATA, type WordFamLevel } from '../../game/content/wordfam-data';
import { QuizEngine, type QuizQuestion } from '../shared/QuizEngine';
import { LevelSelect } from '../shared/LevelSelect';
import { shuffle } from '../../utils/shuffle';

function buildQuestions(level: WordFamLevel): QuizQuestion[] {
  const entries = shuffle([...WORDFAM_DATA[level]]);
  return entries.slice(0, 10).map((entry) => {
    const correctWord = entry.words[Math.floor(Math.random() * entry.words.length)];
    const distractors = shuffle([...entry.wrong]).slice(0, 3);
    return {
      prompt: `Which word belongs to the "${entry.ending}" family?`,
      display: entry.ending,
      answer: correctWord,
      options: [correctWord, ...distractors],
    };
  });
}

export function WordFamQuiz({ onExit }: { onExit: () => void }) {
  const [level, setLevel] = useState<WordFamLevel | null>(null);
  if (!level) return <LevelSelect title="Word Families" color="#00b894" icon="-ing" onSelect={(lv) => setLevel(lv as WordFamLevel)} onBack={onExit} />;
  return <QuizEngine config={{ gameId: 'wordfam', title: 'Word Families Done!', subtitle: `Level ${level}`, color: '#00b894', icon: '-ing', questions: buildQuestions(level), adaptiveTopic: 'wordfam' }} onExit={onExit} />;
}
