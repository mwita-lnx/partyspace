'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import confetti from 'canvas-confetti';

export default function CreateBETAwards() {
  const router = useRouter();
  const [step, setStep] = useState<'auth' | 'details'>('auth');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');

  // Auth fields
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Room fields
  const [roomName, setRoomName] = useState('');
  const [roomDescription, setRoomDescription] = useState('');
  const [hostName, setHostName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const response = await fetch('/api/auth/session');
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
          setName(data.user.name);
          setHostName(data.user.name);
          setStep('details');
        } else {
          // Not authenticated - redirect to profile
          router.push('/profile?redirect=/bet-awards/create');
        }
      } else {
        // Session check failed - redirect to profile
        router.push('/profile?redirect=/bet-awards/create');
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      // On error, redirect to profile
      router.push('/profile?redirect=/bet-awards/create');
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleAuth = async () => {
    if (!email || !name) {
      setError('Email and name are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      });

      const data = await response.json();

      if (response.ok) {
        setIsAuthenticated(true);
        setHostName(name);
        setStep('details');
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async () => {
    if (!roomName || !hostName) {
      setError('Session name and host name are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/sessions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: roomName,
          description: roomDescription,
          hostName,
          gameType: 'bet-awards'
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Store session data
        localStorage.setItem('currentSession', JSON.stringify(data.session));
        localStorage.setItem('voterName', hostName);

        // Save to session history
        const historyData = localStorage.getItem('sessionHistory');
        let history: any[] = [];
        if (historyData) {
          try {
            history = JSON.parse(historyData);
          } catch (error) {
            console.error('Error parsing session history:', error);
          }
        }

        // Add session to history
        const sessionEntry = {
          code: data.session.code,
          name: data.session.name,
          createdAt: new Date().toISOString(),
          status: data.session.status || 'active',
          role: 'host' as const
        };

        // Check if session already exists
        const existingIndex = history.findIndex((h: any) => h.code === sessionEntry.code);
        if (existingIndex >= 0) {
          history[existingIndex] = sessionEntry;
        } else {
          history.unshift(sessionEntry);
        }

        // Keep only last 50 sessions
        history = history.slice(0, 50);
        localStorage.setItem('sessionHistory', JSON.stringify(history));

        // Celebration
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 }
        });

        // Redirect to settings
        setTimeout(() => {
          router.push(`/bet-awards/${data.session.code}/settings`);
        }, 500);
      } else {
        setError(data.error || 'Failed to create session');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FFE5D9 0%, #D4F1F4 50%, #FFFACD 100%)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold">Loading...</p>
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
          <div className="flex justify-center mb-4">
            <Image src="/podium.gif" alt="BET Awards" width={100} height={100} unoptimized className="object-contain" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Create BET Awards
          </h1>
          <p className="text-gray-600">
            {step === 'auth' ? 'Login or register to continue' : 'Set up your game room'}
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-center text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Authentication */}
        {step === 'auth' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all text-black"
                placeholder="your.email@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all text-black"
                placeholder="Enter your name"
                autoComplete="name"
              />
            </div>

            <button
              onClick={handleAuth}
              disabled={loading || !email || !name}
              className="w-full py-3 text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-6"
              style={{ background: loading || !email || !name ? '#9CA3AF' : 'linear-gradient(135deg, #4ECDC4 0%, #45B7D1 100%)' }}
            >
              {loading ? 'Processing...' : 'Continue'}
            </button>

            <p className="text-center text-gray-500 text-sm mt-4">
              Authentication is required to create a game session
            </p>
          </div>
        )}

        {/* Step 2: Room Details */}
        {step === 'details' && (
          <div className="space-y-4">
            <div className="bg-green-50 border-2 border-green-200 p-3 rounded-lg mb-4">
              <p className="text-sm text-green-700">
                Logged in as <strong>{name}</strong>
              </p>
            </div>

            <div>
              <label htmlFor="hostName" className="block text-sm font-semibold text-gray-700 mb-2">
                Host Name (Display Name)
              </label>
              <input
                type="text"
                id="hostName"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all text-black"
                placeholder="Enter host name"
              />
            </div>

            <div>
              <label htmlFor="roomName" className="block text-sm font-semibold text-gray-700 mb-2">
                Session Name
              </label>
              <input
                type="text"
                id="roomName"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all text-black"
                placeholder="e.g., BET Awards 2024"
                maxLength={100}
              />
            </div>

            <div>
              <label htmlFor="roomDescription" className="block text-sm font-semibold text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                id="roomDescription"
                value={roomDescription}
                onChange={(e) => setRoomDescription(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all text-black resize-none"
                placeholder="Tell participants what this is about"
                rows={3}
                maxLength={500}
              />
            </div>

            <button
              onClick={handleCreateSession}
              disabled={loading || !roomName || !hostName}
              className="w-full py-4 text-white rounded-lg font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-6"
              style={{ background: loading || !roomName || !hostName ? '#9CA3AF' : 'linear-gradient(135deg, #FFE66D 0%, #F4A261 100%)' }}
            >
              {loading ? 'Creating...' : 'Create BET Awards Session'}
            </button>

            <button
              onClick={() => setStep('auth')}
              disabled={loading}
              className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Back
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/landing')}
            className="text-gray-600 hover:text-gray-900 text-sm"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
