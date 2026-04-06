import { useState } from 'react';
import { SENTENCES, type PunctLevel } from '../../game/content/punctuation-data';
import { sfxCorrect, sfxWrong, sfxClick } from '../../game/systems/AudioSystem';
import { recordGameResult } from '../../game/systems/ProgressTracker';
import { useAuth } from '../auth/AuthProvider';
import { LevelSelect } from '../shared/LevelSelect';

// Faithful port of V1 sentence ordering: drag/tap words into correct order

function shuffle<T>(arr: T[]): T[] { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

export function SentencesQuiz({ onExit }: { onExit: () => void }) {
  const { pupil } = useAuth();
  const [level, setLevel] = useState<PunctLevel | null>(null);
  const [sentences, setSentences] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);
  const [pool, setPool] = useState<string[]>([]);
  const [ans, setAns] = useState<string[]>([]);
  const [correct, setCorrect] = useState(0);
  const [_missed, setMissed] = useState<Array<{w:string;h:string}>>([]);
  const [feedback, setFeedback] = useState('');
  const [flash, setFlash] = useState<'correct'|'wrong'|null>(null);
  const [done, setDone] = useState(false);
  const [locked, setLocked] = useState(false);

  function startGame(lv: PunctLevel) {
    setLevel(lv);
    const sents = shuffle([...SENTENCES[lv]]).slice(0, 10);
    setSentences(sents);
    const words = sents[0].split(' ');
    setPool(shuffle([...words])); setAns([]);
  }

  function tapPool(i: number) {
    if (locked) return; sfxClick();
    const newPool = [...pool]; const word = newPool.splice(i, 1)[0];
    const newAns = [...ans, word];
    setPool(newPool); setAns(newAns);
    if (newPool.length === 0) check(newAns);
  }

  function tapAns(i: number) {
    if (locked) return; sfxClick();
    const newAns = [...ans]; const word = newAns.splice(i, 1)[0];
    setAns(newAns); setPool([...pool, word]);
  }

  function check(attempt: string[]) {
    const original = sentences[idx];
    const ok = attempt.join(' ') === original;
    setLocked(true); setFlash(ok ? 'correct' : 'wrong');
    if (ok) { setCorrect(c => c+1); sfxCorrect(); setFeedback('Correct!'); }
    else { sfxWrong(); setMissed(m => [...m, { w: original, h: 'Correct order' }]); setFeedback(original); }
    setTimeout(advance, ok ? 600 : 2000);
  }

  function advance() {
    setLocked(false); setFlash(null); setFeedback('');
    if (idx + 1 >= sentences.length) { setDone(true); return; }
    const next = idx + 1; setIdx(next);
    const words = sentences[next].split(' ');
    setPool(shuffle([...words])); setAns([]);
  }

  if (!level) return <LevelSelect title="Sentences" color="#e17055" icon="1 2 3" onSelect={(lv) => startGame(lv as PunctLevel)} onBack={onExit} />;

  if (done) {
    const total = sentences.length; const pct = correct / total;
    const stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : pct >= 0.3 ? 1 : 0;
    if (pupil) recordGameResult({ pupilId: pupil.id, gameId: 'sentence', score: Math.round(pct*100), stars, streak: 0, bestStreak: 0, correct, total });
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-slate-900 to-orange-900/30">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full text-center border border-white/20">
          <div className="text-3xl mb-3">{'\u2B50'.repeat(stars)}{'\u2606'.repeat(3-stars)}</div>
          <h2 className="text-xl font-bold text-white mb-2">Sentences Done!</h2>
          <p className="text-orange-300 text-lg">{correct}/{total} correct</p>
          <div className="flex gap-3 mt-6">
            <button onClick={() => { setLevel(null); setSentences([]); setIdx(0); setCorrect(0); setMissed([]); setDone(false); }} className="flex-1 py-3 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl">Again</button>
            <button onClick={onExit} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20">Back</button>
          </div>
        </div>
      </div>
    );
  }
  if (sentences.length === 0) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-900 to-orange-900/20">
      <div className="px-4 pt-4 flex items-center justify-between">
        <button onClick={onExit} className="text-white/40 hover:text-white/70 text-sm px-3 py-2 rounded-lg hover:bg-white/5">&larr; Back</button>
        <span className="text-white/30 text-sm">{idx+1}/{sentences.length}</span>
      </div>
      <div className="px-4 pt-2"><div className="h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-orange-500 rounded-full transition-all" style={{width:`${(idx/sentences.length)*100}%`}} /></div></div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 max-w-lg mx-auto w-full gap-6">
        <p className="text-white/60 text-sm">Put the words in the right order</p>

        {/* Answer area */}
        <div className={`flex gap-2 flex-wrap justify-center min-h-[48px] p-3 rounded-2xl border-2 w-full ${flash === 'correct' ? 'border-emerald-400 bg-emerald-500/10' : flash === 'wrong' ? 'border-red-400 bg-red-500/10' : 'border-white/15 bg-white/5'}`}>
          {ans.map((word, i) => (
            <button key={`a${i}`} onClick={() => tapAns(i)}
              className="px-3 py-2 rounded-lg bg-orange-500/30 border border-orange-400/40 text-white font-semibold text-sm active:scale-90 transition-all">
              {word}
            </button>
          ))}
        </div>

        {/* Word pool */}
        <div className="flex gap-2 flex-wrap justify-center">
          {pool.map((word, i) => (
            <button key={`p${i}`} onClick={() => tapPool(i)}
              className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white font-semibold text-sm hover:bg-white/15 active:scale-90 transition-all">
              {word}
            </button>
          ))}
        </div>

        {feedback && <p className={`text-sm font-bold text-center ${flash === 'correct' ? 'text-emerald-300' : 'text-red-300'}`}>{feedback}</p>}
      </div>
    </div>
  );
}
