'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'none' | 'login' | 'signup'>('none');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/session');
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          setUser(data.user);
        }
      }
    } catch (err) {
      console.error('Auth check failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setAuthLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setAuthMode('none');
        setEmail('');
        setPassword('');

        // Redirect if redirect URL exists
        if (redirectUrl) {
          router.push(redirectUrl);
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!email || !name || !password) {
      setError('Email, name, and password are required');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setAuthLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password })
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setAuthMode('none');
        setEmail('');
        setName('');
        setPassword('');

        // Redirect if redirect URL exists
        if (redirectUrl) {
          router.push(redirectUrl);
        }
      } else {
        setError(data.error || 'Signup failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/landing');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #FFE5D9 0%, #D4F1F4 50%, #FFFACD 100%)',
          fontFamily: "'Quicksand', sans-serif"
        }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-4 lg:p-8"
      style={{
        background: 'linear-gradient(135deg, #FFE5D9 0%, #D4F1F4 50%, #FFFACD 100%)',
        fontFamily: "'Quicksand', sans-serif"
      }}
    >
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8">
        <button
          onClick={() => router.push('/landing')}
          className="text-gray-600 hover:text-gray-900 mb-4 inline-flex items-center gap-2 font-semibold"
        >
          ← Back to Home
        </button>
      </div>

      <div className="max-w-5xl mx-auto">
        {!user ? (
          /* Not Logged In State */
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-teal-400">
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <Image src="/user (1).gif" alt="Profile" width={100} height={100} className="object-contain" unoptimized />
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                <p className="text-gray-600 text-lg">
                  {redirectUrl ? 'Please sign in to continue' : 'Sign in to access your profile and saved games'}
                </p>
              </div>

{authMode === 'none' ? (
                <div className="space-y-3">
                  <button
                    onClick={() => setAuthMode('login')}
                    className="w-full py-4 bg-gradient-to-r from-teal-400 to-cyan-400 text-white rounded-xl font-bold text-lg hover:from-teal-500 hover:to-cyan-500 transition-all shadow-lg transform hover:scale-105"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setAuthMode('signup')}
                    className="w-full py-4 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-xl font-bold text-lg hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg transform hover:scale-105"
                  >
                    Create Account
                  </button>
                </div>
              ) : authMode === 'login' ? (
                <div className="space-y-4">
                  {error && (
                    <div className="bg-red-100 border-4 border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm font-bold">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all text-black"
                      autoComplete="email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all text-black"
                      autoComplete="current-password"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setAuthMode('none');
                        setError('');
                        setEmail('');
                        setPassword('');
                      }}
                      disabled={authLoading}
                      className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 disabled:opacity-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleLogin}
                      disabled={authLoading || !email || !password}
                      className="flex-1 py-3 bg-gradient-to-r from-teal-400 to-cyan-400 text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:from-teal-500 hover:to-cyan-500 transition-all"
                    >
                      {authLoading ? 'Signing In...' : 'Sign In'}
                    </button>
                  </div>

                  <p className="text-center text-gray-500 text-xs mt-4">
                    Don't have an account?{' '}
                    <button
                      onClick={() => {
                        setAuthMode('signup');
                        setError('');
                      }}
                      className="text-purple-600 font-bold hover:text-purple-700"
                    >
                      Create one
                    </button>
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {error && (
                    <div className="bg-red-100 border-4 border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm font-bold">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all text-black"
                      autoComplete="email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all text-black"
                      autoComplete="name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all text-black"
                      autoComplete="new-password"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setAuthMode('none');
                        setError('');
                        setEmail('');
                        setName('');
                        setPassword('');
                      }}
                      disabled={authLoading}
                      className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 disabled:opacity-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSignup}
                      disabled={authLoading || !email || !name || !password}
                      className="flex-1 py-3 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-500 hover:to-pink-500 transition-all"
                    >
                      {authLoading ? 'Creating Account...' : 'Create Account'}
                    </button>
                  </div>

                  <p className="text-center text-gray-500 text-xs mt-4">
                    Already have an account?{' '}
                    <button
                      onClick={() => {
                        setAuthMode('login');
                        setError('');
                      }}
                      className="text-teal-600 font-bold hover:text-teal-700"
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Logged In State */
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-teal-400">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-5xl font-bold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-4xl font-bold text-gray-900 mb-2">{user.name}</h2>
                    <p className="text-gray-700 text-lg mb-1 font-semibold">{user.email}</p>
                    <p className="text-gray-600 text-sm">
                      Member since {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-6 py-3 bg-red-100 text-red-700 rounded-lg font-bold hover:bg-red-200 transition-all border-2 border-red-300"
                >
                  Sign Out
                </button>
              </div>
            </div>

            {/* Account Info Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 border-4 border-blue-300">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">Email Address</h3>
                    <p className="text-gray-600">{user.email}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border-4 border-purple-300">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">Display Name</h3>
                    <p className="text-gray-600">{user.name}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-4 border-orange-300">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => router.push('/bet-awards')}
                  className="flex items-center gap-4 p-5 bg-gradient-to-r from-purple-100 to-pink-100 border-4 border-purple-300 rounded-xl hover:shadow-lg transition-all group"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-gray-900 text-lg group-hover:text-purple-700 transition-colors">Create Session</h4>
                    <p className="text-gray-600 text-sm">Start a new BET Awards</p>
                  </div>
                </button>

                <button
                  onClick={() => router.push('/bet-awards')}
                  className="flex items-center gap-4 p-5 bg-gradient-to-r from-blue-100 to-cyan-100 border-4 border-blue-300 rounded-xl hover:shadow-lg transition-all group"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-gray-900 text-lg group-hover:text-blue-700 transition-colors">View Sessions</h4>
                    <p className="text-gray-600 text-sm">See your past games</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Account Settings */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-4 border-green-300">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Account Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-300">
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">Account Status</h4>
                    <p className="text-gray-600 text-sm">Your account is active</p>
                  </div>
                  <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-bold border-2 border-green-400 shadow-sm">
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between p-5 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-300">
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">Session History</h4>
                    <p className="text-gray-600 text-sm">View and manage your game history</p>
                  </div>
                  <button
                    onClick={() => router.push('/bet-awards')}
                    className="px-5 py-2 bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-lg font-bold hover:from-orange-500 hover:to-pink-500 transition-all shadow-md text-sm"
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
