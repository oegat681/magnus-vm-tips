import { NextRequest, NextResponse } from 'next/server'
import { getDb, initDb } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { name, predictions } = await req.json()
    if (!name?.trim()) return NextResponse.json({ error: 'Namn saknas' }, { status: 400 })
    if (!predictions || typeof predictions !== 'object') return NextResponse.json({ error: 'Tippningar saknas' }, { status: 400 })

    const db = getDb()
    await initDb()

    await db.execute({ sql: `INSERT OR IGNORE INTO participants (name) VALUES (?)`, args: [name.trim()] })
    const res = await db.execute({ sql: `SELECT id FROM participants WHERE name = ?`, args: [name.trim()] })
    const participantId = res.rows[0].id as number

    const existing = await db.execute({ sql: `SELECT COUNT(*) as count FROM predictions WHERE participant_id = ?`, args: [participantId] })
    if ((existing.rows[0].count as number) > 0) {
      return NextResponse.json({ error: 'Du har redan lämnat in dina tippningar!' }, { status: 409 })
    }

    for (const [matchId, prediction] of Object.entries(predictions)) {
      if (['1', 'X', '2'].includes(prediction as string)) {
        await db.execute({
          sql: `INSERT OR REPLACE INTO predictions (participant_id, match_id, prediction) VALUES (?, ?, ?)`,
          args: [participantId, parseInt(matchId), prediction as string],
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 })
  }
}

export async function GET() {
  await initDb()
  const db = getDb()
  const res = await db.execute(`SELECT id, name, created_at FROM participants ORDER BY created_at`)
  return NextResponse.json(res.rows)
}

export async function DELETE(req: NextRequest) {
  try {
    const { password, participantId } = await req.json()
    if (password !== (process.env.ADMIN_PASSWORD || 'magnus2026')) {
      return NextResponse.json({ error: 'Fel lösenord' }, { status: 401 })
    }
    const db = getDb()
    await db.execute({ sql: `DELETE FROM predictions WHERE participant_id = ?`, args: [participantId] })
    await db.execute({ sql: `DELETE FROM participants WHERE id = ?`, args: [participantId] })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 })
  }
}
