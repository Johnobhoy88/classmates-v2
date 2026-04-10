/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 */

import { useState, useEffect, lazy, Suspense, type ComponentType } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useProgress } from '../../hooks/useProgress';
import { motion } from 'motion/react';
import { Star, Gamepad2, Coins, BookOpen, Volume2, Type, PenTool, Music, CircleDot, TextCursorInput, Shuffle, ListOrdered, BookOpenText, Calculator, Link, Grid3X3, PieChart, PoundSterling, Clock, Layers, HelpCircle, Triangle, Ruler, FileQuestion, Zap, BarChart3, TrendingUp, Landmark, Globe, CloudSun, Compass, Flag, MapPin, Brain, Bug, Keyboard, CalendarDays, Swords, Footprints } from 'lucide-react';
import { GameLoading } from '../shared/GameNav';

// Lazy-load ALL game components for code splitting
const GameShell = lazy(() => import('../shared/GameShell').then(m => ({ default: m.GameShell })));
const SpellingGame = lazy(() => import('../games/SpellingGame').then(m => ({ default: m.SpellingGame })));
const MathsQuiz = lazy(() => import('../games/MathsQuiz').then(m => ({ default: m.MathsQuiz })));
const GrammarQuiz = lazy(() => import('../games/GrammarQuiz').then(m => ({ default: m.GrammarQuiz })));
const VocabQuiz = lazy(() => import('../games/VocabQuiz').then(m => ({ default: m.VocabQuiz })));
const PhonicsQuiz = lazy(() => import('../games/PhonicsQuiz').then(m => ({ default: m.PhonicsQuiz })));
const RhymeQuiz = lazy(() => import('../games/RhymeQuiz').then(m => ({ default: m.RhymeQuiz })));
const MeasureQuiz = lazy(() => import('../games/MeasureQuiz').then(m => ({ default: m.MeasureQuiz })));
const ShapesQuiz = lazy(() => import('../games/ShapesQuiz').then(m => ({ default: m.ShapesQuiz })));
const WordProbQuiz = lazy(() => import('../games/WordProbQuiz').then(m => ({ default: m.WordProbQuiz })));
const PunctuationQuiz = lazy(() => import('../games/PunctuationQuiz').then(m => ({ default: m.PunctuationQuiz })));
const BondsQuiz = lazy(() => import('../games/BondsQuiz').then(m => ({ default: m.BondsQuiz })));
// GeoQuiz loaded dynamically in GeoQuizLazy below
const ReadingQuiz = lazy(() => import('../games/ReadingQuiz').then(m => ({ default: m.ReadingQuiz })));
const TimesQuiz = lazy(() => import('../games/TimesQuiz').then(m => ({ default: m.TimesQuiz })));
const WordFamQuiz = lazy(() => import('../games/WordFamQuiz').then(m => ({ default: m.WordFamQuiz })));
const FractionsQuiz = lazy(() => import('../games/FractionsQuiz').then(m => ({ default: m.FractionsQuiz })));
const MoneyQuiz = lazy(() => import('../games/MoneyQuiz').then(m => ({ default: m.MoneyQuiz })));
const TellingTimeQuiz = lazy(() => import('../games/TellingTimeQuiz').then(m => ({ default: m.TellingTimeQuiz })));
const PlaceValueQuiz = lazy(() => import('../games/PlaceValueQuiz').then(m => ({ default: m.PlaceValueQuiz })));
const MissingNumQuiz = lazy(() => import('../games/MissingNumQuiz').then(m => ({ default: m.MissingNumQuiz })));
const SpeedMathsQuiz = lazy(() => import('../games/SpeedMathsQuiz').then(m => ({ default: m.SpeedMathsQuiz })));
const DataHandlingQuiz = lazy(() => import('../games/DataHandlingQuiz').then(m => ({ default: m.DataHandlingQuiz })));
const SequencesQuiz = lazy(() => import('../games/SequencesQuiz').then(m => ({ default: m.SequencesQuiz })));
const DictationQuiz = lazy(() => import('../games/DictationQuiz').then(m => ({ default: m.DictationQuiz })));
const VowelsQuiz = lazy(() => import('../games/VowelsQuiz').then(m => ({ default: m.VowelsQuiz })));
const AnagramQuiz = lazy(() => import('../games/AnagramQuiz').then(m => ({ default: m.AnagramQuiz })));
const SentencesQuiz = lazy(() => import('../games/SentencesQuiz').then(m => ({ default: m.SentencesQuiz })));
const MemoryMatchQuiz = lazy(() => import('../games/MemoryMatchQuiz').then(m => ({ default: m.MemoryMatchQuiz })));
const SpellingBeeQuiz = lazy(() => import('../games/SpellingBeeQuiz').then(m => ({ default: m.SpellingBeeQuiz })));
const TypingQuiz = lazy(() => import('../games/TypingQuiz').then(m => ({ default: m.TypingQuiz })));
const DailyChallenge = lazy(() => import('../games/DailyChallenge').then(m => ({ default: m.DailyChallenge })));
const HeadToHead = lazy(() => import('../games/HeadToHead').then(m => ({ default: m.HeadToHead })));
const SouthlodgeRunners = lazy(() => import('../games/SouthlodgeRunners'));
const MathsWorld = lazy(() => import('../games/MathsWorld'));

