import { useAuth } from '../auth/AuthProvider';

const GAME_CATEGORIES = [
  {
    name: 'Literacy',
    color: 'bg-amber-500',
    games: [
      { id: 'spelling', title: 'Spelling', icon: 'Aa', desc: 'Guess the word!' },
      { id: 'spellforest', title: 'Spellbound Forest', icon: '\u{1F332}', desc: 'Grow the forest!' },
      { id: 'phonics', title: 'Phonics', icon: 'ai', desc: 'Sound patterns' },
      { id: 'vocab', title: 'Vocabulary', icon: 'A-Z', desc: 'Words and meanings' },
      { id: 'grammar', title: 'Grammar', icon: 'N V', desc: 'Word types' },
      { id: 'reading', title: 'Reading', icon: 'Bb', desc: 'Stories & questions' },
    ],
  },
  {
    name: 'Numeracy',
    color: 'bg-blue-500',
    games: [
      { id: 'maths', title: 'Maths', icon: '1+2', desc: 'Number crunching!' },
      { id: 'numberforge', title: 'Number Forge', icon: '\u{1F525}', desc: 'Craft with maths!' },
      { id: 'times', title: 'Times Tables', icon: '\u00D7', desc: 'Speed drill' },
      { id: 'bonds', title: 'Number Bonds', icon: '10', desc: 'Make the number!' },
      { id: 'fractions', title: 'Fractions', icon: '\u00BD', desc: 'Parts of a whole' },
      { id: 'shapes', title: 'Shapes', icon: '\u25B3', desc: 'Geometry' },
    ],
  },
  {
    name: 'Challenge',
    color: 'bg-purple-500',
    games: [
      { id: 'hdash', title: 'Southlodge Racers', icon: '\u{1F3CE}', desc: '3D racing!' },
      { id: 'daily', title: 'Daily Challenge', icon: '\u{1F31F}', desc: 'New every day' },
      { id: 'spellingbee', title: 'Spelling Bee', icon: '\u{1F41D}', desc: 'How far?' },
      { id: 'typing', title: 'Typing Speed', icon: '\u2328', desc: 'Type fast!' },
    ],
  },
];

export function PupilHome() {
  const { pupil, logoutPupil } = useAuth();

  if (!pupil) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-emerald-900 to-teal-900">
      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-400 flex items-center justify-center text-white font-bold text-xl shadow-lg">
            {pupil.display_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">
              Hi, {pupil.display_name}!
            </h1>
            <p className="text-sm text-emerald-300/70">
              Ready to learn?
            </p>
          </div>
        </div>
        <button
          onClick={logoutPupil}
          className="text-sm text-white/40 hover:text-white/70 px-3 py-2 rounded-lg hover:bg-white/5"
        >
          Switch pupil
        </button>
      </header>

      {/* Game categories */}
      <main className="px-4 pb-12 max-w-2xl mx-auto space-y-8">
        {GAME_CATEGORIES.map((cat) => (
          <section key={cat.name}>
            <h2 className="text-lg font-bold text-white/80 mb-3 flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${cat.color}`} />
              {cat.name}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {cat.games.map((game) => (
                <button
                  key={game.id}
                  className="flex flex-col items-center gap-2 p-4 bg-white/10 hover:bg-white/15 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-white/20 transition-all hover:scale-[1.03] text-left"
                  onClick={() => {
                    // TODO: Launch Phaser scene
                    alert(`Launching ${game.title}... (game engine coming in Phase 2)`);
                  }}
                >
                  <span className="text-2xl">{game.icon}</span>
                  <span className="text-sm font-bold text-white">{game.title}</span>
                  <span className="text-xs text-white/50">{game.desc}</span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
