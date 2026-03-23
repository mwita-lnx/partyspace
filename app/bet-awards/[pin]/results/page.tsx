'use client';
// Images: barchart.gif, piechart.gif, share.gif used as UI icons

import { use, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import confetti from 'canvas-confetti';

interface PageProps {
  params: Promise<{ pin: string }>;
}

interface AwardResult {
  awardId: string;
  awardTitle: string;
  awardEmoji: string;
  awardDescription: string;
  votes: { nominee: string; count: number; percentage: number }[];
  totalVotes: number;
  winner: string | null;
}

const COLORS = ['#FFE66D', '#4ECDC4', '#FF6B6B', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3', '#A8D8EA'];

export default function BETAwardsResults({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [results, setResults] = useState<AwardResult[]>([]);
  const [error, setError] = useState('');
  const [celebrated, setCelebrated] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const sr = await fetch(`/api/sessions/by-code/${resolvedParams.pin}`);
      if (!sr.ok) { setError('Session not found. Please check the PIN.'); setLoading(false); return; }
      const sd = await sr.json();
      setSessionInfo(sd.session);
      const rr = await fetch(`/api/sessions/${sd.session.id}/results`);
      if (rr.ok) setResults((await rr.json()).results || []);
      else setError('Could not load results.');
    } catch { setError('Connection error. Please try again.'); }
    finally { setLoading(false); }
  }, [resolvedParams.pin]);

  useEffect(() => { fetchResults(); }, [fetchResults]);

  useEffect(() => {
    if (!celebrated && results.length > 0 && results.some(r => r.totalVotes > 0)) {
      setTimeout(() => confetti({ particleCount: 200, spread: 120, origin: { y: 0.6 } }), 400);
      setCelebrated(true);
    }
  }, [results, celebrated]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/bet-awards/${resolvedParams.pin}/results`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const winners = results.filter(r => r.winner);
  const totalVotesCast = results.reduce((s, r) => s + r.totalVotes, 0);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FFE5D9 0%, #D4F1F4 50%, #FFFACD 100%)', fontFamily: "'Quicksand', sans-serif" }}>
      <div className="text-center">
        <Image src="/podium.gif" alt="Loading" width={110} height={110} unoptimized className="object-contain mx-auto mb-4" />
        <p className="text-gray-700 font-semibold text-lg">Tallying the votes…</p>
      </div>
    </div>
  );

  // ── Error (no session) ─────────────────────────────────────────────────────
  if (error && !sessionInfo) return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #FFE5D9 0%, #D4F1F4 50%, #FFFACD 100%)', fontFamily: "'Quicksand', sans-serif" }}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
        <p className="text-5xl mb-4">⚠️</p>
        <p className="font-bold text-gray-900 mb-2">Session Not Found</p>
        <p className="text-gray-500 text-sm mb-6">{error}</p>
        <button onClick={() => router.push('/bet-awards')} className="px-6 py-3 bg-teal-500 text-white rounded-xl font-bold hover:bg-teal-600 transition-colors">← Home</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #FFE5D9 0%, #D4F1F4 50%, #FFFACD 100%)', fontFamily: "'Quicksand', sans-serif" }}>

      {/* Sticky nav bar */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push(`/bet-awards/${resolvedParams.pin}`)} className="text-gray-500 hover:text-gray-900 font-bold text-sm">← Back</button>
            <div className="w-px h-5 bg-gray-200" />
            <div>
              <p className="font-black text-gray-900 text-sm leading-tight">{sessionInfo?.name || 'BET Awards'}</p>
              <p className="text-xs text-gray-400 font-mono">PIN {resolvedParams.pin}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchResults} className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors">
              <Image src="/rotate.gif" alt="Refresh" width={18} height={18} unoptimized className="object-contain" />
              Refresh
            </button>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-colors text-white"
              style={{ background: copied ? '#22C55E' : 'linear-gradient(135deg, #4ECDC4, #45B7D1)' }}
            >
              <Image src="/share.gif" alt="Share" width={18} height={18} unoptimized className="object-contain" />
              {copied ? 'Copied!' : 'Share'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        {/* Hero header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center border border-gray-100">
          <Image src="/podium.gif" alt="Results" width={80} height={80} unoptimized className="object-contain mx-auto mb-3" />
          <h1 className="text-4xl font-black text-gray-900 mb-1">🏆 BET Awards Results</h1>
          <p className="text-gray-500 text-sm">{totalVotesCast} total votes cast across {results.length} categories</p>
          {error && <p className="mt-3 text-sm text-red-600 font-bold">{error}</p>}
        </div>

        {/* No votes yet */}
        {results.length > 0 && results.every(r => r.totalVotes === 0) && (
          <div className="bg-white rounded-2xl p-10 text-center border-2 border-dashed border-gray-200 shadow">
            <Image src="/competition.gif" alt="Waiting" width={110} height={110} unoptimized className="object-contain mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">No votes yet!</h2>
            <p className="text-gray-500 text-sm">Results will appear here once participants start voting.</p>
          </div>
        )}

        {/* Winners Podium Summary */}
        {winners.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <span className="text-xl">🏅</span>
              <h2 className="text-lg font-black text-gray-900">Winners at a Glance</h2>
              <span className="ml-auto text-xs text-gray-400 font-semibold">{winners.length} of {results.length} categories</span>
            </div>
            <div className="divide-y divide-gray-100">
              {winners.map(r => {
                const winnerVote = r.votes.find(v => v.nominee === r.winner);
                return (
                  <div key={r.awardId} className="flex items-center gap-4 px-6 py-4 hover:bg-yellow-50/50 transition-colors">
                    <span className="text-2xl w-8 text-center flex-shrink-0">{r.awardEmoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{r.awardTitle}</p>
                      <p className="font-black text-gray-900 truncate">{r.winner}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-black text-orange-500">{winnerVote?.count ?? 0} votes</p>
                      <p className="text-xs text-gray-400">{winnerVote?.percentage.toFixed(0) ?? 0}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Per-award detail cards — first 3 expanded by default */}
        <div className="space-y-4">
          {results.map((result, i) => (
            <ResultCard key={result.awardId} result={result} defaultExpanded={i < 3} />
          ))}
        </div>

      </div>
    </div>
  );
}

// ── ResultCard ─────────────────────────────────────────────────────────────────
function ResultCard({ result, defaultExpanded }: { result: AwardResult; defaultExpanded: boolean }) {
  const [chartMode, setChartMode] = useState<'bar' | 'pie'>('bar');
  const [expanded, setExpanded] = useState(defaultExpanded);

  const chartData = result.votes.map((v, i) => ({
    name: v.nominee,
    votes: v.count,
    percentage: v.percentage,
    fill: COLORS[i % COLORS.length]
  }));

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
      {/* Always-visible header — click to expand/collapse */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors text-left"
      >
        <span className="text-3xl">{result.awardEmoji || '🏆'}</span>
        <div className="flex-1 min-w-0">
          <h2 className="font-black text-gray-900 text-lg leading-tight">{result.awardTitle}</h2>
          {result.winner
            ? <p className="text-sm text-orange-600 font-bold truncate">🥇 {result.winner} · {result.totalVotes} votes</p>
            : <p className="text-sm text-gray-400 italic">No votes yet</p>}
        </div>
        <span className="text-gray-400 text-sm ml-2">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-6 py-5">
          {/* Winner banner */}
          {result.winner && (
            <div className="mb-5 p-4 rounded-xl border-2 border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50 flex items-center gap-3">
              <span className="text-3xl">🥇</span>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Winner</p>
                <p className="text-xl font-black text-gray-900">{result.winner}</p>
                <p className="text-sm text-gray-600">
                  {result.votes.find(v => v.nominee === result.winner)?.count} votes
                  {' · '}
                  {result.votes.find(v => v.nominee === result.winner)?.percentage.toFixed(1)}%
                </p>
              </div>
            </div>
          )}

          {chartData.length > 0 ? (
            <>
              {/* Chart toggle */}
              <div className="flex justify-end gap-2 mb-3">
                <button
                  onClick={() => setChartMode('bar')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${chartMode === 'bar' ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  <Image src="/barchart.gif" alt="Bar" width={18} height={18} unoptimized className="object-contain" />
                  Bar
                </button>
                <button
                  onClick={() => setChartMode('pie')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${chartMode === 'pie' ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  <Image src="/piechart.gif" alt="Pie" width={18} height={18} unoptimized className="object-contain" />
                  Pie
                </button>
              </div>

              <ResponsiveContainer width="100%" height={260}>
                {chartMode === 'bar'
                  ? (
                    <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                      <XAxis dataKey="name" angle={-35} textAnchor="end" tick={{ fontSize: 12, fontWeight: 600 }} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip formatter={(v: any) => [`${v} votes`]} contentStyle={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 700 }} />
                      <Bar dataKey="votes" radius={[6, 6, 0, 0]}>
                        {chartData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                      </Bar>
                    </BarChart>
                  ) : (
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="votes"
                        label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                        labelLine={false}
                        animationDuration={600}
                      >
                        {chartData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                      </Pie>
                      <Tooltip formatter={(v: any) => [`${v} votes`]} />
                    </PieChart>
                  )}
              </ResponsiveContainer>

              {/* Inline vote breakdown */}
              <div className="mt-4 space-y-2">
                {result.votes.map((v, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="flex-1 text-sm font-semibold text-gray-800 truncate">{v.nominee}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${v.percentage}%`, background: COLORS[i % COLORS.length] }} />
                      </div>
                      <span className="text-xs font-bold text-gray-600 w-10 text-right">{v.count}v</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-center text-gray-400 py-8 text-sm">No votes recorded for this award yet</p>
          )}
        </div>
      )}
    </div>
  );
}
