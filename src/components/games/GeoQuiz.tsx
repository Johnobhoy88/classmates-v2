/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 */

import { useState } from 'react';
import { CAPS_DATA, CONT_DATA, WEATHER_DATA, COMPASS_Q, FLAGS_DATA, SCOT_QUIZ, type GeoQuestion, type GeoLevel } from '../../game/content/geography-data';
import { QuizEngine, type QuizQuestion } from '../shared/QuizEngine';
import { LevelSelect } from '../shared/LevelSelect';
import { shuffle } from '../../utils/shuffle';

function geoToQuiz(data: GeoQuestion[]): QuizQuestion[] {
  return shuffle([...data]).slice(0, 10).map((q) => ({
    prompt: q.q,
    answer: q.correct,
    options: [...q.opts],
  }));
}

// === CAPITALS ===
export function CapitalsQuiz({ onExit }: { onExit: () => void }) {
  const [level, setLevel] = useState<GeoLevel | null>(null);
  if (!level) return <LevelSelect title="Capitals" color="#b45309" icon="\u{1F3DB}" theme="earth" onSelect={(lv) => setLevel(lv as GeoLevel)} onBack={onExit} />;
  return <QuizEngine config={{ gameId: 'capitals', title: 'Capitals Done!', subtitle: `Level ${level}`, color: '#b45309', icon: '\u{1F3DB}', questions: geoToQuiz(CAPS_DATA[level]), theme: 'earth' }} onExit={onExit} />;
}

// === CONTINENTS ===
export function ContinentsQuiz({ onExit }: { onExit: () => void }) {
  const [level, setLevel] = useState<GeoLevel | null>(null);
  if (!level) return <LevelSelect title="World Geography" color="#0284c7" icon="\u{1F30D}" theme="earth" onSelect={(lv) => setLevel(lv as GeoLevel)} onBack={onExit} />;
  return <QuizEngine config={{ gameId: 'continents', title: 'World Geography Done!', subtitle: `Level ${level}`, color: '#0284c7', icon: '\u{1F30D}', questions: geoToQuiz(CONT_DATA[level]), theme: 'earth' }} onExit={onExit} />;
}

// === WEATHER ===
export function WeatherQuiz({ onExit }: { onExit: () => void }) {
  const [level, setLevel] = useState<GeoLevel | null>(null);
  if (!level) return <LevelSelect title="Weather" color="#0369a1" icon="\u2600" theme="earth" onSelect={(lv) => setLevel(lv as GeoLevel)} onBack={onExit} />;
  return <QuizEngine config={{ gameId: 'weather', title: 'Weather Done!', subtitle: `Level ${level}`, color: '#0369a1', icon: '\u2600', questions: geoToQuiz(WEATHER_DATA[level]), theme: 'earth' }} onExit={onExit} />;
}

// === COMPASS ===
export function CompassQuiz({ onExit }: { onExit: () => void }) {
  return <QuizEngine config={{ gameId: 'compass', title: 'Compass Done!', subtitle: '', color: '#92400e', icon: '\u{1F9ED}', questions: geoToQuiz(COMPASS_Q), theme: 'earth' }} onExit={onExit} />;
}

// === FLAGS ===
export function FlagsQuiz({ onExit }: { onExit: () => void }) {
  const questions: QuizQuestion[] = shuffle([...FLAGS_DATA]).slice(0, 12).map((f) => ({
    prompt: "Which country's flag is this?",
    displayHtml: f.flag,
    answer: f.correct,
    options: [...f.opts],
  }));
  return <QuizEngine config={{ gameId: 'flags', title: 'Flags Done!', subtitle: '', color: '#003049', icon: '\u{1F3F3}', questions, theme: 'earth' }} onExit={onExit} />;
}

// === SCOTTISH QUIZ ===
export function ScotQuiz({ onExit }: { onExit: () => void }) {
  return <QuizEngine config={{ gameId: 'scotquiz', title: 'Scotland Quiz Done!', subtitle: '', color: '#005EB8', icon: '\u{1F3F4}', questions: geoToQuiz(shuffle([...SCOT_QUIZ]).slice(0, 20)), theme: 'earth' }} onExit={onExit} />;
}
