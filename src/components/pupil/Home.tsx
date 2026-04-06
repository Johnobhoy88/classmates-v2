import { useState, useEffect, lazy, Suspense, type ComponentType } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useProgress } from '../../hooks/useProgress';

// Lazy-load ALL game components for code splitting
const GameShell = lazy(() => import('../shared/GameShell').then(m => ({ default: m.GameShell })));
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
const SouthlodgeRacers = lazy(() => import('../games/SouthlodgeRacers').then(m => ({ default: m.SouthlodgeRacers })));

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

function GameLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-white text-lg font-bold animate-pulse">Loading game...</div>
    </div>
  );
}

// Phaser games
const PHASER_GAMES = new Set(['spelling']);

// Quiz games
const QUIZ_GAMES: Record<string, ComponentType<{ onExit: () => void }>> = {
  maths: MathsQuiz, grammar: GrammarQuiz, vocab: VocabQuiz, phonics: PhonicsQuiz,
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
  typing: TypingQuiz, daily: DailyChallenge, h2h: HeadToHead, hdash: SouthlodgeRacers,
};

const ALL_PLAYABLE = new Set([...PHASER_GAMES, ...Object.keys(QUIZ_GAMES)]);

const GAME_CATEGORIES = [
  {
    name: 'Literacy', color: 'bg-amber-500',
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
      { id: 'anagram', title: 'Anagrams', icon: 'ABC', desc: 'Unjumble letters' },
      { id: 'sentence', title: 'Sentences', icon: '1 2 3', desc: 'Put words in order' },
      { id: 'reading', title: 'Reading', icon: 'Bb', desc: 'Stories & questions' },
    ],
  },
  {
    name: 'Numeracy', color: 'bg-blue-500',
    games: [
      { id: 'maths', title: 'Maths', icon: '1+2', desc: 'Number crunching!' },
      { id: 'bonds', title: 'Number Bonds', icon: '10', desc: 'Make the number!' },
      { id: 'times', title: 'Times Tables', icon: '\u00D7', desc: 'Speed drill' },
      { id: 'fractions', title: 'Fractions', icon: '\u00BD', desc: 'Parts of a whole' },
      { id: 'money', title: 'Money', icon: '\u00A3p', desc: 'Coins & change' },
      { id: 'telltime', title: 'Telling Time', icon: '3:00', desc: 'Read the clock' },
      { id: 'placeval', title: 'Place Value', icon: 'HTO', desc: 'Hundreds, tens, ones' },
      { id: 'missnum', title: 'Missing Number', icon: '?', desc: 'Find the gap' },
      { id: 'shapes', title: 'Shapes', icon: '\u25B3', desc: 'Geometry' },
      { id: 'measure', title: 'Measurement', icon: 'cm', desc: 'Units & comparisons' },
      { id: 'wordprob', title: 'Word Problems', icon: '!', desc: 'Real-world maths' },
      { id: 'speed', title: 'Speed Maths', icon: '60s', desc: 'Beat the clock!' },
      { id: 'datahandling', title: 'Data Handling', icon: '\u{1F4CA}', desc: 'Charts & graphs' },
      { id: 'sequence', title: 'Sequences', icon: '1,2,?', desc: 'Spot the pattern' },
    ],
  },
  {
    name: 'Geography', color: 'bg-emerald-600',
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
    name: 'Challenge', color: 'bg-purple-500',
    games: [
      { id: 'memorymatch', title: 'Memory Match', icon: '\u{1F0CF}', desc: 'Find the pairs!' },
      { id: 'spellingbee', title: 'Spelling Bee', icon: '\u{1F41D}', desc: 'How far?' },
      { id: 'typing', title: 'Typing Speed', icon: '\u2328', desc: 'Type fast!' },
      { id: 'daily', title: 'Daily Challenge', icon: '\u{1F31F}', desc: 'New every day' },
      { id: 'h2h', title: 'Head to Head', icon: '\u{1F93C}', desc: '2-player maths race!' },
      { id: 'hdash', title: 'Southlodge Racers', icon: '\u{1F3CE}', desc: '3D racing!' },
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
                  <button key={game.id}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all text-left ${
                      playable ? 'bg-white/10 hover:bg-white/15 backdrop-blur-sm border-white/10 hover:border-white/20 hover:scale-[1.03] cursor-pointer active:scale-[0.97]'
                        : 'bg-white/5 border-white/5 opacity-50 cursor-not-allowed'
                    }`}
                    onClick={() => playable && setActiveGame(game.id)} disabled={!playable}>
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
