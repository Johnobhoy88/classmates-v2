/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 */

import { useEffect, useState } from 'react';
import { supabase, type Pupil, type Progress as ProgressRecord } from '../../data/supabase';

interface PupilWithProgress {
  pupil: Pupil;
  totalStars: number;
  totalGames: number;
  lastActive: string | null;
  topGame: string | null;
}

export function Progress({ teacherId }: { teacherId: string }) {
  const [data, setData] = useState<PupilWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPupil, setSelectedPupil] = useState<string | null>(null);
  const [pupilProgress, setPupilProgress] = useState<ProgressRecord[]>([]);

  useEffect(() => {
    loadClassProgress();
  }, [teacherId]);

  async function loadClassProgress() {
    const { data: pupils } = await supabase
      .from('pupils')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('display_name');

    if (!pupils || pupils.length === 0) {
      setData([]);
      setLoading(false);
      return;
    }

    const pupilIds = pupils.map((p: Pupil) => p.id);
    const { data: progress } = await supabase
      .from('progress')
      .select('*')
      .in('pupil_id', pupilIds);

    const progressMap = new Map<string, ProgressRecord[]>();
    (progress || []).forEach((p: ProgressRecord) => {
      const existing = progressMap.get(p.pupil_id) || [];
      existing.push(p);
      progressMap.set(p.pupil_id, existing);
    });

    const results: PupilWithProgress[] = (pupils as Pupil[]).map((pupil) => {
      const records = progressMap.get(pupil.id) || [];
      const totalStars = records.reduce((sum, r) => sum + r.stars, 0);
      const totalGames = records.reduce((sum, r) => sum + r.attempts, 0);
      const lastRecord = records.sort(
        (a, b) => new Date(b.last_played_at).getTime() - new Date(a.last_played_at).getTime()
      )[0];
      const topRecord = records.sort((a, b) => b.stars - a.stars)[0];

      return {
        pupil,
        totalStars,
        totalGames,
        lastActive: lastRecord?.last_played_at || null,
        topGame: topRecord?.game_id || null,
      };
    });

    setData(results);
    setLoading(false);
  }

  async function loadPupilDetail(pupilId: string) {
    setSelectedPupil(pupilId);
    const { data: progress } = await supabase
      .from('progress')
      .select('*')
      .eq('pupil_id', pupilId)
      .order('last_played_at', { ascending: false });
    setPupilProgress((progress as ProgressRecord[]) || []);
  }

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return 'Never';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return `${diff} days ago`;
  }

  if (loading) {
    return <div className="text-gray-400 text-center py-8">Loading progress...</div>;
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-lg font-semibold">No pupils yet</p>
        <p className="text-sm mt-1">Add pupils in the Pupils tab to start tracking progress.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Class summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{data.reduce((s, d) => s + d.totalStars, 0)}</p>
          <p className="text-xs text-gray-500 font-semibold">Total Stars</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{data.reduce((s, d) => s + d.totalGames, 0)}</p>
          <p className="text-xs text-gray-500 font-semibold">Games Played</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">
            {data.filter((d) => d.lastActive && new Date(d.lastActive).toDateString() === new Date().toDateString()).length}
          </p>
          <p className="text-xs text-gray-500 font-semibold">Active Today</p>
        </div>
      </div>

      {/* Pupil progress table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Pupil</th>
              <th className="text-center px-3 py-3 font-semibold text-gray-600">Stars</th>
              <th className="text-center px-3 py-3 font-semibold text-gray-600">Games</th>
              <th className="text-center px-3 py-3 font-semibold text-gray-600">Last Active</th>
              <th className="text-center px-3 py-3 font-semibold text-gray-600">Top Game</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                key={row.pupil.id}
                onClick={() => loadPupilDetail(row.pupil.id)}
                className="border-b border-gray-100 hover:bg-teal-50/50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 font-semibold text-gray-900">{row.pupil.display_name}</td>
                <td className="text-center px-3 py-3 text-gray-700">{row.totalStars}</td>
                <td className="text-center px-3 py-3 text-gray-700">{row.totalGames}</td>
                <td className="text-center px-3 py-3 text-gray-500">{formatDate(row.lastActive)}</td>
                <td className="text-center px-3 py-3 text-gray-500 capitalize">{row.topGame || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pupil detail panel */}
      {selectedPupil && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">
              {data.find((d) => d.pupil.id === selectedPupil)?.pupil.display_name} — Detail
            </h3>
            <button
              onClick={() => setSelectedPupil(null)}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              Close
            </button>
          </div>
          {pupilProgress.length === 0 ? (
            <p className="text-gray-400 text-sm">No game progress recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {pupilProgress.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100"
                >
                  <div>
                    <span className="font-semibold text-gray-800 capitalize">{p.game_id}</span>
                    {p.skill_id !== 'general' && (
                      <span className="text-gray-400 text-xs ml-2">{p.skill_id}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-amber-500 font-bold">
                      {'★'.repeat(p.stars)}{'☆'.repeat(3 - p.stars)}
                    </span>
                    <span className="text-gray-500">
                      {p.attempts} attempt{p.attempts !== 1 ? 's' : ''}
                    </span>
                    <span className="text-gray-400 text-xs">
                      Mastery Lv{p.mastery_level}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
