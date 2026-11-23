-- Migration: Write rules for profiles, categories, playlists and song versions
-- Date: 2026-11-06
--
-- public.profiles
--   * id, email and created_at change only in a trusted server context (service
--     role, auth triggers, migrations). role changes there or through an admin.
--   * authenticated keeps editing the other fields of their own row.
--   * Rows are created only by the new-user trigger.
--
-- public.categories
--   * admin manages categories.
--   * Signed-in users may add an artist sub-category, and the Artists parent if it
--     does not exist yet: saving a song creates them through the user's session.
--
-- public.setlists
--   * title, description and is_public are the editable fields. owner_id is fixed.
--
-- public.song_versions
--   * Versions are added to songs the caller owns or, as admin, manages.
--   * A version stays on its song and keeps its contributor.
--
-- The explicit transaction keeps this file atomic: the migrator treats a line starting
-- with BEGIN as an explicit block, and the function bodies below have such lines.

BEGIN;

-- 1. Profiles: fields per role. A trigger is used because admin and member share
--    the authenticated database role, so column privileges cannot tell them apart.
CREATE OR REPLACE FUNCTION public.fn_guard_profile_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  -- API callers run as anon or authenticated. Every other role is a trusted context.
  IF current_user NOT IN ('anon', 'authenticated') THEN
    RETURN NEW;
  END IF;

  IF NEW.id IS DISTINCT FROM OLD.id
    OR NEW.email IS DISTINCT FROM OLD.email
    OR NEW.created_at IS DISTINCT FROM OLD.created_at
  THEN
    RAISE EXCEPTION 'This profile field cannot be changed' USING ERRCODE = '42501';
  END IF;

  IF NEW.role IS DISTINCT FROM OLD.role AND NOT public.fn_is_admin() THEN
    RAISE EXCEPTION 'This profile field cannot be changed' USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.fn_guard_profile_fields() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_guard_profile_fields ON public.profiles;
CREATE TRIGGER trg_guard_profile_fields
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.fn_guard_profile_fields();

REVOKE INSERT, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.profiles FROM authenticated;

DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (public.fn_is_admin())
WITH CHECK (public.fn_is_admin());

-- New profiles always start with the default role.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'member'::public.user_role);
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- 2. Categories
DROP POLICY IF EXISTS "Allow admins/members to manage categories" ON public.categories;
DROP POLICY IF EXISTS "Admins/Members can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Admins/Members can update categories" ON public.categories;
DROP POLICY IF EXISTS "Admins/Members can delete categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON public.categories;
DROP POLICY IF EXISTS "Users can add artist categories" ON public.categories;

CREATE POLICY "Admins can insert categories"
ON public.categories FOR INSERT
TO authenticated
WITH CHECK (public.fn_is_admin());

CREATE POLICY "Admins can update categories"
ON public.categories FOR UPDATE
TO authenticated
USING (public.fn_is_admin())
WITH CHECK (public.fn_is_admin());

CREATE POLICY "Admins can delete categories"
ON public.categories FOR DELETE
TO authenticated
USING (public.fn_is_admin());

CREATE POLICY "Users can add artist categories"
ON public.categories FOR INSERT
TO authenticated
WITH CHECK (
  (parent_id IS NULL AND slug = 'artists' AND name = 'Artists')
  OR (
    slug LIKE 'artist-%'
    AND parent_id = (SELECT c.id FROM public.categories c WHERE c.slug = 'artists')
  )
);

-- 3. Playlists. A policy cannot compare a row with its previous value, so column
--    privileges keep owner_id fixed.
DROP POLICY IF EXISTS "Owners can update setlists" ON public.setlists;
CREATE POLICY "Owners can update setlists"
ON public.setlists FOR UPDATE
TO authenticated
USING (owner_id = (SELECT auth.uid()))
WITH CHECK (owner_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Admins and Gatekeepers can update public setlists" ON public.setlists;
CREATE POLICY "Admins and Gatekeepers can update public setlists"
ON public.setlists FOR UPDATE
TO authenticated
USING (
  is_public = true
  AND (SELECT role::text FROM public.profiles WHERE id = (SELECT auth.uid())) IN ('admin', 'gatekeeper')
)
WITH CHECK (
  is_public = true
  AND (SELECT role::text FROM public.profiles WHERE id = (SELECT auth.uid())) IN ('admin', 'gatekeeper')
);

REVOKE UPDATE ON public.setlists FROM anon, authenticated;
GRANT UPDATE (title, description, is_public) ON public.setlists TO authenticated;

-- 4. Song versions
DROP POLICY IF EXISTS "Users can insert versions" ON public.song_versions;
DROP POLICY IF EXISTS "Allow public insert versions" ON public.song_versions;
DROP POLICY IF EXISTS "Allow authenticated insert versions" ON public.song_versions;
DROP POLICY IF EXISTS "Song managers can insert versions" ON public.song_versions;

CREATE POLICY "Song managers can insert versions"
ON public.song_versions FOR INSERT
TO authenticated
WITH CHECK (
  contributor_id = (SELECT auth.uid())
  AND public.fn_check_song_manage_access(composition_id)
);

REVOKE UPDATE ON public.song_versions FROM anon, authenticated;
GRANT UPDATE (
  version_name,
  content_chordpro,
  melody_notation,
  key,
  capo,
  tuning,
  soundcloud_url,
  youtube_url,
  spotify_url
) ON public.song_versions TO authenticated;

COMMIT;