// Lazy wrappers for geo quiz variants
function CapitalsQuiz(props: { onExit: () => void }) { return <Suspense fallback={<GameLoading />}><GeoQuizLazy variant="capitals" {...props} /></Suspense>; }
function ContinentsQuiz(props: { onExit: () => void }) { return <Suspense fallback={<GameLoading />}><GeoQuizLazy variant="continents" {...props} /></Suspense>; }
function WeatherQuiz(props: { onExit: () => void }) { return <Suspense fallback={<GameLoading />}><GeoQuizLazy variant="weather" {...props} /></Suspense>; }
function CompassQuiz(props: { onExit: () => void }) { return <Suspense fallback={<GameLoading />}><GeoQuizLazy variant="compass" {...props} /></Suspense>; }
function FlagsQuiz(props: { onExit: () => void }) { return <Suspense fallback={<GameLoading />}><GeoQuizLazy variant="flags" {...props} /></Suspense>; }
function ScotQuiz(props: { onExit: () => void }) { return <Suspense fallback={<GameLoading />}><GeoQuizLazy variant="scotquiz" {...props} /></Suspense>; }

function GeoQuizLazy({ variant, onExit }: { variant: string; onExit: () => void }) {
  const [Mod, setMod] = useState<typeof import('../games/GeoQuiz') | null>(null);
  useEffect(() => { import('../games/GeoQuiz').then(setMod); }, []);
  if (!Mod) return <GameLoading />;
  const Map: Record<string, ComponentType<{ onExit: () => void }>> = {
    capitals: Mod.CapitalsQuiz, continents: Mod.ContinentsQuiz, weather: Mod.WeatherQuiz,
    compass: Mod.CompassQuiz, flags: Mod.FlagsQuiz, scotquiz: Mod.ScotQuiz,
  };
  const C = Map[variant];
  return C ? <C onExit={onExit} /> : null;
}

// GameLoading imported from shared/GameNav

// Phaser games (none currently — spelling moved to React)
const PHASER_GAMES = new Set<string>([]);

// Quiz games
const QUIZ_GAMES: Record<string, ComponentType<{ onExit: () => void }>> = {
  spelling: SpellingGame, maths: MathsQuiz, grammar: GrammarQuiz, vocab: VocabQuiz, phonics: PhonicsQuiz,
  rhyme: RhymeQuiz, measure: MeasureQuiz, shapes: ShapesQuiz, wordprob: WordProbQuiz,
  punctuation: PunctuationQuiz, bonds: BondsQuiz,
  capitals: CapitalsQuiz, continents: ContinentsQuiz, weather: WeatherQuiz,
  compass: CompassQuiz, flags: FlagsQuiz, scotquiz: ScotQuiz,
  reading: ReadingQuiz, times: TimesQuiz, wordfam: WordFamQuiz,
  fractions: FractionsQuiz, money: MoneyQuiz, telltime: TellingTimeQuiz,
  placeval: PlaceValueQuiz, missnum: MissingNumQuiz,
  speed: SpeedMathsQuiz, datahandling: DataHandlingQuiz, sequence: SequencesQuiz,
  dictation: DictationQuiz, vowels: VowelsQuiz,
  anagram: AnagramQuiz, sentence: SentencesQuiz,
  memorymatch: MemoryMatchQuiz, spellingbee: SpellingBeeQuiz,
  typing: TypingQuiz, daily: DailyChallenge, h2h: HeadToHead, hdash: SouthlodgeRunners,
  mathsworld: MathsWorld,
};

