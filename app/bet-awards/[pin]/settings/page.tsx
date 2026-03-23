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

// ── AwardCard ─────────────────────────────────────────────────────────────────
interface AwardCardProps {
  award: Award;
  index: number;
  onUpdateNominees: (awardId: string, nominees: string[]) => void;
  onDelete: (awardId: string) => void;
}

function AwardCard({ award, index, onUpdateNominees, onDelete }: AwardCardProps) {
  const [mode, setMode] = useState<'view' | 'single' | 'bulk'>('view');
  const [singleInput, setSingleInput] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const nominees = award.nominees;

  const addSingle = () => {
    const name = singleInput.trim();
    if (!name) return;
    onUpdateNominees(award._id, [...nominees, name]);
    setSingleInput('');
  };

  const applyBulk = () => {
    const names = bulkInput
      .split(/[\n,]+/)
      .map(n => n.trim())
      .filter(Boolean);
    if (!names.length) return;
    // Merge with existing, avoid duplicates
    const merged = [...new Set([...nominees, ...names])];
    onUpdateNominees(award._id, merged);
    setBulkInput('');
    setMode('view');
  };

  const removeNominee = (idx: number) => {
    onUpdateNominees(award._id, nominees.filter((_, i) => i !== idx));
  };

  const startEdit = (idx: number) => {
    setEditingIdx(idx);
    setEditValue(nominees[idx]);
  };

  const saveEdit = () => {
    if (editingIdx === null) return;
    const updated = [...nominees];
    updated[editingIdx] = editValue.trim() || nominees[editingIdx];
    onUpdateNominees(award._id, updated);
    setEditingIdx(null);
  };

  const badgeColor = nominees.length === 0
    ? 'bg-red-100 text-red-600'
    : nominees.length < 3
    ? 'bg-yellow-100 text-yellow-700'
    : 'bg-green-100 text-green-700';

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
      {/* Card header */}
      <div className="flex items-center gap-4 p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="w-10 h-10 rounded-xl bg-teal-50 border-2 border-teal-200 flex items-center justify-center flex-shrink-0">
          <span className="text-xl">{award.emoji || '🏆'}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-gray-900 text-lg leading-tight">{award.title}</h3>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
              {nominees.length} nominees
            </span>
          </div>
          <p className="text-gray-500 text-sm truncate">{award.description}</p>
        </div>
        <button
          onClick={() => onDelete(award._id)}
          className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 font-bold border border-red-200 transition-colors flex-shrink-0"
        >
          Remove
        </button>
      </div>

      {/* Nominees list */}
      <div className="p-5">
        {nominees.length === 0 ? (
          <p className="text-sm text-gray-400 italic text-center py-3 border-2 border-dashed border-gray-200 rounded-lg mb-4">
            No nominees yet — add some below
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 mb-4">
            {nominees.map((n, idx) => (
              <div key={idx} className="group flex items-center gap-1 bg-gray-100 rounded-lg px-3 py-1.5 border border-gray-200">
                {editingIdx === idx ? (
                  <>
                    <input
                      autoFocus
                      className="bg-transparent text-sm font-medium text-gray-900 outline-none w-28"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingIdx(null); }}
                    />
                    <button onClick={saveEdit} className="text-teal-600 font-bold text-xs ml-1">✓</button>
                    <button onClick={() => setEditingIdx(null)} className="text-gray-400 font-bold text-xs">✕</button>
                  </>
                ) : (
                  <>
                    <span
                      className="text-sm font-semibold text-gray-800 cursor-pointer hover:text-teal-700 transition-colors"
                      onClick={() => startEdit(idx)}
                      title="Click to edit"
                    >
                      {n}
                    </span>
                    <button
                      onClick={() => removeNominee(idx)}
                      className="text-gray-300 group-hover:text-red-400 transition-colors ml-1 text-base leading-none font-bold"
                    >
                      ×
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add controls */}
        {mode === 'view' && (
          <div className="flex gap-2">
            <button
              onClick={() => setMode('single')}
              className="flex-1 py-2.5 rounded-lg border-2 border-dashed border-teal-300 text-teal-600 font-bold text-sm hover:bg-teal-50 transition-colors"
            >
              + Add One
            </button>
            <button
              onClick={() => { setMode('bulk'); setBulkInput(nominees.join('\n')); }}
              className="flex-1 py-2.5 rounded-lg border-2 border-dashed border-orange-300 text-orange-600 font-bold text-sm hover:bg-orange-50 transition-colors"
            >
              📋 Bulk Edit
            </button>
          </div>
        )}

        {mode === 'single' && (
          <div className="flex gap-2">
            <input
              autoFocus
              type="text"
              value={singleInput}
              onChange={e => setSingleInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addSingle(); if (e.key === 'Escape') setMode('view'); }}
              placeholder="Type a name and press Enter…"
              className="flex-1 px-4 py-2.5 border-2 border-teal-300 rounded-lg text-sm font-medium text-black focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all"
            />
            <button onClick={addSingle} disabled={!singleInput.trim()} className="px-4 py-2.5 bg-teal-500 text-white rounded-lg font-bold text-sm disabled:opacity-40 hover:bg-teal-600 transition-colors">Add</button>
            <button onClick={() => setMode('view')} className="px-3 py-2.5 bg-gray-100 text-gray-600 rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors">✕</button>
          </div>
        )}

        {mode === 'bulk' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">
                One name per line, or comma-separated — existing list is pre-loaded, edit freely
              </label>
              <textarea
                autoFocus
                value={bulkInput}
                onChange={e => setBulkInput(e.target.value)}
                rows={5}
                placeholder={`John Kamau\nMary Wanjiku\nPeter Otieno`}
                className="w-full px-4 py-3 border-2 border-orange-300 rounded-lg text-sm font-medium text-black focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={applyBulk}
                className="flex-1 py-2.5 bg-orange-500 text-white rounded-lg font-bold text-sm hover:bg-orange-600 transition-colors shadow"
              >
                ✓ Apply List
              </button>
              <button
                onClick={() => { setMode('view'); setBulkInput(''); }}
                className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
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
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newEmoji, setNewEmoji] = useState('🏆');
  const [dirty, setDirty] = useState(false);
  const [resettingVotes, setResettingVotes] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const sr = await fetch(`/api/sessions/by-code/${resolvedParams.pin}`);
      if (!sr.ok) { setError('Session not found.'); setLoading(false); return; }
      const sd = await sr.json();
      setSessionInfo(sd.session);
      const ar = await fetch(`/api/sessions/${sd.session.id}/awards`);
      if (ar.ok) setAwards((await ar.json()).awards || []);
      setLoading(false);
    } catch { setError('Failed to load session data'); setLoading(false); }
  }, [resolvedParams.pin]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateNominees = (awardId: string, nominees: string[]) => {
    setAwards(prev => prev.map(a => a._id === awardId ? { ...a, nominees } : a));
    setDirty(true);
  };

  const deleteAward = async (awardId: string) => {
    if (!confirm('Remove this award? This cannot be undone.')) return;
    const res = await fetch(`/api/sessions/${sessionInfo.id}/awards/${awardId}`, { method: 'DELETE' });
    if (res.ok) { showSuccess('Award removed.'); fetchData(); }
    else setError('Failed to delete award.');
  };

  const addAward = async () => {
    if (!newTitle.trim()) { setError('Title is required'); return; }
    const res = await fetch(`/api/sessions/${sessionInfo.id}/awards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle, description: newDesc || `Vote for ${newTitle}`, emoji: newEmoji, type: 'voting', timeLimit: 30, order: awards.length })
    });
    if (res.ok) { showSuccess('Award added!'); setNewTitle(''); setNewDesc(''); setNewEmoji('🏆'); setShowAddAward(false); fetchData(); }
    else setError('Failed to add award.');
  };

  const saveSettings = async () => {
    setSaving(true); setError(''); setSuccess('');
    try {
      await Promise.all(awards.map(a =>
        fetch(`/api/sessions/${sessionInfo.id}/awards/${a._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nominees: a.nominees })
        })
      ));
      setDirty(false);
      showSuccess('All changes saved!');
    } catch { setError('Failed to save changes.'); }
    finally { setSaving(false); }
  };

  const showSuccess = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };

  const resetVoting = async () => {
    if (!confirm('Reset ALL votes for this session? Every voter will be able to vote again.')) return;
    setResettingVotes(true);
    try {
      const res = await fetch(`/api/sessions/${sessionInfo.id}/reset-votes`, { method: 'DELETE' });
      if (res.ok) showSuccess('All votes have been reset. Voters can vote again.');
      else setError('Failed to reset votes.');
    } catch { setError('Failed to reset votes.'); }
    finally { setResettingVotes(false); }
  };

  const totalNominees = awards.reduce((s, a) => s + a.nominees.length, 0);
  const awardsReady = awards.filter(a => a.nominees.length >= 2).length;

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FFE5D9 0%, #D4F1F4 50%, #FFFACD 100%)', fontFamily: "'Quicksand', sans-serif" }}>
      <div className="text-center">
        <Image src="/podium.gif" alt="Loading" width={100} height={100} unoptimized className="object-contain mx-auto mb-4" />
        <p className="text-gray-700 font-semibold">Loading session…</p>
      </div>
    </div>
  );

  if (error && !sessionInfo) return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #FFE5D9 0%, #D4F1F4 50%, #FFFACD 100%)', fontFamily: "'Quicksand', sans-serif" }}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <p className="text-4xl mb-4">⚠️</p>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Session Not Found</h2>
        <p className="text-gray-500 mb-6 text-sm">{error}</p>
        <button onClick={() => router.push('/bet-awards')} className="px-6 py-3 bg-teal-500 text-white rounded-lg font-bold hover:bg-teal-600 transition-colors">Go Back</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-32" style={{ background: 'linear-gradient(135deg, #FFE5D9 0%, #D4F1F4 50%, #FFFACD 100%)', fontFamily: "'Quicksand', sans-serif" }}>

      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => router.push('/bet-awards')} className="text-gray-500 hover:text-gray-900 font-bold text-sm flex-shrink-0">← Back</button>
            <div className="w-px h-5 bg-gray-300" />
            <div className="min-w-0">
              <p className="font-black text-gray-900 truncate text-sm">{sessionInfo?.name}</p>
              <p className="text-xs text-gray-400 font-mono">PIN {resolvedParams.pin}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-3 text-xs text-gray-500 font-semibold mr-2">
              <span>{awards.length} awards</span>
              <span>·</span>
              <span>{totalNominees} nominees</span>
              <span>·</span>
              <span className={awardsReady === awards.length && awards.length > 0 ? 'text-green-600' : 'text-orange-500'}>
                {awardsReady}/{awards.length} ready
              </span>
            </div>
            <button
              onClick={saveSettings}
              disabled={saving || !dirty}
              className="px-4 py-2 rounded-lg font-bold text-sm transition-all disabled:opacity-40"
              style={{ background: dirty ? 'linear-gradient(135deg, #4ECDC4, #45B7D1)' : '#E5E7EB', color: dirty ? '#fff' : '#9CA3AF' }}
            >
              {saving ? 'Saving…' : dirty ? '💾 Save Changes' : 'Saved ✓'}
            </button>
            <button
              onClick={resetVoting}
              disabled={resettingVotes}
              className="px-3 py-2 rounded-lg font-bold text-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #FEE2E2, #FECACA)', color: '#B91C1C', border: '1.5px solid #FCA5A5' }}
              title="Reset all votes for this session"
            >
              <Image src="/stop.gif" alt="Reset" width={20} height={20} unoptimized style={{ objectFit: 'contain' }} />
              {resettingVotes ? 'Resetting…' : 'Reset Votes'}
            </button>
            <button
              onClick={async () => {
                const res = await fetch(`/api/sessions/${sessionInfo.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'active' }) });
                if (res.ok) router.push(`/bet-awards/${resolvedParams.pin}`);
              }}
              className="px-4 py-2 rounded-lg font-bold text-sm text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}
            >
              ▶ Start Voting
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">

        {/* Toast messages */}
        {success && (
          <div className="bg-green-50 border-2 border-green-400 text-green-800 px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow">
            ✅ {success}
          </div>
        )}
        {error && sessionInfo && (
          <div className="bg-red-50 border-2 border-red-400 text-red-700 px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow">
            ⚠️ {error}
          </div>
        )}

        {/* Progress overview */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <h2 className="font-black text-gray-900 mb-3 text-base">Setup Progress</h2>
          <div className="grid grid-cols-3 gap-3 text-center mb-4">
            <div className="bg-teal-50 rounded-xl p-3 border border-teal-200">
              <p className="text-2xl font-black text-teal-700">{awards.length}</p>
              <p className="text-xs text-teal-600 font-semibold">Awards</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-3 border border-orange-200">
              <p className="text-2xl font-black text-orange-700">{totalNominees}</p>
              <p className="text-xs text-orange-600 font-semibold">Total Nominees</p>
            </div>
            <div className={`rounded-xl p-3 border ${awardsReady === awards.length && awards.length > 0 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
              <p className={`text-2xl font-black ${awardsReady === awards.length && awards.length > 0 ? 'text-green-700' : 'text-yellow-700'}`}>{awardsReady}/{awards.length}</p>
              <p className={`text-xs font-semibold ${awardsReady === awards.length && awards.length > 0 ? 'text-green-600' : 'text-yellow-600'}`}>Ready (2+ nominees)</p>
            </div>
          </div>
          {awards.length > 0 && (
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(awardsReady / awards.length) * 100}%`, background: 'linear-gradient(90deg, #4ECDC4, #22C55E)' }}
              />
            </div>
          )}
        </div>

        {/* Add Award Panel */}
        {showAddAward ? (
          <div className="bg-white rounded-2xl shadow-md border-2 border-orange-300 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-gray-900">New Award Category</h3>
              <button onClick={() => setShowAddAward(false)} className="text-gray-400 hover:text-gray-700 font-bold text-xl">×</button>
            </div>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="relative">
                  <input
                    type="text"
                    value={newEmoji}
                    onChange={e => setNewEmoji(e.target.value)}
                    className="w-16 h-14 text-center text-2xl border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:outline-none"
                    maxLength={2}
                    placeholder="🏆"
                  />
                </div>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addAward()}
                  placeholder="Award title e.g. Best Dressed"
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-semibold text-black focus:border-orange-400 focus:outline-none transition-all"
                  autoFocus
                />
              </div>
              <input
                type="text"
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                placeholder="Description (optional) e.g. Who always looks runway ready?"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm text-black focus:border-orange-400 focus:outline-none transition-all"
              />
              <div className="flex gap-2">
                <button onClick={addAward} disabled={!newTitle.trim()} className="flex-1 py-3 rounded-xl font-bold text-sm text-white disabled:opacity-40 transition-colors" style={{ background: 'linear-gradient(135deg, #F97316, #EC4899)' }}>
                  Create Award
                </button>
                <button onClick={() => setShowAddAward(false)} className="px-5 py-3 rounded-xl font-bold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddAward(true)}
            className="w-full py-4 rounded-2xl border-2 border-dashed border-orange-300 text-orange-500 font-bold text-sm hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-lg">+</span> Add New Award Category
          </button>
        )}

        {/* Award Cards */}
        {awards.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
            <Image src="/magic-wand.png" alt="Empty" width={64} height={64} className="mx-auto mb-4 object-contain opacity-50" />
            <h3 className="text-lg font-bold text-gray-900 mb-1">No award categories yet</h3>
            <p className="text-gray-400 text-sm">Add your first category above to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {awards.map((award, i) => (
              <AwardCard
                key={award._id}
                award={award}
                index={i}
                onUpdateNominees={updateNominees}
                onDelete={deleteAward}
              />
            ))}
          </div>
        )}
      </div>

      {/* Sticky bottom save bar (shown when dirty) */}
      {dirty && (
        <div className="fixed bottom-0 left-0 right-0 z-30 p-4 bg-white/95 backdrop-blur-md border-t-2 border-teal-300 shadow-2xl">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <p className="text-sm font-bold text-gray-700">⚠️ You have unsaved changes</p>
            <button
              onClick={saveSettings}
              disabled={saving}
              className="px-8 py-3 rounded-xl font-black text-white text-sm disabled:opacity-50 transition-all"
              style={{ background: 'linear-gradient(135deg, #4ECDC4, #45B7D1)' }}
            >
              {saving ? 'Saving…' : '💾 Save All Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
