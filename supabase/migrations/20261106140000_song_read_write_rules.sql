-- Migration: Song and version access rules, for every way a database can have been built
-- Date: 2026-11-06
--
-- Databases set up from docs/design/db-schema.sql did not get these rules from the migrations.
-- This file makes the end state the same, whatever the starting point.
--
-- public.compositions and public.song_versions
--   * read: public songs for everyone; own songs and, as admin, all songs when signed in.
--   * write: owners and admins for songs; contributors and admins for versions.
--
-- public.composition_categories was replaced by song_category_map and is no longer used.

ALTER TABLE public.compositions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.song_versions ENABLE ROW LEVEL SECURITY;

-- 1. Songs
DROP POLICY IF EXISTS "Public compositions are viewable by everyone" ON public.compositions;
DROP POLICY IF EXISTS "Allow public insert compositions" ON public.compositions;
DROP POLICY IF EXISTS "Allow public update compositions" ON public.compositions;
DROP POLICY IF EXISTS "Allow public delete compositions" ON public.compositions;

DROP POLICY IF EXISTS "Public songs are viewable by everyone" ON public.compositions;
CREATE POLICY "Public songs are viewable by everyone"
ON public.compositions FOR SELECT
TO public
USING (is_public = true);

DROP POLICY IF EXISTS "Authenticated users can view appropriate songs" ON public.compositions;
CREATE POLICY "Authenticated users can view appropriate songs"
ON public.compositions FOR SELECT
TO authenticated
USING (
  is_public = true
  OR owner_id = (select auth.uid())
  OR (select role from public.profiles where id = (select auth.uid())) = 'admin'
);

DROP POLICY IF EXISTS "Owners can manage their songs" ON public.compositions;
CREATE POLICY "Owners can manage their songs"
ON public.compositions FOR ALL
TO authenticated
USING (owner_id = (select auth.uid()))
WITH CHECK (owner_id = (select auth.uid()));

DROP POLICY IF EXISTS "Admins can manage all songs" ON public.compositions;
CREATE POLICY "Admins can manage all songs"
ON public.compositions FOR ALL
TO authenticated
USING ((select role from public.profiles where id = (select auth.uid())) = 'admin');

-- 2. Versions
DROP POLICY IF EXISTS "Public versions are viewable by everyone" ON public.song_versions;
DROP POLICY IF EXISTS "Allow public update versions" ON public.song_versions;
DROP POLICY IF EXISTS "Allow public delete versions" ON public.song_versions;

DROP POLICY IF EXISTS "Respect composition privacy for versions" ON public.song_versions;
CREATE POLICY "Respect composition privacy for versions"
ON public.song_versions FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.compositions c
    WHERE c.id = song_versions.composition_id
    AND c.is_public = true
  )
);

DROP POLICY IF EXISTS "Authenticated users can view appropriate versions" ON public.song_versions;
CREATE POLICY "Authenticated users can view appropriate versions"
ON public.song_versions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.compositions c
    WHERE c.id = song_versions.composition_id
    AND (
      c.is_public = true
      OR c.owner_id = (select auth.uid())
      OR (select role from public.profiles where id = (select auth.uid())) = 'admin'
    )
  )
);

DROP POLICY IF EXISTS "Allow contributors and admins to delete versions" ON public.song_versions;
CREATE POLICY "Allow contributors and admins to delete versions"
ON public.song_versions FOR DELETE
TO authenticated
USING (
  contributor_id = (select auth.uid())
  OR (select role from public.profiles where id = (select auth.uid())) = 'admin'
);

-- 3. Unused table
DROP TABLE IF EXISTS public.composition_categories;
