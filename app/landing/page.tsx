'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import Image from 'next/image';

export default function LandingPage() {
  const router = useRouter();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    { image: '/podium.gif', title: 'Awards & Superlatives', desc: 'Vote for the best dressed, class clown, and more', isGif: true },
    { image: '/festival.gif', title: 'Party Games', desc: 'Two truths & a lie, never have I ever, and beyond', isGif: true },
    { image: '/quiz.gif', title: 'Trivia Nights', desc: 'Test your knowledge with friends', isGif: true },
    { image: '/declaration.gif', title: 'Icebreakers', desc: 'Break the ice with fun questions', isGif: true }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateRoom = () => {
    router.push('/create-room');
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode: roomCode.toUpperCase(),
          participantName
        })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('participant', JSON.stringify(data.participant));
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
          gameType: data.room.gameType || 'custom',
          role: 'participant' as const,
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

        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        setTimeout(() => {
          router.push(`/room/${data.room.id}/lobby`);
        }, 500);
      } else {
        setError(data.error || 'Failed to join room');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen p-4 overflow-x-hidden"
      style={{
        background: 'linear-gradient(135deg, #FFE5D9 0%, #D4F1F4 50%, #FFFACD 100%)',
        fontFamily: "'Quicksand', sans-serif"
      }}
    >
      {/* Header with Profile Button */}
      <div className="max-w-6xl mx-auto pt-8 mb-4 flex justify-end">
        <button
          onClick={() => router.push('/profile')}
          className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-lg font-semibold text-gray-700 hover:bg-white transition-all shadow-md"
        >
          <Image src="/receptionist.png" alt="Profile" width={24} height={24} />
          My Rooms
        </button>
      </div>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto pb-20">
        <div className="text-center mb-16">
          <h1
            className="text-8xl font-bold mb-6 animate-float"
            style={{
              fontFamily: "'Flavors', cursive",
              background: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 50%, #FFE66D 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Party Space
          </h1>

          <p className="text-2xl text-gray-700 mb-8 font-medium">
            Where every gathering becomes unforgettable
          </p>

          {/* Feature Carousel */}
          <div className="mb-12 h-24 flex items-center justify-center">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`absolute transition-all duration-500 ${
                  activeFeature === index
                    ? 'opacity-100 scale-100'
                    : 'opacity-0 scale-95 pointer-events-none'
                }`}
              >
                <div className="flex items-center gap-4 bg-white/80 backdrop-blur-sm px-8 py-4 rounded-full shadow-lg">
                  <Image src={feature.image} alt={feature.title} width={48} height={48} className="object-contain" />
                  <div className="text-left">
                    <h3 className="font-bold text-gray-900 text-lg">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 mb-12">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">15+</div>
              <div className="text-sm text-gray-600">Game Templates</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">5</div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">∞</div>
              <div className="text-sm text-gray-600">Fun Moments</div>
            </div>
          </div>
        </div>

        {/* Main Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20">
          <button
            onClick={() => setShowJoinModal(true)}
            className="p-12 bg-white rounded-3xl hover:shadow-2xl transition-all duration-300 text-center group relative overflow-hidden"
            style={{ border: '3px solid transparent' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#4ECDC4';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-100 to-cyan-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="mb-4 group-hover:scale-110 transition-transform duration-300 flex justify-center">
                <Image src="/receptionist.png" alt="Join Room" width={96} height={96} className="object-contain" />
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-3 group-hover:text-teal-600 transition-colors">
                Join
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                Enter with a room code
              </p>
              <div className="flex flex-col gap-2 text-sm text-gray-500">
                <span>✓ Instant access</span>
                <span>✓ No downloads required</span>
                <span>✓ Works on any device</span>
              </div>
            </div>
          </button>

          <button
            onClick={handleCreateRoom}
            className="p-12 bg-white rounded-3xl hover:shadow-2xl transition-all duration-300 text-center group relative overflow-hidden"
            style={{ border: '3px solid transparent' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#FF6B6B';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-red-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="mb-4 group-hover:scale-110 transition-transform duration-300 flex justify-center">
                <Image src="/fireworks.png" alt="Create Room" width={96} height={96} className="object-contain" />
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                Create
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                Host your own game room
              </p>
              <div className="flex flex-col gap-2 text-sm text-gray-500">
                <span>✓ Choose from 15+ game templates</span>
                <span>✓ Invite up to 500 players</span>
                <span>✓ Customize everything</span>
              </div>
            </div>
          </button>
        </div>

        {/* How It Works */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-200 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                <span className="font-bold text-gray-900">1</span>
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Create or Join</h3>
              <p className="text-gray-600 text-sm">
                Host creates a room and shares the code, or join with a code from your host
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-200 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                <span className="font-bold text-gray-900">2</span>
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Play Together</h3>
              <p className="text-gray-600 text-sm">
                Vote, answer questions, or compete in real-time with everyone in the room
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-200 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                <span className="font-bold text-gray-900">3</span>
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">See Results</h3>
              <p className="text-gray-600 text-sm">
                Reveal winners, share laughs, and create memories that last
              </p>
            </div>
          </div>
        </div>

        {/* Game Categories Preview */}
        <div className="max-w-5xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Game Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { image: '/winner.png', name: 'Awards', color: '#FFE66D' },
              { image: '/ice-cubes.png', name: 'Icebreakers', color: '#4ECDC4' },
              { image: '/dice.png', name: 'Party Games', color: '#FF6B6B' },
              { image: '/mental-health.png', name: 'Trivia', color: '#A8E6CF' },
              { image: '/magic-wand.png', name: 'Custom', color: '#DDA5FF' }
            ].map((category, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl text-center hover:shadow-lg transition-all duration-300 cursor-pointer group"
                style={{ borderTop: `4px solid ${category.color}` }}
              >
                <div className="mb-2 group-hover:scale-125 transition-transform duration-300 flex justify-center">
                  <Image src={category.image} alt={category.name} width={64} height={64} className="object-contain" />
                </div>
                <div className="font-bold text-gray-900 text-sm">{category.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Use Cases Section */}
        <div className="max-w-5xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Perfect For Any Occasion
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { image: '/trophy.png', title: 'School Events', desc: 'Yearbook superlatives, class awards, senior celebrations' },
              { image: '/office.png', title: 'Team Building', desc: 'Office parties, virtual hangouts, team bonding activities' },
              { image: '/fireworks.png', title: 'Celebrations', desc: 'Birthday parties, family reunions, holiday gatherings' },
              { image: '/dice.png', title: 'Social Events', desc: 'Friend groups, meetups, icebreaker sessions' }
            ].map((useCase, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <Image src={useCase.image} alt={useCase.title} width={64} height={64} className="object-contain" />
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{useCase.title}</h3>
                    <p className="text-gray-600 text-sm">{useCase.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-5xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Party Space?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { image: '/fireworks.png', title: 'Lightning Fast', desc: 'Create rooms in seconds. No signup required.' },
              { image: '/receptionist.png', title: 'Works Everywhere', desc: 'Any device, any browser. Mobile-friendly.' },
              { image: '/magic-wand.png', title: 'Fully Customizable', desc: 'Make it your own with custom questions and settings.' },
              { image: '/trophy.png', title: 'Unlimited Players', desc: 'From 3 to 500 players. Scale as needed.' },
              { image: '/game-over.png', title: 'Private & Secure', desc: 'Room codes keep your games private.' },
              { image: '/dice.png', title: 'Zero Setup', desc: 'No downloads, no apps. Just click and play.' }
            ].map((feature, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-center mb-3">
                  <Image src={feature.image} alt={feature.title} width={64} height={64} className="object-contain" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-3xl mx-auto text-center bg-white p-12 rounded-3xl shadow-lg">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Create your first game room in less than 30 seconds
          </p>
          <button
            onClick={handleCreateRoom}
            className="px-8 py-4 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Create Your Room Now →
          </button>
        </div>
      </div>

      {/* Join Room Modal */}
      {showJoinModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
          onClick={() => !loading && setShowJoinModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              Join a Room
            </h2>

            <form onSubmit={handleJoinRoom} className="space-y-4">
              <div>
                <label htmlFor="participantName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="participantName"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all text-black"
                  placeholder="Enter your name"
                  required
                  autoComplete="off"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This is how others will see you in the room
                </p>
              </div>

              <div>
                <label htmlFor="roomCode" className="block text-sm font-semibold text-gray-700 mb-2">
                  Room Code
                </label>
                <input
                  type="text"
                  id="roomCode"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 text-xl font-bold text-center uppercase border-2 border-gray-200 rounded-lg focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all text-black"
                  placeholder="ABCD1234"
                  maxLength={20}
                  required
                  autoComplete="off"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Get this code from the host who created the room
                </p>
              </div>

              {error && (
                <div
                  className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded-lg text-center font-semibold"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !roomCode || !participantName}
                  className="flex-1 px-4 py-3 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  style={{ background: loading || !roomCode || !participantName ? '#9CA3AF' : 'linear-gradient(135deg, #4ECDC4 0%, #45B7D1 100%)' }}
                >
                  {loading ? 'Joining...' : 'Join Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes scale-in {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
