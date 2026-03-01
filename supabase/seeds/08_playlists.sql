-- 08_playlists.sql
-- Seed 5 playlists for the default Member user (11111111-...-111111111111)
-- 2 public playlists (public songs only), 3 private playlists (include draft songs)

DO $$
DECLARE
  v_member_id uuid := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13';

  -- Playlist IDs
  v_pl1 uuid := 'aaaaaaaa-0001-4000-a000-000000000001'; -- public: Water Ceremony
  v_pl2 uuid := 'aaaaaaaa-0002-4000-a000-000000000002'; -- public: Fire Songs
  v_pl3 uuid := 'aaaaaaaa-0003-4000-a000-000000000003'; -- private: My Healing Practice
  v_pl4 uuid := 'aaaaaaaa-0004-4000-a000-000000000004'; -- private: New Moon Ceremony
  v_pl5 uuid := 'aaaaaaaa-0005-4000-a000-000000000005'; -- private: Work in Progress

BEGIN

-- ============================================================
-- 1. Create setlists
-- ============================================================
INSERT INTO public.setlists (id, owner_id, title, description, is_public, created_at)
VALUES
  -- PUBLIC playlists
  (v_pl1, v_member_id, 'Water Ceremony',
   'Songs for water blessings and river ceremonies.',
   true, now() - interval '14 days'),
  (v_pl2, v_member_id, 'Fire Songs',
   'A collection of songs for the sacred fire circle.',
   true, now() - interval '10 days'),
  -- PRIVATE playlists
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
-- 2. Populate setlist items
--    Public playlists → only public songs
--    Private playlists → mix of public and draft songs
-- ============================================================

-- ── Playlist 1: Water Ceremony (PUBLIC, 8 songs — all public) ──
INSERT INTO public.setlist_items (setlist_id, song_version_id, order_index, created_at)
VALUES
  (v_pl1, '7fe5fc64-b060-41df-a1ef-717bc640a206', 1, now() - interval '14 days'),  -- The River Is Flowing
  (v_pl1, 'e9c1b95c-3b0d-45a9-af1e-1a686278a3cc', 2, now() - interval '14 days'),  -- El Agua Cambia
  (v_pl1, '07af6954-edd5-4e16-9863-62886251e6f3', 3, now() - interval '14 days'),  -- Agua De Estrellas
  (v_pl1, 'dcd10aaa-08dc-4d8e-9ff2-baec89a71bb5', 4, now() - interval '14 days'),  -- Hermoso espiritu del agua
  (v_pl1, 'b634fb6c-79eb-4b16-b915-96ed668fff67', 5, now() - interval '14 days'),  -- Agua de vida lluvia
  (v_pl1, 'fe2d63cf-7950-41fe-bb12-66330a9d9368', 6, now() - interval '14 days'),  -- Agua transparente
  (v_pl1, 'b902061b-b615-459e-a115-732c12f0e286', 7, now() - interval '14 days'),  -- Agüita que Vienes
  (v_pl1, '6a690b1e-5a63-497d-812c-5b533d7cb875', 8, now() - interval '14 days')   -- Agua Vital
ON CONFLICT DO NOTHING;

-- ── Playlist 2: Fire Songs (PUBLIC, 10 songs — all public) ──
INSERT INTO public.setlist_items (setlist_id, song_version_id, order_index, created_at)
VALUES
  (v_pl2, 'f9dee0cd-cd7b-4d8b-91d9-09dc686c25a4', 1, now() - interval '10 days'),  -- Abuelito Tatewari
  (v_pl2, '95fd276b-4d2b-4d01-8036-c402e0e9e497', 2, now() - interval '10 days'),  -- Este fuego
  (v_pl2, 'd02e1782-a22c-43f7-a3b7-0d17f117555c', 3, now() - interval '10 days'),  -- Fenix
  (v_pl2, 'f5969a10-b7a9-4379-a6ef-4c748fd25451', 4, now() - interval '10 days'),  -- Fuerza Del Copal
  (v_pl2, 'e98a1692-ea49-4433-a3f4-6928cbb8458c', 5, now() - interval '10 days'),  -- Danza del sol
  (v_pl2, '353290f2-5242-437b-88a9-714cdc971c94', 6, now() - interval '10 days'),  -- Corazón de Oro
  (v_pl2, '3c889a16-ff14-4eab-b885-d6a563d82543', 7, now() - interval '10 days'),  -- Como no voy a cantar
  (v_pl2, 'dfe4f14c-122c-4a25-a673-328e3b6cef31', 8, now() - interval '10 days'),  -- Elevo mi canto
  (v_pl2, '8dc4a3ec-1f86-475e-86ae-a5f34543d1a9', 9, now() - interval '10 days'),  -- Todo lo que tengo
  (v_pl2, '06cc5f6f-f546-4b54-b6ea-b6cc32b4f2b8',10, now() - interval '10 days')   -- Todo es mi familia
ON CONFLICT DO NOTHING;

