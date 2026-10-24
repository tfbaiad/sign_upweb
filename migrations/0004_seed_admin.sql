-- Seed the requested initial administrator. Password is stored as PBKDF2-SHA256 hash, not plaintext.
INSERT OR IGNORE INTO admins (username, password_hash, password_salt)
VALUES ('tfbaiad', 'wFgExS7BAxIvu4LnAj5Jj0dBOV489qWccCqZQKQ/Vh8=', 'eJQi0tlKlo8ErG4aljtwVA==');
