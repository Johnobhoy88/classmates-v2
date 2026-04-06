import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { GameShell } from '../shared/GameShell';
import { useProgress } from '../../hooks/useProgress';

// Quiz game adapters
import { MathsQuiz } from '../games/MathsQuiz';
import { GrammarQuiz } from '../games/GrammarQuiz';
import { VocabQuiz } from '../games/VocabQuiz';
import { PhonicsQuiz } from '../games/PhonicsQuiz';
import { RhymeQuiz } from '../games/RhymeQuiz';
import { MeasureQuiz } from '../games/MeasureQuiz';
import { ShapesQuiz } from '../games/ShapesQuiz';
import { WordProbQuiz } from '../games/WordProbQuiz';
import { PunctuationQuiz } from '../games/PunctuationQuiz';
import { BondsQuiz } from '../games/BondsQuiz';
import { CapitalsQuiz, ContinentsQuiz, WeatherQuiz, CompassQuiz, FlagsQuiz, ScotQuiz } from '../games/GeoQuiz';
import { ReadingQuiz } from '../games/ReadingQuiz';
import { TimesQuiz } from '../games/TimesQuiz';
import { WordFamQuiz } from '../games/WordFamQuiz';
import { FractionsQuiz } from '../games/FractionsQuiz';
import { MoneyQuiz } from '../games/MoneyQuiz';
import { TellingTimeQuiz } from '../games/TellingTimeQuiz';
import { PlaceValueQuiz } from '../games/PlaceValueQuiz';
import { MissingNumQuiz } from '../games/MissingNumQuiz';
import { SpeedMathsQuiz } from '../games/SpeedMathsQuiz';
import { DataHandlingQuiz } from '../games/DataHandlingQuiz';
import { SequencesQuiz } from '../games/SequencesQuiz';
import { DictationQuiz } from '../games/DictationQuiz';
import { VowelsQuiz } from '../games/VowelsQuiz';

// Tier 2: Phaser games (immersive flagship experiences)
const PHASER_GAMES = new Set(['spelling']);

// Tier 1: React QuizEngine games
const QUIZ_GAMES: Record<string, React.ComponentType<{ onExit: () => void }>> = {
  maths: MathsQuiz,
  grammar: GrammarQuiz,
  vocab: VocabQuiz,
  phonics: PhonicsQuiz,
  rhyme: RhymeQuiz,
  measure: MeasureQuiz,
  shapes: ShapesQuiz,
  wordprob: WordProbQuiz,
  punctuation: PunctuationQuiz,
  bonds: BondsQuiz,
  capitals: CapitalsQuiz,
  continents: ContinentsQuiz,
  weather: WeatherQuiz,
  compass: CompassQuiz,
  flags: FlagsQuiz,
  scotquiz: ScotQuiz,
  reading: ReadingQuiz,
  times: TimesQuiz,
  wordfam: WordFamQuiz,
  fractions: FractionsQuiz,
  money: MoneyQuiz,
  telltime: TellingTimeQuiz,
  placeval: PlaceValueQuiz,
  missnum: MissingNumQuiz,
  speed: SpeedMathsQuiz,
  datahandling: DataHandlingQuiz,
  sequence: SequencesQuiz,
  dictation: DictationQuiz,
  vowels: VowelsQuiz,
};

const ALL_PLAYABLE = new Set([...PHASER_GAMES, ...Object.keys(QUIZ_GAMES)]);

