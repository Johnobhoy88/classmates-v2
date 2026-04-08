/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 */

import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './components/auth/AuthProvider';
import { Landing } from './components/shared/Landing';
import { Dashboard } from './components/teacher/Dashboard';
import { PupilHome } from './components/pupil/Home';
import { OfflineBanner } from './components/shared/Layout';
import { startAutoSync } from './data/sync';
import { Toaster } from 'sonner';
import { AnimatePresence, motion } from 'motion/react';

function AppRoutes() {
  const { teacher, pupil, loading } = useAuth();
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  useEffect(() => {
    const stopSync = startAutoSync(30000);
    return stopSync;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white text-xl font-bold animate-pulse">
          Loading Classmates...
        </div>
      </div>
    );
  }

  const view = pupil ? 'pupil' : teacher ? 'teacher' : 'landing';

  return (
    <>
      {!online && <OfflineBanner />}
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {pupil ? <PupilHome /> : teacher ? <Dashboard /> : <Landing />}
        </motion.div>
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <Toaster position="top-center" richColors closeButton />
    </AuthProvider>
  );
}