-- ── Playlist 3: My Healing Practice (PRIVATE, 12 songs — mix public + draft) ──
INSERT INTO public.setlist_items (setlist_id, song_version_id, order_index, created_at)
VALUES
  (v_pl3, '57042a98-4bd5-457d-bfd1-e5a99936df45', 1, now() - interval '7 days'),  -- Cura Santa Cura (public)
  (v_pl3, 'e0f2b03e-2d10-4c7a-a5a8-9bf657dbd3a9', 2, now() - interval '7 days'),  -- Medicina que trae los cielos (public)
  (v_pl3, 'f2f9ec91-6a5a-4ae2-aa2d-766f5ea3e2c3', 3, now() - interval '7 days'),  -- Jardincito Curandero (public)
  (v_pl3, 'bf5c9cbe-e540-4529-a50a-330fca33e597', 4, now() - interval '7 days'),  -- Ayahuasca Cura (public)
  (v_pl3, '075ecb95-7215-4708-af13-e6e685b8f233', 5, now() - interval '7 days'),  -- Ayaruna (public)
  (v_pl3, 'e9b28774-72c7-4ff2-88b9-4ca3112164be', 6, now() - interval '7 days'),  -- Icaro Sagrado (public)
  (v_pl3, 'b95eaa96-ee0d-445a-bd99-56b54ba9cdde', 7, now() - interval '7 days'),  -- Agradecer, agradecer (DRAFT)
  (v_pl3, 'dfb05724-4e89-4ebd-85f4-3cfc6ed9cb45', 8, now() - interval '7 days'),  -- Brilla Diamante (DRAFT)
  (v_pl3, '4617fd2f-ddc0-4fb7-be7b-279cdb1246f7', 9, now() - interval '7 days'),  -- Calling (DRAFT)
  (v_pl3, '51fa10de-24ee-41e1-aa3a-2a34473082e8',10, now() - interval '7 days'),  -- Medicina Lapitoj (DRAFT)
  (v_pl3, '87367111-9c95-4386-a5df-c01cbac499c1',11, now() - interval '7 days'),  -- Espíritu del agua (DRAFT)
  (v_pl3, '13de328a-b3d3-42ac-b57f-676b9752ad9d',12, now() - interval '7 days')   -- Ide were were (DRAFT)
ON CONFLICT DO NOTHING;

-- ── Playlist 4: New Moon Ceremony (PRIVATE, 15 songs — mix public + draft) ──
INSERT INTO public.setlist_items (setlist_id, song_version_id, order_index, created_at)
VALUES
  (v_pl4, '21c533b5-eb09-4a39-83fe-cb807b61f259', 1, now() - interval '3 days'),  -- Defuma esta casa (public)
  (v_pl4, '7ef51b31-f460-4389-a0f6-c694f857bcac', 2, now() - interval '3 days'),  -- Pido a los seres (public)
  (v_pl4, '1d744078-a26d-48fd-9d53-89b88f2c91d1', 3, now() - interval '3 days'),  -- Madre Ayahuasca (public)
  (v_pl4, '0387bc40-fee7-4232-83d5-be6f565f6d29', 4, now() - interval '3 days'),  -- Madre Ayahuasca (Mireia) (public)
  (v_pl4, '36db44a4-9031-4880-9e36-1908e630a94b', 5, now() - interval '3 days'),  -- Ayahuasca Urcumanta (public)
  (v_pl4, 'e22c6691-6ea8-4767-9a60-8756169257d7', 6, now() - interval '3 days'),  -- Mariri (public)
  (v_pl4, '6b5179fb-3439-493c-a94a-c9b4d2f2035e', 7, now() - interval '3 days'),  -- La Anaconda (public)
  (v_pl4, 'd828a868-b14f-44f0-81c8-de8de3cf4fd3', 8, now() - interval '3 days'),  -- Os segredos vem da floresta (public)
  (v_pl4, 'f4edc1f4-bd4e-4d6e-a41c-a3a27d9a29e1', 9, now() - interval '3 days'),  -- La luz del bosque (public)
  (v_pl4, 'b843b3f3-fc9f-4814-9c59-05222edd2377',10, now() - interval '3 days'),  -- A fresh new breath (public)
  (v_pl4, 'cb623e7f-57e7-40bc-a821-899ba5a07b1c',11, now() - interval '3 days'),  -- Caboclo (DRAFT)
  (v_pl4, '4c5d3224-30a9-4596-b4b1-1e3236c8b2af',12, now() - interval '3 days'),  -- Canto enamorado del pájaro (DRAFT)
  (v_pl4, 'ee4db359-b71b-4d5b-9571-66f2024f651f',13, now() - interval '3 days'),  -- Colhendo lírio lirulê (DRAFT)
  (v_pl4, '9abfebb3-b8cd-4e9a-aea1-b7dcee672d90',14, now() - interval '3 days'),  -- Florecerá (DRAFT)
  (v_pl4, '6e0c86b3-9101-4386-9fe3-bb98870664d5',15, now() - interval '3 days')   -- Mother I Feel You (DRAFT)
ON CONFLICT DO NOTHING;

-- ── Playlist 5: Work in Progress (PRIVATE, 5 songs — mix public + draft) ──
INSERT INTO public.setlist_items (setlist_id, song_version_id, order_index, created_at)
VALUES
  (v_pl5, '18f20252-0f2d-47dc-8f06-78f2d426884b', 1, now() - interval '1 day'),  -- Brilla un Colibrí (public)
  (v_pl5, 'bd2375bf-9c1c-4ffc-9589-628eec44359a', 2, now() - interval '1 day'),  -- Eagle Song (public)
  (v_pl5, '5e2e4402-8ca3-4078-b51b-aa4fff09f4bc', 3, now() - interval '1 day'),  -- Down to the river (DRAFT)
  (v_pl5, 'f702e837-0680-477b-974a-30c2bbcd78d3', 4, now() - interval '1 day'),  -- Luz divina (DRAFT)
  (v_pl5, 'fb4ee0aa-e331-4104-a3f6-5764a5b827c2', 5, now() - interval '1 day')   -- Fly - little bird (DRAFT)
ON CONFLICT DO NOTHING;

RAISE NOTICE 'Seeded 5 playlists (2 public, 3 private) with 50 total items for member user.';
END $$;
