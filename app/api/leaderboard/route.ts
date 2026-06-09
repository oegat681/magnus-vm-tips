import { NextResponse } from 'next/server'
import { getDb, initDb } from '@/lib/db'

export async function GET() {
  await initDb()
  const db = getDb()

  const [pRes, rRes, prRes] = await Promise.all([
    db.execute(`SELECT id, name FROM participants`),
    db.execute(`SELECT match_id, result FROM results`),
    db.execute(`SELECT participant_id, match_id, prediction FROM predictions`),
  ])

  const participants = pRes.rows as unknown as { id: number; name: string }[]
  const results = rRes.rows as unknown as { match_id: number; result: string }[]
  const predictions = prRes.rows as unknown as { participant_id: number; match_id: number; prediction: string }[]

  const resultMap = new Map(results.map(r => [r.match_id, r.result]))

  const leaderboard = participants.map(p => {
    const myPreds = predictions.filter(pr => pr.participant_id === p.id)
    let correct = 0, played = 0
    for (const pred of myPreds) {
      const actual = resultMap.get(pred.match_id)
      if (actual) { played++; if (pred.prediction === actual) correct++ }
    }
    return { name: p.name, correct, played, total: myPreds.length }
  })

  leaderboard.sort((a, b) => b.correct - a.correct || b.played - a.played)
  return NextResponse.json({ leaderboard, resultsCount: results.length })
}
