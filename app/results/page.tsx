'use client';

import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

interface Result {
  award: {
    id: string;
    title: string;
    emoji: string;
  };
  totalVotes: number;
  voteCounts: Record<string, number>;
  winner: string | null;
}

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealing, setRevealing] = useState(false);
  const [revealed, setRevealed] = useState<boolean[]>([]);
  const [isRevealingAll, setIsRevealingAll] = useState(false);
  const [revealTimeouts, setRevealTimeouts] = useState<NodeJS.Timeout[]>([]);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await fetch('/api/results');
      const data = await response.json();
      setResults(data.results || []);
      setRevealed(new Array(data.results?.length || 0).fill(false));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching results:', error);
      setLoading(false);
    }
  };

  const revealWinner = (index: number, scrollToCard = true) => {
    // Clear any existing confetti before starting new reveal
    confetti.reset();

    setRevealing(true);
    setCurrentIndex(index);

    // Scroll to the card
    if (scrollToCard) {
      const cardElement = document.getElementById(`award-card-${index}`);
      if (cardElement) {
        cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    // Drum roll sound effect simulation with visual feedback
    const drumRollDuration = 3000;
    const drumRollInterval = setInterval(() => {
      // Visual shake effect handled by CSS
    }, 100);

    setTimeout(() => {
      clearInterval(drumRollInterval);
      setRevealing(false);

      // Mark as revealed
      const newRevealed = [...revealed];
      newRevealed[index] = true;
      setRevealed(newRevealed);

      // Trigger confetti
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 }
      });

      setTimeout(() => {
        confetti({
          particleCount: 100,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
      }, 200);

      setTimeout(() => {
        confetti({
          particleCount: 100,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 400);
    }, drumRollDuration);
  };

  const revealAll = () => {
    setIsRevealingAll(true);
    const timeouts: NodeJS.Timeout[] = [];

    results.forEach((_, index) => {
      const timeout = setTimeout(() => {
        revealWinner(index);
        // If this is the last reveal, stop the reveal all state
        if (index === results.length - 1) {
          setIsRevealingAll(false);
          setRevealTimeouts([]);
        }
      }, index * 4000);
      timeouts.push(timeout);
    });

    setRevealTimeouts(timeouts);
  };

  const stopRevealAll = () => {
    // Clear all pending timeouts
    revealTimeouts.forEach(timeout => clearTimeout(timeout));
    setRevealTimeouts([]);
    setIsRevealingAll(false);
    setRevealing(false);
    // Clear any confetti
    confetti.reset();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-orange-700 flex items-center justify-center">
        <div className="text-white text-4xl font-bold animate-pulse">Loading Results...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-orange-700 p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
            🏆 BET AWARDS RESULTS 🏆
          </h1>
          <p className="text-2xl text-gray-700 font-bold">And the winners are...</p>

          <div className="mt-6">
            <button
              onClick={revealAll}
              className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-xl rounded-2xl hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              🎭 Reveal All Winners
            </button>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {results.map((result, index) => {
          const isCurrentlyRevealing = revealing && currentIndex === index;
          const isRevealed = revealed[index];

          return (
            <div
              key={result.award.id}
              id={`award-card-${index}`}
              className={`bg-white rounded-3xl shadow-2xl p-6 transition-all duration-300 ${
                isCurrentlyRevealing ? 'animate-drum-roll scale-105' : ''
              } ${isRevealed ? 'ring-4 ring-yellow-400' : ''}`}
            >
              {/* Award Header */}
              <div className="text-center mb-6">
                <div className="text-7xl mb-3 animate-bounce-slow">{result.award.emoji}</div>
                <h2 className="text-3xl font-black text-gray-800 mb-2">{result.award.title}</h2>
                <p className="text-gray-600">
                  {result.totalVotes} vote{result.totalVotes !== 1 ? 's' : ''} cast
                </p>
              </div>

              {/* Reveal Button or Winner */}
              {!isRevealed && !isCurrentlyRevealing && (
                <div className="text-center">
                  <button
                    onClick={() => revealWinner(index)}
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xl rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    🥁 Reveal Winner
                  </button>
                </div>
              )}

              {/* Drum Roll Animation */}
              {isCurrentlyRevealing && (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4 animate-spin-slow">🥁</div>
                  <div className="text-3xl font-bold text-purple-600 animate-pulse">
                    DRUM ROLL...
                  </div>
                  <div className="flex justify-center gap-2 mt-4">
                    <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-3 h-3 bg-pink-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-3 h-3 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              )}

              {/* Winner Reveal */}
              {isRevealed && result.winner && (
                <div className="space-y-4">
                  {/* Top 3 Podium */}
                  {(() => {
                    const sorted = Object.entries(result.voteCounts).sort(([, a], [, b]) => b - a);
                    const top3 = sorted.slice(0, 3);

                    if (top3.length >= 2) {
                      const [first, second, third] = top3;

                      return (
                        <div className="mb-6">
                          {/* Podium Display */}
                          <div className="flex items-end justify-center gap-4 mb-4">
                            {/* 2nd Place */}
                            {second && (
                              <div className="flex flex-col items-center" style={{ animation: 'slideUp 0.6s ease-out 0.3s both' }}>
                                <div className="text-4xl mb-2">🥈</div>
                                <div className="bg-gradient-to-b from-gray-300 to-gray-400 rounded-t-2xl px-4 py-6 text-center shadow-lg" style={{ height: '120px', width: '120px' }}>
                                  <div className="text-white font-black text-lg mb-1">{second[0]}</div>
                                  <div className="text-white text-sm font-bold">{second[1]} votes</div>
                                </div>
                                <div className="bg-gray-500 text-white font-black text-2xl py-2 px-4 rounded-b-lg">2</div>
                              </div>
                            )}

                            {/* 1st Place */}
                            {first && (
                              <div className="flex flex-col items-center" style={{ animation: 'slideUp 0.6s ease-out 0.1s both' }}>
                                <div className="text-5xl mb-2">🏆</div>
                                <div className="bg-gradient-to-b from-yellow-300 to-yellow-500 rounded-t-2xl px-4 py-8 text-center shadow-2xl" style={{ height: '160px', width: '140px' }}>
                                  <div className="text-gray-800 font-black text-xl mb-2">{first[0]}</div>
                                  <div className="text-gray-800 text-base font-bold">{first[1]} votes</div>
                                </div>
                                <div className="bg-yellow-600 text-white font-black text-3xl py-2 px-4 rounded-b-lg">1</div>
                              </div>
                            )}

                            {/* 3rd Place */}
                            {third && (
                              <div className="flex flex-col items-center" style={{ animation: 'slideUp 0.6s ease-out 0.5s both' }}>
                                <div className="text-4xl mb-2">🥉</div>
                                <div className="bg-gradient-to-b from-orange-300 to-orange-500 rounded-t-2xl px-4 py-4 text-center shadow-lg" style={{ height: '100px', width: '120px' }}>
                                  <div className="text-white font-black text-lg mb-1">{third[0]}</div>
                                  <div className="text-white text-sm font-bold">{third[1]} votes</div>
                                </div>
                                <div className="bg-orange-600 text-white font-black text-2xl py-2 px-4 rounded-b-lg">3</div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* All Results Breakdown */}
                  <div className="space-y-2">
                    {Object.entries(result.voteCounts)
                      .sort(([, a], [, b]) => b - a)
                      .map(([nominee, count], idx) => {
                        const percentage = (count / result.totalVotes) * 100;
                        const isWinner = nominee === result.winner;

                        return (
                          <div
                            key={nominee}
                            className={`rounded-xl p-4 transition-all ${
                              isWinner
                                ? 'bg-yellow-50 border-2 border-yellow-400'
                                : 'bg-gray-50'
                            }`}
                            style={{
                              animation: `slideIn 0.5s ease-out ${idx * 0.1}s both`
                            }}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-bold text-gray-800 flex items-center gap-2">
                                {idx === 0 && <span className="text-2xl">🏆</span>}
                                {idx === 1 && <span className="text-2xl">🥈</span>}
                                {idx === 2 && <span className="text-2xl">🥉</span>}
                                {nominee}
                              </span>
                              <span className="font-bold text-purple-600">
                                {count} vote{count !== 1 ? 's' : ''} ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-1000 ${
                                  isWinner
                                    ? 'bg-gradient-to-r from-yellow-400 to-orange-400'
                                    : 'bg-gradient-to-r from-purple-400 to-pink-400'
                                }`}
                                style={{
                                  width: `${percentage}%`,
                                  animation: 'fillBar 1s ease-out'
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Stop Button */}
      {isRevealingAll && (
        <button
          onClick={stopRevealAll}
          className="fixed bottom-8 right-8 z-50 px-8 py-4 bg-red-500 text-white font-bold text-xl rounded-full hover:bg-red-600 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all animate-pulse"
        >
          ⏹️ Stop Reveal
        </button>
      )}

      <style jsx>{`
        @keyframes drum-roll {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          10% { transform: translateX(-5px) rotate(-2deg); }
          20% { transform: translateX(5px) rotate(2deg); }
          30% { transform: translateX(-5px) rotate(-2deg); }
          40% { transform: translateX(5px) rotate(2deg); }
          50% { transform: translateX(-3px) rotate(-1deg); }
          60% { transform: translateX(3px) rotate(1deg); }
          70% { transform: translateX(-3px) rotate(-1deg); }
          80% { transform: translateX(3px) rotate(1deg); }
          90% { transform: translateX(-1px) rotate(-0.5deg); }
          95% { transform: translateX(1px) rotate(0.5deg); }
        }

        .animate-drum-roll {
          animation: drum-roll 0.5s infinite;
        }

        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .animate-spin-slow {
          animation: spin-slow 2s linear infinite;
        }

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        @keyframes winner-reveal {
          0% {
            transform: scale(0) rotate(-180deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.1) rotate(10deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        .animate-winner-reveal {
          animation: winner-reveal 0.8s ease-out;
        }

        @keyframes slideIn {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes fillBar {
          from {
            width: 0;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
