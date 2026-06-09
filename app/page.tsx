'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface LeaderboardEntry {
  name: string
  correct: number
  played: number
  total: number
}

export default function Home() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [resultsCount, setResultsCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(r => r.json())
      .then(data => {
        setLeaderboard(data.leaderboard || [])
        setResultsCount(data.resultsCount || 0)
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen min-h-screen relative"
      style={{
        backgroundImage: 'url(/magnus.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative max-w-2xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-white tracking-tight">Magnus VM-tips</h1>
          <p className="text-red-300 mt-2 text-lg">USA · Kanada · Mexiko</p>
        </div>

        <div className="bg-black/50 backdrop-blur rounded-2xl p-6 mb-6 border border-white/20">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-white">Topplista</h2>
            <span className="text-red-300 text-sm">{resultsCount}/72 matcher spelade</span>
          </div>

          {loading && (
            <div className="text-center text-red-300 py-8">Laddar...</div>
          )}

          {!loading && leaderboard.length === 0 && (
            <div className="text-center text-red-300 py-8">
              <p className="text-lg">Inga tippningar än!</p>
              <p className="text-sm mt-1 opacity-70">Var först att tippa nedan</p>
            </div>
          )}

          {!loading && leaderboard.length > 0 && (
            <div className="space-y-3">
              {leaderboard.map((entry, i) => (
                <div
                  key={entry.name}
                  className={`flex items-center gap-4 p-4 rounded-xl ${
                    i === 0 ? 'bg-yellow-400/20 border border-yellow-400/40' :
                    i === 1 ? 'bg-gray-300/10 border border-gray-300/30' :
                    i === 2 ? 'bg-orange-400/10 border border-orange-400/30' :
                    'bg-white/5 border border-white/10'
                  }`}
                >
                  <span className="text-2xl w-8 text-center">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                  </span>
                  <Link href={`/spelare/${encodeURIComponent(entry.name)}`} className="flex-1 font-semibold text-white text-lg hover:underline">{entry.name}</Link>
                  <div className="text-right">
                    <div className="text-white font-bold text-xl">{entry.correct} rätt</div>
                    {entry.played > 0 && (
                      <div className="text-red-300 text-xs">{entry.played} spelade</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/tippa"
            className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold text-center py-4 rounded-xl text-lg transition-colors shadow-lg border border-red-400/30"
          >
            ✏️ Tippa nu!
          </Link>
          <Link
            href="/admin"
            className="text-red-900/60 hover:text-red-300/60 text-xs transition-colors px-2 py-1"
          >
            admin
          </Link>
        </div>

        <p className="text-center text-white/70 text-sm mt-6">
          Topplistan uppdateras när resultat matas in
        </p>
      </div>
    </div>
  )
}
