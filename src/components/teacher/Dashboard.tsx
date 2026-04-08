/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 */

import { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { Roster } from './Roster';
import { Progress } from './Progress';
import { Assignments } from './Assignments';
import { LayoutDashboard, Users, BarChart3, ClipboardList, LogOut, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import type { ComponentType } from 'react';

type Tab = 'overview' | 'pupils' | 'progress' | 'assign';

const TABS: { id: Tab; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'pupils', label: 'Pupils', icon: Users },
  { id: 'progress', label: 'Progress', icon: BarChart3 },
  { id: 'assign', label: 'Assign', icon: ClipboardList },
];

function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        toast.success('Class code copied!');
        setTimeout(() => setCopied(false), 2000);
      }}
      className="text-gray-400 hover:text-teal-600 transition-colors"
      title="Copy class code"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export function Dashboard() {
  const { teacher, signOut } = useAuth();
  const [tab, setTab] = useState<Tab>('overview');

  if (!teacher) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Classmates</h1>
          <p className="text-sm text-gray-500">{teacher.school_name}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-700">
              {teacher.display_name || teacher.email}
            </p>
            <p className="text-xs text-gray-400 flex items-center gap-1 justify-end">
              Class code: <span className="font-mono font-bold text-teal-600">{teacher.class_code}</span>
              <CopyCodeButton code={teacher.class_code} />
            </p>
          </div>
          <button
            onClick={signOut}
            className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </header>

      {/* Tabs */}
      <nav className="bg-white border-b border-gray-200 px-6 flex gap-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                tab === t.id
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {tab === 'overview' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-2">Welcome</h2>
                  <p className="text-gray-500">
                    Share your class code{' '}
                    <span className="font-mono font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded">
                      {teacher.class_code}
                    </span>{' '}
                    with pupils. They'll use this with their PIN to log in.
                  </p>
                </div>
                <Progress teacherId={teacher.id} />
              </div>
            )}

            {tab === 'pupils' && <Roster teacherId={teacher.id} />}

            {tab === 'progress' && <Progress teacherId={teacher.id} />}

            {tab === 'assign' && <Assignments teacherId={teacher.id} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
