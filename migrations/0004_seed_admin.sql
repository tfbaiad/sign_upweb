-- Seed the requested initial administrator. Password is stored as PBKDF2-SHA256 hash, not plaintext.
INSERT OR IGNORE INTO admins (username, password_hash, password_salt)
VALUES ('tfbaiad', 'cVZPyUW+MrvFpfOTMgzVbXVgYjkyA7ANGQKcKIbArUY=', 'eJQi0tlKlo8ErG4aljtwVA==');
