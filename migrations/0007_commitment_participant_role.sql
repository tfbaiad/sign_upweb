-- Add a role choice to commitment submissions without deleting or rewriting existing records.
ALTER TABLE commitment_submissions
ADD COLUMN participant_role TEXT NOT NULL DEFAULT 'member'
CHECK (participant_role IN ('captain', 'member'));
