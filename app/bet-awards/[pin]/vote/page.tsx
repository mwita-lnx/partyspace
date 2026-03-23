'use client';

import { use, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface PageProps {
  params: Promise<{ pin: string }>;
}

interface Award {
  _id: string;
  title: string;
  description: string;
  emoji: string;
  nominees: string[];
  order: number;
}

interface Session {
  id: string;
  code: string;
  name: string;
  description?: string;
  hostName: string;
  status: string;
}

export default function BETAwardsVotePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [session, setSession] = useState<Session | null>(null);
  const [awards, setAwards] = useState<Award[]>([]);
  const [voterName, setVoterName] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [votes, setVotes] = useState<Record<string, string>>({});
  // savedVotes = votes already persisted on the server (locked, cannot re-vote)
  const [savedVotes, setSavedVotes] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<'right' | 'left'>('right');

  useEffect(() => {
    const name = localStorage.getItem('voterName') || '';
    if (!name) {
      router.push(`/bet-awards/${resolvedParams.pin}`);
      return;
    }
    setVoterName(name);

    const init = async () => {
      try {
        const sessRes = await fetch(`/api/sessions/by-code/${resolvedParams.pin}`);
        if (!sessRes.ok) {
          setError('Session not found. Please re-enter your PIN.');
          setLoading(false);
          return;
        }
        const sessData = await sessRes.json();
        const sess: Session = sessData.session;
        setSession(sess);

        const [awardsRes, votesRes] = await Promise.all([
          fetch(`/api/sessions/${sess.id}/awards`),
          fetch(`/api/vote?sessionId=${sess.id}&voterName=${encodeURIComponent(name)}`),
        ]);

        if (!awardsRes.ok) {
          setError('Could not load awards. Please try again.');
          setLoading(false);
          return;
        }

        const awardsData = await awardsRes.json();
        setAwards(awardsData.awards || []);

        // Pre-populate votes from server (these are locked)
        if (votesRes.ok) {
          const votesData = await votesRes.json();
          const existing: Record<string, string> = {};
          for (const v of votesData.votes || []) {
            existing[v.awardId] = v.nominee;
          }
          setVotes(existing);
          setSavedVotes(existing);
        }
      } catch {
        setError('Connection error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [resolvedParams.pin, router]);

  const goTo = useCallback((newIndex: number) => {
    if (animating || newIndex === currentIndex) return;
    setDirection(newIndex > currentIndex ? 'right' : 'left');
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex(newIndex);
      setAnimating(false);
    }, 280);
  }, [animating, currentIndex]);

  const handleVote = (nominee: string) => {
    const award = awards[currentIndex];
    if (!award) return;
    // Prevent changing a vote that's already saved on the server
    if (savedVotes[award._id]) return;
    setVotes(prev => ({ ...prev, [award._id]: nominee }));
  };

  const handleNext = () => {
    if (currentIndex < awards.length - 1) goTo(currentIndex + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) goTo(currentIndex - 1);
  };

  const handleSubmit = async () => {
    if (!session || submitting) return;
    setSubmitting(true);
    try {
      // Only submit awards that haven't been saved yet
      const pendingVotes = Object.entries(votes).filter(
        ([awardId]) => !savedVotes[awardId]
      );

      await Promise.all(
        pendingVotes.map(([awardId, nominee]) =>
          fetch(`/api/sessions/${session.id}/vote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ voterName, awardId, nominee }),
          })
        )
      );
      setSubmitted(true);
      setTimeout(() => {
        router.push(`/bet-awards/${resolvedParams.pin}/results`);
      }, 3000);
    } catch {
      setError('Failed to submit votes. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentAward = awards[currentIndex];
  const currentVote = currentAward ? votes[currentAward._id] : undefined;
  const isLocked = currentAward ? !!savedVotes[currentAward._id] : false;
  const votedCount = Object.keys(votes).length;
  const allVoted = votedCount === awards.length && awards.length > 0;
  const progress = awards.length > 0 ? (votedCount / awards.length) * 100 : 0;

  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #FFE5D9 0%, #D4F1F4 50%, #FFFACD 100%)',
    fontFamily: "'Quicksand', sans-serif",
    padding: '24px 16px 48px',
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ ...pageStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Image src="/podium.gif" alt="Loading" width={120} height={120} unoptimized className="object-contain mx-auto mb-4" />
          <p style={{ color: '#6B7280', fontSize: 18, fontWeight: 600 }}>Preparing your ballot…</p>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error && !submitted) {
    return (
      <div style={{ ...pageStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#fff', borderRadius: 24, padding: 40, textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.1)', maxWidth: 400 }}>
          <p style={{ fontSize: 48, marginBottom: 12 }}>⚠️</p>
          <p style={{ color: '#EF4444', fontWeight: 700, fontSize: 16, marginBottom: 20 }}>{error}</p>
          <button
            onClick={() => router.push(`/bet-awards/${resolvedParams.pin}`)}
            style={{ padding: '12px 28px', background: 'linear-gradient(135deg, #FFE66D 0%, #F4A261 100%)', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: 'pointer', color: '#1F2937', fontFamily: "'Quicksand', sans-serif" }}
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  // ── Submitted ────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={{ ...pageStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#fff', borderRadius: 24, padding: 48, textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.1)', maxWidth: 440 }}>
          <Image src="/podium.gif" alt="Winner" width={140} height={140} unoptimized className="object-contain mx-auto mb-6" />
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#1F2937', marginBottom: 8 }}>Votes Submitted! 🎉</h2>
          <p style={{ color: '#6B7280', fontSize: 16, marginBottom: 4 }}>Thanks <strong style={{ color: '#F4A261' }}>{voterName}</strong>!</p>
          <p style={{ color: '#9CA3AF', fontSize: 14 }}>Taking you to results…</p>
        </div>
      </div>
    );
  }

  // ── No awards ────────────────────────────────────────────────────────────
  if (awards.length === 0) {
    return (
      <div style={{ ...pageStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#fff', borderRadius: 24, padding: 40, textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.1)', maxWidth: 400 }}>
          <Image src="/idea.gif" alt="No awards" width={100} height={100} unoptimized className="object-contain mx-auto mb-4" />
          <p style={{ color: '#6B7280', fontSize: 16, fontWeight: 600 }}>No awards set up yet. Check back soon!</p>
        </div>
      </div>
    );
  }

  // ── Main voting UI ───────────────────────────────────────────────────────
  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Image src="/podium.gif" alt="BET Awards" width={90} height={90} unoptimized style={{ objectFit: 'contain', display: 'inline-block' }} />
          <h1 style={{ fontSize: 30, fontWeight: 800, color: '#1F2937', marginTop: 8, marginBottom: 2 }}>
            {session?.name || 'BET Awards'}
          </h1>
          <p style={{ color: '#6B7280', fontSize: 14 }}>
            Voting as <strong style={{ color: '#F4A261' }}>{voterName}</strong>
          </p>
        </div>

        {/* Progress card */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '18px 24px', marginBottom: 20, boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>
              Category {currentIndex + 1} of {awards.length}
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: votedCount === awards.length ? '#10B981' : '#F4A261' }}>
              {votedCount}/{awards.length} voted
            </span>
          </div>
          <div style={{ height: 8, background: '#F3F4F6', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #FFE66D, #F4A261)', borderRadius: 99, transition: 'width 0.4s ease' }} />
          </div>
        </div>

        {/* Category dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {awards.map((a, i) => (
            <button
              key={a._id}
              onClick={() => goTo(i)}
              title={a.title}
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                background: votes[a._id] ? '#F4A261' : i === currentIndex ? '#4ECDC4' : '#D1D5DB',
                transform: i === currentIndex ? 'scale(1.5)' : 'scale(1)',
                transition: 'all 0.2s',
              }}
            />
          ))}
        </div>

        {/* Award card */}
        <div
          style={{
            background: '#fff',
            borderRadius: 24,
            padding: '32px 24px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
            opacity: animating ? 0 : 1,
            transform: animating
              ? direction === 'right' ? 'translateX(30px)' : 'translateX(-30px)'
              : 'translateX(0)',
            transition: 'opacity 0.28s ease, transform 0.28s ease',
          }}
        >
          {/* Award header with GIF */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 20, borderBottom: '2px solid #F3F4F6' }}>
            <Image
              src="/polls.gif"
              alt={currentAward.title}
              width={80}
              height={80}
              unoptimized
              style={{ objectFit: 'contain', borderRadius: 12, flexShrink: 0 }}
            />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#9CA3AF', fontWeight: 700, marginBottom: 4 }}>
                {currentAward.emoji} Award
              </p>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1F2937', lineHeight: 1.2, marginBottom: 4 }}>
                {currentAward.title}
              </h2>
              <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>
                {currentAward.description}
              </p>
            </div>
          </div>

          {/* Selection / lock status */}
          {isLocked ? (
            <div style={{
              background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
              border: '2px solid #86EFAC',
              borderRadius: 12,
              padding: '10px 16px',
              marginBottom: 18,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span style={{ fontSize: 18 }}>🔒</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#166534' }}>
                Vote saved — <span style={{ color: '#16A34A' }}>{currentVote}</span>
              </span>
            </div>
          ) : currentVote ? (
            <div style={{
              background: 'linear-gradient(135deg, #FFF9E6 0%, #FFF0DC 100%)',
              border: '2px solid #FFE66D',
              borderRadius: 12,
              padding: '10px 16px',
              marginBottom: 18,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span style={{ fontSize: 18 }}>✅</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#92400E' }}>
                You picked <span style={{ color: '#F4A261' }}>{currentVote}</span>
              </span>
            </div>
          ) : (
            <p style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 600, marginBottom: 18, textAlign: 'center' }}>
              Tap a nominee to cast your vote
            </p>
          )}

          {/* Nominees grid */}
          {currentAward.nominees.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#9CA3AF' }}>
              <Image src="/idea.gif" alt="No nominees" width={60} height={60} unoptimized style={{ objectFit: 'contain', display: 'inline-block', marginBottom: 8 }} />
              <p style={{ fontSize: 14, fontWeight: 600 }}>No nominees yet.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12, marginBottom: 28 }}>
              {currentAward.nominees.map((nominee) => {
                const chosen = currentVote === nominee;
                return (
                  <button
                    key={nominee}
                    onClick={() => handleVote(nominee)}
                    disabled={isLocked}
                    title={isLocked ? 'This vote is already saved' : undefined}
                    style={{
                      padding: '14px 10px',
                      borderRadius: 14,
                      border: chosen ? '2px solid #F4A261' : '2px solid #E5E7EB',
                      background: isLocked && chosen
                        ? 'linear-gradient(135deg, #BBF7D0 0%, #86EFAC 100%)'
                        : chosen
                        ? 'linear-gradient(135deg, #FFE66D 0%, #F4A261 100%)'
                        : '#F9FAFB',
                      cursor: isLocked ? 'default' : 'pointer',
                      fontFamily: "'Quicksand', sans-serif",
                      fontWeight: 700,
                      fontSize: 14,
                      color: chosen ? '#1F2937' : '#374151',
                      textAlign: 'center',
                      transition: 'all 0.2s ease',
                      transform: chosen ? 'scale(1.04)' : 'scale(1)',
                      boxShadow: chosen && !isLocked ? '0 4px 16px rgba(244,162,97,0.35)' : 'none',
                      lineHeight: 1.3,
                      opacity: isLocked && !chosen ? 0.45 : 1,
                    }}
                  >
                    {chosen && <span style={{ display: 'block', fontSize: 16, marginBottom: 4 }}>{isLocked ? '🔒' : '✓'}</span>}
                    {nominee}
                  </button>
                );
              })}
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              style={{
                padding: '12px 22px',
                background: '#F3F4F6',
                border: 'none',
                borderRadius: 12,
                fontFamily: "'Quicksand', sans-serif",
                fontWeight: 700,
                fontSize: 14,
                color: '#6B7280',
                cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                opacity: currentIndex === 0 ? 0.4 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              ← Prev
            </button>

            {currentIndex < awards.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={!currentVote && !isLocked}
                style={{
                  padding: '12px 28px',
                  background: (currentVote || isLocked)
                    ? 'linear-gradient(135deg, #FFE66D 0%, #F4A261 100%)'
                    : '#D1D5DB',
                  border: 'none',
                  borderRadius: 12,
                  fontFamily: "'Quicksand', sans-serif",
                  fontWeight: 800,
                  fontSize: 15,
                  color: '#1F2937',
                  cursor: (currentVote || isLocked) ? 'pointer' : 'not-allowed',
                  opacity: (currentVote || isLocked) ? 1 : 0.5,
                  transition: 'all 0.2s',
                  boxShadow: (currentVote || isLocked) ? '0 4px 16px rgba(244,162,97,0.3)' : 'none',
                }}
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting || !allVoted}
                style={{
                  padding: '14px 28px',
                  background: allVoted
                    ? 'linear-gradient(135deg, #FFE66D 0%, #F4A261 100%)'
                    : '#D1D5DB',
                  border: 'none',
                  borderRadius: 12,
                  fontFamily: "'Quicksand', sans-serif",
                  fontWeight: 800,
                  fontSize: 15,
                  color: '#1F2937',
                  cursor: allVoted ? 'pointer' : 'not-allowed',
                  opacity: allVoted ? 1 : 0.5,
                  boxShadow: allVoted ? '0 4px 20px rgba(244,162,97,0.4)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                {submitting ? 'Submitting…' : allVoted ? '🏆 Submit All Votes' : `Vote all ${awards.length} to submit`}
              </button>
            )}
          </div>

          {error && (
            <p style={{ color: '#EF4444', fontSize: 13, textAlign: 'center', marginTop: 12, fontWeight: 700 }}>
              {error}
            </p>
          )}
        </div>

        {/* Quick-jump pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 20 }}>
          {awards.map((a, i) => (
            <button
              key={a._id}
              onClick={() => goTo(i)}
              style={{
                padding: '6px 14px',
                borderRadius: 99,
                border: i === currentIndex
                  ? '2px solid #4ECDC4'
                  : votes[a._id]
                  ? '2px solid #F4A261'
                  : '2px solid #E5E7EB',
                background: i === currentIndex
                  ? '#E0F7F5'
                  : votes[a._id]
                  ? '#FFF9E6'
                  : '#fff',
                fontFamily: "'Quicksand', sans-serif",
                fontWeight: 700,
                fontSize: 12,
                color: i === currentIndex ? '#0D9488' : votes[a._id] ? '#D97706' : '#6B7280',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {a.emoji} {a.title.length > 14 ? a.title.slice(0, 14) + '…' : a.title}
              {savedVotes[a._id] ? ' 🔒' : votes[a._id] ? ' ✓' : ''}
            </button>
          ))}
        </div>

        <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 12, marginTop: 20 }}>
          No login required to vote
        </p>
      </div>
    </div>
  );
}
