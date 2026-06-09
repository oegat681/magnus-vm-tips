import { createClient } from '@libsql/client'

let client: ReturnType<typeof createClient> | null = null

export function getDb() {
  if (!client) {
    client = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!,
    })
  }
  return client
}

export async function initDb() {
  const db = getDb()
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS results (
      match_id INTEGER PRIMARY KEY,
      result TEXT NOT NULL,
      home_score INTEGER,
      away_score INTEGER,
      entered_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS predictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      participant_id INTEGER NOT NULL REFERENCES participants(id),
      match_id INTEGER NOT NULL,
      prediction TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(participant_id, match_id)
    );
  `)
}
