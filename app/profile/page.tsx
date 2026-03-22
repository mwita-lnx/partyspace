'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface RoomHistory {
  roomId: string;
  roomCode: string;
  roomName: string;
  gameType: string;
  role: 'host' | 'participant';
  joinedAt: string;
  status?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [roomHistory, setRoomHistory] = useState<RoomHistory[]>([]);
  const [filter, setFilter] = useState<'all' | 'host' | 'participant'>('all');

  useEffect(() => {
    loadRoomHistory();
  }, []);

  const loadRoomHistory = () => {
    const historyData = localStorage.getItem('roomHistory');
    if (historyData) {
      try {
        const history: RoomHistory[] = JSON.parse(historyData);
        setRoomHistory(history.sort((a, b) =>
          new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()
        ));
      } catch (error) {
        console.error('Error loading room history:', error);
      }
    }
  };

  const saveToHistory = (room: RoomHistory) => {
    const historyData = localStorage.getItem('roomHistory');
    let history: RoomHistory[] = [];

    if (historyData) {
      try {
        history = JSON.parse(historyData);
      } catch (error) {
        console.error('Error parsing room history:', error);
      }
    }

    // Check if room already exists
    const existingIndex = history.findIndex(h => h.roomId === room.roomId);
    if (existingIndex >= 0) {
      history[existingIndex] = room;
    } else {
      history.unshift(room);
    }

    // Keep only last 50 rooms
    history = history.slice(0, 50);

    localStorage.setItem('roomHistory', JSON.stringify(history));
    setRoomHistory(history);
  };

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear your room history?')) {
      localStorage.removeItem('roomHistory');
      setRoomHistory([]);
    }
  };

  const deleteRoom = (roomId: string) => {
    const updated = roomHistory.filter(r => r.roomId !== roomId);
    localStorage.setItem('roomHistory', JSON.stringify(updated));
    setRoomHistory(updated);
  };

  const rejoinRoom = async (room: RoomHistory) => {
    // Try to fetch room status first
    try {
      const response = await fetch(`/api/rooms/${room.roomId}`);
      if (response.ok) {
        router.push(`/room/${room.roomId}/lobby`);
      } else {
        alert('This room is no longer available.');
      }
    } catch (error) {
      alert('Could not connect to room. It may no longer exist.');
    }
  };

  const filteredRooms = roomHistory.filter(room => {
    if (filter === 'all') return true;
    return room.role === filter;
  });

  const getGameName = (gameType: string) => {
    const gameNames: { [key: string]: string } = {
      'bet-awards': 'BET Awards',
      'superlatives': 'Superlatives',
      'most-likely-to': 'Most Likely To',
      'would-you-rather': 'Would You Rather',
      'hot-takes': 'Hot Takes',
      'this-or-that': 'This or That',
      'pop-culture-trivia': 'Pop Culture Trivia',
      'speed-trivia': 'Speed Trivia',
      'color-match': 'Color Match',
      'tap-battle': 'Tap Battle',
      'quick-math': 'Quick Math',
      'word-race': 'Word Race',
      'memory-flash': 'Memory Flash',
      'reflex-test': 'Reflex Test'
    };
    return gameNames[gameType] || gameType;
  };

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
        <div className="mb-8">
          <button
            onClick={() => router.push('/landing')}
            className="text-gray-600 hover:text-gray-900 mb-4 inline-flex items-center gap-2 font-semibold"
          >
            ← Back to Home
          </button>

          <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Image src="/dressing-room.gif" alt="Profile" width={60} height={60} className="object-contain" unoptimized />
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                    My Rooms
                  </h1>
                  <p className="text-gray-600">Your gaming history and saved rooms</p>
                </div>
              </div>

              {roomHistory.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors text-sm"
                >
                  Clear History
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {roomHistory.length > 0 && (
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-4xl font-black text-teal-600 mb-2">
                {roomHistory.length}
              </div>
              <div className="text-gray-700 font-semibold">Total Rooms</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-4xl font-black text-purple-600 mb-2">
                {roomHistory.filter(r => r.role === 'host').length}
              </div>
              <div className="text-gray-700 font-semibold">Hosted</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-4xl font-black text-blue-600 mb-2">
                {roomHistory.filter(r => r.role === 'participant').length}
              </div>
              <div className="text-gray-700 font-semibold">Joined</div>
            </div>
          </div>
        )}

        {/* Filter Buttons */}
        {roomHistory.length > 0 && (
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-teal-400 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              All Rooms
            </button>
            <button
              onClick={() => setFilter('host')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                filter === 'host'
                  ? 'bg-teal-400 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Hosted
            </button>
            <button
              onClick={() => setFilter('participant')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                filter === 'participant'
                  ? 'bg-teal-400 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Joined
            </button>
          </div>
        )}

        {/* Room List */}
        {filteredRooms.length > 0 ? (
          <div className="space-y-4">
            {filteredRooms.map((room, index) => (
              <div
                key={room.roomId}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all"
                style={{
                  animation: `slideIn 0.3s ease-out ${index * 0.05}s both`
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{room.roomName}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        room.role === 'host'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {room.role === 'host' ? 'Host' : 'Participant'}
                      </span>
                    </div>

                    <div className="space-y-1 text-sm text-gray-600">
                      <p className="font-semibold">
                        <span className="text-gray-900">PIN:</span> {room.roomCode}
                      </p>
                      <p>
                        <span className="font-semibold">Game:</span> {getGameName(room.gameType)}
                      </p>
                      <p>
                        <span className="font-semibold">Joined:</span> {new Date(room.joinedAt).toLocaleDateString()} at {new Date(room.joinedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => rejoinRoom(room)}
                      className="px-4 py-2 bg-gradient-to-r from-teal-400 to-cyan-400 text-white rounded-lg font-semibold hover:from-teal-500 hover:to-cyan-500 transition-all shadow-md text-sm"
                    >
                      Rejoin
                    </button>
                    <button
                      onClick={() => deleteRoom(room.roomId)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <Image
              src="/gaming.gif"
              alt="No rooms"
              width={100}
              height={100}
              className="mx-auto mb-6"
              unoptimized
            />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {filter === 'all' ? 'No Rooms Yet' : `No ${filter === 'host' ? 'Hosted' : 'Joined'} Rooms`}
            </h2>
            <p className="text-gray-600 mb-6">
              {filter === 'all'
                ? 'Start by creating or joining a room!'
                : `You haven't ${filter === 'host' ? 'hosted' : 'joined'} any rooms yet.`}
            </p>
            <button
              onClick={() => router.push('/landing')}
              className="px-6 py-3 bg-teal-400 text-white rounded-lg font-semibold hover:bg-teal-500 transition-colors"
            >
              Go to Home
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
