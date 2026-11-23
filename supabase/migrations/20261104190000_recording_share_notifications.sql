-- Migration: In-app notifications and email preference for shared recordings (Story 4.6.6)
-- Date: 2026-11-04

-- 1. Email opt-out for transactional notification emails
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email_notifications boolean NOT NULL DEFAULT true;

-- 2. Notifications inbox. Display text is rendered client-side from `type`
--    and the `metadata` snapshot, so it follows the reader's locale.
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('recording_shared')),
  recording_id uuid REFERENCES public.user_recordings(id) ON DELETE CASCADE,
  composition_id uuid REFERENCES public.compositions(id) ON DELETE CASCADE,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON public.notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id) WHERE read_at IS NULL;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Recipients read, mark read and dismiss their own notifications. There is no
-- INSERT policy: rows are only created by the SECURITY DEFINER trigger below.
DROP POLICY IF EXISTS "Users can read own notifications" ON public.notifications;
CREATE POLICY "Users can read own notifications" ON public.notifications FOR SELECT TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- Supabase grants ALL on new public tables by default; narrow it so recipients
-- can only flip `read_at`.
REVOKE ALL ON public.notifications FROM anon, authenticated;
GRANT SELECT, DELETE ON public.notifications TO authenticated;
GRANT UPDATE (read_at) ON public.notifications TO authenticated;

-- 3. Create a notification when a recording is shared. Errors are swallowed
--    (logged as WARNING) so a notification failure never blocks the share.
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
           COALESCE(NULLIF(p.full_name, ''), p.email)
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

-- Revoking a share removes its notification so no dead link stays behind.
CREATE OR REPLACE FUNCTION public.fn_remove_recording_share_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.notifications
   WHERE user_id = OLD.shared_with_user_id
     AND recording_id = OLD.recording_id
     AND type = 'recording_shared';
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_recording_shared ON public.recording_shares;
CREATE TRIGGER trg_notify_recording_shared
  AFTER INSERT ON public.recording_shares
  FOR EACH ROW EXECUTE FUNCTION public.fn_notify_recording_shared();

DROP TRIGGER IF EXISTS trg_remove_recording_share_notification ON public.recording_shares;
CREATE TRIGGER trg_remove_recording_share_notification
  AFTER DELETE ON public.recording_shares
  FOR EACH ROW EXECUTE FUNCTION public.fn_remove_recording_share_notification();

-- 4. One transactional email per share. The owner's session claims the share
--    (sets email_sent_at) and gets the recipient's details back only when the
--    claim succeeds and the recipient has not opted out. This keeps the email
--    server action idempotent and owner-only.
ALTER TABLE public.recording_shares
  ADD COLUMN IF NOT EXISTS email_sent_at timestamptz;

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
         COALESCE(NULLIF(op.full_name, ''), op.email),
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
