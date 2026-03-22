'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
}

interface CumulativeScore {
  participantId: string;
  participantName: string;
  totalScore: number;
  gamesPlayed: number;
  rank: number;
}

export default function HistoryPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.roomId as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [cumulativeScores, setCumulativeScores] = useState<CumulativeScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'cumulative' | 'individual'>('cumulative');

  useEffect(() => {
    fetchRoomHistory();
  }, [roomId]);

  const fetchRoomHistory = async () => {
    try {
      const response = await fetch(`/api/rooms/${roomId}`);
      const data = await response.json();

      if (response.ok) {
        setRoom(data.room || data);
        calculateCumulativeScores(data.room?.gameSessions || data.gameSessions || []);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching room history:', err);
      setLoading(false);
    }
  };

  const calculateCumulativeScores = (sessions: GameSession[]) => {
    const scoreMap = new Map<string, { name: string; totalScore: number; gamesPlayed: number }>();

    // Aggregate scores from all completed game sessions
    sessions.forEach(session => {
      if (session.status === 'completed' && session.leaderboard) {
        session.leaderboard.forEach(entry => {
          const existing = scoreMap.get(entry.participantId) || {
            name: entry.participantName,
            totalScore: 0,
            gamesPlayed: 0
          };

          scoreMap.set(entry.participantId, {
            name: entry.participantName,
            totalScore: existing.totalScore + entry.score,
            gamesPlayed: existing.gamesPlayed + 1
          });
        });
      }
    });

    // Convert to array and sort by total score
    const scores: CumulativeScore[] = Array.from(scoreMap.entries())
      .map(([participantId, data]) => ({
        participantId,
        participantName: data.name,
        totalScore: data.totalScore,
        gamesPlayed: data.gamesPlayed,
        rank: 0
      }))
      .sort((a, b) => b.totalScore - a.totalScore);

    // Assign ranks
    scores.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    setCumulativeScores(scores);
  };

  const getGameName = (gameType: string) => {
    const gameNames: { [key: string]: string } = {
      'bet-awards': 'BET Awards',
      'superlatives': 'Superlatives',
      'office-awards': 'Office Awards',
      'team-builder-awards': 'Team Builder',
      'most-likely': 'Most Likely To',
      'would-rather': 'Would You Rather',
      'hot-takes': 'Hot Takes',
      'this-or-that': 'This or That',
      'two-truths': 'Two Truths & A Lie',
      'never-have-i-ever': 'Never Have I Ever',
      'ranking-game': 'Ranking Challenge',
      'caption-contest': 'Caption Contest',
      'pop-culture': 'Pop Culture Trivia',
      'speed-trivia': 'Speed Trivia',
      'guess-song': 'Guess the Song',
      'team-challenges': 'Team Challenges',
      'workplace-fun': 'Workplace Fun',
      'photo-challenges': 'Photo Challenges',
      'story-time': 'Story Time'
    };
    return gameNames[gameType] || gameType;
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
          <p className="text-xl font-semibold text-gray-700">Loading history...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #FFE5D9 0%, #D4F1F4 50%, #FFFACD 100%)',
          fontFamily: "'Quicksand', sans-serif"
        }}
      >
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <Image src="/game-over.png" alt="Not Found" width={80} height={80} className="mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Room not found</h2>
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

  const completedGames = room.gameSessions?.filter(s => s.status === 'completed') || [];

  return (
    <div
      className="min-h-screen p-4 lg:p-8"
      style={{
        background: 'linear-gradient(135deg, #FFE5D9 0%, #D4F1F4 50%, #FFFACD 100%)',
        fontFamily: "'Quicksand', sans-serif"
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900 mb-4 inline-flex items-center gap-2 font-semibold"
          >
            ← Back
          </button>

          <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
            <div className="flex items-center gap-4 mb-4">
              <Image src="/podium.gif" alt="History" width={60} height={60} className="object-contain" unoptimized />
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                  Game History
                </h1>
                <p className="text-gray-600">{room.name} - {completedGames.length} games played</p>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setViewMode('cumulative')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  viewMode === 'cumulative'
                    ? 'bg-teal-400 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cumulative Scores
              </button>
              <button
                onClick={() => setViewMode('individual')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  viewMode === 'individual'
                    ? 'bg-teal-400 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Individual Games
              </button>
            </div>
          </div>
        </div>

        {/* Cumulative View */}
        {viewMode === 'cumulative' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Image src="/trophy.png" alt="Trophy" width={32} height={32} />
              Overall Leaderboard
            </h2>

            {cumulativeScores.length > 0 ? (
              <div className="space-y-3">
                {cumulativeScores.map((entry, index) => (
                  <div
                    key={entry.participantId}
                    className="flex items-center justify-between p-5 rounded-xl transition-all hover:shadow-md"
                    style={{
                      background: getRankColor(entry.rank),
                      animation: `slideIn 0.3s ease-out ${index * 0.1}s both`
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-2xl"
                        style={{
                          background: entry.rank <= 3 ? 'linear-gradient(135deg, #4ECDC4 0%, #45B7D1 100%)' : 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)'
                        }}
                      >
                        {entry.rank}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-xl">
                          {entry.participantName}
                        </div>
                        <div className="text-sm text-gray-600 font-semibold">
                          {entry.gamesPlayed} game{entry.gamesPlayed !== 1 ? 's' : ''} played
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black text-teal-600">
                        {entry.totalScore}
                      </div>
                      <div className="text-sm text-gray-600 font-semibold">total pts</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Image src="/gaming.gif" alt="No games" width={80} height={80} className="mx-auto mb-4" unoptimized />
                <p className="text-gray-700 font-bold">No completed games yet</p>
              </div>
            )}
          </div>
        )}

        {/* Individual Games View */}
        {viewMode === 'individual' && (
          <div className="space-y-6">
            {completedGames.length > 0 ? (
              completedGames.map((session, sessionIndex) => (
                <div key={sessionIndex} className="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {getGameName(session.gameType)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(session.startedAt).toLocaleString()}
                      </p>
                    </div>
                    <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold text-sm">
                      Completed
                    </span>
                  </div>

                  {session.leaderboard && session.leaderboard.length > 0 ? (
                    <div className="space-y-2">
                      {session.leaderboard.slice(0, 5).map((entry) => (
                        <div
                          key={entry.participantId}
                          className="flex items-center justify-between p-4 rounded-lg"
                          style={{ background: getRankColor(entry.rank) }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold">
                              {entry.rank}
                            </div>
                            <span className="font-bold text-gray-900">{entry.participantName}</span>
                          </div>
                          <span className="text-xl font-black text-gray-900">{entry.score} pts</span>
                        </div>
                      ))}
                      {session.leaderboard.length > 5 && (
                        <p className="text-center text-sm text-gray-600 mt-2 font-semibold">
                          + {session.leaderboard.length - 5} more
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-4">No results recorded</p>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <Image src="/gaming.gif" alt="No games" width={80} height={80} className="mx-auto mb-4" unoptimized />
                <p className="text-gray-700 font-bold text-lg">No completed games yet</p>
                <p className="text-gray-600 mt-2">Play some games to see history here!</p>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
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