const GAME_CATEGORIES = [
  {
    name: 'Literacy',
    color: 'bg-amber-500',
    games: [
      { id: 'spelling', title: 'Spelling', icon: 'Aa', desc: 'Guess the word!' },
      { id: 'phonics', title: 'Phonics', icon: 'ai', desc: 'Sound patterns' },
      { id: 'vocab', title: 'Vocabulary', icon: 'A-Z', desc: 'Words and meanings' },
      { id: 'grammar', title: 'Grammar', icon: 'N V', desc: 'Word types' },
      { id: 'rhyme', title: 'Rhyming', icon: '\u266B', desc: 'Match sounds' },
      { id: 'punctuation', title: 'Punctuation', icon: '.?!', desc: 'Fix the marks' },
      { id: 'wordfam', title: 'Word Families', icon: '-ing', desc: 'Common endings' },
      { id: 'dictation', title: 'Dictation', icon: '\u{1F50A}', desc: 'Listen and spell' },
      { id: 'vowels', title: 'Missing Vowels', icon: '_e_', desc: 'Fill the gaps' },
      { id: 'reading', title: 'Reading', icon: 'Bb', desc: 'Stories & questions' },
    ],
  },
  {
    name: 'Numeracy',
    color: 'bg-blue-500',
    games: [
      { id: 'maths', title: 'Maths', icon: '1+2', desc: 'Number crunching!' },
      { id: 'bonds', title: 'Number Bonds', icon: '10', desc: 'Make the number!' },
      { id: 'times', title: 'Times Tables', icon: '\u00D7', desc: 'Speed drill' },
      { id: 'shapes', title: 'Shapes', icon: '\u25B3', desc: 'Geometry' },
      { id: 'fractions', title: 'Fractions', icon: '\u00BD', desc: 'Parts of a whole' },
      { id: 'money', title: 'Money', icon: '\u00A3p', desc: 'Coins & change' },
      { id: 'telltime', title: 'Telling Time', icon: '3:00', desc: 'Read the clock' },
      { id: 'placeval', title: 'Place Value', icon: 'HTO', desc: 'Hundreds, tens, ones' },
      { id: 'missnum', title: 'Missing Number', icon: '?', desc: 'Find the gap' },
      { id: 'measure', title: 'Measurement', icon: 'cm', desc: 'Units & comparisons' },
      { id: 'wordprob', title: 'Word Problems', icon: '!', desc: 'Real-world maths' },
      { id: 'speed', title: 'Speed Maths', icon: '60s', desc: 'Beat the clock!' },
      { id: 'datahandling', title: 'Data Handling', icon: '\u{1F4CA}', desc: 'Charts & graphs' },
      { id: 'sequence', title: 'Sequences', icon: '1,2,?', desc: 'Spot the pattern' },
    ],
  },
  {
    name: 'Geography',
    color: 'bg-emerald-600',
    games: [
      { id: 'capitals', title: 'Capitals', icon: '\u{1F3DB}', desc: 'Capital cities' },
      { id: 'continents', title: 'Continents', icon: '\u{1F30D}', desc: 'World geography' },
      { id: 'weather', title: 'Weather', icon: '\u2600', desc: 'Seasons & climate' },
      { id: 'compass', title: 'Compass', icon: '\u{1F9ED}', desc: 'Directions' },
      { id: 'flags', title: 'Flags', icon: '\u{1F3F3}', desc: 'Identify flags' },
      { id: 'scotquiz', title: 'Scotland Quiz', icon: '\u{1F3F4}', desc: 'All about Scotland' },
    ],
  },
  {
    name: 'Challenge',
    color: 'bg-purple-500',
    games: [
      { id: 'hdash', title: 'Southlodge Racers', icon: '\u{1F3CE}', desc: '3D racing!' },
      { id: 'daily', title: 'Daily Challenge', icon: '\u{1F31F}', desc: 'New every day' },
      { id: 'spellingbee', title: 'Spelling Bee', icon: '\u{1F41D}', desc: 'How far?' },
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

  // Render active game
  if (activeGame) {
    // Phaser games
    if (PHASER_GAMES.has(activeGame)) {
      return <GameShell gameId={activeGame} onExit={() => setActiveGame(null)} />;
    }
    // Quiz games
    const QuizComponent = QUIZ_GAMES[activeGame];
    if (QuizComponent) {
      return <QuizComponent onExit={() => setActiveGame(null)} />;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-emerald-900 to-teal-900">
      {/* Header */}
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
        <button onClick={logoutPupil} className="text-sm text-white/40 hover:text-white/70 px-3 py-2 rounded-lg hover:bg-white/5">
          Switch pupil
        </button>
      </header>

      {/* Stats bar */}
      <div className="px-6 pb-4">
        <div className="flex gap-3">
          <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/10 text-center">
            <p className="text-2xl font-bold text-amber-300">{stats.totalStars}</p>
            <p className="text-xs text-white/50 font-semibold">Stars</p>
          </div>
          <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/10 text-center">
            <p className="text-2xl font-bold text-emerald-300">{stats.totalGames}</p>
            <p className="text-xs text-white/50 font-semibold">Games</p>
          </div>
          <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/10 text-center">
            <p className="text-2xl font-bold text-yellow-300">{stats.totalCoins}</p>
            <p className="text-xs text-white/50 font-semibold">Coins</p>
          </div>
        </div>
      </div>

      {/* Game categories */}
      <main className="px-4 pb-12 max-w-2xl mx-auto space-y-8">
        {GAME_CATEGORIES.map((cat) => (
          <section key={cat.name}>
            <h2 className="text-lg font-bold text-white/80 mb-3 flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${cat.color}`} />
              {cat.name}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {cat.games.map((game) => {
                const playable = ALL_PLAYABLE.has(game.id);
                return (
                  <button
                    key={game.id}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all text-left ${
                      playable
                        ? 'bg-white/10 hover:bg-white/15 backdrop-blur-sm border-white/10 hover:border-white/20 hover:scale-[1.03] cursor-pointer active:scale-[0.97]'
                        : 'bg-white/5 border-white/5 opacity-50 cursor-not-allowed'
                    }`}
                    onClick={() => playable && setActiveGame(game.id)}
                    disabled={!playable}
                  >
                    <span className="text-2xl">{game.icon}</span>
                    <span className="text-sm font-bold text-white">{game.title}</span>
                    <span className="text-xs text-white/50">{playable ? game.desc : 'Coming soon'}</span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </main>

      <footer className="text-center pb-6 text-xs text-white/20">South Lodge Primary, Invergordon</footer>
    </div>
  );
}
