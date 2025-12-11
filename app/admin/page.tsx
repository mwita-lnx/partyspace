'use client';

import { useState, useEffect } from 'react';
import { FaUserPlus, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';

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

  // Add participant form
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [adding, setAdding] = useState(false);

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

  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);

    try {
      const response = await fetch('/api/admin/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, code: newCode })
      });

      const data = await response.json();

      if (response.ok) {
        setNewName('');
        setNewCode('');
        fetchData();
        alert('Participant added successfully!');
      } else {
        alert(data.error || 'Error adding participant');
      }
    } catch (error) {
      console.error('Error adding participant:', error);
      alert('Error adding participant');
    } finally {
      setAdding(false);
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-2">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">Manage participants and view voting results</p>
            </div>
            <a
              href="/results"
              className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              🎭 Results Reveal Page
            </a>
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
                {/* Add Participant Form */}
                <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-6 mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FaUserPlus /> Add New Participant
                  </h2>
                  <form onSubmit={handleAddParticipant} className="flex gap-4">
                    <input
                      type="text"
                      placeholder="Name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="flex-1 px-4 py-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Access Code"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                      className="flex-1 px-4 py-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none uppercase"
                      required
                    />
                    <button
                      type="submit"
                      disabled={adding}
                      className="px-8 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-all"
                    >
                      {adding ? 'Adding...' : 'Add'}
                    </button>
                  </form>
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
                            <button
                              onClick={() => handleDeleteParticipant(participant._id)}
                              className="text-red-600 hover:text-red-800 font-semibold flex items-center gap-2"
                            >
                              <FaTrash /> Delete
                            </button>
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
    </div>
  );
}
