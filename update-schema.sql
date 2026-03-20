-- Add organizer_email column to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS organizer_email TEXT;

-- Update existing events with organizer email
UPDATE events SET organizer_email = 'alanwei1988@gmail.com' WHERE organizer_email IS NULL;
