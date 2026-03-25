-- 08_playlists.sql
-- Seed 5 playlists for the default Member user
-- Looks up song_version IDs dynamically by composition title

DO $$
DECLARE
  v_member_id uuid := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13';

  -- Playlist IDs
  v_pl1 uuid := 'aaaaaaaa-0001-4000-a000-000000000001'; -- public: Water Ceremony
  v_pl2 uuid := 'aaaaaaaa-0002-4000-a000-000000000002'; -- public: Fire Songs
  v_pl3 uuid := 'aaaaaaaa-0003-4000-a000-000000000003'; -- private: My Healing Practice
  v_pl4 uuid := 'aaaaaaaa-0004-4000-a000-000000000004'; -- private: New Moon Ceremony
  v_pl5 uuid := 'aaaaaaaa-0005-4000-a000-000000000005'; -- private: Work in Progress

  v_vid uuid;
  v_order int;

BEGIN

-- ============================================================
-- 1. Create setlists
-- ============================================================
INSERT INTO public.setlists (id, owner_id, title, description, is_public, created_at)
VALUES
  (v_pl1, v_member_id, 'Water Ceremony',
   'Songs for water blessings and river ceremonies.',
   true, now() - interval '14 days'),
  (v_pl2, v_member_id, 'Fire Songs',
   'A collection of songs for the sacred fire circle.',
   true, now() - interval '10 days'),
  (v_pl3, v_member_id, 'My Healing Practice',
   'Personal healing songs including some drafts I''m still learning.',
   false, now() - interval '7 days'),
  (v_pl4, v_member_id, 'New Moon Ceremony',
   'Setlist for the upcoming new moon gathering.',
   false, now() - interval '3 days'),
  (v_pl5, v_member_id, 'Work in Progress',
   'Songs I''m collecting — some still in draft.',
   false, now() - interval '1 day')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. Helper: insert a setlist item by looking up composition title
-- ============================================================
-- We use a temporary table to batch the inserts
CREATE TEMP TABLE _playlist_seeds (
  setlist_id uuid,
  song_title text,
  order_index int,
  created_offset interval
) ON COMMIT DROP;

-- ── Playlist 1: Water Ceremony (PUBLIC, water-themed songs) ──
INSERT INTO _playlist_seeds VALUES
  (v_pl1, 'The River Is Flowing',        1, interval '14 days'),
  (v_pl1, 'Agua De Estrellas',            2, interval '14 days'),
  (v_pl1, 'Agua de vida lluvia',          3, interval '14 days'),
  (v_pl1, 'Agua transparente',            4, interval '14 days'),
  (v_pl1, 'Agüita que Vienes',            5, interval '14 days'),
  (v_pl1, 'Agua Vital',                   6, interval '14 days');

-- ── Playlist 2: Fire Songs (PUBLIC, fire-themed songs) ──
INSERT INTO _playlist_seeds VALUES
  (v_pl2, 'Abuelito Fuego',               1, interval '10 days'),
  (v_pl2, 'Fenix',                         2, interval '10 days'),
  (v_pl2, 'Fuerza Del Copal',             3, interval '10 days'),
  (v_pl2, 'Danza del sol',                4, interval '10 days'),
  (v_pl2, 'Corazón de Oro',               5, interval '10 days'),
  (v_pl2, 'Como no voy a cantar',         6, interval '10 days'),
  (v_pl2, 'Elevo mi canto',               7, interval '10 days'),
  (v_pl2, 'Todo es mi familia',           8, interval '10 days');

-- ── Playlist 3: My Healing Practice (PRIVATE, healing songs) ──
INSERT INTO _playlist_seeds VALUES
  (v_pl3, 'Cura Santa Cura',              1, interval '7 days'),
  (v_pl3, 'Jardincito Curandero',         2, interval '7 days'),
  (v_pl3, 'Ayahuasca Cura',               3, interval '7 days'),
  (v_pl3, 'Ayaruna',                       4, interval '7 days'),
  (v_pl3, 'Icaro Sagrado',                5, interval '7 days');

-- ── Playlist 4: New Moon Ceremony (PRIVATE, ceremony songs) ──
INSERT INTO _playlist_seeds VALUES
  (v_pl4, 'Defuma esta casa',             1, interval '3 days'),
  (v_pl4, 'Madre Ayahuasca',              2, interval '3 days'),
  (v_pl4, 'La Anaconda',                  3, interval '3 days'),
  (v_pl4, 'A fresh new breath',           4, interval '3 days');

-- ── Playlist 5: Work in Progress (PRIVATE, misc) ──
INSERT INTO _playlist_seeds VALUES
  (v_pl5, 'Eagle Song',                   1, interval '1 day'),
  (v_pl5, 'Abuelitas piedras',            2, interval '1 day');

-- ============================================================
-- 3. Resolve titles → song_version IDs and insert setlist_items
-- ============================================================
INSERT INTO public.setlist_items (setlist_id, song_version_id, order_index, created_at)
SELECT
  ps.setlist_id,
  sv.id,
  ps.order_index,
  now() - ps.created_offset
FROM _playlist_seeds ps
JOIN public.compositions c ON c.title = ps.song_title
JOIN public.song_versions sv ON sv.composition_id = c.id
ON CONFLICT DO NOTHING;

RAISE NOTICE 'Seeded 5 playlists with items (titles resolved dynamically).';
END $$;
