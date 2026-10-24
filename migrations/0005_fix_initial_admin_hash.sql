-- Update the initial administrator hash to match the Workers-compatible 100000 PBKDF2 iterations.
-- Safe to run only for the seeded initial account; does not change other administrators.
UPDATE admins
SET password_hash = 'cVZPyUW+MrvFpfOTMgzVbXVgYjkyA7ANGQKcKIbArUY=',
    password_salt = 'eJQi0tlKlo8ErG4aljtwVA=='
WHERE username = 'tfbaiad';
