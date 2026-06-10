'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GROUP_MATCHES, type Match } from '@/lib/matches'
import type { MatchOdds } from '@/app/api/odds/route'

type Prediction = '1' | 'X' | '2'

const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']

function MatchRow({ match, value, onChange, odds }: {
  match: Match
  value: Prediction | undefined
  onChange: (v: Prediction) => void
  odds?: MatchOdds
}) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-white/10 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="text-white text-sm font-medium truncate">
          {match.homeTeam} <span className="text-red-400">vs</span> {match.awayTeam}
        </div>
        {match.matchDate && (
          <div className="text-red-400/60 text-xs mt-0.5">
            {new Date(match.matchDate).toLocaleDateString('sv-SE', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
        )}
        {odds && (
          <div className="flex gap-2 mt-1">
            {([['1','Hem'], ['X','Oav'], ['2','Bort']] as const).map(([opt, label], i) => {
              const probs = [odds.homeProb, odds.drawProb, odds.awayProb]
              const prob = probs[i]
              const maxProb = Math.max(...probs)
              const isFav = prob === maxProb
              return (
                <span key={opt} className={`text-xs px-1.5 py-0.5 rounded font-medium ${isFav ? 'bg-yellow-400/20 text-yellow-300 font-bold' : 'bg-white/5 text-white/40'}`}>
                  {label} {prob}%
                </span>
              )
            })}
          </div>
        )}
      </div>
      <div className="flex gap-1 shrink-0">
        {(['1', 'X', '2'] as Prediction[]).map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => value === opt ? onChange(null as unknown as Prediction) : onChange(opt)}
            className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
              value === opt
                ? 'bg-yellow-400 text-black scale-110 shadow-lg'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {opt}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onChange((['1', 'X', '2'] as Prediction[])[Math.floor(Math.random() * 3)])}
          className="w-10 h-10 rounded-lg text-sm transition-all bg-white/5 hover:bg-white/15 text-white/40 hover:text-white/80"
          title="Slumpa"
        >
          🎲
        </button>
      </div>
    </div>
  )
}

