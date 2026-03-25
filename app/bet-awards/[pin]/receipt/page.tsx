'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface PageProps {
  params: Promise<{ pin: string }>;
}

interface VoteResult {
  nominee: string;
  count: number;
  percentage: number;
}

interface AwardResult {
  awardId: string;
  awardTitle: string;
  awardEmoji: string;
  awardDescription: string;
  votes: VoteResult[];
  totalVotes: number;
  winner: string;
}

interface SessionInfo {
  id: string;
  code: string;
  name: string;
  description?: string;
  hostName: string;
  status: string;
  createdAt?: string;
}

export default function BETAwardsReceipt({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [results, setResults] = useState<AwardResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch session info
        const sessionRes = await fetch(`/api/sessions/by-code/${resolvedParams.pin}`);
        if (!sessionRes.ok) {
          setError('Session not found');
          return;
        }
        const sessionData = await sessionRes.json();
        setSessionInfo(sessionData.session);

        // Fetch results
        const resultsRes = await fetch(`/api/bet-awards/sessions/${sessionData.session.id}/results`);
        if (!resultsRes.ok) {
          setError('Failed to load results');
          return;
        }
        const resultsData = await resultsRes.json();
        setResults(resultsData.results || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load receipt');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [resolvedParams.pin]);

  const handleDownload = () => {
    window.print();
  };

  const totalVotes = results.reduce((sum, award) => sum + award.totalVotes, 0);
  const totalAwards = results.length;
  const completedVotes = results.filter(award => award.totalVotes > 0).length;

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #FFE5D9 0%, #D4F1F4 50%, #FFFACD 100%)', fontFamily: "'Courier Prime', 'Courier New', Courier, monospace" }}
      >
        <div className="text-center">
          <Image src="/podium.gif" alt="Loading" width={100} height={100} unoptimized className="object-contain mx-auto mb-4" />
          <p className="text-gray-700 font-semibold">Preparing receipt...</p>
        </div>
      </div>
    );
  }

  if (error || !sessionInfo) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: 'linear-gradient(135deg, #FFE5D9 0%, #D4F1F4 50%, #FFFACD 100%)', fontFamily: "'Courier Prime', 'Courier New', Courier, monospace" }}
      >
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <p className="text-red-600 font-bold mb-4">{error || 'Session not found'}</p>
          <button
            onClick={() => router.push('/bet-awards')}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-4 print:p-0 flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #FFE5D9 0%, #D4F1F4 50%, #FFFACD 100%)', fontFamily: "'Courier Prime', 'Courier New', Courier, monospace" }}
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400&display=swap');

        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        .receipt-shadow {
          filter: drop-shadow(0 6px 28px rgba(0,0,0,0.28)) drop-shadow(0 2px 6px rgba(0,0,0,0.15));
        }

        .receipt-paper {
          position: relative;
          overflow: hidden;
          background: #fdfcf5;
        }

        .texture-img {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          object-fit: cover;
          opacity: 0.55;
          mix-blend-mode: multiply;
          pointer-events: none;
          z-index: 0;
        }

        .receipt-paper > *:not(.texture-img) {
          position: relative;
          z-index: 1;
        }

        .edge-top {
          height: 18px;
          background: radial-gradient(circle at 50% 100%, transparent 9px, #fdfcf5 9px);
          background-size: 20px 18px;
        }

        .edge-tear {
          height: 18px;
          background: radial-gradient(circle at 50% 50%, transparent 7px, #fdfcf5 7px);
          background-size: 18px 18px;
        }

        .edge-bottom {
          height: 14px;
          background:
            linear-gradient(135deg, transparent 33.33%, #fdfcf5 33.33%) 0 0,
            linear-gradient(225deg, transparent 33.33%, #fdfcf5 33.33%) 0 0;
          background-size: 14px 14px;
        }

        .receipt-body { padding: 0.25rem 1.75rem 1rem; }

        .receipt-header { text-align: center; padding: 1rem 0 0.5rem; }

        .brand {
          font-size: 0.68rem;
          letter-spacing: 5px;
          text-transform: uppercase;
          color: #9a9080;
          margin-bottom: 0.4rem;
        }

        .event-title {
          font-size: 1.2rem;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #1c1a14;
          margin-bottom: 0.15rem;
        }

        .event-sub {
          font-size: 0.7rem;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #7a7060;
          margin-bottom: 0.6rem;
        }

        .divider-line {
          border: none;
          border-top: 1px solid #d0c8b8;
          margin: 0.6rem 0;
        }

        .divider-text {
          text-align: center;
          font-size: 0.72rem;
          letter-spacing: 3px;
          color: #b0a898;
          margin: 0.5rem 0;
        }

        .meta { margin-bottom: 0.6rem; }

        .meta-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: #7a7060;
          padding: 0.18rem 0;
          line-height: 1.4;
        }

        .meta-row .val { color: #1c1a14; }

        .section-label {
          font-size: 0.65rem;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #9a9080;
          margin: 0.75rem 0 0.4rem;
        }

        .award-row {
          display: flex;
          align-items: flex-start;
          padding: 0.55rem 0;
          border-bottom: 1px dotted #d8d0c0;
          gap: 0.4rem;
        }

        .award-row:last-child { border-bottom: none; }

        .award-emoji {
          font-size: 1.1rem;
          flex-shrink: 0;
          width: 24px;
          text-align: center;
        }

        .award-info {
          flex: 1;
          min-width: 0;
        }

        .award-title {
          font-size: 0.82rem;
          color: #1c1a14;
          font-weight: 700;
          margin-bottom: 0.15rem;
        }

        .winner-name {
          font-size: 0.75rem;
          color: #3a7a3a;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .winner-icon {
          font-size: 0.65rem;
        }

        .vote-count {
          font-size: 0.72rem;
          color: #7a7060;
          white-space: nowrap;
          text-align: right;
        }

        .totals { margin: 0.5rem 0; }

        .total-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.82rem;
          color: #4a4438;
          padding: 0.22rem 0;
        }

        .total-row .label { color: #7a7060; }

        .total-grand {
          display: flex;
          justify-content: space-between;
          font-size: 1rem;
          font-weight: 700;
          color: #1c1a14;
          padding: 0.5rem 0 0.3rem;
          border-top: 2px solid #1c1a14;
          margin-top: 0.3rem;
          letter-spacing: 1px;
        }

        .stamp-row { text-align: center; margin: 0.75rem 0 0.25rem; }

        .stamp {
          display: inline-block;
          border: 2px solid #3a7a3a;
          outline: 1px solid #3a7a3a;
          outline-offset: 2px;
          border-radius: 2px;
          padding: 0.3rem 0.85rem;
          transform: rotate(-4deg);
          color: #3a7a3a;
          font-weight: 700;
          font-size: 0.8rem;
          letter-spacing: 4px;
          text-transform: uppercase;
          opacity: 0.7;
          text-shadow: 1px 1px 0 rgba(58,122,58,0.15);
        }

        .btn-row {
          display: flex;
          gap: 0.6rem;
          margin: 0.75rem 0 0.25rem;
        }

        .receipt-btn {
          flex: 1;
          font-family: 'Courier Prime', monospace;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          padding: 0.55rem 0;
          border-radius: 2px;
          cursor: pointer;
          transition: all 0.12s;
        }

        .btn-dark { background: #1c1a14; color: #fdfcf5; border: 1.5px solid #1c1a14; }
        .btn-dark:hover { background: #333; }
        .btn-outline { background: transparent; color: #1c1a14; border: 1.5px solid #1c1a14; }
        .btn-outline:hover { background: rgba(240,235,224,0.7); }

        .barcode-wrap { margin: 0.85rem 0 0.4rem; text-align: center; }

        .barcode {
          height: 52px;
          width: 100%;
          background: repeating-linear-gradient(
            90deg,
            #1c1a14 0px, #1c1a14 2px, transparent 2px, transparent 3px,
            #1c1a14 3px, #1c1a14 5px, transparent 5px, transparent 8px,
            #1c1a14 8px, #1c1a14 9px, transparent 9px, transparent 11px,
            #1c1a14 11px, #1c1a14 13px, transparent 13px, transparent 14px,
            #1c1a14 14px, #1c1a14 16px, transparent 16px, transparent 19px,
            #1c1a14 19px, #1c1a14 20px, transparent 20px, transparent 22px,
            #1c1a14 22px, #1c1a14 25px, transparent 25px, transparent 27px,
            #1c1a14 27px, #1c1a14 28px, transparent 28px, transparent 30px,
            #1c1a14 30px, #1c1a14 31px, transparent 31px, transparent 34px,
            #1c1a14 34px, #1c1a14 36px, transparent 36px, transparent 38px,
            #1c1a14 38px, #1c1a14 39px, transparent 39px, transparent 41px,
            #1c1a14 41px, #1c1a14 44px, transparent 44px, transparent 46px,
            #1c1a14 46px, #1c1a14 47px, transparent 47px, transparent 49px,
            #1c1a14 49px, #1c1a14 51px, transparent 51px, transparent 52px,
            #1c1a14 52px, #1c1a14 53px, transparent 53px, transparent 56px
          );
          margin-bottom: 0.3rem;
        }

        .barcode-num {
          font-size: 0.62rem;
          letter-spacing: 4px;
          color: #9a9080;
        }

        .receipt-footer {
          text-align: center;
          font-size: 0.68rem;
          color: #9a9080;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          line-height: 1.8;
          padding-bottom: 0.5rem;
        }

        @media print {
          body { background: white !important; }
          .receipt-shadow { filter: none !important; }
          .btn-row, .print\\:hidden { display: none !important; }
          .page { max-width: 600px !important; transform: none !important; }
        }
      `}</style>

      <div className="w-full max-w-2xl mx-auto py-10 print:py-0">
        <div className="page" style={{ width: '100%', maxWidth: '600px', transform: 'rotate(-0.6deg)', margin: '0 auto' }}>
          <div className="receipt-shadow">
            <div className="receipt-paper">
              <img
                className="texture-img"
                src="https://img.freepik.com/free-photo/paper-texture-close-up_23-2151929084.jpg?semt=ais_hybrid&w=740&q=80"
                alt=""
                aria-hidden="true"
              />

              {/* Perforated top */}
              <div className="edge-top"></div>

              {/* Main body */}
              <div className="receipt-body">
                <div className="receipt-header">
                  <div className="brand">BET Awards &nbsp;🏆&nbsp; Results</div>
                  <div className="event-title">{sessionInfo.name}</div>
                  <div className="event-sub">{new Date().getFullYear()} · PIN: {sessionInfo.code}</div>
                </div>

                <div className="divider-text">- - - - - - - - - - - - - - - -</div>

                <div className="meta">
                  <div className="meta-row"><span>Receipt #</span><span className="val">BET-{sessionInfo.code}-{new Date().getFullYear()}</span></div>
                  <div className="meta-row"><span>Date</span><span className="val">{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
                  <div className="meta-row"><span>Event</span><span className="val">{sessionInfo.name}</span></div>
                  <div className="meta-row"><span>Host</span><span className="val">{sessionInfo.hostName}</span></div>
                  <div className="meta-row"><span>Status</span><span className="val">{sessionInfo.status}</span></div>
                </div>

                <div className="divider-text">- - - - - - - - - - - - - - - -</div>

                <div className="section-label">Award Winners</div>

                {results.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 0', color: '#7a7060', fontSize: '0.75rem' }}>
                    No votes recorded yet
                  </div>
                ) : (
                  results.map((award) => (
                    <div key={award.awardId} className="award-row">
                      <div className="award-emoji">{award.awardEmoji || '🏆'}</div>
                      <div className="award-info">
                        <div className="award-title">{award.awardTitle}</div>
                        {award.winner ? (
                          <div className="winner-name">
                            <span className="winner-icon">👑</span>
                            <span>{award.winner}</span>
                          </div>
                        ) : (
                          <div className="winner-name" style={{ color: '#c03020' }}>
                            <span>No votes yet</span>
                          </div>
                        )}
                      </div>
                      <div className="vote-count">
                        {award.totalVotes > 0 ? (
                          <>
                            {award.votes.find(v => v.nominee === award.winner)?.count || 0} votes
                            <div style={{ fontSize: '0.65rem', color: '#9a9080' }}>
                              {award.votes.find(v => v.nominee === award.winner)?.percentage.toFixed(0) || 0}%
                            </div>
                          </>
                        ) : (
                          <span>—</span>
                        )}
                      </div>
                    </div>
                  ))
                )}

                <div className="divider-line" style={{ marginTop: '0.5rem' }}></div>

                <div className="totals">
                  <div className="total-row"><span className="label">Total Awards</span><span>{totalAwards}</span></div>
                  <div className="total-row"><span className="label">Awards with Votes</span><span>{completedVotes}</span></div>
                  <div className="total-grand"><span>Total Votes Cast</span><span>{totalVotes}</span></div>
                </div>

                <div className="divider-text" style={{ marginTop: '0.5rem' }}>- - - - - - - - - - - - - - - -</div>

                <div className="stamp-row">
                  <span className="stamp">{completedVotes === totalAwards ? 'Complete' : 'In Progress'}</span>
                </div>

                <div className="btn-row print:hidden">
                  <button
                    onClick={() => router.push(`/bet-awards/${resolvedParams.pin}/results`)}
                    className="receipt-btn btn-outline"
                  >
                    ← View Charts
                  </button>
                  <button
                    onClick={handleDownload}
                    className="receipt-btn btn-dark"
                  >
                    🖨 Print
                  </button>
                </div>

                <div className="barcode-wrap">
                  <div className="barcode"></div>
                  <div className="barcode-num">* {sessionInfo.code} · {totalVotes} VOTES · {totalAwards} AWARDS *</div>
                </div>

                <div className="receipt-footer">
                  Thank you for participating<br />
                  BET Awards {new Date().getFullYear()} 🏆
                </div>
              </div>

              {/* Bottom zigzag */}
              <div className="edge-bottom"></div>
            </div>
          </div>
        </div>

        {/* Back to results button below receipt */}
        <div className="text-center mt-8 print:hidden">
          <button
            onClick={() => router.push(`/bet-awards/${resolvedParams.pin}/results`)}
            className="px-6 py-3 bg-white text-gray-900 rounded-lg font-bold hover:shadow-lg transition-all border-2 border-gray-900"
          >
            ← Back to Results Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
