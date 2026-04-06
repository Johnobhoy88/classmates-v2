import { useState } from 'react';
import { useAuth } from './AuthProvider';

export function TeacherLogin() {
  const { signInWithMagicLink } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);

    const result = await signInWithMagicLink(email.trim());
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-6 p-8 max-w-md mx-auto">
        <div className="text-5xl">&#x2709;&#xFE0F;</div>
        <h2 className="text-2xl font-bold text-gray-900">Check your email</h2>
        <p className="text-gray-600 text-center">
          We've sent a magic link to <strong>{email}</strong>.
          Click the link in the email to sign in.
        </p>
        <button
          onClick={() => { setSent(false); setEmail(''); }}
          className="text-sm text-teal-600 hover:text-teal-800 font-semibold"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-8 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-900">Teacher Sign In</h2>
      <p className="text-gray-600 text-sm">
        Enter your email and we'll send you a magic link — no password needed.
      </p>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="teacher@school.edu"
        className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-lg"
        autoFocus
        required
      />
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="px-6 py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 disabled:opacity-50 transition-colors text-lg"
      >
        {loading ? 'Sending...' : 'Send Magic Link'}
      </button>
    </form>
  );
}
