'use client';

import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import Link from 'next/link';

export default function ThankYouPage() {
  useEffect(() => {
    // Continuous confetti celebration
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 }
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 }
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-12 text-center">
        <div className="text-9xl mb-6 animate-bounce">🎉</div>

        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600 mb-4">
          Thank You!
        </h1>

        <p className="text-2xl text-gray-700 font-bold mb-4">
          Your votes have been recorded!
        </p>

        <p className="text-lg text-gray-600 mb-8">
          Thanks for participating in the BET Awards 2024. The results will be announced soon!
        </p>

        <div className="flex flex-col gap-4 text-6xl mb-8">
          <div className="animate-pulse">⭐</div>
          <div className="animate-bounce">🏆</div>
          <div className="animate-pulse">✨</div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/results"
            className="inline-block px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-lg rounded-2xl hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl"
          >
            🏆 View Results
          </Link>
          <Link
            href="/"
            className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
