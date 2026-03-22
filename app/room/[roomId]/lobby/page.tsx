'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import confetti from 'canvas-confetti';
import Image from 'next/image';

interface Participant {
  id: string;
  name: string;
  code: string;
  isHost: boolean;
  hasVoted: boolean;
  joinedAt: string;
}

interface Room {
  id: string;
  code: string;
  name: string;
  description?: string;
  status: string;
  participantCount: number;
  awardCount: number;
  category?: string;
  gameType?: string;
}

export default function RoomLobbyPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.roomId as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [starting, setStarting] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    // Get current user from localStorage
    const participantData = localStorage.getItem('participant');
    if (!participantData) {
      router.push('/landing');
      return;
    }

    setCurrentUser(JSON.parse(participantData));
    fetchRoomData();

    // Poll for updates every 1 second (faster to catch status changes)
    // Stop polling if countdown has started
    const interval = setInterval(() => {
      if (countdown === null) {
        fetchRoomData();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [roomId, countdown]);

  // Countdown effect
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      // Countdown finished, navigate to play
      router.push(`/room/${roomId}/play`);
    }
  }, [countdown]);

  const fetchRoomData = async () => {
    try {
      // Fetch room details
      const roomResponse = await fetch(`/api/rooms/${roomId}`);
      const roomData = await roomResponse.json();

      if (roomResponse.ok) {
        const roomInfo = roomData.room || roomData;
        setRoom(roomInfo);

        // If room status changed to active and we haven't started countdown yet
        if (roomInfo.status === 'active' && countdown === null) {
          setCountdown(3); // Start 3 second countdown
        }
      }

      // Fetch participants
      const participantsResponse = await fetch(`/api/rooms/${roomId}/participants`);
      const participantsData = await participantsResponse.json();

      if (participantsResponse.ok) {
        setParticipants(participantsData.participants);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching room data:', err);
      setLoading(false);
    }
  };

  const handleStartVoting = async () => {
    setStarting(true);
    setError('');

    try {
      const response = await fetch(`/api/rooms/${roomId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' })
      });

      if (response.ok) {
        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.6 }
        });

        // Start countdown for all participants
        setCountdown(3);
      } else {
        setError('Failed to start game. Please try again.');
        setStarting(false);
      }
    } catch (err) {
      setError('Connection error. Please try again.');
      setStarting(false);
    }
  };

  const copyRoomCode = () => {
    if (room) {
      navigator.clipboard.writeText(room.code);

      // Mini confetti celebration
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.5 }
      });

      // Show copied feedback
      const btn = document.getElementById('copy-btn');
      if (btn) {
        const originalText = btn.textContent;
        btn.textContent = '✓ Copied!';
        setTimeout(() => {
          btn.textContent = originalText;
        }, 2000);
      }
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
          <p className="text-xl font-semibold text-gray-700">Loading room...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
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

  return (
    <div
      className="min-h-screen p-4 lg:p-8"
      style={{
        background: 'linear-gradient(135deg, #FFE5D9 0%, #D4F1F4 50%, #FFFACD 100%)',
        fontFamily: "'Quicksand', sans-serif"
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <button
            onClick={() => router.push('/landing')}
            className="text-gray-600 hover:text-gray-900 mb-4 inline-flex items-center gap-2 font-semibold"
          >
            ← Leave Room
          </button>

          <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Room Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Image src="/trophy.png" alt="Room" width={40} height={40} className="object-contain" />
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                    {room.name}
                  </h1>
                </div>
                {room.description && (
                  <p className="text-gray-600 text-lg">{room.description}</p>
                )}
              </div>

              {/* Game PIN Card */}
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-8 rounded-xl border-4 border-teal-300 shadow-xl">
                <p className="text-sm font-bold text-gray-700 mb-3 text-center uppercase tracking-wide">Game PIN</p>
                <div className="flex items-center justify-center">
                  <div className="text-6xl lg:text-7xl font-black text-teal-600 tracking-wider font-mono">
                    {room.code}
                  </div>
                </div>
                <button
                  id="copy-btn"
                  onClick={copyRoomCode}
                  className="mt-4 w-full px-6 py-3 bg-gradient-to-r from-teal-400 to-cyan-400 text-white rounded-lg font-bold hover:from-teal-500 hover:to-cyan-500 transition-all transform hover:scale-105 shadow-lg"
                >
                  Copy PIN
                </button>
                <p className="text-xs text-gray-600 mt-3 text-center font-semibold">Share this PIN to join</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Stats */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Room Stats</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                  <Image src="/trophy.png" alt="Participants" width={40} height={40} className="object-contain" />
                  <div>
                    <div className="text-3xl font-bold text-gray-900">{participants.length}</div>
                    <div className="text-sm text-gray-600">Participants</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
                  <Image src="/winner.png" alt="Awards" width={40} height={40} className="object-contain" />
                  <div>
                    <div className="text-3xl font-bold text-gray-900">{room.awardCount || 0}</div>
                    <div className="text-sm text-gray-600">Questions</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Host Actions or Waiting State */}
            {currentUser.isHost ? (
              <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl shadow-lg p-6 border-2 border-orange-300">
                <div className="flex items-start gap-3 mb-4">
                  <Image src="/winner.png" alt="Host" width={32} height={32} className="object-contain" />
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">You're the Host!</h3>
                    <p className="text-sm text-gray-700">
                      Ready to start? Make sure everyone has joined.
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded-lg text-center font-semibold">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleStartVoting}
                  disabled={starting || participants.length < 2}
                  className="w-full px-6 py-4 text-white rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  style={{
                    background: (starting || participants.length < 2) ? '#9CA3AF' : 'linear-gradient(135deg, #4ECDC4 0%, #45B7D1 100%)'
                  }}
                >
                  {starting ? (
                    'Starting...'
                  ) : participants.length < 2 ? (
                    'Need 2+ participants'
                  ) : (
                    <>
                      <Image src="/fireworks.png" alt="Start" width={24} height={24} className="object-contain" />
                      {room.category === 'reaction' ? 'Start Challenge' : 'Start Voting'}
                    </>
                  )}
                </button>

                <button
                  onClick={() => router.push(`/admin?roomId=${roomId}`)}
                  className="w-full mt-3 px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors border-2 border-gray-200"
                >
                  {room.category === 'reaction' ? 'Manage Challenges' : 'Manage Questions'}
                </button>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl shadow-lg p-6 border-2 border-yellow-300">
                <div className="flex items-start gap-3 mb-4">
                  <Image src="/idea.png" alt="Welcome" width={32} height={32} className="object-contain" />
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">Welcome!</h3>
                    <p className="text-sm text-gray-700">
                      {room.category === 'reaction'
                        ? 'Waiting for the host to start the challenge...'
                        : 'Waiting for the host to start voting...'}
                    </p>
                  </div>
                </div>
                <div className="text-center p-6 bg-white/50 rounded-lg">
                  <Image src="/gaming.gif" alt="Waiting" width={64} height={64} className="mx-auto mb-3" unoptimized />
                  <p className="text-sm text-gray-700 font-semibold">
                    The host will begin when everyone is ready
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Participants */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Participants ({participants.length})
                </h2>
              </div>

              <div className="space-y-3">
                {participants.map((participant, index) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between p-4 lg:p-5 rounded-xl transition-all hover:shadow-md"
                    style={{
                      background: participant.isHost
                        ? 'linear-gradient(135deg, #FFE66D 0%, #FFD700 100%)'
                        : 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
                      animation: `slideIn 0.3s ease-out ${index * 0.05}s both`
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        {participant.isHost ? (
                          <Image src="/winner.png" alt="Host" width={48} height={48} className="object-contain" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold text-xl">
                            {participant.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-lg">
                            {participant.name}
                          </span>
                          {participant.id === currentUser.id && (
                            <span className="px-2 py-1 bg-teal-400 text-white text-xs rounded-full font-semibold">
                              You
                            </span>
                          )}
                        </div>
                        {participant.isHost && (
                          <div className="text-sm font-semibold" style={{ color: '#D97706' }}>
                            Host
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 font-semibold hidden sm:block">
                      Joined {new Date(participant.joinedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                ))}

                {participants.length === 1 && currentUser.isHost && (
                  <div className="text-center py-12">
                    <Image src="/dressing-room.gif" alt="Waiting" width={120} height={120} className="mx-auto mb-4" unoptimized />
                    <p className="text-gray-700 font-bold text-lg mb-2">It's quiet in here...</p>
                    <p className="text-gray-500">
                      Share the room code above to invite participants!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Countdown Overlay */}
      {countdown !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="text-center">
            <div className="text-9xl font-black text-white mb-6 animate-bounce" style={{
              textShadow: '0 0 40px rgba(255,255,255,0.5), 0 0 80px rgba(78,205,196,0.3)'
            }}>
              {countdown}
            </div>
            <p className="text-3xl font-bold text-white animate-pulse">
              Get Ready!
            </p>
          </div>
        </div>
      )}

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
