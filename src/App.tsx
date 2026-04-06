import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './components/auth/AuthProvider';
import { Landing } from './components/shared/Landing';
import { Dashboard } from './components/teacher/Dashboard';
import { PupilHome } from './components/pupil/Home';
import { OfflineBanner } from './components/shared/Layout';
import { startAutoSync } from './data/sync';

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

  return (
    <>
      {!online && <OfflineBanner />}
      {pupil ? <PupilHome /> : teacher ? <Dashboard /> : <Landing />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
