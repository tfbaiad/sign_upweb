-- Additive migration only: does not alter or delete existing tables/data.
CREATE TABLE IF NOT EXISTS player_accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  steam_id TEXT NOT NULL UNIQUE,
  player_id INTEGER UNIQUE REFERENCES players(id) ON DELETE SET NULL,
  account_role TEXT NOT NULL DEFAULT 'member' CHECK(account_role IN ('captain','member')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_player_accounts_player_id ON player_accounts(player_id);
CREATE TABLE IF NOT EXISTS player_sessions (
  token_hash TEXT PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES player_accounts(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_player_sessions_expiry ON player_sessions(expires_at);
CREATE TABLE IF NOT EXISTS payment_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL REFERENCES player_accounts(id) ON DELETE CASCADE,
  player_id INTEGER REFERENCES players(id) ON DELETE SET NULL,
  amount_cents INTEGER NOT NULL DEFAULT 1000 CHECK(amount_cents = 1000),
  payer_order_ref TEXT NOT NULL,
  payer_name TEXT NOT NULL DEFAULT '',
  paid_at_text TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','paid','rejected')),
  admin_note TEXT NOT NULL DEFAULT '',
  reviewed_by INTEGER REFERENCES admins(id) ON DELETE SET NULL,
  reviewed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_payment_orders_status ON payment_orders(status);
CREATE INDEX IF NOT EXISTS idx_payment_orders_account ON payment_orders(account_id);
CREATE TABLE IF NOT EXISTS teams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  captain_account_id INTEGER NOT NULL UNIQUE REFERENCES player_accounts(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'forming' CHECK(status IN ('forming','complete','locked')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS team_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  account_id INTEGER NOT NULL UNIQUE REFERENCES player_accounts(id) ON DELETE RESTRICT,
  roster_role TEXT NOT NULL CHECK(roster_role IN ('starter','substitute')),
  joined_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(team_id,account_id)
);
CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
CREATE TABLE IF NOT EXISTS matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  starts_at TEXT NOT NULL DEFAULT '',
  room_code TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK(status IN ('scheduled','live','finished','cancelled')),
  created_by INTEGER REFERENCES admins(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS match_teams (
  match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  PRIMARY KEY(match_id,team_id)
);
