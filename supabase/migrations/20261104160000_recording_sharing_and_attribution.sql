-- Migration: Private Song Sharing & Recording Attribution
-- Date: 2026-11-04

-- 1. Add visibility, consent, and singer attribution columns to user_recordings
ALTER TABLE public.user_recordings
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS singer_consent_confirmed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS singer_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS singer_name text,
  ADD COLUMN IF NOT EXISTS singer_email text;

-- 2. Create recording_shares table
CREATE TABLE IF NOT EXISTS public.recording_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id uuid NOT NULL REFERENCES public.user_recordings(id) ON DELETE CASCADE,
  shared_with_user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_recording_shares UNIQUE (recording_id, shared_with_user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_recording_shares_user ON public.recording_shares(shared_with_user_id);
CREATE INDEX IF NOT EXISTS idx_recording_shares_recording ON public.recording_shares(recording_id);
CREATE INDEX IF NOT EXISTS idx_user_recordings_public ON public.user_recordings(song_version_id) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_user_recordings_singer ON public.user_recordings(singer_profile_id) WHERE singer_profile_id IS NOT NULL;

-- Helper SECURITY DEFINER functions to prevent RLS recursion
CREATE OR REPLACE FUNCTION public.is_recording_owner(p_recording_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_recordings
    WHERE id = p_recording_id
    AND user_id = p_user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.has_recording_share(p_recording_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.recording_shares
    WHERE recording_id = p_recording_id
    AND shared_with_user_id = p_user_id
  );
$$;

-- 3. Enable RLS on recording_shares
ALTER TABLE public.recording_shares ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow owners and recipients to read shares" ON public.recording_shares;
CREATE POLICY "Allow owners and recipients to read shares" ON public.recording_shares FOR SELECT TO authenticated
USING (
  shared_with_user_id = auth.uid()
  OR public.is_recording_owner(recording_id, auth.uid())
);

DROP POLICY IF EXISTS "Allow owners to insert shares" ON public.recording_shares;
CREATE POLICY "Allow owners to insert shares" ON public.recording_shares FOR INSERT TO authenticated
WITH CHECK (
  public.is_recording_owner(recording_id, auth.uid())
);

DROP POLICY IF EXISTS "Allow owners and recipients to delete shares" ON public.recording_shares;
CREATE POLICY "Allow owners and recipients to delete shares" ON public.recording_shares FOR DELETE TO authenticated
USING (
  shared_with_user_id = auth.uid()
  OR public.is_recording_owner(recording_id, auth.uid())
);

GRANT ALL ON public.recording_shares TO authenticated;

-- 4. Update user_recordings SELECT policy for sharing & public visibility
DROP POLICY IF EXISTS "Allow users to read their own recordings" ON public.user_recordings;
DROP POLICY IF EXISTS "Allow users to read accessible recordings" ON public.user_recordings;
CREATE POLICY "Allow users to read accessible recordings" ON public.user_recordings FOR SELECT TO authenticated
USING (
  auth.uid() = user_id
  OR is_public = true
  OR public.has_recording_share(id, auth.uid())
);

DROP POLICY IF EXISTS "Allow public to read public recordings" ON public.user_recordings;
CREATE POLICY "Allow public to read public recordings" ON public.user_recordings FOR SELECT TO anon
USING (is_public = true);

-- 5. Storage policies for rehearsals bucket (accessible signed streaming URLs)
DROP POLICY IF EXISTS "Allow authenticated users to read their own rehearsals" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to read accessible rehearsals" ON storage.objects;
CREATE POLICY "Allow authenticated users to read accessible rehearsals" ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'rehearsals'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.user_recordings ur
      WHERE ur.storage_path = name
      AND (
        ur.is_public = true
        OR public.has_recording_share(ur.id, auth.uid())
      )
    )
  )
);

DROP POLICY IF EXISTS "Allow public to read public rehearsals" ON storage.objects;
CREATE POLICY "Allow public to read public rehearsals" ON storage.objects FOR SELECT TO anon
USING (
  bucket_id = 'rehearsals'
  AND EXISTS (
    SELECT 1 FROM public.user_recordings ur
    WHERE ur.storage_path = name
    AND ur.is_public = true
  )
);

-- 6. Helper RPC function for secure user lookup
CREATE OR REPLACE FUNCTION public.search_users_for_sharing(search_term text)
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  avatar_url text,
  is_musician boolean,
  role public.user_role
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.email,
    p.full_name,
    p.avatar_url,
    p.role IN ('musician', 'expert') AS is_musician,
    p.role
  FROM public.profiles p
  WHERE
    char_length(trim(search_term)) >= 2
    AND (
      p.email ILIKE ('%' || trim(search_term) || '%')
      OR p.full_name ILIKE ('%' || trim(search_term) || '%')
    )
  LIMIT 10;
$$;

-- 7. Profiles policies for singer attribution and shared recording contacts
DROP POLICY IF EXISTS "Allow reading singer profiles" ON public.profiles;
CREATE POLICY "Allow reading singer profiles" ON public.profiles FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_recordings ur
    WHERE ur.singer_profile_id = profiles.id
    AND (
      ur.is_public = true
      OR ur.user_id = auth.uid()
      OR public.has_recording_share(ur.id, auth.uid())
    )
  )
);

DROP POLICY IF EXISTS "Allow reading shared recording users" ON public.profiles;
CREATE POLICY "Allow reading shared recording users" ON public.profiles FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.recording_shares rs
    WHERE (rs.shared_with_user_id = profiles.id AND public.is_recording_owner(rs.recording_id, auth.uid()))
       OR (rs.shared_with_user_id = auth.uid() AND public.is_recording_owner(rs.recording_id, profiles.id))
  )
);

DROP POLICY IF EXISTS "Allow public reading public singer profiles" ON public.profiles;
CREATE POLICY "Allow public reading public singer profiles" ON public.profiles FOR SELECT TO anon
USING (
  EXISTS (
    SELECT 1 FROM public.user_recordings ur
    WHERE ur.singer_profile_id = profiles.id
    AND ur.is_public = true
  )
);