export default function TippaPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [predictions, setPredictions] = useState<Record<number, Prediction>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [oddsMap, setOddsMap] = useState<Record<string, MatchOdds>>({})

  const groupMatches = GROUP_MATCHES

  useEffect(() => {
    fetch('/api/odds')
      .then(r => r.json())
      .then((data: MatchOdds[]) => {
        if (!Array.isArray(data)) return
        const map: Record<string, MatchOdds> = {}
        for (const o of data) {
          map[`${o.homeTeam}|${o.awayTeam}`] = o
        }
        setOddsMap(map)
      })
      .catch(() => {}) // odds är frivilligt
  }, [])

  const totalMatches = groupMatches.length
  const filledCount = Object.keys(predictions).length

  const setPred = (matchId: number, val: Prediction | null) => {
    setPredictions(prev => {
      const updated = { ...prev }
      if (val === null) delete updated[matchId]
      else updated[matchId] = val
      return updated
    })
  }

  const fillRemaining = (val: Prediction) => {
    const updates: Record<number, Prediction> = {}
    for (const m of groupMatches) {
      if (!predictions[m.id]) updates[m.id] = val
    }
    setPredictions(prev => ({ ...prev, ...updates }))
  }

  const randomizeAll = () => {
    const opts: Prediction[] = ['1', 'X', '2']
    const updates: Record<number, Prediction> = {}
    for (const m of groupMatches) {
      updates[m.id] = opts[Math.floor(Math.random() * 3)]
    }
    setPredictions(updates)
  }

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Fyll i ditt namn!'); return }
    if (filledCount < totalMatches) {
      setError(`Du har ${totalMatches - filledCount} matcher kvar att tippa!`)
      return
    }
    setSubmitting(true)
    setError('')
    const res = await fetch('/api/predictions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), predictions }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Något gick fel')
      setSubmitting(false)
    } else {
      router.push(`/spelare/${encodeURIComponent(name.trim())}`)
    }
  }

  const renderGroupMatches = () => {
    return GROUPS.map(g => {
      const matches = groupMatches.filter(m => m.group === g)
      const filled = matches.filter(m => predictions[m.id]).length
      return (
        <div key={g} className="bg-black/50 rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-white text-lg">Grupp {g}</h3>
            <span className={`text-xs px-2 py-1 rounded-full ${filled === 6 ? 'bg-red-500/30 text-red-300' : 'bg-white/10 text-red-400'}`}>
              {filled}/6
            </span>
          </div>
          {matches.map(m => {
            const odds = oddsMap[`${m.homeTeam}|${m.awayTeam}`] || (() => {
              // Kolla omvänd ordning och flippa sannolikheterna
              const flipped = oddsMap[`${m.awayTeam}|${m.homeTeam}`]
              if (!flipped) return undefined
              return { ...flipped, homeTeam: m.homeTeam, awayTeam: m.awayTeam, home: flipped.away, away: flipped.home, homeProb: flipped.awayProb, awayProb: flipped.homeProb, favorite: flipped.favorite === '1' ? '2' : flipped.favorite === '2' ? '1' : 'X' } as typeof flipped
            })()
            return (
            <MatchRow key={m.id} match={m} value={predictions[m.id]} onChange={v => setPred(m.id, v)} odds={odds} />
            )
          })}
        </div>
      )
    })
  }

  return (
    <div className="min-h-screen relative"
      style={{
        backgroundImage: 'url(/magnus.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black text-white">✏️ Magnus VM-tips</h1>
          <p className="text-red-300 mt-1">Välj 1 (hemmaseger), X (oavgjort) eller 2 (bortaseger)</p>
        </div>

        {/* Namn */}
        <div className="bg-black/50 rounded-2xl p-5 mb-5 border border-white/20">
          <label className="block text-white font-semibold mb-2">Ditt namn</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Skriv ditt namn..."
            className="w-full bg-white/10 text-white placeholder-white/40 rounded-xl px-4 py-3 text-lg border border-white/20 focus:outline-none focus:border-red-400"
          />
        </div>

        {/* Progress — sticky */}
        <div className="sticky top-0 z-10 bg-black/50 backdrop-blur rounded-2xl p-4 mb-5 border border-white/20 shadow-lg">
          <div className="flex justify-between text-sm text-red-300 mb-2">
            <span>Tippade matcher</span>
            <span className="font-bold text-white">{filledCount} / {totalMatches}</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-yellow-400 h-2 rounded-full transition-all"
              style={{ width: `${(filledCount / totalMatches) * 100}%` }}
            />
          </div>
        </div>

        {/* Fyll i alla snabbt */}
        <div className="flex flex-wrap gap-2 mb-5 text-sm items-center">
          <span className="text-red-300 self-center">Fyll ej tippade:</span>
          {(['1', 'X', '2'] as Prediction[]).map(v => (
            <button key={v} onClick={() => fillRemaining(v)} type="button"
              className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-lg font-bold border border-white/20">
              Alla {v}
            </button>
          ))}
          <button onClick={randomizeAll} type="button"
            className="ml-auto bg-purple-500/30 hover:bg-purple-500/50 text-purple-200 px-4 py-1 rounded-lg font-bold border border-purple-400/30 flex items-center gap-1">
            🎲 Slumpa alla
          </button>
        </div>

        {/* Matcher */}
        <div className="space-y-4 mb-6">
          {renderGroupMatches()}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/20 border border-red-400/40 text-red-300 rounded-xl p-4 mb-4">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black text-xl py-5 rounded-2xl transition-colors shadow-xl border border-red-400/30"
        >
          {submitting ? 'Sparar...' : `🚀 Skicka in mina tippningar (${filledCount}/${totalMatches})`}
        </button>

        <p className="text-center text-red-400/50 text-xs mt-4">
          Du kan bara skicka in en gång per namn
        </p>
      </div>
    </div>
  )
}
