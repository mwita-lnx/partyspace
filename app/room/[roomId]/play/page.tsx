'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  options?: string[];
  correctAnswer?: string;
}

interface Room {
  id: string;
  code: string;
  name: string;
  category?: string;
  gameType?: string;
  status: string;
}

interface Participant {
  _id: string;
  name: string;
}

export default function PlayPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.roomId as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [awards, setAwards] = useState<Award[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const participantData = localStorage.getItem('participant');
    if (!participantData) {
      router.push('/landing');
      return;
    }

    const user = JSON.parse(participantData);
    setCurrentUser(user);

    // If user is host, redirect to leaderboard to see live results instead of playing
    if (user?.isHost) {
      router.push(`/room/${roomId}/leaderboard`);
      return;
    }

    fetchGameData();

    // Poll for room status changes
    const interval = setInterval(() => {
      checkRoomStatus();
    }, 3000);

    return () => clearInterval(interval);
  }, [roomId]);

  // Listen for messages from iframe games
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'GAME_COMPLETE') {
        // Games handle their own navigation
        // This message is just for notification purposes
        console.log('Game completed:', event.data);
      } else if (event.data.type === 'NAVIGATE_TO_RESULTS') {
        // Navigate to leaderboard/results page
        router.push(`/room/${roomId}/leaderboard`);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [roomId, router]);

  const checkRoomStatus = async () => {
    try {
      const response = await fetch(`/api/rooms/${roomId}`);
      const data = await response.json();

      if (data.room?.status === 'ended') {
        router.push(`/room/${roomId}/leaderboard`);
      } else if (data.room?.status === 'waiting') {
        // Host sent everyone back to lobby
        router.push(`/room/${roomId}/lobby`);
      }
    } catch (err) {
      console.error('Error checking room status:', err);
    }
  };

  const fetchGameData = async () => {
    try {
      const roomResponse = await fetch(`/api/rooms/${roomId}`);
      const roomData = await roomResponse.json();

      if (roomResponse.ok) {
        const roomInfo = roomData.room || roomData;
        setRoom(roomInfo);

        // If room is not active, redirect to lobby
        if (roomInfo.status !== 'active') {
          router.push(`/room/${roomId}/lobby`);
          return;
        }
      }

      const awardsResponse = await fetch(`/api/rooms/${roomId}/awards`);
      const awardsData = await awardsResponse.json();

      if (awardsResponse.ok) {
        const sortedAwards = awardsData.awards?.sort((a: Award, b: Award) => a.order - b.order) || [];
        setAwards(sortedAwards);
      }

      const participantsResponse = await fetch(`/api/rooms/${roomId}/participants`);
      const participantsData = await participantsResponse.json();

      if (participantsResponse.ok) {
        setParticipants(participantsData.participants || []);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching game data:', err);
      setLoading(false);
    }
  };

  const handleEndGame = () => {
    // End the game and go to leaderboard
    router.push(`/room/${roomId}/leaderboard`);
  };

  const handleBackToLobby = async () => {
    if (!confirm('Are you sure? This will end the current game and take everyone back to the lobby.')) {
      return;
    }

    try {
      const response = await fetch(`/api/rooms/${roomId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'waiting' })
      });

      if (response.ok) {
        router.push(`/room/${roomId}/lobby`);
      } else {
        alert('Failed to return to lobby. Please try again.');
      }
    } catch (error) {
      console.error('Error returning to lobby:', error);
      alert('Connection error. Please try again.');
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
          <p className="text-xl font-semibold text-gray-700">Loading game...</p>
        </div>
      </div>
    );
  }

  if (!room || awards.length === 0) {
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No questions found</h2>
          <button
            onClick={() => router.push(`/room/${roomId}/lobby`)}
            className="mt-4 px-6 py-3 bg-teal-400 text-white rounded-lg font-semibold hover:bg-teal-500 transition-colors"
          >
            Back to Lobby
          </button>
        </div>
      </div>
    );
  }

  const isReactionGame = room.category === 'reaction';

  // Generate single game URL with all challenges as params
  const getGameUrl = () => {
    const baseParams = new URLSearchParams({
      roomId: roomId,
      participantId: currentUser?.id || '',
      category: room.category || 'custom'
    });

    // Add all challenges as JSON including their game settings
    const challengesData = awards.map(award => {
      let options: string[] = [];
      if (award.options) {
        options = award.options;
      } else if (award.type === 'voting' || !award.type) {
        options = participants.map(p => p.name);
      }

      return {
        id: award._id,
        title: award.title,
        description: award.description || '',
        type: award.type || 'voting',
        timeLimit: award.timeLimit || 0,
        options: options,
        correctAnswer: award.correctAnswer,
        gameSettings: (award as any).gameSettings || {}
      };
    });

    baseParams.append('challenges', JSON.stringify(challengesData));

    // For reaction games, determine which game HTML to load
    if (isReactionGame) {
      // Use the type of the first challenge to determine the game
      const firstType = awards[0]?.type || 'tap-battle';

      if (firstType === 'color-match') {
        return `/games/color-match.html?${baseParams.toString()}`;
      } else if (firstType === 'quick-math') {
        return `/games/quick-math.html?${baseParams.toString()}`;
      } else if (firstType === 'word-race') {
        return `/games/word-race.html?${baseParams.toString()}`;
      } else if (firstType === 'memory-flash') {
        return `/games/memory-flash.html?${baseParams.toString()}`;
      } else if (firstType === 'reflex-test') {
        return `/games/reflex-test.html?${baseParams.toString()}`;
      }

      // Default to tap battle
      return `/games/tap-battle.html?${baseParams.toString()}`;
    }

    // For question-based games, route to specific game HTML files
    const gameTypeMap: { [key: string]: string } = {
      'bet-awards': '/games/bet-awards.html',
      'most-likely-to': '/games/most-likely-to.html',
      'would-you-rather': '/games/would-you-rather.html',
      'hot-takes': '/games/hot-takes.html',
      'this-or-that': '/games/this-or-that.html',
      'pop-culture-trivia': '/games/pop-culture-trivia.html',
      'speed-trivia': '/games/speed-trivia.html'
    };

    // Check if room has a specific game type
    const gameFile = gameTypeMap[room.gameType || ''];
    if (gameFile) {
      return `${gameFile}?${baseParams.toString()}`;
    }

    // Fallback to generic voting game
    return `/games/voting-game.html?${baseParams.toString()}`;
  };

  return (
    <div
      className="min-h-screen p-0 md:p-4 lg:p-8"
      style={{
        background: 'linear-gradient(135deg, #FFE5D9 0%, #D4F1F4 50%, #FFFACD 100%)',
        fontFamily: "'Quicksand', sans-serif"
      }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-0 md:mb-6">
          <div className="bg-white rounded-none md:rounded-2xl shadow-lg p-4 lg:p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <Image
                  src={isReactionGame ? '/competition.gif' : '/quiz.gif'}
                  alt="Game"
                  width={40}
                  height={40}
                  className="object-contain"
                  unoptimized
                />
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                    {room.name}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {awards.length} {isReactionGame ? 'Challenges' : 'Questions'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Image src="/receptionist.png" alt="Player" width={28} height={28} />
                <span className="font-bold text-gray-900">{currentUser?.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Single Game iframe - handles all challenges internally */}
        <div className="bg-white rounded-none md:rounded-2xl shadow-xl overflow-hidden">
          <iframe
            src={getGameUrl()}
            className="w-full"
            style={{ height: '80vh', minHeight: '600px', border: 'none' }}
            title="Game"
          />
        </div>

        {/* Host controls */}
        {currentUser?.isHost && (
          <div className="mt-4 flex justify-center gap-3 px-4 md:px-0">
            <button
              onClick={handleBackToLobby}
              className="px-6 py-3 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors shadow-lg border-2 border-red-300"
            >
              ← Back to Lobby
            </button>
            <button
              onClick={handleEndGame}
              className="px-6 py-3 bg-teal-400 text-white rounded-lg font-semibold hover:bg-teal-500 transition-colors shadow-lg"
            >
              End Game & View Results →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
