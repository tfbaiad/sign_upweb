CREATE TABLE IF NOT EXISTS players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_name TEXT NOT NULL,
  steam_id TEXT NOT NULL UNIQUE,
  qq TEXT NOT NULL,
  backup_phone TEXT NOT NULL DEFAULT '',
  rank TEXT NOT NULL,
  school TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_players_school ON players(school);
CREATE INDEX IF NOT EXISTS idx_players_created_at ON players(created_at);
