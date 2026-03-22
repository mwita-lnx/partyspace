'use client';

import { useState, useEffect } from 'react';
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

export default function AdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get('roomId');

  const [room, setRoom] = useState<Room | null>(null);
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state for adding/editing
  const [showModal, setShowModal] = useState(false);
  const [editingAward, setEditingAward] = useState<Award | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formTimeLimit, setFormTimeLimit] = useState(10);
  const [formGameType, setFormGameType] = useState('tap-battle');

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

  const handleAddNew = () => {
    setEditingAward(null);
    setFormTitle('');
    setFormDescription('');
    setFormTimeLimit(10);
    setFormGameType('tap-battle');
    setShowModal(true);
  };

  const handleEdit = (award: Award) => {
    setEditingAward(award);
    setFormTitle(award.title);
    setFormDescription(award.description);
    setFormTimeLimit(award.timeLimit || 10);
    setFormGameType(award.type || 'tap-battle');
    setShowModal(true);
  };

  const handleDelete = async (awardId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const response = await fetch(`/api/rooms/${roomId}/awards/${awardId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchRoomData();
      } else {
        alert('Failed to delete item');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete item');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      title: formTitle,
      description: formDescription,
      timeLimit: formTimeLimit,
      type: room?.category === 'reaction' ? formGameType : 'voting'
    };

    try {
      if (editingAward) {
        // Update existing
        const response = await fetch(`/api/rooms/${roomId}/awards/${editingAward._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          fetchRoomData();
          setShowModal(false);
        } else {
          alert('Failed to update item');
        }
      } else {
        // Create new
        const response = await fetch(`/api/rooms/${roomId}/awards`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...data,
            roomId,
            order: awards.length
          })
        });

        if (response.ok) {
          fetchRoomData();
          setShowModal(false);
        } else {
          alert('Failed to create item');
        }
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to save item');
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
                    Manage {itemsLabel}
                  </h1>
                  <p className="text-gray-600">{room.name} - PIN: {room.code}</p>
                </div>
              </div>

              <button
                onClick={handleAddNew}
                className="px-6 py-3 bg-gradient-to-r from-teal-400 to-cyan-400 text-white rounded-lg font-bold hover:from-teal-500 hover:to-cyan-500 transition-all shadow-lg flex items-center gap-2"
              >
                <Image src="/idea.png" alt="Add" width={20} height={20} />
                Add {itemLabel}
              </button>
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

        {/* Items List */}
        {awards.length > 0 ? (
          <div className="space-y-4">
            {awards.sort((a, b) => a.order - b.order).map((award, index) => (
              <div
                key={award._id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white font-black text-xl">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{award.title}</h3>
                      <p className="text-gray-600 mb-3">{award.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        {award.timeLimit && (
                          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full font-semibold">
                            {award.timeLimit}s time limit
                          </span>
                        )}
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-semibold">
                          {award.type || 'voting'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleEdit(award)}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(award._id)}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <Image
              src="/idea.gif"
              alt="No items"
              width={100}
              height={100}
              className="mx-auto mb-6"
              unoptimized
            />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No {itemsLabel} Yet</h2>
            <p className="text-gray-600 mb-6">
              Add your first {itemLabel.toLowerCase()} to get started!
            </p>
            <button
              onClick={handleAddNew}
              className="px-6 py-3 bg-teal-400 text-white rounded-lg font-semibold hover:bg-teal-500 transition-colors"
            >
              Add {itemLabel}
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-scale-in">
            <div className="flex items-center gap-3 mb-6">
              <Image src="/magic-wand.png" alt="Form" width={40} height={40} />
              <h2 className="text-3xl font-bold text-gray-900">
                {editingAward ? `Edit ${itemLabel}` : `Add New ${itemLabel}`}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none text-gray-900"
                  placeholder="Enter title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none text-gray-900 resize-none"
                  placeholder="Enter description"
                  rows={3}
                  required
                />
              </div>

              {isReactionGame && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Game Type
                    </label>
                    <select
                      value={formGameType}
                      onChange={(e) => setFormGameType(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none text-gray-900"
                      required
                    >
                      <option value="color-match">Color Match - Match colors quickly</option>
                      <option value="tap-battle">Tap Battle - Tap as fast as you can</option>
                      <option value="quick-math">Quick Math - Solve math problems</option>
                      <option value="word-race">Word Race - Type words fast</option>
                      <option value="memory-flash">Memory Flash - Remember sequences</option>
                      <option value="reflex-test">Reflex Test - Test your reaction time</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Time Limit (seconds)
                    </label>
                    <input
                      type="number"
                      value={formTimeLimit}
                      onChange={(e) => setFormTimeLimit(parseInt(e.target.value))}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none text-gray-900"
                      min="3"
                      max="60"
                      required
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-400 to-cyan-400 text-white font-bold rounded-lg hover:from-teal-500 hover:to-cyan-500 transition-all"
                >
                  {editingAward ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
