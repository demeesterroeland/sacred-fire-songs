-- Add last_seen_at to profiles for tracking "new since last visit"
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;

-- Backfill existing users with current timestamp so they don't see all songs as "new"
UPDATE public.profiles SET last_seen_at = now() WHERE last_seen_at IS NULL;
