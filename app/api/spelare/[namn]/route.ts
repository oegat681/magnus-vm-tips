import { NextRequest, NextResponse } from 'next/server'
import { getDb, initDb } from '@/lib/db'
import { GROUP_MATCHES } from '@/lib/matches'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ namn: string }> }) {
  const { namn } = await params
  await initDb()
  const db = getDb()

  const pRes = await db.execute({ sql: `SELECT id, name FROM participants WHERE name = ?`, args: [decodeURIComponent(namn)] })
  if (!pRes.rows.length) return NextResponse.json({ error: 'Hittades inte' }, { status: 404 })
  const participant = pRes.rows[0] as unknown as { id: number; name: string }

  const [predRes, resRes] = await Promise.all([
    db.execute({ sql: `SELECT match_id, prediction FROM predictions WHERE participant_id = ?`, args: [participant.id] }),
    db.execute(`SELECT match_id, result, home_score, away_score FROM results`),
  ])

  const predMap = new Map((predRes.rows as unknown as { match_id: number; prediction: string }[]).map(p => [p.match_id, p.prediction]))
  const resultMap = new Map((resRes.rows as unknown as { match_id: number; result: string; home_score: number | null; away_score: number | null }[]).map(r => [r.match_id, r]))

  const matchData = GROUP_MATCHES.map(m => {
    const prediction = predMap.get(m.id) || null
    const result = resultMap.get(m.id) || null
    const isCorrect = prediction && result ? prediction === result.result : null
    return { id: m.id, group: m.group, homeTeam: m.homeTeam, awayTeam: m.awayTeam, matchDate: m.matchDate, prediction, result: result?.result || null, homeScore: result?.home_score ?? null, awayScore: result?.away_score ?? null, isCorrect }
  })

  const played = matchData.filter(m => m.result).length
  const correct = matchData.filter(m => m.isCorrect).length
  return NextResponse.json({ name: participant.name, matchData, played, correct })
}
