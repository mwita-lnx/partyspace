'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface SessionHistory {
  code: string;
  name: string;
  createdAt: string;
  status: string;
  role: 'host' | 'participant';
  sessionId?: string;
}

export default function BETAwardsPage() {
  const router = useRouter();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<SessionHistory[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  useEffect(() => {
    loadSessionHistory();
  }, []);

  const loadSessionHistory = async () => {
    try {
      // First check if user is authenticated
      const authRes = await fetch('/api/auth/session');
      if (!authRes.ok || !(await authRes.json()).authenticated) {
        // Not authenticated, try localStorage fallback
        const historyData = localStorage.getItem('sessionHistory');
        if (historyData) setSessions(JSON.parse(historyData));
        setLoadingSessions(false);
        return;
      }

      // Fetch from database
      const response = await fetch('/api/user/sessions');
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions);
      } else {
        // Fallback to localStorage if API fails
        const historyData = localStorage.getItem('sessionHistory');
        if (historyData) setSessions(JSON.parse(historyData));
      }
    } catch (err) {
      console.error('Error loading session history:', err);
      // Fallback to localStorage on error
      try {
        const historyData = localStorage.getItem('sessionHistory');
        if (historyData) setSessions(JSON.parse(historyData));
      } catch {}
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      router.push(`/bet-awards/${roomCode.toUpperCase()}`);
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = () => router.push('/bet-awards/create');

  const handleRejoinSession = (code: string) => router.push(`/bet-awards/${code}`);

  const handleEditSession = (e: React.MouseEvent, code: string) => {
    e.stopPropagation(); // don't trigger rejoin
    router.push(`/bet-awards/${code}/settings`);
  };

  return (
    <div
      className="min-h-screen p-4"
      style={{
        background: 'linear-gradient(135deg, #FFE5D9 0%, #D4F1F4 50%, #FFFACD 100%)',
        fontFamily: "'Quicksand', sans-serif"
      }}
    >
      <div className="max-w-5xl mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => router.push('/landing')}
            className="text-gray-600 hover:text-gray-900 mb-4 inline-flex items-center gap-2 font-semibold"
          >
            ← Back to Home
          </button>
          <div className="flex justify-center mb-4">
            <Image src="/podium.gif" alt="BET Awards" width={100} height={100} unoptimized className="object-contain" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-3">🏆 BET Awards</h1>
          <p className="text-xl text-gray-700">Host your own awards ceremony for any group or event</p>
        </div>

        {/* Join / Create Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12 max-w-3xl mx-auto">
          <button
            onClick={() => setShowJoinModal(true)}
            className="p-6 bg-white rounded-xl hover:shadow-lg transition-all duration-300 text-center group border-2 border-transparent hover:border-teal-400"
            style={{ transform: 'scale(1)' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <div className="mb-3 flex justify-center">
              <Image src="/receptionist.png" alt="Join" width={60} height={60} className="object-contain" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Join</h3>
            <p className="text-gray-600 mb-3 text-sm">Enter with a 4-digit PIN</p>
            <div className="flex flex-col gap-1 text-xs text-gray-500">
              <span>✓ Vote on all categories</span>
              <span>✓ See results instantly</span>
              <span>✓ Login required</span>
            </div>
          </button>

          <button
            onClick={handleCreateRoom}
            className="p-6 bg-white rounded-xl hover:shadow-lg transition-all duration-300 text-center group border-2 border-transparent hover:border-orange-400"
            style={{ transform: 'scale(1)' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <div className="mb-3 flex justify-center">
              <Image src="/fireworks.png" alt="Create" width={60} height={60} className="object-contain" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Create</h3>
            <p className="text-gray-600 mb-3 text-sm">Host your own awards ceremony</p>
            <div className="flex flex-col gap-1 text-xs text-gray-500">
              <span>✓ 6 default categories</span>
              <span>✓ Add custom awards</span>
              <span>✓ Up to 500 players</span>
            </div>
          </button>
        </div>

        {/* Loading State */}
        {loadingSessions && (
          <div className="max-w-3xl mx-auto text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading your sessions...</p>
          </div>
        )}

        {/* Previous Sessions — shown for BOTH hosts and participants */}
        {!loadingSessions && sessions.length > 0 && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">My Previous Sessions</h2>
            <div className="space-y-3">
              {sessions.slice(0, 10).map((session, index) => (
                <div
                  key={index}
                  onClick={() => handleRejoinSession(session.code)}
                  className="w-full p-4 bg-white rounded-lg hover:shadow-md transition-all text-left border border-gray-200 hover:border-teal-400 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-gray-900">{session.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          session.role === 'host'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {session.role}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="font-mono font-bold">{session.code}</span>
                        <span>•</span>
                        <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                        {session.status && (
                          <>
                            <span>•</span>
                            <span className="capitalize">{session.status}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-3">
                      {/* Edit icon — hosts only */}
                      {session.role === 'host' && (
                        <button
                          onClick={(e) => handleEditSession(e, session.code)}
                          title="Edit session"
                          className="p-2 rounded-lg hover:bg-orange-50 text-orange-400 hover:text-orange-600 transition-colors"
                        >
                          <Image src="/magic-wand.png" alt="Edit" width={20} height={20} className="object-contain" />
                        </button>
                      )}

                      {/* Rejoin arrow — all roles */}
                      <span className="text-teal-600 font-bold text-lg">→</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loadingSessions && sessions.length === 0 && (
          <div className="max-w-3xl mx-auto text-center py-12">
            <Image src="/magic-wand.png" alt="Get Started" width={80} height={80} className="mx-auto mb-4 object-contain" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Previous Sessions</h3>
            <p className="text-gray-600 text-sm">Create your first BET Awards or join one with a PIN</p>
          </div>
        )}
      </div>

      {/* Join Room Modal */}
      {showJoinModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
          onClick={() => !loading && setShowJoinModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Join BET Awards</h2>

            <form onSubmit={handleJoinRoom} className="space-y-4">
              <div>
                <label htmlFor="roomCode" className="block text-sm font-semibold text-gray-700 mb-2">
                  Enter 4-Digit PIN
                </label>
                <input
                  type="text"
                  id="roomCode"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 text-3xl font-bold text-center uppercase border-2 border-gray-200 rounded-lg focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all text-black"
                  placeholder="1234"
                  maxLength={4}
                  required
                  autoComplete="off"
                />
                <p className="text-xs text-gray-500 mt-1">Get this PIN from the host</p>
              </div>

              {error && (
                <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded-lg text-center font-semibold" role="alert">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !roomCode || roomCode.length !== 4}
                  className="flex-1 px-4 py-3 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  style={{ background: loading || !roomCode || roomCode.length !== 4 ? '#9CA3AF' : 'linear-gradient(135deg, #4ECDC4 0%, #45B7D1 100%)' }}
                >
                  {loading ? 'Joining...' : 'Join'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes scale-in {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in { animation: scale-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}
