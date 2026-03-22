'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAllGameTemplates, getGameCategories, getGameTemplate } from '@/lib/gameTemplates';
import confetti from 'canvas-confetti';
import Image from 'next/image';

export default function CreateRoomPage() {
  const router = useRouter();
  const gameTemplates = getAllGameTemplates();
  const categories = getGameCategories();

  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('awards');
  const [roomName, setRoomName] = useState('');
  const [roomDescription, setRoomDescription] = useState('');
  const [hostName, setHostName] = useState('');
  const [selectedGame, setSelectedGame] = useState('bet-awards');
  const [settings, setSettings] = useState({
    allowLateJoin: true,
    showLiveResults: false,
    maxParticipants: 50,
    votesPerAward: 3
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHint, setShowHint] = useState(true);

  const handleCreateRoom = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: roomName,
          description: roomDescription,
          hostName,
          gameType: selectedGame,
          category: getGameTemplate(selectedGame)?.category || 'custom',
          settings
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Store host and room data
        localStorage.setItem('participant', JSON.stringify(data.host));
        localStorage.setItem('room', JSON.stringify(data.room));

        // Save to room history
        const historyData = localStorage.getItem('roomHistory');
        let history: any[] = [];
        if (historyData) {
          try {
            history = JSON.parse(historyData);
          } catch (error) {
            console.error('Error parsing room history:', error);
          }
        }

        // Add room to history
        const roomEntry = {
          roomId: data.room.id,
          roomCode: data.room.code,
          roomName: data.room.name,
          gameType: data.room.gameType || selectedGame,
          role: 'host' as const,
          joinedAt: new Date().toISOString(),
          status: data.room.status
        };

        // Check if room already exists
        const existingIndex = history.findIndex((h: any) => h.roomId === roomEntry.roomId);
        if (existingIndex >= 0) {
          history[existingIndex] = roomEntry;
        } else {
          history.unshift(roomEntry);
        }

        // Keep only last 50 rooms
        history = history.slice(0, 50);
        localStorage.setItem('roomHistory', JSON.stringify(history));

        // Celebration
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 }
        });

        // Redirect to room lobby
        setTimeout(() => {
          router.push(`/room/${data.room.id}/lobby`);
        }, 500);
      } else {
        setError(data.error || 'Failed to create room');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen p-4"
      style={{
        background: 'linear-gradient(135deg, #FFE5D9 0%, #D4F1F4 50%, #FFFACD 100%)',
        fontFamily: "'Quicksand', sans-serif"
      }}
    >
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => router.push('/landing')}
            className="text-gray-600 hover:text-gray-900 mb-4 inline-flex items-center gap-2"
          >
            ← Back to Home
          </button>
          <div className="flex items-center justify-center gap-3 mb-2">
            <Image src="/fireworks.png" alt="Create Game" width={48} height={48} className="object-contain" />
            <h1 className="text-4xl font-bold text-gray-900">
              Create Your Game
            </h1>
          </div>
          <p className="text-gray-600">Step {step} of 4</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${(step / 4) * 100}%`,
                background: 'linear-gradient(90deg, #4ECDC4 0%, #FFE66D 100%)'
              }}
            />
          </div>
        </div>

        {/* Step 1: Room Details */}
        {step === 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Room Details</h2>
              {showHint && (
                <button
                  onClick={() => setShowHint(false)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close hint"
                >
                  ✕
                </button>
              )}
            </div>

            {showHint && (
              <div
                className="mb-6 p-4 rounded-lg border-2"
                style={{ backgroundColor: '#FFFEF0', borderColor: '#FFE66D' }}
              >
                <div className="flex items-start gap-3">
                  <Image src="/magic-wand.png" alt="Tip" width={32} height={32} className="object-contain" />
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">Quick Tip</div>
                    <p className="text-sm text-gray-700">
                      Give your room a fun, memorable name! This will help participants know they're in the right place.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="hostName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Name (Host)
                </label>
                <input
                  type="text"
                  id="hostName"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-coral-400 focus:outline-none focus:ring-2 focus:ring-coral-200 transition-all text-black"
                  placeholder="Enter your name"
                  required
                  autoComplete="off"
                />
              </div>

              <div>
                <label htmlFor="roomName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Room Name
                </label>
                <input
                  type="text"
                  id="roomName"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-coral-400 focus:outline-none focus:ring-2 focus:ring-coral-200 transition-all text-black"
                  placeholder="e.g., BET Awards 2024"
                  maxLength={100}
                  required
                  autoComplete="off"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Examples: "Senior Class Awards", "Team Superlatives 2024", "Family Game Night Awards"
                </p>
              </div>

              <div>
                <label htmlFor="roomDescription" className="block text-sm font-semibold text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  id="roomDescription"
                  value={roomDescription}
                  onChange={(e) => setRoomDescription(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-coral-400 focus:outline-none focus:ring-2 focus:ring-coral-200 transition-all text-black resize-none"
                  placeholder="Tell participants what this room is about"
                  rows={3}
                  maxLength={500}
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setStep(2)}
                disabled={!hostName || !roomName}
                className="px-6 py-3 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors btn-press btn-lift"
                style={{ background: !hostName || !roomName ? '#9CA3AF' : 'linear-gradient(135deg, #4ECDC4 0%, #45B7D1 100%)' }}
                onMouseEnter={(e) => hostName && roomName && (e.currentTarget.style.background = 'linear-gradient(135deg, #3DBDB3 0%, #3AA6C1 100%)')}
                onMouseLeave={(e) => hostName && roomName && (e.currentTarget.style.background = 'linear-gradient(135deg, #4ECDC4 0%, #45B7D1 100%)')}
              >
                Next: Choose Game →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Category Selection */}
        {step === 2 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Game Category</h2>
            <p className="text-gray-600 mb-6">
              What type of game do you want to play?
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    // Auto-select first game in category
                    const firstGame = gameTemplates.find(g => g.category === category.id);
                    if (firstGame) setSelectedGame(firstGame.id);
                  }}
                  className={`p-6 rounded-lg border-2 text-center transition-all btn-press ${
                    selectedCategory === category.id
                      ? ''
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                  style={
                    selectedCategory === category.id
                      ? { borderColor: category.color, backgroundColor: `${category.color}20` }
                      : {}
                  }
                >
                  <div className="flex justify-center mb-2">
                    <Image
                      src={(category as any).image || '/magic-wand.png'}
                      alt={category.name}
                      width={80}
                      height={80}
                      className="object-contain"
                      unoptimized={(category as any).image?.endsWith('.gif')}
                    />
                  </div>
                  <h3 className="font-bold text-gray-900">{category.name}</h3>
                  {selectedCategory === category.id && (
                    <div className="text-xl mt-2" style={{ color: category.color }}>
                      ✓
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-6 py-3 text-white rounded-lg font-semibold transition-colors btn-press btn-lift"
                style={{ background: 'linear-gradient(135deg, #4ECDC4 0%, #45B7D1 100%)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'linear-gradient(135deg, #3DBDB3 0%, #3AA6C1 100%)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'linear-gradient(135deg, #4ECDC4 0%, #45B7D1 100%)')}
              >
                Next: Pick Game →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Game Selection */}
        {step === 3 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Game</h2>
            <p className="text-gray-600 mb-6">
              Pick from our collection of {selectedCategory} games
            </p>

            <div className="space-y-3">
              {gameTemplates
                .filter(game => game.category === selectedCategory)
                .map((game) => (
                  <button
                    key={game.id}
                    onClick={() => setSelectedGame(game.id)}
                    className={`w-full p-5 rounded-lg border-2 text-left transition-all btn-press ${
                      selectedGame === game.id
                        ? ''
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                    style={
                      selectedGame === game.id
                        ? { borderColor: game.color, backgroundColor: `${game.color}20` }
                        : {}
                    }
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 mb-1">
                          {game.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">
                          {game.description}
                        </p>
                        <div className="flex gap-3 text-xs text-gray-500">
                          <span>{game.minPlayers}-{game.maxPlayers} players</span>
                          <span>•</span>
                          <span>{game.duration}</span>
                          {game.questions.length > 0 && (
                            <>
                              <span>•</span>
                              <span>{game.questions.length} questions</span>
                            </>
                          )}
                        </div>
                      </div>
                      {selectedGame === game.id && (
                        <div className="text-2xl" style={{ color: game.color }}>
                          ✓
                        </div>
                      )}
                    </div>
                  </button>
                ))}
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="px-6 py-3 text-white rounded-lg font-semibold transition-colors btn-press btn-lift"
                style={{ background: 'linear-gradient(135deg, #4ECDC4 0%, #45B7D1 100%)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'linear-gradient(135deg, #3DBDB3 0%, #3AA6C1 100%)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'linear-gradient(135deg, #4ECDC4 0%, #45B7D1 100%)')}
              >
                Next: Settings →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Settings */}
        {step === 4 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Room Settings</h2>
            <p className="text-gray-600 mb-6">
              Customize how your game room will work. You can change these later.
            </p>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">Allow Late Join</h3>
                  <p className="text-sm text-gray-600">
                    Let people join after the game starts
                  </p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, allowLateJoin: !settings.allowLateJoin })}
                  className={`w-14 h-8 rounded-full transition-colors ${
                    settings.allowLateJoin ? 'bg-teal-400' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-6 h-6 bg-white rounded-full transition-transform ${
                      settings.allowLateJoin ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">Show Live Results</h3>
                  <p className="text-sm text-gray-600">
                    Display results as they come in
                  </p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, showLiveResults: !settings.showLiveResults })}
                  className={`w-14 h-8 rounded-full transition-colors ${
                    settings.showLiveResults ? 'bg-teal-400' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-6 h-6 bg-white rounded-full transition-transform ${
                      settings.showLiveResults ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <label htmlFor="maxParticipants" className="block font-semibold text-gray-900 mb-2">
                  Max Participants
                </label>
                <input
                  type="number"
                  id="maxParticipants"
                  min="2"
                  max="500"
                  step="1"
                  value={settings.maxParticipants}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (val >= 2 && val <= 500) {
                      setSettings({ ...settings, maxParticipants: val });
                    }
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all text-black font-semibold"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Maximum number of people who can join (2-500)
                </p>
              </div>

              {/* Only show Votes Per Award for voting-based games (awards category) */}
              {selectedCategory === 'awards' && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label htmlFor="votesPerAward" className="block font-semibold text-gray-900 mb-2">
                    Votes Per Award
                  </label>
                  <input
                    type="number"
                    id="votesPerAward"
                    min="1"
                    max="10"
                    step="1"
                    value={settings.votesPerAward}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (val >= 1 && val <= 10) {
                        setSettings({ ...settings, votesPerAward: val });
                      }
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all text-black font-semibold"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Each participant can vote for {settings.votesPerAward} {settings.votesPerAward === 1 ? 'person' : 'people'} per award (1-10)
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div
                className="mt-6 bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded-lg text-center font-semibold"
                role="alert"
              >
                {error}
              </div>
            )}

            <div className="flex justify-between mt-6">
              <button
                onClick={() => setStep(3)}
                disabled={loading}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleCreateRoom}
                disabled={loading}
                className="px-8 py-3 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors btn-press btn-lift flex items-center gap-2"
                style={{ background: loading ? '#9CA3AF' : 'linear-gradient(135deg, #FFE66D 0%, #F4A261 100%)' }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.background = 'linear-gradient(135deg, #FFD555 0%, #E39152 100%)')}
                onMouseLeave={(e) => !loading && (e.currentTarget.style.background = 'linear-gradient(135deg, #FFE66D 0%, #F4A261 100%)')}
              >
                {loading ? 'Creating...' : (
                  <>
                    <Image src="/fireworks.png" alt="Create" width={24} height={24} className="object-contain" />
                    Create Room
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
