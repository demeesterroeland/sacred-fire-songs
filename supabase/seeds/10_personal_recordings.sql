-- Seed: Personal Rehearsal Recordings
-- Seed 30 private rehearsal recordings for Admin user and 30 for Member user dynamically.
-- Resolves valid song_version_id references directly from public.song_versions.

DO $$
DECLARE
  v_admin_id uuid := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  v_member_id uuid := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13';
  r RECORD;
  i INT := 1;
  v_user_id uuid;
  v_uuid uuid;
  v_storage_path text;
  v_name text;
BEGIN
  -- Clean up previous user_recordings
  DELETE FROM public.user_recordings;

  FOR r IN (
    SELECT sv.id AS version_id, c.title
    FROM public.song_versions sv
    JOIN public.compositions c ON sv.composition_id = c.id
    ORDER BY c.title ASC
  ) LOOP
    -- Exit once we have created 60 recordings total (30 for Admin, 30 for Member)
    EXIT WHEN i > 60;

    IF i <= 30 THEN
      v_user_id := v_admin_id;
      v_name := r.title || ' – Rehearsal Take ' || (((i - 1) % 3) + 1);
    ELSE
      v_user_id := v_member_id;
      v_name := r.title || ' – Member Rehearsal ' || (((i - 31) % 3) + 1);
    END IF;

    v_uuid := ('11000000-0000-0000-0000-' || lpad(i::text, 12, '0'))::uuid;
    v_storage_path := v_user_id::text || '/' || r.version_id::text || '/rec-' || lpad(i::text, 3, '0') || '.webm';

    INSERT INTO public.user_recordings (id, user_id, song_version_id, recording_name, storage_path, created_at)
    VALUES (
      v_uuid,
      v_user_id,
      r.version_id,
      v_name,
      v_storage_path,
      now() - ( (61 - i) || ' hours' )::interval
    );

    i := i + 1;
  END LOOP;

  RAISE NOTICE 'Seeded 30 private recordings for Admin and 30 for Member.';
END $$;
