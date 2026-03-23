'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface PageProps {
  params: Promise<{ pin: string }>;
}

interface Award {
  _id: string;
  title: string;
  description: string;
  nominees: string[];
  order: number;
}

export default function BETAwardsSettings({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [awards, setAwards] = useState<Award[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddAward, setShowAddAward] = useState(false);
  const [newAwardTitle, setNewAwardTitle] = useState('');
  const [newAwardDescription, setNewAwardDescription] = useState('');

  useEffect(() => {
    fetchData();
  }, [resolvedParams.pin]);

  const fetchData = async () => {
    try {
      const sessionResponse = await fetch(`/api/sessions/by-code/${resolvedParams.pin}`);
      if (!sessionResponse.ok) {
        setError('Session not found. Please check your PIN and try again.');
        setLoading(false);
        return;
      }
      const sessionData = await sessionResponse.json();
      setSessionInfo(sessionData.session);

      const awardsResponse = await fetch(`/api/sessions/${sessionData.session.id}/awards`);
      if (awardsResponse.ok) {
        const awardsData = await awardsResponse.json();
        setAwards(awardsData.awards || []);
      }

      setLoading(false);
    } catch (err) {
      setError('Failed to load session data');
      setLoading(false);
    }
  };

  const addNominee = (awardId: string, nomineeName: string) => {
    if (!nomineeName.trim()) return;
    setAwards(awards.map(award => {
      if (award._id === awardId) {
        return { ...award, nominees: [...award.nominees, nomineeName.trim()] };
      }
      return award;
    }));
  };

  const removeNominee = (awardId: string, nomineeIndex: number) => {
    setAwards(awards.map(award => {
      if (award._id === awardId) {
        return { ...award, nominees: award.nominees.filter((_, i) => i !== nomineeIndex) };
      }
      return award;
    }));
  };

  const addCustomAward = async () => {
    if (!newAwardTitle.trim()) {
      setError('Award title is required');
      return;
    }

    try {
      const response = await fetch(`/api/sessions/${sessionInfo.id}/awards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newAwardTitle,
          description: newAwardDescription || `Vote for ${newAwardTitle}`,
          type: 'voting',
          timeLimit: 30,
          order: awards.length
        })
      });

      if (response.ok) {
        setSuccess('New award added successfully!');
        setNewAwardTitle('');
        setNewAwardDescription('');
        setShowAddAward(false);
        fetchData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to add award');
      }
    } catch (err) {
      setError('Failed to add award');
    }
  };

  const deleteAward = async (awardId: string) => {
    if (!confirm('Delete this award? This cannot be undone.')) return;

    try {
      const response = await fetch(`/api/sessions/${sessionInfo.id}/awards/${awardId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSuccess('Award removed successfully!');
        fetchData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to delete award');
      }
    } catch (err) {
      setError('Failed to delete award');
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      for (const award of awards) {
        await fetch(`/api/sessions/${sessionInfo.id}/awards/${award._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nominees: award.nominees })
        });
      }

      setSuccess('All changes saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const startVoting = async () => {
    try {
      const response = await fetch(`/api/sessions/${sessionInfo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' })
      });

      if (response.ok) {
        router.push(`/bet-awards/${resolvedParams.pin}`);
      }
    } catch (err) {
      setError('Failed to start voting');
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
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold text-lg">Loading session...</p>
        </div>
      </div>
    );
  }

  if (error && !sessionInfo) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          background: 'linear-gradient(135deg, #FFE5D9 0%, #D4F1F4 50%, #FFFACD 100%)',
          fontFamily: "'Quicksand', sans-serif"
        }}
      >
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border-4 border-red-300">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Session Not Found</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/bet-awards')}
              className="px-6 py-3 bg-gradient-to-r from-teal-400 to-cyan-400 text-white rounded-lg font-bold hover:from-teal-500 hover:to-cyan-500 transition-all shadow-lg"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: 'linear-gradient(135deg, #FFE5D9 0%, #D4F1F4 50%, #FFFACD 100%)',
        fontFamily: "'Quicksand', sans-serif"
      }}
    >
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b-4 border-teal-400 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Configure Awards</h1>
              <div className="flex items-center gap-3 text-sm flex-wrap">
                <span className="text-gray-700 font-semibold">{sessionInfo?.name}</span>
                <span className="text-teal-500">•</span>
                <span className="font-mono text-teal-600 font-bold">PIN: {resolvedParams.pin}</span>
                <span className="text-teal-500">•</span>
                <span className="text-gray-700">{awards.length} {awards.length === 1 ? 'Award' : 'Awards'}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/bet-awards')}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
              >
                Back
              </button>
              <button
                onClick={startVoting}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-bold hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
              >
                Start Voting
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-100 border-4 border-green-400 text-green-800 px-6 py-4 rounded-xl shadow-lg">
            <div className="flex items-center gap-3 font-bold">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {success}
            </div>
          </div>
        )}

        {error && sessionInfo && (
          <div className="mb-6 bg-red-100 border-4 border-red-400 text-red-800 px-6 py-4 rounded-xl shadow-lg">
            <div className="flex items-center gap-3 font-bold">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Add Award Section */}
        <div className="mb-8">
          {!showAddAward ? (
            <button
              onClick={() => setShowAddAward(true)}
              className="px-8 py-4 bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-xl font-bold text-lg shadow-lg hover:from-orange-500 hover:to-pink-500 transition-all transform hover:scale-105"
            >
              <span className="flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Award
              </span>
            </button>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl p-6 border-4 border-orange-300 animate-slideIn">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">New Award</h3>
                <button
                  onClick={() => setShowAddAward(false)}
                  className="text-gray-400 hover:text-gray-900 transition-colors text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Award Title
                  </label>
                  <input
                    type="text"
                    value={newAwardTitle}
                    onChange={(e) => setNewAwardTitle(e.target.value)}
                    placeholder="e.g., Best Dressed, Most Creative, Class Clown..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all text-black font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newAwardDescription}
                    onChange={(e) => setNewAwardDescription(e.target.value)}
                    placeholder="e.g., Who always looks runway ready?"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all text-black"
                  />
                </div>

                <button
                  onClick={addCustomAward}
                  disabled={!newAwardTitle.trim()}
                  className="w-full py-3 bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:from-orange-500 hover:to-pink-500 transition-all shadow-lg"
                >
                  Create Award
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Awards Grid */}
        {awards.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border-4 border-gray-200 text-center shadow-lg">
            <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Awards Yet</h3>
            <p className="text-gray-600">Create your first award to get started</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {awards.map((award, index) => (
              <AwardCard
                key={award._id}
                award={award}
                index={index}
                onAddNominee={(name) => addNominee(award._id, name)}
                onRemoveNominee={(idx) => removeNominee(award._id, idx)}
                onDelete={() => deleteAward(award._id)}
              />
            ))}
          </div>
        )}

        {/* Save Button */}
        {awards.length > 0 && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={saveSettings}
              disabled={saving}
              className="px-12 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-teal-600 hover:to-cyan-600 transition-all shadow-xl transform hover:scale-105"
            >
              {saving ? 'Saving Changes...' : 'Save All Changes'}
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

interface AwardCardProps {
  award: Award;
  index: number;
  onAddNominee: (name: string) => void;
  onRemoveNominee: (index: number) => void;
  onDelete: () => void;
}

function AwardCard({ award, index, onAddNominee, onRemoveNominee, onDelete }: AwardCardProps) {
  const [newNominee, setNewNominee] = useState('');

  const handleAdd = () => {
    onAddNominee(newNominee);
    setNewNominee('');
  };

  const gradients = [
    'from-purple-100 to-pink-100 border-purple-400',
    'from-blue-100 to-cyan-100 border-blue-400',
    'from-green-100 to-emerald-100 border-green-400',
    'from-orange-100 to-red-100 border-orange-400',
    'from-yellow-100 to-amber-100 border-yellow-400',
  ];

  const gradient = gradients[index % gradients.length];

  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 border-4 transition-all hover:shadow-xl`}>
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
              <span className="text-gray-900 font-black text-lg">#{index + 1}</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{award.title}</h2>
          </div>
          <p className="text-gray-700 ml-13 font-medium">{award.description}</p>
        </div>
        <button
          onClick={onDelete}
          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-bold hover:bg-red-200 transition-all border-2 border-red-300"
        >
          Delete
        </button>
      </div>

      {/* Nominees List */}
      <div className="mb-4">
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Nominees ({award.nominees.length})
        </h3>
        {award.nominees.length === 0 ? (
          <p className="text-gray-500 italic text-sm bg-white/50 rounded-lg p-4 text-center border-2 border-dashed border-gray-300">
            No nominees yet. Add participants below.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {award.nominees.map((nominee, idx) => (
              <div
                key={idx}
                className="group inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:border-teal-400 transition-all shadow-sm"
              >
                <span className="text-gray-900 font-semibold">{nominee}</span>
                <button
                  onClick={() => onRemoveNominee(idx)}
                  className="text-gray-400 hover:text-red-500 transition-colors font-bold"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Nominee Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newNominee}
          onChange={(e) => setNewNominee(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Enter participant name..."
          className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all text-black font-medium"
        />
        <button
          onClick={handleAdd}
          disabled={!newNominee.trim()}
          className="px-6 py-3 bg-teal-500 text-white rounded-lg font-bold hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
        >
          Add
        </button>
      </div>
    </div>
  );
}
