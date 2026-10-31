CREATE TABLE IF NOT EXISTS announcements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_pinned INTEGER NOT NULL DEFAULT 0 CHECK(is_pinned IN (0,1)),
  created_by INTEGER REFERENCES admins(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_announcements_pinned_created ON announcements(is_pinned DESC, created_at DESC);
