CREATE TABLE IF NOT EXISTS player_location_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_name TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  user_agent TEXT NOT NULL,
  accept_language TEXT NOT NULL DEFAULT '',
  browser_timezone TEXT NOT NULL DEFAULT '',
  browser_locale TEXT NOT NULL DEFAULT '',
  browser_local_time TEXT NOT NULL DEFAULT '',
  ip_country TEXT,
  ip_region TEXT,
  ip_city TEXT,
  ip_timezone TEXT,
  ip_continent TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_player_location_created_at ON player_location_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_player_location_name ON player_location_submissions(player_name);
