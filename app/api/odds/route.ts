import { NextResponse } from 'next/server'
import { normalizeTeamName } from '@/lib/footballApi'

const API_KEY = process.env.ODDS_API_KEY || ''

interface OddsMatch {
  id: string
  home_team: string
  away_team: string
  commence_time: string
  bookmakers: Array<{
    markets: Array<{
      key: string
      outcomes: Array<{ name: string; price: number }>
    }>
  }>
}

export interface MatchOdds {
  homeTeam: string
  awayTeam: string
  commenceTime: string
  home: number   // decimal odds
  draw: number
  away: number
  homeProb: number  // implied probability %
  drawProb: number
  awayProb: number
  favorite: '1' | 'X' | '2'
}

// Cache in memory for 1 hour
let cache: { data: MatchOdds[]; ts: number } | null = null
const CACHE_MS = 60 * 60 * 1000

export async function GET() {
  if (!API_KEY) {
    return NextResponse.json({ error: 'ODDS_API_KEY saknas i .env.local' }, { status: 500 })
  }

  if (cache && Date.now() - cache.ts < CACHE_MS) {
    return NextResponse.json(cache.data)
  }

  try {
    const res = await fetch(
      `https://api.the-odds-api.com/v4/sports/soccer_fifa_world_cup/odds/?apiKey=${API_KEY}&regions=eu&markets=h2h&oddsFormat=decimal`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) throw new Error(`Odds API error: ${res.status}`)
    const matches: OddsMatch[] = await res.json()

    const result: MatchOdds[] = matches.map(m => {
      // Average odds across bookmakers
      let homeSum = 0, drawSum = 0, awaySum = 0, count = 0
      for (const bm of m.bookmakers) {
        const h2h = bm.markets.find(mk => mk.key === 'h2h')
        if (!h2h) continue
        const homeOdds = h2h.outcomes.find(o => o.name === m.home_team)?.price
        const drawOdds = h2h.outcomes.find(o => o.name === 'Draw')?.price
        const awayOdds = h2h.outcomes.find(o => o.name === m.away_team)?.price
        if (homeOdds && drawOdds && awayOdds) {
          homeSum += homeOdds; drawSum += drawOdds; awaySum += awayOdds; count++
        }
      }
      if (count === 0) return null
      const home = homeSum / count
      const draw = drawSum / count
      const away = awaySum / count
      // Implied prob (normalize to remove overround)
      const rawHome = 1 / home, rawDraw = 1 / draw, rawAway = 1 / away
      const total = rawHome + rawDraw + rawAway
      const homeProb = Math.round((rawHome / total) * 100)
      const drawProb = Math.round((rawDraw / total) * 100)
      const awayProb = Math.round((rawAway / total) * 100)
      const favorite = homeProb >= drawProb && homeProb >= awayProb ? '1'
        : awayProb >= drawProb ? '2' : 'X'
      return {
        homeTeam: normalizeTeamName(m.home_team),
        awayTeam: normalizeTeamName(m.away_team),
        commenceTime: m.commence_time,
        home: Math.round(home * 100) / 100,
        draw: Math.round(draw * 100) / 100,
        away: Math.round(away * 100) / 100,
        homeProb, drawProb, awayProb, favorite,
      }
    }).filter(Boolean) as MatchOdds[]

    cache = { data: result, ts: Date.now() }
    return NextResponse.json(result)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Okänt fel'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
