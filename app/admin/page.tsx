'use client'

import { useState, useEffect } from 'react'
import { ALL_MATCHES, STAGE_LABELS, type Match } from '@/lib/matches'
import Link from 'next/link'

type Prediction = '1' | 'X' | '2'

interface StoredResult {
  match_id: number
  result: string
  home_score: number | null
  away_score: number | null
}

interface Participant {
  id: number
  name: string
  created_at: string
}

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [results, setResults] = useState<Record<number, StoredResult>>({})
  const [saving, setSaving] = useState<number | null>(null)
  const [scores, setScores] = useState<Record<number, { home: string; away: string }>>({})
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState('')
  const [participants, setParticipants] = useState<Participant[]>([])
  const [deleting, setDeleting] = useState<number | null>(null)

  const loadParticipants = () => {
    fetch('/api/predictions')
      .then(r => r.json())
      .then((data: Participant[]) => setParticipants(data))
  }

  useEffect(() => {
    if (authed) {
      fetch('/api/results')
        .then(r => r.json())
        .then((data: StoredResult[]) => {
          const map: Record<number, StoredResult> = {}
          for (const r of data) map[r.match_id] = r
          setResults(map)
        })
      loadParticipants()
    }
  }, [authed])

  const handleDelete = async (p: Participant) => {
    if (!confirm(`Radera alla tippningar för ${p.name}?`)) return
    setDeleting(p.id)
    const res = await fetch('/api/predictions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, participantId: p.id }),
    })
    if (res.ok) loadParticipants()
    setDeleting(null)
  }

  const handleLogin = () => {
    fetch('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, matchId: -1, result: '1' }),
    }).then(r => {
      if (r.status === 401) { alert('Fel lösenord'); return }
      setAuthed(true)
    })
  }

  const handleSync = async () => {
    setSyncing(true)
    setSyncMsg('')
    const res = await fetch('/api/sync')
    const data = await res.json()
    if (res.ok) {
      setSyncMsg(`✅ ${data.synced} resultat hämtade!`)
      // Reload results
      const r = await fetch('/api/results')
      const d: StoredResult[] = await r.json()
      const map: Record<number, StoredResult> = {}
      for (const x of d) map[x.match_id] = x
      setResults(map)
    } else {
      setSyncMsg(`❌ ${data.error}`)
    }
    setSyncing(false)
  }

  const saveResult = async (match: Match, result: Prediction) => {
    setSaving(match.id)
    const sc = scores[match.id] || {}
    const res = await fetch('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password,
        matchId: match.id,
        result,
        homeScore: sc.home !== undefined ? parseInt(sc.home) : null,
        awayScore: sc.away !== undefined ? parseInt(sc.away) : null,
      }),
    })
    if (res.ok) {
      setResults(prev => ({
        ...prev,
        [match.id]: {
          match_id: match.id,
          result,
          home_score: sc.home !== undefined ? parseInt(sc.home) : null,
          away_score: sc.away !== undefined ? parseInt(sc.away) : null,
        }
      }))
    }
    setSaving(null)
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 flex items-center justify-center">
        <div className="bg-white/10 rounded-2xl p-8 border border-white/20 w-80">
          <h1 className="text-2xl font-black text-white mb-6 text-center">🔐 Admin</h1>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Lösenord"
            className="w-full bg-white/10 text-white placeholder-white/40 rounded-xl px-4 py-3 border border-white/20 focus:outline-none focus:border-yellow-400 mb-4"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-yellow-400 text-black font-bold py-3 rounded-xl"
          >
            Logga in
          </button>
          <Link href="/" className="block text-center text-green-300 text-sm mt-4">← Tillbaka</Link>
        </div>
      </div>
    )
  }

  const groupedByStage = [
    { label: 'Gruppspel', matches: ALL_MATCHES.filter(m => m.stage === 'group') },
    { label: STAGE_LABELS.round_of_32, matches: ALL_MATCHES.filter(m => m.stage === 'round_of_32') },
    { label: STAGE_LABELS.round_of_16, matches: ALL_MATCHES.filter(m => m.stage === 'round_of_16') },
    { label: STAGE_LABELS.quarterfinal, matches: ALL_MATCHES.filter(m => m.stage === 'quarterfinal') },
    { label: STAGE_LABELS.semifinal, matches: ALL_MATCHES.filter(m => m.stage === 'semifinal') },
    { label: STAGE_LABELS.third_place, matches: ALL_MATCHES.filter(m => m.stage === 'third_place') },
    { label: STAGE_LABELS.final, matches: ALL_MATCHES.filter(m => m.stage === 'final') },
  ]

  const enteredCount = Object.keys(results).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-black text-white">🔐 Mata in resultat</h1>
          <div className="flex items-center gap-3">
            <span className="text-green-300 text-sm">{enteredCount}/104 inmatade</span>
            <Link href="/" className="text-green-300 hover:text-white text-sm">← Topplista</Link>
          </div>
        </div>

        {/* Deltagare */}
        <div className="bg-white/10 rounded-2xl p-5 mb-5 border border-white/20">
          <h2 className="font-bold text-white mb-3">👥 Deltagare ({participants.length})</h2>
          {participants.length === 0 && (
            <p className="text-green-300 text-sm">Inga tippningar inlämnade än</p>
          )}
          <div className="space-y-2">
            {participants.map(p => (
              <div key={p.id} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-2 border border-white/10">
                <span className="text-white font-medium">{p.name}</span>
                <button
                  onClick={() => handleDelete(p)}
                  disabled={deleting === p.id}
                  className="text-red-400 hover:text-red-300 disabled:opacity-50 text-sm font-bold px-3 py-1 rounded-lg hover:bg-red-500/10 transition-colors"
                >
                  {deleting === p.id ? '...' : '🗑 Radera'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Auto-sync */}
        <div className="bg-white/10 rounded-2xl p-4 mb-5 border border-white/20 flex items-center gap-4">
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">🔄 Hämta resultat automatiskt</p>
            <p className="text-green-300 text-xs mt-0.5">Hämtar live-resultat från football-data.org</p>
            {syncMsg && <p className="text-sm mt-1 font-medium text-yellow-300">{syncMsg}</p>}
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-black font-bold px-4 py-2 rounded-xl text-sm whitespace-nowrap"
          >
            {syncing ? '⏳ Hämtar...' : '⚡ Synka nu'}
          </button>
        </div>

        <div className="space-y-5">
          {groupedByStage.map(({ label, matches }) => {
            if (matches.length === 0) return null
            const done = matches.filter(m => results[m.id]).length
            return (
              <div key={label} className="bg-white/10 rounded-2xl p-5 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-white text-lg">{label}</h2>
                  <span className={`text-xs px-2 py-1 rounded-full ${done === matches.length ? 'bg-green-500/30 text-green-300' : 'bg-white/10 text-green-400'}`}>
                    {done}/{matches.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {matches.map(match => {
                    const saved = results[match.id]
                    const sc = scores[match.id] || { home: '', away: '' }
                    return (
                      <div key={match.id} className={`rounded-xl p-3 border ${saved ? 'border-green-500/40 bg-green-500/10' : 'border-white/10 bg-white/5'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-green-400/60">M{match.matchNumber}</span>
                          <span className="text-white text-sm flex-1">
                            {match.homeTeam} vs {match.awayTeam}
                          </span>
                          {saved && (
                            <span className="text-green-300 text-xs font-bold">
                              ✓ {saved.home_score !== null ? `${saved.home_score}–${saved.away_score} (${saved.result})` : saved.result}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            placeholder="H"
                            value={sc.home}
                            onChange={e => setScores(prev => ({ ...prev, [match.id]: { ...sc, home: e.target.value } }))}
                            className="w-12 bg-white/10 text-white text-center rounded-lg px-2 py-1 text-sm border border-white/20"
                          />
                          <span className="text-white/40">–</span>
                          <input
                            type="number"
                            min="0"
                            placeholder="B"
                            value={sc.away}
                            onChange={e => setScores(prev => ({ ...prev, [match.id]: { ...sc, away: e.target.value } }))}
                            className="w-12 bg-white/10 text-white text-center rounded-lg px-2 py-1 text-sm border border-white/20"
                          />
                          <div className="flex gap-1 ml-2">
                            {(['1', 'X', '2'] as Prediction[]).map(opt => (
                              <button
                                key={opt}
                                onClick={() => saveResult(match, opt)}
                                disabled={saving === match.id}
                                className={`w-10 h-9 rounded-lg font-bold text-sm transition-all ${
                                  saved?.result === opt
                                    ? 'bg-green-400 text-black'
                                    : 'bg-white/10 text-white hover:bg-white/20'
                                }`}
                              >
                                {saving === match.id ? '…' : opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
