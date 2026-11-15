-- Migration: Profile and playlist item access rules
-- Date: 2026-11-06
--
-- public.profiles
--   * authenticated: full row for their own profile; admins read every profile.
--   * anon: no row access and no privilege on the email column. id and role stay
--     granted because row-level policies on other tables look up the caller's role.
--   * public.public_profiles exposes the fields anyone may read.
--
-- public.setlist_items
--   * read: parent playlist is public, or the caller owns it, or the caller is admin.
--   * write: caller owns the parent playlist, or is admin, or is gatekeeper and
--     the parent playlist is public. Checked for the old and the new row.

-- 1. Profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

REVOKE ALL ON public.profiles FROM anon;
GRANT SELECT (id, role) ON public.profiles TO anon;

-- Runs with the owner's rights, so it lists only fields that are safe for anyone.
-- Privileges are replaced because a simple view is writable by default.
CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = false, security_barrier = true) AS
SELECT id, full_name, avatar_url
FROM public.profiles;

REVOKE ALL ON public.public_profiles FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.public_profiles TO anon, authenticated, service_role;

-- 2. Who may edit the items of a playlist
CREATE OR REPLACE FUNCTION public.fn_can_edit_setlist(p_setlist_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.setlists s
    LEFT JOIN public.profiles p ON p.id = auth.uid()
    WHERE s.id = p_setlist_id
      AND (
        s.owner_id = auth.uid()
        OR p.role = 'admin'::public.user_role
        OR (s.is_public AND p.role = 'gatekeeper'::public.user_role)
      )
  );
$$;

REVOKE ALL ON FUNCTION public.fn_can_edit_setlist(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_can_edit_setlist(uuid) TO authenticated, service_role;

-- 3. Playlist items
DROP POLICY IF EXISTS "Allow public read access" ON public.setlist_items;
DROP POLICY IF EXISTS "Allow authenticated users to manage items" ON public.setlist_items;
DROP POLICY IF EXISTS "Auth users can insert setlist items" ON public.setlist_items;
DROP POLICY IF EXISTS "Auth users can update setlist items" ON public.setlist_items;
DROP POLICY IF EXISTS "Auth users can delete setlist items" ON public.setlist_items;
DROP POLICY IF EXISTS "Guests can read items of public setlists" ON public.setlist_items;
DROP POLICY IF EXISTS "Users can read items of visible setlists" ON public.setlist_items;
DROP POLICY IF EXISTS "Editors can insert setlist items" ON public.setlist_items;
DROP POLICY IF EXISTS "Editors can update setlist items" ON public.setlist_items;
DROP POLICY IF EXISTS "Editors can delete setlist items" ON public.setlist_items;

CREATE POLICY "Guests can read items of public setlists"
ON public.setlist_items FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM public.setlists s
    WHERE s.id = setlist_items.setlist_id
      AND s.is_public = true
  )
);

CREATE POLICY "Users can read items of visible setlists"
ON public.setlist_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.setlists s
    WHERE s.id = setlist_items.setlist_id
      AND (
        s.is_public = true
        OR s.owner_id = (SELECT auth.uid())
        OR (SELECT public.fn_is_admin())
      )
  )
);

CREATE POLICY "Editors can insert setlist items"
ON public.setlist_items FOR INSERT
TO authenticated
WITH CHECK (public.fn_can_edit_setlist(setlist_id));

CREATE POLICY "Editors can update setlist items"
ON public.setlist_items FOR UPDATE
TO authenticated
USING (public.fn_can_edit_setlist(setlist_id))
WITH CHECK (public.fn_can_edit_setlist(setlist_id));

CREATE POLICY "Editors can delete setlist items"
ON public.setlist_items FOR DELETE
TO authenticated
USING (public.fn_can_edit_setlist(setlist_id));
