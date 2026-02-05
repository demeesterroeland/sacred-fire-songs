-- Migration: Enable Profile Updates and Avatar Storage
-- Date: 2026-02-05
-- 1. Profiles Table RLS Fixes
-- Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR
UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
-- Allow everyone to read profiles (to see names/avatars across the app)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR
SELECT TO public USING (true);
-- 2. Storage Setup
-- Create avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
-- Allow users to upload their own avatar
-- Logic: path should be 'user_id/filename'
DROP POLICY IF EXISTS "Allow authenticated users to upload avatars" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload avatars" ON storage.objects FOR
INSERT TO authenticated WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name)) [1] = auth.uid()::text
  );
-- Allow users to update/delete their own avatar
DROP POLICY IF EXISTS "Allow authenticated users to update their own avatars" ON storage.objects;
CREATE POLICY "Allow authenticated users to update their own avatars" ON storage.objects FOR
UPDATE TO authenticated USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name)) [1] = auth.uid()::text
  );
DROP POLICY IF EXISTS "Allow authenticated users to delete their own avatars" ON storage.objects;
CREATE POLICY "Allow authenticated users to delete their own avatars" ON storage.objects FOR DELETE TO authenticated USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name)) [1] = auth.uid()::text
);
-- Allow public read access to avatars
DROP POLICY IF EXISTS "Allow public read access to avatars" ON storage.objects;
CREATE POLICY "Allow public read access to avatars" ON storage.objects FOR
SELECT TO public USING (bucket_id = 'avatars');