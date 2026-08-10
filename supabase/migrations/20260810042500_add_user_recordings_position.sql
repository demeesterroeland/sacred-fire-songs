-- Migration: Add Position Column & Update RLS Policy to User Recordings Table
-- Date: 2026-08-10

-- 1. Add position column for custom drag-and-drop sorting
ALTER TABLE public.user_recordings 
ADD COLUMN IF NOT EXISTS position INT NOT NULL DEFAULT 0;

-- 2. Allow authenticated users to update their own recording metadata (position/name)
DROP POLICY IF EXISTS "Allow users to update their own recordings" ON public.user_recordings;
CREATE POLICY "Allow users to update their own recordings" ON public.user_recordings FOR
UPDATE TO authenticated USING (auth.uid() = user_id);
