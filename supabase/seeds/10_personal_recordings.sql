-- Seed: Personal Rehearsal Recordings
-- Assigns 1–3 dummy recordings to 30 songs for the admin dev user.
-- User: roel.de.meester+admin@gmail.com (a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11)
-- Storage paths are fake — they represent paths in the 'rehearsals' bucket.
-- Recordings are scoped per user_id + song_version_id per the RLS policy.

-- Clean up any previous seed recordings for this user to allow re-seeding
DELETE FROM public.user_recordings
WHERE user_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

INSERT INTO public.user_recordings (id, user_id, song_version_id, recording_name, storage_path, created_at) VALUES

-- Colibri (1 recording)
('11000000-0000-0000-0000-000000000001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '84a0c04a-c9aa-4a3f-a4a2-b5c1e85433c4', 'Colibri – Morning Practice', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/84a0c04a-c9aa-4a3f-a4a2-b5c1e85433c4/rec-001.webm', now() - interval '3 days'),

-- Elevo mi canto (2 recordings)
('11000000-0000-0000-0000-000000000002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'e929d554-5044-4d4d-991f-8b6a2068dc9c', 'Elevo mi canto – Take 1', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/e929d554-5044-4d4d-991f-8b6a2068dc9c/rec-001.webm', now() - interval '5 days'),
('11000000-0000-0000-0000-000000000003', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'e929d554-5044-4d4d-991f-8b6a2068dc9c', 'Elevo mi canto – Take 2', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/e929d554-5044-4d4d-991f-8b6a2068dc9c/rec-002.webm', now() - interval '4 days'),

-- Ayaruna (3 recordings)
('11000000-0000-0000-0000-000000000004', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '0f4c150c-e802-4057-832d-f047a2aa1dba', 'Ayaruna – Slow Practice', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/0f4c150c-e802-4057-832d-f047a2aa1dba/rec-001.webm', now() - interval '7 days'),
('11000000-0000-0000-0000-000000000005', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '0f4c150c-e802-4057-832d-f047a2aa1dba', 'Ayaruna – Full Speed', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/0f4c150c-e802-4057-832d-f047a2aa1dba/rec-002.webm', now() - interval '6 days'),
('11000000-0000-0000-0000-000000000006', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '0f4c150c-e802-4057-832d-f047a2aa1dba', 'Ayaruna – Final Take', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/0f4c150c-e802-4057-832d-f047a2aa1dba/rec-003.webm', now() - interval '1 day'),

-- Churubia (1 recording)
('11000000-0000-0000-0000-000000000007', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '5b150de6-2cc3-4f60-9224-5573bc7d2536', 'Churubia – Morning', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/5b150de6-2cc3-4f60-9224-5573bc7d2536/rec-001.webm', now() - interval '2 days'),

-- Cura Santa Cura (2 recordings)
('11000000-0000-0000-0000-000000000008', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '919311bf-c46b-4f7e-80a7-cbf7882e3f43', 'Cura Santa Cura – Attempt 1', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/919311bf-c46b-4f7e-80a7-cbf7882e3f43/rec-001.webm', now() - interval '10 days'),
('11000000-0000-0000-0000-000000000009', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '919311bf-c46b-4f7e-80a7-cbf7882e3f43', 'Cura Santa Cura – Attempt 2', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/919311bf-c46b-4f7e-80a7-cbf7882e3f43/rec-002.webm', now() - interval '8 days'),

-- El Agua Cambia (1 recording)
('11000000-0000-0000-0000-000000000010', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '0041b6b0-d0c2-4c1c-9573-c474e120a50a', 'El Agua Cambia – Practice', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/0041b6b0-d0c2-4c1c-9573-c474e120a50a/rec-001.webm', now() - interval '4 days'),

-- Aguacollita profunda (3 recordings)
('11000000-0000-0000-0000-000000000011', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'f88e55d9-4873-486c-b733-d391ae674829', 'Aguacollita – Take 1', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/f88e55d9-4873-486c-b733-d391ae674829/rec-001.webm', now() - interval '14 days'),
('11000000-0000-0000-0000-000000000012', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'f88e55d9-4873-486c-b733-d391ae674829', 'Aguacollita – Take 2', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/f88e55d9-4873-486c-b733-d391ae674829/rec-002.webm', now() - interval '12 days'),
('11000000-0000-0000-0000-000000000013', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'f88e55d9-4873-486c-b733-d391ae674829', 'Aguacollita – Best Take', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/f88e55d9-4873-486c-b733-d391ae674829/rec-003.webm', now() - interval '11 days'),

-- Ayahuasca Cura (2 recordings)
('11000000-0000-0000-0000-000000000014', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '9bcd5fb5-79e3-460f-ae3b-d9afeddf83cb', 'Ayahuasca Cura – Slow', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/9bcd5fb5-79e3-460f-ae3b-d9afeddf83cb/rec-001.webm', now() - interval '9 days'),
('11000000-0000-0000-0000-000000000015', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '9bcd5fb5-79e3-460f-ae3b-d9afeddf83cb', 'Ayahuasca Cura – Full', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/9bcd5fb5-79e3-460f-ae3b-d9afeddf83cb/rec-002.webm', now() - interval '7 days'),

-- Cura Do Beija-Flor (1 recording)
('11000000-0000-0000-0000-000000000016', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a9bef500-70d7-41e1-ae9e-3e244eebc2cc', 'Beija-Flor – Morning', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/a9bef500-70d7-41e1-ae9e-3e244eebc2cc/rec-001.webm', now() - interval '6 days'),

-- Canta Pajarito (2 recordings)
('11000000-0000-0000-0000-000000000017', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2ea8b586-dcdc-4e3a-937a-9d233b4c8e10', 'Canta Pajarito – Take 1', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/2ea8b586-dcdc-4e3a-937a-9d233b4c8e10/rec-001.webm', now() - interval '5 days'),
('11000000-0000-0000-0000-000000000018', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2ea8b586-dcdc-4e3a-937a-9d233b4c8e10', 'Canta Pajarito – Take 2', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/2ea8b586-dcdc-4e3a-937a-9d233b4c8e10/rec-002.webm', now() - interval '3 days'),

-- Corazón de Oro (3 recordings)
('11000000-0000-0000-0000-000000000019', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a5be8148-fa90-4aa2-8c9d-d13c6d06542a', 'Corazon de Oro – Rough', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/a5be8148-fa90-4aa2-8c9d-d13c6d06542a/rec-001.webm', now() - interval '20 days'),
('11000000-0000-0000-0000-000000000020', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a5be8148-fa90-4aa2-8c9d-d13c6d06542a', 'Corazon de Oro – Better', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/a5be8148-fa90-4aa2-8c9d-d13c6d06542a/rec-002.webm', now() - interval '15 days'),
('11000000-0000-0000-0000-000000000021', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a5be8148-fa90-4aa2-8c9d-d13c6d06542a', 'Corazon de Oro – Final', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/a5be8148-fa90-4aa2-8c9d-d13c6d06542a/rec-003.webm', now() - interval '2 days'),

-- Cura Sana (1 recording)
('11000000-0000-0000-0000-000000000022', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'dc32c57a-092d-498a-9fa8-2582d228e349', 'Cura Sana – Session', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/dc32c57a-092d-498a-9fa8-2582d228e349/rec-001.webm', now() - interval '8 days'),

-- Defuma defumador (2 recordings)
('11000000-0000-0000-0000-000000000023', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '790de57d-eb0e-4c38-ab3f-cdbc614ce8b4', 'Defuma – Take 1', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/790de57d-eb0e-4c38-ab3f-cdbc614ce8b4/rec-001.webm', now() - interval '3 days'),
('11000000-0000-0000-0000-000000000024', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '790de57d-eb0e-4c38-ab3f-cdbc614ce8b4', 'Defuma – Take 2', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/790de57d-eb0e-4c38-ab3f-cdbc614ce8b4/rec-002.webm', now() - interval '1 day'),

-- Eh Madre Madrecita (1 recording)
('11000000-0000-0000-0000-000000000025', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '195d0325-619f-4e7d-aa41-e9a4a0820aeb', 'Eh Madre – Practice', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/195d0325-619f-4e7d-aa41-e9a4a0820aeb/rec-001.webm', now() - interval '6 days'),

-- Abuelito Abuelita (3 recordings)
('11000000-0000-0000-0000-000000000026', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '1a13f493-8a7a-417f-89a4-a385cb555ab3', 'Abuelito – Slow', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/1a13f493-8a7a-417f-89a4-a385cb555ab3/rec-001.webm', now() - interval '16 days'),
('11000000-0000-0000-0000-000000000027', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '1a13f493-8a7a-417f-89a4-a385cb555ab3', 'Abuelito – Medium', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/1a13f493-8a7a-417f-89a4-a385cb555ab3/rec-002.webm', now() - interval '10 days'),
('11000000-0000-0000-0000-000000000028', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '1a13f493-8a7a-417f-89a4-a385cb555ab3', 'Abuelito – Final', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/1a13f493-8a7a-417f-89a4-a385cb555ab3/rec-003.webm', now() - interval '5 days'),

-- Agua transparente (2 recordings)
('11000000-0000-0000-0000-000000000029', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '11835c30-bcf1-4d46-8f44-183b36ffb53f', 'Agua transparente – Take 1', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/11835c30-bcf1-4d46-8f44-183b36ffb53f/rec-001.webm', now() - interval '4 days'),
('11000000-0000-0000-0000-000000000030', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '11835c30-bcf1-4d46-8f44-183b36ffb53f', 'Agua transparente – Take 2', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/11835c30-bcf1-4d46-8f44-183b36ffb53f/rec-002.webm', now() - interval '2 days'),

-- Amo Amo Amo (1 recording)
('11000000-0000-0000-0000-000000000031', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd922900c-b0fe-44bb-831d-1b67534ada5e', 'Amo Amo – Session', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/d922900c-b0fe-44bb-831d-1b67534ada5e/rec-001.webm', now() - interval '11 days'),

-- Aqui en la montaña (2 recordings)
('11000000-0000-0000-0000-000000000032', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b86a70f7-8d97-4fa9-af02-7745bc70f83c', 'Montaña – Morning', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/b86a70f7-8d97-4fa9-af02-7745bc70f83c/rec-001.webm', now() - interval '9 days'),
('11000000-0000-0000-0000-000000000033', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b86a70f7-8d97-4fa9-af02-7745bc70f83c', 'Montaña – Evening', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/b86a70f7-8d97-4fa9-af02-7745bc70f83c/rec-002.webm', now() - interval '7 days'),

-- Belleza Pura (1 recording)
('11000000-0000-0000-0000-000000000034', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '63421d7f-f73c-446f-8a22-c5e52e937e7f', 'Belleza Pura – Practice', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/63421d7f-f73c-446f-8a22-c5e52e937e7f/rec-001.webm', now() - interval '5 days'),

-- Bendice (3 recordings)
('11000000-0000-0000-0000-000000000035', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '8ba28762-a7ae-40e9-b147-4332037c8691', 'Bendice – Rough', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/8ba28762-a7ae-40e9-b147-4332037c8691/rec-001.webm', now() - interval '18 days'),
('11000000-0000-0000-0000-000000000036', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '8ba28762-a7ae-40e9-b147-4332037c8691', 'Bendice – Polished', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/8ba28762-a7ae-40e9-b147-4332037c8691/rec-002.webm', now() - interval '13 days'),
('11000000-0000-0000-0000-000000000037', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '8ba28762-a7ae-40e9-b147-4332037c8691', 'Bendice – Performance', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/8ba28762-a7ae-40e9-b147-4332037c8691/rec-003.webm', now() - interval '1 day'),

-- Brilla un Colibri (1 recording)
('11000000-0000-0000-0000-000000000038', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '21033658-4720-4193-ab50-9675d064d667', 'Brilla Colibri – Practice', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/21033658-4720-4193-ab50-9675d064d667/rec-001.webm', now() - interval '4 days'),

-- Caboclo Curador (2 recordings)
('11000000-0000-0000-0000-000000000039', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a028632e-e865-410b-9f55-879018c96f9a', 'Caboclo – Take 1', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/a028632e-e865-410b-9f55-879018c96f9a/rec-001.webm', now() - interval '3 days'),
('11000000-0000-0000-0000-000000000040', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a028632e-e865-410b-9f55-879018c96f9a', 'Caboclo – Take 2', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/a028632e-e865-410b-9f55-879018c96f9a/rec-002.webm', now() - interval '1 day'),

-- Como no voy a cantar (1 recording)
('11000000-0000-0000-0000-000000000041', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '6e5484fe-b08c-4c8f-a75a-deba5604441e', 'Como no voy – Session', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/6e5484fe-b08c-4c8f-a75a-deba5604441e/rec-001.webm', now() - interval '6 days'),

-- Danza del sol (3 recordings)
('11000000-0000-0000-0000-000000000042', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'e5449b97-4aec-45ba-970a-445387d2e8ab', 'Danza del sol – Dawn', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/e5449b97-4aec-45ba-970a-445387d2e8ab/rec-001.webm', now() - interval '21 days'),
('11000000-0000-0000-0000-000000000043', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'e5449b97-4aec-45ba-970a-445387d2e8ab', 'Danza del sol – Noon', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/e5449b97-4aec-45ba-970a-445387d2e8ab/rec-002.webm', now() - interval '14 days'),
('11000000-0000-0000-0000-000000000044', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'e5449b97-4aec-45ba-970a-445387d2e8ab', 'Danza del sol – Full', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/e5449b97-4aec-45ba-970a-445387d2e8ab/rec-003.webm', now() - interval '3 days'),

-- Defuma Con As Ervas Da Jurema (2 recordings)
('11000000-0000-0000-0000-000000000045', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '31a12b76-5851-4651-9536-e7db2f76d785', 'Jurema – Take 1', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/31a12b76-5851-4651-9536-e7db2f76d785/rec-001.webm', now() - interval '8 days'),
('11000000-0000-0000-0000-000000000046', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '31a12b76-5851-4651-9536-e7db2f76d785', 'Jurema – Take 2', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/31a12b76-5851-4651-9536-e7db2f76d785/rec-002.webm', now() - interval '5 days'),

-- Defuma esta casa (1 recording)
('11000000-0000-0000-0000-000000000047', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '747aded6-4c50-4816-a748-62389ed7c408', 'Defuma esta casa – Practice', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/747aded6-4c50-4816-a748-62389ed7c408/rec-001.webm', now() - interval '2 days'),

-- Desde los Andes (2 recordings)
('11000000-0000-0000-0000-000000000048', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'aa2e58fe-447b-470c-a763-8b4bd9abc9aa', 'Andes – Take 1', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/aa2e58fe-447b-470c-a763-8b4bd9abc9aa/rec-001.webm', now() - interval '7 days'),
('11000000-0000-0000-0000-000000000049', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'aa2e58fe-447b-470c-a763-8b4bd9abc9aa', 'Andes – Take 2', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/aa2e58fe-447b-470c-a763-8b4bd9abc9aa/rec-002.webm', now() - interval '4 days'),

-- Agua De Estrellas (1 recording)
('11000000-0000-0000-0000-000000000050', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c4e141dd-9179-49d4-b249-bfcf5453bc21', 'Estrellas – Session', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/c4e141dd-9179-49d4-b249-bfcf5453bc21/rec-001.webm', now() - interval '9 days'),

-- Agua de vida lluvia (3 recordings)
('11000000-0000-0000-0000-000000000051', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd42ded1c-4af9-4ee2-97bf-9a6bcc521ce6', 'Lluvia – Rough', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/d42ded1c-4af9-4ee2-97bf-9a6bcc521ce6/rec-001.webm', now() - interval '25 days'),
('11000000-0000-0000-0000-000000000052', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd42ded1c-4af9-4ee2-97bf-9a6bcc521ce6', 'Lluvia – Refined', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/d42ded1c-4af9-4ee2-97bf-9a6bcc521ce6/rec-002.webm', now() - interval '18 days'),
('11000000-0000-0000-0000-000000000053', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd42ded1c-4af9-4ee2-97bf-9a6bcc521ce6', 'Lluvia – Final', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/d42ded1c-4af9-4ee2-97bf-9a6bcc521ce6/rec-003.webm', now() - interval '2 days'),

-- Aguila Moteada (2 recordings)
('11000000-0000-0000-0000-000000000054', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '87a15792-b298-48ad-a59a-fdab36958e08', 'Aguila – Take 1', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/87a15792-b298-48ad-a59a-fdab36958e08/rec-001.webm', now() - interval '12 days'),
('11000000-0000-0000-0000-000000000055', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '87a15792-b298-48ad-a59a-fdab36958e08', 'Aguila – Take 2', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/87a15792-b298-48ad-a59a-fdab36958e08/rec-002.webm', now() - interval '10 days'),

-- En el camino (1 recording)
('11000000-0000-0000-0000-000000000056', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '47efd643-eaea-4459-b8f8-7f64a0c8d02a', 'En el camino – Session', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/47efd643-eaea-4459-b8f8-7f64a0c8d02a/rec-001.webm', now() - interval '3 days')

ON CONFLICT (id) DO NOTHING;
