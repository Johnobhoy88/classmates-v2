/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase, type Teacher, type Pupil } from '../../data/supabase';
import type { Session } from '@supabase/supabase-js';

type AuthState = {
  session: Session | null;
  teacher: Teacher | null;
  pupil: Pupil | null;
  loading: boolean;
  signInWithMagicLink: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  loginAsPupil: (classCode: string, pin: string) => Promise<{ error: string | null }>;
  loginAsGuest: () => void;
  logoutPupil: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [pupil, setPupil] = useState<Pupil | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) loadTeacher(data.session.user.id);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        loadTeacher(session.user.id);
      } else {
        setTeacher(null);
      }
    });

    // Restore pupil from sessionStorage
    const savedPupil = sessionStorage.getItem('classmates_pupil');
    if (savedPupil) {
      try { setPupil(JSON.parse(savedPupil)); } catch { /* ignore */ }
    }

    return () => listener.subscription.unsubscribe();
  }, []);

  async function loadTeacher(userId: string) {
    const { data } = await supabase
      .from('teachers')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) {
      setTeacher(data as Teacher);
    } else {
      // First login — create teacher record
      const { data: newTeacher } = await supabase
        .from('teachers')
        .insert({ id: userId, email: session?.user?.email || '' })
        .select()
        .single();
      if (newTeacher) setTeacher(newTeacher as Teacher);
    }
  }

  async function signInWithMagicLink(email: string) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    return { error: error?.message || null };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
    setTeacher(null);
    setPupil(null);
    sessionStorage.removeItem('classmates_pupil');
  }

  async function loginAsPupil(classCode: string, pin: string) {
    // Look up teacher by class code
    const { data: teacherData } = await supabase
      .from('teachers')
      .select('id')
      .eq('class_code', classCode.toUpperCase())
      .single();

    if (!teacherData) return { error: 'Class not found. Check your class code.' };

    // Look up pupil by teacher + PIN
    const { data: pupilData } = await supabase
      .from('pupils')
      .select('*')
      .eq('teacher_id', teacherData.id)
      .eq('pin', pin)
      .single();

    if (!pupilData) return { error: 'Wrong PIN. Ask your teacher for help.' };

    const p = pupilData as Pupil;
    setPupil(p);
    sessionStorage.setItem('classmates_pupil', JSON.stringify(p));
    return { error: null };
  }

  function loginAsGuest() {
    const guest: Pupil = {
      id: 'guest',
      teacher_id: 'guest',
      display_name: 'Guest',
      pin: '0000',
      avatar_config: {},
      created_at: new Date().toISOString(),
    };
    setPupil(guest);
    sessionStorage.setItem('classmates_pupil', JSON.stringify(guest));
  }

  function logoutPupil() {
    setPupil(null);
    sessionStorage.removeItem('classmates_pupil');
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        teacher,
        pupil,
        loading,
        signInWithMagicLink,
        signOut,
        loginAsPupil,
        loginAsGuest,
        logoutPupil,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
