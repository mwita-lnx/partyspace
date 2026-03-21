'use client';

import { useState, useEffect } from 'react';
import { FaUserPlus, FaTrash, FaCheck, FaTimes, FaEdit } from 'react-icons/fa';

interface Participant {
  _id: string;
  name: string;
  code: string;
  hasVoted: boolean;
  votedAt?: string;
}

interface Vote {
  _id: string;
  participantId: {
    _id: string;
    name: string;
  };
  awardId: {
    _id: string;
    title: string;
    emoji: string;
  };
  nominee: string;
  createdAt: string;
}

interface Result {
  award: {
    id: string;
    title: string;
    emoji: string;
  };
  totalVotes: number;
  voteCounts: Record<string, number>;
  winner: string | null;
}

export default function AdminPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'participants' | 'votes' | 'results'>('participants');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [participantsRes, votesRes, resultsRes] = await Promise.all([
        fetch('/api/admin/participants'),
        fetch('/api/admin/votes'),
        fetch('/api/results')
      ]);

      const participantsData = await participantsRes.json();
      const votesData = await votesRes.json();
      const resultsData = await resultsRes.json();

      setParticipants(participantsData.participants || []);
      setVotes(votesData.votes || []);
      setResults(resultsData.results || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setFormName('');
    setFormCode('');
    setEditingId(null);
    setShowModal(true);
  };

  const openEditModal = (participant: Participant) => {
    setModalMode('edit');
    setFormName(participant.name);
    setFormCode(participant.code);
    setEditingId(participant._id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormName('');
    setFormCode('');
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (modalMode === 'add') {
        const response = await fetch('/api/admin/participants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formName, code: formCode })
        });

        const data = await response.json();

        if (response.ok) {
          fetchData();
          closeModal();
          alert('Participant added successfully!');
        } else {
          alert(data.error || 'Error adding participant');
        }
      } else {
        const response = await fetch('/api/admin/participants', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, name: formName, code: formCode })
        });

        const data = await response.json();

        if (response.ok) {
          fetchData();
          closeModal();
          alert('Participant updated successfully!');
        } else {
          alert(data.error || 'Error updating participant');
        }
      }
    } catch (error) {
      console.error('Error submitting:', error);
      alert('Error submitting form');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteParticipant = async (id: string) => {
    if (!confirm('Are you sure you want to delete this participant?')) return;

    try {
      await fetch('/api/admin/participants', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      fetchData();
    } catch (error) {
      console.error('Error deleting participant:', error);
      alert('Error deleting participant');
    }
  };

  const handleResetVoting = async () => {
    if (!confirm('⚠️ WARNING: This will delete ALL votes and reset all participants voting status. This action cannot be undone!\n\nAre you absolutely sure you want to continue?')) {
      return;
    }

    // Double confirmation
    if (!confirm('This is your final confirmation. All voting data will be permanently deleted. Continue?')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/reset-voting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Voting reset successfully!\n\n${data.deletedVotes} votes deleted\n${data.participantsReset} participants reset`);
        fetchData();
      } else {
        alert(data.error || 'Error resetting voting');
      }
    } catch (error) {
      console.error('Error resetting voting:', error);
      alert('Error resetting voting');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-white text-3xl font-bold animate-pulse">Loading admin panel...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-2">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">Manage participants and view voting results</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleResetVoting}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                🔄 Reset Voting
              </button>
              <a
                href="/results"
                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                🎭 Results Reveal Page
              </a>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('participants')}
              className={`flex-1 px-6 py-4 font-bold text-lg transition-all ${
                activeTab === 'participants'
                  ? 'bg-purple-600 text-white rounded-tl-2xl'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Participants ({participants.length})
            </button>
            <button
              onClick={() => setActiveTab('votes')}
              className={`flex-1 px-6 py-4 font-bold text-lg transition-all ${
                activeTab === 'votes'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All Votes ({votes.length})
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`flex-1 px-6 py-4 font-bold text-lg transition-all ${
                activeTab === 'results'
                  ? 'bg-purple-600 text-white rounded-tr-2xl'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Results
            </button>
          </div>

          <div className="p-6">
            {/* Participants Tab */}
            {activeTab === 'participants' && (
              <div>
                {/* Add Participant Button */}
                <div className="mb-6 flex justify-end">
                  <button
                    onClick={openAddModal}
                    className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-all shadow-lg flex items-center gap-2"
                  >
                    <FaUserPlus /> Add New Participant
                  </button>
                </div>

                {/* Participants List */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100 text-left">
                        <th className="px-4 py-3 font-bold text-gray-700">Name</th>
                        <th className="px-4 py-3 font-bold text-gray-700">Code</th>
                        <th className="px-4 py-3 font-bold text-gray-700">Status</th>
                        <th className="px-4 py-3 font-bold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {participants.map((participant) => (
                        <tr key={participant._id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3">{participant.name}</td>
                          <td className="px-4 py-3 font-mono font-bold text-purple-600">
                            {participant.code}
                          </td>
                          <td className="px-4 py-3">
                            {participant.hasVoted ? (
                              <span className="flex items-center gap-2 text-green-600 font-semibold">
                                <FaCheck /> Voted
                              </span>
                            ) : (
                              <span className="flex items-center gap-2 text-gray-400">
                                <FaTimes /> Not voted
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => openEditModal(participant)}
                                className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2"
                              >
                                <FaEdit /> Edit
                              </button>
                              <button
                                onClick={() => handleDeleteParticipant(participant._id)}
                                className="text-red-600 hover:text-red-800 font-semibold flex items-center gap-2"
                              >
                                <FaTrash /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Votes Tab */}
            {activeTab === 'votes' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="px-4 py-3 font-bold text-gray-700">Participant</th>
                      <th className="px-4 py-3 font-bold text-gray-700">Award</th>
                      <th className="px-4 py-3 font-bold text-gray-700">Voted For</th>
                      <th className="px-4 py-3 font-bold text-gray-700">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {votes.map((vote) => (
                      <tr key={vote._id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-semibold">
                          {vote.participantId?.name || 'Unknown'}
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-2">
                            <span className="text-2xl">{vote.awardId?.emoji}</span>
                            {vote.awardId?.title || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-purple-600">
                          {vote.nominee}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(vote.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Results Tab */}
            {activeTab === 'results' && (
              <div className="space-y-6">
                {results.map((result) => (
                  <div
                    key={result.award.id}
                    className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-6"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-5xl">{result.award.emoji}</span>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800">
                          {result.award.title}
                        </h3>
                        <p className="text-gray-600">{result.totalVotes} total votes</p>
                      </div>
                    </div>

                    {result.winner && (
                      <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-3xl">🏆</span>
                          <div>
                            <div className="text-sm font-semibold text-yellow-800">WINNER</div>
                            <div className="text-xl font-bold text-gray-800">{result.winner}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      {Object.entries(result.voteCounts)
                        .sort(([, a], [, b]) => b - a)
                        .map(([nominee, count]) => {
                          const percentage = (count / result.totalVotes) * 100;
                          return (
                            <div key={nominee} className="bg-white rounded-lg p-3">
                              <div className="flex justify-between mb-2">
                                <span className="font-semibold">{nominee}</span>
                                <span className="font-bold text-purple-600">
                                  {count} votes ({percentage.toFixed(1)}%)
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full transition-all"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              {modalMode === 'add' ? 'Add New Participant' : 'Edit Participant'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none text-black"
                  placeholder="Enter name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Access Code
                </label>
                <input
                  type="text"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none uppercase text-black"
                  placeholder="Enter access code"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-all"
                >
                  {submitting ? 'Saving...' : modalMode === 'add' ? 'Add' : 'Update'}
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
