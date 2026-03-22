'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import confetti from 'canvas-confetti';

interface GameTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  questionCount: number;
  estimatedTime: string;
}

const GAME_TEMPLATES: GameTemplate[] = [
  // Question-Based
  { id: 'bet-awards', name: 'BET Awards', description: 'Vote for superlatives among participants', category: 'question-based', icon: '/trophy.png', questionCount: 8, estimatedTime: '10-15 min' },
  { id: 'most-likely-to', name: 'Most Likely To', description: 'Who would most likely...?', category: 'question-based', icon: '/ice-cubes.png', questionCount: 10, estimatedTime: '10 min' },
  { id: 'would-you-rather', name: 'Would You Rather', description: 'Tough choices and fun debates', category: 'question-based', icon: '/ice-breaker.png', questionCount: 10, estimatedTime: '8 min' },
  { id: 'hot-takes', name: 'Hot Takes', description: 'Bold opinions and spicy debates', category: 'question-based', icon: '/declaration.gif', questionCount: 8, estimatedTime: '10 min' },
  { id: 'this-or-that', name: 'This or That', description: 'Quick preference choices', category: 'question-based', icon: '/idea.gif', questionCount: 12, estimatedTime: '8 min' },
  { id: 'pop-culture-trivia', name: 'Pop Culture Trivia', description: 'Test your entertainment knowledge', category: 'question-based', icon: '/quiz.gif', questionCount: 15, estimatedTime: '12 min' },
  { id: 'speed-trivia', name: 'Speed Trivia', description: 'Fast-paced quick questions', category: 'question-based', icon: '/competition.gif', questionCount: 20, estimatedTime: '10 min' },

  // Reaction Games
  { id: 'color-match', name: 'Color Match', description: 'Tap the correct color as fast as you can', category: 'reaction', icon: '/dice.png', questionCount: 5, estimatedTime: '5-8 min' },
  { id: 'tap-battle', name: 'Tap Battle', description: 'Who can tap the fastest?', category: 'reaction', icon: '/fireworks.png', questionCount: 5, estimatedTime: '5-10 min' },
  { id: 'quick-math', name: 'Quick Math', description: 'Lightning-fast mental math challenges', category: 'reaction', icon: '/game-over.png', questionCount: 5, estimatedTime: '8-12 min' },
  { id: 'word-race', name: 'Word Race', description: 'Type words as fast as possible', category: 'reaction', icon: '/idea.png', questionCount: 5, estimatedTime: '6-10 min' },
  { id: 'memory-flash', name: 'Memory Flash', description: 'Remember sequences and patterns', category: 'reaction', icon: '/trophy.png', questionCount: 5, estimatedTime: '10-15 min' },
  { id: 'reflex-test', name: 'Reflex Test', description: 'Pure reaction speed test', category: 'reaction', icon: '/crossed-swords.gif', questionCount: 5, estimatedTime: '5-8 min' },

  // Awards
  { id: 'superlatives', name: 'Superlatives', description: 'Classic yearbook-style awards', category: 'awards', icon: '/winner.png', questionCount: 10, estimatedTime: '10-15 min' },
  { id: 'office-awards', name: 'Office Awards', description: 'Fun workplace recognition', category: 'awards', icon: '/office.png', questionCount: 8, estimatedTime: '10 min' },
  { id: 'team-builder-awards', name: 'Team Builder', description: 'Team recognition awards', category: 'awards', icon: '/mental-health.png', questionCount: 6, estimatedTime: '8 min' },

  // Party
  { id: 'two-truths-one-lie', name: 'Two Truths & A Lie', description: 'Guess which statement is false', category: 'party', icon: '/playing-cards.gif', questionCount: 8, estimatedTime: '15 min' },
  { id: 'never-have-i-ever', name: 'Never Have I Ever', description: 'Share fun experiences', category: 'party', icon: '/festival.gif', questionCount: 10, estimatedTime: '12 min' },
  { id: 'ranking-game', name: 'Ranking Challenge', description: 'Rank items in order', category: 'party', icon: '/podium.gif', questionCount: 6, estimatedTime: '10 min' },
  { id: 'caption-contest', name: 'Caption Contest', description: 'Write funny captions', category: 'party', icon: '/idea.png', questionCount: 5, estimatedTime: '15 min' },

  // Team Building
  { id: 'team-challenges', name: 'Team Challenges', description: 'Collaborative problem solving', category: 'team-building', icon: '/mental-health.png', questionCount: 8, estimatedTime: '20 min' },
  { id: 'workplace-fun', name: 'Workplace Fun', description: 'Office-themed challenges', category: 'team-building', icon: '/office.png', questionCount: 10, estimatedTime: '15 min' },

  // Creative
  { id: 'photo-challenges', name: 'Photo Challenges', description: 'Snap creative photos', category: 'creative', icon: '/idea.png', questionCount: 6, estimatedTime: '20 min' },
  { id: 'story-time', name: 'Story Time', description: 'Collaborative storytelling', category: 'creative', icon: '/magic-wand.png', questionCount: 5, estimatedTime: '15 min' }
];

