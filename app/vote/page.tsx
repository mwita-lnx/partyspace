'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';

interface Award {
  _id: string;
  title: string;
  description: string;
  emoji: string;
  nominees: string[];
}

interface Participant {
  id: string;
  name: string;
  hasVoted: boolean;
}

export default function VotePage() {
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [awards, setAwards] = useState<Award[]>([]);
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentAwardIndex, setCurrentAwardIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const participantData = localStorage.getItem('participant');
    if (!participantData) {
      router.push('/');
      return;
    }

    const parsedParticipant = JSON.parse(participantData);

    // Check if user has already voted - redirect to results
    if (parsedParticipant.hasVoted) {
      router.push('/results');
      return;
    }

    setParticipant(parsedParticipant);

    // Fetch awards
    fetch('/api/awards')
      .then(res => res.json())
      .then(data => {
        setAwards(data.awards);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching awards:', err);
        setLoading(false);
      });
  }, [router]);

  const handleVote = (awardId: string, nominee: string) => {
    setVotes(prev => ({ ...prev, [awardId]: nominee }));

    // Trigger mini confetti
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  const handleNext = () => {
    // Check if current award has been voted on
    const currentAward = awards[currentAwardIndex];
    if (!votes[currentAward._id]) {
      alert('Please vote for this award before moving to the next one!');
      return;
    }

    if (currentAwardIndex < awards.length - 1) {
      setCurrentAwardIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentAwardIndex > 0) {
      setCurrentAwardIndex(prev => prev - 1);
    }
  };

  const handleSubmitAll = async () => {
    if (!participant) return;

    const votedAwards = Object.keys(votes);
    if (votedAwards.length === 0) {
      alert('Please vote for at least one award!');
      return;
    }

    setSubmitting(true);

    try {
      // Submit all votes
      await Promise.all(
        votedAwards.map(awardId =>
          fetch('/api/vote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              participantId: participant.id,
              awardId,
              nominee: votes[awardId]
            })
          })
        )
      );

      // Big celebration confetti
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 }
      });

      setTimeout(() => {
        confetti({
          particleCount: 150,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
      }, 250);

      setTimeout(() => {
        confetti({
          particleCount: 150,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 400);

      // Mark participant as having voted
      await fetch('/api/participant/mark-voted', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId: participant.id })
      });

      // Update localStorage
      const updatedParticipant = { ...participant, hasVoted: true };
      localStorage.setItem('participant', JSON.stringify(updatedParticipant));

      // Show success message and redirect
      setTimeout(() => {
        router.push('/results');
      }, 1500);

    } catch (err) {
      console.error('Error submitting votes:', err);
      alert('Error submitting votes. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-white text-3xl font-bold animate-pulse">Loading awards...</div>
      </div>
    );
  }

  const currentAward = awards[currentAwardIndex];
  const progress = ((currentAwardIndex + 1) / awards.length) * 100;
  const votedCount = Object.keys(votes).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                BET AWARDS 2024
              </h1>
              <p className="text-gray-600">Welcome, {participant?.name}!</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">{votedCount}/{awards.length}</div>
              <div className="text-sm text-gray-500">Votes Cast</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Award Card */}
      {currentAward && (
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-white rounded-3xl shadow-2xl p-8 transform transition-all duration-300">
            <div className="text-center mb-8">
              <div className="text-8xl mb-4 animate-bounce">{currentAward.emoji}</div>
              <h2 className="text-4xl font-black text-gray-800 mb-2">{currentAward.title}</h2>
              <p className="text-xl text-gray-600">{currentAward.description}</p>
            </div>

            {/* Nominees */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
              {currentAward.nominees.map((nominee) => {
                const isSelected = votes[currentAward._id] === nominee;
                return (
                  <button
                    key={nominee}
                    onClick={() => handleVote(currentAward._id, nominee)}
                    className={`p-3 rounded-xl border-3 transition-all duration-200 transform hover:scale-105 ${
                      isSelected
                        ? 'border-green-500 bg-green-50 shadow-lg scale-105 ring-2 ring-green-400'
                        : 'border-gray-300 hover:border-purple-400 bg-white'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center gap-1">
                      <span className={`text-sm font-bold text-gray-800 text-center leading-tight ${
                        isSelected ? 'text-green-700' : ''
                      }`}>{nominee}</span>
                      {isSelected && <span className="text-xl">✅</span>}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center gap-4">
              <button
                onClick={handlePrevious}
                disabled={currentAwardIndex === 0}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-300 transition-all"
              >
                ← Previous
              </button>

              <div className="text-gray-600 font-semibold">
                {currentAwardIndex + 1} / {awards.length}
              </div>

              {currentAwardIndex < awards.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={handleSubmitAll}
                  disabled={submitting || votedCount === 0}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-bold text-lg hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                >
                  {submitting ? 'Submitting...' : `Submit All Votes (${votedCount})`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick navigation */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-bold text-gray-700 mb-4">Quick Jump</h3>
          <div className="flex flex-wrap gap-2">
            {awards.map((award, index) => {
              // Can only jump to voted awards or previous awards
              const canJump = votes[award._id] || index <= currentAwardIndex;

              return (
                <button
                  key={award._id}
                  onClick={() => canJump && setCurrentAwardIndex(index)}
                  disabled={!canJump}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    currentAwardIndex === index
                      ? 'bg-purple-600 text-white'
                      : votes[award._id]
                      ? 'bg-green-100 text-green-700 border-2 border-green-500'
                      : canJump
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      : 'bg-gray-50 text-gray-400 cursor-not-allowed opacity-50'
                  }`}
                >
                  {award.emoji} {index + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
