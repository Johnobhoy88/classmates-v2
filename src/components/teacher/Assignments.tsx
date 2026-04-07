/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 */

import { useEffect, useState } from 'react';
import { supabase, type Assignment } from '../../data/supabase';

const GAME_OPTIONS = [
  { id: 'spelling', label: 'Spelling' },
  { id: 'maths', label: 'Maths' },
  { id: 'times', label: 'Times Tables' },
  { id: 'phonics', label: 'Phonics' },
  { id: 'reading', label: 'Reading' },
  { id: 'bonds', label: 'Number Bonds' },
  { id: 'vocab', label: 'Vocabulary' },
  { id: 'spellforest', label: 'Spellbound Forest' },
  { id: 'numberforge', label: 'Number Forge' },
  { id: 'hdash', label: 'Southlodge Racers' },
];

export function Assignments({ teacherId }: { teacherId: string }) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [gameId, setGameId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignments();
  }, [teacherId]);

  async function loadAssignments() {
    const { data } = await supabase
      .from('assignments')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });
    setAssignments((data as Assignment[]) || []);
    setLoading(false);
  }

  async function createAssignment(e: React.FormEvent) {
    e.preventDefault();
    if (!gameId) return;

    await supabase.from('assignments').insert({
      teacher_id: teacherId,
      game_id: gameId,
      message: message.trim() || null,
      active: true,
    });

    setGameId('');
    setMessage('');
    loadAssignments();
  }

  async function toggleActive(id: string, currentActive: boolean) {
    await supabase
      .from('assignments')
      .update({ active: !currentActive })
      .eq('id', id);
    loadAssignments();
  }

  async function deleteAssignment(id: string) {
    if (!confirm('Delete this assignment?')) return;
    await supabase.from('assignments').delete().eq('id', id);
    loadAssignments();
  }

  if (loading) {
    return <div className="text-gray-400 text-center py-8">Loading assignments...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Create assignment */}
      <form onSubmit={createAssignment} className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
        <h3 className="font-bold text-gray-900">New Assignment</h3>
        <div className="flex gap-3 flex-wrap">
          <select
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            className="flex-1 min-w-[160px] px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Choose a game...</option>
            {GAME_OPTIONS.map((g) => (
              <option key={g.id} value={g.id}>{g.label}</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={!gameId}
            className="px-6 py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 disabled:opacity-50 transition-colors"
          >
            Assign
          </button>
        </div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Optional message to pupils (e.g. 'Practise your Level 2 words')"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
        />
      </form>

      {/* Active assignments */}
      {assignments.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p className="font-semibold">No assignments yet</p>
          <p className="text-sm mt-1">Set an assignment above — it'll appear on every pupil's home screen.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => (
            <div
              key={a.id}
              className={`flex items-center justify-between bg-white rounded-xl border px-5 py-4 transition-colors ${
                a.active ? 'border-teal-200 bg-teal-50/30' : 'border-gray-200 opacity-60'
              }`}
            >
              <div>
                <p className="font-semibold text-gray-900 capitalize">{a.game_id.replace(/_/g, ' ')}</p>
                {a.message && (
                  <p className="text-sm text-gray-500 mt-0.5">{a.message}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(a.created_at).toLocaleDateString('en-GB')}
                  {a.active ? ' · Active' : ' · Inactive'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleActive(a.id, a.active)}
                  className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-colors ${
                    a.active
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      : 'bg-teal-100 text-teal-700 hover:bg-teal-200'
                  }`}
                >
                  {a.active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => deleteAssignment(a.id)}
                  className="text-xs text-red-400 hover:text-red-600 px-2 py-1.5 rounded-full hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
