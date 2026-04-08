/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 */

import { useEffect, useState } from 'react';
import { supabase, type Pupil } from '../../data/supabase';
import { toast } from 'sonner';
import { UserPlus, Trash2 } from 'lucide-react';

function generatePin(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export function Roster({ teacherId }: { teacherId: string }) {
  const [pupils, setPupils] = useState<Pupil[]>([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPupils();
  }, [teacherId]);

  async function loadPupils() {
    const { data } = await supabase
      .from('pupils')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('display_name');
    setPupils((data as Pupil[]) || []);
    setLoading(false);
  }

  async function addPupil(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;

    // Generate unique PIN for this teacher
    let pin = generatePin();
    const existingPins = pupils.map((p) => p.pin);
    let attempts = 0;
    while (existingPins.includes(pin) && attempts < 100) {
      pin = generatePin();
      attempts++;
    }

    const { error } = await supabase.from('pupils').insert({
      teacher_id: teacherId,
      display_name: name,
      pin,
    });

    if (!error) {
      setNewName('');
      toast.success(`${name} added with PIN ${pin}`);
      loadPupils();
    } else {
      toast.error('Failed to add pupil');
    }
  }

  async function removePupil(id: string, name: string) {
    if (!confirm(`Remove ${name}? This will delete their progress.`)) return;
    const { error } = await supabase.from('pupils').delete().eq('id', id);
    if (!error) {
      toast.success(`${name} removed`);
    } else {
      toast.error('Failed to remove pupil');
    }
    loadPupils();
  }

  if (loading) {
    return <div className="text-gray-400 text-center py-8">Loading class list...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Add pupil form */}
      <form onSubmit={addPupil} className="flex gap-3">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Pupil name"
          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-colors flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Add
        </button>
      </form>

      {/* Pupil list */}
      {pupils.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg font-semibold">No pupils yet</p>
          <p className="text-sm mt-1">Add your class above to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
          {pupils.map((pupil) => (
            <div
              key={pupil.id}
              className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                  {pupil.display_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{pupil.display_name}</p>
                  <p className="text-xs text-gray-400">
                    PIN: <span className="font-mono font-bold text-gray-600">{pupil.pin}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => removePupil(pupil.id, pupil.display_name)}
                className="text-xs text-red-400 hover:text-red-600 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 text-center">
        {pupils.length} pupil{pupils.length !== 1 ? 's' : ''} in your class
      </p>
    </div>
  );
}
