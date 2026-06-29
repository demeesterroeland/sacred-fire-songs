-- Migration: Private Rehearsals Storage & User Recordings Table
-- Date: 2026-06-29

-- 1. Storage Setup for Private Rehearsals
-- Create rehearsals bucket (public = false)
INSERT INTO storage.buckets (id, name, public)
VALUES ('rehearsals', 'rehearsals', false) ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage objects if not already enabled (by default it is enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to upload (insert) files to rehearsals inside their own folder
DROP POLICY IF EXISTS "Allow authenticated users to upload rehearsals" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload rehearsals" ON storage.objects FOR
INSERT TO authenticated WITH CHECK (
    bucket_id = 'rehearsals'
    AND (storage.foldername(name)) [1] = auth.uid()::text
  );

-- Allow authenticated users to read (select) their own rehearsal files
DROP POLICY IF EXISTS "Allow authenticated users to read their own rehearsals" ON storage.objects;
CREATE POLICY "Allow authenticated users to read their own rehearsals" ON storage.objects FOR
SELECT TO authenticated USING (
    bucket_id = 'rehearsals'
    AND (storage.foldername(name)) [1] = auth.uid()::text
  );

-- Allow authenticated users to update their own rehearsal files
DROP POLICY IF EXISTS "Allow authenticated users to update their own rehearsals" ON storage.objects;
CREATE POLICY "Allow authenticated users to update their own rehearsals" ON storage.objects FOR
UPDATE TO authenticated USING (
    bucket_id = 'rehearsals'
    AND (storage.foldername(name)) [1] = auth.uid()::text
  );

-- Allow authenticated users to delete their own rehearsal files
DROP POLICY IF EXISTS "Allow authenticated users to delete their own rehearsals" ON storage.objects;
CREATE POLICY "Allow authenticated users to delete their own rehearsals" ON storage.objects FOR
DELETE TO authenticated USING (
    bucket_id = 'rehearsals'
    AND (storage.foldername(name)) [1] = auth.uid()::text
  );


-- 2. User Recordings Metadata Table
CREATE TABLE IF NOT EXISTS public.user_recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    song_version_id UUID NOT NULL REFERENCES public.song_versions(id) ON DELETE CASCADE,
    recording_name TEXT NOT NULL,
    storage_path TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on public.user_recordings
ALTER TABLE public.user_recordings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to select/read their own recording metadata
DROP POLICY IF EXISTS "Allow users to read their own recordings" ON public.user_recordings;
CREATE POLICY "Allow users to read their own recordings" ON public.user_recordings FOR
SELECT TO authenticated USING (auth.uid() = user_id);

-- Allow authenticated users to insert their own recording metadata
DROP POLICY IF EXISTS "Allow users to insert their own recordings" ON public.user_recordings;
CREATE POLICY "Allow users to insert their own recordings" ON public.user_recordings FOR
INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to delete their own recording metadata
DROP POLICY IF EXISTS "Allow users to delete their own recordings" ON public.user_recordings;
CREATE POLICY "Allow users to delete their own recordings" ON public.user_recordings FOR
DELETE TO authenticated USING (auth.uid() = user_id);

-- Grant privileges to authenticated role
GRANT ALL ON public.user_recordings TO authenticated;
