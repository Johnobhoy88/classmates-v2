/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 */

import { useState } from 'react';
import { READING, type ReadingLevel, type ReadingStory } from '../../game/content/reading-data';
import { QuizEngine, type QuizQuestion } from '../shared/QuizEngine';
import { LevelSelect } from '../shared/LevelSelect';
import { sanitizeHtml } from '../../utils/sanitize';
import { shuffle } from '../../utils/shuffle';

function storyToQuiz(story: ReadingStory): QuizQuestion[] {
  return story.questions.map((q) => ({
    prompt: q.q,
    answer: q.a[q.c],
    options: [...q.a],
  }));
}

export function ReadingQuiz({ onExit }: { onExit: () => void }) {
  const [level, setLevel] = useState<ReadingLevel | null>(null);
  const [story, setStory] = useState<ReadingStory | null>(null);
  const [readDone, setReadDone] = useState(false);

  if (!level) return <LevelSelect title="Reading" color="#56ab2f" icon="Bb" theme="forest" onSelect={(lv) => setLevel(lv as ReadingLevel)} onBack={onExit} />;

  // Pick a random story for this level
  if (!story) {
    const stories = READING[level];
    const picked = shuffle([...stories])[0];
    setStory(picked);
    return null;
  }

  // Show story text first, then questions
  if (!readDone) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-900 to-emerald-900/30">
        <div className="px-4 pt-4 flex items-center justify-between">
          <button onClick={onExit} className="text-white/40 hover:text-white/70 text-sm font-semibold px-3 py-2 rounded-lg hover:bg-white/5">&larr; Back</button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-4 max-w-lg mx-auto w-full">
          <h2 className="text-xl font-bold text-emerald-300 mb-4">{story.title}</h2>
          <div
            className="text-white/80 text-sm leading-relaxed mb-8 bg-white/5 p-5 rounded-2xl border border-white/10"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(story.text) }}
          />
          <button
            onClick={() => setReadDone(true)}
            className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-2xl text-lg transition-all active:scale-95"
          >
            I've read it — start questions!
          </button>
        </div>
      </div>
    );
  }

  return (
    <QuizEngine
      config={{
        gameId: 'reading',
        title: `${story.title} — Done!`,
        subtitle: `Level ${level}`,
        color: '#56ab2f',
        icon: 'Bb',
        questions: storyToQuiz(story),
        adaptiveTopic: 'reading',
        wrongDelay: 1500,
        theme: 'forest',
      }}
      onExit={onExit}
    />
  );
}
