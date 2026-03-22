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
  const [votes, setVotes] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentAwardIndex, setCurrentAwardIndex] = useState(0);
  const [error, setError] = useState('');
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
      .catch(() => {
        setLoading(false);
      });
  }, [router]);

  const handleVote = (awardId: string, nominee: string) => {
    setVotes(prev => {
      const currentVotes = prev[awardId] || [];
      const isAlreadySelected = currentVotes.includes(nominee);

      let newVotes;
      if (isAlreadySelected) {
        // Deselect if already selected
        newVotes = currentVotes.filter(n => n !== nominee);
      } else {
        // Add if less than 3 selected
        if (currentVotes.length < 3) {
          newVotes = [...currentVotes, nominee];
          // Trigger mini confetti
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 }
          });
        } else {
          // Already have 3 selections
          return prev;
        }
      }

      return { ...prev, [awardId]: newVotes };
    });
  };

  const handleNext = () => {
    // Check if current award has been voted on (at least 1 selection)
    const currentAward = awards[currentAwardIndex];
    const currentVotes = votes[currentAward._id] || [];
    if (currentVotes.length === 0) {
      return; // Don't advance if no votes
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

    const votedAwards = Object.keys(votes).filter(awardId => votes[awardId].length > 0);
    if (votedAwards.length === 0) {
      return;
    }

    setSubmitting(true);

    try {
      // Submit all votes - for each award, submit votes for all selected nominees
      const votePromises = votedAwards.flatMap(awardId =>
        votes[awardId].map(nominee =>
          fetch('/api/vote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              participantId: participant.id,
              awardId,
              nominee
            })
          })
        )
      );

      await Promise.all(votePromises);

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
      setError('Error submitting votes. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    const loadingMessages = [
      "Preparing your ballot...",
      "Rolling out the red carpet...",
      "Getting the awards ready...",
      "Setting up your voting booth..."
    ];
    const message = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];

    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FFE5D9 0%, #D4F1F4 50%, #FFFACD 100%)' }}>
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">🎭</div>
          <div className="text-gray-700 text-xl font-medium">{message}</div>
        </div>
      </div>
    );
  }

  const currentAward = awards[currentAwardIndex];
  const progress = ((currentAwardIndex + 1) / awards.length) * 100;
  const votedCount = Object.keys(votes).length;

  return (
    <div className="min-h-screen p-4" style={{ background: 'linear-gradient(135deg, #FFE5D9 0%, #D4F1F4 50%, #FFFACD 100%)' }}>
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                BET AWARDS 2024
              </h1>
              <p className="text-gray-600">Welcome, {participant?.name}!</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-semibold" style={{ color: '#FF6B6B' }}>{votedCount}/{awards.length}</div>
              <div className="text-sm text-gray-500">Votes Cast</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-full transition-all duration-500"
              style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #4ECDC4 0%, #FFE66D 100%)' }}
            />
          </div>
        </div>
      </div>

      {/* Award Card */}
      {currentAward && (
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-3" aria-hidden="true">{currentAward.emoji}</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{currentAward.title}</h2>
              <p className="text-lg text-gray-600">{currentAward.description}</p>
            </div>

            {error && (
              <div
                className="mb-6 bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded-xl text-center font-semibold"
                role="alert"
                aria-live="assertive"
              >
                {error}
              </div>
            )}

            {/* Selection Info */}
            <div className="mb-4 text-center">
              <p className="text-gray-600 font-semibold">
                Select up to 3 people • <span style={{ color: '#FF6B6B' }}>{votes[currentAward._id]?.length || 0}/3</span> selected
              </p>
              {votes[currentAward._id]?.length === 0 && (
                <p className="text-sm text-red-600 mt-2">
                  Pick at least one to continue
                </p>
              )}
              {votes[currentAward._id]?.length === 3 && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ Maximum reached!
                </p>
              )}
            </div>

            {/* Nominees */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
              {currentAward.nominees.map((nominee) => {
                const currentVotes = votes[currentAward._id] || [];
                const isSelected = currentVotes.includes(nominee);
                const selectionIndex = currentVotes.indexOf(nominee);

                return (
                  <button
                    key={nominee}
                    onClick={() => handleVote(currentAward._id, nominee)}
                    className={`p-3 rounded-lg border transition-all duration-200 relative btn-press ${
                      isSelected
                        ? 'checkmark-animate'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                    style={isSelected ? { borderColor: '#4ECDC4', backgroundColor: '#E0F7F5', borderWidth: '2px' } : { borderColor: '#E5E7EB' }}
                    onMouseEnter={(e) => !isSelected && (e.currentTarget.style.borderColor = '#4ECDC4')}
                    onMouseLeave={(e) => !isSelected && (e.currentTarget.style.borderColor = '#E5E7EB')}
                  >
                    <div className="flex flex-col items-center justify-center gap-1">
                      <span className={`text-sm font-semibold text-gray-800 text-center leading-tight`} style={isSelected ? { color: '#4ECDC4' } : {}}>{nominee}</span>
                      {isSelected && (
                        <span className="text-base" style={{ color: '#4ECDC4' }}>✓</span>
                      )}
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
                  disabled={(votes[currentAward._id]?.length || 0) === 0}
                  className="px-6 py-3 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors btn-press btn-lift"
                  style={{ background: (votes[currentAward._id]?.length || 0) === 0 ? '#9CA3AF' : 'linear-gradient(135deg, #4ECDC4 0%, #45B7D1 100%)' }}
                  onMouseEnter={(e) => (votes[currentAward._id]?.length || 0) > 0 && (e.currentTarget.style.background = 'linear-gradient(135deg, #3DBDB3 0%, #3AA6C1 100%)')}
                  onMouseLeave={(e) => (votes[currentAward._id]?.length || 0) > 0 && (e.currentTarget.style.background = 'linear-gradient(135deg, #4ECDC4 0%, #45B7D1 100%)')}
                  aria-label={`Next award (${currentAwardIndex + 2} of ${awards.length})`}
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={handleSubmitAll}
                  disabled={submitting || votedCount === 0}
                  className="px-8 py-3 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors btn-press btn-lift"
                  style={{ background: (submitting || votedCount === 0) ? '#9CA3AF' : 'linear-gradient(135deg, #FFE66D 0%, #F4A261 100%)' }}
                  onMouseEnter={(e) => !submitting && votedCount > 0 && (e.currentTarget.style.background = 'linear-gradient(135deg, #FFD555 0%, #E39152 100%)')}
                  onMouseLeave={(e) => !submitting && votedCount > 0 && (e.currentTarget.style.background = 'linear-gradient(135deg, #FFE66D 0%, #F4A261 100%)')}
                  aria-label={`Submit all ${votedCount} votes`}
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-gray-700 mb-4">Quick Jump</h3>
          <div className="flex flex-wrap gap-2">
            {awards.map((award, index) => {
              // Can only jump to voted awards or previous awards
              const awardVotes = votes[award._id] || [];
              const hasVotes = awardVotes.length > 0;
              const canJump = hasVotes || index <= currentAwardIndex;

              return (
                <button
                  key={award._id}
                  onClick={() => canJump && setCurrentAwardIndex(index)}
                  disabled={!canJump}
                  className={`px-3 py-2 rounded-md font-medium transition-colors text-sm ${
                    currentAwardIndex === index
                      ? 'text-white'
                      : hasVotes
                      ? 'border'
                      : canJump
                      ? 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                      : 'bg-gray-50 text-gray-400 cursor-not-allowed opacity-50 border border-gray-100'
                  }`}
                  style={currentAwardIndex === index ? { background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8C42 100%)' } : hasVotes ? { backgroundColor: '#E0F7F5', color: '#4ECDC4', borderColor: '#4ECDC4' } : {}}
                >
                  {award.emoji} {index + 1}
                  {hasVotes && <span className="ml-1 text-xs">({awardVotes.length})</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
