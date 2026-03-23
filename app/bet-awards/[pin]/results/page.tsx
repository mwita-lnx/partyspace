'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import confetti from 'canvas-confetti';

interface PageProps {
  params: Promise<{ pin: string }>;
}

interface AwardResult {
  awardId: string;
  awardTitle: string;
  awardEmoji: string;
  awardDescription: string;
  votes: {
    nominee: string;
    count: number;
    percentage: number;
  }[];
  totalVotes: number;
  winner: string | null;
}

const COLORS = ['#FFE66D', '#4ECDC4', '#FF6B6B', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3', '#A8D8EA'];

export default function BETAwardsResults({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [roomInfo, setRoomInfo] = useState<any>(null);
  const [results, setResults] = useState<AwardResult[]>([]);
  const [error, setError] = useState('');
  const [celebrationDone, setCelebrationDone] = useState(false);

  useEffect(() => {
    fetchResults();
  }, [resolvedParams.pin]);

  useEffect(() => {
    if (!celebrationDone && results.length > 0) {
      // Celebrate with confetti
      setTimeout(() => {
        confetti({
          particleCount: 200,
          spread: 120,
          origin: { y: 0.6 }
        });
      }, 500);
      setCelebrationDone(true);
    }
  }, [results, celebrationDone]);

  const fetchResults = async () => {
    try {
      // Fetch room info
      const roomResponse = await fetch(`/api/rooms/by-code/${resolvedParams.pin}`);
      if (!roomResponse.ok) {
        setError('Room not found');
        setLoading(false);
        return;
      }
      const roomData = await roomResponse.json();
      setRoomInfo(roomData.room);

      // Fetch results
      const resultsResponse = await fetch(`/api/bet-awards/${roomData.room.id}/results`);
      if (resultsResponse.ok) {
        const resultsData = await resultsResponse.json();
        setResults(resultsData.results || []);
      } else {
        setError('Failed to load results');
      }

      setLoading(false);
    } catch (err) {
      setError('Failed to load results');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FFE5D9 0%, #D4F1F4 50%, #FFFACD 100%)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold">Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-6"
      style={{
        background: 'linear-gradient(135deg, #FFE5D9 0%, #D4F1F4 50%, #FFFACD 100%)',
        fontFamily: "'Quicksand', sans-serif"
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 text-center">
          <div className="flex justify-center mb-4">
            <Image src="/podium.gif" alt="Results" width={80} height={80} unoptimized className="object-contain" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">BET Awards Results</h1>
          <p className="text-gray-600 text-lg">{roomInfo?.name}</p>
          <p className="text-gray-500 text-sm mt-2">PIN: {resolvedParams.pin}</p>
        </div>

        {error && (
          <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-center font-semibold">
            {error}
          </div>
        )}

        {results.length === 0 && !error && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Image src="/waiting.gif" alt="No results" width={120} height={120} unoptimized className="object-contain mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No votes yet!</h2>
            <p className="text-gray-600">Results will appear here once voting begins.</p>
          </div>
        )}

        {/* Results Cards */}
        <div className="space-y-8">
          {results.map((result, index) => (
            <ResultCard key={result.awardId} result={result} index={index} />
          ))}
        </div>

        {/* Back Button */}
        {results.length > 0 && (
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => router.push(`/room/${roomInfo?.id}/lobby`)}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Back to Lobby
            </button>
            <button
              onClick={fetchResults}
              className="px-6 py-3 text-white rounded-lg font-semibold transition-all"
              style={{ background: 'linear-gradient(135deg, #4ECDC4 0%, #45B7D1 100%)' }}
            >
              Refresh Results
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface ResultCardProps {
  result: AwardResult;
  index: number;
}

function ResultCard({ result, index }: ResultCardProps) {
  const [viewMode, setViewMode] = useState<'pie' | 'bar'>('pie');

  // Prepare data for charts
  const chartData = result.votes.map((vote, i) => ({
    name: vote.nominee,
    votes: vote.count,
    percentage: vote.percentage,
    fill: COLORS[i % COLORS.length]
  }));

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6" style={{ animationDelay: `${index * 100}ms` }}>
      {/* Award Header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2 mb-2">
          <span className="text-4xl">{result.awardEmoji}</span>
          <span>{result.awardTitle}</span>
        </h2>
        <p className="text-gray-600">{result.awardDescription}</p>
        <p className="text-gray-500 text-sm mt-2">Total Votes: {result.totalVotes}</p>
      </div>

      {/* Winner Announcement */}
      {result.winner && (
        <div className="mb-6 p-4 bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400 rounded-xl text-center">
          <p className="text-sm text-gray-600 font-semibold mb-1">WINNER</p>
          <p className="text-2xl font-bold text-gray-900">{result.winner}</p>
          <p className="text-sm text-gray-600 mt-1">
            {result.votes.find(v => v.nominee === result.winner)?.count} votes ({result.votes.find(v => v.nominee === result.winner)?.percentage.toFixed(1)}%)
          </p>
        </div>
      )}

      {/* View Toggle */}
      <div className="flex justify-center gap-2 mb-4">
        <button
          onClick={() => setViewMode('pie')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            viewMode === 'pie'
              ? 'bg-teal-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Pie Chart
        </button>
        <button
          onClick={() => setViewMode('bar')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            viewMode === 'bar'
              ? 'bg-teal-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Bar Chart
        </button>
      </div>

      {/* Charts */}
      {chartData.length > 0 ? (
        <div className="mt-6">
          {viewMode === 'pie' ? (
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: any) => `${props.name}: ${props.percentage.toFixed(1)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="votes"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="votes" fill="#4ECDC4" animationBegin={0} animationDuration={800}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      ) : (
        <p className="text-center text-gray-400 py-8">No votes for this award yet</p>
      )}

      {/* Vote Breakdown */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {result.votes.map((vote, i) => (
          <div
            key={i}
            className="p-3 rounded-lg border-2 flex items-center justify-between"
            style={{ borderColor: COLORS[i % COLORS.length], backgroundColor: `${COLORS[i % COLORS.length]}20` }}
          >
            <span className="font-semibold text-gray-900">{vote.nominee}</span>
            <div className="text-right">
              <div className="font-bold text-gray-900">{vote.count} votes</div>
              <div className="text-sm text-gray-600">{vote.percentage.toFixed(1)}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
