'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import confetti from 'canvas-confetti';
import Image from 'next/image';

interface LeaderboardEntry {
  participantId: string;
  participantName: string;
  score: number;
  rank: number;
}

interface GameSession {
  gameType: string;
  category: string;
  startedAt: string;
  endedAt?: string;
  status: 'active' | 'completed';
  leaderboard: LeaderboardEntry[];
}

interface Room {
  id: string;
  code: string;
  name: string;
  gameSessions: GameSession[];
  currentGameIndex: number;
  status: string;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.roomId as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [currentSession, setCurrentSession] = useState<GameSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [confettiShown, setConfettiShown] = useState(false);

  useEffect(() => {
    const participantData = localStorage.getItem('participant');
    if (!participantData) {
      router.push('/landing');
      return;
    }

    setCurrentUser(JSON.parse(participantData));
    fetchLeaderboard();
  }, [roomId]);

  useEffect(() => {
    if (currentSession && !confettiShown) {
      // Celebrate the winners!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 250);
      setConfettiShown(true);
    }
  }, [currentSession, confettiShown]);

  const fetchLeaderboard = async () => {
    try {
      // Fetch room details
      const roomResponse = await fetch(`/api/rooms/${roomId}`);
      const roomData = await roomResponse.json();

      if (roomResponse.ok) {
        setRoom(roomData.room);
      }

      // Fetch leaderboard data
      const leaderboardResponse = await fetch(`/api/rooms/${roomId}/leaderboard`);
      const leaderboardData = await leaderboardResponse.json();

      if (leaderboardResponse.ok && leaderboardData.leaderboard) {
        // Create a game session object for compatibility
        setCurrentSession({
          gameType: leaderboardData.gameType || 'custom',
          category: leaderboardData.category || 'awards',
          startedAt: roomData.room?.startedAt || new Date().toISOString(),
          endedAt: roomData.room?.endedAt,
          status: leaderboardData.status === 'ended' ? 'completed' : 'active',
          leaderboard: leaderboardData.leaderboard
        });
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setLoading(false);
    }
  };

  const handlePlayAgain = () => {
    if (currentUser?.isHost) {
      router.push(`/room/${roomId}/select-game`);
    }
  };

  const handleViewAllGames = () => {
    router.push(`/room/${roomId}/history`);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '/winner.png';
      case 2:
        return '/trophy.png';
      case 3:
        return '/trophy.png';
      default:
        return null;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'; // Gold
      case 2:
        return 'linear-gradient(135deg, #C0C0C0 0%, #A9A9A9 100%)'; // Silver
      case 3:
        return 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)'; // Bronze
      default:
        return 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)';
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
          <Image src="/gaming.gif" alt="Loading" width={80} height={80} className="mx-auto mb-4" unoptimized />
          <p className="text-xl font-semibold text-gray-700">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (!room || !currentSession) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #FFE5D9 0%, #D4F1F4 50%, #FFFACD 100%)',
          fontFamily: "'Quicksand', sans-serif"
        }}
      >
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <Image src="/game-over.png" alt="No Results" width={80} height={80} className="mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No results yet</h2>
          <button
            onClick={() => router.push('/landing')}
            className="mt-4 px-6 py-3 bg-teal-400 text-white rounded-lg font-semibold hover:bg-teal-500 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const leaderboard = currentSession.leaderboard || [];
  const topThree = leaderboard.slice(0, 3);
  const restOfPlayers = leaderboard.slice(3);

  return (
    <div
      className="min-h-screen p-4 lg:p-8"
      style={{
        background: 'linear-gradient(135deg, #FFE5D9 0%, #D4F1F4 50%, #FFFACD 100%)',
        fontFamily: "'Quicksand', sans-serif"
      }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <Image src="/podium.gif" alt="Leaderboard" width={100} height={100} className="mx-auto" unoptimized />
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-2">
            Game Results!
          </h1>
          <p className="text-xl text-gray-700 font-semibold">{room.name}</p>
          <p className="text-md text-gray-600 mt-2">Game PIN: {room.code}</p>
        </div>

        {/* Podium - Top 3 */}
        {topThree.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Top Performers</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topThree.map((entry) => {
                const rankIcon = getRankIcon(entry.rank);
                return (
                  <div
                    key={entry.participantId}
                    className="relative"
                    style={{
                      order: entry.rank === 1 ? -1 : entry.rank,
                      animation: `slideUp 0.5s ease-out ${entry.rank * 0.2}s both`
                    }}
                  >
                    <div
                      className="bg-white rounded-2xl shadow-xl p-6 text-center transform hover:scale-105 transition-all"
                      style={{
                        border: entry.rank === 1 ? '4px solid #FFD700' : entry.rank === 2 ? '4px solid #C0C0C0' : '4px solid #CD7F32'
                      }}
                    >
                      {rankIcon && (
                        <div className="mb-4">
                          <Image src={rankIcon} alt={`Rank ${entry.rank}`} width={60} height={60} className="mx-auto" />
                        </div>
                      )}
                      <div
                        className="text-6xl font-black mb-2"
                        style={{
                          color: entry.rank === 1 ? '#FFD700' : entry.rank === 2 ? '#C0C0C0' : '#CD7F32'
                        }}
                      >
                        #{entry.rank}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {entry.participantName}
                      </h3>
                      <div className="text-3xl font-black text-teal-600">
                        {entry.score} pts
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Rest of Leaderboard */}
        {restOfPlayers.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Full Rankings</h2>
            <div className="space-y-3">
              {restOfPlayers.map((entry, index) => (
                <div
                  key={entry.participantId}
                  className="flex items-center justify-between p-4 rounded-xl transition-all hover:shadow-md"
                  style={{
                    background: getRankColor(entry.rank),
                    animation: `slideIn 0.3s ease-out ${(index + 3) * 0.1}s both`
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold text-xl">
                      {entry.rank}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-lg">
                        {entry.participantName}
                      </div>
                    </div>
                  </div>
                  <div className="text-2xl font-black text-gray-900">
                    {entry.score} pts
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {currentUser?.isHost && (
            <button
              onClick={handlePlayAgain}
              className="px-8 py-4 bg-gradient-to-r from-teal-400 to-cyan-400 text-white rounded-xl font-bold text-lg hover:from-teal-500 hover:to-cyan-500 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Image src="/fireworks.png" alt="Play Again" width={24} height={24} />
              Start New Game
            </button>
          )}
          {room.gameSessions && room.gameSessions.length > 1 && (
            <button
              onClick={handleViewAllGames}
              className="px-8 py-4 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-xl font-bold text-lg hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Image src="/podium.gif" alt="History" width={24} height={24} unoptimized />
              View All Games
            </button>
          )}
          <button
            onClick={() => router.push('/landing')}
            className="px-8 py-4 bg-white text-gray-700 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all shadow-lg border-2 border-gray-200"
          >
            Back to Home
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
