'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']

interface MatchData {
  id: number
  group: string
  homeTeam: string
  awayTeam: string
  matchDate: string | null
  prediction: string | null
  result: string | null
  homeScore: number | null
  awayScore: number | null
  isCorrect: boolean | null
}

interface PlayerData {
  name: string
  matchData: MatchData[]
  played: number
  correct: number
}

export default function SpelarePage() {
  const { namn } = useParams<{ namn: string }>()
  const [data, setData] = useState<PlayerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/spelare/${namn}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error)
        else setData(d)
        setLoading(false)
      })
  }, [namn])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundImage: 'url(/magnus.png)', backgroundSize: 'cover' }}>
      <div className="absolute inset-0 bg-black/40" />
      <p className="relative text-white text-xl">Laddar...</p>
    </div>
  )

  if (error || !data) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundImage: 'url(/magnus.png)', backgroundSize: 'cover' }}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative text-center">
        <p className="text-white text-xl mb-4">Spelaren hittades inte</p>
        <Link href="/" className="text-red-300 underline">← Tillbaka</Link>
      </div>
    </div>
  )

  const accuracy = data.played > 0 ? Math.round((data.correct / data.played) * 100) : null

  return (
    <div className="min-h-screen relative"
      style={{ backgroundImage: 'url(/magnus.png)', backgroundSize: 'cover', backgroundPosition: 'center top' }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="text-center mb-6">
          <Link href="/" className="text-white/50 hover:text-white text-sm mb-4 block">← Topplista</Link>
          <h1 className="text-3xl font-black text-white">{data.name}</h1>
          <p className="text-red-300 mt-1">VM-tippning 2026</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-black/50 rounded-2xl p-4 border border-white/20 text-center">
            <div className="text-3xl font-black text-white">{data.correct}</div>
            <div className="text-red-300 text-xs mt-1">Rätt</div>
          </div>
          <div className="bg-black/50 rounded-2xl p-4 border border-white/20 text-center">
            <div className="text-3xl font-black text-white">{data.played}</div>
            <div className="text-red-300 text-xs mt-1">Spelade</div>
          </div>
          <div className="bg-black/50 rounded-2xl p-4 border border-white/20 text-center">
            <div className="text-3xl font-black text-white">{accuracy !== null ? `${accuracy}%` : '—'}</div>
            <div className="text-red-300 text-xs mt-1">Träffsäkerhet</div>
          </div>
        </div>

        {/* Matcher per grupp */}
        <div className="space-y-4">
          {GROUPS.map(g => {
            const matches = data.matchData.filter(m => m.group === g)
            const groupCorrect = matches.filter(m => m.isCorrect).length
            const groupPlayed = matches.filter(m => m.result).length
            return (
              <div key={g} className="bg-black/50 rounded-2xl p-4 border border-white/20">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-white">Grupp {g}</h2>
                  {groupPlayed > 0 && (
                    <span className="text-xs text-red-300">{groupCorrect}/{groupPlayed} rätt</span>
                  )}
                </div>
                <div className="space-y-2">
                  {matches.map(m => (
                    <div key={m.id} className={`flex items-center gap-3 py-2 border-b border-white/10 last:border-0`}>
                      {/* Resultat-indikator */}
                      <div className="w-5 text-center shrink-0">
                        {m.isCorrect === true && <span className="text-green-400 text-sm">✓</span>}
                        {m.isCorrect === false && <span className="text-red-400 text-sm">✗</span>}
                        {m.isCorrect === null && <span className="text-white/20 text-sm">·</span>}
                      </div>

                      {/* Matchinfo */}
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm truncate">
                          {m.homeTeam} <span className="text-white/40">vs</span> {m.awayTeam}
                        </div>
                        {m.result && m.homeScore !== null && (
                          <div className="text-white/50 text-xs mt-0.5">
                            {m.homeScore}–{m.awayScore}
                          </div>
                        )}
                      </div>

                      {/* Tippning */}
                      <div className="flex items-center gap-2 shrink-0">
                        {m.result && (
                          <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                            m.result === '1' ? 'bg-white/10' : m.result === 'X' ? 'bg-white/10' : 'bg-white/10'
                          } text-white/50`}>
                            {m.result}
                          </span>
                        )}
                        <span className={`text-sm font-black px-3 py-1 rounded-lg ${
                          m.isCorrect === true ? 'bg-green-500/30 text-green-300' :
                          m.isCorrect === false ? 'bg-red-500/20 text-red-400' :
                          'bg-white/10 text-white'
                        }`}>
                          {m.prediction || '—'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-white/40 hover:text-white text-sm">← Tillbaka till topplistan</Link>
        </div>
      </div>
    </div>
  )
}
