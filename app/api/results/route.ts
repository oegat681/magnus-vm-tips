import { NextRequest, NextResponse } from 'next/server'
import { getDb, initDb } from '@/lib/db'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'magnus2026'

export async function POST(req: NextRequest) {
  try {
    const { password, matchId, result, homeScore, awayScore } = await req.json()
    if (password !== ADMIN_PASSWORD) return NextResponse.json({ error: 'Fel lösenord' }, { status: 401 })
    if (matchId === -1) return NextResponse.json({ success: true }) // login check

    await initDb()
    const db = getDb()
    await db.execute({
      sql: `INSERT OR REPLACE INTO results (match_id, result, home_score, away_score) VALUES (?, ?, ?, ?)`,
      args: [matchId, result, homeScore ?? null, awayScore ?? null],
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 })
  }
}

export async function GET() {
  await initDb()
  const db = getDb()
  const res = await db.execute(`SELECT * FROM results`)
  return NextResponse.json(res.rows)
}