const CATEGORY_INFO = {
  'question-based': { name: 'Question-Based', color: 'from-yellow-100 to-orange-100', border: 'border-yellow-300' },
  reaction: { name: 'Reaction Games', color: 'from-red-100 to-orange-100', border: 'border-red-300' },
  awards: { name: 'Awards', color: 'from-yellow-100 to-orange-100', border: 'border-yellow-300' },
  icebreaker: { name: 'Icebreakers', color: 'from-blue-100 to-cyan-100', border: 'border-blue-300' },
  party: { name: 'Party Games', color: 'from-pink-100 to-purple-100', border: 'border-pink-300' },
  trivia: { name: 'Trivia', color: 'from-green-100 to-teal-100', border: 'border-green-300' },
  'team-building': { name: 'Team Building', color: 'from-indigo-100 to-purple-100', border: 'border-indigo-300' },
  creative: { name: 'Creative', color: 'from-rose-100 to-orange-100', border: 'border-rose-300' }
};

export default function SelectGamePage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.roomId as string;

  const [loading, setLoading] = useState(false);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const participantData = localStorage.getItem('participant');
    if (!participantData) {
      router.push('/landing');
      return;
    }
    const user = JSON.parse(participantData);
    setCurrentUser(user);

    // Only host can access this page
    if (!user.isHost) {
      router.push(`/room/${roomId}/lobby`);
    }
  }, [roomId, router]);

  const handleSelectGame = async (gameId: string) => {
    setSelectedGame(gameId);
    setLoading(true);

    try {
      const game = GAME_TEMPLATES.find(g => g.id === gameId);
      if (!game) return;

      const response = await fetch(`/api/rooms/${roomId}/new-game`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameType: gameId,
          category: game.category
        })
      });

      if (response.ok) {
        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.6 }
        });

        setTimeout(() => {
          router.push(`/room/${roomId}/lobby`);
        }, 1000);
      } else {
        alert('Failed to start new game. Please try again.');
        setLoading(false);
        setSelectedGame(null);
      }
    } catch (error) {
      console.error('Error starting game:', error);
      alert('Connection error. Please try again.');
      setLoading(false);
      setSelectedGame(null);
    }
  };

  const filteredGames = selectedCategory === 'all'
    ? GAME_TEMPLATES
    : GAME_TEMPLATES.filter(g => g.category === selectedCategory);

  const categories = Object.keys(CATEGORY_INFO);

  if (!currentUser) {
    return null;
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
        <div className="mb-8">
          <button
            onClick={() => router.push(`/room/${roomId}/lobby`)}
            className="text-gray-600 hover:text-gray-900 mb-4 inline-flex items-center gap-2 font-semibold"
          >
            ← Back to Lobby
          </button>

          <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
            <div className="flex items-center gap-4 mb-4">
              <Image src="/gaming.gif" alt="Games" width={60} height={60} className="object-contain" unoptimized />
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                  Select Next Game
                </h1>
                <p className="text-gray-600">Choose a game to play with your participants</p>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              selectedCategory === 'all'
                ? 'bg-teal-400 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            All Games
          </button>
          {categories.map(cat => {
            const info = CATEGORY_INFO[cat as keyof typeof CATEGORY_INFO];
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-teal-400 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {info.name}
              </button>
            );
          })}
        </div>

        {/* Game Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map(game => {
            const categoryInfo = CATEGORY_INFO[game.category as keyof typeof CATEGORY_INFO];
            const isSelected = selectedGame === game.id;

            return (
              <button
                key={game.id}
                onClick={() => handleSelectGame(game.id)}
                disabled={loading}
                className={`bg-gradient-to-br ${categoryInfo.color} rounded-2xl shadow-lg p-6 border-2 ${categoryInfo.border} text-left transition-all hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isSelected ? 'ring-4 ring-teal-400' : ''
                }`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <Image
                    src={game.icon}
                    alt={game.name}
                    width={56}
                    height={56}
                    className="object-contain"
                    unoptimized={game.icon.endsWith('.gif')}
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-xl mb-1">{game.name}</h3>
                    <span className="text-xs font-semibold px-2 py-1 bg-white/70 rounded-full">
                      {categoryInfo.name}
                    </span>
                  </div>
                </div>

                <p className="text-gray-700 text-sm mb-4">{game.description}</p>

                <div className="flex items-center justify-between text-xs text-gray-600 font-semibold">
                  <span>📝 {game.questionCount} questions</span>
                  <span>⏱️ {game.estimatedTime}</span>
                </div>

                {isSelected && loading && (
                  <div className="mt-4 text-center">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
                    <p className="text-sm text-gray-700 mt-2 font-semibold">Starting game...</p>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {filteredGames.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <Image src="/game-over.png" alt="No games" width={80} height={80} className="mx-auto mb-4" />
            <p className="text-gray-700 font-bold text-lg">No games in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}