const ALL_PLAYABLE = new Set([...PHASER_GAMES, ...Object.keys(QUIZ_GAMES)]);

// Lucide icon mapping per game
const GAME_ICONS: Record<string, typeof Star> = {
  spelling: Type, phonics: Volume2, vocab: BookOpen, grammar: PenTool,
  rhyme: Music, punctuation: CircleDot, wordfam: TextCursorInput, dictation: Volume2,
  vowels: HelpCircle, anagram: Shuffle, sentence: ListOrdered, reading: BookOpenText,
  maths: Calculator, bonds: Link, times: Grid3X3, fractions: PieChart,
  money: PoundSterling, telltime: Clock, placeval: Layers, missnum: HelpCircle,
  shapes: Triangle, measure: Ruler, wordprob: FileQuestion, speed: Zap,
  datahandling: BarChart3, sequence: TrendingUp,
  capitals: Landmark, continents: Globe, weather: CloudSun, compass: Compass,
  flags: Flag, scotquiz: MapPin,
  memorymatch: Brain, spellingbee: Bug, typing: Keyboard, daily: CalendarDays,
  h2h: Swords, hdash: Footprints, mathsworld: Gamepad2,
};

const GAME_CATEGORIES = [
  {
    name: 'Literacy', color: 'bg-amber-500',
    games: [
      { id: 'spelling', title: 'Spelling', desc: 'Guess the word!' },
      { id: 'phonics', title: 'Phonics', desc: 'Sound patterns' },
      { id: 'vocab', title: 'Vocabulary', desc: 'Words and meanings' },
      { id: 'grammar', title: 'Grammar', desc: 'Word types' },
      { id: 'rhyme', title: 'Rhyming', desc: 'Match sounds' },
      { id: 'punctuation', title: 'Punctuation', desc: 'Fix the marks' },
      { id: 'wordfam', title: 'Word Families', desc: 'Common endings' },
      { id: 'dictation', title: 'Dictation', desc: 'Listen and spell' },
      { id: 'vowels', title: 'Missing Vowels', desc: 'Fill the gaps' },
      { id: 'anagram', title: 'Anagrams', desc: 'Unjumble letters' },
      { id: 'sentence', title: 'Sentences', desc: 'Put words in order' },
      { id: 'reading', title: 'Reading', desc: 'Stories & questions' },
    ],
  },
  {
    name: 'Numeracy', color: 'bg-blue-500',
    games: [
      { id: 'maths', title: 'Maths', desc: 'Number crunching!' },
      { id: 'bonds', title: 'Number Bonds', desc: 'Make the number!' },
      { id: 'times', title: 'Times Tables', desc: 'Speed drill' },
      { id: 'fractions', title: 'Fractions', desc: 'Parts of a whole' },
      { id: 'money', title: 'Money', desc: 'Coins & change' },
      { id: 'telltime', title: 'Telling Time', desc: 'Read the clock' },
      { id: 'placeval', title: 'Place Value', desc: 'Hundreds, tens, ones' },
      { id: 'missnum', title: 'Missing Number', desc: 'Find the gap' },
      { id: 'shapes', title: 'Shapes', desc: 'Geometry' },
      { id: 'measure', title: 'Measurement', desc: 'Units & comparisons' },
      { id: 'wordprob', title: 'Word Problems', desc: 'Real-world maths' },
      { id: 'speed', title: 'Speed Maths', desc: 'Beat the clock!' },
      { id: 'datahandling', title: 'Data Handling', desc: 'Charts & graphs' },
      { id: 'sequence', title: 'Sequences', desc: 'Spot the pattern' },
    ],
  },
  {
    name: 'Geography', color: 'bg-emerald-600',
    games: [
      { id: 'capitals', title: 'Capitals', desc: 'Capital cities' },
      { id: 'continents', title: 'Continents', desc: 'World geography' },
      { id: 'weather', title: 'Weather', desc: 'Seasons & climate' },
      { id: 'compass', title: 'Compass', desc: 'Directions' },
      { id: 'flags', title: 'Flags', desc: 'Identify flags' },
      { id: 'scotquiz', title: 'Scotland Quiz', desc: 'All about Scotland' },
    ],
  },
  {
    name: 'Challenge', color: 'bg-purple-500',
    games: [
      { id: 'memorymatch', title: 'Memory Match', desc: 'Find the pairs!' },
      { id: 'spellingbee', title: 'Spelling Bee', desc: 'How far?' },
      { id: 'typing', title: 'Typing Speed', desc: 'Type fast!' },
      { id: 'daily', title: 'Daily Challenge', desc: 'New every day' },
      { id: 'h2h', title: 'Head to Head', desc: '2-player maths race!' },
      { id: 'hdash', title: 'Southlodge Runners', desc: 'Endless runner!' },
      { id: 'mathsworld', title: 'Maths World', desc: '3D maths adventure!' },
    ],
  },
];

function getTimeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function PupilHome() {
  const { pupil, logoutPupil } = useAuth();
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const { stats, refresh } = useProgress(pupil?.id);
  const [greeting] = useState(getTimeGreeting);

  useEffect(() => {
    if (!activeGame && pupil) refresh();
  }, [activeGame, pupil, refresh]);

  if (!pupil) return null;

  if (activeGame) {
    if (PHASER_GAMES.has(activeGame)) {
      return <Suspense fallback={<GameLoading />}><GameShell gameId={activeGame} onExit={() => setActiveGame(null)} /></Suspense>;
    }
    const QuizComponent = QUIZ_GAMES[activeGame];
    if (QuizComponent) {
      return <Suspense fallback={<GameLoading />}><QuizComponent onExit={() => setActiveGame(null)} /></Suspense>;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-emerald-900 to-teal-900">
      <header className="px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-emerald-500/30">
            {pupil.display_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{greeting}, {pupil.display_name}!</h1>
            <p className="text-sm text-emerald-300/70">Ready to learn?</p>
          </div>
        </div>
        <button onClick={logoutPupil} className="text-sm text-white/40 hover:text-white/70 px-3 py-2 rounded-lg hover:bg-white/5">Switch pupil</button>
      </header>

      <motion.div className="px-6 pb-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex gap-3">
          <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/10 text-center">
            <Star className="w-4 h-4 text-amber-300 mx-auto mb-1" />
            <p className="text-2xl font-bold text-amber-300">{stats.totalStars}</p>
            <p className="text-xs text-white/50 font-semibold">Stars</p>
          </div>
          <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/10 text-center">
            <Gamepad2 className="w-4 h-4 text-emerald-300 mx-auto mb-1" />
            <p className="text-2xl font-bold text-emerald-300">{stats.totalGames}</p>
            <p className="text-xs text-white/50 font-semibold">Games</p>
          </div>
          <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/10 text-center">
            <Coins className="w-4 h-4 text-yellow-300 mx-auto mb-1" />
            <p className="text-2xl font-bold text-yellow-300">{stats.totalCoins}</p>
            <p className="text-xs text-white/50 font-semibold">Coins</p>
          </div>
        </div>
      </motion.div>

      <main className="px-4 pb-12 max-w-2xl mx-auto space-y-8">
        {GAME_CATEGORIES.map((cat, catIdx) => (
          <motion.section
            key={cat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + catIdx * 0.1 }}
          >
            <h2 className="text-lg font-bold text-white/80 mb-3 flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${cat.color}`} />
              {cat.name}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {cat.games.map((game, gameIdx) => {
                const playable = ALL_PLAYABLE.has(game.id);
                const Icon = GAME_ICONS[game.id] || Star;
                return (
                  <motion.button
                    key={game.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + catIdx * 0.1 + gameIdx * 0.03 }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all text-left ${
                      playable ? 'bg-white/10 hover:bg-white/15 backdrop-blur-sm border-white/10 hover:border-white/20 hover:scale-[1.03] cursor-pointer active:scale-[0.97]'
                        : 'bg-white/5 border-white/5 opacity-50 cursor-not-allowed'
                    }`}
                    onClick={() => playable && setActiveGame(game.id)}
                    disabled={!playable}
                  >
                    <Icon className="w-7 h-7 text-white/80" strokeWidth={1.5} />
                    <span className="text-sm font-bold text-white">{game.title}</span>
                    <span className="text-xs text-white/50">{playable ? game.desc : 'Coming soon'}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.section>
        ))}
      </main>
      <footer className="text-center pb-6 text-xs text-white/20">South Lodge Primary, Invergordon</footer>
    </div>
  );
}
