-- Profile e-mail privacy for recording sharing and singer attribution.
--
-- Recording sharing (20261104160000) let a signed-in user read whole profile rows of
-- singers and share partners, and the user search matched and returned e-mail
-- addresses. Names, avatars and the musician badge are public; e-mail addresses are
-- only for their owner, admins and trusted server code.
--
-- 1. public_profiles gains is_musician, so no caller needs a profiles row of someone else.
-- 2. The three row policies that exposed other people's profile rows are dropped.
-- 3. search_users_for_sharing matches a name, or an exact e-mail address, and never
--    returns an e-mail address.
-- 4. user_recordings.singer_email (an unregistered singer's address, typed by the owner)
--    is no longer selectable through the API; the owner reads it with
--    own_recording_singer_emails().
-- 5. Notifications and share e-mails name the sharer by name only, never by address.

BEGIN;

-- 1. Public profile fields.
CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = false, security_barrier = true) AS
SELECT id, full_name, avatar_url, (role IN ('musician', 'expert')) AS is_musician
FROM public.profiles;

REVOKE ALL ON public.public_profiles FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.public_profiles TO anon, authenticated, service_role;

-- 2. No more reads of other people's profile rows through sharing or attribution.
DROP POLICY IF EXISTS "Allow reading singer profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow reading shared recording users" ON public.profiles;
DROP POLICY IF EXISTS "Allow public reading public singer profiles" ON public.profiles;

-- 3. User search for sharing and attribution.
DROP FUNCTION IF EXISTS public.search_users_for_sharing(text);
CREATE FUNCTION public.search_users_for_sharing(search_term text)
RETURNS TABLE (
  id uuid,
  full_name text,
  avatar_url text,
  is_musician boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT p.id, p.full_name, p.avatar_url, p.role IN ('musician', 'expert')
    FROM public.profiles p
   WHERE auth.uid() IS NOT NULL
     AND p.id <> auth.uid()
     AND char_length(trim(search_term)) >= 2
     AND (
       p.full_name ILIKE ('%' || trim(search_term) || '%')
       OR lower(p.email) = lower(trim(search_term))
     )
   ORDER BY p.full_name NULLS LAST
   LIMIT 10;
$$;

REVOKE ALL ON FUNCTION public.search_users_for_sharing(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.search_users_for_sharing(text) TO authenticated, service_role;

-- 4. Singer e-mail addresses. Column privileges: every column except singer_email.
--    A new user_recordings column needs to be added to this list to be readable.
REVOKE SELECT ON public.user_recordings FROM anon, authenticated;
GRANT SELECT (
  id,
  user_id,
  song_version_id,
  recording_name,
  storage_path,
  position,
  created_at,
  file_size_bytes,
  duration_seconds,
  is_public,
  singer_consent_confirmed,
  singer_profile_id,
  singer_name
) ON public.user_recordings TO anon, authenticated;

-- A registered singer is named from the profile. Earlier saves copied that user's address into
-- singer_email, and into singer_name when the profile had no name; drop those copies.
UPDATE public.user_recordings ur
   SET singer_email = NULL,
       singer_name = CASE WHEN ur.singer_name = p.email THEN NULL ELSE ur.singer_name END
  FROM public.profiles p
 WHERE p.id = ur.singer_profile_id
   AND (ur.singer_email IS NOT NULL OR ur.singer_name = p.email);

CREATE OR REPLACE FUNCTION public.own_recording_singer_emails(p_recording_ids uuid[])
RETURNS TABLE (recording_id uuid, singer_email text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT ur.id, ur.singer_email
    FROM public.user_recordings ur
   WHERE ur.id = ANY (p_recording_ids)
     AND ur.user_id = auth.uid()
     AND ur.singer_email IS NOT NULL;
$$;

REVOKE ALL ON FUNCTION public.own_recording_singer_emails(uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.own_recording_singer_emails(uuid[]) TO authenticated, service_role;

-- 5. The sharer is named by name only (NULL when the profile has no name; the app shows a fallback).
CREATE OR REPLACE FUNCTION public.fn_notify_recording_shared()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner uuid;
  v_owner_name text;
  v_recording_name text;
  v_composition uuid;
  v_song_title text;
BEGIN
  BEGIN
    SELECT ur.user_id, ur.recording_name, sv.composition_id, c.title,
           NULLIF(p.full_name, '')
      INTO v_owner, v_recording_name, v_composition, v_song_title, v_owner_name
      FROM public.user_recordings ur
      JOIN public.song_versions sv ON sv.id = ur.song_version_id
      JOIN public.compositions c ON c.id = sv.composition_id
      LEFT JOIN public.profiles p ON p.id = ur.user_id
     WHERE ur.id = NEW.recording_id;

    INSERT INTO public.notifications (user_id, actor_id, type, recording_id, composition_id, metadata)
    VALUES (
      NEW.shared_with_user_id, v_owner, 'recording_shared', NEW.recording_id, v_composition,
      jsonb_build_object(
        'actor_name', v_owner_name,
        'song_title', v_song_title,
        'recording_name', v_recording_name
      )
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'fn_notify_recording_shared failed for share %: %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END;
$$;

-- Notifications already stored with an address as the sharer's name lose it.
UPDATE public.notifications n
   SET metadata = n.metadata - 'actor_name'
  FROM public.profiles p
 WHERE p.id = n.actor_id
   AND n.metadata ->> 'actor_name' = p.email;

CREATE OR REPLACE FUNCTION public.claim_recording_share_email(p_recording_id uuid, p_recipient_id uuid)
RETURNS TABLE (
  recipient_email text,
  recipient_name text,
  actor_name text,
  song_title text,
  recording_name text,
  composition_id uuid
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH claimed AS (
    UPDATE public.recording_shares rs
       SET email_sent_at = now()
     WHERE rs.recording_id = p_recording_id
       AND rs.shared_with_user_id = p_recipient_id
       AND rs.email_sent_at IS NULL
       AND public.is_recording_owner(rs.recording_id, auth.uid())
    RETURNING rs.recording_id, rs.shared_with_user_id
  )
  SELECT rp.email,
         rp.full_name,
         NULLIF(op.full_name, ''),
         c.title,
         ur.recording_name,
         sv.composition_id
    FROM claimed cl
    JOIN public.profiles rp ON rp.id = cl.shared_with_user_id
    JOIN public.user_recordings ur ON ur.id = cl.recording_id
    JOIN public.profiles op ON op.id = ur.user_id
    JOIN public.song_versions sv ON sv.id = ur.song_version_id
    JOIN public.compositions c ON c.id = sv.composition_id
   WHERE rp.email_notifications;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_recording_share_email(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_recording_share_email(uuid, uuid) TO authenticated;

COMMIT;
