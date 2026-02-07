import Database from "better-sqlite3";

const db = new Database("dryfire.db");

db.exec(`
CREATE TABLE IF NOT EXISTS sessions (
  userId TEXT,
  sessionNumber INTEGER,
  title TEXT,
  description TEXT,
  duration TEXT,
  timestamp INTEGER
);
// Add duration column if missing
try {
  db.prepare("ALTER TABLE sessions ADD COLUMN duration TEXT").run();
} catch {}

CREATE TABLE IF NOT EXISTS streaks (
  userId TEXT PRIMARY KEY,
  streak INTEGER,
  lastSessionDate TEXT
);
`);

export default db;
