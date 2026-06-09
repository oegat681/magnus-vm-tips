// football-data.org API integration for WC 2026

const API_BASE = 'https://api.football-data.org/v4'
const API_KEY = process.env.FOOTBALL_API_KEY || ''

export interface ApiMatch {
  id: number
  utcDate: string
  status: 'SCHEDULED' | 'TIMED' | 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'SUSPENDED' | 'POSTPONED' | 'CANCELLED' | 'AWARDED'
  stage: string
  group: string | null
  homeTeam: { name: string; shortName: string; tla: string }
  awayTeam: { name: string; shortName: string; tla: string }
  score: {
    winner: 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW' | null
    fullTime: { home: number | null; away: number | null }
    halfTime: { home: number | null; away: number | null }
  }
}

export async function fetchWC2026Matches(): Promise<ApiMatch[]> {
  const res = await fetch(`${API_BASE}/competitions/WC/matches?season=2026`, {
    headers: { 'X-Auth-Token': API_KEY },
    next: { revalidate: 60 }, // cache 60s
  })
  if (!res.ok) throw new Error(`football-data API error: ${res.status}`)
  const data = await res.json()
  return data.matches as ApiMatch[]
}

export function apiResultToOurResult(winner: ApiMatch['score']['winner']): '1' | 'X' | '2' | null {
  if (winner === 'HOME_TEAM') return '1'
  if (winner === 'DRAW') return 'X'
  if (winner === 'AWAY_TEAM') return '2'
  return null
}

// Map football-data.org team names to our Swedish names
export const TEAM_NAME_MAP: Record<string, string> = {
  // Group A
  'Mexico': 'Mexiko',
  'South Africa': 'Sydafrika',
  'Korea Republic': 'Sydkorea',
  'South Korea': 'Sydkorea',
  'Czechia': 'Tjeckien',
  'Czech Republic': 'Tjeckien',
  // Group B
  'Canada': 'Kanada',
  'Bosnia and Herzegovina': 'Bosnien-Hercegovina',
  'Bosnia & Herzegovina': 'Bosnien-Hercegovina',
  'Qatar': 'Qatar',
  'Switzerland': 'Schweiz',
  // Group C
  'Brazil': 'Brasilien',
  'Morocco': 'Marocko',
  'Haiti': 'Haiti',
  'Scotland': 'Skottland',
  // Group D
  'USA': 'USA',
  'United States': 'USA',
  'Paraguay': 'Paraguay',
  'Australia': 'Australien',
  'Türkiye': 'Turkiet',
  'Turkey': 'Turkiet',
  // Group E
  'Germany': 'Tyskland',
  'Curaçao': 'Curaçao',
  "Côte d'Ivoire": 'Elfenbenskusten',
  'Ivory Coast': 'Elfenbenskusten',
  'Ecuador': 'Ecuador',
  // Group F
  'Netherlands': 'Nederländerna',
  'Japan': 'Japan',
  'Sweden': 'Sverige',
  'Tunisia': 'Tunisien',
  // Group G
  'Belgium': 'Belgien',
  'Egypt': 'Egypten',
  'Iran': 'Iran',
  'New Zealand': 'Nya Zeeland',
  // Group H
  'Spain': 'Spanien',
  'Cape Verde': 'Kap Verde',
  'Cabo Verde': 'Kap Verde',
  'Saudi Arabia': 'Saudiarabien',
  'Uruguay': 'Uruguay',
  // Group I
  'France': 'Frankrike',
  'Senegal': 'Senegal',
  'Iraq': 'Irak',
  'Norway': 'Norge',
  // Group J
  'Argentina': 'Argentina',
  'Algeria': 'Algeriet',
  'Austria': 'Österrike',
  'Jordan': 'Jordanien',
  // Group K
  'Portugal': 'Portugal',
  'DR Congo': 'DR Kongo',
  'Congo DR': 'DR Kongo',
  'Uzbekistan': 'Uzbekistan',
  'Colombia': 'Colombia',
  // Group L
  'England': 'England',
  'Croatia': 'Kroatien',
  'Ghana': 'Ghana',
  'Panama': 'Panama',
}

export function normalizeTeamName(name: string): string {
  return TEAM_NAME_MAP[name] || name
}
