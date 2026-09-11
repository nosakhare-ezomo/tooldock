import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { sql } from "drizzle-orm";
import fs from "fs";
import path from "path";

let databaseUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || "file:./local.db";
let authToken = process.env.TURSO_AUTH_TOKEN;

// Vercel serverless functions are read-only except for /tmp
// If we are using Turso, we do not need to do this file copying hack!
if (process.env.VERCEL && !process.env.TURSO_DATABASE_URL) {
  const tmpDbPath = "/tmp/local.db";
  try {
    if (!fs.existsSync(tmpDbPath)) {
      const bundledDbPath = path.join(process.cwd(), "local.db");
      if (fs.existsSync(bundledDbPath)) {
        fs.copyFileSync(bundledDbPath, tmpDbPath);
      }
    }
    databaseUrl = `file:${tmpDbPath}`;
  } catch (e) {
    console.error("Failed to setup sqlite on vercel:", e);
  }
}

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsSqliteClient?: ReturnType<typeof createClient>;
};

export const client =
  globalForDb.__arenaNextJsSqliteClient ??
  createClient({ url: databaseUrl, authToken });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsSqliteClient = client;
}

export const db = drizzle(client);

let isDbInitialized = false;

export async function ensureDb() {
  if (isDbInitialized) return;
  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS games (id INTEGER PRIMARY KEY AUTOINCREMENT, pin TEXT NOT NULL UNIQUE, status TEXT NOT NULL DEFAULT 'lobby', current_question_index INTEGER NOT NULL DEFAULT 0, question_count INTEGER NOT NULL DEFAULT 0, host_token TEXT NOT NULL, quiz_id INTEGER, created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')));`);
    await db.run(sql`CREATE TABLE IF NOT EXISTS questions (id INTEGER PRIMARY KEY AUTOINCREMENT, game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE, question_index INTEGER NOT NULL DEFAULT 0, question_text TEXT NOT NULL, option_1 TEXT NOT NULL, option_2 TEXT NOT NULL, option_3 TEXT NOT NULL, option_4 TEXT NOT NULL, correct_option INTEGER NOT NULL, time_limit INTEGER NOT NULL DEFAULT 15, image_url TEXT, question_started_at INTEGER);`);
    await db.run(sql`CREATE TABLE IF NOT EXISTS players (id INTEGER PRIMARY KEY AUTOINCREMENT, game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE, nickname TEXT NOT NULL, avatar TEXT NOT NULL DEFAULT '🦊', score INTEGER NOT NULL DEFAULT 0, last_correct INTEGER, last_points INTEGER DEFAULT 0, streak INTEGER NOT NULL DEFAULT 0, power_up TEXT, is_frozen INTEGER NOT NULL DEFAULT 0, last_emote TEXT, last_emote_time INTEGER, created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')));`);
    await db.run(sql`CREATE TABLE IF NOT EXISTS answers (id INTEGER PRIMARY KEY AUTOINCREMENT, player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE, question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE, selected_option INTEGER NOT NULL, is_correct INTEGER NOT NULL, answer_time_ms INTEGER, created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')));`);
    await db.run(sql`CREATE TABLE IF NOT EXISTS quizzes (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, author TEXT NOT NULL DEFAULT 'Anonymous', created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')));`);
    await db.run(sql`CREATE TABLE IF NOT EXISTS quiz_questions (id INTEGER PRIMARY KEY AUTOINCREMENT, quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE, question_index INTEGER NOT NULL DEFAULT 0, question_text TEXT NOT NULL, option_1 TEXT NOT NULL, option_2 TEXT NOT NULL, option_3 TEXT NOT NULL, option_4 TEXT NOT NULL, correct_option INTEGER NOT NULL, time_limit INTEGER NOT NULL DEFAULT 15, image_url TEXT);`);

    // Safe column additions for existing tables (ignore errors if columns already exist)
    const safeAlter = async (statement: string) => {
      try { await db.run(sql.raw(statement)); } catch (e) { /* column already exists */ }
    };
    await safeAlter("ALTER TABLE players ADD COLUMN power_up TEXT;");
    await safeAlter("ALTER TABLE players ADD COLUMN is_frozen INTEGER NOT NULL DEFAULT 0;");
    await safeAlter("ALTER TABLE players ADD COLUMN last_emote TEXT;");
    await safeAlter("ALTER TABLE players ADD COLUMN last_emote_time INTEGER;");
    await safeAlter("ALTER TABLE games ADD COLUMN quiz_id INTEGER;");
    await safeAlter("ALTER TABLE quizzes ADD COLUMN author_id TEXT;");

    isDbInitialized = true;
  } catch (e) {
    console.error("Failed to init tables:", e);
  }
}
