-- 03_songs_random_generated.sql
-- 200 generated songs for local development (`supabase db reset` / `supabase start`).
--
-- GENERATED FILE – do not edit by hand. Regenerate with:
--   npm run seed:generate            (or: node scripts/export-random-seed.mjs 200)
-- Source generator: scripts/random-seeder.mjs (20 deterministic anchor songs +
-- randomized songs covering every shape in docs/testing/song.feature).
-- Generated: 2026-10-30T12:55:27.964Z
--
-- Depends on 01_auth_users.sql + 02_profiles.sql (owner ids) and the category
-- taxonomy created by the migrations. Timestamps are relative to now() so the
-- data always looks recent. The real song collection lives in the sibling
-- repository sacred-fire-songs-collection.

-- Compositions (200)
INSERT INTO public.compositions (id, title, original_author, is_public, owner_id, has_chords, has_melody, created_at) VALUES
  ('43f033ce-9715-4346-9ac1-1a55182ae6f3', 'Morning Sunrise', 'Shimshai', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', true, true, now() - interval '0 seconds'),
  ('2358a04a-e7aa-43d2-b0db-9d2ec523bbc6', 'Danza del Cielo Curandero', 'Herbert Quinteros', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', true, true, now() - interval '60 seconds'),
  ('379a01a8-552c-4688-8afc-dfe44591bb9e', 'Down to the River', 'Traditional (Spiritual)', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true, true, now() - interval '120 seconds'),
  ('8acb59ae-d67b-42a8-b9fb-ae353ede7dfb', 'Donne Ricche', 'Nico Pérez & Fiona Helmer', true, NULL, true, false, now() - interval '180 seconds'),
  ('9919e38c-3fcf-4b6a-b0fe-7c4c94c801c3', 'Agüita que Vienes', 'Traditional', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', true, false, now() - interval '240 seconds'),
  ('ca7bba27-3b15-4eaa-87a3-20def74c53af', 'Aguita de la Vida', 'Danit', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', true, true, now() - interval '300 seconds'),
  ('f718e0e5-80cb-4613-8e45-62c74ebdbe85', 'Pachamama', 'Medicine Family', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true, true, now() - interval '360 seconds'),
  ('32fbb4f6-cd59-486f-8f2b-59b3cdfc0b39', 'Espíritu del agua', 'Traditional', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', true, false, now() - interval '420 seconds'),
  ('edef27fa-a31f-4720-a66f-4890a2582898', 'Grandmother Earth', 'Traditional', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', false, false, now() - interval '480 seconds'),
  ('969080b6-f4d5-44e9-b236-47a46b949f30', 'Test Song', 'Test Author', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true, false, now() - interval '540 seconds'),
  ('79c94128-bb8d-46af-b175-260729e5003a', 'Test Key Capo', 'Tester', true, NULL, true, false, now() - interval '600 seconds'),
  ('7acc5907-3a0f-4f44-99c8-8de986b11aba', 'Canto Sem Fim', 'Santo Daime', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', true, true, now() - interval '660 seconds'),
  ('6f06959c-c905-4afb-a53e-810b8b1892eb', 'Eu sou Santa Maria', 'traditional', false, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', true, false, now() - interval '720 seconds'),
  ('49c9d8e2-9c14-4a02-87bb-c82ac8cb6c64', 'Luz Divina', '', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', false, false, now() - interval '780 seconds'),
  ('22c8c970-c28c-4631-bf0c-db00a5af2a61', 'Silent Prayer', 'Traditional', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', false, false, now() - interval '840 seconds'),
  ('379b6737-e754-4778-94a7-d8e719c42a25', 'Grandmother''s Song of the Thousand Rivers That Flow Together Toward the Ocean of Forgiveness 🌊', 'Ayla Nereo, Danit / Shimshai and Cari El', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', true, true, now() - interval '900 seconds'),
  ('67d245f7-6115-4abd-a3d5-00a251e41406', 'Inan Tonanzin', 'Traditional (Nahuatl)', true, NULL, true, false, now() - interval '960 seconds'),
  ('5de03246-cbfc-454e-ab0e-24cc3bea5366', 'Wakan Tanka', 'Herbert  Quinteros', false, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', false, true, now() - interval '1020 seconds'),
  ('37951bb6-96cc-4907-a6a8-516ba082c510', 'Mother I Feel You', 'shimshai', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', true, true, now() - interval '1080 seconds'),
  ('3cabe193-ac88-4619-9bab-28d29bb7afe7', 'Hey Yamayo', 'Curawaka', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', true, true, now() - interval '1140 seconds'),
  ('13fecd65-baf1-466e-b21f-05a93381b792', 'Canção do Tierra Profundo', 'Alonso del Río', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true, false, now() - interval '129148 seconds'),
  ('633ab28e-1c3e-4129-a73a-87a5d699757c', 'Canção do Pachamama', 'Xavier Rudd and Nina', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', true, true, now() - interval '270002 seconds'),
  ('8e04f469-1bd1-42e1-8b61-6b16d5e28885', 'Camino del Fuego', 'Herbert Quinteros', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true, true, now() - interval '513509 seconds'),
  ('1bc8e66f-0e98-416b-8f3f-23fc4d85249a', 'Ecos del River Bendita', 'Santo Daime', false, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', false, true, now() - interval '783135 seconds'),
  ('40beb410-d7c6-4338-bd47-b58782136aa9', 'Ecos del Fuego', 'Fiona Helmer and Nina and Traditional (Camino Rojo)', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', true, true, now() - interval '842809 seconds'),
  ('56861db8-04f8-4927-a998-9c7882bd8e70', 'Rezo al Águila 🔥', 'Ayla Nereo', true, NULL, true, true, now() - interval '864850 seconds'),
  ('1e851fd3-9d3f-42e0-bc68-3f67f2720497', 'Sinfonía del Piedra', 'Ayla Schafer', false, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', true, true, now() - interval '994236 seconds'),
  ('e877a416-3872-44be-9433-09a1dc19adea', 'Luz de la Pachamama 🔥', 'Santo  Daime', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', true, true, now() - interval '1075658 seconds'),
  ('cf03f60f-04e4-4173-90d8-b28d906c6e15', 'Viento del Sol Profundo', 'Curawaka', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', true, false, now() - interval '1386059 seconds'),
  ('1052941c-4c43-433e-a45d-adc38316e546', 'Abuelo River Limpio', 'Traditional (Umbanda)', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', false, true, now() - interval '1845871 seconds'),
  ('603e1e70-86d8-46ce-a216-3257272eff78', 'Cura de la Selva', 'Traditional (Camino Rojo)', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', true, true, now() - interval '2012618 seconds'),
  ('fe09b341-733c-494d-9539-f5a4f9e69d8a', 'Llamado del River Eterno', NULL, true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true, true, now() - interval '2258757 seconds'),
  ('eda86457-a70a-46bf-9945-51930a6c3894', 'Hino da Piedra Curandero', 'Nico Pérez', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', false, true, now() - interval '2497875 seconds'),
  ('d8983a21-b135-4e10-8129-746980e21e4d', 'Canto al Selva', 'Traditional (Umbanda)', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', true, false, now() - interval '2608635 seconds'),
  ('392172ef-772b-456e-a10f-31c5308ca70f', 'Cura de la Montaña', '  Peia ', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', true, true, now() - interval '2872845 seconds'),
  ('0675386e-2910-4426-88b5-67478c482d51', 'Ecos del Colibrí', NULL, true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true, true, now() - interval '2875335 seconds'),
  ('dbe93605-454c-4cbd-919e-6409d2ed99fc', 'Luz de la Mar Eterno', 'Santo Daime', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', true, true, now() - interval '3250028 seconds'),
  ('a4a6304d-33a3-439d-abd6-5f5772c32bb6', 'Espíritu de la Corazón Eterno', 'Cari El', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', true, false, now() - interval '3350413 seconds'),
  ('23875ed5-ac16-4f10-9456-8aa83086f7a2', 'Pájaro Tierra', 'diego palma', true, NULL, false, false, now() - interval '3401903 seconds'),
  ('43fbe1bb-5e23-4c81-9d96-f163a8800065', 'Voz del River Verde', 'Herbert Quinteros & Dario Hampi Pakari', false, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', true, true, now() - interval '3841720 seconds'),
  ('4fc29da7-8a77-429f-836e-74ad9105039d', 'Danza del Colibrí Ancestral', NULL, false, NULL, true, false, now() - interval '3862959 seconds'),
  ('7a80f369-7869-4a99-a1c2-310a018bbf5d', 'Espíritu de la Fuego Cósmico', NULL, true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', true, true, now() - interval '4054619 seconds'),
  ('b221d1f5-c9b4-4fc5-a4e0-d6d83a668abf', 'Espíritu de la Mar Cielo', 'Fiona Helmer', true, NULL, true, false, now() - interval '4422701 seconds'),
  ('ac85d56d-654c-4176-b82f-4dee0ee9bdc7', 'Song of the Mountain Puro', 'alain merens', false, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true, true, now() - interval '4609007 seconds'),
  ('2db9c970-bf02-4f9a-b74b-da286cfd2ff0', 'Abuelo Corazón Cielo', 'nina', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true, true, now() - interval '5110464 seconds'),
  ('a5a6f117-9f20-450b-bf1c-c4084567561e', 'Hino da River Eterno', 'Alain Merens', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true, true, now() - interval '5202131 seconds'),
  ('ee78e39f-2d1b-430b-8ef5-5f534b3f6548', 'Cura de la Bosque', '', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', true, false, now() - interval '5232663 seconds'),
  ('f5798ea3-5e89-40ef-a9ea-d77ee0eadd0a', 'Abuelo Medicina', 'Peia / Herbert Quinteros, Peia', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', true, false, now() - interval '5376799 seconds'),
  ('bec259ff-9567-4b94-8a23-1c6c23199eeb', 'Espíritu de la Piedra Amor', 'Fiona Helmer', true, NULL, true, true, now() - interval '5513482 seconds'),
  ('2768179a-5375-44da-864a-0ea22c25982f', 'Fuerza de la Floresta Sagrado', 'Ayla Nereo &amp; Alain Merens', false, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', false, true, now() - interval '5623780 seconds');
INSERT INTO public.compositions (id, title, original_author, is_public, owner_id, has_chords, has_melody, created_at) VALUES
  ('66660130-1330-43d0-a53d-ba46d53bf3cd', 'Llamado del Flor', 'Diego Palma', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true, true, now() - interval '5624441 seconds'),
  ('71e7a154-dbe7-4f8d-85d9-c57c5ae5a667', 'Danza del Agua Verde', 'Santo Daime', false, NULL, true, true, now() - interval '5848342 seconds'),
  ('a19045c6-158c-4f55-8337-c634bff48f7f', 'Canção do Estrella', 'Alain Merens', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true, false, now() - interval '6641446 seconds'),
  ('172ae043-f763-4708-b4be-2aa7c239b74c', 'Viento del River Profundo', 'Traditional', true, NULL, false, true, now() - interval '6919200 seconds'),
  ('ab02b3b9-1cee-4eef-b76e-513211075d31', 'Llamado del Colibrí Brillante', 'Alonso del Río', false, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', false, false, now() - interval '6947818 seconds'),
  ('1d7ee9ff-50ee-499d-a1ff-4e77fce6719c', 'Abuelita Cóndor Divino', 'Dario Hampi Pakari', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true, false, now() - interval '7068297 seconds'),
  ('a783662c-ac44-4165-979e-52f04722ea60', 'Guardián del Floresta Sagrada', '', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', true, true, now() - interval '7130295 seconds'),
  ('a9323fb2-e248-4c27-bfd5-323d2a3cefe0', 'Cura de la Floresta', 'Dario Hampi Pakari', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true, false, now() - interval '7310471 seconds'),
  ('b3cf8d07-9ca1-4ebd-884e-cf50c8716d0f', 'Espíritu de la Medicina Cósmico 🔥', 'Fiona Helmer', false, NULL, true, true, now() - interval '7644007 seconds'),
  ('9c2b4f5e-d6d2-47ec-90dc-477579f9348b', 'Voz del Estrella', 'Ayla Nereo', true, NULL, true, true, now() - interval '7821637 seconds'),
  ('a6745d8b-f2b3-4503-a6f4-191410cbfed5', 'Song of the Colibrí Brillante', 'Danit', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', true, false, now() - interval '7885495 seconds'),
  ('d17e8406-5a6a-444f-a73b-73f4e47c04a0', 'Grandmother''s Ecos del Bosque Verde', 'Nina', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true, true, now() - interval '7897273 seconds'),
  ('abfe054f-f4b1-436f-9eb2-4cef7f8d970e', 'Voz del Flor', 'Diego Palma', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', true, false, now() - interval '8033852 seconds'),
  ('83f7e119-3c33-4422-be56-d23afa1ef3fc', 'Canto al Sol', 'Alain Merens', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true, true, now() - interval '8327961 seconds'),
  ('21d6fd83-f41a-4346-aae0-2065afb482da', 'Voz del Colibrí', 'Curawaka', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', true, false, now() - interval '8587221 seconds'),
  ('737c7840-44d5-4434-a57f-8c7e121e07ba', 'Espíritu de la River', 'Dario Hampi Pakari', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', true, true, now() - interval '8883016 seconds'),
  ('a5836ce2-710f-461a-9c62-5a62358d5175', 'Voz del Pachamama Amor', 'Traditional &amp; Fiona Helmer', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', true, true, now() - interval '8956649 seconds'),
  ('a91d15b0-7db6-4f69-9f7e-5484e4a66fbe', 'Sinfonía del Jaguar Bendita', 'Nina', true, NULL, true, true, now() - interval '9374199 seconds'),
  ('6291e88d-8086-4532-8335-2676400c43b7', 'Guardián del Estrella', NULL, true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true, true, now() - interval '9630966 seconds'),
  ('04bdd5ec-d8ec-45c2-83f8-e8cd8a9b78c9', 'Espíritu de la River Amor', 'Cari  El', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', true, true, now() - interval '10093241 seconds'),
  ('e60fd1a9-3a0d-4421-b6c1-a2961116682a', 'Danza del Corazón Viejo', 'Cari El', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', true, true, now() - interval '10471921 seconds'),
  ('59d20e92-bfbe-440c-adc9-040e250e295f', 'Fuerza de la Piedra Viejo', 'Santo  Daime', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', false, true, now() - interval '10744869 seconds'),
  ('85759c47-e9bc-49f1-aa9c-5b3958bf32be', 'Latido de la Floresta Cósmico', 'Traditional', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', true, true, now() - interval '10771504 seconds'),
  ('67ccd286-69e1-4d20-af94-607f852c245e', 'Llamado del Colibrí Sagrado', '  Curawaka ', false, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', false, false, now() - interval '11065714 seconds'),
  ('a11f10ef-6268-4134-9160-fdf029962b3a', 'Danza del Flor Profundo', 'Fiona Helmer', true, NULL, true, true, now() - interval '11074617 seconds'),
  ('cc5670c9-3c55-4bb7-84bc-0b9938b38e89', 'Latido de la Flor Cielo', 'Curawaka', false, NULL, true, false, now() - interval '11177468 seconds'),
  ('f804949e-cc34-4f4e-b95d-3170aa63af64', 'Pájaro Estrella Cósmico', 'Santo Daime', false, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', false, false, now() - interval '11385886 seconds'),
  ('57b654b8-2285-4e48-9c0c-5fe8acdebfb5', 'Song of the Águila Brillante', 'Danit &amp; Ayla Schafer / Xavier Rudd', true, NULL, true, true, now() - interval '11486715 seconds'),
  ('ee82ef40-a85c-4504-8fab-8e66800879f4', 'Camino del Floresta Limpio', 'Traditional &amp; Alonso del Río', true, NULL, true, true, now() - interval '11634673 seconds'),
  ('e1ea9259-89e5-4d21-b5cd-6ebd51bf3630', 'Danza del Montaña Sagrada', 'Herbert Quinteros', true, NULL, true, true, now() - interval '11723005 seconds'),
  ('78149d0e-9fd1-4310-9eb2-1139e7ae23a6', 'Cura de la Vida Brillante', 'Danit', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', false, false, now() - interval '11776909 seconds'),
  ('bece6763-f91c-4387-9918-20099435ad08', 'Sinfonía del Colibrí', 'Herbert Quinteros', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', false, true, now() - interval '12252098 seconds'),
  ('41ebc62c-46c4-42e1-a763-b78e856e8eec', 'Song of the Lluvia', 'Curawaka', true, NULL, true, true, now() - interval '12306389 seconds'),
  ('59c6f582-90f2-4fb6-ab76-6b857022c5f5', 'Ecos del Cielo Universal', 'Santo Daime', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', true, false, now() - interval '12493399 seconds'),
  ('32ab30df-f824-4251-8331-37657436c7c9', 'Canto al Mountain Viejo', NULL, true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', false, true, now() - interval '12659743 seconds'),
  ('9bcf584e-cf95-4cfd-994d-af3ed7cab146', 'Espíritu de la River', NULL, true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', false, false, now() - interval '12830741 seconds'),
  ('0bc5713b-818f-4b57-9e54-1e4dcd4ea493', 'Fuerza de la Estrella Curandero', 'Nina', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', true, true, now() - interval '13680689 seconds'),
  ('c4999f38-543a-4397-93e9-4a1b665f8e6a', 'Abuelita Fuego Verde', 'Diego Palma', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', false, true, now() - interval '13705609 seconds'),
  ('b129b2b6-db71-4735-aa70-42c1daba3445', 'Voz del Tierra Eterno', 'Herbert Quinteros', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', true, true, now() - interval '13781872 seconds'),
  ('059d201a-7b0d-4079-875d-e0674f93901d', 'Viento del Vida Profundo', '  Curawaka ', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true, false, now() - interval '14142193 seconds'),
  ('d7ecf51d-0677-4a78-b007-9da39585392a', 'Camino del Estrella', NULL, false, NULL, false, true, now() - interval '14426695 seconds'),
  ('542d4011-057f-46c4-8362-233e5b63fef3', 'Canção do Estrella Divino', 'Ayla Schafer', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', true, true, now() - interval '14486546 seconds'),
  ('c3dc3ade-3247-491d-bbb9-501ec297b64e', 'Camino del Estrella', 'Curawaka', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', true, true, now() - interval '14540204 seconds'),
  ('62146eaf-eec7-4991-b592-3591a813e026', 'Viento del Lluvia Divino', 'Alain Merens', true, NULL, false, true, now() - interval '14740208 seconds'),
  ('f23b3091-9817-4ae4-a30c-eff186bcc760', 'Canção do Colibrí', 'Traditional', true, NULL, false, true, now() - interval '14783800 seconds'),
  ('81cbca26-dce6-4053-9bcd-c334931ea89b', 'Guardián del Corazón Universal', 'Santo Daime', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', true, true, now() - interval '15317426 seconds'),
  ('a5352c63-7341-4406-820d-795dd5c5d97d', 'Rezo al Mountain Viejo', 'Traditional (Umbanda)', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', true, false, now() - interval '15417781 seconds'),
  ('97bedd7b-5f8a-4b79-8651-4728754d21d4', 'Voz del Medicina Sagrada', 'Peia', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', true, true, now() - interval '15425245 seconds'),
  ('f91f8923-8fd1-4536-b6bb-4b71a873fcff', 'Espíritu de la Águila Cósmico', 'Nina &amp; Traditional (Camino Rojo)', false, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true, true, now() - interval '15546869 seconds'),
  ('b0c4e1d5-1c43-4af4-9991-b6147794aaf6', 'Latido de la River', 'Nina', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', true, true, now() - interval '15628508 seconds');
INSERT INTO public.compositions (id, title, original_author, is_public, owner_id, has_chords, has_melody, created_at) VALUES
  ('70ac6a2a-568d-4953-83ff-c201e17380db', 'Guardián del Tierra Divino', 'Ayla Nereo', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', true, true, now() - interval '15739297 seconds'),
  ('86860741-6952-4185-a19c-9c8d32e6501f', 'Song of the Selva', 'Shimshai', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', false, true, now() - interval '15755264 seconds'),
  ('2409957d-4e89-4045-b14b-9e7a9c2b60f7', 'Camino del Lluvia Curandero', 'Traditional (Umbanda) / Ayla Schafer', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true, false, now() - interval '15993595 seconds'),
  ('462d0bbb-8397-44ae-9d81-dd26ebba6666', 'Abuelita Corazón', 'Fiona Helmer', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', true, true, now() - interval '16726128 seconds'),
  ('b2d464ad-37f4-4860-bdd8-6cb33e5841ba', 'Sinfonía del Corazón', 'Fiona Helmer', false, NULL, true, true, now() - interval '16779197 seconds'),
  ('b7e35d1f-f931-467b-a376-dcac5d84b337', 'Canto al Colibrí', 'Nina', true, NULL, true, false, now() - interval '16939438 seconds'),
  ('323142cb-d37d-44aa-897d-0e9986189d4b', 'Abuelita Tierra Universal', 'Fiona Helmer', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', true, false, now() - interval '17035401 seconds'),
  ('bbf76f5e-c033-405e-acee-7d89f760525d', 'Luz de la Agua Bendita', 'Alonso del Río', false, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', true, false, now() - interval '17071057 seconds'),
  ('e2958212-7784-4505-8df1-2997511314db', 'Fuerza de la Bosque Cielo', 'Herbert Quinteros', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', true, false, now() - interval '17101045 seconds'),
  ('80d25c41-cbf0-492e-8720-9da493fe953f', 'Ecos del Montaña Puro', NULL, true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', true, false, now() - interval '17532082 seconds'),
  ('56b61cde-d346-4d2e-b7c1-23694eb1cccf', 'Camino del Tierra Cósmico', 'Dario Hampi Pakari', true, NULL, true, true, now() - interval '17582011 seconds'),
  ('1b7cdee7-8470-4108-bb77-3478a88a7f01', 'Hino da Cóndor', '', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', true, true, now() - interval '18455448 seconds'),
  ('9e54ae79-6941-46b2-846b-0d0c60ec2904', 'Abuelo Bosque Cielo', NULL, true, NULL, true, false, now() - interval '18559438 seconds'),
  ('cc797377-3c6a-4172-bda9-7be7094ecfdc', 'Ecos del Lluvia Sagrada', 'Ayla Schafer', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', true, false, now() - interval '18609100 seconds'),
  ('b062a7cb-49a6-4216-a0e7-77d7af3909a0', 'Fuerza de la Vida', 'Shimshai', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', false, true, now() - interval '19582126 seconds'),
  ('fd1e663c-8daf-4ce6-8e0a-af43aab15540', 'Luz de la Cóndor Amor', 'Danit', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', false, false, now() - interval '19720871 seconds'),
  ('307b5720-830e-421e-b129-db5a4240778e', 'Abuelita Vida', 'Traditional (Umbanda) and Santo Daime', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', true, true, now() - interval '20034864 seconds'),
  ('e3c28e92-2149-4a6b-a719-9d90d51c5baa', 'Luz de la River Puro 🔥', 'Diego Palma', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true, true, now() - interval '20138089 seconds'),
  ('ee2a6364-cab6-43ab-8ed5-15ee68134133', 'Fuerza de la Sol', NULL, true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', true, false, now() - interval '20262141 seconds'),
  ('06e9e7b6-8aee-4835-9f0e-c69d4a3a87aa', 'Abuelo Cielo Profundo', 'Shimshai', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true, false, now() - interval '20495874 seconds'),
  ('f7b2d7d7-2c9a-4436-af59-77cdadc67f3c', 'Viento del Agua Bendita', 'Ayla Schafer', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true, true, now() - interval '21337973 seconds'),
  ('749f6dce-4018-4d09-9c14-8799f06121b9', 'Cura de la Piedra', '', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true, true, now() - interval '21449351 seconds'),
  ('687780d0-935b-4a6a-9696-e48c8bccd0e5', 'Fuerza de la Mar', '', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true, false, now() - interval '21597400 seconds'),
  ('f6e5e7bc-19aa-4b62-a5bb-a7cccb604d0b', 'Canção do Mountain Curandero', 'Danit', true, NULL, true, false, now() - interval '21671674 seconds'),
  ('3845f230-cd7e-41e1-b3dd-5faefad6ef96', 'Danza del Jaguar Universal', 'Danit', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true, false, now() - interval '22020302 seconds'),
  ('d9e1f95d-6e04-4331-b1ba-60d5051c00d9', 'Abuelita Mar', 'Traditional (Umbanda)', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', true, true, now() - interval '22337818 seconds'),
  ('b882d663-3c59-40c8-8385-7b3852aa72c8', 'Rezo al Águila', NULL, true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true, false, now() - interval '22534552 seconds'),
  ('a358a941-e525-464c-9555-9ec446b4bdb8', 'Abuelo Sol Cósmico', 'Dario Hampi Pakari &amp; Ayla Schafer', true, NULL, true, true, now() - interval '22629208 seconds'),
  ('2ddadd5b-ff3f-4370-9f44-6670396a6e2f', 'Viento del Pachamama Viejo', 'Peia', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', true, false, now() - interval '22868744 seconds'),
  ('575b1997-3b42-48fa-acf3-a5bbec7d608a', 'Cura de la Luna', 'traditional (camino rojo)', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', true, false, now() - interval '22894435 seconds'),
  ('29490f14-385a-462c-b798-159ff6218b4d', 'Guardián del Mountain', 'Traditional', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', false, true, now() - interval '23226918 seconds'),
  ('3fe5611f-77e7-41cf-97ce-6d6a6b39d21c', 'Prayer for the Sol', 'Danit', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', true, false, now() - interval '23509872 seconds'),
  ('ccd5d47e-c82d-4f5c-845b-4d86abc0c605', 'Viento del River Limpio', NULL, false, NULL, true, false, now() - interval '23569914 seconds'),
  ('606c94f3-6eab-4f6f-9e30-0228afcb4b92', 'Rezo al Cóndor Cielo', 'Alonso del Río and Peia', false, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', false, false, now() - interval '23663538 seconds'),
  ('cb012d44-9e32-4dfd-a97e-e584a80e44f8', 'Espíritu de la Luna Amor', 'Traditional', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', true, false, now() - interval '23841689 seconds'),
  ('dbce5509-7b40-4fbf-bf49-4456b10e02e3', 'Camino del Pachamama Profundo', 'Herbert Quinteros &amp; Alain Merens', false, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', true, true, now() - interval '24060313 seconds'),
  ('daa5c58a-165c-4355-a354-3af12675c168', 'Luz de la Flor', 'Traditional (Umbanda)', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', true, true, now() - interval '24452530 seconds'),
  ('b52d7d61-6d62-488b-b33a-d5eaa9f5aa67', 'Danza del Mountain', 'Danit', false, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', true, true, now() - interval '25048309 seconds'),
  ('8d157e2b-d383-4ab9-b078-5ef511b10085', 'Voz del Vida', 'Diego Palma', true, NULL, true, true, now() - interval '25280479 seconds'),
  ('958d0c69-22f1-404f-b911-946d3d52aaa7', 'Grandmother''s Danza del Vida Divino', 'Xavier Rudd', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', true, true, now() - interval '25399048 seconds'),
  ('38536e21-a292-46d7-b403-c971e39a774e', 'Sinfonía del Cielo Amor', 'Traditional', true, NULL, true, true, now() - interval '25558660 seconds'),
  ('2a885ef5-6c00-45f5-9f84-0f4ef44fae62', 'Abuelo Floresta', 'Traditional (Umbanda)', true, NULL, true, true, now() - interval '25874302 seconds'),
  ('ed028840-31be-4ee4-83af-551b14251f71', 'Ecos del Mar Sagrado', 'Santo Daime', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true, true, now() - interval '26056412 seconds'),
  ('bfada781-5c74-4fcd-bd77-890cb0303481', 'Canção do River Divino', '', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', true, true, now() - interval '26093984 seconds'),
  ('0699a4cd-f7b6-4cf3-b8c3-fa0712db1593', 'Latido de la Flor', 'Cari El', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true, false, now() - interval '26098700 seconds'),
  ('dc0789f1-1a6a-4a8a-ba56-f44c76c06fc6', 'Abuelo Estrella', NULL, true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', true, false, now() - interval '26222565 seconds'),
  ('3faac046-e8db-4354-b779-6c9a9c945224', 'Danza del Corazón Cósmico', 'Alonso del Río', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', false, true, now() - interval '26247146 seconds'),
  ('f0368cda-0f9f-4d91-8f30-56dbae59e20f', 'Viento del Luna Limpio (Luz de la Piedra version, as sung at the long night ceremony)', 'Santo Daime', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', false, true, now() - interval '26319113 seconds'),
  ('8eccfcc7-6b46-437c-b59d-8f1608a42f57', 'Sinfonía del Cóndor Amor', 'Fiona Helmer &amp; Cari El', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', false, false, now() - interval '26435624 seconds'),
  ('530be2e2-f9ee-42e9-ab60-5c23b4c64838', 'Abuelita Bosque Ancestral', 'Santo Daime', true, NULL, false, false, now() - interval '26460765 seconds');
INSERT INTO public.compositions (id, title, original_author, is_public, owner_id, has_chords, has_melody, created_at) VALUES
  ('200e81ff-6e16-4935-b049-c35fb75078d9', 'Canto al Jaguar Sagrada 🔥', 'Traditional (Camino Rojo)', true, NULL, true, true, now() - interval '26546794 seconds'),
  ('e4c7ac25-4c15-43dd-89ff-d267f0ccf0f2', 'Guardián del Colibrí', 'Santo Daime', false, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', true, true, now() - interval '26654029 seconds'),
  ('32cd41ca-3dda-4213-b5c8-33e641281e27', 'Llamado del Montaña Limpio', 'Peia', true, NULL, true, true, now() - interval '26660022 seconds'),
  ('df9b212c-9a05-4f6f-aa8b-b3b9317e9add', 'Abuelo Floresta Sagrada', 'Nina', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', true, true, now() - interval '26678771 seconds'),
  ('1056d0b8-a9a5-4494-a08a-08ca955e504b', 'Hino da Bosque', 'Traditional', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', true, true, now() - interval '26816071 seconds'),
  ('aa99a6b9-b9b9-4789-9860-46ca51263ba1', 'Luz de la Estrella Ancestral 🔥', 'Santo Daime', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', false, true, now() - interval '26883881 seconds'),
  ('22625032-aa25-44cd-9241-1549fb06f250', 'Abuelo Piedra', 'Traditional (Umbanda)', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true, true, now() - interval '27279619 seconds'),
  ('79d0e2dd-86e2-4bcf-9719-36264b59af66', 'Sinfonía del Estrella', 'Traditional (Camino Rojo)', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', true, true, now() - interval '27529119 seconds'),
  ('5bfab953-3b39-48b6-aced-68850b672192', 'Luz de la Lluvia', 'Ayla Schafer', false, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', true, true, now() - interval '27689968 seconds'),
  ('a5c2d895-0043-4e96-a992-636666842afe', 'Espíritu de la River Puro', 'Fiona Helmer', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true, false, now() - interval '27769436 seconds'),
  ('d2ac829b-4d1c-4079-8aed-570008347392', 'Song of the Fuego', 'Cari El', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', false, true, now() - interval '27783008 seconds'),
  ('11161817-5278-47d6-afe8-e9e843b7197c', 'Fuerza de la Flor Divino', 'Santo Daime', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', true, false, now() - interval '27903452 seconds'),
  ('ef675cfa-ed33-45b6-b9ab-abc4e20344fd', 'Sinfonía del Piedra Amor', 'Danit', false, NULL, true, true, now() - interval '27912967 seconds'),
  ('5df38b1f-1c30-4520-8dfc-f15290899221', 'Abuelita Pachamama', 'Xavier Rudd', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', true, false, now() - interval '28037512 seconds'),
  ('8113f780-3d18-4b12-a291-ee6cbbb1ce81', 'Canção do Estrella Profundo', 'Alain Merens / Traditional / Santo Daime', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', true, true, now() - interval '28556986 seconds'),
  ('feb70e68-d95b-4bf8-a892-ff84d967eec8', 'Abuelita Sol Amor', 'Santo Daime / Ayla Nereo', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true, true, now() - interval '29140138 seconds'),
  ('dd2fcd05-16b0-4bef-aaab-f62f97a0a161', 'Viento del Mar Profundo', 'Ayla Schafer', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true, false, now() - interval '29149317 seconds'),
  ('6cc92741-cdb3-4f2c-b2a9-867e46d5053c', 'Espíritu de la Luna', 'Dario Hampi Pakari', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true, false, now() - interval '29304255 seconds'),
  ('358407eb-fb6c-4725-b74c-d45b24229d75', 'Llamado del Fuego Limpio', 'Herbert Quinteros', false, NULL, true, true, now() - interval '29848026 seconds'),
  ('94f3dcd2-0a38-4de4-bcc6-f6daaab8187d', 'Latido de la Águila Viejo', '', false, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', false, false, now() - interval '29899607 seconds'),
  ('3bd6bdba-9a7b-4fbf-851f-2d7da88fdd46', 'Hino da Bosque Cielo', 'Diego Palma', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', true, true, now() - interval '30041358 seconds'),
  ('e33af2d0-0ba3-4e1b-9908-d16becf13504', 'Danza del Floresta', 'Alonso del Río & Traditional (Umbanda)', false, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true, false, now() - interval '30317191 seconds'),
  ('54cd2202-1805-45d5-b504-17f2e0c5dbd3', 'Latido de la Bosque Amor', 'Cari El', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true, false, now() - interval '30827842 seconds'),
  ('d079f01d-65eb-4aaf-a010-9378d8dd4d32', 'Prayer for the Mountain Divino', 'Traditional (Camino Rojo)', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true, true, now() - interval '31017761 seconds'),
  ('ad84f534-f0af-4eba-9384-f2ceb3fe043b', 'Abuelita Sol Amor', 'Traditional (Umbanda) and Diego Palma and Traditional', true, NULL, true, false, now() - interval '31107468 seconds'),
  ('d64916ce-586f-4a98-9798-d53e991fa6fd', 'Canção do Luna Puro', 'Ayla Schafer', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true, true, now() - interval '31677471 seconds'),
  ('bd5e5e04-a630-434b-9c40-ce7642ea0bed', 'Guardián del Tierra', 'Danit', false, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', true, true, now() - interval '31837292 seconds'),
  ('cb6d58ff-12e0-46dd-bb78-8367735c86b8', 'Guardián del Estrella', NULL, true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', true, true, now() - interval '31914022 seconds'),
  ('064b08a6-435e-4b7e-b1c6-f4465b88dc3d', 'Canção do Jaguar Puro', 'Xavier Rudd', true, NULL, true, true, now() - interval '32089837 seconds'),
  ('b8430aee-1931-4ff8-821c-0e4419d2420c', 'Camino del Mountain Amor', 'Santo Daime', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', true, true, now() - interval '32097542 seconds'),
  ('5f3942e4-8cac-4625-ac45-c0d81242addb', 'Latido de la Cielo Brillante', 'Danit', false, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', true, true, now() - interval '32397741 seconds'),
  ('717cd0b7-a458-4b39-bbd6-5937adaa1600', 'Sinfonía del Fuego', 'Xavier Rudd', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', true, false, now() - interval '32587333 seconds'),
  ('286a9ed5-f161-471e-b43e-2445730f9aa1', 'Rezo al Floresta Amor', 'Curawaka', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', true, false, now() - interval '32669911 seconds'),
  ('d058b4bd-dccd-44de-a307-290997a0694c', 'Canto al Luna Sagrado', 'Cari El', false, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true, true, now() - interval '32862962 seconds'),
  ('448685e7-08d4-4321-a89c-64c941d91800', 'Fuerza de la Colibrí', 'Alonso del Río', true, NULL, true, true, now() - interval '32909907 seconds'),
  ('389eb552-0c1d-4ae6-a4b5-5864dec98eac', 'Canto al Tierra Eterno', 'Fiona Helmer', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', false, true, now() - interval '32914489 seconds'),
  ('cb0eb8a4-60c5-448e-a4e1-b7c03fb1e039', 'Fuerza de la Agua', 'Nico Pérez', false, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', true, false, now() - interval '32933528 seconds'),
  ('c592bba5-19a4-4aaa-b822-1bddf3880efa', 'Danza del Jaguar', 'Fiona Helmer', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', true, true, now() - interval '33121051 seconds'),
  ('c6645abe-0b8e-4fbe-a8cb-2ced40a97017', 'Hino da Cóndor Gratitud', 'Traditional', false, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true, true, now() - interval '33402909 seconds'),
  ('5b8c598b-50f4-40c8-81af-451687b40da0', 'Canto al Mountain Cielo', 'Herbert Quinteros', true, NULL, false, false, now() - interval '33426822 seconds'),
  ('5d7797f3-1197-4402-ab9f-932a60527469', 'Canção do Cóndor Divino 🔥', 'Ayla Nereo', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true, true, now() - interval '33428092 seconds'),
  ('c7f4809e-7051-4101-820b-e3853a90ec69', 'Espíritu de la Floresta Verde', 'Nico Pérez', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', true, false, now() - interval '33516198 seconds'),
  ('d9a53b0f-1ca3-464d-ac10-26cf37d2131e', 'Canto al Mar Cielo', 'Danit', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', true, true, now() - interval '33575534 seconds'),
  ('e6eae749-101c-490e-bcc3-67ab18e1e480', 'Canção do Flor', 'Curawaka', false, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', true, false, now() - interval '33622974 seconds'),
  ('23eb036a-f5e9-4ffc-b7ba-6a9b69b6563d', 'Llamado del Cielo Sagrada', 'Fiona Helmer', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', true, false, now() - interval '33738817 seconds'),
  ('1414a949-8f0a-49f5-98b6-e44c75720330', 'Canto al Piedra', 'Cari El', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', true, true, now() - interval '33849574 seconds'),
  ('dcd12197-6614-4153-990c-2e47e6440b80', 'Rezo al Selva', '', true, NULL, true, true, now() - interval '33924294 seconds'),
  ('ba3bece6-5d52-4750-b96f-13f364709da7', 'Llamado del Vida Brillante', 'Shimshai', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true, true, now() - interval '34447370 seconds'),
  ('b8bfe11f-192a-47bc-9d3c-102e341f663f', 'Ecos del Corazón', 'Traditional (Camino Rojo)', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', false, true, now() - interval '34485652 seconds'),
  ('8704bdec-c3a2-4423-ab16-5a2eb8870c96', 'Voz del Estrella Divino', 'Herbert Quinteros, Shimshai & Alonso del Río', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', true, true, now() - interval '34503396 seconds');

-- Song versions (219)
INSERT INTO public.song_versions (id, composition_id, version_name, content_chordpro, melody_notation, key, capo, tuning, contributor_id, youtube_url, spotify_url, soundcloud_url, created_at) VALUES
  ('9e35b32e-bd6f-4864-9ca0-232fbc3228bd', '43f033ce-9715-4346-9ac1-1a55182ae6f3', 'Standard', '{title: Morning Sunrise}
{artist: Shimshai}
{key: C}
{Capo: 2}
[C]Morning sun [G]rising high
[Am]Over the [F]mountain top
[Em]And there is [G]light

{subtitle: Another song}', NULL, 'C', 2, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'https://www.youtube.com/watch?v=dbbZGLR_e20', 'https://open.spotify.com/track/2HZQQ8PriDD1z7tcvAU9KH', 'https://soundcloud.com/user-778401370/la-curandera', now() - interval '0 seconds'),
  ('a6c2bea4-ef98-4eb9-bfbd-a7e8ab761fbb', '2358a04a-e7aa-43d2-b0db-9d2ec523bbc6', 'Standard', '{title: Danza del Cielo Curandero}
{artist: Herbert Quinteros}
{key: E}
{c: Canto para abrir el fuego}

[E]Danza del cielo [A]curandero
[B]Baila con el [E]viento entero
[E]Luna, luna, [A]luna llena
[B]Brilla en la [E]noche entera', NULL, 'E', 3, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'https://www.youtube.com/watch?v=dbbZGLR_e20', 'https://open.spotify.com/track/2HZQQ8PriDD1z7tcvAU9KH', 'https://soundcloud.com/user-778401370/la-curandera', now() - interval '60 seconds'),
  ('6c67d1c5-f3b6-4ff2-ba86-174b058f6e3b', '379a01a8-552c-4688-8afc-dfe44591bb9e', 'Standard', '{title: Down to the River}
{artist: Traditional (Spiritual)}

              G
As I went down in the river to pray
D                      G
Studying about that good old way
                     D      G
And who shall wear the starry crown

Page 1/2

   D         G
O sisters, let’s go down
Let’s go down, come on down
       D                G
O sisters, let’s go down, don’t you wait
Down in the river to pray

Page 2/2

And who shall wear the robe and crown', NULL, 'G', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'https://www.youtube.com/watch?v=6R7pxNzEAaM', NULL, NULL, now() - interval '120 seconds'),
  ('572e0b51-4830-4850-b918-a64c47a9e3a2', '9919e38c-3fcf-4b6a-b0fe-7c4c94c801c3', 'Temazcal version', '{title: Agüita que Vienes}
{artist: Traditional}
{key: Am}
{capo: 2}
{ci: Temazcal version – slower, no chorus}

[Am]Agüitay, [G]agüita
[F]Agüita que [Em]vienes', NULL, 'Am', 2, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', NULL, NULL, NULL, now() - interval '180 seconds'),
  ('60dd65a3-efc2-43da-867f-8d0cc82e03cf', '8acb59ae-d67b-42a8-b9fb-ae353ede7dfb', 'Standard', '{title: Donne Ricche}
{artist: Nico Pérez & Fiona Helmer}
{key: Gb}

Gbmaj7
Mia nonna quando è morta
Db                Eb
Non mi ha lasciato niente
Gbmaj7  Dbmaj7  Ebmaj7
Andrè, Raffaè, cantate con me
       Bbm        Fm
Comprami- un vestito nuovo
       Ab
Che del cu-lo non ne ho più

Page 1/2', NULL, 'Gb', 0, 'Half-Step Down', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, NULL, NULL, now() - interval '180 seconds'),
  ('475ea880-d487-4585-bb65-850e3acb548c', '9919e38c-3fcf-4b6a-b0fe-7c4c94c801c3', 'Standard', '{title: Agüita que Vienes}
{artist: Traditional}
{key: Bm}

[Bm]Agüitay, [A]agüita
[G]Agüita que [F#m]vienes
[Bm]Del cielo a la [A]tierra
[G]Lavando mis [Bm]penas', NULL, 'Bm', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', NULL, NULL, NULL, now() - interval '240 seconds'),
  ('72630a9e-2a16-473b-b1ad-760d13aa2ad1', 'ca7bba27-3b15-4eaa-87a3-20def74c53af', 'Standard', '{title: Aguita de la Vida}
{artist: Danit}
{key: Em}

[Em]Aguita de la [C]vida
[G]Lava mi co[D]razón
[Em]Aguita de la [C]vida
[G]Dame tu ben[D]dición', NULL, 'Em', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, 'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC', NULL, now() - interval '300 seconds'),
  ('4264eff5-d21d-4f98-b9eb-c7d9d1a1dfda', 'f718e0e5-80cb-4613-8e45-62c74ebdbe85', 'Standard', '{title: Pachamama}
{artist: Medicine Family}
{key: G}
{ci: Temazcal version}

{soc}
[G]Pachamama, [C]Pachamama
[D]Madre tierra, [G]te canto
{eoc}

[Em]Agua, [C]fuego, [G]tierra y [D]viento
[Em]Cuatro [C]fuerzas en mi [G]cuerpo

{c: Repetir el coro tres veces}
{tag: Santa Maria}', NULL, 'G', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, NULL, now() - interval '360 seconds'),
  ('df11b8e6-9001-444d-abc5-52731ba2dd14', '32fbb4f6-cd59-486f-8f2b-59b3cdfc0b39', 'Standard', '{title: Espíritu del agua}
{artist: Traditional}
{key: Am}

[Am]Espíritu del [G]agua
[F]Límpiame el co[E]razón
[Am]Espíritu del [G]agua
[F]Llévate mi do[E]lor', NULL, 'Am', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', NULL, NULL, NULL, now() - interval '420 seconds'),
  ('bf617512-511d-46d1-a0e7-75b20152cd95', 'edef27fa-a31f-4720-a66f-4890a2582898', 'Standard', '{title: Grandmother Earth}
{artist: Traditional}

Grandmother Earth, I feel you under my feet
Grandmother Earth, I hear your heartbeat
Grandmother Earth, carry me home
Grandmother Earth, I am never alone', NULL, 'Am', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, NULL, NULL, now() - interval '480 seconds'),
  ('501d75c1-ce67-48a5-86cc-d114eeec597d', '969080b6-f4d5-44e9-b236-47a46b949f30', 'Standard', '{title: Test Song}
[Am]Hello [G]World', NULL, 'Am', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NULL, NULL, NULL, now() - interval '540 seconds'),
  ('cc214dc0-bf5a-46cf-b056-09668aa605c7', '79c94128-bb8d-46af-b175-260729e5003a', 'Standard', '{t: Test Key Capo}
{a: Tester}
{k: Em}
{capo: 3}
[Em]Testing [G]Key and Capo', NULL, 'Em', 3, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, NULL, NULL, now() - interval '600 seconds'),
  ('4a82cc40-188c-4327-aea5-3c0644f31c1e', '7acc5907-3a0f-4f44-99c8-8de986b11aba', 'Standard', '{title: Canto Sem Fim}
{artist: Santo Daime}
{key: G}

[G]Eu canto a canção [C]que não tem fim
[D]Coração aberto [G]dentro de mim
[G]Estou firme no [C]meu lugar
[D]Com a força da [G]mãe pra me guiar', 'X:1
T:Canto Sem Fim
M:4/4
L:1/8
K:G
G2 B2 d2 B2 | A2 c2 e2 c2 | G4 z4 |]', 'G', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, NULL, NULL, now() - interval '660 seconds'),
  ('a1000bf7-0be9-497e-a2a4-8c697bd6daa2', '6f06959c-c905-4afb-a53e-810b8b1892eb', 'Standard', '{title: Eu sou Santa Maria}
{author: traditional}
{key: D}

[D]Eu sou Santa [A]Maria
[G]Eu sou a [D]luz do dia', NULL, 'D', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, NULL, NULL, now() - interval '720 seconds'),
  ('ce71abfb-39cc-4d69-8e5c-4771c0bd4a59', '22c8c970-c28c-4631-bf0c-db00a5af2a61', 'Standard', '', NULL, NULL, 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', NULL, NULL, NULL, now() - interval '840 seconds'),
  ('b1b10b39-4136-4ff0-bb7c-3ee6c52f7fa5', '379b6737-e754-4778-94a7-d8e719c42a25', 'Standard', '{title: Grandmother''s Song of the Thousand Rivers That Flow Together Toward the Ocean of Forgiveness 🌊}
{artist: Ayla Nereo, Danit / Shimshai and Cari El}
{key: D}
{capo: 1}

[D]River number 1 is [G]flowing to the [A]sea
[Bm]Carry my [G]sorrow, [A]set my spirit [D]free

[D]River number 2 is [G]flowing to the [A]sea
[Bm]Carry my [G]sorrow, [A]set my spirit [D]free

[D]River number 3 is [G]flowing to the [A]sea
[Bm]Carry my [G]sorrow, [A]set my spirit [D]free

[D]River number 4 is [G]flowing to the [A]sea
[Bm]Carry my [G]sorrow, [A]set my spirit [D]free

[D]River number 5 is [G]flowing to the [A]sea
[Bm]Carry my [G]sorrow, [A]set my spirit [D]free

[D]River number 6 is [G]flowing to the [A]sea
[Bm]Carry my [G]sorrow, [A]set my spirit [D]free

[D]River number 7 is [G]flowing to the [A]sea
[Bm]Carry my [G]sorrow, [A]set my spirit [D]free

[D]River number 8 is [G]flowing to the [A]sea
[Bm]Carry my [G]sorrow, [A]set my spirit [D]free

[D]River number 9 is [G]flowing to the [A]sea
[Bm]Carry my [G]sorrow, [A]set my spirit [D]free

[D]River number 10 is [G]flowing to the [A]sea
[Bm]Carry my [G]sorrow, [A]set my spirit [D]free

[D]River number 11 is [G]flowing to the [A]sea
[Bm]Carry my [G]sorrow, [A]set my spirit [D]free

[D]River number 12 is [G]flowing to the [A]sea
[Bm]Carry my [G]sorrow, [A]set my spirit [D]free

[D]River number 13 is [G]flowing to the [A]sea
[Bm]Carry my [G]sorrow, [A]set my spirit [D]free

[D]River number 14 is [G]flowing to the [A]sea
[Bm]Carry my [G]sorrow, [A]set my spirit [D]free

[D]River number 15 is [G]flowing to the [A]sea
[Bm]Carry my [G]sorrow, [A]set my spirit [D]free

[D]River number 16 is [G]flowing to the [A]sea
[Bm]Carry my [G]sorrow, [A]set my spirit [D]free

[D]River number 17 is [G]flowing to the [A]sea
[Bm]Carry my [G]sorrow, [A]set my spirit [D]free

[D]River number 18 is [G]flowing to the [A]sea
[Bm]Carry my [G]sorrow, [A]set my spirit [D]free

[D]River number 19 is [G]flowing to the [A]sea
[Bm]Carry my [G]sorrow, [A]set my spirit [D]free

[D]River number 20 is [G]flowing to the [A]sea
[Bm]Carry my [G]sorrow, [A]set my spirit [D]free

[D]River number 21 is [G]flowing to the [A]sea
[Bm]Carry my [G]sorrow, [A]set my spirit [D]free

[D]River number 22 is [G]flowing to the [A]sea
[Bm]Carry my [G]sorrow, [A]set my spirit [D]free

[D]River number 23 is [G]flowing to the [A]sea
[Bm]Carry my [G]sorrow, [A]set my spirit [D]free

[D]River number 24 is [G]flowing to the [A]sea
[Bm]Carry my [G]sorrow, [A]set my spirit [D]free

[D]River number 25 is [G]flowing to the [A]sea
[Bm]Carry my [G]sorrow, [A]set my spirit [D]free

[D]River number 26 is [G]flowing to the [A]sea
[Bm]Carry my [G]sorrow, [A]set my spirit [D]free

[D]River number 27 is [G]flowing to the [A]sea
[Bm]Carry my [G]sorrow, [A]set my spirit [D]free

[D]River number 28 is [G]flowing to the [A]sea
[Bm]Carry my [G]sorrow, [A]set my spirit [D]free

[D]River number 29 is [G]flowing to the [A]sea
[Bm]Carry my [G]sorrow, [A]set my spirit [D]free

[D]River number 30 is [G]flowing to the [A]sea
[Bm]Carry my [G]sorrow, [A]set my spirit [D]free', NULL, 'D', 1, 'DADGAD', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'https://www.youtube.com/watch?v=dbbZGLR_e20', 'https://open.spotify.com/track/2HZQQ8PriDD1z7tcvAU9KH', 'https://soundcloud.com/user-778401370/la-curandera', now() - interval '900 seconds'),
  ('bfea479d-1c76-4196-a6a6-8885d729c573', '67d245f7-6115-4abd-a3d5-00a251e41406', 'Standard', '{title: Inan Tonanzin}
{artist: Traditional (Nahuatl)}
{key: D}

[D]Inan [D/F#]Tonanzin, [G]madre de la [C#m7]tierra
[F#m]Inan [Bm]Tonanzin, [A]tlazohcamati', NULL, 'D', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, NULL, NULL, now() - interval '960 seconds'),
  ('9d984027-9327-44c3-972f-25f932b227b9', '5de03246-cbfc-454e-ab0e-24cc3bea5366', 'Standard', '{title: Wakan Tanka}
{artist: Herbert  Quinteros}

Wakan Tanka, tunkashila
Wakan Tanka, unshimala ye', NULL, NULL, 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'https://www.youtube.com/watch?v=5qap5aO4i9A', NULL, NULL, now() - interval '1020 seconds'),
  ('b285397b-bd7a-4f9c-9b9d-420f98a46d70', '37951bb6-96cc-4907-a6a8-516ba082c510', 'Standard', '{title: Mother I Feel You}
{artist: shimshai}
{key: C}

[C]Mother I feel you [F]under my feet
[G]Mother I hear your [C]heartbeat', NULL, 'C', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, 'https://open.spotify.com/track/4PTG3Z6ehGkBF3zIqYQGKg', NULL, now() - interval '1080 seconds'),
  ('e72c1fe6-9f01-4ef4-9b1d-609829c37ade', '3cabe193-ac88-4619-9bab-28d29bb7afe7', 'Standard', '{title: Hey Yamayo}
{artist: Curawaka}
{key: Dm}

[Dm]Hey yamayo, [C]hey yamayo
[Bb]Hey yama [A]yama yo', NULL, 'Dm', 0, 'Drop D', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', NULL, NULL, 'https://soundcloud.com/curawaka/hey-yamayo', now() - interval '1140 seconds');
INSERT INTO public.song_versions (id, composition_id, version_name, content_chordpro, melody_notation, key, capo, tuning, contributor_id, youtube_url, spotify_url, soundcloud_url, created_at) VALUES
  ('3d30e077-7078-408d-9aef-a5146f9fcf2b', '13fecd65-baf1-466e-b21f-05a93381b792', 'Live version', '{title: Canção do Tierra Profundo}
{ci: alternative version}
{artist: Alonso del Río}
{key: A}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'Am', 2, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NULL, NULL, NULL, now() - interval '42748 seconds'),
  ('2a162ec0-2b3f-450b-b12a-c3d79e35da7d', '13fecd65-baf1-466e-b21f-05a93381b792', 'Standard', '{title: Canção do Tierra Profundo}
{artist: Alonso del Río}
{key: A}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'A', 0, 'DADGAD', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NULL, NULL, NULL, now() - interval '129148 seconds'),
  ('a17e738c-14fe-45ea-afa5-8c1ae30b5f99', '633ab28e-1c3e-4129-a73a-87a5d699757c', 'Standard', '{title: Canção do Pachamama}
{artist: Xavier Rudd and Nina}
{key: Dm}
{c: Canto para el círculo}

{soc}
[G]Vuela, vuela [C]colibrí
[D]Lleva mi canto [G]hasta ti
{eoc}

[Em]Agua que [C]limpia, [G]fuego que [D]cura
[Em]Viento que [C]lleva la [G]noche os[D]cura

{ci: Repetir dos veces}', NULL, 'Dm', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, NULL, now() - interval '270002 seconds'),
  ('4e8d152c-56fb-4833-8fa8-41f2851c4355', '8e04f469-1bd1-42e1-8b61-6b16d5e28885', 'Standard', '{title: Camino del Fuego}
{artist: Herbert Quinteros}
{key: D}

[Gbmaj7]Noite de [Dbmaj7]lua cheia
[Ebmaj7]Canta o [Bbm]coração
[F#m7]Sobe a [C#m]montanha
[D/F#]Desce ao [Bbm]mar', NULL, 'D', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'https://youtu.be/6R7pxNzEAaM', 'https://open.spotify.com/track/4PTG3Z6ehGkBF3zIqYQGKg', NULL, now() - interval '513509 seconds'),
  ('c84b2095-d040-4fa8-b4c3-681a0d21f187', '1bc8e66f-0e98-416b-8f3f-23fc4d85249a', 'Standard', '{title: Ecos del River Bendita}
{artist: Santo Daime}

Abuela luna, abuelo sol
Cantamos juntos esta canción
Agua que limpia, fuego que cura
Tierra que sostiene, viento que murmura', NULL, 'Bb', 0, 'Drop D', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, NULL, now() - interval '783135 seconds'),
  ('8fffba10-c9fc-4b44-abaa-879a85badfab', '40beb410-d7c6-4338-bd47-b58782136aa9', 'Standard', '{title: Ecos del Fuego}
{artist: Fiona Helmer and Nina and Traditional (Camino Rojo)}
{key: G}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'G', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', NULL, NULL, 'https://soundcloud.com/user-778401370/la-curandera', now() - interval '842809 seconds'),
  ('4072c844-56d8-45f1-aa76-554e2e1d1b41', '56861db8-04f8-4927-a998-9c7882bd8e70', 'Standard', '{title: Rezo al Águila 🔥}
{artist: Ayla Nereo}
{key: F#m}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', 'X:1
T:Random Melody
M:3/4
L:1/8
K:D
A2 d2 f2 | e2 d2 B2 | A4 z2 |]', 'F#m', 0, 'Half-Step Down', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, NULL, NULL, now() - interval '864850 seconds'),
  ('e0620946-1ffb-4148-a101-68021aff370b', '1e851fd3-9d3f-42e0-bc68-3f67f2720497', 'Live version', '{title: Sinfonía del Piedra}
{ci: alternative version}
{artist: Ayla Schafer}
{key: Gb}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'G', 2, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', NULL, NULL, NULL, now() - interval '907836 seconds'),
  ('a088b2c3-41b2-45ec-8dfc-272d57b61247', '1e851fd3-9d3f-42e0-bc68-3f67f2720497', 'Standard', '{title: Sinfonía del Piedra}
{artist: Ayla Schafer}
{key: Gb}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'Gb', 0, 'DADGAD', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', NULL, 'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC', NULL, now() - interval '994236 seconds'),
  ('e7212bbd-bd5f-4acb-bb23-1189c00a2bbd', 'e877a416-3872-44be-9433-09a1dc19adea', 'Standard', '{title: Luz de la Pachamama 🔥}
{artist: Santo  Daime}
{key: C#m}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', 'X:1
T:Random Melody
M:3/4
L:1/8
K:D
A2 d2 f2 | e2 d2 B2 | A4 z2 |]', 'C#m', 0, 'Half-Step Down', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'https://www.youtube.com/watch?v=kXYiU_JCYtU', 'https://open.spotify.com/track/4PTG3Z6ehGkBF3zIqYQGKg', NULL, now() - interval '1075658 seconds'),
  ('daa79369-d04e-481e-9deb-53e84e2f248b', 'cf03f60f-04e4-4173-90d8-b28d906c6e15', 'Live version', '{title: Viento del Sol Profundo}
{ci: alternative version}
{artist: Curawaka}
{key: F#m}

[G]Eu canto a canção [C]que não tem fim
[D]Coração aberto [G]dentro de mim
[G]Estou firme no [C]meu lugar
[D]Com a força da [G]mãe pra me guiar', NULL, 'Dm', 2, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', NULL, NULL, NULL, now() - interval '1299659 seconds'),
  ('e8b82f25-4b2c-4096-a896-cf104bc97ffc', 'cf03f60f-04e4-4173-90d8-b28d906c6e15', 'Standard', '{title: Viento del Sol Profundo}
{artist: Curawaka}
{key: F#m}

[G]Eu canto a canção [C]que não tem fim
[D]Coração aberto [G]dentro de mim
[G]Estou firme no [C]meu lugar
[D]Com a força da [G]mãe pra me guiar', NULL, 'F#m', 1, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', NULL, NULL, NULL, now() - interval '1386059 seconds'),
  ('80989f0b-11e2-4ec1-988c-5ebeaed85283', '1052941c-4c43-433e-a45d-adc38316e546', 'Standard', '{title: Abuelo River Limpio}
{artist: Traditional (Umbanda)}

Abuela luna, abuelo sol
Cantamos juntos esta canción
Agua que limpia, fuego que cura
Tierra que sostiene, viento que murmura', 'X:1
T:Random Melody
M:3/4
L:1/8
K:D
A2 d2 f2 | e2 d2 B2 | A4 z2 |]', 'Am', 0, 'DADGAD', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, NULL, NULL, now() - interval '1845871 seconds'),
  ('c69e77cc-3d3d-4352-9e71-bd6dd86d5e1e', '603e1e70-86d8-46ce-a216-3257272eff78', 'Standard', '{title: Cura de la Selva}
{artist: Traditional (Camino Rojo)}
[Am]Hello [G]World', 'X:1
T:Random Melody
M:3/4
L:1/8
K:D
A2 d2 f2 | e2 d2 B2 | A4 z2 |]', 'F#m', 1, 'Drop D', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', NULL, NULL, NULL, now() - interval '2012618 seconds'),
  ('5663ee1b-17b4-4254-ad9d-110d49df4fcd', 'fe09b341-733c-494d-9539-f5a4f9e69d8a', 'Standard', '{title: Llamado del River Eterno}
{key: D}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'D', 4, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'https://www.youtube.com/watch?v=kXYiU_JCYtU', NULL, 'https://soundcloud.com/curawaka/hey-yamayo', now() - interval '2258757 seconds'),
  ('d2cfb7a0-2832-48a0-9bd1-8e1fc9e70f65', 'eda86457-a70a-46bf-9945-51930a6c3894', 'Standard', '{title: Hino da Piedra Curandero}
{artist: Nico Pérez}

Abuela luna, abuelo sol
Cantamos juntos esta canción
Agua que limpia, fuego que cura
Tierra que sostiene, viento que murmura', NULL, 'C', 5, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, NULL, now() - interval '2497875 seconds'),
  ('79b517f3-b88c-479c-8896-9cdd85186b09', 'd8983a21-b135-4e10-8129-746980e21e4d', 'Standard', '{title: Canto al Selva}
{artist: Traditional (Umbanda)}
{key: Bm}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'Bm', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, NULL, NULL, now() - interval '2608635 seconds'),
  ('66938eb0-d1fb-4969-b892-6bafa3e188f0', '392172ef-772b-456e-a10f-31c5308ca70f', 'Standard', '{title: Cura de la Montaña}
{artist:   Peia }
{key: D}

[G]Eu canto a canção [C]que não tem fim
[D]Coração aberto [G]dentro de mim
[G]Estou firme no [C]meu lugar
[D]Com a força da [G]mãe pra me guiar', NULL, 'D', 3, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', NULL, 'https://open.spotify.com/track/4PTG3Z6ehGkBF3zIqYQGKg', NULL, now() - interval '2872845 seconds'),
  ('3fabd74f-f59e-4acf-a41d-5c87439fed4f', '0675386e-2910-4426-88b5-67478c482d51', 'Standard', '{title: Ecos del Colibrí}

[Gbmaj7]Noite de [Dbmaj7]lua cheia
[Ebmaj7]Canta o [Bbm]coração
[F#m7]Sobe a [C#m]montanha
[D/F#]Desce ao [Bbm]mar', NULL, NULL, 3, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NULL, NULL, 'https://soundcloud.com/octobersveryown/drake-back-to-back', now() - interval '2875335 seconds'),
  ('3fd208f2-4235-4642-be97-5dcff182b7d6', 'dbe93605-454c-4cbd-919e-6409d2ed99fc', 'Standard', '{title: Luz de la Mar Eterno}
{artist: Santo Daime}

   G                C
I am the river and the river is me
D                  G
Flowing to the sea, flowing to the sea

Page 1/1

   Em        C
O sisters, let’s go down
       D                G
Don’t you wait, down to the river we go', NULL, 'G', 3, 'Half-Step Down', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', NULL, 'https://open.spotify.com/track/2HZQQ8PriDD1z7tcvAU9KH', NULL, now() - interval '3250028 seconds');
INSERT INTO public.song_versions (id, composition_id, version_name, content_chordpro, melody_notation, key, capo, tuning, contributor_id, youtube_url, spotify_url, soundcloud_url, created_at) VALUES
  ('51295686-70d6-4d25-acb7-943911e10833', 'a4a6304d-33a3-439d-abd6-5f5772c32bb6', 'Standard', '{title: Espíritu de la Corazón Eterno}
{artist: Cari El}

   G                C
I am the river and the river is me
D                  G
Flowing to the sea, flowing to the sea

Page 1/1

   Em        C
O sisters, let’s go down
       D                G
Don’t you wait, down to the river we go', NULL, 'C#m', 3, 'Half-Step Down', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, NULL, NULL, now() - interval '3350413 seconds'),
  ('6aa05344-0cac-4595-86e2-333a0c3c7ef8', '23875ed5-ac16-4f10-9456-8aa83086f7a2', 'Standard', '{title: Pájaro Tierra}
{artist: diego palma}

Abuela luna, abuelo sol
Cantamos juntos esta canción
Agua que limpia, fuego que cura
Tierra que sostiene, viento que murmura', NULL, 'Am', 5, 'DADGAD', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, NULL, NULL, now() - interval '3401903 seconds'),
  ('6b5d45a7-da79-48c6-b3e5-4a53ae98bb00', '43fbe1bb-5e23-4c81-9d96-f163a8800065', 'Live version', '{title: Voz del River Verde}
{ci: alternative version}
{artist: Herbert Quinteros & Dario Hampi Pakari}
{key: D}

[Gbmaj7]Noite de [Dbmaj7]lua cheia
[Ebmaj7]Canta o [Bbm]coração
[F#m7]Sobe a [C#m]montanha
[D/F#]Desce ao [Bbm]mar', NULL, 'Bb', 2, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', NULL, NULL, NULL, now() - interval '3755320 seconds'),
  ('0ed7a375-f3d5-4593-a464-bdd783e22704', '43fbe1bb-5e23-4c81-9d96-f163a8800065', 'Standard', '{title: Voz del River Verde}
{artist: Herbert Quinteros & Dario Hampi Pakari}
{key: D}

[Gbmaj7]Noite de [Dbmaj7]lua cheia
[Ebmaj7]Canta o [Bbm]coração
[F#m7]Sobe a [C#m]montanha
[D/F#]Desce ao [Bbm]mar', NULL, 'D', 0, 'Half-Step Down', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://open.spotify.com/track/2HZQQ8PriDD1z7tcvAU9KH', NULL, now() - interval '3841720 seconds'),
  ('6b781fe2-c66f-4233-8277-0901a685f67a', '4fc29da7-8a77-429f-836e-74ad9105039d', 'Standard', '{title: Danza del Colibrí Ancestral}
{key: E}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'E', 3, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, NULL, NULL, now() - interval '3862959 seconds'),
  ('6b117e97-cef5-42f5-acaf-4e47b8c1ce33', '7a80f369-7869-4a99-a1c2-310a018bbf5d', 'Standard', '{title: Espíritu de la Fuego Cósmico}
{key: C#m}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'C#m', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'https://www.youtube.com/watch?v=dbbZGLR_e20', NULL, NULL, now() - interval '4054619 seconds'),
  ('94097619-b406-459e-a0c2-809641a8f20f', 'b221d1f5-c9b4-4fc5-a4e0-d6d83a668abf', 'Standard', '{title: Espíritu de la Mar Cielo}
{artist: Fiona Helmer}
{key: Gb}
{capo: 5}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'Gb', 5, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, NULL, NULL, now() - interval '4422701 seconds'),
  ('9372b230-371f-4527-9254-028af18840ba', 'ac85d56d-654c-4176-b82f-4dee0ee9bdc7', 'Standard', '{title: Song of the Mountain Puro}
{artist: alain merens}
{key: G}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'G', 0, 'DADGAD', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'https://www.youtube.com/watch?v=dbbZGLR_e20', NULL, 'https://soundcloud.com/curawaka/hey-yamayo', now() - interval '4609007 seconds'),
  ('8c175728-e81d-4234-b37f-56116c827c14', '2db9c970-bf02-4f9a-b74b-da286cfd2ff0', 'Standard', '{title: Abuelo Corazón Cielo}
{artist: nina}
{key: Am}
{capo: 1}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'Am', 1, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NULL, 'https://open.spotify.com/track/4PTG3Z6ehGkBF3zIqYQGKg', 'https://soundcloud.com/curawaka/hey-yamayo', now() - interval '5110464 seconds'),
  ('ebf68078-5ddf-4737-b249-d4ecde8ae989', 'a5a6f117-9f20-450b-bf1c-c4084567561e', 'Standard', '{title: Hino da River Eterno}
{artist: Alain Merens}
{key: Gb}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'Gb', 5, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'https://www.youtube.com/watch?v=5qap5aO4i9A', NULL, NULL, now() - interval '5202131 seconds'),
  ('3e57e493-c323-450b-968f-7232a20953c9', 'ee78e39f-2d1b-430b-8ef5-5f534b3f6548', 'Standard', '{title: Cura de la Bosque}
{key: D}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'D', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', NULL, NULL, NULL, now() - interval '5232663 seconds'),
  ('31bc31a3-ea32-47a6-a86d-13345f611ecc', 'f5798ea3-5e89-40ef-a9ea-d77ee0eadd0a', 'Standard', '{title: Abuelo Medicina}
{artist: Peia / Herbert Quinteros, Peia}
{key: Am}
{capo: 2}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'Am', 2, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', NULL, NULL, NULL, now() - interval '5376799 seconds'),
  ('95b8ab4e-b6c8-49d6-a18c-186f31c47522', 'bec259ff-9567-4b94-8a23-1c6c23199eeb', 'Capo version', '{title: Espíritu de la Piedra Amor}
{ci: alternative version}
{artist: Fiona Helmer}
{key: Dm}

[Gbmaj7]Noite de [Dbmaj7]lua cheia
[Ebmaj7]Canta o [Bbm]coração
[F#m7]Sobe a [C#m]montanha
[D/F#]Desce ao [Bbm]mar', NULL, 'Am', 2, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, NULL, NULL, now() - interval '5427082 seconds'),
  ('822bc443-01c3-4a36-b6b7-58aa0e251bb7', 'bec259ff-9567-4b94-8a23-1c6c23199eeb', 'Standard', '{title: Espíritu de la Piedra Amor}
{artist: Fiona Helmer}
{key: Dm}

[Gbmaj7]Noite de [Dbmaj7]lua cheia
[Ebmaj7]Canta o [Bbm]coração
[F#m7]Sobe a [C#m]montanha
[D/F#]Desce ao [Bbm]mar', NULL, 'Dm', 0, 'Drop D', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, NULL, now() - interval '5513482 seconds'),
  ('e5e4455d-114f-44dc-b7d6-5119431646eb', '2768179a-5375-44da-864a-0ea22c25982f', 'Standard', '{title: Fuerza de la Floresta Sagrado}
{artist: Ayla Nereo &amp; Alain Merens}

Abuela luna, abuelo sol
Cantamos juntos esta canción
Agua que limpia, fuego que cura
Tierra que sostiene, viento que murmura', NULL, 'Em', 2, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'https://www.youtube.com/watch?v=5qap5aO4i9A', NULL, NULL, now() - interval '5623780 seconds'),
  ('a511bc1d-7c23-47ba-aa4d-f203f8c7162f', '66660130-1330-43d0-a53d-ba46d53bf3cd', 'Standard', '{title: Llamado del Flor}
{artist: Diego Palma}
{key: G}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'G', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'https://www.youtube.com/watch?v=kXYiU_JCYtU', NULL, 'https://soundcloud.com/curawaka/hey-yamayo', now() - interval '5624441 seconds'),
  ('2c48ce73-4e68-479d-8766-1330636d5ce3', '71e7a154-dbe7-4f8d-85d9-c57c5ae5a667', 'Live version', '{title: Danza del Agua Verde}
{ci: alternative version}
{artist: Santo Daime}
{key: Bb}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'Bb', 2, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, NULL, NULL, now() - interval '5761942 seconds'),
  ('b96dca96-bbd0-4af4-a80e-d1823cbdb2c3', '71e7a154-dbe7-4f8d-85d9-c57c5ae5a667', 'Standard', '{title: Danza del Agua Verde}
{artist: Santo Daime}
{key: Bb}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'Bb', 1, 'Half-Step Down', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, 'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC', NULL, now() - interval '5848342 seconds'),
  ('4dee3cb0-5d58-4c29-a0e1-b4c7423b5e50', 'a19045c6-158c-4f55-8337-c634bff48f7f', 'Standard', '{title: Canção do Estrella}
{artist: Alain Merens}
{key: G}
{capo: 5}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'G', 5, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NULL, NULL, NULL, now() - interval '6641446 seconds'),
  ('57f4cfd3-deb2-4393-8b45-fe90ea48da5d', '172ae043-f763-4708-b4be-2aa7c239b74c', 'Standard', '{title: Viento del River Profundo}
{artist: Traditional}

Abuela luna, abuelo sol
Cantamos juntos esta canción
Agua que limpia, fuego que cura
Tierra que sostiene, viento que murmura', NULL, 'Gb', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'https://www.youtube.com/watch?v=kXYiU_JCYtU', NULL, NULL, now() - interval '6919200 seconds');
INSERT INTO public.song_versions (id, composition_id, version_name, content_chordpro, melody_notation, key, capo, tuning, contributor_id, youtube_url, spotify_url, soundcloud_url, created_at) VALUES
  ('360ca06b-0887-4786-a721-1265ff6acf72', 'ab02b3b9-1cee-4eef-b76e-513211075d31', 'Standard', '{title: Llamado del Colibrí Brillante}
{artist: Alonso del Río}

Abuela luna, abuelo sol
Cantamos juntos esta canción
Agua que limpia, fuego que cura
Tierra que sostiene, viento que murmura', NULL, NULL, 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', NULL, NULL, NULL, now() - interval '6947818 seconds'),
  ('e41f7687-7330-4f9b-a9f5-d1e633a6a174', '1d7ee9ff-50ee-499d-a1ff-4e77fce6719c', 'Standard', '{title: Abuelita Cóndor Divino}
{artist: Dario Hampi Pakari}

   G                C
I am the river and the river is me
D                  G
Flowing to the sea, flowing to the sea

Page 1/1

   Em        C
O sisters, let’s go down
       D                G
Don’t you wait, down to the river we go', NULL, 'C', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NULL, NULL, NULL, now() - interval '7068297 seconds'),
  ('e10afcee-a127-47ca-ae2a-87a996ddfb8e', 'a783662c-ac44-4165-979e-52f04722ea60', 'Standard', '{title: Guardián del Floresta Sagrada}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, NULL, 0, 'Half-Step Down', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'https://www.youtube.com/watch?v=kXYiU_JCYtU', 'https://open.spotify.com/track/2HZQQ8PriDD1z7tcvAU9KH', NULL, now() - interval '7130295 seconds'),
  ('84a09377-371d-44b8-bc56-14aab4d14d47', 'a9323fb2-e248-4c27-bfd5-323d2a3cefe0', 'Standard', '{title: Cura de la Floresta}
{artist: Dario Hampi Pakari}

   G                C
I am the river and the river is me
D                  G
Flowing to the sea, flowing to the sea

Page 1/1

   Em        C
O sisters, let’s go down
       D                G
Don’t you wait, down to the river we go', NULL, 'Bm', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NULL, NULL, NULL, now() - interval '7310471 seconds'),
  ('69eb24dc-eb3a-457c-bceb-2c6f94b98127', 'b3cf8d07-9ca1-4ebd-884e-cf50c8716d0f', 'Standard', '{title: Espíritu de la Medicina Cósmico 🔥}
{artist: Fiona Helmer}
{key: Bb}
{c: Canto para el círculo}

{soc}
[G]Vuela, vuela [C]colibrí
[D]Lleva mi canto [G]hasta ti
{eoc}

[Em]Agua que [C]limpia, [G]fuego que [D]cura
[Em]Viento que [C]lleva la [G]noche os[D]cura

{ci: Repetir dos veces}', NULL, 'Bb', 0, 'Drop D', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'https://www.youtube.com/watch?v=dbbZGLR_e20', NULL, NULL, now() - interval '7644007 seconds'),
  ('a8e74379-1c31-4dba-b068-8da22eab544c', '9c2b4f5e-d6d2-47ec-90dc-477579f9348b', 'Standard', '{title: Voz del Estrella}
{artist: Ayla Nereo}
{key: Am}
{c: Canto para el círculo}

{soc}
[G]Vuela, vuela [C]colibrí
[D]Lleva mi canto [G]hasta ti
{eoc}

[Em]Agua que [C]limpia, [G]fuego que [D]cura
[Em]Viento que [C]lleva la [G]noche os[D]cura

{ci: Repetir dos veces}', NULL, 'Am', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'https://www.youtube.com/watch?v=5qap5aO4i9A', NULL, NULL, now() - interval '7821637 seconds'),
  ('73884433-a000-4341-89a2-1490866c320f', 'a6745d8b-f2b3-4503-a6f4-191410cbfed5', 'Standard', '{title: Song of the Colibrí Brillante}
{artist: Danit}

   G                C
I am the river and the river is me
D                  G
Flowing to the sea, flowing to the sea

Page 1/1

   Em        C
O sisters, let’s go down
       D                G
Don’t you wait, down to the river we go', NULL, 'Gb', 0, 'Half-Step Down', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, NULL, NULL, now() - interval '7885495 seconds'),
  ('60c463b2-41f3-4614-bff5-34d43dca5ce6', 'd17e8406-5a6a-444f-a73b-73f4e47c04a0', 'Standard', '{title: Grandmother''s Ecos del Bosque Verde}
{artist: Nina}
{key: Am}

[Gbmaj7]Noite de [Dbmaj7]lua cheia
[Ebmaj7]Canta o [Bbm]coração
[F#m7]Sobe a [C#m]montanha
[D/F#]Desce ao [Bbm]mar', NULL, 'Am', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, NULL, now() - interval '7897273 seconds'),
  ('f1f2687a-a6e3-4f28-9c0a-68235a7c174e', 'abfe054f-f4b1-436f-9eb2-4cef7f8d970e', 'Standard', '{title: Voz del Flor}
{artist: Diego Palma}
{key: Dm}

[G]Eu canto a canção [C]que não tem fim
[D]Coração aberto [G]dentro de mim
[G]Estou firme no [C]meu lugar
[D]Com a força da [G]mãe pra me guiar', NULL, 'Dm', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, NULL, NULL, now() - interval '8033852 seconds'),
  ('f202d165-a33d-48cb-913b-8373c9c70096', '83f7e119-3c33-4422-be56-d23afa1ef3fc', 'Standard', '{title: Canto al Sol}
{artist: Alain Merens}
{key: Em}

[G]Eu canto a canção [C]que não tem fim
[D]Coração aberto [G]dentro de mim
[G]Estou firme no [C]meu lugar
[D]Com a força da [G]mãe pra me guiar', 'X:1
T:Random Melody
M:3/4
L:1/8
K:D
A2 d2 f2 | e2 d2 B2 | A4 z2 |]', 'Em', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'https://www.youtube.com/watch?v=kXYiU_JCYtU', NULL, NULL, now() - interval '8327961 seconds'),
  ('d193f0a8-9361-4a78-b67d-f1b212b25b01', '21d6fd83-f41a-4346-aae0-2065afb482da', 'Standard', '{title: Voz del Colibrí}
{artist: Curawaka}
{key: Am}
{capo: 4}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'Am', 4, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', NULL, NULL, NULL, now() - interval '8587221 seconds'),
  ('02ef089c-4d50-49b3-94f9-aa2cdb17e4b0', '737c7840-44d5-4434-a57f-8c7e121e07ba', 'Standard', '{title: Espíritu de la River}
{artist: Dario Hampi Pakari}

   G                C
I am the river and the river is me
D                  G
Flowing to the sea, flowing to the sea

Page 1/1

   Em        C
O sisters, let’s go down
       D                G
Don’t you wait, down to the river we go', NULL, 'C', 0, 'DADGAD', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'https://www.youtube.com/watch?v=kXYiU_JCYtU', NULL, NULL, now() - interval '8883016 seconds'),
  ('ba284156-3dd4-41ac-b6c1-01eb1d1825df', 'a5836ce2-710f-461a-9c62-5a62358d5175', 'Standard', '{title: Voz del Pachamama Amor}
{artist: Traditional &amp; Fiona Helmer}

[Gbmaj7]Noite de [Dbmaj7]lua cheia
[Ebmaj7]Canta o [Bbm]coração
[F#m7]Sobe a [C#m]montanha
[D/F#]Desce ao [Bbm]mar', NULL, NULL, 3, 'Drop D', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, NULL, 'https://soundcloud.com/octobersveryown/drake-back-to-back', now() - interval '8956649 seconds'),
  ('d615a166-9b54-437b-b169-9d49beee7f1d', 'a91d15b0-7db6-4f69-9f7e-5484e4a66fbe', 'Standard', '{title: Sinfonía del Jaguar Bendita}
{artist: Nina}

   G                C
I am the river and the river is me
D                  G
Flowing to the sea, flowing to the sea

Page 1/1

   Em        C
O sisters, let’s go down
       D                G
Don’t you wait, down to the river we go', 'X:1
T:Random Melody
M:3/4
L:1/8
K:D
A2 d2 f2 | e2 d2 B2 | A4 z2 |]', 'G', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'https://www.youtube.com/watch?v=dbbZGLR_e20', NULL, NULL, now() - interval '9374199 seconds'),
  ('e6448965-e872-4ce0-85b1-121b3896dece', '6291e88d-8086-4532-8335-2676400c43b7', 'Standard', '{title: Guardián del Estrella}

   G                C
I am the river and the river is me
D                  G
Flowing to the sea, flowing to the sea

Page 1/1

   Em        C
O sisters, let’s go down
       D                G
Don’t you wait, down to the river we go', NULL, 'Dm', 4, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'https://youtu.be/6R7pxNzEAaM', NULL, NULL, now() - interval '9630966 seconds'),
  ('49fe7bbd-6bfa-497b-912e-f75bb701c94e', '04bdd5ec-d8ec-45c2-83f8-e8cd8a9b78c9', 'Standard', '{title: Espíritu de la River Amor}
{artist: Cari  El}
{key: Gb}

[G]Eu canto a canção [C]que não tem fim
[D]Coração aberto [G]dentro de mim
[G]Estou firme no [C]meu lugar
[D]Com a força da [G]mãe pra me guiar', NULL, 'Gb', 0, 'DADGAD', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'https://www.youtube.com/watch?v=5qap5aO4i9A', NULL, 'https://soundcloud.com/octobersveryown/drake-back-to-back', now() - interval '10093241 seconds'),
  ('bc3d5cca-d09e-45c4-8753-8ce3efd16c03', 'e60fd1a9-3a0d-4421-b6c1-a2961116682a', 'Standard', '{title: Danza del Corazón Viejo}
{artist: Cari El}
{key: F}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'F', 4, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'https://www.youtube.com/watch?v=5qap5aO4i9A', 'https://open.spotify.com/track/4PTG3Z6ehGkBF3zIqYQGKg', NULL, now() - interval '10471921 seconds'),
  ('770d716a-f832-4411-b895-9fa53448becc', '59d20e92-bfbe-440c-adc9-040e250e295f', 'Live version', '{title: Fuerza de la Piedra Viejo}
{ci: alternative version}
{artist: Santo  Daime}

Abuela luna, abuelo sol
Cantamos juntos esta canción
Agua que limpia, fuego que cura
Tierra que sostiene, viento que murmura', NULL, 'Em', 2, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, NULL, NULL, now() - interval '10658469 seconds'),
  ('ff9271d7-7c6d-45d2-9fe1-8a4d2115f6da', '59d20e92-bfbe-440c-adc9-040e250e295f', 'Standard', '{title: Fuerza de la Piedra Viejo}
{artist: Santo  Daime}

Abuela luna, abuelo sol
Cantamos juntos esta canción
Agua que limpia, fuego que cura
Tierra que sostiene, viento que murmura', NULL, 'D', 0, 'Half-Step Down', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, NULL, now() - interval '10744869 seconds'),
  ('f34402cd-ee93-4b63-858b-f8054feb20b9', '85759c47-e9bc-49f1-aa9c-5b3958bf32be', 'Standard', '{title: Latido de la Floresta Cósmico}
{artist: Traditional}
{key: Bm}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'Bm', 0, 'Drop D', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, NULL, now() - interval '10771504 seconds');
INSERT INTO public.song_versions (id, composition_id, version_name, content_chordpro, melody_notation, key, capo, tuning, contributor_id, youtube_url, spotify_url, soundcloud_url, created_at) VALUES
  ('113d8f61-407d-4009-8b8f-93e0404fd261', '67ccd286-69e1-4d20-af94-607f852c245e', 'Standard', '{title: Llamado del Colibrí Sagrado}
{artist:   Curawaka }

Abuela luna, abuelo sol
Cantamos juntos esta canción
Agua que limpia, fuego que cura
Tierra que sostiene, viento que murmura', NULL, 'D', 3, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', NULL, NULL, NULL, now() - interval '11065714 seconds'),
  ('6548c2cf-697c-401b-9dea-834923c71ba2', 'a11f10ef-6268-4134-9160-fdf029962b3a', 'Standard', '{title: Danza del Flor Profundo}
{artist: Fiona Helmer}
{key: E}
{capo: 2}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'E', 2, 'DADGAD', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'https://www.youtube.com/watch?v=dbbZGLR_e20', 'https://open.spotify.com/track/4PTG3Z6ehGkBF3zIqYQGKg', NULL, now() - interval '11074617 seconds'),
  ('84f2331c-3fb8-41b7-b8c8-d7fb1b2f985f', 'cc5670c9-3c55-4bb7-84bc-0b9938b38e89', 'Standard', '{title: Latido de la Flor Cielo}
{artist: Curawaka}
{key: C#m}
{c: Canto para el círculo}

{soc}
[G]Vuela, vuela [C]colibrí
[D]Lleva mi canto [G]hasta ti
{eoc}

[Em]Agua que [C]limpia, [G]fuego que [D]cura
[Em]Viento que [C]lleva la [G]noche os[D]cura

{ci: Repetir dos veces}', NULL, 'C#m', 0, 'DADGAD', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, NULL, NULL, now() - interval '11177468 seconds'),
  ('d0abc46c-d2b2-4ec2-889d-67812e6f3776', 'f804949e-cc34-4f4e-b95d-3170aa63af64', 'Standard', '{title: Pájaro Estrella Cósmico}
{artist: Santo Daime}

Abuela luna, abuelo sol
Cantamos juntos esta canción
Agua que limpia, fuego que cura
Tierra que sostiene, viento que murmura', NULL, 'F#m', 5, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', NULL, NULL, NULL, now() - interval '11385886 seconds'),
  ('898b6eb9-b429-42ac-a189-d98464ec7973', '57b654b8-2285-4e48-9c0c-5fe8acdebfb5', 'Standard', '{title: Song of the Águila Brillante}
{artist: Danit &amp; Ayla Schafer / Xavier Rudd}
{key: Am}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'Am', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'https://www.youtube.com/watch?v=kXYiU_JCYtU', NULL, NULL, now() - interval '11486715 seconds'),
  ('60671c5c-00b4-467a-a5c4-c9e170c89d19', 'ee82ef40-a85c-4504-8fab-8e66800879f4', 'Standard', '{title: Camino del Floresta Limpio}
{artist: Traditional &amp; Alonso del Río}
{key: E}

[Gbmaj7]Noite de [Dbmaj7]lua cheia
[Ebmaj7]Canta o [Bbm]coração
[F#m7]Sobe a [C#m]montanha
[D/F#]Desce ao [Bbm]mar', NULL, 'E', 0, 'DADGAD', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, 'https://open.spotify.com/track/2HZQQ8PriDD1z7tcvAU9KH', NULL, now() - interval '11634673 seconds'),
  ('ac9bf410-cc5b-43c4-a300-6fbaddc0fdc9', 'e1ea9259-89e5-4d21-b5cd-6ebd51bf3630', 'Capo version', '{title: Danza del Montaña Sagrada}
{ci: alternative version}
{artist: Herbert Quinteros}
{key: F#m}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'Bm', 2, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, NULL, NULL, now() - interval '11636605 seconds'),
  ('b1bee597-932e-430d-bb47-fe44ed780570', 'e1ea9259-89e5-4d21-b5cd-6ebd51bf3630', 'Standard', '{title: Danza del Montaña Sagrada}
{artist: Herbert Quinteros}
{key: F#m}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'F#m', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, NULL, 'https://soundcloud.com/user-778401370/la-curandera', now() - interval '11723005 seconds'),
  ('9c77840d-b454-4961-8b97-d9fccaa76c82', '78149d0e-9fd1-4310-9eb2-1139e7ae23a6', 'Standard', '{title: Cura de la Vida Brillante}
{artist: Danit}

Abuela luna, abuelo sol
Cantamos juntos esta canción
Agua que limpia, fuego que cura
Tierra que sostiene, viento que murmura', NULL, 'C', 0, 'DADGAD', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', NULL, NULL, NULL, now() - interval '11776909 seconds'),
  ('b631dc37-e699-40de-9e43-fc9cc7eb3e13', 'bece6763-f91c-4387-9918-20099435ad08', 'Standard', '{title: Sinfonía del Colibrí}
{artist: Herbert Quinteros}

Abuela luna, abuelo sol
Cantamos juntos esta canción
Agua que limpia, fuego que cura
Tierra que sostiene, viento que murmura', NULL, 'Bm', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, NULL, now() - interval '12252098 seconds'),
  ('4776bbac-1a59-4a46-8c20-435e748212fd', '41ebc62c-46c4-42e1-a763-b78e856e8eec', 'Standard', '{title: Song of the Lluvia}
{artist: Curawaka}

   G                C
I am the river and the river is me
D                  G
Flowing to the sea, flowing to the sea

Page 1/1

   Em        C
O sisters, let’s go down
       D                G
Don’t you wait, down to the river we go', NULL, NULL, 0, 'DADGAD', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'https://www.youtube.com/watch?v=dbbZGLR_e20', NULL, NULL, now() - interval '12306389 seconds'),
  ('53efb010-d0ae-4e7e-b8ac-0f1948808a70', '59c6f582-90f2-4fb6-ab76-6b857022c5f5', 'Standard', '{title: Ecos del Cielo Universal}
{artist: Santo Daime}

   G                C
I am the river and the river is me
D                  G
Flowing to the sea, flowing to the sea

Page 1/1

   Em        C
O sisters, let’s go down
       D                G
Don’t you wait, down to the river we go', NULL, 'D', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, NULL, NULL, now() - interval '12493399 seconds'),
  ('f8e761c2-bdb2-4e2b-bff5-dc89e9b7e815', '32ab30df-f824-4251-8331-37657436c7c9', 'Standard', '{title: Canto al Mountain Viejo}

Abuela luna, abuelo sol
Cantamos juntos esta canción
Agua que limpia, fuego que cura
Tierra que sostiene, viento que murmura', NULL, 'F#m', 3, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'https://www.youtube.com/watch?v=kXYiU_JCYtU', NULL, NULL, now() - interval '12659743 seconds'),
  ('a4d4c0bd-4b8f-4dfc-85a3-da41c88701b8', '9bcf584e-cf95-4cfd-994d-af3ed7cab146', 'Standard', '{title: Espíritu de la River}

Abuela luna, abuelo sol
Cantamos juntos esta canción
Agua que limpia, fuego que cura
Tierra que sostiene, viento que murmura', NULL, 'F', 2, 'Drop D', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', NULL, NULL, NULL, now() - interval '12830741 seconds'),
  ('13f0f2e9-7562-4835-90eb-0f9c20f5f6f9', '0bc5713b-818f-4b57-9e54-1e4dcd4ea493', 'Standard', '{title: Fuerza de la Estrella Curandero}
{artist: Nina}
{key: E}
{c: Canto para el círculo}

{soc}
[G]Vuela, vuela [C]colibrí
[D]Lleva mi canto [G]hasta ti
{eoc}

[Em]Agua que [C]limpia, [G]fuego que [D]cura
[Em]Viento que [C]lleva la [G]noche os[D]cura

{ci: Repetir dos veces}', NULL, 'E', 4, 'Half-Step Down', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'https://www.youtube.com/watch?v=kXYiU_JCYtU', NULL, 'https://soundcloud.com/octobersveryown/drake-back-to-back', now() - interval '13680689 seconds'),
  ('042839e0-8346-4d8a-b562-56973aef98c9', 'c4999f38-543a-4397-93e9-4a1b665f8e6a', 'Standard', '{title: Abuelita Fuego Verde}
{artist: Diego Palma}

Abuela luna, abuelo sol
Cantamos juntos esta canción
Agua que limpia, fuego que cura
Tierra que sostiene, viento que murmura', NULL, 'Bb', 3, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'https://youtu.be/6R7pxNzEAaM', 'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC', NULL, now() - interval '13705609 seconds'),
  ('33dd9d53-a107-40a0-a10c-251de6be4048', 'b129b2b6-db71-4735-aa70-42c1daba3445', 'Standard', '{title: Voz del Tierra Eterno}
{artist: Herbert Quinteros}
{key: C}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'C', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, 'https://open.spotify.com/track/4PTG3Z6ehGkBF3zIqYQGKg', NULL, now() - interval '13781872 seconds'),
  ('8d1e0610-8d11-43f4-a8e6-4a10c7dc00cc', '059d201a-7b0d-4079-875d-e0674f93901d', 'Standard', '{title: Viento del Vida Profundo}
{artist:   Curawaka }
{key: F#m}
{capo: 3}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'F#m', 3, 'Drop D', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NULL, NULL, NULL, now() - interval '14142193 seconds'),
  ('10425492-6276-4b05-b800-40a736e71f9c', 'd7ecf51d-0677-4a78-b007-9da39585392a', 'Capo version', '{title: Camino del Estrella}
{ci: alternative version}

Abuela luna, abuelo sol
Cantamos juntos esta canción
Agua que limpia, fuego que cura
Tierra que sostiene, viento que murmura', NULL, 'Em', 2, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, NULL, NULL, now() - interval '14340295 seconds'),
  ('f716a8cb-6d09-4802-9797-18e6f51ce516', '542d4011-057f-46c4-8362-233e5b63fef3', 'Capo version', '{title: Canção do Estrella Divino}
{ci: alternative version}
{artist: Ayla Schafer}
{key: Bm}
{c: Canto para el círculo}

{soc}
[G]Vuela, vuela [C]colibrí
[D]Lleva mi canto [G]hasta ti
{eoc}

[Em]Agua que [C]limpia, [G]fuego que [D]cura
[Em]Viento que [C]lleva la [G]noche os[D]cura

{ci: Repetir dos veces}', NULL, 'A', 2, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', NULL, NULL, NULL, now() - interval '14400146 seconds');
INSERT INTO public.song_versions (id, composition_id, version_name, content_chordpro, melody_notation, key, capo, tuning, contributor_id, youtube_url, spotify_url, soundcloud_url, created_at) VALUES
  ('fd936d40-6757-437d-a935-6eb0d7cbcf6a', 'd7ecf51d-0677-4a78-b007-9da39585392a', 'Standard', '{title: Camino del Estrella}

Abuela luna, abuelo sol
Cantamos juntos esta canción
Agua que limpia, fuego que cura
Tierra que sostiene, viento que murmura', 'X:1
T:Random Melody
M:3/4
L:1/8
K:D
A2 d2 f2 | e2 d2 B2 | A4 z2 |]', 'Dm', 5, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'https://www.youtube.com/watch?v=dbbZGLR_e20', NULL, NULL, now() - interval '14426695 seconds'),
  ('780f70c3-145c-494a-b0fd-f4a64bb4104a', '542d4011-057f-46c4-8362-233e5b63fef3', 'Standard', '{title: Canção do Estrella Divino}
{artist: Ayla Schafer}
{key: Bm}
{c: Canto para el círculo}

{soc}
[G]Vuela, vuela [C]colibrí
[D]Lleva mi canto [G]hasta ti
{eoc}

[Em]Agua que [C]limpia, [G]fuego que [D]cura
[Em]Viento que [C]lleva la [G]noche os[D]cura

{ci: Repetir dos veces}', NULL, 'Bm', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'https://www.youtube.com/watch?v=dbbZGLR_e20', NULL, NULL, now() - interval '14486546 seconds'),
  ('479ba299-3a05-4bdd-a672-63c0334a9f63', 'c3dc3ade-3247-491d-bbb9-501ec297b64e', 'Standard', '{title: Camino del Estrella}
{artist: Curawaka}

   G                C
I am the river and the river is me
D                  G
Flowing to the sea, flowing to the sea

Page 1/1

   Em        C
O sisters, let’s go down
       D                G
Don’t you wait, down to the river we go', NULL, 'Bm', 1, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'https://www.youtube.com/watch?v=dbbZGLR_e20', NULL, NULL, now() - interval '14540204 seconds'),
  ('2494a4a6-d46e-4428-95ed-9f367c57a6d6', '62146eaf-eec7-4991-b592-3591a813e026', 'Standard', '{title: Viento del Lluvia Divino}
{artist: Alain Merens}

Abuela luna, abuelo sol
Cantamos juntos esta canción
Agua que limpia, fuego que cura
Tierra que sostiene, viento que murmura', NULL, 'Am', 1, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, 'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC', 'https://soundcloud.com/curawaka/hey-yamayo', now() - interval '14740208 seconds'),
  ('69af0633-fc1a-41cf-8179-5349fea0f2e7', 'f23b3091-9817-4ae4-a30c-eff186bcc760', 'Standard', '{title: Canção do Colibrí}
{artist: Traditional}

Abuela luna, abuelo sol
Cantamos juntos esta canción
Agua que limpia, fuego que cura
Tierra que sostiene, viento que murmura', NULL, 'F#m', 3, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, 'https://open.spotify.com/track/4PTG3Z6ehGkBF3zIqYQGKg', NULL, now() - interval '14783800 seconds'),
  ('0e9c3da6-65a4-4fff-a742-0e3596e891b9', '81cbca26-dce6-4053-9bcd-c334931ea89b', 'Standard', '{title: Guardián del Corazón Universal}
{artist: Santo Daime}

   G                C
I am the river and the river is me
D                  G
Flowing to the sea, flowing to the sea

Page 1/1

   Em        C
O sisters, let’s go down
       D                G
Don’t you wait, down to the river we go', NULL, 'A', 1, 'Drop D', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'https://youtu.be/6R7pxNzEAaM', NULL, NULL, now() - interval '15317426 seconds'),
  ('38981efb-5d1f-40f5-b1a0-5420a38ccf31', 'a5352c63-7341-4406-820d-795dd5c5d97d', 'Standard', '{title: Rezo al Mountain Viejo}
{artist: Traditional (Umbanda)}
{key: Bb}
{c: Canto para el círculo}

{soc}
[G]Vuela, vuela [C]colibrí
[D]Lleva mi canto [G]hasta ti
{eoc}

[Em]Agua que [C]limpia, [G]fuego que [D]cura
[Em]Viento que [C]lleva la [G]noche os[D]cura

{ci: Repetir dos veces}', NULL, 'Bb', 0, 'Half-Step Down', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, NULL, NULL, now() - interval '15417781 seconds'),
  ('bbc7b140-6ca2-48fa-a3a9-899e595762cb', '97bedd7b-5f8a-4b79-8651-4728754d21d4', 'Standard', '{title: Voz del Medicina Sagrada}
{artist: Peia}
{key: Bm}
{c: Canto para el círculo}

{soc}
[G]Vuela, vuela [C]colibrí
[D]Lleva mi canto [G]hasta ti
{eoc}

[Em]Agua que [C]limpia, [G]fuego que [D]cura
[Em]Viento que [C]lleva la [G]noche os[D]cura

{ci: Repetir dos veces}', NULL, 'Bm', 0, 'Drop D', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'https://www.youtube.com/watch?v=kXYiU_JCYtU', NULL, NULL, now() - interval '15425245 seconds'),
  ('88ca8f88-a9e6-4ebc-a291-eedaea7dbd66', 'b0c4e1d5-1c43-4af4-9991-b6147794aaf6', 'Capo version', '{title: Latido de la River}
{ci: alternative version}
{artist: Nina}

   G                C
I am the river and the river is me
D                  G
Flowing to the sea, flowing to the sea

Page 1/1

   Em        C
O sisters, let’s go down
       D                G
Don’t you wait, down to the river we go', NULL, 'F', 2, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', NULL, NULL, NULL, now() - interval '15542108 seconds'),
  ('5cbd114f-9609-4232-8250-373e363dbfdd', 'f91f8923-8fd1-4536-b6bb-4b71a873fcff', 'Standard', '{title: Espíritu de la Águila Cósmico}
{artist: Nina &amp; Traditional (Camino Rojo)}
{key: Am}

[G]Eu canto a canção [C]que não tem fim
[D]Coração aberto [G]dentro de mim
[G]Estou firme no [C]meu lugar
[D]Com a força da [G]mãe pra me guiar', NULL, 'Am', 2, 'DADGAD', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, 'https://soundcloud.com/user-778401370/la-curandera', now() - interval '15546869 seconds'),
  ('ff4e6e80-220e-43eb-90d8-dc505623cb81', 'b0c4e1d5-1c43-4af4-9991-b6147794aaf6', 'Standard', '{title: Latido de la River}
{artist: Nina}

   G                C
I am the river and the river is me
D                  G
Flowing to the sea, flowing to the sea

Page 1/1

   Em        C
O sisters, let’s go down
       D                G
Don’t you wait, down to the river we go', NULL, NULL, 2, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', NULL, 'https://open.spotify.com/track/4PTG3Z6ehGkBF3zIqYQGKg', NULL, now() - interval '15628508 seconds'),
  ('416372f7-42ba-40a4-a891-a70a0f4da3b3', '70ac6a2a-568d-4953-83ff-c201e17380db', 'Standard', '{title: Guardián del Tierra Divino}
{artist: Ayla Nereo}
{key: Dm}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'Dm', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', NULL, NULL, 'https://soundcloud.com/user-778401370/la-curandera', now() - interval '15739297 seconds'),
  ('ea02e9f4-ee0e-4146-b0c0-0ec9a3d0f648', '86860741-6952-4185-a19c-9c8d32e6501f', 'Standard', '{title: Song of the Selva}
{artist: Shimshai}

Abuela luna, abuelo sol
Cantamos juntos esta canción
Agua que limpia, fuego que cura
Tierra que sostiene, viento que murmura', 'X:1
T:Random Melody
M:3/4
L:1/8
K:D
A2 d2 f2 | e2 d2 B2 | A4 z2 |]', 'C#m', 0, 'Half-Step Down', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, NULL, now() - interval '15755264 seconds'),
  ('4222d093-b702-467b-bafd-2184ea22354b', '2409957d-4e89-4045-b14b-9e7a9c2b60f7', 'Standard', '{title: Camino del Lluvia Curandero}
{artist: Traditional (Umbanda) / Ayla Schafer}
{key: Dm}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'Dm', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NULL, NULL, NULL, now() - interval '15993595 seconds'),
  ('08985071-17c6-4c2b-a8b8-c1d574e5a3ec', '462d0bbb-8397-44ae-9d81-dd26ebba6666', 'Standard', '{title: Abuelita Corazón}
{artist: Fiona Helmer}
{key: A}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'A', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'https://youtu.be/6R7pxNzEAaM', NULL, NULL, now() - interval '16726128 seconds'),
  ('725aa42a-6b51-47fa-8b7a-18429d3c2fac', 'b2d464ad-37f4-4860-bdd8-6cb33e5841ba', 'Standard', '{title: Sinfonía del Corazón}
{artist: Fiona Helmer}

   G                C
I am the river and the river is me
D                  G
Flowing to the sea, flowing to the sea

Page 1/1

   Em        C
O sisters, let’s go down
       D                G
Don’t you wait, down to the river we go', NULL, 'Gb', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'https://www.youtube.com/watch?v=5qap5aO4i9A', NULL, 'https://soundcloud.com/user-778401370/la-curandera', now() - interval '16779197 seconds'),
  ('d959909a-1acc-4297-8da2-741bb330ecab', 'b7e35d1f-f931-467b-a376-dcac5d84b337', 'Standard', '{title: Canto al Colibrí}
{artist: Nina}
{key: Em}
{c: Canto para el círculo}

{soc}
[G]Vuela, vuela [C]colibrí
[D]Lleva mi canto [G]hasta ti
{eoc}

[Em]Agua que [C]limpia, [G]fuego que [D]cura
[Em]Viento que [C]lleva la [G]noche os[D]cura

{ci: Repetir dos veces}', NULL, 'Em', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, NULL, NULL, now() - interval '16939438 seconds'),
  ('9235ba6f-0f05-44bf-839f-921285400603', '323142cb-d37d-44aa-897d-0e9986189d4b', 'Standard', '{title: Abuelita Tierra Universal}
{artist: Fiona Helmer}
{key: F#m}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'F#m', 0, 'Half-Step Down', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, NULL, NULL, now() - interval '17035401 seconds'),
  ('f8c302b5-270f-4a1e-b611-a62efe2e1e7a', 'bbf76f5e-c033-405e-acee-7d89f760525d', 'Standard', '{title: Luz de la Agua Bendita}
{artist: Alonso del Río}
{key: Bb}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'Bb', 2, 'Half-Step Down', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', NULL, NULL, NULL, now() - interval '17071057 seconds'),
  ('7e420c06-14a0-46ab-8bd1-71829151b885', 'e2958212-7784-4505-8df1-2997511314db', 'Standard', '{title: Fuerza de la Bosque Cielo}
{artist: Herbert Quinteros}
{key: Dm}
{c: Canto para el círculo}

{soc}
[G]Vuela, vuela [C]colibrí
[D]Lleva mi canto [G]hasta ti
{eoc}

[Em]Agua que [C]limpia, [G]fuego que [D]cura
[Em]Viento que [C]lleva la [G]noche os[D]cura

{ci: Repetir dos veces}', NULL, 'Dm', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', NULL, NULL, NULL, now() - interval '17101045 seconds');
INSERT INTO public.song_versions (id, composition_id, version_name, content_chordpro, melody_notation, key, capo, tuning, contributor_id, youtube_url, spotify_url, soundcloud_url, created_at) VALUES
  ('dfdc0c0f-2c1a-46ea-b2c1-205dc639510c', '80d25c41-cbf0-492e-8720-9da493fe953f', 'Standard', '{title: Ecos del Montaña Puro}
{key: F#m}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'F#m', 5, 'Half-Step Down', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, NULL, NULL, now() - interval '17532082 seconds'),
  ('63d21047-05c4-4cbf-b550-25b24e0a75fc', '56b61cde-d346-4d2e-b7c1-23694eb1cccf', 'Standard', '{title: Camino del Tierra Cósmico}
{artist: Dario Hampi Pakari}
{key: Bm}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'Bm', 0, 'DADGAD', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, NULL, 'https://soundcloud.com/user-778401370/la-curandera', now() - interval '17582011 seconds'),
  ('6870d0b0-7993-4524-a808-6df8934a61c8', '1b7cdee7-8470-4108-bb77-3478a88a7f01', 'Standard', '{title: Hino da Cóndor}
{key: Dm}
{c: Canto para el círculo}

{soc}
[G]Vuela, vuela [C]colibrí
[D]Lleva mi canto [G]hasta ti
{eoc}

[Em]Agua que [C]limpia, [G]fuego que [D]cura
[Em]Viento que [C]lleva la [G]noche os[D]cura

{ci: Repetir dos veces}', NULL, 'Dm', 0, 'Drop D', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', NULL, NULL, 'https://soundcloud.com/octobersveryown/drake-back-to-back', now() - interval '18455448 seconds'),
  ('8f86fd42-c6ad-4cb4-8108-bff2453621ba', '9e54ae79-6941-46b2-846b-0d0c60ec2904', 'Standard', '{title: Abuelo Bosque Cielo}
{key: A}
{c: Canto para el círculo}

{soc}
[G]Vuela, vuela [C]colibrí
[D]Lleva mi canto [G]hasta ti
{eoc}

[Em]Agua que [C]limpia, [G]fuego que [D]cura
[Em]Viento que [C]lleva la [G]noche os[D]cura

{ci: Repetir dos veces}', NULL, 'A', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, NULL, NULL, now() - interval '18559438 seconds'),
  ('e175bd47-5ed0-4190-89f1-9ee8f63666a6', 'cc797377-3c6a-4172-bda9-7be7094ecfdc', 'Standard', '{title: Ecos del Lluvia Sagrada}
{artist: Ayla Schafer}
{key: F}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'F', 5, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, NULL, NULL, now() - interval '18609100 seconds'),
  ('352f30c5-dee3-4216-9f29-294ac8d76b8f', 'b062a7cb-49a6-4216-a0e7-77d7af3909a0', 'Standard', '{title: Fuerza de la Vida}
{artist: Shimshai}

Abuela luna, abuelo sol
Cantamos juntos esta canción
Agua que limpia, fuego que cura
Tierra que sostiene, viento que murmura', NULL, 'C', 0, 'Drop D', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, NULL, 'https://soundcloud.com/curawaka/hey-yamayo', now() - interval '19582126 seconds'),
  ('9aba864c-3576-4cca-ba28-0b36f7aa36d5', 'fd1e663c-8daf-4ce6-8e0a-af43aab15540', 'Standard', '{title: Luz de la Cóndor Amor}
{artist: Danit}

Abuela luna, abuelo sol
Cantamos juntos esta canción
Agua que limpia, fuego que cura
Tierra que sostiene, viento que murmura', NULL, 'F#m', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NULL, NULL, NULL, now() - interval '19720871 seconds'),
  ('1417155f-bda4-4a0e-8b70-42928abde042', '307b5720-830e-421e-b129-db5a4240778e', 'Standard', '{title: Abuelita Vida}
{artist: Traditional (Umbanda) and Santo Daime}
{key: E}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'E', 0, 'Drop D', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'https://www.youtube.com/watch?v=dbbZGLR_e20', NULL, 'https://soundcloud.com/octobersveryown/drake-back-to-back', now() - interval '20034864 seconds'),
  ('bf527e6f-b765-4299-8db1-b8d4e31cbced', 'e3c28e92-2149-4a6b-a719-9d90d51c5baa', 'Capo version', '{title: Luz de la River Puro 🔥}
{ci: alternative version}
{artist: Diego Palma}
{key: Dm}
{c: Canto para el círculo}

{soc}
[G]Vuela, vuela [C]colibrí
[D]Lleva mi canto [G]hasta ti
{eoc}

[Em]Agua que [C]limpia, [G]fuego que [D]cura
[Em]Viento que [C]lleva la [G]noche os[D]cura

{ci: Repetir dos veces}', NULL, 'G', 2, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NULL, NULL, NULL, now() - interval '20051689 seconds'),
  ('7a0c9f36-74a0-4689-8507-e38f25dea8d0', 'e3c28e92-2149-4a6b-a719-9d90d51c5baa', 'Standard', '{title: Luz de la River Puro 🔥}
{artist: Diego Palma}
{key: Dm}
{c: Canto para el círculo}

{soc}
[G]Vuela, vuela [C]colibrí
[D]Lleva mi canto [G]hasta ti
{eoc}

[Em]Agua que [C]limpia, [G]fuego que [D]cura
[Em]Viento que [C]lleva la [G]noche os[D]cura

{ci: Repetir dos veces}', NULL, 'Dm', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'https://www.youtube.com/watch?v=5qap5aO4i9A', NULL, NULL, now() - interval '20138089 seconds'),
  ('a14e9572-1a42-4f7c-9147-0f5ef024b0d1', 'ee2a6364-cab6-43ab-8ed5-15ee68134133', 'Standard', '{title: Fuerza de la Sol}
{key: C}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'C', 4, 'Half-Step Down', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', NULL, NULL, NULL, now() - interval '20262141 seconds'),
  ('5f65ca57-03a4-4118-936c-558025018c50', '06e9e7b6-8aee-4835-9f0e-c69d4a3a87aa', 'Capo version', '{title: Abuelo Cielo Profundo}
{ci: alternative version}
{artist: Shimshai}
{key: Dm}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'Bb', 2, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NULL, NULL, NULL, now() - interval '20409474 seconds'),
  ('cd7e0fc3-2836-4b99-b6e7-d8ad75c4bc80', '06e9e7b6-8aee-4835-9f0e-c69d4a3a87aa', 'Standard', '{title: Abuelo Cielo Profundo}
{artist: Shimshai}
{key: Dm}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'Dm', 0, 'DADGAD', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NULL, NULL, NULL, now() - interval '20495874 seconds'),
  ('9e9a4b53-2d68-4ab2-b87c-807e1606a0a3', 'f7b2d7d7-2c9a-4436-af59-77cdadc67f3c', 'Standard', '{title: Viento del Agua Bendita}
{artist: Ayla Schafer}
{key: A}
{capo: 1}
{c: Canto para el círculo}

{soc}
[G]Vuela, vuela [C]colibrí
[D]Lleva mi canto [G]hasta ti
{eoc}

[Em]Agua que [C]limpia, [G]fuego que [D]cura
[Em]Viento que [C]lleva la [G]noche os[D]cura

{ci: Repetir dos veces}', NULL, 'A', 1, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'https://www.youtube.com/watch?v=dbbZGLR_e20', NULL, NULL, now() - interval '21337973 seconds'),
  ('8e42d6f2-7e45-4e71-900d-e255b25469c3', '749f6dce-4018-4d09-9c14-8799f06121b9', 'Standard', '{title: Cura de la Piedra}

   G                C
I am the river and the river is me
D                  G
Flowing to the sea, flowing to the sea

Page 1/1

   Em        C
O sisters, let’s go down
       D                G
Don’t you wait, down to the river we go', NULL, 'D', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, NULL, now() - interval '21449351 seconds'),
  ('8f0cb3b5-2a60-4d01-b474-2d350222c400', '687780d0-935b-4a6a-9696-e48c8bccd0e5', 'Standard', '{title: Fuerza de la Mar}
{key: Em}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'Em', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NULL, NULL, NULL, now() - interval '21597400 seconds'),
  ('4a981803-09dd-4887-a30b-4dbeeac224d1', 'f6e5e7bc-19aa-4b62-a5bb-a7cccb604d0b', 'Standard', '{title: Canção do Mountain Curandero}
{artist: Danit}
{key: A}
{c: Canto para el círculo}

{soc}
[G]Vuela, vuela [C]colibrí
[D]Lleva mi canto [G]hasta ti
{eoc}

[Em]Agua que [C]limpia, [G]fuego que [D]cura
[Em]Viento que [C]lleva la [G]noche os[D]cura

{ci: Repetir dos veces}', NULL, 'A', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, NULL, NULL, now() - interval '21671674 seconds'),
  ('09057a07-4f83-4d6b-8918-6933d99a502d', '3845f230-cd7e-41e1-b3dd-5faefad6ef96', 'Standard', '{title: Danza del Jaguar Universal}
{artist: Danit}
{key: Dm}

[G]Eu canto a canção [C]que não tem fim
[D]Coração aberto [G]dentro de mim
[G]Estou firme no [C]meu lugar
[D]Com a força da [G]mãe pra me guiar', NULL, 'Dm', 5, 'Drop D', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NULL, NULL, NULL, now() - interval '22020302 seconds'),
  ('a87cb758-2480-43dc-9737-6bc996c85f8b', 'd9e1f95d-6e04-4331-b1ba-60d5051c00d9', 'Standard', '{title: Abuelita Mar}
{artist: Traditional (Umbanda)}
{key: Am}

[Gbmaj7]Noite de [Dbmaj7]lua cheia
[Ebmaj7]Canta o [Bbm]coração
[F#m7]Sobe a [C#m]montanha
[D/F#]Desce ao [Bbm]mar', NULL, 'Am', 0, 'Half-Step Down', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'https://www.youtube.com/watch?v=5qap5aO4i9A', NULL, NULL, now() - interval '22337818 seconds'),
  ('d3fab812-319b-4a17-85d9-1793788b3b7b', 'b882d663-3c59-40c8-8385-7b3852aa72c8', 'Standard', '{title: Rezo al Águila}
{key: Bb}
{capo: 1}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'Bb', 1, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NULL, NULL, NULL, now() - interval '22534552 seconds');
INSERT INTO public.song_versions (id, composition_id, version_name, content_chordpro, melody_notation, key, capo, tuning, contributor_id, youtube_url, spotify_url, soundcloud_url, created_at) VALUES
  ('c47ee5a7-a553-45ec-bc53-0a878d0bdec3', 'a358a941-e525-464c-9555-9ec446b4bdb8', 'Standard', '{title: Abuelo Sol Cósmico}
{artist: Dario Hampi Pakari &amp; Ayla Schafer}
{key: Bb}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'Bb', 5, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, 'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC', 'https://soundcloud.com/octobersveryown/drake-back-to-back', now() - interval '22629208 seconds'),
  ('2b422564-1fca-4eb2-bdc0-2b031758c09e', '2ddadd5b-ff3f-4370-9f44-6670396a6e2f', 'Standard', '{title: Viento del Pachamama Viejo}
{artist: Peia}
{key: E}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'E', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', NULL, NULL, NULL, now() - interval '22868744 seconds'),
  ('c9049933-2edb-4745-9208-519be5234c0e', '575b1997-3b42-48fa-acf3-a5bbec7d608a', 'Standard', '{title: Cura de la Luna}
{artist: traditional (camino rojo)}
{key: Em}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'Em', 3, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', NULL, NULL, NULL, now() - interval '22894435 seconds'),
  ('1821031f-eeaa-4f09-9e0b-c4e0d1d533da', '29490f14-385a-462c-b798-159ff6218b4d', 'Standard', '{title: Guardián del Mountain}
{artist: Traditional}

Abuela luna, abuelo sol
Cantamos juntos esta canción
Agua que limpia, fuego que cura
Tierra que sostiene, viento que murmura', NULL, 'Bb', 0, 'DADGAD', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, 'https://soundcloud.com/octobersveryown/drake-back-to-back', now() - interval '23226918 seconds'),
  ('da5f291b-4971-4566-93ea-6dcf483e36b8', '3fe5611f-77e7-41cf-97ce-6d6a6b39d21c', 'Standard', '{title: Prayer for the Sol}
{artist: Danit}
{key: G}
{c: Canto para el círculo}

{soc}
[G]Vuela, vuela [C]colibrí
[D]Lleva mi canto [G]hasta ti
{eoc}

[Em]Agua que [C]limpia, [G]fuego que [D]cura
[Em]Viento que [C]lleva la [G]noche os[D]cura

{ci: Repetir dos veces}', NULL, 'G', 5, 'Drop D', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', NULL, NULL, NULL, now() - interval '23509872 seconds'),
  ('79827c68-5470-43a2-b6c2-fb3902324605', 'ccd5d47e-c82d-4f5c-845b-4d86abc0c605', 'Standard', '{title: Viento del River Limpio}

   G                C
I am the river and the river is me
D                  G
Flowing to the sea, flowing to the sea

Page 1/1

   Em        C
O sisters, let’s go down
       D                G
Don’t you wait, down to the river we go', NULL, 'Gb', 0, 'Drop D', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, NULL, NULL, now() - interval '23569914 seconds'),
  ('9a578798-7e40-4132-95a4-d6d12c73f845', '606c94f3-6eab-4f6f-9e30-0228afcb4b92', 'Standard', '{title: Rezo al Cóndor Cielo}
{artist: Alonso del Río and Peia}

Abuela luna, abuelo sol
Cantamos juntos esta canción
Agua que limpia, fuego que cura
Tierra que sostiene, viento que murmura', NULL, NULL, 1, 'Half-Step Down', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, NULL, NULL, now() - interval '23663538 seconds'),
  ('9139b6ea-c378-4361-ae4b-ce82ef530578', 'cb012d44-9e32-4dfd-a97e-e584a80e44f8', 'Standard', '{title: Espíritu de la Luna Amor}
{artist: Traditional}
{key: Am}

[Gbmaj7]Noite de [Dbmaj7]lua cheia
[Ebmaj7]Canta o [Bbm]coração
[F#m7]Sobe a [C#m]montanha
[D/F#]Desce ao [Bbm]mar', NULL, 'Am', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', NULL, NULL, NULL, now() - interval '23841689 seconds'),
  ('2869a418-2bd1-474b-ba5e-b3a7901d66b0', 'dbce5509-7b40-4fbf-bf49-4456b10e02e3', 'Standard', '{title: Camino del Pachamama Profundo}
{artist: Herbert Quinteros &amp; Alain Merens}
{key: A}

[G]Eu canto a canção [C]que não tem fim
[D]Coração aberto [G]dentro de mim
[G]Estou firme no [C]meu lugar
[D]Com a força da [G]mãe pra me guiar', NULL, 'A', 0, 'Drop D', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', NULL, 'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC', NULL, now() - interval '24060313 seconds'),
  ('9355a763-04fd-4798-b6ba-3eccaea2b7dd', 'daa5c58a-165c-4355-a354-3af12675c168', 'Standard', '{title: Luz de la Flor}
{artist: Traditional (Umbanda)}
[Am]Hello [G]World', NULL, 'Am', 3, 'DADGAD', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', NULL, NULL, 'https://soundcloud.com/user-778401370/la-curandera', now() - interval '24452530 seconds'),
  ('7a491b9b-f671-4bdd-a8af-82095e79daa9', 'b52d7d61-6d62-488b-b33a-d5eaa9f5aa67', 'Standard', '{title: Danza del Mountain}
{artist: Danit}
{key: F#m}

[Gbmaj7]Noite de [Dbmaj7]lua cheia
[Ebmaj7]Canta o [Bbm]coração
[F#m7]Sobe a [C#m]montanha
[D/F#]Desce ao [Bbm]mar', NULL, 'F#m', 0, 'Drop D', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'https://youtu.be/6R7pxNzEAaM', 'https://open.spotify.com/track/2HZQQ8PriDD1z7tcvAU9KH', NULL, now() - interval '25048309 seconds'),
  ('5d494831-1073-4e9f-8dd0-4e8b875328ab', '8d157e2b-d383-4ab9-b078-5ef511b10085', 'Standard', '{title: Voz del Vida}
{artist: Diego Palma}
{key: Em}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'Em', 0, 'Drop D', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'https://www.youtube.com/watch?v=kXYiU_JCYtU', NULL, NULL, now() - interval '25280479 seconds'),
  ('0f2e213e-9464-4954-bf8a-93a27c92040d', '958d0c69-22f1-404f-b911-946d3d52aaa7', 'Standard', '{title: Grandmother''s Danza del Vida Divino}
{artist: Xavier Rudd}
{key: Em}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', 'X:1
T:Random Melody
M:3/4
L:1/8
K:D
A2 d2 f2 | e2 d2 B2 | A4 z2 |]', 'Em', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, NULL, NULL, now() - interval '25399048 seconds'),
  ('4279508e-401e-4242-998e-0347fed35b34', '38536e21-a292-46d7-b403-c971e39a774e', 'Standard', '{title: Sinfonía del Cielo Amor}
{artist: Traditional}
{key: F#m}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'F#m', 3, 'Half-Step Down', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'https://www.youtube.com/watch?v=dbbZGLR_e20', NULL, NULL, now() - interval '25558660 seconds'),
  ('2faf94fc-144b-466e-8a7a-9631fbe4e6e2', '2a885ef5-6c00-45f5-9f84-0f4ef44fae62', 'Standard', '{title: Abuelo Floresta}
{artist: Traditional (Umbanda)}
{key: F}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'F', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://open.spotify.com/track/2HZQQ8PriDD1z7tcvAU9KH', NULL, now() - interval '25874302 seconds'),
  ('5e8c4501-dccd-4b96-85e8-7012a4f22a2d', 'ed028840-31be-4ee4-83af-551b14251f71', 'Standard', '{title: Ecos del Mar Sagrado}
{artist: Santo Daime}
{key: Bb}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'Bb', 0, 'DADGAD', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, NULL, now() - interval '26056412 seconds'),
  ('3c75d2f0-7e1e-4bd4-af0e-3a44e479a4b9', 'bfada781-5c74-4fcd-bd77-890cb0303481', 'Standard', '{title: Canção do River Divino}
{key: F}
{c: Canto para el círculo}

{soc}
[G]Vuela, vuela [C]colibrí
[D]Lleva mi canto [G]hasta ti
{eoc}

[Em]Agua que [C]limpia, [G]fuego que [D]cura
[Em]Viento que [C]lleva la [G]noche os[D]cura

{ci: Repetir dos veces}', NULL, 'F', 0, 'Drop D', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, 'https://open.spotify.com/track/2HZQQ8PriDD1z7tcvAU9KH', NULL, now() - interval '26093984 seconds'),
  ('0b809c30-77d6-494c-b9a1-079c6e9b922e', '0699a4cd-f7b6-4cf3-b8c3-fa0712db1593', 'Standard', '{title: Latido de la Flor}
{artist: Cari El}
{key: Gb}

[Gbmaj7]Noite de [Dbmaj7]lua cheia
[Ebmaj7]Canta o [Bbm]coração
[F#m7]Sobe a [C#m]montanha
[D/F#]Desce ao [Bbm]mar', NULL, 'Gb', 0, 'Half-Step Down', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NULL, NULL, NULL, now() - interval '26098700 seconds'),
  ('24f16ac5-71d1-4684-bd53-b688790c9c9c', 'dc0789f1-1a6a-4a8a-ba56-f44c76c06fc6', 'Standard', '{title: Abuelo Estrella}
{key: Bb}

[G]Eu canto a canção [C]que não tem fim
[D]Coração aberto [G]dentro de mim
[G]Estou firme no [C]meu lugar
[D]Com a força da [G]mãe pra me guiar', NULL, 'Bb', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', NULL, NULL, NULL, now() - interval '26222565 seconds'),
  ('d231e9ea-ed95-4f3e-8b1e-d78bd286b09f', '3faac046-e8db-4354-b779-6c9a9c945224', 'Standard', '{title: Danza del Corazón Cósmico}
{artist: Alonso del Río}

Abuela luna, abuelo sol
Cantamos juntos esta canción
Agua que limpia, fuego que cura
Tierra que sostiene, viento que murmura', NULL, NULL, 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'https://www.youtube.com/watch?v=kXYiU_JCYtU', 'https://open.spotify.com/track/4PTG3Z6ehGkBF3zIqYQGKg', NULL, now() - interval '26247146 seconds');
INSERT INTO public.song_versions (id, composition_id, version_name, content_chordpro, melody_notation, key, capo, tuning, contributor_id, youtube_url, spotify_url, soundcloud_url, created_at) VALUES
  ('ad4c29a9-7e40-441e-8263-df6b649722a2', 'f0368cda-0f9f-4d91-8f30-56dbae59e20f', 'Standard', '{title: Viento del Luna Limpio (Luz de la Piedra version, as sung at the long night ceremony)}
{artist: Santo Daime}

Abuela luna, abuelo sol
Cantamos juntos esta canción
Agua que limpia, fuego que cura
Tierra que sostiene, viento que murmura', NULL, 'F#m', 2, 'DADGAD', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'https://youtu.be/6R7pxNzEAaM', NULL, NULL, now() - interval '26319113 seconds'),
  ('891b76e0-61e2-41c2-9677-a404f546932a', '8eccfcc7-6b46-437c-b59d-8f1608a42f57', 'Standard', '{title: Sinfonía del Cóndor Amor}
{artist: Fiona Helmer &amp; Cari El}

Abuela luna, abuelo sol
Cantamos juntos esta canción
Agua que limpia, fuego que cura
Tierra que sostiene, viento que murmura', NULL, 'C#m', 0, 'Half-Step Down', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NULL, NULL, NULL, now() - interval '26435624 seconds'),
  ('e218693a-0333-446c-a154-da8b73dd7a4d', '530be2e2-f9ee-42e9-ab60-5c23b4c64838', 'Standard', '{title: Abuelita Bosque Ancestral}
{artist: Santo Daime}

Abuela luna, abuelo sol
Cantamos juntos esta canción
Agua que limpia, fuego que cura
Tierra que sostiene, viento que murmura', NULL, 'F', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, NULL, NULL, now() - interval '26460765 seconds'),
  ('04bb84bf-bce8-49c2-93ab-925628a26788', '200e81ff-6e16-4935-b049-c35fb75078d9', 'Standard', '{title: Canto al Jaguar Sagrada 🔥}
{artist: Traditional (Camino Rojo)}
{key: G}

[G]Eu canto a canção [C]que não tem fim
[D]Coração aberto [G]dentro de mim
[G]Estou firme no [C]meu lugar
[D]Com a força da [G]mãe pra me guiar', NULL, 'G', 0, 'DADGAD', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'https://www.youtube.com/watch?v=5qap5aO4i9A', NULL, 'https://soundcloud.com/user-778401370/la-curandera', now() - interval '26546794 seconds'),
  ('32ab9edf-9ef3-45c5-96ce-5d1b688f78f1', 'e4c7ac25-4c15-43dd-89ff-d267f0ccf0f2', 'Standard', '{title: Guardián del Colibrí}
{artist: Santo Daime}
{key: Gb}

[Gbmaj7]Noite de [Dbmaj7]lua cheia
[Ebmaj7]Canta o [Bbm]coração
[F#m7]Sobe a [C#m]montanha
[D/F#]Desce ao [Bbm]mar', NULL, 'Gb', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'https://youtu.be/6R7pxNzEAaM', NULL, 'https://soundcloud.com/octobersveryown/drake-back-to-back', now() - interval '26654029 seconds'),
  ('62b50fa0-8147-4149-84f1-cc52ba0d58b8', '32cd41ca-3dda-4213-b5c8-33e641281e27', 'Standard', '{title: Llamado del Montaña Limpio}
{artist: Peia}
{key: Em}
{capo: 3}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'Em', 3, 'Half-Step Down', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, NULL, 'https://soundcloud.com/octobersveryown/drake-back-to-back', now() - interval '26660022 seconds'),
  ('74eb6b8e-3dcc-40e4-9865-ddb4c0720a16', 'df9b212c-9a05-4f6f-aa8b-b3b9317e9add', 'Standard', '{title: Abuelo Floresta Sagrada}
{artist: Nina}
{key: Bb}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'Bb', 0, 'DADGAD', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'https://www.youtube.com/watch?v=kXYiU_JCYtU', 'https://open.spotify.com/track/2HZQQ8PriDD1z7tcvAU9KH', NULL, now() - interval '26678771 seconds'),
  ('52c70ae9-4827-489f-8e32-d5c5749b8f5a', '1056d0b8-a9a5-4494-a08a-08ca955e504b', 'Capo version', '{title: Hino da Bosque}
{ci: alternative version}
{artist: Traditional}

   G                C
I am the river and the river is me
D                  G
Flowing to the sea, flowing to the sea

Page 1/1

   Em        C
O sisters, let’s go down
       D                G
Don’t you wait, down to the river we go', NULL, 'D', 2, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, NULL, NULL, now() - interval '26729671 seconds'),
  ('f1505419-bc11-4471-a20a-b27aace5b28d', '1056d0b8-a9a5-4494-a08a-08ca955e504b', 'Standard', '{title: Hino da Bosque}
{artist: Traditional}

   G                C
I am the river and the river is me
D                  G
Flowing to the sea, flowing to the sea

Page 1/1

   Em        C
O sisters, let’s go down
       D                G
Don’t you wait, down to the river we go', NULL, 'Em', 1, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'https://www.youtube.com/watch?v=dbbZGLR_e20', NULL, NULL, now() - interval '26816071 seconds'),
  ('f9b43b89-8369-4bb5-a52e-95461dce40a5', 'aa99a6b9-b9b9-4789-9860-46ca51263ba1', 'Standard', '{title: Luz de la Estrella Ancestral 🔥}
{artist: Santo Daime}

Abuela luna, abuelo sol
Cantamos juntos esta canción
Agua que limpia, fuego que cura
Tierra que sostiene, viento que murmura', NULL, 'Am', 0, 'Half-Step Down', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'https://youtu.be/6R7pxNzEAaM', NULL, 'https://soundcloud.com/user-778401370/la-curandera', now() - interval '26883881 seconds'),
  ('d9edcf75-81c9-4911-bab9-6fc89009f135', '22625032-aa25-44cd-9241-1549fb06f250', 'Standard', '{title: Abuelo Piedra}
{artist: Traditional (Umbanda)}
{key: F#m}

[G]Eu canto a canção [C]que não tem fim
[D]Coração aberto [G]dentro de mim
[G]Estou firme no [C]meu lugar
[D]Com a força da [G]mãe pra me guiar', NULL, 'F#m', 0, 'Half-Step Down', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'https://www.youtube.com/watch?v=dbbZGLR_e20', NULL, NULL, now() - interval '27279619 seconds'),
  ('ac3748f5-75a3-41e8-921b-31224da31682', '79d0e2dd-86e2-4bcf-9719-36264b59af66', 'Standard', '{title: Sinfonía del Estrella}
{artist: Traditional (Camino Rojo)}
{key: Bb}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'Bb', 5, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'https://www.youtube.com/watch?v=5qap5aO4i9A', NULL, NULL, now() - interval '27529119 seconds'),
  ('17ffba94-087c-437c-bea5-730bafea410b', '5bfab953-3b39-48b6-aced-68850b672192', 'Standard', '{title: Luz de la Lluvia}
{artist: Ayla Schafer}
{key: Em}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'Em', 0, 'Half-Step Down', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'https://www.youtube.com/watch?v=kXYiU_JCYtU', NULL, NULL, now() - interval '27689968 seconds'),
  ('6eaf29e3-3ebb-4542-becc-37dd9000f66c', 'd2ac829b-4d1c-4079-8aed-570008347392', 'Live version', '{title: Song of the Fuego}
{ci: alternative version}
{artist: Cari El}

Abuela luna, abuelo sol
Cantamos juntos esta canción
Agua que limpia, fuego que cura
Tierra que sostiene, viento que murmura', NULL, 'Bb', 2, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NULL, NULL, NULL, now() - interval '27696608 seconds'),
  ('f40a99de-c4ea-4cd9-a6cc-2f30120bef40', 'a5c2d895-0043-4e96-a992-636666842afe', 'Standard', '{title: Espíritu de la River Puro}
{artist: Fiona Helmer}
{key: Em}

[Gbmaj7]Noite de [Dbmaj7]lua cheia
[Ebmaj7]Canta o [Bbm]coração
[F#m7]Sobe a [C#m]montanha
[D/F#]Desce ao [Bbm]mar', NULL, 'Em', 1, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NULL, NULL, NULL, now() - interval '27769436 seconds'),
  ('a57234f2-f449-418c-a7f6-724702ee45e0', 'd2ac829b-4d1c-4079-8aed-570008347392', 'Standard', '{title: Song of the Fuego}
{artist: Cari El}

Abuela luna, abuelo sol
Cantamos juntos esta canción
Agua que limpia, fuego que cura
Tierra que sostiene, viento que murmura', NULL, 'Bb', 0, 'DADGAD', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'https://youtu.be/6R7pxNzEAaM', NULL, NULL, now() - interval '27783008 seconds'),
  ('e488dbd4-c4bd-4950-be44-1144f45952d3', '11161817-5278-47d6-afe8-e9e843b7197c', 'Standard', '{title: Fuerza de la Flor Divino}
{artist: Santo Daime}
{key: C#m}

[Gbmaj7]Noite de [Dbmaj7]lua cheia
[Ebmaj7]Canta o [Bbm]coração
[F#m7]Sobe a [C#m]montanha
[D/F#]Desce ao [Bbm]mar', NULL, 'C#m', 0, 'DADGAD', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', NULL, NULL, NULL, now() - interval '27903452 seconds'),
  ('d82483de-ea8b-494e-8dff-456ec41eceb4', 'ef675cfa-ed33-45b6-b9ab-abc4e20344fd', 'Standard', '{title: Sinfonía del Piedra Amor}
{artist: Danit}

   G                C
I am the river and the river is me
D                  G
Flowing to the sea, flowing to the sea

Page 1/1

   Em        C
O sisters, let’s go down
       D                G
Don’t you wait, down to the river we go', 'X:1
T:Random Melody
M:3/4
L:1/8
K:D
A2 d2 f2 | e2 d2 B2 | A4 z2 |]', 'C#m', 0, 'DADGAD', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, 'https://open.spotify.com/track/2HZQQ8PriDD1z7tcvAU9KH', NULL, now() - interval '27912967 seconds'),
  ('c8e83c48-a423-4f8a-bfc4-13aacd495e2a', '5df38b1f-1c30-4520-8dfc-f15290899221', 'Standard', '{title: Abuelita Pachamama}
{artist: Xavier Rudd}
{key: Em}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'Em', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', NULL, NULL, NULL, now() - interval '28037512 seconds'),
  ('d0c590bb-0f42-49b6-91a8-7b8e43d1b0df', '8113f780-3d18-4b12-a291-ee6cbbb1ce81', 'Standard', '{title: Canção do Estrella Profundo}
{artist: Alain Merens / Traditional / Santo Daime}
{key: Bb}

[G]Eu canto a canção [C]que não tem fim
[D]Coração aberto [G]dentro de mim
[G]Estou firme no [C]meu lugar
[D]Com a força da [G]mãe pra me guiar', NULL, 'Bb', 0, 'Half-Step Down', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, NULL, 'https://soundcloud.com/octobersveryown/drake-back-to-back', now() - interval '28556986 seconds');
INSERT INTO public.song_versions (id, composition_id, version_name, content_chordpro, melody_notation, key, capo, tuning, contributor_id, youtube_url, spotify_url, soundcloud_url, created_at) VALUES
  ('7e85787a-7c26-42be-8ab5-b38374efaf86', 'feb70e68-d95b-4bf8-a892-ff84d967eec8', 'Standard', '{title: Abuelita Sol Amor}
{artist: Santo Daime / Ayla Nereo}
{key: Bb}

[G]Eu canto a canção [C]que não tem fim
[D]Coração aberto [G]dentro de mim
[G]Estou firme no [C]meu lugar
[D]Com a força da [G]mãe pra me guiar', NULL, 'Bb', 0, 'Drop D', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NULL, 'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC', NULL, now() - interval '29140138 seconds'),
  ('fcee3e64-9b60-4a37-9eff-71f10bdc9a8b', 'dd2fcd05-16b0-4bef-aaab-f62f97a0a161', 'Standard', '{title: Viento del Mar Profundo}
{artist: Ayla Schafer}
{key: Dm}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'Dm', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NULL, NULL, NULL, now() - interval '29149317 seconds'),
  ('5147e181-e2e5-46ec-9bd6-fd53ad36517e', '6cc92741-cdb3-4f2c-b2a9-867e46d5053c', 'Standard', '{title: Espíritu de la Luna}
{artist: Dario Hampi Pakari}
{key: G}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'G', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NULL, NULL, NULL, now() - interval '29304255 seconds'),
  ('2b530041-2291-4224-ab30-0b50de9f57a4', '358407eb-fb6c-4725-b74c-d45b24229d75', 'Standard', '{title: Llamado del Fuego Limpio}
{artist: Herbert Quinteros}
{key: Dm}
{capo: 3}
{c: Canto para el círculo}

{soc}
[G]Vuela, vuela [C]colibrí
[D]Lleva mi canto [G]hasta ti
{eoc}

[Em]Agua que [C]limpia, [G]fuego que [D]cura
[Em]Viento que [C]lleva la [G]noche os[D]cura

{ci: Repetir dos veces}', 'X:1
T:Random Melody
M:3/4
L:1/8
K:D
A2 d2 f2 | e2 d2 B2 | A4 z2 |]', 'Dm', 3, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, NULL, NULL, now() - interval '29848026 seconds'),
  ('d7ef45f4-2620-4fce-b6bc-d9275f59961d', '94f3dcd2-0a38-4de4-bcc6-f6daaab8187d', 'Standard', '{title: Latido de la Águila Viejo}

Abuela luna, abuelo sol
Cantamos juntos esta canción
Agua que limpia, fuego que cura
Tierra que sostiene, viento que murmura', NULL, 'D', 0, 'DADGAD', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', NULL, NULL, NULL, now() - interval '29899607 seconds'),
  ('cf278214-65e0-4775-a9ce-e45b297f51ab', '3bd6bdba-9a7b-4fbf-851f-2d7da88fdd46', 'Standard', '{title: Hino da Bosque Cielo}
{artist: Diego Palma}
{key: Gb}

[G]Eu canto a canção [C]que não tem fim
[D]Coração aberto [G]dentro de mim
[G]Estou firme no [C]meu lugar
[D]Com a força da [G]mãe pra me guiar', 'X:1
T:Random Melody
M:3/4
L:1/8
K:D
A2 d2 f2 | e2 d2 B2 | A4 z2 |]', 'Gb', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, NULL, NULL, now() - interval '30041358 seconds'),
  ('d6e58549-d7ce-4fa8-b91a-8457cd73f937', 'e33af2d0-0ba3-4e1b-9908-d16becf13504', 'Standard', '{title: Danza del Floresta}
{artist: Alonso del Río & Traditional (Umbanda)}
{key: Em}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'Em', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NULL, NULL, NULL, now() - interval '30317191 seconds'),
  ('34c45946-a709-46ee-80d0-c8b5d454990f', '54cd2202-1805-45d5-b504-17f2e0c5dbd3', 'Standard', '{title: Latido de la Bosque Amor}
{artist: Cari El}
{key: E}

[G]Eu canto a canção [C]que não tem fim
[D]Coração aberto [G]dentro de mim
[G]Estou firme no [C]meu lugar
[D]Com a força da [G]mãe pra me guiar', NULL, 'E', 1, 'Drop D', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NULL, NULL, NULL, now() - interval '30827842 seconds'),
  ('8a530108-a49d-43a4-82be-efe31a30ddcd', 'd079f01d-65eb-4aaf-a010-9378d8dd4d32', 'Capo version', '{title: Prayer for the Mountain Divino}
{ci: alternative version}
{artist: Traditional (Camino Rojo)}
{key: G}

[G]Eu canto a canção [C]que não tem fim
[D]Coração aberto [G]dentro de mim
[G]Estou firme no [C]meu lugar
[D]Com a força da [G]mãe pra me guiar', NULL, 'Bb', 2, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NULL, NULL, NULL, now() - interval '30931361 seconds'),
  ('c7dde718-870b-4889-b9be-9b3aeabe2295', 'd079f01d-65eb-4aaf-a010-9378d8dd4d32', 'Standard', '{title: Prayer for the Mountain Divino}
{artist: Traditional (Camino Rojo)}
{key: G}

[G]Eu canto a canção [C]que não tem fim
[D]Coração aberto [G]dentro de mim
[G]Estou firme no [C]meu lugar
[D]Com a força da [G]mãe pra me guiar', NULL, 'G', 2, 'Drop D', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NULL, 'https://open.spotify.com/track/2HZQQ8PriDD1z7tcvAU9KH', NULL, now() - interval '31017761 seconds'),
  ('ce17ceb8-69fc-4cab-a667-957b554f8018', 'ad84f534-f0af-4eba-9384-f2ceb3fe043b', 'Standard', '{title: Abuelita Sol Amor}
{artist: Traditional (Umbanda) and Diego Palma and Traditional}
{key: G}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'G', 4, 'Drop D', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, NULL, NULL, now() - interval '31107468 seconds'),
  ('fa01a117-3f4b-4098-bd90-b83f8e5fc379', 'd64916ce-586f-4a98-9798-d53e991fa6fd', 'Standard', '{title: Canção do Luna Puro}
{artist: Ayla Schafer}
[Am]Hello [G]World', NULL, 'F#m', 1, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'https://www.youtube.com/watch?v=dbbZGLR_e20', NULL, NULL, now() - interval '31677471 seconds'),
  ('bfee650f-3906-4490-9c1b-4f6685b63dbb', 'bd5e5e04-a630-434b-9c40-ce7642ea0bed', 'Standard', '{title: Guardián del Tierra}
{artist: Danit}
[Am]Hello [G]World', 'X:1
T:Random Melody
M:3/4
L:1/8
K:D
A2 d2 f2 | e2 d2 B2 | A4 z2 |]', 'G', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'https://youtu.be/6R7pxNzEAaM', NULL, NULL, now() - interval '31837292 seconds'),
  ('94b61c87-58ec-4196-86a0-603bbb887d2e', 'cb6d58ff-12e0-46dd-bb78-8367735c86b8', 'Standard', '{title: Guardián del Estrella}
{key: Dm}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', 'X:1
T:Random Melody
M:3/4
L:1/8
K:D
A2 d2 f2 | e2 d2 B2 | A4 z2 |]', 'Dm', 0, 'Half-Step Down', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', NULL, 'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC', NULL, now() - interval '31914022 seconds'),
  ('1271481d-1057-401d-8127-a1190b3d03fb', '064b08a6-435e-4b7e-b1c6-f4465b88dc3d', 'Standard', '{title: Canção do Jaguar Puro}
{artist: Xavier Rudd}
{key: Bm}
{capo: 1}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', 'X:1
T:Random Melody
M:3/4
L:1/8
K:D
A2 d2 f2 | e2 d2 B2 | A4 z2 |]', 'Bm', 1, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'https://www.youtube.com/watch?v=dbbZGLR_e20', NULL, NULL, now() - interval '32089837 seconds'),
  ('5ae584f4-e34d-4233-8303-211ace3306e2', 'b8430aee-1931-4ff8-821c-0e4419d2420c', 'Standard', '{title: Camino del Mountain Amor}
{artist: Santo Daime}
{key: E}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', 'X:1
T:Random Melody
M:3/4
L:1/8
K:D
A2 d2 f2 | e2 d2 B2 | A4 z2 |]', 'E', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', NULL, 'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC', NULL, now() - interval '32097542 seconds'),
  ('ad3d042b-dada-4e74-a315-51e20586eaad', '5f3942e4-8cac-4625-ac45-c0d81242addb', 'Standard', '{title: Latido de la Cielo Brillante}
{artist: Danit}
{key: E}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'E', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'https://www.youtube.com/watch?v=5qap5aO4i9A', NULL, NULL, now() - interval '32397741 seconds'),
  ('8dfef137-f906-47e6-823d-f16be589d0ca', '717cd0b7-a458-4b39-bbd6-5937adaa1600', 'Standard', '{title: Sinfonía del Fuego}
{artist: Xavier Rudd}
{key: E}

[Gbmaj7]Noite de [Dbmaj7]lua cheia
[Ebmaj7]Canta o [Bbm]coração
[F#m7]Sobe a [C#m]montanha
[D/F#]Desce ao [Bbm]mar', NULL, 'E', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, NULL, NULL, now() - interval '32587333 seconds'),
  ('2a799066-07d0-4bde-ba86-9635e6d05fc8', '286a9ed5-f161-471e-b43e-2445730f9aa1', 'Standard', '{title: Rezo al Floresta Amor}
{artist: Curawaka}
{key: Bm}

[Gbmaj7]Noite de [Dbmaj7]lua cheia
[Ebmaj7]Canta o [Bbm]coração
[F#m7]Sobe a [C#m]montanha
[D/F#]Desce ao [Bbm]mar', NULL, 'Bm', 0, 'DADGAD', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, NULL, NULL, now() - interval '32669911 seconds'),
  ('6d5643b3-db6a-4e00-ba8b-4c4a2a6354a0', 'd058b4bd-dccd-44de-a307-290997a0694c', 'Standard', '{title: Canto al Luna Sagrado}
{artist: Cari El}

   G                C
I am the river and the river is me
D                  G
Flowing to the sea, flowing to the sea

Page 1/1

   Em        C
O sisters, let’s go down
       D                G
Don’t you wait, down to the river we go', 'X:1
T:Random Melody
M:3/4
L:1/8
K:D
A2 d2 f2 | e2 d2 B2 | A4 z2 |]', 'Am', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'https://www.youtube.com/watch?v=dbbZGLR_e20', NULL, NULL, now() - interval '32862962 seconds');
INSERT INTO public.song_versions (id, composition_id, version_name, content_chordpro, melody_notation, key, capo, tuning, contributor_id, youtube_url, spotify_url, soundcloud_url, created_at) VALUES
  ('5e0bf93d-e547-4a4b-806c-5fb01334de72', '448685e7-08d4-4321-a89c-64c941d91800', 'Standard', '{title: Fuerza de la Colibrí}
{artist: Alonso del Río}
{key: Bm}

[G]Eu canto a canção [C]que não tem fim
[D]Coração aberto [G]dentro de mim
[G]Estou firme no [C]meu lugar
[D]Com a força da [G]mãe pra me guiar', NULL, 'Bm', 1, 'Half-Step Down', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, 'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC', NULL, now() - interval '32909907 seconds'),
  ('52cbe2a9-eb00-40a0-845b-e648f0fbeb54', '389eb552-0c1d-4ae6-a4b5-5864dec98eac', 'Standard', '{title: Canto al Tierra Eterno}
{artist: Fiona Helmer}

Abuela luna, abuelo sol
Cantamos juntos esta canción
Agua que limpia, fuego que cura
Tierra que sostiene, viento que murmura', NULL, 'Am', 3, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://open.spotify.com/track/4PTG3Z6ehGkBF3zIqYQGKg', NULL, now() - interval '32914489 seconds'),
  ('85159134-2065-4090-abcd-e3cf975f889b', 'cb0eb8a4-60c5-448e-a4e1-b7c03fb1e039', 'Standard', '{title: Fuerza de la Agua}
{artist: Nico Pérez}
{key: Am}
{capo: 3}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'Am', 3, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', NULL, NULL, NULL, now() - interval '32933528 seconds'),
  ('ffefa508-6c5a-4854-ac4f-f7adfc27ecd0', 'c592bba5-19a4-4aaa-b822-1bddf3880efa', 'Live version', '{title: Danza del Jaguar}
{ci: alternative version}
{artist: Fiona Helmer}

   G                C
I am the river and the river is me
D                  G
Flowing to the sea, flowing to the sea

Page 1/1

   Em        C
O sisters, let’s go down
       D                G
Don’t you wait, down to the river we go', NULL, 'Em', 2, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', NULL, NULL, NULL, now() - interval '33034651 seconds'),
  ('d65f6707-63f6-463f-a7fa-740e8b67301f', 'c592bba5-19a4-4aaa-b822-1bddf3880efa', 'Standard', '{title: Danza del Jaguar}
{artist: Fiona Helmer}

   G                C
I am the river and the river is me
D                  G
Flowing to the sea, flowing to the sea

Page 1/1

   Em        C
O sisters, let’s go down
       D                G
Don’t you wait, down to the river we go', NULL, 'F', 5, 'Half-Step Down', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', NULL, 'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC', 'https://soundcloud.com/user-778401370/la-curandera', now() - interval '33121051 seconds'),
  ('1cf419ec-84c4-4c54-8f46-3e66ee80db9e', '5b8c598b-50f4-40c8-81af-451687b40da0', 'Live version', '{title: Canto al Mountain Cielo}
{ci: alternative version}
{artist: Herbert Quinteros}

Abuela luna, abuelo sol
Cantamos juntos esta canción
Agua que limpia, fuego que cura
Tierra que sostiene, viento que murmura', NULL, 'C#m', 2, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, NULL, NULL, now() - interval '33340422 seconds'),
  ('8c2b8fb2-df66-4b16-a66a-3f2b4336fde4', 'c6645abe-0b8e-4fbe-a8cb-2ced40a97017', 'Standard', '{title: Hino da Cóndor Gratitud}
{artist: Traditional}
{key: E}
{capo: 2}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', 'X:1
T:Random Melody
M:3/4
L:1/8
K:D
A2 d2 f2 | e2 d2 B2 | A4 z2 |]', 'E', 2, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'https://www.youtube.com/watch?v=kXYiU_JCYtU', NULL, NULL, now() - interval '33402909 seconds'),
  ('f3abd6ad-945b-4159-919a-d379f8c12a35', '5b8c598b-50f4-40c8-81af-451687b40da0', 'Standard', '{title: Canto al Mountain Cielo}
{artist: Herbert Quinteros}

Abuela luna, abuelo sol
Cantamos juntos esta canción
Agua que limpia, fuego que cura
Tierra que sostiene, viento que murmura', NULL, 'C#m', 0, 'Drop D', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NULL, NULL, NULL, now() - interval '33426822 seconds'),
  ('85214f42-a48b-4904-a6a1-0465f715636b', '5d7797f3-1197-4402-ab9f-932a60527469', 'Standard', '{title: Canção do Cóndor Divino 🔥}
{artist: Ayla Nereo}
{key: D}

[Gbmaj7]Noite de [Dbmaj7]lua cheia
[Ebmaj7]Canta o [Bbm]coração
[F#m7]Sobe a [C#m]montanha
[D/F#]Desce ao [Bbm]mar', NULL, 'D', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NULL, NULL, 'https://soundcloud.com/user-778401370/la-curandera', now() - interval '33428092 seconds'),
  ('9ff9db93-a5d9-4bcb-b745-258f7d27d646', 'c7f4809e-7051-4101-820b-e3853a90ec69', 'Standard', '{title: Espíritu de la Floresta Verde}
{artist: Nico Pérez}
{key: Am}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'Am', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', NULL, NULL, NULL, now() - interval '33516198 seconds'),
  ('84518092-efec-4c94-86d6-17c8676a357f', 'd9a53b0f-1ca3-464d-ac10-26cf37d2131e', 'Standard', '{title: Canto al Mar Cielo}
{artist: Danit}
{key: F}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'F', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'https://youtu.be/6R7pxNzEAaM', NULL, 'https://soundcloud.com/user-778401370/la-curandera', now() - interval '33575534 seconds'),
  ('56eb264e-210c-4125-999c-9622016ed1b9', 'e6eae749-101c-490e-bcc3-67ab18e1e480', 'Standard', '{title: Canção do Flor}
{artist: Curawaka}
{key: G}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'G', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', NULL, NULL, NULL, now() - interval '33622974 seconds'),
  ('ce56c00f-b80e-4f33-92c4-865c67ec1e81', '23eb036a-f5e9-4ffc-b7ba-6a9b69b6563d', 'Capo version', '{title: Llamado del Cielo Sagrada}
{ci: alternative version}
{artist: Fiona Helmer}
{key: F}
{capo: 1}
{c: Canto para el círculo}

{soc}
[G]Vuela, vuela [C]colibrí
[D]Lleva mi canto [G]hasta ti
{eoc}

[Em]Agua que [C]limpia, [G]fuego que [D]cura
[Em]Viento que [C]lleva la [G]noche os[D]cura

{ci: Repetir dos veces}', NULL, 'Am', 2, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', NULL, NULL, NULL, now() - interval '33652417 seconds'),
  ('0b5f092d-707c-4a14-b30d-7ab3200ad217', '23eb036a-f5e9-4ffc-b7ba-6a9b69b6563d', 'Standard', '{title: Llamado del Cielo Sagrada}
{artist: Fiona Helmer}
{key: F}
{capo: 1}
{c: Canto para el círculo}

{soc}
[G]Vuela, vuela [C]colibrí
[D]Lleva mi canto [G]hasta ti
{eoc}

[Em]Agua que [C]limpia, [G]fuego que [D]cura
[Em]Viento que [C]lleva la [G]noche os[D]cura

{ci: Repetir dos veces}', NULL, 'F', 1, 'DADGAD', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', NULL, NULL, NULL, now() - interval '33738817 seconds'),
  ('49eb9846-9636-4c6a-b8ae-55e5790cf0d9', '1414a949-8f0a-49f5-98b6-e44c75720330', 'Standard', '{title: Canto al Piedra}
{artist: Cari El}
[Am]Hello [G]World', 'X:1
T:Random Melody
M:3/4
L:1/8
K:D
A2 d2 f2 | e2 d2 B2 | A4 z2 |]', 'Bb', 1, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', NULL, 'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC', 'https://soundcloud.com/octobersveryown/drake-back-to-back', now() - interval '33849574 seconds'),
  ('c33e7564-66ac-46db-99e1-43daaecab72e', 'dcd12197-6614-4153-990c-2e47e6440b80', 'Standard', '{title: Rezo al Selva}
{key: C#m}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', 'X:1
T:Random Melody
M:3/4
L:1/8
K:D
A2 d2 f2 | e2 d2 B2 | A4 z2 |]', 'C#m', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, 'https://soundcloud.com/curawaka/hey-yamayo', now() - interval '33924294 seconds'),
  ('791128f0-14c0-4a1a-a1b3-e68e8d2c24a6', 'ba3bece6-5d52-4750-b96f-13f364709da7', 'Standard', '{title: Llamado del Vida Brillante}
{artist: Shimshai}
{key: Dm}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', 'X:1
T:Random Melody
M:3/4
L:1/8
K:D
A2 d2 f2 | e2 d2 B2 | A4 z2 |]', 'Dm', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'https://www.youtube.com/watch?v=kXYiU_JCYtU', NULL, NULL, now() - interval '34447370 seconds'),
  ('593f81b5-0b32-4094-8373-9f6e934c90d5', 'b8bfe11f-192a-47bc-9d3c-102e341f663f', 'Standard', '{title: Ecos del Corazón}
{artist: Traditional (Camino Rojo)}

Abuela luna, abuelo sol
Cantamos juntos esta canción
Agua que limpia, fuego que cura
Tierra que sostiene, viento que murmura', 'X:1
T:Random Melody
M:3/4
L:1/8
K:D
A2 d2 f2 | e2 d2 B2 | A4 z2 |]', 'A', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'https://www.youtube.com/watch?v=5qap5aO4i9A', 'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC', NULL, now() - interval '34485652 seconds'),
  ('a0350a94-c1f1-4c73-8eb0-026ff9de0886', '8704bdec-c3a2-4423-ab16-5a2eb8870c96', 'Standard', '{title: Voz del Estrella Divino}
{artist: Herbert Quinteros, Shimshai & Alonso del Río}
{key: Am}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón', NULL, 'Am', 0, 'Standard', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', NULL, NULL, 'https://soundcloud.com/octobersveryown/drake-back-to-back', now() - interval '34503396 seconds');

-- Artist categories (25); the parent "Artists" category is created when missing
INSERT INTO public.categories (name, slug, emoji, parent_id) VALUES ('Artists', 'artists', '👤', NULL) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.categories (name, slug, emoji, parent_id)
SELECT v.name, v.slug, v.emoji, p.id FROM (VALUES
  ('Alain Merens', 'artist-alain-merens', '👤'),
  ('Alonso del Río', 'artist-alonso-del-rio', '👤'),
  ('Ayla Nereo', 'artist-ayla-nereo', '👤'),
  ('Ayla Schafer', 'artist-ayla-schafer', '👤'),
  ('Cari El', 'artist-cari-el', '👤'),
  ('Curawaka', 'artist-curawaka', '👤'),
  ('Danit', 'artist-danit', '👤'),
  ('Dario Hampi Pakari', 'artist-dario-hampi-pakari', '👤'),
  ('Diego Palma', 'artist-diego-palma', '👤'),
  ('Fiona Helmer', 'artist-fiona-helmer', '👤'),
  ('Herbert Quinteros', 'artist-herbert-quinteros', '👤'),
  ('Medicine Family', 'artist-medicine-family', '👤'),
  ('Nico Pérez', 'artist-nico-perez', '👤'),
  ('nina', 'artist-nina', '👤'),
  ('Peia', 'artist-peia', '👤'),
  ('Santo Daime', 'artist-santo-daime', '👤'),
  ('Shimshai', 'artist-shimshai', '👤'),
  ('Test Author', 'artist-test-author', '👤'),
  ('Tester', 'artist-tester', '👤'),
  ('Traditional', 'artist-traditional', '👤'),
  ('Traditional (Camino Rojo)', 'artist-traditional-camino-rojo', '👤'),
  ('Traditional (Nahuatl)', 'artist-traditional-nahuatl', '👤'),
  ('Traditional (Spiritual)', 'artist-traditional-spiritual', '👤'),
  ('Traditional (Umbanda)', 'artist-traditional-umbanda', '👤'),
  ('Xavier Rudd', 'artist-xavier-rudd', '👤')
) AS v(name, slug, emoji), public.categories p WHERE p.slug = 'artists'
ON CONFLICT (slug) DO NOTHING;

-- Song ↔ category links by slug (757)
INSERT INTO public.song_category_map (song_id, category_id)
SELECT v.song_id::uuid, c.id FROM (VALUES
  ('04bdd5ec-d8ec-45c2-83f8-e8cd8a9b78c9', 'artist-cari-el'),
  ('04bdd5ec-d8ec-45c2-83f8-e8cd8a9b78c9', 'moon'),
  ('04bdd5ec-d8ec-45c2-83f8-e8cd8a9b78c9', 'opening-closing'),
  ('04bdd5ec-d8ec-45c2-83f8-e8cd8a9b78c9', 'plegarias'),
  ('04bdd5ec-d8ec-45c2-83f8-e8cd8a9b78c9', 'santo-daime'),
  ('059d201a-7b0d-4079-875d-e0674f93901d', 'artist-curawaka'),
  ('059d201a-7b0d-4079-875d-e0674f93901d', 'ayahuasca'),
  ('059d201a-7b0d-4079-875d-e0674f93901d', 'moon'),
  ('059d201a-7b0d-4079-875d-e0674f93901d', 'tobacco'),
  ('064b08a6-435e-4b7e-b1c6-f4465b88dc3d', 'air'),
  ('064b08a6-435e-4b7e-b1c6-f4465b88dc3d', 'artist-xavier-rudd'),
  ('064b08a6-435e-4b7e-b1c6-f4465b88dc3d', 'earth'),
  ('064b08a6-435e-4b7e-b1c6-f4465b88dc3d', 'healing-limpieza'),
  ('064b08a6-435e-4b7e-b1c6-f4465b88dc3d', 'lakota'),
  ('0675386e-2910-4426-88b5-67478c482d51', 'bird'),
  ('0675386e-2910-4426-88b5-67478c482d51', 'italian'),
  ('0675386e-2910-4426-88b5-67478c482d51', 'nahuatl'),
  ('0675386e-2910-4426-88b5-67478c482d51', 'protection'),
  ('0699a4cd-f7b6-4cf3-b8c3-fa0712db1593', 'artist-cari-el'),
  ('0699a4cd-f7b6-4cf3-b8c3-fa0712db1593', 'english'),
  ('0699a4cd-f7b6-4cf3-b8c3-fa0712db1593', 'moon'),
  ('0699a4cd-f7b6-4cf3-b8c3-fa0712db1593', 'mountain'),
  ('06e9e7b6-8aee-4835-9f0e-c69d4a3a87aa', 'artist-shimshai'),
  ('06e9e7b6-8aee-4835-9f0e-c69d4a3a87aa', 'belarusian'),
  ('06e9e7b6-8aee-4835-9f0e-c69d4a3a87aa', 'opening-closing'),
  ('06e9e7b6-8aee-4835-9f0e-c69d4a3a87aa', 'plegarias'),
  ('0bc5713b-818f-4b57-9e54-1e4dcd4ea493', 'artist-nina'),
  ('0bc5713b-818f-4b57-9e54-1e4dcd4ea493', 'bird'),
  ('0bc5713b-818f-4b57-9e54-1e4dcd4ea493', 'plantas'),
  ('0bc5713b-818f-4b57-9e54-1e4dcd4ea493', 'san-pedro'),
  ('0bc5713b-818f-4b57-9e54-1e4dcd4ea493', 'vocalization'),
  ('1052941c-4c43-433e-a45d-adc38316e546', 'air'),
  ('1052941c-4c43-433e-a45d-adc38316e546', 'artist-traditional-umbanda'),
  ('1052941c-4c43-433e-a45d-adc38316e546', 'earth'),
  ('1052941c-4c43-433e-a45d-adc38316e546', 'santo-daime'),
  ('1056d0b8-a9a5-4494-a08a-08ca955e504b', 'artist-traditional'),
  ('1056d0b8-a9a5-4494-a08a-08ca955e504b', 'ayahuasca'),
  ('1056d0b8-a9a5-4494-a08a-08ca955e504b', 'huni-kuin'),
  ('1056d0b8-a9a5-4494-a08a-08ca955e504b', 'lakota'),
  ('1056d0b8-a9a5-4494-a08a-08ca955e504b', 'women'),
  ('11161817-5278-47d6-afe8-e9e843b7197c', 'artist-santo-daime'),
  ('11161817-5278-47d6-afe8-e9e843b7197c', 'healing-limpieza'),
  ('11161817-5278-47d6-afe8-e9e843b7197c', 'plegarias'),
  ('11161817-5278-47d6-afe8-e9e843b7197c', 'sacred-pipe'),
  ('13fecd65-baf1-466e-b21f-05a93381b792', 'artist-alonso-del-rio'),
  ('13fecd65-baf1-466e-b21f-05a93381b792', 'english'),
  ('13fecd65-baf1-466e-b21f-05a93381b792', 'moon'),
  ('13fecd65-baf1-466e-b21f-05a93381b792', 'nahuatl'),
  ('1414a949-8f0a-49f5-98b6-e44c75720330', 'artist-cari-el'),
  ('172ae043-f763-4708-b4be-2aa7c239b74c', 'artist-traditional'),
  ('172ae043-f763-4708-b4be-2aa7c239b74c', 'belarusian'),
  ('172ae043-f763-4708-b4be-2aa7c239b74c', 'plantas'),
  ('172ae043-f763-4708-b4be-2aa7c239b74c', 'rape'),
  ('1b7cdee7-8470-4108-bb77-3478a88a7f01', 'ayahuasca'),
  ('1b7cdee7-8470-4108-bb77-3478a88a7f01', 'quechua-kichwa'),
  ('1b7cdee7-8470-4108-bb77-3478a88a7f01', 'selva'),
  ('1bc8e66f-0e98-416b-8f3f-23fc4d85249a', 'artist-santo-daime'),
  ('1bc8e66f-0e98-416b-8f3f-23fc4d85249a', 'lithuanian'),
  ('1bc8e66f-0e98-416b-8f3f-23fc4d85249a', 'plegarias'),
  ('1d7ee9ff-50ee-499d-a1ff-4e77fce6719c', 'artist-dario-hampi-pakari'),
  ('1d7ee9ff-50ee-499d-a1ff-4e77fce6719c', 'sacred-pipe'),
  ('1d7ee9ff-50ee-499d-a1ff-4e77fce6719c', 'santa-maria'),
  ('1e851fd3-9d3f-42e0-bc68-3f67f2720497', 'artist-ayla-schafer'),
  ('200e81ff-6e16-4935-b049-c35fb75078d9', 'artist-traditional-camino-rojo'),
  ('200e81ff-6e16-4935-b049-c35fb75078d9', 'lakota'),
  ('200e81ff-6e16-4935-b049-c35fb75078d9', 'moon'),
  ('21d6fd83-f41a-4346-aae0-2065afb482da', 'artist-curawaka'),
  ('21d6fd83-f41a-4346-aae0-2065afb482da', 'bird'),
  ('21d6fd83-f41a-4346-aae0-2065afb482da', 'italian'),
  ('21d6fd83-f41a-4346-aae0-2065afb482da', 'plegarias'),
  ('22625032-aa25-44cd-9241-1549fb06f250', 'artist-traditional-umbanda'),
  ('22625032-aa25-44cd-9241-1549fb06f250', 'lithuanian'),
  ('22625032-aa25-44cd-9241-1549fb06f250', 'sun'),
  ('22c8c970-c28c-4631-bf0c-db00a5af2a61', 'artist-traditional'),
  ('22c8c970-c28c-4631-bf0c-db00a5af2a61', 'plegarias'),
  ('2358a04a-e7aa-43d2-b0db-9d2ec523bbc6', 'artist-herbert-quinteros'),
  ('2358a04a-e7aa-43d2-b0db-9d2ec523bbc6', 'fire'),
  ('2358a04a-e7aa-43d2-b0db-9d2ec523bbc6', 'healing-limpieza'),
  ('2358a04a-e7aa-43d2-b0db-9d2ec523bbc6', 'spanish'),
  ('23875ed5-ac16-4f10-9456-8aa83086f7a2', 'artist-diego-palma'),
  ('23875ed5-ac16-4f10-9456-8aa83086f7a2', 'san-pedro'),
  ('23875ed5-ac16-4f10-9456-8aa83086f7a2', 'temazcal'),
  ('23875ed5-ac16-4f10-9456-8aa83086f7a2', 'umbanda'),
  ('23eb036a-f5e9-4ffc-b7ba-6a9b69b6563d', 'artist-fiona-helmer'),
  ('23eb036a-f5e9-4ffc-b7ba-6a9b69b6563d', 'fire'),
  ('23eb036a-f5e9-4ffc-b7ba-6a9b69b6563d', 'healing-limpieza'),
  ('23eb036a-f5e9-4ffc-b7ba-6a9b69b6563d', 'lithuanian'),
  ('2409957d-4e89-4045-b14b-9e7a9c2b60f7', 'artist-ayla-schafer'),
  ('2409957d-4e89-4045-b14b-9e7a9c2b60f7', 'artist-traditional-umbanda'),
  ('2409957d-4e89-4045-b14b-9e7a9c2b60f7', 'mountain'),
  ('2409957d-4e89-4045-b14b-9e7a9c2b60f7', 'san-pedro'),
  ('2409957d-4e89-4045-b14b-9e7a9c2b60f7', 'temazcal'),
  ('2768179a-5375-44da-864a-0ea22c25982f', 'artist-alain-merens'),
  ('2768179a-5375-44da-864a-0ea22c25982f', 'artist-ayla-nereo'),
  ('2768179a-5375-44da-864a-0ea22c25982f', 'sacred-pipe'),
  ('2768179a-5375-44da-864a-0ea22c25982f', 'vocalization'),
  ('286a9ed5-f161-471e-b43e-2445730f9aa1', 'artist-curawaka'),
  ('286a9ed5-f161-471e-b43e-2445730f9aa1', 'huni-kuin'),
  ('286a9ed5-f161-471e-b43e-2445730f9aa1', 'opening-closing'),
  ('286a9ed5-f161-471e-b43e-2445730f9aa1', 'santo-daime')
) AS v(song_id, slug) JOIN public.categories c ON c.slug = v.slug
ON CONFLICT DO NOTHING;
INSERT INTO public.song_category_map (song_id, category_id)
SELECT v.song_id::uuid, c.id FROM (VALUES
  ('286a9ed5-f161-471e-b43e-2445730f9aa1', 'sun'),
  ('29490f14-385a-462c-b798-159ff6218b4d', 'artist-traditional'),
  ('29490f14-385a-462c-b798-159ff6218b4d', 'belarusian'),
  ('29490f14-385a-462c-b798-159ff6218b4d', 'gratitude'),
  ('29490f14-385a-462c-b798-159ff6218b4d', 'tobacco'),
  ('2a885ef5-6c00-45f5-9f84-0f4ef44fae62', 'artist-traditional-umbanda'),
  ('2a885ef5-6c00-45f5-9f84-0f4ef44fae62', 'belarusian'),
  ('2a885ef5-6c00-45f5-9f84-0f4ef44fae62', 'plegarias'),
  ('2a885ef5-6c00-45f5-9f84-0f4ef44fae62', 'santo-daime'),
  ('2db9c970-bf02-4f9a-b74b-da286cfd2ff0', 'artist-nina'),
  ('2db9c970-bf02-4f9a-b74b-da286cfd2ff0', 'belarusian'),
  ('2db9c970-bf02-4f9a-b74b-da286cfd2ff0', 'plegarias'),
  ('2db9c970-bf02-4f9a-b74b-da286cfd2ff0', 'protection'),
  ('2ddadd5b-ff3f-4370-9f44-6670396a6e2f', 'air'),
  ('2ddadd5b-ff3f-4370-9f44-6670396a6e2f', 'artist-peia'),
  ('2ddadd5b-ff3f-4370-9f44-6670396a6e2f', 'lithuanian'),
  ('2ddadd5b-ff3f-4370-9f44-6670396a6e2f', 'selva'),
  ('307b5720-830e-421e-b129-db5a4240778e', 'artist-santo-daime'),
  ('307b5720-830e-421e-b129-db5a4240778e', 'artist-traditional-umbanda'),
  ('307b5720-830e-421e-b129-db5a4240778e', 'belarusian'),
  ('307b5720-830e-421e-b129-db5a4240778e', 'healing-limpieza'),
  ('307b5720-830e-421e-b129-db5a4240778e', 'selva'),
  ('323142cb-d37d-44aa-897d-0e9986189d4b', 'artist-fiona-helmer'),
  ('323142cb-d37d-44aa-897d-0e9986189d4b', 'huni-kuin'),
  ('323142cb-d37d-44aa-897d-0e9986189d4b', 'icaros'),
  ('323142cb-d37d-44aa-897d-0e9986189d4b', 'sacred-pipe'),
  ('32ab30df-f824-4251-8331-37657436c7c9', 'animales'),
  ('32ab30df-f824-4251-8331-37657436c7c9', 'ayahuasca'),
  ('32ab30df-f824-4251-8331-37657436c7c9', 'nahuatl'),
  ('32cd41ca-3dda-4213-b5c8-33e641281e27', 'artist-peia'),
  ('32cd41ca-3dda-4213-b5c8-33e641281e27', 'moon'),
  ('32cd41ca-3dda-4213-b5c8-33e641281e27', 'opening-closing'),
  ('32cd41ca-3dda-4213-b5c8-33e641281e27', 'russian'),
  ('32fbb4f6-cd59-486f-8f2b-59b3cdfc0b39', 'artist-traditional'),
  ('32fbb4f6-cd59-486f-8f2b-59b3cdfc0b39', 'healing-limpieza'),
  ('32fbb4f6-cd59-486f-8f2b-59b3cdfc0b39', 'spanish'),
  ('32fbb4f6-cd59-486f-8f2b-59b3cdfc0b39', 'water'),
  ('358407eb-fb6c-4725-b74c-d45b24229d75', 'artist-herbert-quinteros'),
  ('358407eb-fb6c-4725-b74c-d45b24229d75', 'earth'),
  ('358407eb-fb6c-4725-b74c-d45b24229d75', 'lakota'),
  ('358407eb-fb6c-4725-b74c-d45b24229d75', 'tobacco'),
  ('37951bb6-96cc-4907-a6a8-516ba082c510', 'artist-shimshai'),
  ('37951bb6-96cc-4907-a6a8-516ba082c510', 'earth'),
  ('37951bb6-96cc-4907-a6a8-516ba082c510', 'english'),
  ('37951bb6-96cc-4907-a6a8-516ba082c510', 'love-heart'),
  ('379a01a8-552c-4688-8afc-dfe44591bb9e', 'artist-traditional-spiritual'),
  ('379a01a8-552c-4688-8afc-dfe44591bb9e', 'english'),
  ('379a01a8-552c-4688-8afc-dfe44591bb9e', 'traditional'),
  ('379a01a8-552c-4688-8afc-dfe44591bb9e', 'water'),
  ('379b6737-e754-4778-94a7-d8e719c42a25', 'artist-ayla-nereo'),
  ('379b6737-e754-4778-94a7-d8e719c42a25', 'artist-cari-el'),
  ('379b6737-e754-4778-94a7-d8e719c42a25', 'artist-danit'),
  ('379b6737-e754-4778-94a7-d8e719c42a25', 'artist-shimshai'),
  ('379b6737-e754-4778-94a7-d8e719c42a25', 'english'),
  ('379b6737-e754-4778-94a7-d8e719c42a25', 'love-heart'),
  ('379b6737-e754-4778-94a7-d8e719c42a25', 'water'),
  ('379b6737-e754-4778-94a7-d8e719c42a25', 'women'),
  ('3845f230-cd7e-41e1-b3dd-5faefad6ef96', 'artist-danit'),
  ('3845f230-cd7e-41e1-b3dd-5faefad6ef96', 'mountain'),
  ('3845f230-cd7e-41e1-b3dd-5faefad6ef96', 'vocalization'),
  ('38536e21-a292-46d7-b403-c971e39a774e', 'artist-traditional'),
  ('38536e21-a292-46d7-b403-c971e39a774e', 'lakota'),
  ('38536e21-a292-46d7-b403-c971e39a774e', 'plantas'),
  ('38536e21-a292-46d7-b403-c971e39a774e', 'protection'),
  ('389eb552-0c1d-4ae6-a4b5-5864dec98eac', 'artist-fiona-helmer'),
  ('389eb552-0c1d-4ae6-a4b5-5864dec98eac', 'huni-kuin'),
  ('389eb552-0c1d-4ae6-a4b5-5864dec98eac', 'mountain'),
  ('392172ef-772b-456e-a10f-31c5308ca70f', 'air'),
  ('392172ef-772b-456e-a10f-31c5308ca70f', 'artist-peia'),
  ('392172ef-772b-456e-a10f-31c5308ca70f', 'peyote'),
  ('3bd6bdba-9a7b-4fbf-851f-2d7da88fdd46', 'artist-diego-palma'),
  ('3bd6bdba-9a7b-4fbf-851f-2d7da88fdd46', 'italian'),
  ('3bd6bdba-9a7b-4fbf-851f-2d7da88fdd46', 'lithuanian'),
  ('3cabe193-ac88-4619-9bab-28d29bb7afe7', 'artist-curawaka'),
  ('3cabe193-ac88-4619-9bab-28d29bb7afe7', 'vocalization'),
  ('3cabe193-ac88-4619-9bab-28d29bb7afe7', 'water'),
  ('3faac046-e8db-4354-b779-6c9a9c945224', 'artist-alonso-del-rio'),
  ('3faac046-e8db-4354-b779-6c9a9c945224', 'plantas'),
  ('3faac046-e8db-4354-b779-6c9a9c945224', 'santo-daime'),
  ('3fe5611f-77e7-41cf-97ce-6d6a6b39d21c', 'artist-danit'),
  ('3fe5611f-77e7-41cf-97ce-6d6a6b39d21c', 'fire'),
  ('3fe5611f-77e7-41cf-97ce-6d6a6b39d21c', 'selva'),
  ('40beb410-d7c6-4338-bd47-b58782136aa9', 'artist-fiona-helmer'),
  ('40beb410-d7c6-4338-bd47-b58782136aa9', 'artist-nina'),
  ('40beb410-d7c6-4338-bd47-b58782136aa9', 'artist-traditional-camino-rojo'),
  ('41ebc62c-46c4-42e1-a763-b78e856e8eec', 'artist-curawaka'),
  ('41ebc62c-46c4-42e1-a763-b78e856e8eec', 'peyote'),
  ('41ebc62c-46c4-42e1-a763-b78e856e8eec', 'plantas'),
  ('41ebc62c-46c4-42e1-a763-b78e856e8eec', 'selva'),
  ('43f033ce-9715-4346-9ac1-1a55182ae6f3', 'artist-shimshai'),
  ('43f033ce-9715-4346-9ac1-1a55182ae6f3', 'english'),
  ('43f033ce-9715-4346-9ac1-1a55182ae6f3', 'gratitude'),
  ('43f033ce-9715-4346-9ac1-1a55182ae6f3', 'sun'),
  ('43fbe1bb-5e23-4c81-9d96-f163a8800065', 'artist-dario-hampi-pakari'),
  ('43fbe1bb-5e23-4c81-9d96-f163a8800065', 'artist-herbert-quinteros'),
  ('43fbe1bb-5e23-4c81-9d96-f163a8800065', 'healing-limpieza'),
  ('43fbe1bb-5e23-4c81-9d96-f163a8800065', 'santa-maria'),
  ('43fbe1bb-5e23-4c81-9d96-f163a8800065', 'umbanda'),
  ('448685e7-08d4-4321-a89c-64c941d91800', 'artist-alonso-del-rio'),
  ('448685e7-08d4-4321-a89c-64c941d91800', 'earth')
) AS v(song_id, slug) JOIN public.categories c ON c.slug = v.slug
ON CONFLICT DO NOTHING;
INSERT INTO public.song_category_map (song_id, category_id)
SELECT v.song_id::uuid, c.id FROM (VALUES
  ('448685e7-08d4-4321-a89c-64c941d91800', 'protection'),
  ('462d0bbb-8397-44ae-9d81-dd26ebba6666', 'artist-fiona-helmer'),
  ('462d0bbb-8397-44ae-9d81-dd26ebba6666', 'english'),
  ('462d0bbb-8397-44ae-9d81-dd26ebba6666', 'sacred-pipe'),
  ('462d0bbb-8397-44ae-9d81-dd26ebba6666', 'santo-daime'),
  ('49c9d8e2-9c14-4a02-87bb-c82ac8cb6c64', 'spanish'),
  ('4fc29da7-8a77-429f-836e-74ad9105039d', 'air'),
  ('4fc29da7-8a77-429f-836e-74ad9105039d', 'tobacco'),
  ('4fc29da7-8a77-429f-836e-74ad9105039d', 'women'),
  ('530be2e2-f9ee-42e9-ab60-5c23b4c64838', 'artist-santo-daime'),
  ('530be2e2-f9ee-42e9-ab60-5c23b4c64838', 'croatian'),
  ('530be2e2-f9ee-42e9-ab60-5c23b4c64838', 'earth'),
  ('530be2e2-f9ee-42e9-ab60-5c23b4c64838', 'santa-maria'),
  ('542d4011-057f-46c4-8362-233e5b63fef3', 'artist-ayla-schafer'),
  ('542d4011-057f-46c4-8362-233e5b63fef3', 'belarusian'),
  ('542d4011-057f-46c4-8362-233e5b63fef3', 'gratitude'),
  ('542d4011-057f-46c4-8362-233e5b63fef3', 'lakota'),
  ('542d4011-057f-46c4-8362-233e5b63fef3', 'peyote'),
  ('54cd2202-1805-45d5-b504-17f2e0c5dbd3', 'artist-cari-el'),
  ('54cd2202-1805-45d5-b504-17f2e0c5dbd3', 'rape'),
  ('54cd2202-1805-45d5-b504-17f2e0c5dbd3', 'san-pedro'),
  ('54cd2202-1805-45d5-b504-17f2e0c5dbd3', 'spanish'),
  ('56861db8-04f8-4927-a998-9c7882bd8e70', 'artist-ayla-nereo'),
  ('56861db8-04f8-4927-a998-9c7882bd8e70', 'healing-limpieza'),
  ('56861db8-04f8-4927-a998-9c7882bd8e70', 'sun'),
  ('56861db8-04f8-4927-a998-9c7882bd8e70', 'tobacco'),
  ('56b61cde-d346-4d2e-b7c1-23694eb1cccf', 'artist-dario-hampi-pakari'),
  ('56b61cde-d346-4d2e-b7c1-23694eb1cccf', 'healing-limpieza'),
  ('56b61cde-d346-4d2e-b7c1-23694eb1cccf', 'nahuatl'),
  ('56b61cde-d346-4d2e-b7c1-23694eb1cccf', 'san-pedro'),
  ('56b61cde-d346-4d2e-b7c1-23694eb1cccf', 'tobacco'),
  ('575b1997-3b42-48fa-acf3-a5bbec7d608a', 'artist-traditional-camino-rojo'),
  ('575b1997-3b42-48fa-acf3-a5bbec7d608a', 'english'),
  ('575b1997-3b42-48fa-acf3-a5bbec7d608a', 'german'),
  ('575b1997-3b42-48fa-acf3-a5bbec7d608a', 'vocalization'),
  ('57b654b8-2285-4e48-9c0c-5fe8acdebfb5', 'artist-ayla-schafer'),
  ('57b654b8-2285-4e48-9c0c-5fe8acdebfb5', 'artist-danit'),
  ('57b654b8-2285-4e48-9c0c-5fe8acdebfb5', 'artist-xavier-rudd'),
  ('57b654b8-2285-4e48-9c0c-5fe8acdebfb5', 'fire'),
  ('57b654b8-2285-4e48-9c0c-5fe8acdebfb5', 'love-heart'),
  ('57b654b8-2285-4e48-9c0c-5fe8acdebfb5', 'russian'),
  ('59c6f582-90f2-4fb6-ab76-6b857022c5f5', 'artist-santo-daime'),
  ('59c6f582-90f2-4fb6-ab76-6b857022c5f5', 'healing-limpieza'),
  ('59c6f582-90f2-4fb6-ab76-6b857022c5f5', 'peyote'),
  ('59c6f582-90f2-4fb6-ab76-6b857022c5f5', 'temazcal'),
  ('59d20e92-bfbe-440c-adc9-040e250e295f', 'animales'),
  ('59d20e92-bfbe-440c-adc9-040e250e295f', 'artist-santo-daime'),
  ('59d20e92-bfbe-440c-adc9-040e250e295f', 'tobacco'),
  ('5b8c598b-50f4-40c8-81af-451687b40da0', 'artist-herbert-quinteros'),
  ('5bfab953-3b39-48b6-aced-68850b672192', 'air'),
  ('5bfab953-3b39-48b6-aced-68850b672192', 'artist-ayla-schafer'),
  ('5bfab953-3b39-48b6-aced-68850b672192', 'gratitude'),
  ('5d7797f3-1197-4402-ab9f-932a60527469', 'artist-ayla-nereo'),
  ('5d7797f3-1197-4402-ab9f-932a60527469', 'lakota'),
  ('5d7797f3-1197-4402-ab9f-932a60527469', 'moon'),
  ('5d7797f3-1197-4402-ab9f-932a60527469', 'nahuatl'),
  ('5de03246-cbfc-454e-ab0e-24cc3bea5366', 'artist-herbert-quinteros'),
  ('5de03246-cbfc-454e-ab0e-24cc3bea5366', 'lakota'),
  ('5de03246-cbfc-454e-ab0e-24cc3bea5366', 'plegarias'),
  ('5df38b1f-1c30-4520-8dfc-f15290899221', 'artist-xavier-rudd'),
  ('5df38b1f-1c30-4520-8dfc-f15290899221', 'santo-daime'),
  ('5df38b1f-1c30-4520-8dfc-f15290899221', 'umbanda'),
  ('5df38b1f-1c30-4520-8dfc-f15290899221', 'water'),
  ('5f3942e4-8cac-4625-ac45-c0d81242addb', 'artist-danit'),
  ('603e1e70-86d8-46ce-a216-3257272eff78', 'artist-traditional-camino-rojo'),
  ('603e1e70-86d8-46ce-a216-3257272eff78', 'icaros'),
  ('603e1e70-86d8-46ce-a216-3257272eff78', 'spanish'),
  ('606c94f3-6eab-4f6f-9e30-0228afcb4b92', 'artist-alonso-del-rio'),
  ('606c94f3-6eab-4f6f-9e30-0228afcb4b92', 'artist-peia'),
  ('606c94f3-6eab-4f6f-9e30-0228afcb4b92', 'gratitude'),
  ('606c94f3-6eab-4f6f-9e30-0228afcb4b92', 'huni-kuin'),
  ('606c94f3-6eab-4f6f-9e30-0228afcb4b92', 'lakota'),
  ('62146eaf-eec7-4991-b592-3591a813e026', 'artist-alain-merens'),
  ('62146eaf-eec7-4991-b592-3591a813e026', 'croatian'),
  ('62146eaf-eec7-4991-b592-3591a813e026', 'selva'),
  ('62146eaf-eec7-4991-b592-3591a813e026', 'sun'),
  ('6291e88d-8086-4532-8335-2676400c43b7', 'english'),
  ('6291e88d-8086-4532-8335-2676400c43b7', 'love-heart'),
  ('6291e88d-8086-4532-8335-2676400c43b7', 'women'),
  ('633ab28e-1c3e-4129-a73a-87a5d699757c', 'artist-nina'),
  ('633ab28e-1c3e-4129-a73a-87a5d699757c', 'artist-xavier-rudd'),
  ('66660130-1330-43d0-a53d-ba46d53bf3cd', 'animales'),
  ('66660130-1330-43d0-a53d-ba46d53bf3cd', 'artist-diego-palma'),
  ('66660130-1330-43d0-a53d-ba46d53bf3cd', 'portuguese'),
  ('66660130-1330-43d0-a53d-ba46d53bf3cd', 'women'),
  ('67ccd286-69e1-4d20-af94-607f852c245e', 'artist-curawaka'),
  ('67ccd286-69e1-4d20-af94-607f852c245e', 'protection'),
  ('67d245f7-6115-4abd-a3d5-00a251e41406', 'artist-traditional-nahuatl'),
  ('67d245f7-6115-4abd-a3d5-00a251e41406', 'earth'),
  ('67d245f7-6115-4abd-a3d5-00a251e41406', 'nahuatl'),
  ('67d245f7-6115-4abd-a3d5-00a251e41406', 'women'),
  ('687780d0-935b-4a6a-9696-e48c8bccd0e5', 'bird'),
  ('687780d0-935b-4a6a-9696-e48c8bccd0e5', 'mountain'),
  ('6cc92741-cdb3-4f2c-b2a9-867e46d5053c', 'artist-dario-hampi-pakari'),
  ('6cc92741-cdb3-4f2c-b2a9-867e46d5053c', 'croatian'),
  ('6cc92741-cdb3-4f2c-b2a9-867e46d5053c', 'english'),
  ('6f06959c-c905-4afb-a53e-810b8b1892eb', 'artist-traditional'),
  ('6f06959c-c905-4afb-a53e-810b8b1892eb', 'portuguese'),
  ('6f06959c-c905-4afb-a53e-810b8b1892eb', 'santa-maria'),
  ('70ac6a2a-568d-4953-83ff-c201e17380db', 'artist-ayla-nereo')
) AS v(song_id, slug) JOIN public.categories c ON c.slug = v.slug
ON CONFLICT DO NOTHING;
INSERT INTO public.song_category_map (song_id, category_id)
SELECT v.song_id::uuid, c.id FROM (VALUES
  ('70ac6a2a-568d-4953-83ff-c201e17380db', 'lithuanian'),
  ('70ac6a2a-568d-4953-83ff-c201e17380db', 'plegarias'),
  ('70ac6a2a-568d-4953-83ff-c201e17380db', 'protection'),
  ('717cd0b7-a458-4b39-bbd6-5937adaa1600', 'artist-xavier-rudd'),
  ('717cd0b7-a458-4b39-bbd6-5937adaa1600', 'fire'),
  ('717cd0b7-a458-4b39-bbd6-5937adaa1600', 'moon'),
  ('717cd0b7-a458-4b39-bbd6-5937adaa1600', 'peyote'),
  ('71e7a154-dbe7-4f8d-85d9-c57c5ae5a667', 'artist-santo-daime'),
  ('71e7a154-dbe7-4f8d-85d9-c57c5ae5a667', 'love-heart'),
  ('71e7a154-dbe7-4f8d-85d9-c57c5ae5a667', 'sun'),
  ('71e7a154-dbe7-4f8d-85d9-c57c5ae5a667', 'temazcal'),
  ('737c7840-44d5-4434-a57f-8c7e121e07ba', 'artist-dario-hampi-pakari'),
  ('737c7840-44d5-4434-a57f-8c7e121e07ba', 'icaros'),
  ('737c7840-44d5-4434-a57f-8c7e121e07ba', 'nahuatl'),
  ('737c7840-44d5-4434-a57f-8c7e121e07ba', 'rape'),
  ('749f6dce-4018-4d09-9c14-8799f06121b9', 'healing-limpieza'),
  ('749f6dce-4018-4d09-9c14-8799f06121b9', 'peyote'),
  ('749f6dce-4018-4d09-9c14-8799f06121b9', 'santa-maria'),
  ('78149d0e-9fd1-4310-9eb2-1139e7ae23a6', 'artist-danit'),
  ('78149d0e-9fd1-4310-9eb2-1139e7ae23a6', 'earth'),
  ('78149d0e-9fd1-4310-9eb2-1139e7ae23a6', 'english'),
  ('78149d0e-9fd1-4310-9eb2-1139e7ae23a6', 'peyote'),
  ('78149d0e-9fd1-4310-9eb2-1139e7ae23a6', 'vocalization'),
  ('79c94128-bb8d-46af-b175-260729e5003a', 'artist-tester'),
  ('79d0e2dd-86e2-4bcf-9719-36264b59af66', 'artist-traditional-camino-rojo'),
  ('79d0e2dd-86e2-4bcf-9719-36264b59af66', 'english'),
  ('79d0e2dd-86e2-4bcf-9719-36264b59af66', 'plantas'),
  ('79d0e2dd-86e2-4bcf-9719-36264b59af66', 'santa-maria'),
  ('7a80f369-7869-4a99-a1c2-310a018bbf5d', 'animales'),
  ('7a80f369-7869-4a99-a1c2-310a018bbf5d', 'belarusian'),
  ('7a80f369-7869-4a99-a1c2-310a018bbf5d', 'quechua-kichwa'),
  ('7acc5907-3a0f-4f44-99c8-8de986b11aba', 'artist-santo-daime'),
  ('7acc5907-3a0f-4f44-99c8-8de986b11aba', 'plegarias'),
  ('7acc5907-3a0f-4f44-99c8-8de986b11aba', 'portuguese'),
  ('7acc5907-3a0f-4f44-99c8-8de986b11aba', 'santo-daime'),
  ('80d25c41-cbf0-492e-8720-9da493fe953f', 'animales'),
  ('80d25c41-cbf0-492e-8720-9da493fe953f', 'belarusian'),
  ('80d25c41-cbf0-492e-8720-9da493fe953f', 'santa-maria'),
  ('8113f780-3d18-4b12-a291-ee6cbbb1ce81', 'artist-alain-merens'),
  ('8113f780-3d18-4b12-a291-ee6cbbb1ce81', 'artist-santo-daime'),
  ('8113f780-3d18-4b12-a291-ee6cbbb1ce81', 'artist-traditional'),
  ('8113f780-3d18-4b12-a291-ee6cbbb1ce81', 'belarusian'),
  ('8113f780-3d18-4b12-a291-ee6cbbb1ce81', 'protection'),
  ('8113f780-3d18-4b12-a291-ee6cbbb1ce81', 'tobacco'),
  ('81cbca26-dce6-4053-9bcd-c334931ea89b', 'artist-santo-daime'),
  ('81cbca26-dce6-4053-9bcd-c334931ea89b', 'lithuanian'),
  ('81cbca26-dce6-4053-9bcd-c334931ea89b', 'nahuatl'),
  ('81cbca26-dce6-4053-9bcd-c334931ea89b', 'quechua-kichwa'),
  ('81cbca26-dce6-4053-9bcd-c334931ea89b', 'temazcal'),
  ('83f7e119-3c33-4422-be56-d23afa1ef3fc', 'animales'),
  ('83f7e119-3c33-4422-be56-d23afa1ef3fc', 'artist-alain-merens'),
  ('83f7e119-3c33-4422-be56-d23afa1ef3fc', 'belarusian'),
  ('83f7e119-3c33-4422-be56-d23afa1ef3fc', 'quechua-kichwa'),
  ('85759c47-e9bc-49f1-aa9c-5b3958bf32be', 'artist-traditional'),
  ('85759c47-e9bc-49f1-aa9c-5b3958bf32be', 'belarusian'),
  ('85759c47-e9bc-49f1-aa9c-5b3958bf32be', 'love-heart'),
  ('85759c47-e9bc-49f1-aa9c-5b3958bf32be', 'plantas'),
  ('86860741-6952-4185-a19c-9c8d32e6501f', 'artist-shimshai'),
  ('86860741-6952-4185-a19c-9c8d32e6501f', 'mountain'),
  ('86860741-6952-4185-a19c-9c8d32e6501f', 'protection'),
  ('86860741-6952-4185-a19c-9c8d32e6501f', 'sun'),
  ('8704bdec-c3a2-4423-ab16-5a2eb8870c96', 'artist-alonso-del-rio'),
  ('8704bdec-c3a2-4423-ab16-5a2eb8870c96', 'artist-herbert-quinteros'),
  ('8704bdec-c3a2-4423-ab16-5a2eb8870c96', 'artist-shimshai'),
  ('8704bdec-c3a2-4423-ab16-5a2eb8870c96', 'belarusian'),
  ('8704bdec-c3a2-4423-ab16-5a2eb8870c96', 'german'),
  ('8704bdec-c3a2-4423-ab16-5a2eb8870c96', 'healing-limpieza'),
  ('8acb59ae-d67b-42a8-b9fb-ae353ede7dfb', 'artist-fiona-helmer'),
  ('8acb59ae-d67b-42a8-b9fb-ae353ede7dfb', 'artist-nico-perez'),
  ('8acb59ae-d67b-42a8-b9fb-ae353ede7dfb', 'italian'),
  ('8acb59ae-d67b-42a8-b9fb-ae353ede7dfb', 'love-heart'),
  ('8d157e2b-d383-4ab9-b078-5ef511b10085', 'artist-diego-palma'),
  ('8d157e2b-d383-4ab9-b078-5ef511b10085', 'gratitude'),
  ('8d157e2b-d383-4ab9-b078-5ef511b10085', 'huni-kuin'),
  ('8d157e2b-d383-4ab9-b078-5ef511b10085', 'rape'),
  ('8e04f469-1bd1-42e1-8b61-6b16d5e28885', 'artist-herbert-quinteros'),
  ('8e04f469-1bd1-42e1-8b61-6b16d5e28885', 'english'),
  ('8e04f469-1bd1-42e1-8b61-6b16d5e28885', 'fire'),
  ('8e04f469-1bd1-42e1-8b61-6b16d5e28885', 'moon'),
  ('8eccfcc7-6b46-437c-b59d-8f1608a42f57', 'artist-cari-el'),
  ('8eccfcc7-6b46-437c-b59d-8f1608a42f57', 'artist-fiona-helmer'),
  ('8eccfcc7-6b46-437c-b59d-8f1608a42f57', 'russian'),
  ('8eccfcc7-6b46-437c-b59d-8f1608a42f57', 'temazcal'),
  ('8eccfcc7-6b46-437c-b59d-8f1608a42f57', 'water'),
  ('94f3dcd2-0a38-4de4-bcc6-f6daaab8187d', 'bird'),
  ('94f3dcd2-0a38-4de4-bcc6-f6daaab8187d', 'mountain'),
  ('94f3dcd2-0a38-4de4-bcc6-f6daaab8187d', 'sun'),
  ('94f3dcd2-0a38-4de4-bcc6-f6daaab8187d', 'tobacco'),
  ('958d0c69-22f1-404f-b911-946d3d52aaa7', 'animales'),
  ('958d0c69-22f1-404f-b911-946d3d52aaa7', 'artist-xavier-rudd'),
  ('958d0c69-22f1-404f-b911-946d3d52aaa7', 'plantas'),
  ('969080b6-f4d5-44e9-b236-47a46b949f30', 'artist-test-author'),
  ('969080b6-f4d5-44e9-b236-47a46b949f30', 'english'),
  ('97bedd7b-5f8a-4b79-8651-4728754d21d4', 'artist-peia'),
  ('97bedd7b-5f8a-4b79-8651-4728754d21d4', 'german'),
  ('97bedd7b-5f8a-4b79-8651-4728754d21d4', 'plegarias'),
  ('97bedd7b-5f8a-4b79-8651-4728754d21d4', 'quechua-kichwa'),
  ('9919e38c-3fcf-4b6a-b0fe-7c4c94c801c3', 'artist-traditional'),
  ('9919e38c-3fcf-4b6a-b0fe-7c4c94c801c3', 'plantas'),
  ('9919e38c-3fcf-4b6a-b0fe-7c4c94c801c3', 'spanish')
) AS v(song_id, slug) JOIN public.categories c ON c.slug = v.slug
ON CONFLICT DO NOTHING;
INSERT INTO public.song_category_map (song_id, category_id)
SELECT v.song_id::uuid, c.id FROM (VALUES
  ('9919e38c-3fcf-4b6a-b0fe-7c4c94c801c3', 'temazcal'),
  ('9919e38c-3fcf-4b6a-b0fe-7c4c94c801c3', 'water'),
  ('9bcf584e-cf95-4cfd-994d-af3ed7cab146', 'lakota'),
  ('9bcf584e-cf95-4cfd-994d-af3ed7cab146', 'tobacco'),
  ('9bcf584e-cf95-4cfd-994d-af3ed7cab146', 'vocalization'),
  ('9c2b4f5e-d6d2-47ec-90dc-477579f9348b', 'artist-ayla-nereo'),
  ('9c2b4f5e-d6d2-47ec-90dc-477579f9348b', 'croatian'),
  ('9c2b4f5e-d6d2-47ec-90dc-477579f9348b', 'english'),
  ('9c2b4f5e-d6d2-47ec-90dc-477579f9348b', 'women'),
  ('9e54ae79-6941-46b2-846b-0d0c60ec2904', 'animales'),
  ('9e54ae79-6941-46b2-846b-0d0c60ec2904', 'lithuanian'),
  ('9e54ae79-6941-46b2-846b-0d0c60ec2904', 'moon'),
  ('9e54ae79-6941-46b2-846b-0d0c60ec2904', 'santo-daime'),
  ('a11f10ef-6268-4134-9160-fdf029962b3a', 'artist-fiona-helmer'),
  ('a11f10ef-6268-4134-9160-fdf029962b3a', 'sun'),
  ('a11f10ef-6268-4134-9160-fdf029962b3a', 'vocalization'),
  ('a19045c6-158c-4f55-8337-c634bff48f7f', 'artist-alain-merens'),
  ('a19045c6-158c-4f55-8337-c634bff48f7f', 'sun'),
  ('a19045c6-158c-4f55-8337-c634bff48f7f', 'water'),
  ('a19045c6-158c-4f55-8337-c634bff48f7f', 'women'),
  ('a358a941-e525-464c-9555-9ec446b4bdb8', 'artist-ayla-schafer'),
  ('a358a941-e525-464c-9555-9ec446b4bdb8', 'artist-dario-hampi-pakari'),
  ('a358a941-e525-464c-9555-9ec446b4bdb8', 'belarusian'),
  ('a358a941-e525-464c-9555-9ec446b4bdb8', 'english'),
  ('a358a941-e525-464c-9555-9ec446b4bdb8', 'icaros'),
  ('a358a941-e525-464c-9555-9ec446b4bdb8', 'sacred-pipe'),
  ('a4a6304d-33a3-439d-abd6-5f5772c32bb6', 'artist-cari-el'),
  ('a5352c63-7341-4406-820d-795dd5c5d97d', 'artist-traditional-umbanda'),
  ('a5352c63-7341-4406-820d-795dd5c5d97d', 'bird'),
  ('a5352c63-7341-4406-820d-795dd5c5d97d', 'plantas'),
  ('a5352c63-7341-4406-820d-795dd5c5d97d', 'temazcal'),
  ('a5836ce2-710f-461a-9c62-5a62358d5175', 'artist-fiona-helmer'),
  ('a5836ce2-710f-461a-9c62-5a62358d5175', 'artist-traditional'),
  ('a5836ce2-710f-461a-9c62-5a62358d5175', 'earth'),
  ('a5836ce2-710f-461a-9c62-5a62358d5175', 'portuguese'),
  ('a5836ce2-710f-461a-9c62-5a62358d5175', 'traditional'),
  ('a5a6f117-9f20-450b-bf1c-c4084567561e', 'artist-alain-merens'),
  ('a5a6f117-9f20-450b-bf1c-c4084567561e', 'english'),
  ('a5a6f117-9f20-450b-bf1c-c4084567561e', 'italian'),
  ('a5a6f117-9f20-450b-bf1c-c4084567561e', 'rape'),
  ('a5c2d895-0043-4e96-a992-636666842afe', 'artist-fiona-helmer'),
  ('a5c2d895-0043-4e96-a992-636666842afe', 'ayahuasca'),
  ('a5c2d895-0043-4e96-a992-636666842afe', 'healing-limpieza'),
  ('a5c2d895-0043-4e96-a992-636666842afe', 'moon'),
  ('a5c2d895-0043-4e96-a992-636666842afe', 'russian'),
  ('a6745d8b-f2b3-4503-a6f4-191410cbfed5', 'artist-danit'),
  ('a6745d8b-f2b3-4503-a6f4-191410cbfed5', 'croatian'),
  ('a6745d8b-f2b3-4503-a6f4-191410cbfed5', 'earth'),
  ('a6745d8b-f2b3-4503-a6f4-191410cbfed5', 'plegarias'),
  ('a783662c-ac44-4165-979e-52f04722ea60', 'earth'),
  ('a783662c-ac44-4165-979e-52f04722ea60', 'santo-daime'),
  ('a783662c-ac44-4165-979e-52f04722ea60', 'traditional'),
  ('a783662c-ac44-4165-979e-52f04722ea60', 'umbanda'),
  ('a91d15b0-7db6-4f69-9f7e-5484e4a66fbe', 'artist-nina'),
  ('a9323fb2-e248-4c27-bfd5-323d2a3cefe0', 'artist-dario-hampi-pakari'),
  ('a9323fb2-e248-4c27-bfd5-323d2a3cefe0', 'healing-limpieza'),
  ('a9323fb2-e248-4c27-bfd5-323d2a3cefe0', 'nahuatl'),
  ('a9323fb2-e248-4c27-bfd5-323d2a3cefe0', 'rape'),
  ('aa99a6b9-b9b9-4789-9860-46ca51263ba1', 'artist-santo-daime'),
  ('aa99a6b9-b9b9-4789-9860-46ca51263ba1', 'english'),
  ('aa99a6b9-b9b9-4789-9860-46ca51263ba1', 'women'),
  ('ab02b3b9-1cee-4eef-b76e-513211075d31', 'artist-alonso-del-rio'),
  ('ab02b3b9-1cee-4eef-b76e-513211075d31', 'plegarias'),
  ('ab02b3b9-1cee-4eef-b76e-513211075d31', 'rape'),
  ('ab02b3b9-1cee-4eef-b76e-513211075d31', 'temazcal'),
  ('abfe054f-f4b1-436f-9eb2-4cef7f8d970e', 'artist-diego-palma'),
  ('abfe054f-f4b1-436f-9eb2-4cef7f8d970e', 'italian'),
  ('abfe054f-f4b1-436f-9eb2-4cef7f8d970e', 'plantas'),
  ('abfe054f-f4b1-436f-9eb2-4cef7f8d970e', 'plegarias'),
  ('ac85d56d-654c-4176-b82f-4dee0ee9bdc7', 'artist-alain-merens'),
  ('ac85d56d-654c-4176-b82f-4dee0ee9bdc7', 'portuguese'),
  ('ac85d56d-654c-4176-b82f-4dee0ee9bdc7', 'rape'),
  ('ad84f534-f0af-4eba-9384-f2ceb3fe043b', 'artist-diego-palma'),
  ('ad84f534-f0af-4eba-9384-f2ceb3fe043b', 'artist-traditional'),
  ('ad84f534-f0af-4eba-9384-f2ceb3fe043b', 'artist-traditional-umbanda'),
  ('ad84f534-f0af-4eba-9384-f2ceb3fe043b', 'gratitude'),
  ('ad84f534-f0af-4eba-9384-f2ceb3fe043b', 'lithuanian'),
  ('ad84f534-f0af-4eba-9384-f2ceb3fe043b', 'moon'),
  ('b062a7cb-49a6-4216-a0e7-77d7af3909a0', 'artist-shimshai'),
  ('b062a7cb-49a6-4216-a0e7-77d7af3909a0', 'mountain'),
  ('b062a7cb-49a6-4216-a0e7-77d7af3909a0', 'selva'),
  ('b062a7cb-49a6-4216-a0e7-77d7af3909a0', 'traditional'),
  ('b0c4e1d5-1c43-4af4-9991-b6147794aaf6', 'artist-nina'),
  ('b0c4e1d5-1c43-4af4-9991-b6147794aaf6', 'opening-closing'),
  ('b0c4e1d5-1c43-4af4-9991-b6147794aaf6', 'peyote'),
  ('b0c4e1d5-1c43-4af4-9991-b6147794aaf6', 'san-pedro'),
  ('b129b2b6-db71-4735-aa70-42c1daba3445', 'animales'),
  ('b129b2b6-db71-4735-aa70-42c1daba3445', 'artist-herbert-quinteros'),
  ('b129b2b6-db71-4735-aa70-42c1daba3445', 'huni-kuin'),
  ('b129b2b6-db71-4735-aa70-42c1daba3445', 'santa-maria'),
  ('b221d1f5-c9b4-4fc5-a4e0-d6d83a668abf', 'artist-fiona-helmer'),
  ('b221d1f5-c9b4-4fc5-a4e0-d6d83a668abf', 'croatian'),
  ('b221d1f5-c9b4-4fc5-a4e0-d6d83a668abf', 'earth'),
  ('b221d1f5-c9b4-4fc5-a4e0-d6d83a668abf', 'quechua-kichwa'),
  ('b2d464ad-37f4-4860-bdd8-6cb33e5841ba', 'artist-fiona-helmer'),
  ('b2d464ad-37f4-4860-bdd8-6cb33e5841ba', 'portuguese'),
  ('b2d464ad-37f4-4860-bdd8-6cb33e5841ba', 'rape'),
  ('b2d464ad-37f4-4860-bdd8-6cb33e5841ba', 'san-pedro'),
  ('b3cf8d07-9ca1-4ebd-884e-cf50c8716d0f', 'artist-fiona-helmer'),
  ('b3cf8d07-9ca1-4ebd-884e-cf50c8716d0f', 'english')
) AS v(song_id, slug) JOIN public.categories c ON c.slug = v.slug
ON CONFLICT DO NOTHING;
INSERT INTO public.song_category_map (song_id, category_id)
SELECT v.song_id::uuid, c.id FROM (VALUES
  ('b3cf8d07-9ca1-4ebd-884e-cf50c8716d0f', 'german'),
  ('b3cf8d07-9ca1-4ebd-884e-cf50c8716d0f', 'icaros'),
  ('b3cf8d07-9ca1-4ebd-884e-cf50c8716d0f', 'women'),
  ('b52d7d61-6d62-488b-b33a-d5eaa9f5aa67', 'artist-danit'),
  ('b52d7d61-6d62-488b-b33a-d5eaa9f5aa67', 'earth'),
  ('b52d7d61-6d62-488b-b33a-d5eaa9f5aa67', 'quechua-kichwa'),
  ('b52d7d61-6d62-488b-b33a-d5eaa9f5aa67', 'vocalization'),
  ('b7e35d1f-f931-467b-a376-dcac5d84b337', 'artist-nina'),
  ('b7e35d1f-f931-467b-a376-dcac5d84b337', 'english'),
  ('b7e35d1f-f931-467b-a376-dcac5d84b337', 'italian'),
  ('b7e35d1f-f931-467b-a376-dcac5d84b337', 'traditional'),
  ('b8430aee-1931-4ff8-821c-0e4419d2420c', 'artist-santo-daime'),
  ('b8430aee-1931-4ff8-821c-0e4419d2420c', 'english'),
  ('b8430aee-1931-4ff8-821c-0e4419d2420c', 'plegarias'),
  ('b8430aee-1931-4ff8-821c-0e4419d2420c', 'traditional'),
  ('b882d663-3c59-40c8-8385-7b3852aa72c8', 'belarusian'),
  ('b882d663-3c59-40c8-8385-7b3852aa72c8', 'icaros'),
  ('b882d663-3c59-40c8-8385-7b3852aa72c8', 'santo-daime'),
  ('b8bfe11f-192a-47bc-9d3c-102e341f663f', 'artist-traditional-camino-rojo'),
  ('b8bfe11f-192a-47bc-9d3c-102e341f663f', 'lithuanian'),
  ('b8bfe11f-192a-47bc-9d3c-102e341f663f', 'nahuatl'),
  ('b8bfe11f-192a-47bc-9d3c-102e341f663f', 'plantas'),
  ('ba3bece6-5d52-4750-b96f-13f364709da7', 'artist-shimshai'),
  ('ba3bece6-5d52-4750-b96f-13f364709da7', 'belarusian'),
  ('ba3bece6-5d52-4750-b96f-13f364709da7', 'gratitude'),
  ('ba3bece6-5d52-4750-b96f-13f364709da7', 'lakota'),
  ('bbf76f5e-c033-405e-acee-7d89f760525d', 'artist-alonso-del-rio'),
  ('bbf76f5e-c033-405e-acee-7d89f760525d', 'ayahuasca'),
  ('bbf76f5e-c033-405e-acee-7d89f760525d', 'english'),
  ('bbf76f5e-c033-405e-acee-7d89f760525d', 'russian'),
  ('bbf76f5e-c033-405e-acee-7d89f760525d', 'san-pedro'),
  ('bd5e5e04-a630-434b-9c40-ce7642ea0bed', 'artist-danit'),
  ('bec259ff-9567-4b94-8a23-1c6c23199eeb', 'artist-fiona-helmer'),
  ('bec259ff-9567-4b94-8a23-1c6c23199eeb', 'italian'),
  ('bec259ff-9567-4b94-8a23-1c6c23199eeb', 'sun'),
  ('bece6763-f91c-4387-9918-20099435ad08', 'artist-herbert-quinteros'),
  ('bfada781-5c74-4fcd-bd77-890cb0303481', 'air'),
  ('bfada781-5c74-4fcd-bd77-890cb0303481', 'plantas'),
  ('bfada781-5c74-4fcd-bd77-890cb0303481', 'traditional'),
  ('c3dc3ade-3247-491d-bbb9-501ec297b64e', 'artist-curawaka'),
  ('c3dc3ade-3247-491d-bbb9-501ec297b64e', 'english'),
  ('c3dc3ade-3247-491d-bbb9-501ec297b64e', 'opening-closing'),
  ('c3dc3ade-3247-491d-bbb9-501ec297b64e', 'quechua-kichwa'),
  ('c4999f38-543a-4397-93e9-4a1b665f8e6a', 'air'),
  ('c4999f38-543a-4397-93e9-4a1b665f8e6a', 'artist-diego-palma'),
  ('c4999f38-543a-4397-93e9-4a1b665f8e6a', 'nahuatl'),
  ('c4999f38-543a-4397-93e9-4a1b665f8e6a', 'portuguese'),
  ('c592bba5-19a4-4aaa-b822-1bddf3880efa', 'animales'),
  ('c592bba5-19a4-4aaa-b822-1bddf3880efa', 'artist-fiona-helmer'),
  ('c592bba5-19a4-4aaa-b822-1bddf3880efa', 'nahuatl'),
  ('c592bba5-19a4-4aaa-b822-1bddf3880efa', 'portuguese'),
  ('c592bba5-19a4-4aaa-b822-1bddf3880efa', 'traditional'),
  ('c6645abe-0b8e-4fbe-a8cb-2ced40a97017', 'artist-traditional'),
  ('c6645abe-0b8e-4fbe-a8cb-2ced40a97017', 'mountain'),
  ('c6645abe-0b8e-4fbe-a8cb-2ced40a97017', 'plegarias'),
  ('c6645abe-0b8e-4fbe-a8cb-2ced40a97017', 'rape'),
  ('c6645abe-0b8e-4fbe-a8cb-2ced40a97017', 'san-pedro'),
  ('c7f4809e-7051-4101-820b-e3853a90ec69', 'artist-nico-perez'),
  ('c7f4809e-7051-4101-820b-e3853a90ec69', 'german'),
  ('c7f4809e-7051-4101-820b-e3853a90ec69', 'rape'),
  ('c7f4809e-7051-4101-820b-e3853a90ec69', 'traditional'),
  ('ca7bba27-3b15-4eaa-87a3-20def74c53af', 'artist-danit'),
  ('ca7bba27-3b15-4eaa-87a3-20def74c53af', 'spanish'),
  ('ca7bba27-3b15-4eaa-87a3-20def74c53af', 'water'),
  ('cb012d44-9e32-4dfd-a97e-e584a80e44f8', 'artist-traditional'),
  ('cb012d44-9e32-4dfd-a97e-e584a80e44f8', 'belarusian'),
  ('cb012d44-9e32-4dfd-a97e-e584a80e44f8', 'protection'),
  ('cb012d44-9e32-4dfd-a97e-e584a80e44f8', 'vocalization'),
  ('cb0eb8a4-60c5-448e-a4e1-b7c03fb1e039', 'artist-nico-perez'),
  ('cb0eb8a4-60c5-448e-a4e1-b7c03fb1e039', 'lithuanian'),
  ('cb0eb8a4-60c5-448e-a4e1-b7c03fb1e039', 'love-heart'),
  ('cb0eb8a4-60c5-448e-a4e1-b7c03fb1e039', 'mountain'),
  ('cb0eb8a4-60c5-448e-a4e1-b7c03fb1e039', 'vocalization'),
  ('cb6d58ff-12e0-46dd-bb78-8367735c86b8', 'gratitude'),
  ('cb6d58ff-12e0-46dd-bb78-8367735c86b8', 'lithuanian'),
  ('cb6d58ff-12e0-46dd-bb78-8367735c86b8', 'traditional'),
  ('cc5670c9-3c55-4bb7-84bc-0b9938b38e89', 'artist-curawaka'),
  ('cc5670c9-3c55-4bb7-84bc-0b9938b38e89', 'quechua-kichwa'),
  ('cc5670c9-3c55-4bb7-84bc-0b9938b38e89', 'tobacco'),
  ('cc797377-3c6a-4172-bda9-7be7094ecfdc', 'artist-ayla-schafer'),
  ('cc797377-3c6a-4172-bda9-7be7094ecfdc', 'icaros'),
  ('cc797377-3c6a-4172-bda9-7be7094ecfdc', 'opening-closing'),
  ('cc797377-3c6a-4172-bda9-7be7094ecfdc', 'portuguese'),
  ('ccd5d47e-c82d-4f5c-845b-4d86abc0c605', 'bird'),
  ('ccd5d47e-c82d-4f5c-845b-4d86abc0c605', 'portuguese'),
  ('ccd5d47e-c82d-4f5c-845b-4d86abc0c605', 'san-pedro'),
  ('cf03f60f-04e4-4173-90d8-b28d906c6e15', 'artist-curawaka'),
  ('cf03f60f-04e4-4173-90d8-b28d906c6e15', 'opening-closing'),
  ('cf03f60f-04e4-4173-90d8-b28d906c6e15', 'san-pedro'),
  ('cf03f60f-04e4-4173-90d8-b28d906c6e15', 'santa-maria'),
  ('d058b4bd-dccd-44de-a307-290997a0694c', 'artist-cari-el'),
  ('d058b4bd-dccd-44de-a307-290997a0694c', 'russian'),
  ('d058b4bd-dccd-44de-a307-290997a0694c', 'spanish'),
  ('d079f01d-65eb-4aaf-a010-9378d8dd4d32', 'artist-traditional-camino-rojo'),
  ('d079f01d-65eb-4aaf-a010-9378d8dd4d32', 'healing-limpieza'),
  ('d079f01d-65eb-4aaf-a010-9378d8dd4d32', 'selva'),
  ('d079f01d-65eb-4aaf-a010-9378d8dd4d32', 'sun'),
  ('d079f01d-65eb-4aaf-a010-9378d8dd4d32', 'umbanda'),
  ('d17e8406-5a6a-444f-a73b-73f4e47c04a0', 'artist-nina'),
  ('d17e8406-5a6a-444f-a73b-73f4e47c04a0', 'russian')
) AS v(song_id, slug) JOIN public.categories c ON c.slug = v.slug
ON CONFLICT DO NOTHING;
INSERT INTO public.song_category_map (song_id, category_id)
SELECT v.song_id::uuid, c.id FROM (VALUES
  ('d17e8406-5a6a-444f-a73b-73f4e47c04a0', 'sun'),
  ('d17e8406-5a6a-444f-a73b-73f4e47c04a0', 'water'),
  ('d2ac829b-4d1c-4079-8aed-570008347392', 'artist-cari-el'),
  ('d2ac829b-4d1c-4079-8aed-570008347392', 'huni-kuin'),
  ('d2ac829b-4d1c-4079-8aed-570008347392', 'santa-maria'),
  ('d64916ce-586f-4a98-9798-d53e991fa6fd', 'air'),
  ('d64916ce-586f-4a98-9798-d53e991fa6fd', 'artist-ayla-schafer'),
  ('d64916ce-586f-4a98-9798-d53e991fa6fd', 'spanish'),
  ('d64916ce-586f-4a98-9798-d53e991fa6fd', 'umbanda'),
  ('d7ecf51d-0677-4a78-b007-9da39585392a', 'english'),
  ('d7ecf51d-0677-4a78-b007-9da39585392a', 'peyote'),
  ('d7ecf51d-0677-4a78-b007-9da39585392a', 'quechua-kichwa'),
  ('d7ecf51d-0677-4a78-b007-9da39585392a', 'women'),
  ('d8983a21-b135-4e10-8129-746980e21e4d', 'artist-traditional-umbanda'),
  ('d8983a21-b135-4e10-8129-746980e21e4d', 'quechua-kichwa'),
  ('d8983a21-b135-4e10-8129-746980e21e4d', 'san-pedro'),
  ('d8983a21-b135-4e10-8129-746980e21e4d', 'santo-daime'),
  ('d8983a21-b135-4e10-8129-746980e21e4d', 'temazcal'),
  ('d9a53b0f-1ca3-464d-ac10-26cf37d2131e', 'artist-danit'),
  ('d9a53b0f-1ca3-464d-ac10-26cf37d2131e', 'german'),
  ('d9a53b0f-1ca3-464d-ac10-26cf37d2131e', 'protection'),
  ('d9a53b0f-1ca3-464d-ac10-26cf37d2131e', 'sacred-pipe'),
  ('d9e1f95d-6e04-4331-b1ba-60d5051c00d9', 'artist-traditional-umbanda'),
  ('d9e1f95d-6e04-4331-b1ba-60d5051c00d9', 'portuguese'),
  ('d9e1f95d-6e04-4331-b1ba-60d5051c00d9', 'umbanda'),
  ('daa5c58a-165c-4355-a354-3af12675c168', 'artist-traditional-umbanda'),
  ('daa5c58a-165c-4355-a354-3af12675c168', 'portuguese'),
  ('daa5c58a-165c-4355-a354-3af12675c168', 'protection'),
  ('daa5c58a-165c-4355-a354-3af12675c168', 'quechua-kichwa'),
  ('dbce5509-7b40-4fbf-bf49-4456b10e02e3', 'artist-alain-merens'),
  ('dbce5509-7b40-4fbf-bf49-4456b10e02e3', 'artist-herbert-quinteros'),
  ('dbce5509-7b40-4fbf-bf49-4456b10e02e3', 'icaros'),
  ('dbce5509-7b40-4fbf-bf49-4456b10e02e3', 'italian'),
  ('dbce5509-7b40-4fbf-bf49-4456b10e02e3', 'umbanda'),
  ('dbe93605-454c-4cbd-919e-6409d2ed99fc', 'artist-santo-daime'),
  ('dbe93605-454c-4cbd-919e-6409d2ed99fc', 'love-heart'),
  ('dbe93605-454c-4cbd-919e-6409d2ed99fc', 'plegarias'),
  ('dbe93605-454c-4cbd-919e-6409d2ed99fc', 'spanish'),
  ('dc0789f1-1a6a-4a8a-ba56-f44c76c06fc6', 'air'),
  ('dc0789f1-1a6a-4a8a-ba56-f44c76c06fc6', 'belarusian'),
  ('dc0789f1-1a6a-4a8a-ba56-f44c76c06fc6', 'plegarias'),
  ('dcd12197-6614-4153-990c-2e47e6440b80', 'belarusian'),
  ('dcd12197-6614-4153-990c-2e47e6440b80', 'croatian'),
  ('dcd12197-6614-4153-990c-2e47e6440b80', 'santa-maria'),
  ('dd2fcd05-16b0-4bef-aaab-f62f97a0a161', 'artist-ayla-schafer'),
  ('dd2fcd05-16b0-4bef-aaab-f62f97a0a161', 'healing-limpieza'),
  ('dd2fcd05-16b0-4bef-aaab-f62f97a0a161', 'protection'),
  ('dd2fcd05-16b0-4bef-aaab-f62f97a0a161', 'sun'),
  ('df9b212c-9a05-4f6f-aa8b-b3b9317e9add', 'artist-nina'),
  ('df9b212c-9a05-4f6f-aa8b-b3b9317e9add', 'icaros'),
  ('df9b212c-9a05-4f6f-aa8b-b3b9317e9add', 'italian'),
  ('df9b212c-9a05-4f6f-aa8b-b3b9317e9add', 'love-heart'),
  ('df9b212c-9a05-4f6f-aa8b-b3b9317e9add', 'umbanda'),
  ('e1ea9259-89e5-4d21-b5cd-6ebd51bf3630', 'artist-herbert-quinteros'),
  ('e1ea9259-89e5-4d21-b5cd-6ebd51bf3630', 'russian'),
  ('e1ea9259-89e5-4d21-b5cd-6ebd51bf3630', 'santa-maria'),
  ('e1ea9259-89e5-4d21-b5cd-6ebd51bf3630', 'traditional'),
  ('e2958212-7784-4505-8df1-2997511314db', 'animales'),
  ('e2958212-7784-4505-8df1-2997511314db', 'artist-herbert-quinteros'),
  ('e2958212-7784-4505-8df1-2997511314db', 'san-pedro'),
  ('e2958212-7784-4505-8df1-2997511314db', 'santa-maria'),
  ('e33af2d0-0ba3-4e1b-9908-d16becf13504', 'artist-alonso-del-rio'),
  ('e33af2d0-0ba3-4e1b-9908-d16becf13504', 'artist-traditional-umbanda'),
  ('e33af2d0-0ba3-4e1b-9908-d16becf13504', 'lithuanian'),
  ('e33af2d0-0ba3-4e1b-9908-d16becf13504', 'peyote'),
  ('e33af2d0-0ba3-4e1b-9908-d16becf13504', 'temazcal'),
  ('e3c28e92-2149-4a6b-a719-9d90d51c5baa', 'artist-diego-palma'),
  ('e3c28e92-2149-4a6b-a719-9d90d51c5baa', 'lithuanian'),
  ('e3c28e92-2149-4a6b-a719-9d90d51c5baa', 'protection'),
  ('e3c28e92-2149-4a6b-a719-9d90d51c5baa', 'sacred-pipe'),
  ('e3c28e92-2149-4a6b-a719-9d90d51c5baa', 'temazcal'),
  ('e4c7ac25-4c15-43dd-89ff-d267f0ccf0f2', 'artist-santo-daime'),
  ('e4c7ac25-4c15-43dd-89ff-d267f0ccf0f2', 'san-pedro'),
  ('e4c7ac25-4c15-43dd-89ff-d267f0ccf0f2', 'santa-maria'),
  ('e4c7ac25-4c15-43dd-89ff-d267f0ccf0f2', 'water'),
  ('e60fd1a9-3a0d-4421-b6c1-a2961116682a', 'artist-cari-el'),
  ('e60fd1a9-3a0d-4421-b6c1-a2961116682a', 'croatian'),
  ('e60fd1a9-3a0d-4421-b6c1-a2961116682a', 'german'),
  ('e60fd1a9-3a0d-4421-b6c1-a2961116682a', 'icaros'),
  ('e60fd1a9-3a0d-4421-b6c1-a2961116682a', 'italian'),
  ('e60fd1a9-3a0d-4421-b6c1-a2961116682a', 'lithuanian'),
  ('e6eae749-101c-490e-bcc3-67ab18e1e480', 'artist-curawaka'),
  ('e877a416-3872-44be-9433-09a1dc19adea', 'artist-santo-daime'),
  ('e877a416-3872-44be-9433-09a1dc19adea', 'bird'),
  ('e877a416-3872-44be-9433-09a1dc19adea', 'plegarias'),
  ('e877a416-3872-44be-9433-09a1dc19adea', 'water'),
  ('ed028840-31be-4ee4-83af-551b14251f71', 'artist-santo-daime'),
  ('ed028840-31be-4ee4-83af-551b14251f71', 'english'),
  ('ed028840-31be-4ee4-83af-551b14251f71', 'water'),
  ('eda86457-a70a-46bf-9945-51930a6c3894', 'artist-nico-perez'),
  ('eda86457-a70a-46bf-9945-51930a6c3894', 'croatian'),
  ('eda86457-a70a-46bf-9945-51930a6c3894', 'english'),
  ('eda86457-a70a-46bf-9945-51930a6c3894', 'russian'),
  ('eda86457-a70a-46bf-9945-51930a6c3894', 'tobacco'),
  ('edef27fa-a31f-4720-a66f-4890a2582898', 'artist-traditional'),
  ('edef27fa-a31f-4720-a66f-4890a2582898', 'earth'),
  ('edef27fa-a31f-4720-a66f-4890a2582898', 'english'),
  ('ee2a6364-cab6-43ab-8ed5-15ee68134133', 'animales'),
  ('ee2a6364-cab6-43ab-8ed5-15ee68134133', 'healing-limpieza'),
  ('ee2a6364-cab6-43ab-8ed5-15ee68134133', 'huni-kuin')
) AS v(song_id, slug) JOIN public.categories c ON c.slug = v.slug
ON CONFLICT DO NOTHING;
INSERT INTO public.song_category_map (song_id, category_id)
SELECT v.song_id::uuid, c.id FROM (VALUES
  ('ee78e39f-2d1b-430b-8ef5-5f534b3f6548', 'lakota'),
  ('ee78e39f-2d1b-430b-8ef5-5f534b3f6548', 'spanish'),
  ('ee82ef40-a85c-4504-8fab-8e66800879f4', 'artist-alonso-del-rio'),
  ('ee82ef40-a85c-4504-8fab-8e66800879f4', 'artist-traditional'),
  ('ee82ef40-a85c-4504-8fab-8e66800879f4', 'ayahuasca'),
  ('ee82ef40-a85c-4504-8fab-8e66800879f4', 'huni-kuin'),
  ('ee82ef40-a85c-4504-8fab-8e66800879f4', 'umbanda'),
  ('ef675cfa-ed33-45b6-b9ab-abc4e20344fd', 'air'),
  ('ef675cfa-ed33-45b6-b9ab-abc4e20344fd', 'artist-danit'),
  ('ef675cfa-ed33-45b6-b9ab-abc4e20344fd', 'nahuatl'),
  ('ef675cfa-ed33-45b6-b9ab-abc4e20344fd', 'selva'),
  ('f0368cda-0f9f-4d91-8f30-56dbae59e20f', 'artist-santo-daime'),
  ('f0368cda-0f9f-4d91-8f30-56dbae59e20f', 'german'),
  ('f0368cda-0f9f-4d91-8f30-56dbae59e20f', 'women'),
  ('f23b3091-9817-4ae4-a30c-eff186bcc760', 'artist-traditional'),
  ('f23b3091-9817-4ae4-a30c-eff186bcc760', 'gratitude'),
  ('f23b3091-9817-4ae4-a30c-eff186bcc760', 'sacred-pipe'),
  ('f23b3091-9817-4ae4-a30c-eff186bcc760', 'santo-daime'),
  ('f5798ea3-5e89-40ef-a9ea-d77ee0eadd0a', 'artist-herbert-quinteros'),
  ('f5798ea3-5e89-40ef-a9ea-d77ee0eadd0a', 'artist-peia'),
  ('f5798ea3-5e89-40ef-a9ea-d77ee0eadd0a', 'english'),
  ('f5798ea3-5e89-40ef-a9ea-d77ee0eadd0a', 'nahuatl'),
  ('f5798ea3-5e89-40ef-a9ea-d77ee0eadd0a', 'plantas'),
  ('f6e5e7bc-19aa-4b62-a5bb-a7cccb604d0b', 'artist-danit'),
  ('f6e5e7bc-19aa-4b62-a5bb-a7cccb604d0b', 'ayahuasca'),
  ('f6e5e7bc-19aa-4b62-a5bb-a7cccb604d0b', 'fire'),
  ('f6e5e7bc-19aa-4b62-a5bb-a7cccb604d0b', 'mountain'),
  ('f6e5e7bc-19aa-4b62-a5bb-a7cccb604d0b', 'portuguese'),
  ('f718e0e5-80cb-4613-8e45-62c74ebdbe85', 'artist-medicine-family'),
  ('f718e0e5-80cb-4613-8e45-62c74ebdbe85', 'earth'),
  ('f718e0e5-80cb-4613-8e45-62c74ebdbe85', 'santa-maria'),
  ('f718e0e5-80cb-4613-8e45-62c74ebdbe85', 'spanish'),
  ('f7b2d7d7-2c9a-4436-af59-77cdadc67f3c', 'artist-ayla-schafer'),
  ('f7b2d7d7-2c9a-4436-af59-77cdadc67f3c', 'german'),
  ('f7b2d7d7-2c9a-4436-af59-77cdadc67f3c', 'opening-closing'),
  ('f804949e-cc34-4f4e-b95d-3170aa63af64', 'artist-santo-daime'),
  ('f804949e-cc34-4f4e-b95d-3170aa63af64', 'huni-kuin'),
  ('f804949e-cc34-4f4e-b95d-3170aa63af64', 'rape'),
  ('f91f8923-8fd1-4536-b6bb-4b71a873fcff', 'animales'),
  ('f91f8923-8fd1-4536-b6bb-4b71a873fcff', 'artist-nina'),
  ('f91f8923-8fd1-4536-b6bb-4b71a873fcff', 'artist-traditional-camino-rojo'),
  ('f91f8923-8fd1-4536-b6bb-4b71a873fcff', 'croatian'),
  ('f91f8923-8fd1-4536-b6bb-4b71a873fcff', 'opening-closing'),
  ('f91f8923-8fd1-4536-b6bb-4b71a873fcff', 'traditional'),
  ('fd1e663c-8daf-4ce6-8e0a-af43aab15540', 'artist-danit'),
  ('fd1e663c-8daf-4ce6-8e0a-af43aab15540', 'english'),
  ('fd1e663c-8daf-4ce6-8e0a-af43aab15540', 'portuguese'),
  ('fd1e663c-8daf-4ce6-8e0a-af43aab15540', 'sacred-pipe'),
  ('fe09b341-733c-494d-9539-f5a4f9e69d8a', 'lakota'),
  ('fe09b341-733c-494d-9539-f5a4f9e69d8a', 'love-heart'),
  ('fe09b341-733c-494d-9539-f5a4f9e69d8a', 'santo-daime'),
  ('feb70e68-d95b-4bf8-a892-ff84d967eec8', 'artist-ayla-nereo'),
  ('feb70e68-d95b-4bf8-a892-ff84d967eec8', 'artist-santo-daime'),
  ('feb70e68-d95b-4bf8-a892-ff84d967eec8', 'fire'),
  ('feb70e68-d95b-4bf8-a892-ff84d967eec8', 'lakota'),
  ('feb70e68-d95b-4bf8-a892-ff84d967eec8', 'plantas'),
  ('feb70e68-d95b-4bf8-a892-ff84d967eec8', 'quechua-kichwa')
) AS v(song_id, slug) JOIN public.categories c ON c.slug = v.slug
ON CONFLICT DO NOTHING;

-- Playlists (10)
INSERT INTO public.setlists (id, owner_id, title, description, is_public, created_at) VALUES
  ('aaaaaaaa-0002-4000-a000-000000000002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Admin Fire Circle', 'Public playlist curated by the admin.', true, now() - interval '2374485 seconds'),
  ('aaaaaaaa-0006-4000-a000-000000000006', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Fire Songs', 'A collection of songs for the sacred fire circle.', true, now() - interval '938597 seconds'),
  ('aaaaaaaa-0007-4000-a000-000000000007', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Gatekeeper Circle', 'Curated by the gatekeeper.', true, now() - interval '1673103 seconds'),
  ('1e881f96-c3ee-476f-bf2d-a902dd07c6d5', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'My Favorites', 'Songs I love', false, now() - interval '0 seconds'),
  ('3826ed9a-34de-4f95-baaa-f86a80038bbd', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'My Favorites', 'Songs I love', false, now() - interval '0 seconds'),
  ('ab2fe71f-f566-481b-abca-803947c8c7b0', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'My Favorites', 'Songs I love', false, now() - interval '0 seconds'),
  ('aaaaaaaa-0003-4000-a000-000000000003', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'My Healing Practice', 'Private practice list.', false, now() - interval '2320356 seconds'),
  ('aaaaaaaa-0004-4000-a000-000000000004', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'New Moon Ceremony', 'Private setlist for the next new moon.', false, now() - interval '1417716 seconds'),
  ('aaaaaaaa-0001-4000-a000-000000000001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Water Ceremony', 'Songs for water blessings and river ceremonies.', true, now() - interval '1886737 seconds'),
  ('aaaaaaaa-0005-4000-a000-000000000005', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Work in Progress', 'Empty playlist, nothing added yet.', false, now() - interval '2280740 seconds')
ON CONFLICT (id) DO NOTHING;

-- Playlist items (59)
INSERT INTO public.setlist_items (setlist_id, song_version_id, order_index) VALUES
  ('1e881f96-c3ee-476f-bf2d-a902dd07c6d5', '4a82cc40-188c-4327-aea5-3c0644f31c1e', 1),
  ('1e881f96-c3ee-476f-bf2d-a902dd07c6d5', 'a87cb758-2480-43dc-9737-6bc996c85f8b', 2),
  ('1e881f96-c3ee-476f-bf2d-a902dd07c6d5', '79b517f3-b88c-479c-8896-9cdd85186b09', 3),
  ('3826ed9a-34de-4f95-baaa-f86a80038bbd', 'a6c2bea4-ef98-4eb9-bfbd-a7e8ab761fbb', 1),
  ('3826ed9a-34de-4f95-baaa-f86a80038bbd', '475ea880-d487-4585-bb65-850e3acb548c', 2),
  ('3826ed9a-34de-4f95-baaa-f86a80038bbd', '72630a9e-2a16-473b-b1ad-760d13aa2ad1', 3),
  ('3826ed9a-34de-4f95-baaa-f86a80038bbd', 'b1b10b39-4136-4ff0-bb7c-3ee6c52f7fa5', 4),
  ('3826ed9a-34de-4f95-baaa-f86a80038bbd', 'f8e761c2-bdb2-4e2b-bff5-dc89e9b7e815', 5),
  ('3826ed9a-34de-4f95-baaa-f86a80038bbd', '4222d093-b702-467b-bafd-2184ea22354b', 6),
  ('3826ed9a-34de-4f95-baaa-f86a80038bbd', 'd3fab812-319b-4a17-85d9-1793788b3b7b', 7),
  ('3826ed9a-34de-4f95-baaa-f86a80038bbd', '8d1e0610-8d11-43f4-a8e6-4a10c7dc00cc', 8),
  ('3826ed9a-34de-4f95-baaa-f86a80038bbd', '822bc443-01c3-4a36-b6b7-58aa0e251bb7', 9),
  ('aaaaaaaa-0001-4000-a000-000000000001', 'b1b10b39-4136-4ff0-bb7c-3ee6c52f7fa5', 1),
  ('aaaaaaaa-0001-4000-a000-000000000001', '72630a9e-2a16-473b-b1ad-760d13aa2ad1', 2),
  ('aaaaaaaa-0001-4000-a000-000000000001', '6c67d1c5-f3b6-4ff2-ba86-174b058f6e3b', 3),
  ('aaaaaaaa-0001-4000-a000-000000000001', '891b76e0-61e2-41c2-9677-a404f546932a', 4),
  ('aaaaaaaa-0001-4000-a000-000000000001', '475ea880-d487-4585-bb65-850e3acb548c', 5),
  ('aaaaaaaa-0001-4000-a000-000000000001', '60c463b2-41f3-4614-bff5-34d43dca5ce6', 6),
  ('aaaaaaaa-0001-4000-a000-000000000001', '4dee3cb0-5d58-4c29-a0e1-b4c7423b5e50', 7),
  ('aaaaaaaa-0001-4000-a000-000000000001', 'e7212bbd-bd5f-4acb-bb23-1189c00a2bbd', 8),
  ('aaaaaaaa-0002-4000-a000-000000000002', 'a6c2bea4-ef98-4eb9-bfbd-a7e8ab761fbb', 1),
  ('aaaaaaaa-0002-4000-a000-000000000002', 'da5f291b-4971-4566-93ea-6dcf483e36b8', 2),
  ('aaaaaaaa-0002-4000-a000-000000000002', '4e8d152c-56fb-4833-8fa8-41f2851c4355', 3),
  ('aaaaaaaa-0002-4000-a000-000000000002', '8dfef137-f906-47e6-823d-f16be589d0ca', 4),
  ('aaaaaaaa-0002-4000-a000-000000000002', '898b6eb9-b429-42ac-a189-d98464ec7973', 5),
  ('aaaaaaaa-0002-4000-a000-000000000002', '7e85787a-7c26-42be-8ab5-b38374efaf86', 6),
  ('aaaaaaaa-0003-4000-a000-000000000003', 'a87cb758-2480-43dc-9737-6bc996c85f8b', 1),
  ('aaaaaaaa-0003-4000-a000-000000000003', '4e8d152c-56fb-4833-8fa8-41f2851c4355', 2),
  ('aaaaaaaa-0003-4000-a000-000000000003', '84a09377-371d-44b8-bc56-14aab4d14d47', 3),
  ('aaaaaaaa-0003-4000-a000-000000000003', 'a17e738c-14fe-45ea-afa5-8c1ae30b5f99', 4),
  ('aaaaaaaa-0003-4000-a000-000000000003', 'd65f6707-63f6-463f-a7fa-740e8b67301f', 5),
  ('aaaaaaaa-0003-4000-a000-000000000003', '17ffba94-087c-437c-bea5-730bafea410b', 6),
  ('aaaaaaaa-0003-4000-a000-000000000003', '3c75d2f0-7e1e-4bd4-af0e-3a44e479a4b9', 7),
  ('aaaaaaaa-0004-4000-a000-000000000004', '8dfef137-f906-47e6-823d-f16be589d0ca', 1),
  ('aaaaaaaa-0004-4000-a000-000000000004', '04bb84bf-bce8-49c2-93ab-925628a26788', 2),
  ('aaaaaaaa-0004-4000-a000-000000000004', '8f86fd42-c6ad-4cb4-8108-bff2453621ba', 3),
  ('aaaaaaaa-0004-4000-a000-000000000004', '2a162ec0-2b3f-450b-b12a-c3d79e35da7d', 4),
  ('aaaaaaaa-0004-4000-a000-000000000004', '85214f42-a48b-4904-a6a1-0465f715636b', 5),
  ('aaaaaaaa-0006-4000-a000-000000000006', '0b5f092d-707c-4a14-b30d-7ab3200ad217', 1),
  ('aaaaaaaa-0006-4000-a000-000000000006', '4a981803-09dd-4887-a30b-4dbeeac224d1', 2),
  ('aaaaaaaa-0006-4000-a000-000000000006', '8dfef137-f906-47e6-823d-f16be589d0ca', 3),
  ('aaaaaaaa-0006-4000-a000-000000000006', 'a6c2bea4-ef98-4eb9-bfbd-a7e8ab761fbb', 4),
  ('aaaaaaaa-0006-4000-a000-000000000006', 'da5f291b-4971-4566-93ea-6dcf483e36b8', 5),
  ('aaaaaaaa-0006-4000-a000-000000000006', '7e85787a-7c26-42be-8ab5-b38374efaf86', 6),
  ('aaaaaaaa-0006-4000-a000-000000000006', '898b6eb9-b429-42ac-a189-d98464ec7973', 7),
  ('aaaaaaaa-0006-4000-a000-000000000006', '4e8d152c-56fb-4833-8fa8-41f2851c4355', 8),
  ('aaaaaaaa-0006-4000-a000-000000000006', '8fffba10-c9fc-4b44-abaa-879a85badfab', 9),
  ('aaaaaaaa-0006-4000-a000-000000000006', '66938eb0-d1fb-4969-b892-6bafa3e188f0', 10),
  ('aaaaaaaa-0007-4000-a000-000000000007', 'f3abd6ad-945b-4159-919a-d379f8c12a35', 1),
  ('aaaaaaaa-0007-4000-a000-000000000007', 'a14e9572-1a42-4f7c-9147-0f5ef024b0d1', 2);
INSERT INTO public.setlist_items (setlist_id, song_version_id, order_index) VALUES
  ('aaaaaaaa-0007-4000-a000-000000000007', 'bfea479d-1c76-4196-a6a6-8885d729c573', 3),
  ('aaaaaaaa-0007-4000-a000-000000000007', '4776bbac-1a59-4a46-8c20-435e748212fd', 4),
  ('aaaaaaaa-0007-4000-a000-000000000007', '593f81b5-0b32-4094-8373-9f6e934c90d5', 5),
  ('ab2fe71f-f566-481b-abca-803947c8c7b0', '9e35b32e-bd6f-4864-9ca0-232fbc3228bd', 1),
  ('ab2fe71f-f566-481b-abca-803947c8c7b0', '4264eff5-d21d-4f98-b9eb-c7d9d1a1dfda', 2),
  ('ab2fe71f-f566-481b-abca-803947c8c7b0', 'e72c1fe6-9f01-4ef4-9b1d-609829c37ade', 3),
  ('ab2fe71f-f566-481b-abca-803947c8c7b0', '780f70c3-145c-494a-b0fd-f4a64bb4104a', 4),
  ('ab2fe71f-f566-481b-abca-803947c8c7b0', '2b422564-1fca-4eb2-bdc0-2b031758c09e', 5),
  ('ab2fe71f-f566-481b-abca-803947c8c7b0', '04bb84bf-bce8-49c2-93ab-925628a26788', 6);

-- Private rehearsal recordings (metadata only, no files in storage) (418)
INSERT INTO public.user_recordings (id, user_id, song_version_id, recording_name, storage_path, position, file_size_bytes, duration_seconds, created_at) VALUES
  ('16f0f42c-f6b6-4669-8774-e197c24f100a', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '02ef089c-4d50-49b3-94f9-aa2cdb17e4b0', 'Tempo check (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/02ef089c-4d50-49b3-94f9-aa2cdb17e4b0/16f0f42c-f6b6-4669-8774-e197c24f100a.webm', 1, '1309266', 126, now() - interval '313830 seconds'),
  ('6e0ddc5d-f9d5-4f8c-aeff-2151bf3ee731', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '02ef089c-4d50-49b3-94f9-aa2cdb17e4b0', 'Tempo check (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/02ef089c-4d50-49b3-94f9-aa2cdb17e4b0/6e0ddc5d-f9d5-4f8c-aeff-2151bf3ee731.webm', 2, '245958', 178, now() - interval '351726 seconds'),
  ('1bc488e8-3c50-43b9-a12d-965b888911f9', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '02ef089c-4d50-49b3-94f9-aa2cdb17e4b0', 'Tempo check (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/02ef089c-4d50-49b3-94f9-aa2cdb17e4b0/1bc488e8-3c50-43b9-a12d-965b888911f9.webm', 3, '3859050', 39, now() - interval '200992 seconds'),
  ('937e93e2-6c48-4452-b004-5865fd81fa0c', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '04bb84bf-bce8-49c2-93ab-925628a26788', 'Vocal guide (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12/04bb84bf-bce8-49c2-93ab-925628a26788/937e93e2-6c48-4452-b004-5865fd81fa0c.webm', 1, '3071846', 86, now() - interval '416713 seconds'),
  ('71f6d822-7b7c-45c6-9e59-564b0647d44b', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '04bb84bf-bce8-49c2-93ab-925628a26788', 'Vocal guide (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12/04bb84bf-bce8-49c2-93ab-925628a26788/71f6d822-7b7c-45c6-9e59-564b0647d44b.webm', 2, '2626485', 69, now() - interval '363121 seconds'),
  ('f15fbf8b-1e64-4698-b645-f3d5a70e504c', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '08985071-17c6-4c2b-a8b8-c1d574e5a3ec', 'Practice Session (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/08985071-17c6-4c2b-a8b8-c1d574e5a3ec/f15fbf8b-1e64-4698-b645-f3d5a70e504c.wav', 1, '3020003', 113, now() - interval '536594 seconds'),
  ('38405622-6e97-4bd4-877a-41bff7149896', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '08985071-17c6-4c2b-a8b8-c1d574e5a3ec', 'Practice Session (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/08985071-17c6-4c2b-a8b8-c1d574e5a3ec/38405622-6e97-4bd4-877a-41bff7149896.wav', 2, '2687562', 148, now() - interval '257431 seconds'),
  ('527efff1-09c2-4f92-aa40-d084e84c7024', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '08985071-17c6-4c2b-a8b8-c1d574e5a3ec', 'Practice Session (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/08985071-17c6-4c2b-a8b8-c1d574e5a3ec/527efff1-09c2-4f92-aa40-d084e84c7024.wav', 3, '3975582', 56, now() - interval '525603 seconds'),
  ('2b271513-7840-4f82-9e56-77faf928aad0', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '0b5f092d-707c-4a14-b30d-7ab3200ad217', 'Slow practice (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/0b5f092d-707c-4a14-b30d-7ab3200ad217/2b271513-7840-4f82-9e56-77faf928aad0.webm', 1, '3055131', 181, now() - interval '436705 seconds'),
  ('d2f9dbf6-b08c-426f-b8ca-960a7447ab4d', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '0b5f092d-707c-4a14-b30d-7ab3200ad217', 'Slow practice (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/0b5f092d-707c-4a14-b30d-7ab3200ad217/d2f9dbf6-b08c-426f-b8ca-960a7447ab4d.webm', 2, '3523126', 116, now() - interval '200049 seconds'),
  ('44c08329-40a2-4686-9c7c-956da94cfe5a', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '0b5f092d-707c-4a14-b30d-7ab3200ad217', 'Slow practice (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/0b5f092d-707c-4a14-b30d-7ab3200ad217/44c08329-40a2-4686-9c7c-956da94cfe5a.webm', 3, '1065221', 133, now() - interval '113782 seconds'),
  ('c6b532ef-e731-4422-bc53-4a66682b7357', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '0b809c30-77d6-494c-b9a1-079c6e9b922e', 'First Take (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/0b809c30-77d6-494c-b9a1-079c6e9b922e/c6b532ef-e731-4422-bc53-4a66682b7357.webm', 1, '3737768', 124, now() - interval '223112 seconds'),
  ('64531c3e-7088-411d-9c19-ea309b4e6b8c', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '0b809c30-77d6-494c-b9a1-079c6e9b922e', 'First Take (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/0b809c30-77d6-494c-b9a1-079c6e9b922e/64531c3e-7088-411d-9c19-ea309b4e6b8c.webm', 2, '3706170', 155, now() - interval '170951 seconds'),
  ('c9dbbb9d-c947-4a24-9f50-b9f47f4e2901', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '0e9c3da6-65a4-4fff-a742-0e3596e891b9', 'Acoustic draft', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/0e9c3da6-65a4-4fff-a742-0e3596e891b9/c9dbbb9d-c947-4a24-9f50-b9f47f4e2901.wav', 1, '1471725', 164, now() - interval '528004 seconds'),
  ('b03860cb-fea5-42b8-b18a-e491ae718612', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '0ed7a375-f3d5-4593-a464-bdd783e22704', 'Full run-through', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12/0ed7a375-f3d5-4593-a464-bdd783e22704/b03860cb-fea5-42b8-b18a-e491ae718612.wav', 1, '3950843', 86, now() - interval '38241 seconds'),
  ('7cf21bd2-6351-4c4e-ad41-55b398e6948d', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '0f2e213e-9464-4954-bf8a-93a27c92040d', 'Full run-through (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/0f2e213e-9464-4954-bf8a-93a27c92040d/7cf21bd2-6351-4c4e-ad41-55b398e6948d.webm', 1, '292753', 27, now() - interval '203678 seconds'),
  ('e358219d-9b87-4de3-8bdb-2f466daa7bab', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '0f2e213e-9464-4954-bf8a-93a27c92040d', 'Full run-through (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/0f2e213e-9464-4954-bf8a-93a27c92040d/e358219d-9b87-4de3-8bdb-2f466daa7bab.webm', 2, '570044', 170, now() - interval '401163 seconds'),
  ('ddeb9593-597e-4104-85fc-b700c7a43791', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '113d8f61-407d-4009-8b8f-93e0404fd261', 'Tempo check (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/113d8f61-407d-4009-8b8f-93e0404fd261/ddeb9593-597e-4104-85fc-b700c7a43791.webm', 1, '2824000', 130, now() - interval '561491 seconds'),
  ('ebd7c6e2-0f37-4904-bded-3fe16a686198', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '113d8f61-407d-4009-8b8f-93e0404fd261', 'Tempo check (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/113d8f61-407d-4009-8b8f-93e0404fd261/ebd7c6e2-0f37-4904-bded-3fe16a686198.webm', 2, '2586447', 92, now() - interval '116545 seconds'),
  ('ea468841-ee5e-4ab2-ba71-e5e55c57c046', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '113d8f61-407d-4009-8b8f-93e0404fd261', 'Tempo check (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/113d8f61-407d-4009-8b8f-93e0404fd261/ea468841-ee5e-4ab2-ba71-e5e55c57c046.webm', 3, '2300895', 51, now() - interval '224362 seconds'),
  ('2f494b75-6b99-4057-b14e-ef74a8ce16ea', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '1271481d-1057-401d-8127-a1190b3d03fb', 'Tempo check (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/1271481d-1057-401d-8127-a1190b3d03fb/2f494b75-6b99-4057-b14e-ef74a8ce16ea.webm', 1, '3962837', 91, now() - interval '159717 seconds'),
  ('2121ebbb-7417-455b-93cf-da1b8050d17f', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '1271481d-1057-401d-8127-a1190b3d03fb', 'Tempo check (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/1271481d-1057-401d-8127-a1190b3d03fb/2121ebbb-7417-455b-93cf-da1b8050d17f.webm', 2, '1566951', 109, now() - interval '62790 seconds'),
  ('deb9546b-6dc8-4c7e-9133-9de69093b366', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '13f0f2e9-7562-4835-90eb-0f9c20f5f6f9', 'Slow practice (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/13f0f2e9-7562-4835-90eb-0f9c20f5f6f9/deb9546b-6dc8-4c7e-9133-9de69093b366.webm', 1, '2170235', 82, now() - interval '575266 seconds'),
  ('a1544bd0-1367-437f-9e27-1a4c60f89424', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '13f0f2e9-7562-4835-90eb-0f9c20f5f6f9', 'Slow practice (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/13f0f2e9-7562-4835-90eb-0f9c20f5f6f9/a1544bd0-1367-437f-9e27-1a4c60f89424.webm', 2, '1248581', 100, now() - interval '341454 seconds'),
  ('66522f0d-6ee1-4902-9ff5-4d23f8ec7083', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '13f0f2e9-7562-4835-90eb-0f9c20f5f6f9', 'Slow practice (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/13f0f2e9-7562-4835-90eb-0f9c20f5f6f9/66522f0d-6ee1-4902-9ff5-4d23f8ec7083.webm', 3, '437415', 106, now() - interval '487287 seconds'),
  ('08ef61ec-c8b4-449e-9580-2da0427f3a17', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '13f0f2e9-7562-4835-90eb-0f9c20f5f6f9', 'Slow practice (Take 4)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/13f0f2e9-7562-4835-90eb-0f9c20f5f6f9/08ef61ec-c8b4-449e-9580-2da0427f3a17.webm', 4, '2260106', 70, now() - interval '271111 seconds'),
  ('b7340599-5427-4885-8a00-7f4fb3c0d6e0', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '13f0f2e9-7562-4835-90eb-0f9c20f5f6f9', 'Slow practice (Take 5)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/13f0f2e9-7562-4835-90eb-0f9c20f5f6f9/b7340599-5427-4885-8a00-7f4fb3c0d6e0.webm', 5, '2961769', 187, now() - interval '78389 seconds'),
  ('d78a3bee-cbce-4f89-b209-29712171b613', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '17ffba94-087c-437c-bea5-730bafea410b', 'Tempo check', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/17ffba94-087c-437c-bea5-730bafea410b/d78a3bee-cbce-4f89-b209-29712171b613.webm', 1, '2234283', 34, now() - interval '62307 seconds'),
  ('9ae25f51-0e96-4aad-8576-8829d126b32f', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '2494a4a6-d46e-4428-95ed-9f367c57a6d6', 'Tempo check (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/2494a4a6-d46e-4428-95ed-9f367c57a6d6/9ae25f51-0e96-4aad-8576-8829d126b32f.webm', 1, '230391', 87, now() - interval '374042 seconds'),
  ('afc83416-e6ef-4efb-9ead-a581f5e2b714', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '2494a4a6-d46e-4428-95ed-9f367c57a6d6', 'Tempo check (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/2494a4a6-d46e-4428-95ed-9f367c57a6d6/afc83416-e6ef-4efb-9ead-a581f5e2b714.webm', 2, '1125858', 52, now() - interval '327831 seconds'),
  ('861eb989-4f2d-48b2-b775-a685562e9c6f', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '2494a4a6-d46e-4428-95ed-9f367c57a6d6', 'Tempo check (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/2494a4a6-d46e-4428-95ed-9f367c57a6d6/861eb989-4f2d-48b2-b775-a685562e9c6f.webm', 3, '3980209', 124, now() - interval '320984 seconds'),
  ('e4efbb06-5022-4f0d-8be1-f8383bd6006f', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '2494a4a6-d46e-4428-95ed-9f367c57a6d6', 'Tempo check (Take 4)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/2494a4a6-d46e-4428-95ed-9f367c57a6d6/e4efbb06-5022-4f0d-8be1-f8383bd6006f.webm', 4, '1878581', 106, now() - interval '395516 seconds'),
  ('77aa65dc-1fd1-4533-bdcd-92ac97875c7e', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '2494a4a6-d46e-4428-95ed-9f367c57a6d6', 'Tempo check (Take 5)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/2494a4a6-d46e-4428-95ed-9f367c57a6d6/77aa65dc-1fd1-4533-bdcd-92ac97875c7e.webm', 5, '1449361', 99, now() - interval '458659 seconds'),
  ('20c9c942-3a47-4fd6-84bb-fb9e07446fd5', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '24f16ac5-71d1-4684-bd53-b688790c9c9c', 'First Take (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/24f16ac5-71d1-4684-bd53-b688790c9c9c/20c9c942-3a47-4fd6-84bb-fb9e07446fd5.webm', 1, '3203736', 51, now() - interval '17891 seconds'),
  ('eb7bc696-2c4a-4848-b352-a3bf3caa06e1', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '24f16ac5-71d1-4684-bd53-b688790c9c9c', 'First Take (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/24f16ac5-71d1-4684-bd53-b688790c9c9c/eb7bc696-2c4a-4848-b352-a3bf3caa06e1.webm', 2, '450769', 113, now() - interval '89838 seconds'),
  ('e489cfa5-1ea4-4639-8f30-391be82efd52', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '24f16ac5-71d1-4684-bd53-b688790c9c9c', 'First Take (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/24f16ac5-71d1-4684-bd53-b688790c9c9c/e489cfa5-1ea4-4639-8f30-391be82efd52.webm', 3, '1026556', 71, now() - interval '66445 seconds'),
  ('6ea7418b-cd50-4891-a2f7-f042245969df', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '24f16ac5-71d1-4684-bd53-b688790c9c9c', 'First Take (Take 4)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/24f16ac5-71d1-4684-bd53-b688790c9c9c/6ea7418b-cd50-4891-a2f7-f042245969df.webm', 4, '1851826', 41, now() - interval '570730 seconds'),
  ('7c2a441d-58f4-4e8a-8ed7-b90f9345e490', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '24f16ac5-71d1-4684-bd53-b688790c9c9c', 'First Take (Take 5)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/24f16ac5-71d1-4684-bd53-b688790c9c9c/7c2a441d-58f4-4e8a-8ed7-b90f9345e490.webm', 5, '3626768', 188, now() - interval '506044 seconds'),
  ('b92b81dc-367f-4d5c-ad5e-d07b7a8bab32', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '2a799066-07d0-4bde-ba86-9635e6d05fc8', 'Tempo check', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/2a799066-07d0-4bde-ba86-9635e6d05fc8/b92b81dc-367f-4d5c-ad5e-d07b7a8bab32.wav', 1, '3053445', 116, now() - interval '237514 seconds'),
  ('05f7a967-056c-4e06-ae6b-d3c40eb9883f', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2b422564-1fca-4eb2-bdc0-2b031758c09e', 'Full run-through', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/2b422564-1fca-4eb2-bdc0-2b031758c09e/05f7a967-056c-4e06-ae6b-d3c40eb9883f.webm', 1, '2670708', 50, now() - interval '436175 seconds'),
  ('c7b9c1ac-602b-4344-9c8f-e6f6e7efacc7', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '2b530041-2291-4224-ab30-0b50de9f57a4', 'Acoustic draft', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/2b530041-2291-4224-ab30-0b50de9f57a4/c7b9c1ac-602b-4344-9c8f-e6f6e7efacc7.webm', 1, '2066115', 140, now() - interval '367636 seconds'),
  ('12f85ec5-559e-480f-bfee-1a378650227e', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2faf94fc-144b-466e-8a7a-9631fbe4e6e2', 'Late Night run', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/2faf94fc-144b-466e-8a7a-9631fbe4e6e2/12f85ec5-559e-480f-bfee-1a378650227e.webm', 1, '455959', 173, now() - interval '211355 seconds'),
  ('c94e90a2-55ef-44a4-90de-563910f95a53', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '31bc31a3-ea32-47a6-a86d-13345f611ecc', 'Acoustic draft', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12/31bc31a3-ea32-47a6-a86d-13345f611ecc/c94e90a2-55ef-44a4-90de-563910f95a53.webm', 1, '2859712', 32, now() - interval '605556 seconds'),
  ('3f7e04b7-1152-4817-a93a-2638668d8825', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '32ab9edf-9ef3-45c5-96ce-5d1b688f78f1', 'Practice Session', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/32ab9edf-9ef3-45c5-96ce-5d1b688f78f1/3f7e04b7-1152-4817-a93a-2638668d8825.webm', 1, '2569497', 37, now() - interval '198411 seconds'),
  ('835c647e-ba57-4e34-9e01-d20da0862813', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '38981efb-5d1f-40f5-b1a0-5420a38ccf31', 'Tempo check (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/38981efb-5d1f-40f5-b1a0-5420a38ccf31/835c647e-ba57-4e34-9e01-d20da0862813.webm', 1, '2311885', 82, now() - interval '351776 seconds'),
  ('740265aa-c54a-4227-840f-6b86843af899', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '38981efb-5d1f-40f5-b1a0-5420a38ccf31', 'Tempo check (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/38981efb-5d1f-40f5-b1a0-5420a38ccf31/740265aa-c54a-4227-840f-6b86843af899.webm', 2, '265115', 43, now() - interval '320280 seconds'),
  ('a74d3919-fdb3-4533-b04e-153bfeb8a314', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '38981efb-5d1f-40f5-b1a0-5420a38ccf31', 'Tempo check (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/38981efb-5d1f-40f5-b1a0-5420a38ccf31/a74d3919-fdb3-4533-b04e-153bfeb8a314.webm', 3, '1258358', 101, now() - interval '329693 seconds'),
  ('31508b7c-b6ce-4566-9102-92feba78afa4', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '38981efb-5d1f-40f5-b1a0-5420a38ccf31', 'Tempo check (Take 4)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/38981efb-5d1f-40f5-b1a0-5420a38ccf31/31508b7c-b6ce-4566-9102-92feba78afa4.webm', 4, '3640031', 106, now() - interval '104858 seconds'),
  ('9856498e-21dd-4b40-afc4-632ad307863b', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '3c75d2f0-7e1e-4bd4-af0e-3a44e479a4b9', 'Vocal guide (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/3c75d2f0-7e1e-4bd4-af0e-3a44e479a4b9/9856498e-21dd-4b40-afc4-632ad307863b.webm', 1, '3654661', 153, now() - interval '235527 seconds'),
  ('3177b902-d862-4005-8f05-9389c7af715f', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '3c75d2f0-7e1e-4bd4-af0e-3a44e479a4b9', 'Vocal guide (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/3c75d2f0-7e1e-4bd4-af0e-3a44e479a4b9/3177b902-d862-4005-8f05-9389c7af715f.webm', 2, '1475345', 178, now() - interval '108245 seconds');
INSERT INTO public.user_recordings (id, user_id, song_version_id, recording_name, storage_path, position, file_size_bytes, duration_seconds, created_at) VALUES
  ('fcfe354c-ecee-4a3e-89a5-29a1730a9a7a', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '3c75d2f0-7e1e-4bd4-af0e-3a44e479a4b9', 'Vocal guide (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/3c75d2f0-7e1e-4bd4-af0e-3a44e479a4b9/fcfe354c-ecee-4a3e-89a5-29a1730a9a7a.webm', 3, '1220800', 45, now() - interval '49851 seconds'),
  ('99d97d52-1af1-4f71-a300-88f7a183e63f', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '3c75d2f0-7e1e-4bd4-af0e-3a44e479a4b9', 'Vocal guide (Take 4)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/3c75d2f0-7e1e-4bd4-af0e-3a44e479a4b9/99d97d52-1af1-4f71-a300-88f7a183e63f.webm', 4, '3077605', 174, now() - interval '524417 seconds'),
  ('3d684647-2d56-4256-a2be-934b1c81ce63', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '3c75d2f0-7e1e-4bd4-af0e-3a44e479a4b9', 'Vocal guide (Take 5)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/3c75d2f0-7e1e-4bd4-af0e-3a44e479a4b9/3d684647-2d56-4256-a2be-934b1c81ce63.webm', 5, '378620', 105, now() - interval '340737 seconds'),
  ('d95cf598-15c8-4214-b4f5-55f4a83be872', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '3e57e493-c323-450b-968f-7232a20953c9', 'Vocal guide', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/3e57e493-c323-450b-968f-7232a20953c9/d95cf598-15c8-4214-b4f5-55f4a83be872.webm', 1, '3960062', 146, now() - interval '460982 seconds'),
  ('8d8d4635-a4c2-46cb-adfe-10bbdf72bc0d', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '3fabd74f-f59e-4acf-a41d-5c87439fed4f', 'First Take (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/3fabd74f-f59e-4acf-a41d-5c87439fed4f/8d8d4635-a4c2-46cb-adfe-10bbdf72bc0d.webm', 1, '2928070', 182, now() - interval '479556 seconds'),
  ('68376b0c-5dc3-4d86-82f6-6f66cb2068e0', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '3fabd74f-f59e-4acf-a41d-5c87439fed4f', 'First Take (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/3fabd74f-f59e-4acf-a41d-5c87439fed4f/68376b0c-5dc3-4d86-82f6-6f66cb2068e0.webm', 2, '2697982', 192, now() - interval '427680 seconds'),
  ('226dfda2-0c0f-4c20-a615-4a55b553aa8f', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '3fabd74f-f59e-4acf-a41d-5c87439fed4f', 'First Take (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/3fabd74f-f59e-4acf-a41d-5c87439fed4f/226dfda2-0c0f-4c20-a615-4a55b553aa8f.webm', 3, '2844788', 26, now() - interval '115181 seconds'),
  ('e83fe731-4b32-4fc1-ae99-e3d9e5facb67', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '3fabd74f-f59e-4acf-a41d-5c87439fed4f', 'First Take (Take 4)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/3fabd74f-f59e-4acf-a41d-5c87439fed4f/e83fe731-4b32-4fc1-ae99-e3d9e5facb67.webm', 4, '2390579', 114, now() - interval '100274 seconds'),
  ('3e011b53-52b5-425c-aec8-a46d9769dd4f', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '3fabd74f-f59e-4acf-a41d-5c87439fed4f', 'First Take (Take 5)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/3fabd74f-f59e-4acf-a41d-5c87439fed4f/3e011b53-52b5-425c-aec8-a46d9769dd4f.webm', 5, '884512', 165, now() - interval '470036 seconds'),
  ('fe301b6e-fd6b-4c0d-ada5-c75b301240f6', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '3fd208f2-4235-4642-be97-5dcff182b7d6', 'First Take', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/3fd208f2-4235-4642-be97-5dcff182b7d6/fe301b6e-fd6b-4c0d-ada5-c75b301240f6.webm', 1, '1724167', 34, now() - interval '59101 seconds'),
  ('98a535ca-b1cc-497e-ac3f-0baf7f0f48b5', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '4222d093-b702-467b-bafd-2184ea22354b', 'Acoustic draft (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/4222d093-b702-467b-bafd-2184ea22354b/98a535ca-b1cc-497e-ac3f-0baf7f0f48b5.webm', 1, '2476613', 38, now() - interval '13438 seconds'),
  ('d46d498e-a04d-4af8-82f1-b33af051ba40', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '4222d093-b702-467b-bafd-2184ea22354b', 'Acoustic draft (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/4222d093-b702-467b-bafd-2184ea22354b/d46d498e-a04d-4af8-82f1-b33af051ba40.webm', 2, '1045095', 109, now() - interval '473800 seconds'),
  ('bd09ef09-b3ff-4e01-acd5-6fad5cbed81e', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '4222d093-b702-467b-bafd-2184ea22354b', 'Acoustic draft (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/4222d093-b702-467b-bafd-2184ea22354b/bd09ef09-b3ff-4e01-acd5-6fad5cbed81e.webm', 3, '1571765', 150, now() - interval '30806 seconds'),
  ('8686612e-b176-4f3d-a565-440285325363', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '4264eff5-d21d-4f98-b9eb-c7d9d1a1dfda', 'Full run-through 1', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/4264eff5-d21d-4f98-b9eb-c7d9d1a1dfda/8686612e-b176-4f3d-a565-440285325363.webm', 1, '3725122', 147, now() - interval '510275 seconds'),
  ('01a7a69d-68d9-45af-8cc9-46f335754ef6', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '4264eff5-d21d-4f98-b9eb-c7d9d1a1dfda', 'Full run-through 2', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/4264eff5-d21d-4f98-b9eb-c7d9d1a1dfda/01a7a69d-68d9-45af-8cc9-46f335754ef6.webm', 2, '2667485', 93, now() - interval '127661 seconds'),
  ('136f663e-21b5-4687-a6e9-b03f9d19de5b', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '4279508e-401e-4242-998e-0347fed35b34', 'Vocal guide (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/4279508e-401e-4242-998e-0347fed35b34/136f663e-21b5-4687-a6e9-b03f9d19de5b.webm', 1, '1657313', 135, now() - interval '345707 seconds'),
  ('bac38534-56d2-4d3f-a4f3-e6b67d8bf947', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '4279508e-401e-4242-998e-0347fed35b34', 'Vocal guide (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/4279508e-401e-4242-998e-0347fed35b34/bac38534-56d2-4d3f-a4f3-e6b67d8bf947.webm', 2, '2098724', 114, now() - interval '449305 seconds'),
  ('bfa87a4e-1267-4861-88da-3dc06d47d4a1', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '4279508e-401e-4242-998e-0347fed35b34', 'Vocal guide (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/4279508e-401e-4242-998e-0347fed35b34/bfa87a4e-1267-4861-88da-3dc06d47d4a1.webm', 3, '1305268', 69, now() - interval '550686 seconds'),
  ('6dcf8845-bebc-47d2-a341-90a32acb21be', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '4279508e-401e-4242-998e-0347fed35b34', 'Vocal guide (Take 4)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/4279508e-401e-4242-998e-0347fed35b34/6dcf8845-bebc-47d2-a341-90a32acb21be.webm', 4, '2002821', 67, now() - interval '243880 seconds'),
  ('146d3126-a262-4d99-97c6-6cc03e5d2cf1', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '4279508e-401e-4242-998e-0347fed35b34', 'Vocal guide (Take 5)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/4279508e-401e-4242-998e-0347fed35b34/146d3126-a262-4d99-97c6-6cc03e5d2cf1.webm', 5, '1298082', 44, now() - interval '585576 seconds'),
  ('2803d433-4908-4530-94be-b902c9409743', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '475ea880-d487-4585-bb65-850e3acb548c', 'Slow practice', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/475ea880-d487-4585-bb65-850e3acb548c/2803d433-4908-4530-94be-b902c9409743.wav', 1, '3184091', 31, now() - interval '39496 seconds'),
  ('d63131c9-18e0-41d6-8c4f-b1237a9546c1', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '4776bbac-1a59-4a46-8c20-435e748212fd', 'Practice Session (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/4776bbac-1a59-4a46-8c20-435e748212fd/d63131c9-18e0-41d6-8c4f-b1237a9546c1.webm', 1, '1838975', 185, now() - interval '430689 seconds'),
  ('8b6c3466-c768-4c58-a574-af57cbb8f1eb', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '4776bbac-1a59-4a46-8c20-435e748212fd', 'Practice Session (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/4776bbac-1a59-4a46-8c20-435e748212fd/8b6c3466-c768-4c58-a574-af57cbb8f1eb.webm', 2, '2654531', 58, now() - interval '611800 seconds'),
  ('21d17158-a5f6-4e81-9f12-22d813bb18eb', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '4776bbac-1a59-4a46-8c20-435e748212fd', 'Practice Session (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/4776bbac-1a59-4a46-8c20-435e748212fd/21d17158-a5f6-4e81-9f12-22d813bb18eb.webm', 3, '2768451', 164, now() - interval '592556 seconds'),
  ('235b2dda-8ac5-4fb5-8bb4-4133874dca08', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '4776bbac-1a59-4a46-8c20-435e748212fd', 'Practice Session (Take 4)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/4776bbac-1a59-4a46-8c20-435e748212fd/235b2dda-8ac5-4fb5-8bb4-4133874dca08.webm', 4, '1257753', 42, now() - interval '392389 seconds'),
  ('4511dece-6810-42ad-9d44-21e7e865d564', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '479ba299-3a05-4bdd-a672-63c0334a9f63', 'Tempo check (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/479ba299-3a05-4bdd-a672-63c0334a9f63/4511dece-6810-42ad-9d44-21e7e865d564.webm', 1, '2898503', 171, now() - interval '277935 seconds'),
  ('9f618a7f-9656-4309-9a33-2b062f04e5ae', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '479ba299-3a05-4bdd-a672-63c0334a9f63', 'Tempo check (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/479ba299-3a05-4bdd-a672-63c0334a9f63/9f618a7f-9656-4309-9a33-2b062f04e5ae.webm', 2, '684377', 138, now() - interval '85555 seconds'),
  ('716331e1-3e32-48fc-b79b-b4bafd9b150a', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '49eb9846-9636-4c6a-b8ae-55e5790cf0d9', 'Practice Session (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/49eb9846-9636-4c6a-b8ae-55e5790cf0d9/716331e1-3e32-48fc-b79b-b4bafd9b150a.webm', 1, '1459661', 112, now() - interval '381265 seconds'),
  ('63bc4e78-208a-44c8-8473-eeabe6c71f57', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '49eb9846-9636-4c6a-b8ae-55e5790cf0d9', 'Practice Session (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/49eb9846-9636-4c6a-b8ae-55e5790cf0d9/63bc4e78-208a-44c8-8473-eeabe6c71f57.webm', 2, '1336297', 133, now() - interval '171750 seconds'),
  ('ae2e5373-502a-450b-a9d8-70a481fd4a2f', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '49eb9846-9636-4c6a-b8ae-55e5790cf0d9', 'Practice Session (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/49eb9846-9636-4c6a-b8ae-55e5790cf0d9/ae2e5373-502a-450b-a9d8-70a481fd4a2f.webm', 3, '1172914', 183, now() - interval '352736 seconds'),
  ('6dc263c8-8333-4a51-b445-e5217d45bd86', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '49eb9846-9636-4c6a-b8ae-55e5790cf0d9', 'Practice Session (Take 4)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/49eb9846-9636-4c6a-b8ae-55e5790cf0d9/6dc263c8-8333-4a51-b445-e5217d45bd86.webm', 4, '1857669', 62, now() - interval '389017 seconds'),
  ('4d7edf8d-e312-4f70-a3ea-ae9f7cfa74a6', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '49eb9846-9636-4c6a-b8ae-55e5790cf0d9', 'Practice Session (Take 5)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/49eb9846-9636-4c6a-b8ae-55e5790cf0d9/4d7edf8d-e312-4f70-a3ea-ae9f7cfa74a6.webm', 5, '1897078', 164, now() - interval '127345 seconds'),
  ('94304131-3828-4b5e-9fbd-3dba8e4e236d', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '49fe7bbd-6bfa-497b-912e-f75bb701c94e', 'Slow practice (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/49fe7bbd-6bfa-497b-912e-f75bb701c94e/94304131-3828-4b5e-9fbd-3dba8e4e236d.webm', 1, '3802189', 45, now() - interval '370081 seconds'),
  ('251dcfd3-278d-4083-b959-0bc78923e41e', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '49fe7bbd-6bfa-497b-912e-f75bb701c94e', 'Slow practice (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/49fe7bbd-6bfa-497b-912e-f75bb701c94e/251dcfd3-278d-4083-b959-0bc78923e41e.webm', 2, '1244148', 174, now() - interval '71041 seconds'),
  ('96281f08-6d00-4401-8b0f-9ea754685055', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '4a981803-09dd-4887-a30b-4dbeeac224d1', 'First Take (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/4a981803-09dd-4887-a30b-4dbeeac224d1/96281f08-6d00-4401-8b0f-9ea754685055.wav', 1, '1777369', 173, now() - interval '119136 seconds'),
  ('0ecddf64-291d-4ea4-ad00-28218b1264d0', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '4a981803-09dd-4887-a30b-4dbeeac224d1', 'First Take (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/4a981803-09dd-4887-a30b-4dbeeac224d1/0ecddf64-291d-4ea4-ad00-28218b1264d0.wav', 2, '3699458', 58, now() - interval '78988 seconds'),
  ('d1266de7-f8df-4d37-a993-e8449b79cda1', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '4dee3cb0-5d58-4c29-a0e1-b4c7423b5e50', 'Tempo check (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/4dee3cb0-5d58-4c29-a0e1-b4c7423b5e50/d1266de7-f8df-4d37-a993-e8449b79cda1.webm', 1, '3526019', 132, now() - interval '335136 seconds'),
  ('d36395f3-9b96-46a2-841a-ae4123b1fad5', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '4dee3cb0-5d58-4c29-a0e1-b4c7423b5e50', 'Tempo check (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/4dee3cb0-5d58-4c29-a0e1-b4c7423b5e50/d36395f3-9b96-46a2-841a-ae4123b1fad5.webm', 2, '1011901', 29, now() - interval '408999 seconds'),
  ('e55cdce1-a1a6-4a1f-ad09-d6c9ed0efb15', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '4e8d152c-56fb-4833-8fa8-41f2851c4355', 'Acoustic draft (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/4e8d152c-56fb-4833-8fa8-41f2851c4355/e55cdce1-a1a6-4a1f-ad09-d6c9ed0efb15.webm', 1, '2070125', 32, now() - interval '237513 seconds'),
  ('9dff6780-a2bc-4574-bf5a-813ef1c55359', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '4e8d152c-56fb-4833-8fa8-41f2851c4355', 'Acoustic draft (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/4e8d152c-56fb-4833-8fa8-41f2851c4355/9dff6780-a2bc-4574-bf5a-813ef1c55359.webm', 2, '788946', 143, now() - interval '218524 seconds'),
  ('d2b75474-884a-4f4f-be7b-e7e76c9492dd', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '4e8d152c-56fb-4833-8fa8-41f2851c4355', 'Acoustic draft (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/4e8d152c-56fb-4833-8fa8-41f2851c4355/d2b75474-884a-4f4f-be7b-e7e76c9492dd.webm', 3, '1013905', 141, now() - interval '77590 seconds'),
  ('69e05583-c927-4919-b354-b3653662bd6c', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '51295686-70d6-4d25-acb7-943911e10833', 'Practice Session (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/51295686-70d6-4d25-acb7-943911e10833/69e05583-c927-4919-b354-b3653662bd6c.webm', 1, '700186', 149, now() - interval '567339 seconds'),
  ('ad7ebba9-02b6-48c4-aedb-64f8f3060b0a', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '51295686-70d6-4d25-acb7-943911e10833', 'Practice Session (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/51295686-70d6-4d25-acb7-943911e10833/ad7ebba9-02b6-48c4-aedb-64f8f3060b0a.webm', 2, '2136233', 94, now() - interval '378453 seconds'),
  ('97a6daeb-df85-4ce6-8f3c-157e565f80bb', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '51295686-70d6-4d25-acb7-943911e10833', 'Practice Session (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/51295686-70d6-4d25-acb7-943911e10833/97a6daeb-df85-4ce6-8f3c-157e565f80bb.webm', 3, '2465280', 28, now() - interval '49487 seconds'),
  ('93bbe41c-e1e7-47d0-8870-efd36cd06639', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '51295686-70d6-4d25-acb7-943911e10833', 'Practice Session (Take 4)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/51295686-70d6-4d25-acb7-943911e10833/93bbe41c-e1e7-47d0-8870-efd36cd06639.webm', 4, '1653973', 151, now() - interval '174270 seconds'),
  ('711c8356-4c28-4959-b96f-3371fe530499', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '51295686-70d6-4d25-acb7-943911e10833', 'Practice Session (Take 5)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/51295686-70d6-4d25-acb7-943911e10833/711c8356-4c28-4959-b96f-3371fe530499.webm', 5, '1909608', 146, now() - interval '317999 seconds'),
  ('28be1e87-a9f2-47da-84ee-4535e34fec4c', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '5147e181-e2e5-46ec-9bd6-fd53ad36517e', 'Vocal guide (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/5147e181-e2e5-46ec-9bd6-fd53ad36517e/28be1e87-a9f2-47da-84ee-4535e34fec4c.webm', 1, '3033168', 107, now() - interval '411383 seconds'),
  ('8c747d14-d694-4df4-a402-db3befee84de', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '5147e181-e2e5-46ec-9bd6-fd53ad36517e', 'Vocal guide (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/5147e181-e2e5-46ec-9bd6-fd53ad36517e/8c747d14-d694-4df4-a402-db3befee84de.webm', 2, '3485473', 150, now() - interval '285447 seconds'),
  ('28e1f56c-b553-4f4d-b52c-62f3994d4644', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '5147e181-e2e5-46ec-9bd6-fd53ad36517e', 'Vocal guide (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/5147e181-e2e5-46ec-9bd6-fd53ad36517e/28e1f56c-b553-4f4d-b52c-62f3994d4644.webm', 3, '2786134', 53, now() - interval '337232 seconds'),
  ('c1ac98d2-8aea-4ff9-ac8b-3946766c2f65', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '52cbe2a9-eb00-40a0-845b-e648f0fbeb54', 'Vocal guide', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/52cbe2a9-eb00-40a0-845b-e648f0fbeb54/c1ac98d2-8aea-4ff9-ac8b-3946766c2f65.wav', 1, '3104415', 105, now() - interval '76318 seconds');
INSERT INTO public.user_recordings (id, user_id, song_version_id, recording_name, storage_path, position, file_size_bytes, duration_seconds, created_at) VALUES
  ('a1059810-9cc1-4b8b-8694-af2715197c8a', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '53efb010-d0ae-4e7e-b8ac-0f1948808a70', 'Full run-through', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12/53efb010-d0ae-4e7e-b8ac-0f1948808a70/a1059810-9cc1-4b8b-8694-af2715197c8a.webm', 1, '3079356', 103, now() - interval '38752 seconds'),
  ('8d405a7b-9340-4286-86a5-1ef9080330d5', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '5663ee1b-17b4-4254-ad9d-110d49df4fcd', 'Practice Session', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/5663ee1b-17b4-4254-ad9d-110d49df4fcd/8d405a7b-9340-4286-86a5-1ef9080330d5.webm', 1, '2134381', 107, now() - interval '578759 seconds'),
  ('5c728f01-b1df-4c16-b55e-7be1c2499cb2', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '56eb264e-210c-4125-999c-9622016ed1b9', 'Full run-through (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/56eb264e-210c-4125-999c-9622016ed1b9/5c728f01-b1df-4c16-b55e-7be1c2499cb2.webm', 1, '1085097', 112, now() - interval '79770 seconds'),
  ('28d41031-af2f-4eca-8924-bae3ecb3ae96', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '56eb264e-210c-4125-999c-9622016ed1b9', 'Full run-through (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/56eb264e-210c-4125-999c-9622016ed1b9/28d41031-af2f-4eca-8924-bae3ecb3ae96.webm', 2, '1621984', 158, now() - interval '76807 seconds'),
  ('333a3dd7-bbfc-43bd-843b-8eda20a22e73', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '56eb264e-210c-4125-999c-9622016ed1b9', 'Full run-through (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/56eb264e-210c-4125-999c-9622016ed1b9/333a3dd7-bbfc-43bd-843b-8eda20a22e73.webm', 3, '216611', 27, now() - interval '61190 seconds'),
  ('c59a8fe5-e728-43b8-a057-64111c2c4db4', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '593f81b5-0b32-4094-8373-9f6e934c90d5', 'Tempo check', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/593f81b5-0b32-4094-8373-9f6e934c90d5/c59a8fe5-e728-43b8-a057-64111c2c4db4.webm', 1, '1451591', 189, now() - interval '249870 seconds'),
  ('226ba0de-5d0a-4ce0-b5af-5a4099d0e409', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '5ae584f4-e34d-4233-8303-211ace3306e2', 'Late Night run (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/5ae584f4-e34d-4233-8303-211ace3306e2/226ba0de-5d0a-4ce0-b5af-5a4099d0e409.webm', 1, '2140536', 29, now() - interval '495114 seconds'),
  ('1798666d-fa37-45bd-ab0e-397dc874a527', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '5ae584f4-e34d-4233-8303-211ace3306e2', 'Late Night run (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/5ae584f4-e34d-4233-8303-211ace3306e2/1798666d-fa37-45bd-ab0e-397dc874a527.webm', 2, '1177282', 187, now() - interval '383290 seconds'),
  ('9f4e16fc-0ea8-4788-9bf3-a807c1a4d527', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '5ae584f4-e34d-4233-8303-211ace3306e2', 'Late Night run (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/5ae584f4-e34d-4233-8303-211ace3306e2/9f4e16fc-0ea8-4788-9bf3-a807c1a4d527.webm', 3, '1775022', 139, now() - interval '372307 seconds'),
  ('8d3cb04b-ef50-42af-8588-c305b740ce49', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '5ae584f4-e34d-4233-8303-211ace3306e2', 'Late Night run (Take 4)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/5ae584f4-e34d-4233-8303-211ace3306e2/8d3cb04b-ef50-42af-8588-c305b740ce49.webm', 4, '1261139', 133, now() - interval '362814 seconds'),
  ('5d7c4007-28c2-4b36-a126-c4745b7f0092', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '5cbd114f-9609-4232-8250-373e363dbfdd', 'Practice Session', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/5cbd114f-9609-4232-8250-373e363dbfdd/5d7c4007-28c2-4b36-a126-c4745b7f0092.webm', 1, '2481610', 138, now() - interval '26268 seconds'),
  ('7087c98a-4050-40b4-a8e1-dee4310745ec', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '5d494831-1073-4e9f-8dd0-4e8b875328ab', 'Practice Session', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/5d494831-1073-4e9f-8dd0-4e8b875328ab/7087c98a-4050-40b4-a8e1-dee4310745ec.webm', 1, '3744757', 84, now() - interval '159663 seconds'),
  ('d2b656e3-827c-42f4-a602-1d585d7016cc', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '60671c5c-00b4-467a-a5c4-c9e170c89d19', 'Full run-through (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/60671c5c-00b4-467a-a5c4-c9e170c89d19/d2b656e3-827c-42f4-a602-1d585d7016cc.webm', 1, '1089971', 38, now() - interval '206291 seconds'),
  ('238c07e7-4f1d-4309-8234-082f71e780b4', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '60671c5c-00b4-467a-a5c4-c9e170c89d19', 'Full run-through (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/60671c5c-00b4-467a-a5c4-c9e170c89d19/238c07e7-4f1d-4309-8234-082f71e780b4.webm', 2, '3703529', 127, now() - interval '472573 seconds'),
  ('4dd6c3bc-6d75-4da4-ba8b-a4dc08a4a57a', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '60671c5c-00b4-467a-a5c4-c9e170c89d19', 'Full run-through (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/60671c5c-00b4-467a-a5c4-c9e170c89d19/4dd6c3bc-6d75-4da4-ba8b-a4dc08a4a57a.webm', 3, '1508227', 124, now() - interval '351129 seconds'),
  ('9cf04d6f-739c-4e22-aaaa-6896c244ee73', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '60671c5c-00b4-467a-a5c4-c9e170c89d19', 'Full run-through (Take 4)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/60671c5c-00b4-467a-a5c4-c9e170c89d19/9cf04d6f-739c-4e22-aaaa-6896c244ee73.webm', 4, '241495', 181, now() - interval '264132 seconds'),
  ('0590f46b-089a-4161-9610-afef88eb88c4', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '60c463b2-41f3-4614-bff5-34d43dca5ce6', 'Tempo check (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/60c463b2-41f3-4614-bff5-34d43dca5ce6/0590f46b-089a-4161-9610-afef88eb88c4.webm', 1, '3844731', 119, now() - interval '183644 seconds'),
  ('61f750e0-d633-4e4e-8c06-2391f0757467', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '60c463b2-41f3-4614-bff5-34d43dca5ce6', 'Tempo check (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/60c463b2-41f3-4614-bff5-34d43dca5ce6/61f750e0-d633-4e4e-8c06-2391f0757467.webm', 2, '718517', 167, now() - interval '136999 seconds'),
  ('e4d34f14-49af-4db8-a930-917009c3c053', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '60c463b2-41f3-4614-bff5-34d43dca5ce6', 'Tempo check (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/60c463b2-41f3-4614-bff5-34d43dca5ce6/e4d34f14-49af-4db8-a930-917009c3c053.webm', 3, '3245847', 136, now() - interval '36929 seconds'),
  ('bbcef2e6-8bda-44d2-a8bf-6d615daab33a', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '60c463b2-41f3-4614-bff5-34d43dca5ce6', 'Tempo check (Take 4)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/60c463b2-41f3-4614-bff5-34d43dca5ce6/bbcef2e6-8bda-44d2-a8bf-6d615daab33a.webm', 4, '1470339', 163, now() - interval '263675 seconds'),
  ('6f2fe96d-7d45-4e4a-9d1a-dbe9f4c059e3', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '62b50fa0-8147-4149-84f1-cc52ba0d58b8', 'Vocal guide (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/62b50fa0-8147-4149-84f1-cc52ba0d58b8/6f2fe96d-7d45-4e4a-9d1a-dbe9f4c059e3.webm', 1, '646217', 166, now() - interval '196781 seconds'),
  ('a941e8ec-23f5-42b2-8de7-cc00665f26c9', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '62b50fa0-8147-4149-84f1-cc52ba0d58b8', 'Vocal guide (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/62b50fa0-8147-4149-84f1-cc52ba0d58b8/a941e8ec-23f5-42b2-8de7-cc00665f26c9.webm', 2, '3617807', 73, now() - interval '165453 seconds'),
  ('9be5e782-d32f-4626-ba2e-4197822df771', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '62b50fa0-8147-4149-84f1-cc52ba0d58b8', 'Vocal guide (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/62b50fa0-8147-4149-84f1-cc52ba0d58b8/9be5e782-d32f-4626-ba2e-4197822df771.webm', 3, '1359211', 111, now() - interval '393464 seconds'),
  ('12cb67fa-88e8-44d6-b302-fef67c0a7916', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '63d21047-05c4-4cbf-b550-25b24e0a75fc', 'Vocal guide (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/63d21047-05c4-4cbf-b550-25b24e0a75fc/12cb67fa-88e8-44d6-b302-fef67c0a7916.webm', 1, '2843960', 133, now() - interval '123188 seconds'),
  ('bebc5bbb-0e94-4667-8864-82cc86ce2d75', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '63d21047-05c4-4cbf-b550-25b24e0a75fc', 'Vocal guide (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/63d21047-05c4-4cbf-b550-25b24e0a75fc/bebc5bbb-0e94-4667-8864-82cc86ce2d75.webm', 2, '1536029', 88, now() - interval '536817 seconds'),
  ('dc54e043-a2f6-4aab-8619-93f3c6e8f29e', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '63d21047-05c4-4cbf-b550-25b24e0a75fc', 'Vocal guide (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/63d21047-05c4-4cbf-b550-25b24e0a75fc/dc54e043-a2f6-4aab-8619-93f3c6e8f29e.webm', 3, '2660798', 181, now() - interval '460314 seconds'),
  ('c4c0a418-17c3-4312-802c-d10bb803d4b5', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '63d21047-05c4-4cbf-b550-25b24e0a75fc', 'Vocal guide (Take 4)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/63d21047-05c4-4cbf-b550-25b24e0a75fc/c4c0a418-17c3-4312-802c-d10bb803d4b5.webm', 4, '2229401', 194, now() - interval '251192 seconds'),
  ('96329828-55db-49ae-bac2-703a40b715fb', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '6548c2cf-697c-401b-9dea-834923c71ba2', 'Late Night run (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/6548c2cf-697c-401b-9dea-834923c71ba2/96329828-55db-49ae-bac2-703a40b715fb.webm', 1, '2462645', 102, now() - interval '467053 seconds'),
  ('40e4d8f8-b2d9-4a59-a1b1-c61d5daba3ce', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '6548c2cf-697c-401b-9dea-834923c71ba2', 'Late Night run (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/6548c2cf-697c-401b-9dea-834923c71ba2/40e4d8f8-b2d9-4a59-a1b1-c61d5daba3ce.webm', 2, '1108565', 91, now() - interval '270601 seconds'),
  ('f8ca13dd-2eeb-4ac0-9c3d-0597d007e32e', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '66938eb0-d1fb-4969-b892-6bafa3e188f0', 'First Take', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/66938eb0-d1fb-4969-b892-6bafa3e188f0/f8ca13dd-2eeb-4ac0-9c3d-0597d007e32e.webm', 1, '2039769', 64, now() - interval '466064 seconds'),
  ('010aeab9-03ab-4b35-9f59-902a1289fbf4', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '6870d0b0-7993-4524-a808-6df8934a61c8', 'Full run-through', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12/6870d0b0-7993-4524-a808-6df8934a61c8/010aeab9-03ab-4b35-9f59-902a1289fbf4.webm', 1, '2114581', 132, now() - interval '49904 seconds'),
  ('5ba0b055-2082-482a-809a-8ba8f1f4c5b6', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '69af0633-fc1a-41cf-8179-5349fea0f2e7', 'Tempo check', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/69af0633-fc1a-41cf-8179-5349fea0f2e7/5ba0b055-2082-482a-809a-8ba8f1f4c5b6.webm', 1, '2312971', 57, now() - interval '560857 seconds'),
  ('7a389215-fdfe-4062-ab5c-09ef9edc8b78', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '69eb24dc-eb3a-457c-bceb-2c6f94b98127', 'Practice Session (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/69eb24dc-eb3a-457c-bceb-2c6f94b98127/7a389215-fdfe-4062-ab5c-09ef9edc8b78.webm', 1, '2091035', 105, now() - interval '165272 seconds'),
  ('970098e9-73b5-4330-af87-489cb80d004c', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '69eb24dc-eb3a-457c-bceb-2c6f94b98127', 'Practice Session (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/69eb24dc-eb3a-457c-bceb-2c6f94b98127/970098e9-73b5-4330-af87-489cb80d004c.webm', 2, '3603350', 176, now() - interval '383245 seconds'),
  ('7a7270df-e747-4502-8f57-b8f7ef2f43a6', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '69eb24dc-eb3a-457c-bceb-2c6f94b98127', 'Practice Session (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/69eb24dc-eb3a-457c-bceb-2c6f94b98127/7a7270df-e747-4502-8f57-b8f7ef2f43a6.webm', 3, '3847697', 35, now() - interval '56582 seconds'),
  ('f4a5c5b1-7f5d-4246-a6be-e938eb7b8741', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '69eb24dc-eb3a-457c-bceb-2c6f94b98127', 'Practice Session (Take 4)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/69eb24dc-eb3a-457c-bceb-2c6f94b98127/f4a5c5b1-7f5d-4246-a6be-e938eb7b8741.webm', 4, '1615787', 55, now() - interval '513543 seconds'),
  ('28c6d0d0-e814-4a6a-b47e-b7419fa67885', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '69eb24dc-eb3a-457c-bceb-2c6f94b98127', 'Practice Session (Take 5)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/69eb24dc-eb3a-457c-bceb-2c6f94b98127/28c6d0d0-e814-4a6a-b47e-b7419fa67885.webm', 5, '325878', 67, now() - interval '577847 seconds'),
  ('ddfe48b0-8e1f-4909-97e2-e1941b30a610', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '6aa05344-0cac-4595-86e2-333a0c3c7ef8', 'Full run-through', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/6aa05344-0cac-4595-86e2-333a0c3c7ef8/ddfe48b0-8e1f-4909-97e2-e1941b30a610.wav', 1, '310753', 77, now() - interval '329616 seconds'),
  ('539a4f21-0da6-4c94-8d01-f7867ed95222', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '6b117e97-cef5-42f5-acaf-4e47b8c1ce33', 'Acoustic draft (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/6b117e97-cef5-42f5-acaf-4e47b8c1ce33/539a4f21-0da6-4c94-8d01-f7867ed95222.wav', 1, '2814457', 63, now() - interval '376062 seconds'),
  ('06070c69-711d-445b-9fc0-ca4775f9207c', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '6b117e97-cef5-42f5-acaf-4e47b8c1ce33', 'Acoustic draft (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/6b117e97-cef5-42f5-acaf-4e47b8c1ce33/06070c69-711d-445b-9fc0-ca4775f9207c.wav', 2, '2636740', 160, now() - interval '62819 seconds'),
  ('81b1e4bb-4bb0-425f-95cb-e5cc1c3d0a8e', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '6b117e97-cef5-42f5-acaf-4e47b8c1ce33', 'Acoustic draft (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/6b117e97-cef5-42f5-acaf-4e47b8c1ce33/81b1e4bb-4bb0-425f-95cb-e5cc1c3d0a8e.wav', 3, '356275', 188, now() - interval '605111 seconds'),
  ('ec47ee73-e196-47e5-ab16-a3f2d735cb37', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '6b117e97-cef5-42f5-acaf-4e47b8c1ce33', 'Acoustic draft (Take 4)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/6b117e97-cef5-42f5-acaf-4e47b8c1ce33/ec47ee73-e196-47e5-ab16-a3f2d735cb37.wav', 4, '1250055', 59, now() - interval '31578 seconds'),
  ('372484d5-4411-45b7-8e70-293b2cdbec95', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '6b117e97-cef5-42f5-acaf-4e47b8c1ce33', 'Acoustic draft (Take 5)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/6b117e97-cef5-42f5-acaf-4e47b8c1ce33/372484d5-4411-45b7-8e70-293b2cdbec95.wav', 5, '2390087', 38, now() - interval '385149 seconds'),
  ('232083d8-2c32-4136-be9f-c0a630249826', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '6b781fe2-c66f-4233-8277-0901a685f67a', 'Tempo check (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/6b781fe2-c66f-4233-8277-0901a685f67a/232083d8-2c32-4136-be9f-c0a630249826.webm', 1, '1047416', 36, now() - interval '100206 seconds'),
  ('a7f4fa21-abdd-4547-a0d2-e7af00fb329f', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '6b781fe2-c66f-4233-8277-0901a685f67a', 'Tempo check (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/6b781fe2-c66f-4233-8277-0901a685f67a/a7f4fa21-abdd-4547-a0d2-e7af00fb329f.webm', 2, '2685983', 98, now() - interval '594263 seconds'),
  ('88273e95-e954-4c90-8416-7811fa137ae5', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '6c67d1c5-f3b6-4ff2-ba86-174b058f6e3b', 'First Take', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/6c67d1c5-f3b6-4ff2-ba86-174b058f6e3b/88273e95-e954-4c90-8416-7811fa137ae5.webm', 1, '3328911', 71, now() - interval '231980 seconds'),
  ('9a114257-d343-4a25-bbb8-bcf57e921bc3', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '6d5643b3-db6a-4e00-ba8b-4c4a2a6354a0', 'Tempo check (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/6d5643b3-db6a-4e00-ba8b-4c4a2a6354a0/9a114257-d343-4a25-bbb8-bcf57e921bc3.wav', 1, '2287725', 95, now() - interval '204919 seconds'),
  ('6f5ccbe4-45c2-4447-ac53-c63c4c8e216c', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '6d5643b3-db6a-4e00-ba8b-4c4a2a6354a0', 'Tempo check (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/6d5643b3-db6a-4e00-ba8b-4c4a2a6354a0/6f5ccbe4-45c2-4447-ac53-c63c4c8e216c.wav', 2, '956143', 190, now() - interval '560060 seconds'),
  ('9d8997c0-d4ec-471d-86bc-b2c95153472a', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '6d5643b3-db6a-4e00-ba8b-4c4a2a6354a0', 'Tempo check (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/6d5643b3-db6a-4e00-ba8b-4c4a2a6354a0/9d8997c0-d4ec-471d-86bc-b2c95153472a.wav', 3, '2634496', 111, now() - interval '468177 seconds'),
  ('3263e93a-895c-4dec-978d-00f9813ebef7', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '6d5643b3-db6a-4e00-ba8b-4c4a2a6354a0', 'Tempo check (Take 4)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/6d5643b3-db6a-4e00-ba8b-4c4a2a6354a0/3263e93a-895c-4dec-978d-00f9813ebef7.wav', 4, '1968270', 80, now() - interval '577011 seconds');
INSERT INTO public.user_recordings (id, user_id, song_version_id, recording_name, storage_path, position, file_size_bytes, duration_seconds, created_at) VALUES
  ('b0976ecf-2067-4d35-8db8-417cac23842e', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '725aa42a-6b51-47fa-8b7a-18429d3c2fac', 'First Take', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12/725aa42a-6b51-47fa-8b7a-18429d3c2fac/b0976ecf-2067-4d35-8db8-417cac23842e.webm', 1, '1584045', 57, now() - interval '225071 seconds'),
  ('a809bb41-9043-41d6-86b2-55f2bc9bd620', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '73884433-a000-4341-89a2-1490866c320f', 'Late Night run (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/73884433-a000-4341-89a2-1490866c320f/a809bb41-9043-41d6-86b2-55f2bc9bd620.webm', 1, '2472084', 146, now() - interval '485909 seconds'),
  ('c9f3f048-3e49-426d-b6c6-6518d81bc022', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '73884433-a000-4341-89a2-1490866c320f', 'Late Night run (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/73884433-a000-4341-89a2-1490866c320f/c9f3f048-3e49-426d-b6c6-6518d81bc022.webm', 2, '460288', 131, now() - interval '358644 seconds'),
  ('101e87b6-3829-4c4a-bb9f-d7e0aafd6358', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '73884433-a000-4341-89a2-1490866c320f', 'Late Night run (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/73884433-a000-4341-89a2-1490866c320f/101e87b6-3829-4c4a-bb9f-d7e0aafd6358.webm', 3, '1345566', 172, now() - interval '182076 seconds'),
  ('6d474baa-7ee0-40fb-8ae5-32a928bebaef', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '73884433-a000-4341-89a2-1490866c320f', 'Late Night run (Take 4)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/73884433-a000-4341-89a2-1490866c320f/6d474baa-7ee0-40fb-8ae5-32a928bebaef.webm', 4, '554215', 103, now() - interval '205609 seconds'),
  ('9568e747-30bc-48ed-9ab6-0921edadff66', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '73884433-a000-4341-89a2-1490866c320f', 'Late Night run (Take 5)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/73884433-a000-4341-89a2-1490866c320f/9568e747-30bc-48ed-9ab6-0921edadff66.webm', 5, '1639309', 72, now() - interval '42769 seconds'),
  ('93f48212-20ec-45a1-a55a-8cb73543570e', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '74eb6b8e-3dcc-40e4-9865-ddb4c0720a16', 'Full run-through (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/74eb6b8e-3dcc-40e4-9865-ddb4c0720a16/93f48212-20ec-45a1-a55a-8cb73543570e.webm', 1, '1616170', 176, now() - interval '367556 seconds'),
  ('ca372ca5-e9de-43e2-a4eb-64a23a12efff', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '74eb6b8e-3dcc-40e4-9865-ddb4c0720a16', 'Full run-through (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/74eb6b8e-3dcc-40e4-9865-ddb4c0720a16/ca372ca5-e9de-43e2-a4eb-64a23a12efff.webm', 2, '2635370', 41, now() - interval '110333 seconds'),
  ('fdb79570-0e10-44a2-817a-519aee557317', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '74eb6b8e-3dcc-40e4-9865-ddb4c0720a16', 'Full run-through (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/74eb6b8e-3dcc-40e4-9865-ddb4c0720a16/fdb79570-0e10-44a2-817a-519aee557317.webm', 3, '3486809', 190, now() - interval '246013 seconds'),
  ('c5ad62d5-3c87-468e-bc8f-65aada5fb98f', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '780f70c3-145c-494a-b0fd-f4a64bb4104a', 'Tempo check (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/780f70c3-145c-494a-b0fd-f4a64bb4104a/c5ad62d5-3c87-468e-bc8f-65aada5fb98f.wav', 1, '678488', 58, now() - interval '508729 seconds'),
  ('8b266c56-121a-490e-8c7f-458e600865a3', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '780f70c3-145c-494a-b0fd-f4a64bb4104a', 'Tempo check (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/780f70c3-145c-494a-b0fd-f4a64bb4104a/8b266c56-121a-490e-8c7f-458e600865a3.wav', 2, '2008106', 53, now() - interval '52958 seconds'),
  ('8339da0a-d460-427e-a761-5c0d2c70ebfd', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '791128f0-14c0-4a1a-a1b3-e68e8d2c24a6', 'Acoustic draft', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/791128f0-14c0-4a1a-a1b3-e68e8d2c24a6/8339da0a-d460-427e-a761-5c0d2c70ebfd.webm', 1, '519248', 107, now() - interval '103618 seconds'),
  ('ee3b668b-c362-48a4-bf0b-9fd3836f4fcc', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '79827c68-5470-43a2-b6c2-fb3902324605', 'Acoustic draft', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/79827c68-5470-43a2-b6c2-fb3902324605/ee3b668b-c362-48a4-bf0b-9fd3836f4fcc.webm', 1, '1464249', 121, now() - interval '176475 seconds'),
  ('2197a85b-3245-4b77-8cdb-9fae8abc83ef', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '79b517f3-b88c-479c-8896-9cdd85186b09', 'Slow practice (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/79b517f3-b88c-479c-8896-9cdd85186b09/2197a85b-3245-4b77-8cdb-9fae8abc83ef.webm', 1, '2467154', 151, now() - interval '14104 seconds'),
  ('aaf04704-109a-4aef-b96d-8c7b70391154', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '79b517f3-b88c-479c-8896-9cdd85186b09', 'Slow practice (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/79b517f3-b88c-479c-8896-9cdd85186b09/aaf04704-109a-4aef-b96d-8c7b70391154.webm', 2, '3214407', 27, now() - interval '558492 seconds'),
  ('0c32e76b-14cd-4b1f-8f4d-5d46832a1a44', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '79b517f3-b88c-479c-8896-9cdd85186b09', 'Slow practice (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/79b517f3-b88c-479c-8896-9cdd85186b09/0c32e76b-14cd-4b1f-8f4d-5d46832a1a44.webm', 3, '2423657', 140, now() - interval '74633 seconds'),
  ('ed15ab57-e88a-45db-900f-c6126237fe17', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '79b517f3-b88c-479c-8896-9cdd85186b09', 'Slow practice (Take 4)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/79b517f3-b88c-479c-8896-9cdd85186b09/ed15ab57-e88a-45db-900f-c6126237fe17.webm', 4, '3444110', 157, now() - interval '111018 seconds'),
  ('0669b7a8-b623-4c00-9883-4e4691407711', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '7a0c9f36-74a0-4689-8507-e38f25dea8d0', 'Tempo check (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/7a0c9f36-74a0-4689-8507-e38f25dea8d0/0669b7a8-b623-4c00-9883-4e4691407711.wav', 1, '2731342', 77, now() - interval '212403 seconds'),
  ('2bf4f329-983b-4334-9591-273e0d2d3b11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '7a0c9f36-74a0-4689-8507-e38f25dea8d0', 'Tempo check (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/7a0c9f36-74a0-4689-8507-e38f25dea8d0/2bf4f329-983b-4334-9591-273e0d2d3b11.wav', 2, '2553413', 49, now() - interval '351842 seconds'),
  ('2daeab42-8204-4398-a9ed-2bc16519a90f', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '7a491b9b-f671-4bdd-a8af-82095e79daa9', 'Acoustic draft (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/7a491b9b-f671-4bdd-a8af-82095e79daa9/2daeab42-8204-4398-a9ed-2bc16519a90f.webm', 1, '2966060', 53, now() - interval '299180 seconds'),
  ('a25e8e2a-c2ce-4668-95bc-20c4d86d3870', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '7a491b9b-f671-4bdd-a8af-82095e79daa9', 'Acoustic draft (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/7a491b9b-f671-4bdd-a8af-82095e79daa9/a25e8e2a-c2ce-4668-95bc-20c4d86d3870.webm', 2, '1781294', 27, now() - interval '566964 seconds'),
  ('3fffdfb7-2ad7-4725-9a8b-21f881d40d2d', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '7a491b9b-f671-4bdd-a8af-82095e79daa9', 'Acoustic draft (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/7a491b9b-f671-4bdd-a8af-82095e79daa9/3fffdfb7-2ad7-4725-9a8b-21f881d40d2d.webm', 3, '464671', 91, now() - interval '285310 seconds'),
  ('a3e0addd-5ca0-470c-a6dc-73bfe4994161', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '7e420c06-14a0-46ab-8bd1-71829151b885', 'Late Night run (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/7e420c06-14a0-46ab-8bd1-71829151b885/a3e0addd-5ca0-470c-a6dc-73bfe4994161.webm', 1, '2055257', 135, now() - interval '155795 seconds'),
  ('6d824bca-3257-4a6e-8637-f7c19f28332e', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '7e420c06-14a0-46ab-8bd1-71829151b885', 'Late Night run (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/7e420c06-14a0-46ab-8bd1-71829151b885/6d824bca-3257-4a6e-8637-f7c19f28332e.webm', 2, '2730736', 76, now() - interval '87393 seconds'),
  ('a9233f88-6024-4f1b-953d-ccbced7f0aaf', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '7e420c06-14a0-46ab-8bd1-71829151b885', 'Late Night run (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/7e420c06-14a0-46ab-8bd1-71829151b885/a9233f88-6024-4f1b-953d-ccbced7f0aaf.webm', 3, '513811', 87, now() - interval '558658 seconds'),
  ('37213364-72ed-484a-b369-26ffb3db6a64', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '7e420c06-14a0-46ab-8bd1-71829151b885', 'Late Night run (Take 4)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/7e420c06-14a0-46ab-8bd1-71829151b885/37213364-72ed-484a-b369-26ffb3db6a64.webm', 4, '2650210', 89, now() - interval '71622 seconds'),
  ('fd41b824-7fd5-4192-ab82-fe7290a13076', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '7e85787a-7c26-42be-8ab5-b38374efaf86', 'Full run-through (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/7e85787a-7c26-42be-8ab5-b38374efaf86/fd41b824-7fd5-4192-ab82-fe7290a13076.webm', 1, '281193', 78, now() - interval '169056 seconds'),
  ('c44e99f1-ed31-44bf-b281-7c94105fa778', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '7e85787a-7c26-42be-8ab5-b38374efaf86', 'Full run-through (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/7e85787a-7c26-42be-8ab5-b38374efaf86/c44e99f1-ed31-44bf-b281-7c94105fa778.webm', 2, '3347171', 169, now() - interval '470517 seconds'),
  ('4cc9748b-f764-40bf-91c0-2485d0c0120c', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '7e85787a-7c26-42be-8ab5-b38374efaf86', 'Full run-through (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/7e85787a-7c26-42be-8ab5-b38374efaf86/4cc9748b-f764-40bf-91c0-2485d0c0120c.webm', 3, '2796462', 177, now() - interval '258294 seconds'),
  ('cfdf4773-6e92-4489-85a6-11464300dbe7', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '80989f0b-11e2-4ec1-988c-5ebeaed85283', 'First Take (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/80989f0b-11e2-4ec1-988c-5ebeaed85283/cfdf4773-6e92-4489-85a6-11464300dbe7.webm', 1, '585540', 161, now() - interval '141786 seconds'),
  ('15f2ed49-e89b-4269-8153-f02c04025738', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '80989f0b-11e2-4ec1-988c-5ebeaed85283', 'First Take (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/80989f0b-11e2-4ec1-988c-5ebeaed85283/15f2ed49-e89b-4269-8153-f02c04025738.webm', 2, '1591989', 131, now() - interval '588294 seconds'),
  ('cda92e00-cdd1-4341-9058-40e8acee8e6e', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '80989f0b-11e2-4ec1-988c-5ebeaed85283', 'First Take (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/80989f0b-11e2-4ec1-988c-5ebeaed85283/cda92e00-cdd1-4341-9058-40e8acee8e6e.webm', 3, '1760269', 67, now() - interval '574951 seconds'),
  ('430eda9d-1f0e-448a-b6aa-7946a6e71782', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '80989f0b-11e2-4ec1-988c-5ebeaed85283', 'First Take (Take 4)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/80989f0b-11e2-4ec1-988c-5ebeaed85283/430eda9d-1f0e-448a-b6aa-7946a6e71782.webm', 4, '3000625', 166, now() - interval '484224 seconds'),
  ('70505f89-3530-4c65-9840-d08ceda53e19', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '80989f0b-11e2-4ec1-988c-5ebeaed85283', 'First Take (Take 5)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/80989f0b-11e2-4ec1-988c-5ebeaed85283/70505f89-3530-4c65-9840-d08ceda53e19.webm', 5, '1805336', 38, now() - interval '280268 seconds'),
  ('2ee18b5d-3299-4cab-aa42-258f06e2049a', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '822bc443-01c3-4a36-b6b7-58aa0e251bb7', 'Acoustic draft (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/822bc443-01c3-4a36-b6b7-58aa0e251bb7/2ee18b5d-3299-4cab-aa42-258f06e2049a.webm', 1, '501046', 86, now() - interval '466691 seconds'),
  ('efee73be-206b-4efe-bb3f-d602a68b8102', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '822bc443-01c3-4a36-b6b7-58aa0e251bb7', 'Acoustic draft (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/822bc443-01c3-4a36-b6b7-58aa0e251bb7/efee73be-206b-4efe-bb3f-d602a68b8102.webm', 2, '286037', 140, now() - interval '276813 seconds'),
  ('187e97e3-9407-4e6a-8342-bb7bc4045362', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '822bc443-01c3-4a36-b6b7-58aa0e251bb7', 'Acoustic draft (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/822bc443-01c3-4a36-b6b7-58aa0e251bb7/187e97e3-9407-4e6a-8342-bb7bc4045362.webm', 3, '2784914', 28, now() - interval '205009 seconds'),
  ('1716bee8-4b61-4948-8711-13b6d5eb69a1', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '822bc443-01c3-4a36-b6b7-58aa0e251bb7', 'Acoustic draft (Take 4)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/822bc443-01c3-4a36-b6b7-58aa0e251bb7/1716bee8-4b61-4948-8711-13b6d5eb69a1.webm', 4, '3687385', 62, now() - interval '408724 seconds'),
  ('d26fc2cd-9773-4d6d-883e-cf2d4f5d8ba0', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '84518092-efec-4c94-86d6-17c8676a357f', 'Acoustic draft', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/84518092-efec-4c94-86d6-17c8676a357f/d26fc2cd-9773-4d6d-883e-cf2d4f5d8ba0.webm', 1, '2059846', 189, now() - interval '227287 seconds'),
  ('d0ac0d2a-c6af-444a-af69-4b847f84b481', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '84a09377-371d-44b8-bc56-14aab4d14d47', 'First Take', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/84a09377-371d-44b8-bc56-14aab4d14d47/d0ac0d2a-c6af-444a-af69-4b847f84b481.webm', 1, '3789927', 165, now() - interval '11062 seconds'),
  ('7e445375-ca50-4e7d-8284-b105d38440a4', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '84f2331c-3fb8-41b7-b8c8-d7fb1b2f985f', 'Slow practice (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/84f2331c-3fb8-41b7-b8c8-d7fb1b2f985f/7e445375-ca50-4e7d-8284-b105d38440a4.webm', 1, '2286256', 63, now() - interval '564608 seconds'),
  ('20d0eb42-d554-456f-8e6a-0e482eca249d', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '84f2331c-3fb8-41b7-b8c8-d7fb1b2f985f', 'Slow practice (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/84f2331c-3fb8-41b7-b8c8-d7fb1b2f985f/20d0eb42-d554-456f-8e6a-0e482eca249d.webm', 2, '727275', 42, now() - interval '219451 seconds'),
  ('301b55da-71bc-4629-9e88-00eb6950f01d', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '84f2331c-3fb8-41b7-b8c8-d7fb1b2f985f', 'Slow practice (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/84f2331c-3fb8-41b7-b8c8-d7fb1b2f985f/301b55da-71bc-4629-9e88-00eb6950f01d.webm', 3, '1260986', 138, now() - interval '28584 seconds'),
  ('f306677c-bf85-42b0-b67a-ccf2e97b384f', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '84f2331c-3fb8-41b7-b8c8-d7fb1b2f985f', 'Slow practice (Take 4)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/84f2331c-3fb8-41b7-b8c8-d7fb1b2f985f/f306677c-bf85-42b0-b67a-ccf2e97b384f.webm', 4, '1583994', 102, now() - interval '70461 seconds'),
  ('b0deab85-0259-4385-a36b-0e294287b45e', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '84f2331c-3fb8-41b7-b8c8-d7fb1b2f985f', 'Slow practice (Take 5)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/84f2331c-3fb8-41b7-b8c8-d7fb1b2f985f/b0deab85-0259-4385-a36b-0e294287b45e.webm', 5, '1726091', 177, now() - interval '521474 seconds'),
  ('4a7f7778-fb07-4b89-9cba-f8cb83e917ee', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '85159134-2065-4090-abcd-e3cf975f889b', 'Practice Session', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/85159134-2065-4090-abcd-e3cf975f889b/4a7f7778-fb07-4b89-9cba-f8cb83e917ee.webm', 1, '3307608', 54, now() - interval '362951 seconds'),
  ('fdab4faa-3eca-4a74-a42e-5867765169c9', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '85214f42-a48b-4904-a6a1-0465f715636b', 'Tempo check (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/85214f42-a48b-4904-a6a1-0465f715636b/fdab4faa-3eca-4a74-a42e-5867765169c9.webm', 1, '1105830', 59, now() - interval '135896 seconds'),
  ('f91d6f9e-0c2d-4c23-8aa2-50a846581825', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '85214f42-a48b-4904-a6a1-0465f715636b', 'Tempo check (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/85214f42-a48b-4904-a6a1-0465f715636b/f91d6f9e-0c2d-4c23-8aa2-50a846581825.webm', 2, '3350352', 39, now() - interval '273712 seconds'),
  ('d8d6c2b4-5564-47e4-8271-e69ed36cce3b', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '85214f42-a48b-4904-a6a1-0465f715636b', 'Tempo check (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/85214f42-a48b-4904-a6a1-0465f715636b/d8d6c2b4-5564-47e4-8271-e69ed36cce3b.webm', 3, '831512', 92, now() - interval '380368 seconds'),
  ('f376ee53-a0dd-4afd-a4b3-22b5fcbd5bab', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '891b76e0-61e2-41c2-9677-a404f546932a', 'First Take (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/891b76e0-61e2-41c2-9677-a404f546932a/f376ee53-a0dd-4afd-a4b3-22b5fcbd5bab.wav', 1, '1532607', 179, now() - interval '220828 seconds');
INSERT INTO public.user_recordings (id, user_id, song_version_id, recording_name, storage_path, position, file_size_bytes, duration_seconds, created_at) VALUES
  ('8d812791-412d-4c3f-b411-d0e6ccf6e2fa', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '891b76e0-61e2-41c2-9677-a404f546932a', 'First Take (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/891b76e0-61e2-41c2-9677-a404f546932a/8d812791-412d-4c3f-b411-d0e6ccf6e2fa.wav', 2, '3729916', 60, now() - interval '86173 seconds'),
  ('2af561a3-a146-46b0-b239-4fec8e1793eb', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '891b76e0-61e2-41c2-9677-a404f546932a', 'First Take (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/891b76e0-61e2-41c2-9677-a404f546932a/2af561a3-a146-46b0-b239-4fec8e1793eb.wav', 3, '369604', 116, now() - interval '127004 seconds'),
  ('90847934-a1f7-4fea-941f-571eef4e9c0f', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '891b76e0-61e2-41c2-9677-a404f546932a', 'First Take (Take 4)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/891b76e0-61e2-41c2-9677-a404f546932a/90847934-a1f7-4fea-941f-571eef4e9c0f.wav', 4, '2922359', 50, now() - interval '491065 seconds'),
  ('62fb4f5c-fb31-4493-b436-a14a8daf31f4', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '898b6eb9-b429-42ac-a189-d98464ec7973', 'First Take (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/898b6eb9-b429-42ac-a189-d98464ec7973/62fb4f5c-fb31-4493-b436-a14a8daf31f4.wav', 1, '3190314', 43, now() - interval '404069 seconds'),
  ('9a70fb7f-dde3-4570-8007-488df992588d', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '898b6eb9-b429-42ac-a189-d98464ec7973', 'First Take (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/898b6eb9-b429-42ac-a189-d98464ec7973/9a70fb7f-dde3-4570-8007-488df992588d.wav', 2, '3390459', 157, now() - interval '610273 seconds'),
  ('f13c9d45-84b8-4df8-a53c-f07673877818', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '898b6eb9-b429-42ac-a189-d98464ec7973', 'First Take (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/898b6eb9-b429-42ac-a189-d98464ec7973/f13c9d45-84b8-4df8-a53c-f07673877818.wav', 3, '275567', 104, now() - interval '539857 seconds'),
  ('fec56072-8cf4-4113-b08c-c7d8f5ad2f6a', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '898b6eb9-b429-42ac-a189-d98464ec7973', 'First Take (Take 4)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/898b6eb9-b429-42ac-a189-d98464ec7973/fec56072-8cf4-4113-b08c-c7d8f5ad2f6a.wav', 4, '903256', 88, now() - interval '508705 seconds'),
  ('2209a53c-1c1e-406e-85c3-7c1b31d26256', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '8c175728-e81d-4234-b37f-56116c827c14', 'Late Night run', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/8c175728-e81d-4234-b37f-56116c827c14/2209a53c-1c1e-406e-85c3-7c1b31d26256.webm', 1, '2740348', 87, now() - interval '532105 seconds'),
  ('471a2cf5-c31f-4bcd-b89a-2dbe891ab060', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '8c2b8fb2-df66-4b16-a66a-3f2b4336fde4', 'Slow practice (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/8c2b8fb2-df66-4b16-a66a-3f2b4336fde4/471a2cf5-c31f-4bcd-b89a-2dbe891ab060.webm', 1, '3563466', 35, now() - interval '469890 seconds'),
  ('bd81997b-de33-485a-95e2-d826964dca02', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '8c2b8fb2-df66-4b16-a66a-3f2b4336fde4', 'Slow practice (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/8c2b8fb2-df66-4b16-a66a-3f2b4336fde4/bd81997b-de33-485a-95e2-d826964dca02.webm', 2, '2109291', 154, now() - interval '57247 seconds'),
  ('00230fec-a427-42c0-8cf9-eddac81eddd8', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '8c2b8fb2-df66-4b16-a66a-3f2b4336fde4', 'Slow practice (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/8c2b8fb2-df66-4b16-a66a-3f2b4336fde4/00230fec-a427-42c0-8cf9-eddac81eddd8.webm', 3, '2011224', 168, now() - interval '381915 seconds'),
  ('b7484b25-4dc0-4cff-b17d-e4efcd9e1ea9', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '8c2b8fb2-df66-4b16-a66a-3f2b4336fde4', 'Slow practice (Take 4)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/8c2b8fb2-df66-4b16-a66a-3f2b4336fde4/b7484b25-4dc0-4cff-b17d-e4efcd9e1ea9.webm', 4, '1184343', 130, now() - interval '227255 seconds'),
  ('30d552e6-ba5f-45fa-87fe-9e9540e5e79f', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '8d1e0610-8d11-43f4-a8e6-4a10c7dc00cc', 'Late Night run (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/8d1e0610-8d11-43f4-a8e6-4a10c7dc00cc/30d552e6-ba5f-45fa-87fe-9e9540e5e79f.wav', 1, '1416493', 177, now() - interval '330799 seconds'),
  ('86d45385-9835-4ff8-9684-a60c2b1e4f5e', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '8d1e0610-8d11-43f4-a8e6-4a10c7dc00cc', 'Late Night run (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/8d1e0610-8d11-43f4-a8e6-4a10c7dc00cc/86d45385-9835-4ff8-9684-a60c2b1e4f5e.wav', 2, '3952369', 162, now() - interval '106253 seconds'),
  ('49f7544f-e286-47a8-9126-ed0e6dd8d86b', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '8d1e0610-8d11-43f4-a8e6-4a10c7dc00cc', 'Late Night run (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/8d1e0610-8d11-43f4-a8e6-4a10c7dc00cc/49f7544f-e286-47a8-9126-ed0e6dd8d86b.wav', 3, '1523401', 106, now() - interval '416700 seconds'),
  ('14bc6b58-8eaf-4e5e-946a-9f08148d5da6', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '8e42d6f2-7e45-4e71-900d-e255b25469c3', 'Practice Session', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/8e42d6f2-7e45-4e71-900d-e255b25469c3/14bc6b58-8eaf-4e5e-946a-9f08148d5da6.webm', 1, '3694697', 134, now() - interval '133057 seconds'),
  ('a1ab4b02-7137-4e78-86c2-ad0dd52bcb06', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '8f0cb3b5-2a60-4d01-b474-2d350222c400', 'First Take', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12/8f0cb3b5-2a60-4d01-b474-2d350222c400/a1ab4b02-7137-4e78-86c2-ad0dd52bcb06.webm', 1, '947062', 174, now() - interval '228967 seconds'),
  ('9b28c852-80d4-4488-a88f-2038a46264a8', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '8f86fd42-c6ad-4cb4-8108-bff2453621ba', 'Tempo check', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/8f86fd42-c6ad-4cb4-8108-bff2453621ba/9b28c852-80d4-4488-a88f-2038a46264a8.webm', 1, '1430563', 73, now() - interval '469052 seconds'),
  ('7ff2504c-8ddc-4254-9e60-6f123c10c9b2', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '8fffba10-c9fc-4b44-abaa-879a85badfab', 'Practice Session (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12/8fffba10-c9fc-4b44-abaa-879a85badfab/7ff2504c-8ddc-4254-9e60-6f123c10c9b2.webm', 1, '2640035', 98, now() - interval '592699 seconds'),
  ('c1feca54-57a4-48cf-9d6f-f9e1599009c3', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '8fffba10-c9fc-4b44-abaa-879a85badfab', 'Practice Session (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12/8fffba10-c9fc-4b44-abaa-879a85badfab/c1feca54-57a4-48cf-9d6f-f9e1599009c3.webm', 2, '343740', 148, now() - interval '17735 seconds'),
  ('9553633c-b81c-4e51-8d42-825349e9f0f9', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '8fffba10-c9fc-4b44-abaa-879a85badfab', 'Practice Session (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12/8fffba10-c9fc-4b44-abaa-879a85badfab/9553633c-b81c-4e51-8d42-825349e9f0f9.webm', 3, '454680', 148, now() - interval '243806 seconds'),
  ('207e58d8-a601-41ff-a32e-68668a9d1cb7', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '9235ba6f-0f05-44bf-839f-921285400603', 'Vocal guide', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/9235ba6f-0f05-44bf-839f-921285400603/207e58d8-a601-41ff-a32e-68668a9d1cb7.webm', 1, '903028', 135, now() - interval '529168 seconds'),
  ('f40b8ee5-530e-4d5c-a80d-4f5c8c58c982', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '9355a763-04fd-4798-b6ba-3eccaea2b7dd', 'Vocal guide', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/9355a763-04fd-4798-b6ba-3eccaea2b7dd/f40b8ee5-530e-4d5c-a80d-4f5c8c58c982.webm', 1, '2387641', 190, now() - interval '281584 seconds'),
  ('82560758-9641-4276-be2b-7aa91f8a23df', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '94097619-b406-459e-a0c2-809641a8f20f', 'First Take', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/94097619-b406-459e-a0c2-809641a8f20f/82560758-9641-4276-be2b-7aa91f8a23df.webm', 1, '869320', 108, now() - interval '283681 seconds'),
  ('66943b11-98cc-49a9-a6cc-dc3539d162e5', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '94b61c87-58ec-4196-86a0-603bbb887d2e', 'Acoustic draft (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/94b61c87-58ec-4196-86a0-603bbb887d2e/66943b11-98cc-49a9-a6cc-dc3539d162e5.webm', 1, '328826', 72, now() - interval '23197 seconds'),
  ('c3309840-d393-47e6-bcb8-02cbabe903e2', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '94b61c87-58ec-4196-86a0-603bbb887d2e', 'Acoustic draft (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/94b61c87-58ec-4196-86a0-603bbb887d2e/c3309840-d393-47e6-bcb8-02cbabe903e2.webm', 2, '2842585', 183, now() - interval '27432 seconds'),
  ('6f51e807-4828-407b-9584-3d42a29e2650', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '94b61c87-58ec-4196-86a0-603bbb887d2e', 'Acoustic draft (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/94b61c87-58ec-4196-86a0-603bbb887d2e/6f51e807-4828-407b-9584-3d42a29e2650.webm', 3, '474019', 62, now() - interval '391049 seconds'),
  ('43294617-de9e-4e92-ad44-13da670d36bb', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '94b61c87-58ec-4196-86a0-603bbb887d2e', 'Acoustic draft (Take 4)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/94b61c87-58ec-4196-86a0-603bbb887d2e/43294617-de9e-4e92-ad44-13da670d36bb.webm', 4, '3845159', 154, now() - interval '16437 seconds'),
  ('67613bc4-672b-4c23-ac7a-44134fabbbda', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '94b61c87-58ec-4196-86a0-603bbb887d2e', 'Acoustic draft (Take 5)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/94b61c87-58ec-4196-86a0-603bbb887d2e/67613bc4-672b-4c23-ac7a-44134fabbbda.webm', 5, '339613', 117, now() - interval '193341 seconds'),
  ('e85302e0-851e-4065-adab-4197af6b912c', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '9a578798-7e40-4132-95a4-d6d12c73f845', 'Practice Session', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/9a578798-7e40-4132-95a4-d6d12c73f845/e85302e0-851e-4065-adab-4197af6b912c.webm', 1, '2904447', 81, now() - interval '278073 seconds'),
  ('9cd90f08-cca6-45bd-9662-3ddc12051f71', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '9aba864c-3576-4cca-ba28-0b36f7aa36d5', 'Slow practice (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/9aba864c-3576-4cca-ba28-0b36f7aa36d5/9cd90f08-cca6-45bd-9662-3ddc12051f71.webm', 1, '3878800', 179, now() - interval '384698 seconds'),
  ('06f4c5f5-1b1c-4ac9-b3ed-a135cc516b14', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '9aba864c-3576-4cca-ba28-0b36f7aa36d5', 'Slow practice (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/9aba864c-3576-4cca-ba28-0b36f7aa36d5/06f4c5f5-1b1c-4ac9-b3ed-a135cc516b14.webm', 2, '437045', 47, now() - interval '516657 seconds'),
  ('cb9a8406-c1d5-48f6-98c8-fc4a9ccc019b', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '9d984027-9327-44c3-972f-25f932b227b9', 'Late Night run 1', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/9d984027-9327-44c3-972f-25f932b227b9/cb9a8406-c1d5-48f6-98c8-fc4a9ccc019b.webm', 1, '2711119', 58, now() - interval '357523 seconds'),
  ('fd0c9d8f-e357-4954-9204-5edce664f43c', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '9d984027-9327-44c3-972f-25f932b227b9', 'Late Night run 2', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/9d984027-9327-44c3-972f-25f932b227b9/fd0c9d8f-e357-4954-9204-5edce664f43c.webm', 2, '3732475', 129, now() - interval '569815 seconds'),
  ('12966543-3c5d-43cd-8ff8-73124d33e66e', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '9d984027-9327-44c3-972f-25f932b227b9', 'Late Night run 3', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/9d984027-9327-44c3-972f-25f932b227b9/12966543-3c5d-43cd-8ff8-73124d33e66e.webm', 3, '3079678', 144, now() - interval '243377 seconds'),
  ('f4b3ff45-45b9-4f9e-9e6a-8fa7fc947d28', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '9e9a4b53-2d68-4ab2-b87c-807e1606a0a3', 'Vocal guide (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/9e9a4b53-2d68-4ab2-b87c-807e1606a0a3/f4b3ff45-45b9-4f9e-9e6a-8fa7fc947d28.webm', 1, '896829', 39, now() - interval '36322 seconds'),
  ('46c0a473-a031-4125-9007-43a74507f314', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '9e9a4b53-2d68-4ab2-b87c-807e1606a0a3', 'Vocal guide (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/9e9a4b53-2d68-4ab2-b87c-807e1606a0a3/46c0a473-a031-4125-9007-43a74507f314.webm', 2, '1398509', 121, now() - interval '206973 seconds'),
  ('3fa64d39-b87a-402b-986a-974293e97be2', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '9ff9db93-a5d9-4bcb-b745-258f7d27d646', 'Vocal guide', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/9ff9db93-a5d9-4bcb-b745-258f7d27d646/3fa64d39-b87a-402b-986a-974293e97be2.webm', 1, '1270727', 44, now() - interval '220431 seconds'),
  ('7df9d54b-7234-4fe9-85a7-c7c7f3499325', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'a088b2c3-41b2-45ec-8dfc-272d57b61247', 'Acoustic draft (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/a088b2c3-41b2-45ec-8dfc-272d57b61247/7df9d54b-7234-4fe9-85a7-c7c7f3499325.webm', 1, '2725017', 123, now() - interval '97315 seconds'),
  ('b807467f-986a-4ea7-a43f-b2db95334641', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'a088b2c3-41b2-45ec-8dfc-272d57b61247', 'Acoustic draft (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/a088b2c3-41b2-45ec-8dfc-272d57b61247/b807467f-986a-4ea7-a43f-b2db95334641.webm', 2, '3879822', 127, now() - interval '241910 seconds'),
  ('c73e275a-d051-4934-88c3-9fef940979b4', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'a088b2c3-41b2-45ec-8dfc-272d57b61247', 'Acoustic draft (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/a088b2c3-41b2-45ec-8dfc-272d57b61247/c73e275a-d051-4934-88c3-9fef940979b4.webm', 3, '2944480', 145, now() - interval '571335 seconds'),
  ('d5b798c8-f8af-49f2-a35a-ec073839bee5', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'a088b2c3-41b2-45ec-8dfc-272d57b61247', 'Acoustic draft (Take 4)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/a088b2c3-41b2-45ec-8dfc-272d57b61247/d5b798c8-f8af-49f2-a35a-ec073839bee5.webm', 4, '1500336', 169, now() - interval '512619 seconds'),
  ('eccb5512-fc3b-42d0-99d8-a67262739244', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'a17e738c-14fe-45ea-afa5-8c1ae30b5f99', 'Vocal guide (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/a17e738c-14fe-45ea-afa5-8c1ae30b5f99/eccb5512-fc3b-42d0-99d8-a67262739244.webm', 1, '2683677', 167, now() - interval '104830 seconds'),
  ('f6d10dcd-c79f-4706-bc30-7f3fd46d9135', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'a17e738c-14fe-45ea-afa5-8c1ae30b5f99', 'Vocal guide (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/a17e738c-14fe-45ea-afa5-8c1ae30b5f99/f6d10dcd-c79f-4706-bc30-7f3fd46d9135.webm', 2, '795138', 82, now() - interval '450084 seconds'),
  ('3d30c8b3-c3c0-41ab-b825-6b49aee6b4fb', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'a17e738c-14fe-45ea-afa5-8c1ae30b5f99', 'Vocal guide (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/a17e738c-14fe-45ea-afa5-8c1ae30b5f99/3d30c8b3-c3c0-41ab-b825-6b49aee6b4fb.webm', 3, '3650348', 33, now() - interval '100617 seconds'),
  ('d5a9a04d-d704-47b8-a723-f7ad31e04ff8', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'a17e738c-14fe-45ea-afa5-8c1ae30b5f99', 'Vocal guide (Take 4)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/a17e738c-14fe-45ea-afa5-8c1ae30b5f99/d5a9a04d-d704-47b8-a723-f7ad31e04ff8.webm', 4, '2908076', 68, now() - interval '489524 seconds'),
  ('9cc63d8c-3ca7-4d27-b46b-cf7d4cab25f5', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'a4d4c0bd-4b8f-4dfc-85a3-da41c88701b8', 'Late Night run (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/a4d4c0bd-4b8f-4dfc-85a3-da41c88701b8/9cc63d8c-3ca7-4d27-b46b-cf7d4cab25f5.webm', 1, '1360825', 194, now() - interval '376841 seconds'),
  ('5cbafe42-a157-4ee8-b848-fcaeed48b77e', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'a4d4c0bd-4b8f-4dfc-85a3-da41c88701b8', 'Late Night run (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/a4d4c0bd-4b8f-4dfc-85a3-da41c88701b8/5cbafe42-a157-4ee8-b848-fcaeed48b77e.webm', 2, '2840977', 134, now() - interval '359883 seconds'),
  ('84c3914b-d83f-4e01-b5ab-d8eb22c068b7', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'a4d4c0bd-4b8f-4dfc-85a3-da41c88701b8', 'Late Night run (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/a4d4c0bd-4b8f-4dfc-85a3-da41c88701b8/84c3914b-d83f-4e01-b5ab-d8eb22c068b7.webm', 3, '2389402', 47, now() - interval '164831 seconds'),
  ('09198815-8852-4675-9e53-3a57421a02a0', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'a57234f2-f449-418c-a7f6-724702ee45e0', 'Slow practice (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/a57234f2-f449-418c-a7f6-724702ee45e0/09198815-8852-4675-9e53-3a57421a02a0.webm', 1, '2822525', 65, now() - interval '545119 seconds');
INSERT INTO public.user_recordings (id, user_id, song_version_id, recording_name, storage_path, position, file_size_bytes, duration_seconds, created_at) VALUES
  ('0a126a1c-546b-4294-a2be-1698876546b0', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'a57234f2-f449-418c-a7f6-724702ee45e0', 'Slow practice (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/a57234f2-f449-418c-a7f6-724702ee45e0/0a126a1c-546b-4294-a2be-1698876546b0.webm', 2, '1187846', 57, now() - interval '603999 seconds'),
  ('51614d97-10df-4855-b74a-c5190d577f64', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'a57234f2-f449-418c-a7f6-724702ee45e0', 'Slow practice (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/a57234f2-f449-418c-a7f6-724702ee45e0/51614d97-10df-4855-b74a-c5190d577f64.webm', 3, '3025521', 84, now() - interval '405818 seconds'),
  ('3cf5c77e-2aaf-4354-9a93-7d6a8d7e7fa7', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'a57234f2-f449-418c-a7f6-724702ee45e0', 'Slow practice (Take 4)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/a57234f2-f449-418c-a7f6-724702ee45e0/3cf5c77e-2aaf-4354-9a93-7d6a8d7e7fa7.webm', 4, '2711212', 52, now() - interval '541800 seconds'),
  ('2534c7a9-3467-47e1-8340-3042d8a97169', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'a6c2bea4-ef98-4eb9-bfbd-a7e8ab761fbb', 'Rehearsal Take 1', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/a6c2bea4-ef98-4eb9-bfbd-a7e8ab761fbb/2534c7a9-3467-47e1-8340-3042d8a97169.webm', 1, '3273720', 63, now() - interval '132176 seconds'),
  ('aeb37c9c-e1bf-4da4-a40d-5829c729483b', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'a6c2bea4-ef98-4eb9-bfbd-a7e8ab761fbb', 'Rehearsal Take 2', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/a6c2bea4-ef98-4eb9-bfbd-a7e8ab761fbb/aeb37c9c-e1bf-4da4-a40d-5829c729483b.webm', 2, '2369484', 156, now() - interval '489151 seconds'),
  ('4e51942f-a6f6-4bfe-99b4-5603c51f370e', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'a6c2bea4-ef98-4eb9-bfbd-a7e8ab761fbb', 'Rehearsal Take 3', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/a6c2bea4-ef98-4eb9-bfbd-a7e8ab761fbb/4e51942f-a6f6-4bfe-99b4-5603c51f370e.webm', 3, '3561743', 134, now() - interval '203844 seconds'),
  ('5f301103-ec4b-4351-86c1-867faae12bcf', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'a6c2bea4-ef98-4eb9-bfbd-a7e8ab761fbb', 'Rehearsal Take 4', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/a6c2bea4-ef98-4eb9-bfbd-a7e8ab761fbb/5f301103-ec4b-4351-86c1-867faae12bcf.webm', 4, '2304051', 42, now() - interval '344836 seconds'),
  ('b91ef9a3-063d-4678-a214-65fc05f23809', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'a6c2bea4-ef98-4eb9-bfbd-a7e8ab761fbb', 'Rehearsal Take 5', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/a6c2bea4-ef98-4eb9-bfbd-a7e8ab761fbb/b91ef9a3-063d-4678-a214-65fc05f23809.webm', 5, '3303363', 149, now() - interval '36864 seconds'),
  ('627fd199-f6fd-4499-aae1-58c9e9463cd3', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'a87cb758-2480-43dc-9737-6bc996c85f8b', 'Full run-through', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/a87cb758-2480-43dc-9737-6bc996c85f8b/627fd199-f6fd-4499-aae1-58c9e9463cd3.wav', 1, '1781716', 46, now() - interval '214105 seconds'),
  ('ce271939-2029-41e4-a47b-0957ee7b45a9', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'a8e74379-1c31-4dba-b068-8da22eab544c', 'Full run-through (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/a8e74379-1c31-4dba-b068-8da22eab544c/ce271939-2029-41e4-a47b-0957ee7b45a9.wav', 1, '3409593', 148, now() - interval '564011 seconds'),
  ('305e4212-249c-414d-94c7-fa26656dac37', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'a8e74379-1c31-4dba-b068-8da22eab544c', 'Full run-through (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/a8e74379-1c31-4dba-b068-8da22eab544c/305e4212-249c-414d-94c7-fa26656dac37.wav', 2, '1785341', 64, now() - interval '453740 seconds'),
  ('c8c0120e-98e6-4aa8-ac65-bb722dce244d', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'a8e74379-1c31-4dba-b068-8da22eab544c', 'Full run-through (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/a8e74379-1c31-4dba-b068-8da22eab544c/c8c0120e-98e6-4aa8-ac65-bb722dce244d.wav', 3, '2546120', 177, now() - interval '396392 seconds'),
  ('27614427-543a-4958-8ecd-10f80fb8b84f', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'a8e74379-1c31-4dba-b068-8da22eab544c', 'Full run-through (Take 4)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/a8e74379-1c31-4dba-b068-8da22eab544c/27614427-543a-4958-8ecd-10f80fb8b84f.wav', 4, '1885515', 163, now() - interval '231651 seconds'),
  ('e2346124-3828-40b3-afdc-0d63d3892660', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'ac3748f5-75a3-41e8-921b-31224da31682', 'First Take (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/ac3748f5-75a3-41e8-921b-31224da31682/e2346124-3828-40b3-afdc-0d63d3892660.webm', 1, '884840', 125, now() - interval '300177 seconds'),
  ('1bbf0fd8-3f54-40f3-9441-decd462aafb0', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'ac3748f5-75a3-41e8-921b-31224da31682', 'First Take (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/ac3748f5-75a3-41e8-921b-31224da31682/1bbf0fd8-3f54-40f3-9441-decd462aafb0.webm', 2, '2895148', 67, now() - interval '43364 seconds'),
  ('f7d4f26e-6760-4cd4-a59f-1a5240add10b', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'ad3d042b-dada-4e74-a315-51e20586eaad', 'Tempo check (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/ad3d042b-dada-4e74-a315-51e20586eaad/f7d4f26e-6760-4cd4-a59f-1a5240add10b.webm', 1, '3315460', 144, now() - interval '546467 seconds'),
  ('dafbc9bf-94df-4ac4-ad4b-d44af121a009', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'ad3d042b-dada-4e74-a315-51e20586eaad', 'Tempo check (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/ad3d042b-dada-4e74-a315-51e20586eaad/dafbc9bf-94df-4ac4-ad4b-d44af121a009.webm', 2, '892884', 54, now() - interval '213833 seconds'),
  ('98354d1d-e9aa-4bcc-8fe9-633829a010f2', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'ad3d042b-dada-4e74-a315-51e20586eaad', 'Tempo check (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/ad3d042b-dada-4e74-a315-51e20586eaad/98354d1d-e9aa-4bcc-8fe9-633829a010f2.webm', 3, '2293595', 125, now() - interval '364427 seconds'),
  ('bf1fd314-cf06-417c-9ebd-1dedf80b3a4f', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'ad3d042b-dada-4e74-a315-51e20586eaad', 'Tempo check (Take 4)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/ad3d042b-dada-4e74-a315-51e20586eaad/bf1fd314-cf06-417c-9ebd-1dedf80b3a4f.webm', 4, '3213769', 110, now() - interval '180428 seconds'),
  ('960421cd-2e66-4dae-88f6-3aa28812557d', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'ad3d042b-dada-4e74-a315-51e20586eaad', 'Tempo check (Take 5)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/ad3d042b-dada-4e74-a315-51e20586eaad/960421cd-2e66-4dae-88f6-3aa28812557d.webm', 5, '1889799', 186, now() - interval '255153 seconds'),
  ('cdfb7805-27e0-498c-a980-b5b9d41ce158', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'ad4c29a9-7e40-441e-8263-df6b649722a2', 'Tempo check (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12/ad4c29a9-7e40-441e-8263-df6b649722a2/cdfb7805-27e0-498c-a980-b5b9d41ce158.webm', 1, '244774', 186, now() - interval '357939 seconds'),
  ('845888cc-d077-414b-bcad-188d3c514831', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'ad4c29a9-7e40-441e-8263-df6b649722a2', 'Tempo check (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12/ad4c29a9-7e40-441e-8263-df6b649722a2/845888cc-d077-414b-bcad-188d3c514831.webm', 2, '450044', 144, now() - interval '456043 seconds'),
  ('4dbcf206-b703-4c03-9318-ca11407d4a27', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'ad4c29a9-7e40-441e-8263-df6b649722a2', 'Tempo check (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12/ad4c29a9-7e40-441e-8263-df6b649722a2/4dbcf206-b703-4c03-9318-ca11407d4a27.webm', 3, '3242014', 126, now() - interval '109036 seconds'),
  ('eb860319-fd3d-4c63-bbfe-3ebfb8957d5b', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'ad4c29a9-7e40-441e-8263-df6b649722a2', 'Tempo check (Take 4)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12/ad4c29a9-7e40-441e-8263-df6b649722a2/eb860319-fd3d-4c63-bbfe-3ebfb8957d5b.webm', 4, '1202557', 40, now() - interval '529408 seconds'),
  ('41db680f-c098-4c4d-82a0-6a29158ea3de', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'ad4c29a9-7e40-441e-8263-df6b649722a2', 'Tempo check (Take 5)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12/ad4c29a9-7e40-441e-8263-df6b649722a2/41db680f-c098-4c4d-82a0-6a29158ea3de.webm', 5, '311966', 143, now() - interval '71845 seconds'),
  ('0b91c5e5-d521-4626-9254-53776fbaefb0', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'b1b10b39-4136-4ff0-bb7c-3ee6c52f7fa5', 'Vocal guide', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/b1b10b39-4136-4ff0-bb7c-3ee6c52f7fa5/0b91c5e5-d521-4626-9254-53776fbaefb0.webm', 1, '631063', 38, now() - interval '19525 seconds'),
  ('2a626772-b2ba-4349-b95b-4f3a241b9146', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b1bee597-932e-430d-bb47-fe44ed780570', 'Tempo check', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/b1bee597-932e-430d-bb47-fe44ed780570/2a626772-b2ba-4349-b95b-4f3a241b9146.webm', 1, '694908', 135, now() - interval '271676 seconds'),
  ('d4afed5a-65fb-4e72-a3c5-648e19a93c90', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b285397b-bd7a-4f9c-9b9d-420f98a46d70', 'Practice Session 1', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/b285397b-bd7a-4f9c-9b9d-420f98a46d70/d4afed5a-65fb-4e72-a3c5-648e19a93c90.webm', 1, '3451141', 130, now() - interval '132320 seconds'),
  ('65d4721d-60e9-44c5-8248-78830bd2bbfc', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b285397b-bd7a-4f9c-9b9d-420f98a46d70', 'Practice Session 2', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/b285397b-bd7a-4f9c-9b9d-420f98a46d70/65d4721d-60e9-44c5-8248-78830bd2bbfc.webm', 2, '1720064', 118, now() - interval '309338 seconds'),
  ('f994aa55-929e-4d14-a6ba-377b798c4448', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b285397b-bd7a-4f9c-9b9d-420f98a46d70', 'Practice Session 3', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/b285397b-bd7a-4f9c-9b9d-420f98a46d70/f994aa55-929e-4d14-a6ba-377b798c4448.webm', 3, '3406779', 168, now() - interval '508435 seconds'),
  ('feb0c516-ff77-4ed6-a3e3-919cd9989249', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b285397b-bd7a-4f9c-9b9d-420f98a46d70', 'Practice Session 4', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/b285397b-bd7a-4f9c-9b9d-420f98a46d70/feb0c516-ff77-4ed6-a3e3-919cd9989249.webm', 4, '1715143', 173, now() - interval '66302 seconds'),
  ('2fbc766f-89a9-41ce-a576-a4cbcd6aac78', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b285397b-bd7a-4f9c-9b9d-420f98a46d70', 'Practice Session 5', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/b285397b-bd7a-4f9c-9b9d-420f98a46d70/2fbc766f-89a9-41ce-a576-a4cbcd6aac78.webm', 5, '2376604', 180, now() - interval '610319 seconds'),
  ('2de668e8-3e86-4a00-ae40-0546f8d72e72', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b285397b-bd7a-4f9c-9b9d-420f98a46d70', 'Practice Session 6', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/b285397b-bd7a-4f9c-9b9d-420f98a46d70/2de668e8-3e86-4a00-ae40-0546f8d72e72.webm', 6, '2279390', 182, now() - interval '351318 seconds'),
  ('00ffdc04-0cbe-4fd6-81ca-545483a6aff0', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b285397b-bd7a-4f9c-9b9d-420f98a46d70', 'Practice Session 7', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/b285397b-bd7a-4f9c-9b9d-420f98a46d70/00ffdc04-0cbe-4fd6-81ca-545483a6aff0.webm', 7, '3287174', 194, now() - interval '31915 seconds'),
  ('fc978712-14b4-4026-ae7c-b22ae0229d34', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b285397b-bd7a-4f9c-9b9d-420f98a46d70', 'Practice Session 8', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/b285397b-bd7a-4f9c-9b9d-420f98a46d70/fc978712-14b4-4026-ae7c-b22ae0229d34.webm', 8, '272622', 30, now() - interval '111822 seconds'),
  ('48456687-814c-4e46-a9ed-8a1ceeeca2d4', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b285397b-bd7a-4f9c-9b9d-420f98a46d70', 'Practice Session 9', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/b285397b-bd7a-4f9c-9b9d-420f98a46d70/48456687-814c-4e46-a9ed-8a1ceeeca2d4.webm', 9, '1256138', 157, now() - interval '400243 seconds'),
  ('2606b5d1-9353-4999-922b-48d3041edaaf', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b285397b-bd7a-4f9c-9b9d-420f98a46d70', 'Practice Session 10', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/b285397b-bd7a-4f9c-9b9d-420f98a46d70/2606b5d1-9353-4999-922b-48d3041edaaf.webm', 10, '3775764', 189, now() - interval '315667 seconds'),
  ('43b3cb2a-2c00-4a48-84ad-75bedd14a56d', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b285397b-bd7a-4f9c-9b9d-420f98a46d70', 'Practice Session 11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/b285397b-bd7a-4f9c-9b9d-420f98a46d70/43b3cb2a-2c00-4a48-84ad-75bedd14a56d.webm', 11, '3374991', 119, now() - interval '475270 seconds'),
  ('ce193a40-1d1d-4106-a9d1-bb083bd85877', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b285397b-bd7a-4f9c-9b9d-420f98a46d70', 'Practice Session 12', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/b285397b-bd7a-4f9c-9b9d-420f98a46d70/ce193a40-1d1d-4106-a9d1-bb083bd85877.webm', 12, '1244224', 117, now() - interval '456362 seconds'),
  ('bd974387-3d21-4c63-8c12-821fc3e06298', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b631dc37-e699-40de-9e43-fc9cc7eb3e13', 'Tempo check (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/b631dc37-e699-40de-9e43-fc9cc7eb3e13/bd974387-3d21-4c63-8c12-821fc3e06298.webm', 1, '459394', 127, now() - interval '504005 seconds'),
  ('0fef32ba-666b-4541-87e8-ac08699bf361', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b631dc37-e699-40de-9e43-fc9cc7eb3e13', 'Tempo check (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/b631dc37-e699-40de-9e43-fc9cc7eb3e13/0fef32ba-666b-4541-87e8-ac08699bf361.webm', 2, '1944842', 137, now() - interval '530405 seconds'),
  ('c3c1a225-6a41-4cc7-adb9-550817f64cdf', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b631dc37-e699-40de-9e43-fc9cc7eb3e13', 'Tempo check (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/b631dc37-e699-40de-9e43-fc9cc7eb3e13/c3c1a225-6a41-4cc7-adb9-550817f64cdf.webm', 3, '3891930', 145, now() - interval '203290 seconds'),
  ('13babbf6-da86-49f4-9d1d-1745d6f25c71', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b631dc37-e699-40de-9e43-fc9cc7eb3e13', 'Tempo check (Take 4)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/b631dc37-e699-40de-9e43-fc9cc7eb3e13/13babbf6-da86-49f4-9d1d-1745d6f25c71.webm', 4, '2305685', 156, now() - interval '471242 seconds'),
  ('d17d816b-0004-45d0-8e7f-793e947a0f80', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b96dca96-bbd0-4af4-a80e-d1823cbdb2c3', 'First Take (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/b96dca96-bbd0-4af4-a80e-d1823cbdb2c3/d17d816b-0004-45d0-8e7f-793e947a0f80.webm', 1, '3419746', 33, now() - interval '581045 seconds'),
  ('bf20d506-2adf-4df4-a4a2-7772a0cabf49', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b96dca96-bbd0-4af4-a80e-d1823cbdb2c3', 'First Take (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/b96dca96-bbd0-4af4-a80e-d1823cbdb2c3/bf20d506-2adf-4df4-a4a2-7772a0cabf49.webm', 2, '1167759', 154, now() - interval '188314 seconds'),
  ('f0591800-6118-43ad-b860-77fe781f03dc', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b96dca96-bbd0-4af4-a80e-d1823cbdb2c3', 'First Take (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/b96dca96-bbd0-4af4-a80e-d1823cbdb2c3/f0591800-6118-43ad-b860-77fe781f03dc.webm', 3, '1590079', 39, now() - interval '137806 seconds'),
  ('759997da-d59b-4af0-9bda-1d5113728058', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'ba284156-3dd4-41ac-b6c1-01eb1d1825df', 'Late Night run', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/ba284156-3dd4-41ac-b6c1-01eb1d1825df/759997da-d59b-4af0-9bda-1d5113728058.webm', 1, '3911856', 64, now() - interval '533299 seconds'),
  ('afede527-e7cb-480e-b24d-980a9b58786f', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'bbc7b140-6ca2-48fa-a3a9-899e595762cb', 'Full run-through (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/bbc7b140-6ca2-48fa-a3a9-899e595762cb/afede527-e7cb-480e-b24d-980a9b58786f.wav', 1, '700663', 32, now() - interval '264459 seconds'),
  ('a659c69c-d28e-41a6-99c1-039eeea189b3', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'bbc7b140-6ca2-48fa-a3a9-899e595762cb', 'Full run-through (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/bbc7b140-6ca2-48fa-a3a9-899e595762cb/a659c69c-d28e-41a6-99c1-039eeea189b3.wav', 2, '756850', 81, now() - interval '120581 seconds'),
  ('e5aac45a-bf4f-43f9-95bf-456ae0d87d07', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'bbc7b140-6ca2-48fa-a3a9-899e595762cb', 'Full run-through (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/bbc7b140-6ca2-48fa-a3a9-899e595762cb/e5aac45a-bf4f-43f9-95bf-456ae0d87d07.wav', 3, '1519516', 174, now() - interval '497242 seconds');
INSERT INTO public.user_recordings (id, user_id, song_version_id, recording_name, storage_path, position, file_size_bytes, duration_seconds, created_at) VALUES
  ('9e783746-672b-4bfe-a734-3297f3e0dbd3', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'bc3d5cca-d09e-45c4-8753-8ce3efd16c03', 'Late Night run (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/bc3d5cca-d09e-45c4-8753-8ce3efd16c03/9e783746-672b-4bfe-a734-3297f3e0dbd3.webm', 1, '985791', 193, now() - interval '428323 seconds'),
  ('95584c71-c123-4af4-a942-83af703e0033', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'bc3d5cca-d09e-45c4-8753-8ce3efd16c03', 'Late Night run (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/bc3d5cca-d09e-45c4-8753-8ce3efd16c03/95584c71-c123-4af4-a942-83af703e0033.webm', 2, '3256017', 174, now() - interval '152260 seconds'),
  ('18bff150-b341-4f95-9ff7-fe1ed5d9ea98', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'bc3d5cca-d09e-45c4-8753-8ce3efd16c03', 'Late Night run (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/bc3d5cca-d09e-45c4-8753-8ce3efd16c03/18bff150-b341-4f95-9ff7-fe1ed5d9ea98.webm', 3, '2064871', 192, now() - interval '80673 seconds'),
  ('67808419-9e69-4f8c-aadd-1ca40e781469', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'bfee650f-3906-4490-9c1b-4f6685b63dbb', 'Acoustic draft', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/bfee650f-3906-4490-9c1b-4f6685b63dbb/67808419-9e69-4f8c-aadd-1ca40e781469.webm', 1, '2921192', 83, now() - interval '3632 seconds'),
  ('fd3c1b6c-27c0-47f9-85a6-961986361071', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'c33e7564-66ac-46db-99e1-43daaecab72e', 'Vocal guide (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12/c33e7564-66ac-46db-99e1-43daaecab72e/fd3c1b6c-27c0-47f9-85a6-961986361071.webm', 1, '1781747', 131, now() - interval '141207 seconds'),
  ('bcbe704f-6049-412d-acf2-cb267b8ec1bb', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'c33e7564-66ac-46db-99e1-43daaecab72e', 'Vocal guide (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12/c33e7564-66ac-46db-99e1-43daaecab72e/bcbe704f-6049-412d-acf2-cb267b8ec1bb.webm', 2, '3488833', 175, now() - interval '577191 seconds'),
  ('b0e7fd1a-91c4-4bdc-aa63-f1a10bd373c5', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'c33e7564-66ac-46db-99e1-43daaecab72e', 'Vocal guide (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12/c33e7564-66ac-46db-99e1-43daaecab72e/b0e7fd1a-91c4-4bdc-aa63-f1a10bd373c5.webm', 3, '3312145', 144, now() - interval '588912 seconds'),
  ('93bc2c8a-64a6-49aa-b2e5-7a6534085b7c', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'c33e7564-66ac-46db-99e1-43daaecab72e', 'Vocal guide (Take 4)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12/c33e7564-66ac-46db-99e1-43daaecab72e/93bc2c8a-64a6-49aa-b2e5-7a6534085b7c.webm', 4, '280735', 72, now() - interval '403229 seconds'),
  ('ac2298fb-4ccf-4d56-b077-588035632647', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'c33e7564-66ac-46db-99e1-43daaecab72e', 'Vocal guide (Take 5)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12/c33e7564-66ac-46db-99e1-43daaecab72e/ac2298fb-4ccf-4d56-b077-588035632647.webm', 5, '2154712', 194, now() - interval '365797 seconds'),
  ('033c85d8-ae10-495d-be14-ccb2774de9af', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'c47ee5a7-a553-45ec-bc53-0a878d0bdec3', 'Practice Session (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/c47ee5a7-a553-45ec-bc53-0a878d0bdec3/033c85d8-ae10-495d-be14-ccb2774de9af.webm', 1, '3526063', 142, now() - interval '103958 seconds'),
  ('a2029112-26a7-4e98-b376-a76a1f8512a9', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'c47ee5a7-a553-45ec-bc53-0a878d0bdec3', 'Practice Session (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/c47ee5a7-a553-45ec-bc53-0a878d0bdec3/a2029112-26a7-4e98-b376-a76a1f8512a9.webm', 2, '2396781', 161, now() - interval '358075 seconds'),
  ('c684610a-e618-4240-a968-e83ded849881', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'c47ee5a7-a553-45ec-bc53-0a878d0bdec3', 'Practice Session (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/c47ee5a7-a553-45ec-bc53-0a878d0bdec3/c684610a-e618-4240-a968-e83ded849881.webm', 3, '1649029', 87, now() - interval '489194 seconds'),
  ('b302679c-435f-47be-bf7a-1e0a5eaa9c0c', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'c7dde718-870b-4889-b9be-9b3aeabe2295', 'Vocal guide (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/c7dde718-870b-4889-b9be-9b3aeabe2295/b302679c-435f-47be-bf7a-1e0a5eaa9c0c.webm', 1, '2779746', 92, now() - interval '334526 seconds'),
  ('25f6cc34-fdb8-4ebf-a1c3-d7aa6cfcae37', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'c7dde718-870b-4889-b9be-9b3aeabe2295', 'Vocal guide (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/c7dde718-870b-4889-b9be-9b3aeabe2295/25f6cc34-fdb8-4ebf-a1c3-d7aa6cfcae37.webm', 2, '3842905', 32, now() - interval '229774 seconds'),
  ('aaad4908-d726-4273-aca1-1f4817dd7af2', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'c7dde718-870b-4889-b9be-9b3aeabe2295', 'Vocal guide (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/c7dde718-870b-4889-b9be-9b3aeabe2295/aaad4908-d726-4273-aca1-1f4817dd7af2.webm', 3, '2448924', 141, now() - interval '43852 seconds'),
  ('c33ce926-20ee-420a-b81b-3f49a51e2a53', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'c7dde718-870b-4889-b9be-9b3aeabe2295', 'Vocal guide (Take 4)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/c7dde718-870b-4889-b9be-9b3aeabe2295/c33ce926-20ee-420a-b81b-3f49a51e2a53.webm', 4, '3229407', 126, now() - interval '298521 seconds'),
  ('11d185e4-3178-478f-97d9-87f620879712', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'c84b2095-d040-4fa8-b4c3-681a0d21f187', 'Vocal guide (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/c84b2095-d040-4fa8-b4c3-681a0d21f187/11d185e4-3178-478f-97d9-87f620879712.webm', 1, '1244597', 179, now() - interval '25773 seconds'),
  ('9bcf17d5-1aff-41e9-bca6-6a29893c7353', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'c84b2095-d040-4fa8-b4c3-681a0d21f187', 'Vocal guide (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/c84b2095-d040-4fa8-b4c3-681a0d21f187/9bcf17d5-1aff-41e9-bca6-6a29893c7353.webm', 2, '3973340', 74, now() - interval '240484 seconds'),
  ('3865c6c1-75cd-4b0b-9498-c222aac24b9d', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'c8e83c48-a423-4f8a-bfc4-13aacd495e2a', 'Acoustic draft (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/c8e83c48-a423-4f8a-bfc4-13aacd495e2a/3865c6c1-75cd-4b0b-9498-c222aac24b9d.wav', 1, '2400090', 70, now() - interval '329379 seconds'),
  ('bff347eb-8176-4a9b-9f93-758a423a927f', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'c8e83c48-a423-4f8a-bfc4-13aacd495e2a', 'Acoustic draft (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/c8e83c48-a423-4f8a-bfc4-13aacd495e2a/bff347eb-8176-4a9b-9f93-758a423a927f.wav', 2, '2497982', 172, now() - interval '250900 seconds'),
  ('3636492a-0644-4c55-a5e1-e56fc10e92d9', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'c8e83c48-a423-4f8a-bfc4-13aacd495e2a', 'Acoustic draft (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/c8e83c48-a423-4f8a-bfc4-13aacd495e2a/3636492a-0644-4c55-a5e1-e56fc10e92d9.wav', 3, '3439537', 109, now() - interval '77681 seconds'),
  ('d09b1f19-61ef-4e95-a540-c9cd76949302', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'c8e83c48-a423-4f8a-bfc4-13aacd495e2a', 'Acoustic draft (Take 4)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/c8e83c48-a423-4f8a-bfc4-13aacd495e2a/d09b1f19-61ef-4e95-a540-c9cd76949302.wav', 4, '2589556', 38, now() - interval '127308 seconds'),
  ('a7bf9845-207f-4726-b3ae-e99b3d88f502', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'c8e83c48-a423-4f8a-bfc4-13aacd495e2a', 'Acoustic draft (Take 5)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/c8e83c48-a423-4f8a-bfc4-13aacd495e2a/a7bf9845-207f-4726-b3ae-e99b3d88f502.wav', 5, '2885637', 146, now() - interval '552534 seconds'),
  ('8cf6d603-a831-4143-a422-d4953e5e9734', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'c9049933-2edb-4745-9208-519be5234c0e', 'Late Night run', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/c9049933-2edb-4745-9208-519be5234c0e/8cf6d603-a831-4143-a422-d4953e5e9734.webm', 1, '2369710', 189, now() - interval '324551 seconds'),
  ('d9ed78fe-77c9-4d74-bad5-c672dc07f121', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'cd7e0fc3-2836-4b99-b6e7-d8ad75c4bc80', 'Acoustic draft', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/cd7e0fc3-2836-4b99-b6e7-d8ad75c4bc80/d9ed78fe-77c9-4d74-bad5-c672dc07f121.webm', 1, '1773495', 50, now() - interval '359377 seconds'),
  ('1bf15d2c-0dd7-4174-a779-51a6b06d18d9', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'ce17ceb8-69fc-4cab-a667-957b554f8018', 'Slow practice (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/ce17ceb8-69fc-4cab-a667-957b554f8018/1bf15d2c-0dd7-4174-a779-51a6b06d18d9.webm', 1, '3113362', 121, now() - interval '493483 seconds'),
  ('6b300de5-0c69-421d-bb17-bf5d7bc6a89e', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'ce17ceb8-69fc-4cab-a667-957b554f8018', 'Slow practice (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/ce17ceb8-69fc-4cab-a667-957b554f8018/6b300de5-0c69-421d-bb17-bf5d7bc6a89e.webm', 2, '1703276', 50, now() - interval '117975 seconds'),
  ('61786449-fe0c-44f6-a9ac-84f6edfb6ae2', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'ce17ceb8-69fc-4cab-a667-957b554f8018', 'Slow practice (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/ce17ceb8-69fc-4cab-a667-957b554f8018/61786449-fe0c-44f6-a9ac-84f6edfb6ae2.webm', 3, '3900112', 181, now() - interval '412563 seconds'),
  ('f9097220-2c61-49af-921c-46668af154cc', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'ce17ceb8-69fc-4cab-a667-957b554f8018', 'Slow practice (Take 4)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/ce17ceb8-69fc-4cab-a667-957b554f8018/f9097220-2c61-49af-921c-46668af154cc.webm', 4, '3184187', 42, now() - interval '370184 seconds'),
  ('582b6a18-d077-4a45-9f28-1ebd101bc0f7', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'cf278214-65e0-4775-a9ce-e45b297f51ab', 'Practice Session', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/cf278214-65e0-4775-a9ce-e45b297f51ab/582b6a18-d077-4a45-9f28-1ebd101bc0f7.webm', 1, '2857600', 35, now() - interval '32373 seconds'),
  ('3fdfce87-3ffd-4317-904e-7e4e8b7e8179', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'd0abc46c-d2b2-4ec2-889d-67812e6f3776', 'First Take', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/d0abc46c-d2b2-4ec2-889d-67812e6f3776/3fdfce87-3ffd-4317-904e-7e4e8b7e8179.webm', 1, '3155043', 184, now() - interval '484161 seconds'),
  ('c3ce4b42-7250-4271-b9d8-e932c0908134', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'd0c590bb-0f42-49b6-91a8-7b8e43d1b0df', 'First Take (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/d0c590bb-0f42-49b6-91a8-7b8e43d1b0df/c3ce4b42-7250-4271-b9d8-e932c0908134.webm', 1, '233953', 56, now() - interval '599494 seconds'),
  ('d065b5ed-ada4-4b74-9ac3-112961c2448d', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'd0c590bb-0f42-49b6-91a8-7b8e43d1b0df', 'First Take (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/d0c590bb-0f42-49b6-91a8-7b8e43d1b0df/d065b5ed-ada4-4b74-9ac3-112961c2448d.webm', 2, '1377503', 122, now() - interval '24178 seconds'),
  ('2caebfd4-b331-471a-9fac-c6d2a011461a', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'd0c590bb-0f42-49b6-91a8-7b8e43d1b0df', 'First Take (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/d0c590bb-0f42-49b6-91a8-7b8e43d1b0df/2caebfd4-b331-471a-9fac-c6d2a011461a.webm', 3, '1407591', 187, now() - interval '105089 seconds'),
  ('34fb32d7-8c67-4e87-8e17-ebe7acdf6ef5', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'd0c590bb-0f42-49b6-91a8-7b8e43d1b0df', 'First Take (Take 4)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/d0c590bb-0f42-49b6-91a8-7b8e43d1b0df/34fb32d7-8c67-4e87-8e17-ebe7acdf6ef5.webm', 4, '905230', 49, now() - interval '328518 seconds'),
  ('d7ebdd66-5570-4dc1-bafb-3aba1740a444', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'd193f0a8-9361-4a78-b67d-f1b212b25b01', 'Slow practice (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/d193f0a8-9361-4a78-b67d-f1b212b25b01/d7ebdd66-5570-4dc1-bafb-3aba1740a444.webm', 1, '3482834', 64, now() - interval '530947 seconds'),
  ('c11e5b83-02d1-44ec-8ef8-d974f935d9ad', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'd193f0a8-9361-4a78-b67d-f1b212b25b01', 'Slow practice (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/d193f0a8-9361-4a78-b67d-f1b212b25b01/c11e5b83-02d1-44ec-8ef8-d974f935d9ad.webm', 2, '630534', 57, now() - interval '80899 seconds'),
  ('aad6a771-4a2b-4647-a2ae-e614b7e8555a', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'd231e9ea-ed95-4f3e-8b1e-d78bd286b09f', 'Practice Session', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12/d231e9ea-ed95-4f3e-8b1e-d78bd286b09f/aad6a771-4a2b-4647-a2ae-e614b7e8555a.webm', 1, '2938829', 167, now() - interval '175587 seconds'),
  ('5e73dd89-199e-4c25-b324-4398372c12a4', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'd2cfb7a0-2832-48a0-9bd1-8e1fc9e70f65', 'Acoustic draft', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/d2cfb7a0-2832-48a0-9bd1-8e1fc9e70f65/5e73dd89-199e-4c25-b324-4398372c12a4.wav', 1, '3046567', 29, now() - interval '472346 seconds'),
  ('3f96eae6-5a21-408b-9ec6-b268eaef73d5', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'd3fab812-319b-4a17-85d9-1793788b3b7b', 'First Take (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/d3fab812-319b-4a17-85d9-1793788b3b7b/3f96eae6-5a21-408b-9ec6-b268eaef73d5.webm', 1, '3507830', 50, now() - interval '433980 seconds'),
  ('e8838c45-e26b-4ae3-aa79-b3a2de69a51c', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'd3fab812-319b-4a17-85d9-1793788b3b7b', 'First Take (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/d3fab812-319b-4a17-85d9-1793788b3b7b/e8838c45-e26b-4ae3-aa79-b3a2de69a51c.webm', 2, '2911962', 119, now() - interval '198771 seconds'),
  ('3c0632bb-90f8-4cf4-8a14-0bd6ed9c6285', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'd3fab812-319b-4a17-85d9-1793788b3b7b', 'First Take (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/d3fab812-319b-4a17-85d9-1793788b3b7b/3c0632bb-90f8-4cf4-8a14-0bd6ed9c6285.webm', 3, '2389058', 114, now() - interval '157165 seconds'),
  ('68a2b0ed-4137-47c3-adfa-071ff2c147ac', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'd3fab812-319b-4a17-85d9-1793788b3b7b', 'First Take (Take 4)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/d3fab812-319b-4a17-85d9-1793788b3b7b/68a2b0ed-4137-47c3-adfa-071ff2c147ac.webm', 4, '3846647', 194, now() - interval '559427 seconds'),
  ('e7f3d192-27f4-4847-a6f0-1d02aad2cf7d', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'd3fab812-319b-4a17-85d9-1793788b3b7b', 'First Take (Take 5)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/d3fab812-319b-4a17-85d9-1793788b3b7b/e7f3d192-27f4-4847-a6f0-1d02aad2cf7d.webm', 5, '2891275', 46, now() - interval '34197 seconds'),
  ('8f7be0d9-ed27-458f-a84c-927fcf277428', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'd615a166-9b54-437b-b169-9d49beee7f1d', 'Slow practice (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/d615a166-9b54-437b-b169-9d49beee7f1d/8f7be0d9-ed27-458f-a84c-927fcf277428.webm', 1, '2059187', 104, now() - interval '12245 seconds'),
  ('4f56dae8-7020-4672-bbf7-46db73a2cc54', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'd615a166-9b54-437b-b169-9d49beee7f1d', 'Slow practice (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/d615a166-9b54-437b-b169-9d49beee7f1d/4f56dae8-7020-4672-bbf7-46db73a2cc54.webm', 2, '2633940', 154, now() - interval '544253 seconds'),
  ('6d993b1d-115b-4f7e-a6ba-5db8e60e43ae', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'd615a166-9b54-437b-b169-9d49beee7f1d', 'Slow practice (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/d615a166-9b54-437b-b169-9d49beee7f1d/6d993b1d-115b-4f7e-a6ba-5db8e60e43ae.webm', 3, '2672087', 42, now() - interval '59982 seconds'),
  ('bf88b322-6426-4470-b96f-e40d54ea0ca3', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'd615a166-9b54-437b-b169-9d49beee7f1d', 'Slow practice (Take 4)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/d615a166-9b54-437b-b169-9d49beee7f1d/bf88b322-6426-4470-b96f-e40d54ea0ca3.webm', 4, '2447589', 32, now() - interval '520114 seconds'),
  ('78ee9291-4675-4bf8-9da0-d2e2b76d6cc6', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'd7ef45f4-2620-4fce-b6bc-d9275f59961d', 'Slow practice (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/d7ef45f4-2620-4fce-b6bc-d9275f59961d/78ee9291-4675-4bf8-9da0-d2e2b76d6cc6.webm', 1, '1931462', 178, now() - interval '252963 seconds'),
  ('d330e49b-8c87-426d-907a-360afd4fc712', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'd7ef45f4-2620-4fce-b6bc-d9275f59961d', 'Slow practice (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/d7ef45f4-2620-4fce-b6bc-d9275f59961d/d330e49b-8c87-426d-907a-360afd4fc712.webm', 2, '1188538', 115, now() - interval '260727 seconds');
INSERT INTO public.user_recordings (id, user_id, song_version_id, recording_name, storage_path, position, file_size_bytes, duration_seconds, created_at) VALUES
  ('027cdaa9-4d5f-4f24-81db-64267331c690', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'd7ef45f4-2620-4fce-b6bc-d9275f59961d', 'Slow practice (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/d7ef45f4-2620-4fce-b6bc-d9275f59961d/027cdaa9-4d5f-4f24-81db-64267331c690.webm', 3, '569247', 111, now() - interval '563371 seconds'),
  ('191dcbc6-93e5-469c-9385-6c84e3f67d39', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'd7ef45f4-2620-4fce-b6bc-d9275f59961d', 'Slow practice (Take 4)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/d7ef45f4-2620-4fce-b6bc-d9275f59961d/191dcbc6-93e5-469c-9385-6c84e3f67d39.webm', 4, '1733618', 75, now() - interval '26339 seconds'),
  ('fafdeed5-6346-4cfd-a536-4f7e8161e1c1', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'd82483de-ea8b-494e-8dff-456ec41eceb4', 'Acoustic draft (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/d82483de-ea8b-494e-8dff-456ec41eceb4/fafdeed5-6346-4cfd-a536-4f7e8161e1c1.webm', 1, '3987078', 28, now() - interval '202346 seconds'),
  ('bb58c23d-4fa3-4536-a500-610e5bb65a81', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'd82483de-ea8b-494e-8dff-456ec41eceb4', 'Acoustic draft (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/d82483de-ea8b-494e-8dff-456ec41eceb4/bb58c23d-4fa3-4536-a500-610e5bb65a81.webm', 2, '698315', 137, now() - interval '45507 seconds'),
  ('0d36e477-768e-4086-8322-e09802886f7f', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'd82483de-ea8b-494e-8dff-456ec41eceb4', 'Acoustic draft (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/d82483de-ea8b-494e-8dff-456ec41eceb4/0d36e477-768e-4086-8322-e09802886f7f.webm', 3, '2350056', 131, now() - interval '568352 seconds'),
  ('b690ece4-15ac-481a-bb0c-d84bd661693e', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'd82483de-ea8b-494e-8dff-456ec41eceb4', 'Acoustic draft (Take 4)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/d82483de-ea8b-494e-8dff-456ec41eceb4/b690ece4-15ac-481a-bb0c-d84bd661693e.webm', 4, '1698580', 65, now() - interval '121143 seconds'),
  ('7b366ef6-2a1b-4066-a4e6-519129749d3c', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'd82483de-ea8b-494e-8dff-456ec41eceb4', 'Acoustic draft (Take 5)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/d82483de-ea8b-494e-8dff-456ec41eceb4/7b366ef6-2a1b-4066-a4e6-519129749d3c.webm', 5, '2479369', 181, now() - interval '24123 seconds'),
  ('cc19faf8-de1b-4448-9524-612fb2bb0786', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'd959909a-1acc-4297-8da2-741bb330ecab', 'Slow practice', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12/d959909a-1acc-4297-8da2-741bb330ecab/cc19faf8-de1b-4448-9524-612fb2bb0786.webm', 1, '3921843', 153, now() - interval '272125 seconds'),
  ('ac24893d-646e-4efd-91c0-e2107ec42f63', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'd9edcf75-81c9-4911-bab9-6fc89009f135', 'Tempo check', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/d9edcf75-81c9-4911-bab9-6fc89009f135/ac24893d-646e-4efd-91c0-e2107ec42f63.wav', 1, '2025712', 92, now() - interval '265746 seconds'),
  ('376f6e7a-0a4c-4fc7-9f86-b3eece6c562c', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'da5f291b-4971-4566-93ea-6dcf483e36b8', 'Full run-through (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/da5f291b-4971-4566-93ea-6dcf483e36b8/376f6e7a-0a4c-4fc7-9f86-b3eece6c562c.webm', 1, '1549035', 114, now() - interval '61871 seconds'),
  ('d01d6ee9-2997-45d3-86f4-00c8253ea355', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'da5f291b-4971-4566-93ea-6dcf483e36b8', 'Full run-through (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/da5f291b-4971-4566-93ea-6dcf483e36b8/d01d6ee9-2997-45d3-86f4-00c8253ea355.webm', 2, '2123499', 91, now() - interval '277748 seconds'),
  ('3d5d1eae-501c-4df5-a49a-b5cc1fd803a2', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'da5f291b-4971-4566-93ea-6dcf483e36b8', 'Full run-through (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/da5f291b-4971-4566-93ea-6dcf483e36b8/3d5d1eae-501c-4df5-a49a-b5cc1fd803a2.webm', 3, '2126990', 169, now() - interval '19394 seconds'),
  ('2a0fbdcf-5ffb-45ec-95fd-76b04ff6f056', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'da5f291b-4971-4566-93ea-6dcf483e36b8', 'Full run-through (Take 4)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/da5f291b-4971-4566-93ea-6dcf483e36b8/2a0fbdcf-5ffb-45ec-95fd-76b04ff6f056.webm', 4, '496863', 172, now() - interval '543566 seconds'),
  ('150d2905-5519-463b-a8f5-e17178ed1ec6', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'dfdc0c0f-2c1a-46ea-b2c1-205dc639510c', 'Slow practice', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/dfdc0c0f-2c1a-46ea-b2c1-205dc639510c/150d2905-5519-463b-a8f5-e17178ed1ec6.webm', 1, '784370', 156, now() - interval '75669 seconds'),
  ('e49fe251-0555-4234-81ff-b54163951226', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'e10afcee-a127-47ca-ae2a-87a996ddfb8e', 'Vocal guide', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/e10afcee-a127-47ca-ae2a-87a996ddfb8e/e49fe251-0555-4234-81ff-b54163951226.wav', 1, '3752361', 67, now() - interval '270866 seconds'),
  ('c6e0793a-1549-4689-983b-b107131f611b', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'e175bd47-5ed0-4190-89f1-9ee8f63666a6', 'Full run-through', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/e175bd47-5ed0-4190-89f1-9ee8f63666a6/c6e0793a-1549-4689-983b-b107131f611b.webm', 1, '1754939', 122, now() - interval '364725 seconds'),
  ('423a317a-31f5-437c-9fd2-1216a76ab52a', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'e41f7687-7330-4f9b-a9f5-d1e633a6a174', 'Vocal guide (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/e41f7687-7330-4f9b-a9f5-d1e633a6a174/423a317a-31f5-437c-9fd2-1216a76ab52a.webm', 1, '2113338', 52, now() - interval '210787 seconds'),
  ('f141e1d5-7f88-4775-9695-a246786071be', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'e41f7687-7330-4f9b-a9f5-d1e633a6a174', 'Vocal guide (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/e41f7687-7330-4f9b-a9f5-d1e633a6a174/f141e1d5-7f88-4775-9695-a246786071be.webm', 2, '1022255', 80, now() - interval '159406 seconds'),
  ('59299e22-1b43-40c1-9c8f-588d32adbf02', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'e41f7687-7330-4f9b-a9f5-d1e633a6a174', 'Vocal guide (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/e41f7687-7330-4f9b-a9f5-d1e633a6a174/59299e22-1b43-40c1-9c8f-588d32adbf02.webm', 3, '362544', 83, now() - interval '549394 seconds'),
  ('1e31fef7-4be6-4d22-bc04-d90afea1c627', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'e41f7687-7330-4f9b-a9f5-d1e633a6a174', 'Vocal guide (Take 4)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/e41f7687-7330-4f9b-a9f5-d1e633a6a174/1e31fef7-4be6-4d22-bc04-d90afea1c627.webm', 4, '539486', 48, now() - interval '54186 seconds'),
  ('d544876f-b83f-4bd1-9164-7fd1f595d445', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'e488dbd4-c4bd-4950-be44-1144f45952d3', 'Full run-through (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12/e488dbd4-c4bd-4950-be44-1144f45952d3/d544876f-b83f-4bd1-9164-7fd1f595d445.webm', 1, '3836371', 179, now() - interval '211110 seconds'),
  ('95666f27-24ea-4068-96cd-b8ccea1d7804', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'e488dbd4-c4bd-4950-be44-1144f45952d3', 'Full run-through (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12/e488dbd4-c4bd-4950-be44-1144f45952d3/95666f27-24ea-4068-96cd-b8ccea1d7804.webm', 2, '3814264', 59, now() - interval '71935 seconds'),
  ('e042f3fa-a5cc-4a4e-9c6c-1a14f3ebd66e', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'e5e4455d-114f-44dc-b7d6-5119431646eb', 'Acoustic draft (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/e5e4455d-114f-44dc-b7d6-5119431646eb/e042f3fa-a5cc-4a4e-9c6c-1a14f3ebd66e.webm', 1, '1074727', 120, now() - interval '526359 seconds'),
  ('abc0c6f7-fd36-4981-af30-4fec3009260a', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'e5e4455d-114f-44dc-b7d6-5119431646eb', 'Acoustic draft (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/e5e4455d-114f-44dc-b7d6-5119431646eb/abc0c6f7-fd36-4981-af30-4fec3009260a.webm', 2, '3423991', 160, now() - interval '563689 seconds'),
  ('cdf6d7c8-7bdc-4434-9167-c582413a88c4', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'e5e4455d-114f-44dc-b7d6-5119431646eb', 'Acoustic draft (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/e5e4455d-114f-44dc-b7d6-5119431646eb/cdf6d7c8-7bdc-4434-9167-c582413a88c4.webm', 3, '2540883', 125, now() - interval '432734 seconds'),
  ('749e5f96-ffe6-4534-9de4-83162f0b1a50', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'e5e4455d-114f-44dc-b7d6-5119431646eb', 'Acoustic draft (Take 4)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/e5e4455d-114f-44dc-b7d6-5119431646eb/749e5f96-ffe6-4534-9de4-83162f0b1a50.webm', 4, '2224040', 45, now() - interval '499520 seconds'),
  ('1a5b2887-5b63-4918-abbe-8de942bf988f', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'e6448965-e872-4ce0-85b1-121b3896dece', 'Tempo check (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/e6448965-e872-4ce0-85b1-121b3896dece/1a5b2887-5b63-4918-abbe-8de942bf988f.webm', 1, '2043589', 184, now() - interval '479157 seconds'),
  ('6cc03450-9b04-4655-99de-90f510b150fa', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'e6448965-e872-4ce0-85b1-121b3896dece', 'Tempo check (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/e6448965-e872-4ce0-85b1-121b3896dece/6cc03450-9b04-4655-99de-90f510b150fa.webm', 2, '2453103', 131, now() - interval '122393 seconds'),
  ('9e86c89d-d4a6-4dac-bdce-c87632d22bf4', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'e7212bbd-bd5f-4acb-bb23-1189c00a2bbd', 'Slow practice', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/e7212bbd-bd5f-4acb-bb23-1189c00a2bbd/9e86c89d-d4a6-4dac-bdce-c87632d22bf4.wav', 1, '301477', 110, now() - interval '318376 seconds'),
  ('90c8e209-0100-4dd6-bbb0-61e926665a94', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'e72c1fe6-9f01-4ef4-9b1d-609829c37ade', 'Tempo check 1', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/e72c1fe6-9f01-4ef4-9b1d-609829c37ade/90c8e209-0100-4dd6-bbb0-61e926665a94.webm', 1, '763233', 185, now() - interval '598011 seconds'),
  ('f6fd25c4-f3cb-4ac0-812c-4bde8358f9b7', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'e72c1fe6-9f01-4ef4-9b1d-609829c37ade', 'Acoustic draft', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/e72c1fe6-9f01-4ef4-9b1d-609829c37ade/f6fd25c4-f3cb-4ac0-812c-4bde8358f9b7.wav', 1, '3644097', 63, now() - interval '23202 seconds'),
  ('3c11961c-9eb7-4b4d-8ae8-110b51e76d2b', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'e72c1fe6-9f01-4ef4-9b1d-609829c37ade', 'Tempo check 2', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/e72c1fe6-9f01-4ef4-9b1d-609829c37ade/3c11961c-9eb7-4b4d-8ae8-110b51e76d2b.webm', 2, '328862', 141, now() - interval '99444 seconds'),
  ('816fda1f-e338-4de3-b1e2-e10f0834512d', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'e8b82f25-4b2c-4096-a896-cf104bc97ffc', 'Late Night run (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/e8b82f25-4b2c-4096-a896-cf104bc97ffc/816fda1f-e338-4de3-b1e2-e10f0834512d.webm', 1, '486690', 50, now() - interval '397860 seconds'),
  ('c878e6ac-c79d-4307-9fb1-df5ec1dfdee1', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'e8b82f25-4b2c-4096-a896-cf104bc97ffc', 'Late Night run (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/e8b82f25-4b2c-4096-a896-cf104bc97ffc/c878e6ac-c79d-4307-9fb1-df5ec1dfdee1.webm', 2, '1633255', 113, now() - interval '350954 seconds'),
  ('ece1f583-fafd-4789-8939-daa175465620', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'e8b82f25-4b2c-4096-a896-cf104bc97ffc', 'Late Night run (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/e8b82f25-4b2c-4096-a896-cf104bc97ffc/ece1f583-fafd-4789-8939-daa175465620.webm', 3, '3966000', 128, now() - interval '554497 seconds'),
  ('80fc369f-fd3a-403f-8576-e0d51eee93bd', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'e8b82f25-4b2c-4096-a896-cf104bc97ffc', 'Late Night run (Take 4)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/e8b82f25-4b2c-4096-a896-cf104bc97ffc/80fc369f-fd3a-403f-8576-e0d51eee93bd.webm', 4, '3681794', 96, now() - interval '554534 seconds'),
  ('f27199cb-a286-4655-855f-5b691dabf5a0', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'e8b82f25-4b2c-4096-a896-cf104bc97ffc', 'Late Night run (Take 5)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/e8b82f25-4b2c-4096-a896-cf104bc97ffc/f27199cb-a286-4655-855f-5b691dabf5a0.webm', 5, '2771774', 26, now() - interval '599807 seconds'),
  ('5739fbd1-11d8-43f3-a083-873cf7e4d399', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'ea02e9f4-ee0e-4146-b0c0-0ec9a3d0f648', 'Acoustic draft (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/ea02e9f4-ee0e-4146-b0c0-0ec9a3d0f648/5739fbd1-11d8-43f3-a083-873cf7e4d399.webm', 1, '665342', 54, now() - interval '375072 seconds'),
  ('3ce20e46-2f0c-4a2c-b320-ca633b4bdfc2', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'ea02e9f4-ee0e-4146-b0c0-0ec9a3d0f648', 'Acoustic draft (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/ea02e9f4-ee0e-4146-b0c0-0ec9a3d0f648/3ce20e46-2f0c-4a2c-b320-ca633b4bdfc2.webm', 2, '2107273', 100, now() - interval '72038 seconds'),
  ('ae8454ac-9617-4fea-a037-299a497e4d5e', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'ea02e9f4-ee0e-4146-b0c0-0ec9a3d0f648', 'Acoustic draft (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/ea02e9f4-ee0e-4146-b0c0-0ec9a3d0f648/ae8454ac-9617-4fea-a037-299a497e4d5e.webm', 3, '3761451', 86, now() - interval '346101 seconds'),
  ('81cf7e92-a05f-439f-9843-db0827547ec0', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'ebf68078-5ddf-4737-b249-d4ecde8ae989', 'First Take', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/ebf68078-5ddf-4737-b249-d4ecde8ae989/81cf7e92-a05f-439f-9843-db0827547ec0.wav', 1, '573584', 147, now() - interval '151891 seconds'),
  ('edf1e664-04df-40a1-8913-71beddfba30c', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'f1505419-bc11-4471-a20a-b27aace5b28d', 'Slow practice (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12/f1505419-bc11-4471-a20a-b27aace5b28d/edf1e664-04df-40a1-8913-71beddfba30c.webm', 1, '1056039', 93, now() - interval '368410 seconds'),
  ('d4c95fbc-f6f7-4d54-9538-bbd4ef9bd56a', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'f1505419-bc11-4471-a20a-b27aace5b28d', 'Slow practice (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12/f1505419-bc11-4471-a20a-b27aace5b28d/d4c95fbc-f6f7-4d54-9538-bbd4ef9bd56a.webm', 2, '2022894', 79, now() - interval '505354 seconds'),
  ('243b0cc0-8e2d-459b-8317-ae4aa95ec7ef', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'f1505419-bc11-4471-a20a-b27aace5b28d', 'Slow practice (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12/f1505419-bc11-4471-a20a-b27aace5b28d/243b0cc0-8e2d-459b-8317-ae4aa95ec7ef.webm', 3, '1529231', 109, now() - interval '252737 seconds'),
  ('62cd573a-f650-46b7-9c59-411db3bfba37', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'f1505419-bc11-4471-a20a-b27aace5b28d', 'Slow practice (Take 4)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12/f1505419-bc11-4471-a20a-b27aace5b28d/62cd573a-f650-46b7-9c59-411db3bfba37.webm', 4, '745379', 141, now() - interval '387812 seconds'),
  ('d1a1c0ab-811c-4084-a3e7-e2044a235a1d', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'f1505419-bc11-4471-a20a-b27aace5b28d', 'Slow practice (Take 5)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12/f1505419-bc11-4471-a20a-b27aace5b28d/d1a1c0ab-811c-4084-a3e7-e2044a235a1d.webm', 5, '1652042', 131, now() - interval '472408 seconds'),
  ('8a6e9b4d-b0d3-489f-8671-7b9a2f7d1ccb', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'f1f2687a-a6e3-4f28-9c0a-68235a7c174e', 'First Take (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/f1f2687a-a6e3-4f28-9c0a-68235a7c174e/8a6e9b4d-b0d3-489f-8671-7b9a2f7d1ccb.wav', 1, '3763069', 51, now() - interval '477186 seconds'),
  ('5e4c13c9-8ef6-451d-a7a7-4beb88824226', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'f1f2687a-a6e3-4f28-9c0a-68235a7c174e', 'First Take (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/f1f2687a-a6e3-4f28-9c0a-68235a7c174e/5e4c13c9-8ef6-451d-a7a7-4beb88824226.wav', 2, '3995740', 181, now() - interval '382277 seconds'),
  ('83b50341-c938-4edf-b057-7fe3f1f20c21', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'f1f2687a-a6e3-4f28-9c0a-68235a7c174e', 'First Take (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/f1f2687a-a6e3-4f28-9c0a-68235a7c174e/83b50341-c938-4edf-b057-7fe3f1f20c21.wav', 3, '1948631', 117, now() - interval '342780 seconds'),
  ('e8aa24a7-683f-4321-a807-573ce6c52cca', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'f1f2687a-a6e3-4f28-9c0a-68235a7c174e', 'First Take (Take 4)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/f1f2687a-a6e3-4f28-9c0a-68235a7c174e/e8aa24a7-683f-4321-a807-573ce6c52cca.wav', 4, '3151330', 102, now() - interval '609700 seconds');
INSERT INTO public.user_recordings (id, user_id, song_version_id, recording_name, storage_path, position, file_size_bytes, duration_seconds, created_at) VALUES
  ('4c9c3c70-8d11-43e4-8d80-2ce361524ccb', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'f202d165-a33d-48cb-913b-8373c9c70096', 'Full run-through', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/f202d165-a33d-48cb-913b-8373c9c70096/4c9c3c70-8d11-43e4-8d80-2ce361524ccb.webm', 1, '228559', 114, now() - interval '112583 seconds'),
  ('283d4377-b722-4f17-aaa3-ef9e158cb6c8', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'f34402cd-ee93-4b63-858b-f8054feb20b9', 'Acoustic draft (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/f34402cd-ee93-4b63-858b-f8054feb20b9/283d4377-b722-4f17-aaa3-ef9e158cb6c8.webm', 1, '299675', 108, now() - interval '407028 seconds'),
  ('508c742a-104f-4afa-9a4b-164d43a91926', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'f34402cd-ee93-4b63-858b-f8054feb20b9', 'Acoustic draft (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/f34402cd-ee93-4b63-858b-f8054feb20b9/508c742a-104f-4afa-9a4b-164d43a91926.webm', 2, '3447384', 89, now() - interval '274735 seconds'),
  ('8f2ae822-82b0-4737-9eb0-22d51c2fadab', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'f34402cd-ee93-4b63-858b-f8054feb20b9', 'Acoustic draft (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/f34402cd-ee93-4b63-858b-f8054feb20b9/8f2ae822-82b0-4737-9eb0-22d51c2fadab.webm', 3, '3889873', 113, now() - interval '519632 seconds'),
  ('68d9af7b-bda3-4ea8-9691-89eff50f984f', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'f3abd6ad-945b-4159-919a-d379f8c12a35', 'Late Night run (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12/f3abd6ad-945b-4159-919a-d379f8c12a35/68d9af7b-bda3-4ea8-9691-89eff50f984f.webm', 1, '1508087', 164, now() - interval '225777 seconds'),
  ('2d1a7fc1-327d-4600-9039-d302e86cc6e4', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'f3abd6ad-945b-4159-919a-d379f8c12a35', 'Late Night run (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12/f3abd6ad-945b-4159-919a-d379f8c12a35/2d1a7fc1-327d-4600-9039-d302e86cc6e4.webm', 2, '3136759', 35, now() - interval '490312 seconds'),
  ('55aff61d-0700-479d-af84-81faa8776232', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'f3abd6ad-945b-4159-919a-d379f8c12a35', 'Late Night run (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12/f3abd6ad-945b-4159-919a-d379f8c12a35/55aff61d-0700-479d-af84-81faa8776232.webm', 3, '2979450', 110, now() - interval '427634 seconds'),
  ('2ca5f74d-d978-41a2-b185-30440e39d680', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'f40a99de-c4ea-4cd9-a6cc-2f30120bef40', 'First Take', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14/f40a99de-c4ea-4cd9-a6cc-2f30120bef40/2ca5f74d-d978-41a2-b185-30440e39d680.webm', 1, '2718297', 117, now() - interval '383024 seconds'),
  ('c0b38498-4a09-4595-8b03-21069bc5b69f', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'f8c302b5-270f-4a1e-b611-a62efe2e1e7a', 'Practice Session (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/f8c302b5-270f-4a1e-b611-a62efe2e1e7a/c0b38498-4a09-4595-8b03-21069bc5b69f.webm', 1, '2819456', 169, now() - interval '529817 seconds'),
  ('aadd7477-88e7-4a20-ad00-c6090cb48107', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'f8c302b5-270f-4a1e-b611-a62efe2e1e7a', 'Practice Session (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/f8c302b5-270f-4a1e-b611-a62efe2e1e7a/aadd7477-88e7-4a20-ad00-c6090cb48107.webm', 2, '2828001', 153, now() - interval '434366 seconds'),
  ('da399b5e-9d6f-495f-849e-810ef5f96d1b', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'f8c302b5-270f-4a1e-b611-a62efe2e1e7a', 'Practice Session (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/f8c302b5-270f-4a1e-b611-a62efe2e1e7a/da399b5e-9d6f-495f-849e-810ef5f96d1b.webm', 3, '3643211', 64, now() - interval '250728 seconds'),
  ('65e0a35e-12a8-4d3e-ad8a-cbad1627dc2a', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'fa01a117-3f4b-4098-bd90-b83f8e5fc379', 'Practice Session', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/fa01a117-3f4b-4098-bd90-b83f8e5fc379/65e0a35e-12a8-4d3e-ad8a-cbad1627dc2a.webm', 1, '3923553', 168, now() - interval '120623 seconds'),
  ('40215aa2-7b9e-424f-babc-53ce84c41d24', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'fd936d40-6757-437d-a935-6eb0d7cbcf6a', 'Slow practice', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13/fd936d40-6757-437d-a935-6eb0d7cbcf6a/40215aa2-7b9e-424f-babc-53ce84c41d24.webm', 1, '2109679', 172, now() - interval '87778 seconds'),
  ('091449e8-c056-4577-878f-a099d890fa3d', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'ff9271d7-7c6d-45d2-9fe1-8a4d2115f6da', 'Practice Session (Take 1)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/ff9271d7-7c6d-45d2-9fe1-8a4d2115f6da/091449e8-c056-4577-878f-a099d890fa3d.wav', 1, '2616311', 189, now() - interval '168397 seconds'),
  ('ea265726-ea3a-4fc5-a57d-37a84d9eab6e', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'ff9271d7-7c6d-45d2-9fe1-8a4d2115f6da', 'Practice Session (Take 2)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/ff9271d7-7c6d-45d2-9fe1-8a4d2115f6da/ea265726-ea3a-4fc5-a57d-37a84d9eab6e.wav', 2, '619981', 111, now() - interval '389367 seconds'),
  ('8a02dcf1-873d-457b-a504-badc9b6e1759', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'ff9271d7-7c6d-45d2-9fe1-8a4d2115f6da', 'Practice Session (Take 3)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/ff9271d7-7c6d-45d2-9fe1-8a4d2115f6da/8a02dcf1-873d-457b-a504-badc9b6e1759.wav', 3, '1815696', 151, now() - interval '364610 seconds'),
  ('dfc51775-59fb-4242-b300-8936296f7ec0', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'ff9271d7-7c6d-45d2-9fe1-8a4d2115f6da', 'Practice Session (Take 4)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/ff9271d7-7c6d-45d2-9fe1-8a4d2115f6da/dfc51775-59fb-4242-b300-8936296f7ec0.wav', 4, '2198416', 160, now() - interval '458855 seconds'),
  ('83c62cd2-c710-4629-8506-8ffaba75677a', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'ff9271d7-7c6d-45d2-9fe1-8a4d2115f6da', 'Practice Session (Take 5)', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/ff9271d7-7c6d-45d2-9fe1-8a4d2115f6da/83c62cd2-c710-4629-8506-8ffaba75677a.wav', 5, '2947740', 163, now() - interval '254543 seconds');

-- Recently viewed (23)
INSERT INTO public.song_views (user_id, song_id, viewed_at) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2358a04a-e7aa-43d2-b0db-9d2ec523bbc6', now() - interval '679487 seconds'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2db9c970-bf02-4f9a-b74b-da286cfd2ff0', now() - interval '537813 seconds'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '379a01a8-552c-4688-8afc-dfe44591bb9e', now() - interval '613024 seconds'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '3cabe193-ac88-4619-9bab-28d29bb7afe7', now() - interval '104779 seconds'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '5de03246-cbfc-454e-ab0e-24cc3bea5366', now() - interval '36694 seconds'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'ab02b3b9-1cee-4eef-b76e-513211075d31', now() - interval '92980 seconds'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'ee2a6364-cab6-43ab-8ed5-15ee68134133', now() - interval '459266 seconds'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '2358a04a-e7aa-43d2-b0db-9d2ec523bbc6', now() - interval '217890 seconds'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '37951bb6-96cc-4907-a6a8-516ba082c510', now() - interval '401970 seconds'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '3cabe193-ac88-4619-9bab-28d29bb7afe7', now() - interval '738158 seconds'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '3faac046-e8db-4354-b779-6c9a9c945224', now() - interval '459662 seconds'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '43f033ce-9715-4346-9ac1-1a55182ae6f3', now() - interval '799249 seconds'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '542d4011-057f-46c4-8362-233e5b63fef3', now() - interval '182115 seconds'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '6f06959c-c905-4afb-a53e-810b8b1892eb', now() - interval '624693 seconds'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '737c7840-44d5-4434-a57f-8c7e121e07ba', now() - interval '163513 seconds'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '7a80f369-7869-4a99-a1c2-310a018bbf5d', now() - interval '72895 seconds'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '9919e38c-3fcf-4b6a-b0fe-7c4c94c801c3', now() - interval '386488 seconds'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b882d663-3c59-40c8-8385-7b3852aa72c8', now() - interval '515686 seconds'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'c592bba5-19a4-4aaa-b822-1bddf3880efa', now() - interval '513302 seconds'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'ca7bba27-3b15-4eaa-87a3-20def74c53af', now() - interval '379303 seconds'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'ed028840-31be-4ee4-83af-551b14251f71', now() - interval '662309 seconds'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'edef27fa-a31f-4720-a66f-4890a2582898', now() - interval '114976 seconds'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'f718e0e5-80cb-4613-8e45-62c74ebdbe85', now() - interval '601305 seconds')
ON CONFLICT (user_id, song_id) DO NOTHING;

