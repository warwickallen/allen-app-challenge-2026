-- Add url column to apps table
ALTER TABLE apps ADD COLUMN IF NOT EXISTS url TEXT;
