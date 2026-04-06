import { useAuth } from '../auth/AuthProvider';
import { Roster } from './Roster';

export function Dashboard() {
  const { teacher, signOut } = useAuth();

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
            <p className="text-xs text-gray-400">
              Class code: <span className="font-mono font-bold text-teal-600">{teacher.class_code}</span>
            </p>
          </div>
          <button
            onClick={signOut}
            className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Class</h2>
          <p className="text-gray-500">
            Share your class code <span className="font-mono font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded">{teacher.class_code}</span> with pupils.
            They'll use this with their PIN to log in.
          </p>
        </div>

        <Roster teacherId={teacher.id} />
      </main>
    </div>
  );
}
