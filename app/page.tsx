'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';

export default function Home() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.toUpperCase() })
      });

      const data = await response.json();

      if (response.ok) {
        // Store participant data in localStorage
        localStorage.setItem('participant', JSON.stringify(data.participant));

        // Trigger confetti!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        // Redirect to voting page
        setTimeout(() => {
          router.push('/vote');
        }, 500);
      } else {
        setError(data.error || 'Invalid access code');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Floating emojis background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 text-6xl animate-bounce">🎉</div>
          <div className="absolute top-20 right-20 text-5xl animate-pulse">⭐</div>
          <div className="absolute bottom-20 left-20 text-6xl animate-bounce delay-100">🏆</div>
          <div className="absolute bottom-10 right-10 text-5xl animate-pulse delay-200">✨</div>
          <div className="absolute top-1/2 left-5 text-4xl animate-bounce">🎊</div>
          <div className="absolute top-1/3 right-10 text-5xl animate-pulse delay-150">🌟</div>
        </div>

        {/* Main card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 relative z-10 transform hover:scale-105 transition-transform duration-300">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
              BET AWARDS
            </h1>
            <p className="text-2xl font-bold text-gray-700">Class of 2024</p>
            <p className="text-gray-500 mt-2">University Celebration</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="code" className="block text-lg font-semibold text-gray-700 mb-2">
                Enter Your Access Code
              </label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full px-6 py-4 text-2xl font-bold text-center uppercase border-4 border-purple-300 rounded-2xl focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-200 transition-all text-black"
                placeholder="PARTY2024"
                maxLength={20}
                required
              />
            </div>

            {error && (
              <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded-xl text-center font-semibold animate-shake">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !code}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xl py-4 rounded-2xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Checking...
                </span>
              ) : (
                "LET'S VOTE! 🎉"
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Don't have a code? Contact your class representative</p>
          </div>
        </div>

        {/* Results link */}
        <div className="text-center mt-4">
          <a
            href="/results"
            className="text-white text-sm hover:underline opacity-75 hover:opacity-100"
          >
            🏆 View Results
          </a>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.5s;
        }
        .delay-100 {
          animation-delay: 100ms;
        }
        .delay-150 {
          animation-delay: 150ms;
        }
        .delay-200 {
          animation-delay: 200ms;
        }
      `}</style>
    </div>
  );
}
