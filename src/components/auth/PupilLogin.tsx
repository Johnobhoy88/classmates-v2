import { useState } from 'react';
import { useAuth } from './AuthProvider';

export function PupilLogin() {
  const { loginAsPupil } = useAuth();
  const [classCode, setClassCode] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!classCode.trim() || pin.length !== 4) return;
    setLoading(true);
    setError(null);

    const result = await loginAsPupil(classCode.trim(), pin);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    }
    // On success, AuthProvider updates pupil state and App routes to /play
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-8 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-900">Pupil Login</h2>
      <p className="text-gray-600 text-sm">
        Enter your class code and PIN to start playing.
      </p>
      <input
        type="text"
        value={classCode}
        onChange={(e) => setClassCode(e.target.value.toUpperCase())}
        placeholder="Class code (e.g. A1B2C3)"
        className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg text-center tracking-widest uppercase"
        maxLength={6}
        autoFocus
        required
      />
      <input
        type="text"
        inputMode="numeric"
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
        placeholder="4-digit PIN"
        className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-2xl text-center tracking-[0.5em] font-mono"
        maxLength={4}
        required
      />
      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading || pin.length !== 4}
        className="px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 disabled:opacity-50 transition-colors text-lg"
      >
        {loading ? 'Checking...' : 'Play!'}
      </button>
    </form>
  );
}
