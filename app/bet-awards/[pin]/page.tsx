'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface PageProps {
  params: Promise<{ pin: string }>;
}

interface AuthUser {
  userId: string;
  email: string;
  name: string;
}

export default function BETAwardsLanding({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [roomInfo, setRoomInfo] = useState<any>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // 1. Check authentication first
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (!res.ok) {
          // Not logged in — redirect to landing/login
          router.push(`/profile?redirect=/bet-awards/${resolvedParams.pin}`);
          return;
        }
        const data = await res.json();
        if (!data.authenticated) {
          router.push(`/profile?redirect=/bet-awards/${resolvedParams.pin}`);
          return;
        }
        setAuthUser(data.user);
        // Pre-fill name from logged-in user
        setPlayerName(data.user.name || '');
      } catch {
        router.push(`/landing?redirect=/bet-awards/${resolvedParams.pin}`);
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, [resolvedParams.pin, router]);

  // 2. Fetch session info by PIN
  useEffect(() => {
    if (authLoading) return;
    const fetchRoomInfo = async () => {
      try {
        const response = await fetch(`/api/sessions/by-code/${resolvedParams.pin}`);
        if (response.ok) {
          const data = await response.json();
          setRoomInfo(data.session);
        } else {
          setError('Room not found. Please check the PIN and try again.');
        }
      } catch {
        setError('Failed to load room information');
      }
    };
    fetchRoomInfo();
  }, [resolvedParams.pin, authLoading]);

  const handleJoinGame = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      localStorage.setItem('currentSession', JSON.stringify(roomInfo));
      localStorage.setItem('voterName', playerName);
      localStorage.setItem('participant', JSON.stringify({
        id: roomInfo.id,
        name: playerName,
        hasVoted: false
      }));

      // Save to session history - determine role based on hostUserId
      const historyData = localStorage.getItem('sessionHistory');
      let history: any[] = [];
      try { history = historyData ? JSON.parse(historyData) : []; } catch {}

      // Check if current user is the host
      const isHost = authUser && roomInfo.hostUserId === authUser.userId;
      const userRole: 'host' | 'participant' = isHost ? 'host' : 'participant';

      const sessionEntry = {
        code: resolvedParams.pin,
        name: roomInfo.name || 'BET Awards',
        createdAt: new Date().toISOString(),
        status: roomInfo.status || 'active',
        role: userRole
      };
      const existingIndex = history.findIndex((h: any) => h.code === sessionEntry.code);
      if (existingIndex >= 0) history[existingIndex] = sessionEntry;
      else history.unshift(sessionEntry);
      localStorage.setItem('sessionHistory', JSON.stringify(history.slice(0, 50)));

      // Save to database for persistent storage
      try {
        await fetch('/api/user/sessions/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionCode: resolvedParams.pin,
            sessionName: roomInfo.name || 'BET Awards',
            role: userRole,
            sessionId: roomInfo._id || roomInfo.id
          })
        });
      } catch (err) {
        console.error('Failed to save session to database:', err);
        // Continue anyway - localStorage still works
      }

      router.push(`/bet-awards/${resolvedParams.pin}/vote`);
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show nothing while checking auth
  if (authLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #FFE5D9 0%, #D4F1F4 50%, #FFFACD 100%)', fontFamily: "'Quicksand', sans-serif" }}
      >
        <div className="text-center">
          <Image src="/podium.gif" alt="Loading" width={100} height={100} unoptimized className="object-contain mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Checking your account…</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #FFE5D9 0%, #D4F1F4 50%, #FFFACD 100%)',
        fontFamily: "'Quicksand', sans-serif"
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          {/* Back button */}
          <button
            onClick={() => router.push('/bet-awards')}
            className="text-gray-500 hover:text-gray-800 text-sm font-semibold inline-flex items-center gap-1 mb-4"
          >
            ← Back
          </button>

          <div className="flex justify-center mb-4">
            <Image src="/podium.gif" alt="BET Awards" width={120} height={120} unoptimized className="object-contain" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            BET Awards
          </h1>
          {authUser && (
            <p className="text-sm text-gray-500">
              Joining as <span className="font-bold text-teal-600">{authUser.name}</span>
            </p>
          )}
          {roomInfo && (
            <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-200">
              <p className="font-bold text-gray-900 text-lg">{roomInfo.name}</p>
              {roomInfo.description && (
                <p className="text-gray-600 text-sm mt-1">{roomInfo.description}</p>
              )}
              <p className="text-gray-500 text-xs mt-2">PIN: {resolvedParams.pin}</p>
              <p className="text-gray-500 text-xs">Hosted by: {roomInfo.hostName}</p>
            </div>
          )}
        </div>

        {!roomInfo && !error && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading room…</p>
          </div>
        )}

        {error && !roomInfo && (
          <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        {roomInfo && (
          <>
            <div className="space-y-4 mb-6">
              <div>
                <label htmlFor="playerName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="playerName"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleJoinGame()}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all text-black"
                  placeholder="Your name"
                  autoComplete="off"
                  autoFocus
                />
                <p className="text-xs text-gray-400 mt-1">Pre-filled from your account — edit if needed</p>
              </div>
            </div>

            {error && roomInfo && (
              <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-center text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleJoinGame}
              disabled={loading || !playerName.trim()}
              className="w-full py-4 text-white rounded-lg font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              style={{
                background: loading || !playerName.trim()
                  ? '#9CA3AF'
                  : 'linear-gradient(135deg, #FFE66D 0%, #F4A261 100%)'
              }}
            >
              {loading ? 'Joining...' : 'Join Game'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
