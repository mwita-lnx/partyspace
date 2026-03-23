'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

interface Award {
  _id: string;
  title: string;
  description: string;
  emoji: string;
  nominees: string[];
  order: number;
  type?: string;
  timeLimit?: number;
}

interface Room {
  id: string;
  code: string;
  name: string;
  description?: string;
  status: string;
  category?: string;
  gameType?: string;
  participantCount: number;
  awardCount: number;
}

function AdminContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get('roomId');

  const [room, setRoom] = useState<Room | null>(null);
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  useEffect(() => {
    if (!roomId) {
      router.push('/landing');
      return;
    }
    fetchRoomData();
  }, [roomId]);

  const fetchRoomData = async () => {
    if (!roomId) return;

    try {
      // Fetch room details
      const roomResponse = await fetch(`/api/rooms/${roomId}`);
      const roomData = await roomResponse.json();

      if (roomResponse.ok) {
        setRoom(roomData.room || roomData);
      } else {
        setError('Room not found');
      }

      // Fetch awards/challenges
      const awardsResponse = await fetch(`/api/rooms/${roomId}/awards`);
      const awardsData = await awardsResponse.json();

      if (awardsResponse.ok) {
        setAwards(awardsData.awards || []);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching room data:', err);
      setError('Failed to load room data');
      setLoading(false);
    }
  };

  const getGameSettingsUrl = () => {
    // Generate admin URL for the game's settings interface
    const params = new URLSearchParams({
      mode: 'admin',
      admin: 'true',
      roomId: roomId || '',
      participantId: 'admin'
    });

    // Determine which game HTML to load based on room's game type
    const gameTypeMap: { [key: string]: string } = {
      // Reaction games
      'color-match': '/games/color-match.html',
      'tap-battle': '/games/tap-battle.html',
      'quick-math': '/games/quick-math.html',
      'word-race': '/games/word-race.html',
      'memory-flash': '/games/memory-flash.html',
      'reflex-test': '/games/reflex-test.html',
      // Specific game templates
      'bet-awards': '/games/bet-awards.html',
      'most-likely-to': '/games/most-likely-to.html',
      'would-you-rather': '/games/would-you-rather.html',
      'hot-takes': '/games/hot-takes.html',
      'this-or-that': '/games/this-or-that.html',
      'pop-culture-trivia': '/games/pop-culture-trivia.html',
      'speed-trivia': '/games/speed-trivia.html'
    };

    const gameUrl = gameTypeMap[room?.gameType || ''] || '/games/voting-game.html';
    return `${gameUrl}?${params.toString()}`;
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
          <p className="text-xl font-semibold text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #FFE5D9 0%, #D4F1F4 50%, #FFFACD 100%)',
          fontFamily: "'Quicksand', sans-serif"
        }}
      >
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <Image src="/game-over.png" alt="Error" width={80} height={80} className="mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{error || 'Room not found'}</h2>
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

  const isReactionGame = room.category === 'reaction';
  const itemLabel = isReactionGame ? 'Challenge' : 'Question';
  const itemsLabel = isReactionGame ? 'Challenges' : 'Questions';

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
            onClick={() => router.push(`/room/${roomId}/lobby`)}
            className="text-gray-600 hover:text-gray-900 mb-4 inline-flex items-center gap-2 font-semibold"
          >
            ← Back to Lobby
          </button>

          <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <Image
                  src={isReactionGame ? '/competition.gif' : '/quiz.gif'}
                  alt="Admin"
                  width={60}
                  height={60}
                  className="object-contain"
                  unoptimized
                />
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                    Game Settings
                  </h1>
                  <p className="text-gray-600">{room.name} - PIN: {room.code}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <Image src="/receptionist.png" alt="Participants" width={40} height={40} />
              <div>
                <div className="text-3xl font-black text-purple-600">{room.participantCount}</div>
                <div className="text-gray-700 font-semibold">Participants</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <Image src={isReactionGame ? '/dice.png' : '/quiz.gif'} alt="Items" width={40} height={40} unoptimized={!isReactionGame} />
              <div>
                <div className="text-3xl font-black text-teal-600">{awards.length}</div>
                <div className="text-gray-700 font-semibold">{itemsLabel}</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <Image src="/podium.gif" alt="Status" width={40} height={40} unoptimized />
              <div>
                <div className="text-xl font-black text-blue-600 capitalize">{room.status}</div>
                <div className="text-gray-700 font-semibold">Room Status</div>
              </div>
            </div>
          </div>
        </div>

        {/* Game Settings Iframe */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Game Settings</h2>
          <p className="text-gray-600 mb-6">Configure settings for this game session</p>

          <div className="bg-gray-50 rounded-lg overflow-hidden" style={{ height: '600px' }}>
            <iframe
              src={getGameSettingsUrl()}
              className="w-full h-full"
              style={{ border: 'none' }}
              title="Game Settings"
            />
          </div>
        </div>
      </div>


      <style jsx>{`
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>}>
      <AdminContent />
    </Suspense>
  );
}
