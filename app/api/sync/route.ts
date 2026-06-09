import { NextResponse } from 'next/server'
import { getDb, initDb } from '@/lib/db'
import { fetchWC2026Matches, apiResultToOurResult, normalizeTeamName } from '@/lib/footballApi'
import { GROUP_MATCHES } from '@/lib/matches'

function buildMatchLookup() {
  const map = new Map<string, number>()
  for (const m of GROUP_MATCHES) {
    map.set(`${m.homeTeam}|${m.awayTeam}`, m.id)
  }
  return map
}

export async function GET() {
  if (!process.env.FOOTBALL_API_KEY) {
    return NextResponse.json({ error: 'FOOTBALL_API_KEY saknas' }, { status: 500 })
  }
  try {
    const apiMatches = await fetchWC2026Matches()
    const lookup = buildMatchLookup()
    await initDb()
    const db = getDb()
    let synced = 0, skipped = 0

    for (const apiMatch of apiMatches) {
      if (apiMatch.status !== 'FINISHED') { skipped++; continue }
      const result = apiResultToOurResult(apiMatch.score.winner)
      if (!result) { skipped++; continue }
      const home = normalizeTeamName(apiMatch.homeTeam.name)
      const away = normalizeTeamName(apiMatch.awayTeam.name)
      const matchId = lookup.get(`${home}|${away}`)
      if (!matchId) { skipped++; continue }
      await db.execute({
        sql: `INSERT OR REPLACE INTO results (match_id, result, home_score, away_score) VALUES (?, ?, ?, ?)`,
        args: [matchId, result, apiMatch.score.fullTime.home, apiMatch.score.fullTime.away],
      })
      synced++
    }
    return NextResponse.json({ success: true, synced, skipped })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Fel' }, { status: 500 })
  }
}
