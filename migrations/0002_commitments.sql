CREATE TABLE IF NOT EXISTS commitment_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  school TEXT NOT NULL,
  player_name TEXT NOT NULL,
  team_name TEXT NOT NULL,
  qq TEXT NOT NULL,
  signed_date TEXT NOT NULL,
  agreed INTEGER NOT NULL DEFAULT 1 CHECK (agreed = 1),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_commitments_school ON commitment_submissions(school);
CREATE INDEX IF NOT EXISTS idx_commitments_created_at ON commitment_submissions(created_at);
