-- Share e-mails are claimed by the server only.
--
-- claim_recording_share_email marks a share as e-mailed and returns what the e-mail needs.
-- It is now called by the app server with the project's secret key, never with a user's
-- session: the owner is passed by the server (the signed-in user of the share action),
-- and signed-in users can no longer execute the function themselves.

BEGIN;

DROP FUNCTION IF EXISTS public.claim_recording_share_email(uuid, uuid);

CREATE FUNCTION public.claim_recording_share_email(p_recording_id uuid, p_recipient_id uuid, p_owner_id uuid)
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
SET search_path = ''
AS $$
  WITH claimed AS (
    UPDATE public.recording_shares rs
       SET email_sent_at = now()
     WHERE rs.recording_id = p_recording_id
       AND rs.shared_with_user_id = p_recipient_id
       AND rs.email_sent_at IS NULL
       AND public.is_recording_owner(rs.recording_id, p_owner_id)
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

REVOKE ALL ON FUNCTION public.claim_recording_share_email(uuid, uuid, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_recording_share_email(uuid, uuid, uuid) TO service_role;

COMMIT;
