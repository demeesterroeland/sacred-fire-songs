-- AI generated tagging: Assign tags to initial songs based on suggestions from AI
-- Mapping categories for songs that were previously untagged
-- Based on the provided category slugs and song content

-- add tags to songs without tags
-- Enrichment Script for existing songs in the database
-- This script maps additional descriptive slugs to compositions based on their lyrics/metadata

DO $$ 
BEGIN

-- 1. Agradecer, agradecer: Adding 'gratitude' and 'love-heart'
INSERT INTO public.song_category_map (song_id, category_id)
SELECT c.id, cat.id 
FROM public.compositions c, public.categories cat
WHERE c.title = 'Agradecer, agradecer' 
AND cat.slug IN ('gratitude', 'love-heart')
ON CONFLICT DO NOTHING;

-- 2. Aho Gran Espíritu: Adding 'mountain', 'sun', and 'plegarias'
INSERT INTO public.song_category_map (song_id, category_id)
SELECT c.id, cat.id 
FROM public.compositions c, public.categories cat
WHERE c.title = 'Aho Gran Espíritu' 
AND cat.slug IN ('mountain', 'sun', 'plegarias')
ON CONFLICT DO NOTHING;

-- 3. Bendice la Tierra: Adding 'healing-limpieza' and 'love-heart'
INSERT INTO public.song_category_map (song_id, category_id)
SELECT c.id, cat.id 
FROM public.compositions c, public.categories cat
WHERE c.title = 'Bendice la Tierra' 
AND cat.slug IN ('healing-limpieza', 'love-heart')
ON CONFLICT DO NOTHING;

-- 4. Brilla Diamante: Adding 'love-heart' and 'plegarias'
INSERT INTO public.song_category_map (song_id, category_id)
SELECT c.id, cat.id 
FROM public.compositions c, public.categories cat
WHERE c.title = 'Brilla Diamante' 
AND cat.slug IN ('love-heart', 'plegarias')
ON CONFLICT DO NOTHING;

-- 5. Caboclo: Adding 'selva', 'water', and 'protection'
INSERT INTO public.song_category_map (song_id, category_id)
SELECT c.id, cat.id 
FROM public.compositions c, public.categories cat
WHERE c.title = 'Caboclo' 
AND cat.slug IN ('selva', 'water', 'protection')
ON CONFLICT DO NOTHING;

-- 6. Cuatro Vientos: Adding 'air', 'mountain', 'water', and 'selva'
INSERT INTO public.song_category_map (song_id, category_id)
SELECT c.id, cat.id 
FROM public.compositions c, public.categories cat
WHERE c.title = 'Cuatro Vientos' 
AND cat.slug IN ('air', 'mountain', 'water', 'selva')
ON CONFLICT DO NOTHING;

-- 7. Florecerá: Adding 'water', 'sun', 'love-heart', and 'plantas'
INSERT INTO public.song_category_map (song_id, category_id)
SELECT c.id, cat.id 
FROM public.compositions c, public.categories cat
WHERE c.title = 'Florecerá' 
AND cat.slug IN ('water', 'sun', 'love-heart', 'plantas')
ON CONFLICT DO NOTHING;

-- 8. Medicina Lapitoj: Adding 'animales', 'bird', and 'love-heart'
INSERT INTO public.song_category_map (song_id, category_id)
SELECT c.id, cat.id 
FROM public.compositions c, public.categories cat
WHERE c.title = 'Medicina Lapitoj' 
AND cat.slug IN ('animales', 'bird', 'love-heart')
ON CONFLICT DO NOTHING;

-- 9. Queen of the Web: Adding 'animales' and 'traditional'
INSERT INTO public.song_category_map (song_id, category_id)
SELECT c.id, cat.id 
FROM public.compositions c, public.categories cat
WHERE c.title = 'Queen of the Web' 
AND cat.slug IN ('animales', 'traditional')
ON CONFLICT DO NOTHING;

-- 10. Tamborcito: Adding 'earth', 'fire', 'water', 'air', and 'love-heart'
INSERT INTO public.song_category_map (song_id, category_id)
SELECT c.id, cat.id 
FROM public.compositions c, public.categories cat
WHERE c.title = 'Tamborcito' 
AND cat.slug IN ('earth', 'fire', 'water', 'air', 'love-heart')
ON CONFLICT DO NOTHING;

END $$;


--- add some extra tags to the initial songs
DO $$ 
BEGIN

-- Abuelitas piedras: Elements, Healing, and Temazcal
INSERT INTO public.song_category_map (song_id, category_id)
SELECT c.id, cat.id FROM public.compositions c, public.categories cat
WHERE c.title = 'Abuelitas piedras' 
AND cat.slug IN ('spanish', 'temazcal', 'love-heart', 'healing-limpieza', 'earth', 'water', 'air', 'fire')
ON CONFLICT DO NOTHING;

-- Abuelito Fuego: Fire and specific Master Plants
INSERT INTO public.song_category_map (song_id, category_id)
SELECT c.id, cat.id FROM public.compositions c, public.categories cat
WHERE c.title = 'Abuelito Fuego' 
AND cat.slug IN ('spanish', 'fire', 'love-heart', 'peyote', 'ayahuasca', 'tobacco')
ON CONFLICT DO NOTHING;

-- Agua cambia: The four basic elements
INSERT INTO public.song_category_map (song_id, category_id)
SELECT c.id, cat.id FROM public.compositions c, public.categories cat
WHERE c.title = 'Agua cambia' 
AND cat.slug IN ('spanish', 'water', 'fire', 'air', 'earth')
ON CONFLICT DO NOTHING;

-- Blessed we are: English earth prayer
INSERT INTO public.song_category_map (song_id, category_id)
SELECT c.id, cat.id FROM public.compositions c, public.categories cat
WHERE c.title = 'Blessed we are' 
AND cat.slug IN ('english', 'earth', 'plegarias')
ON CONFLICT DO NOTHING;

-- Calling: English elemental invocation
INSERT INTO public.song_category_map (song_id, category_id)
SELECT c.id, cat.id FROM public.compositions c, public.categories cat
WHERE c.title = 'Calling' 
AND cat.slug IN ('english', 'earth', 'water', 'fire', 'air', 'love-heart')
ON CONFLICT DO NOTHING;

-- Canto enamorado del pájaro: Bird nature song
INSERT INTO public.song_category_map (song_id, category_id)
SELECT c.id, cat.id FROM public.compositions c, public.categories cat
WHERE c.title = 'Canto enamorado del pájaro' 
AND cat.slug IN ('spanish', 'bird')
ON CONFLICT DO NOTHING;

-- Colhendo lírio lirulê: Portuguese water/river song
INSERT INTO public.song_category_map (song_id, category_id)
SELECT c.id, cat.id FROM public.compositions c, public.categories cat
WHERE c.title = 'Colhendo lírio lirulê' 
AND cat.slug IN ('portuguese', 'water')
ON CONFLICT DO NOTHING;

-- Core core: Pure vocalization
INSERT INTO public.song_category_map (song_id, category_id)
SELECT c.id, cat.id FROM public.compositions c, public.categories cat
WHERE c.title = 'Core core' 
AND cat.slug = 'vocalization'
ON CONFLICT DO NOTHING;

-- Down to the river: English water prayer
INSERT INTO public.song_category_map (song_id, category_id)
SELECT c.id, cat.id FROM public.compositions c, public.categories cat
WHERE c.title = 'Down to the river' 
AND cat.slug IN ('english', 'water', 'plegarias')
ON CONFLICT DO NOTHING;

-- Earth Water Blood: Bilingual elemental song
INSERT INTO public.song_category_map (song_id, category_id)
SELECT c.id, cat.id FROM public.compositions c, public.categories cat
WHERE c.title = 'Earth Water Blood' 
AND cat.slug IN ('english', 'spanish', 'earth', 'water', 'air', 'fire')
ON CONFLICT DO NOTHING;

-- Espíritu del agua: Water, Bird, and Ayahuasca
INSERT INTO public.song_category_map (song_id, category_id)
SELECT c.id, cat.id FROM public.compositions c, public.categories cat
WHERE c.title = 'Espíritu del agua' 
AND cat.slug IN ('spanish', 'water', 'bird', 'air', 'fire', 'ayahuasca')
ON CONFLICT DO NOTHING;

-- Eu sou Santa Maria: Portuguese Santo Daime lineage
INSERT INTO public.song_category_map (song_id, category_id)
SELECT c.id, cat.id FROM public.compositions c, public.categories cat
WHERE c.title = 'Eu sou Santa Maria' 
AND cat.slug IN ('portuguese', 'santa-maria', 'love-heart', 'santo-daime')
ON CONFLICT DO NOTHING;

-- Fly - little bird: English nature and heart song
INSERT INTO public.song_category_map (song_id, category_id)
SELECT c.id, cat.id FROM public.compositions c, public.categories cat
WHERE c.title = 'Fly - little bird' 
AND cat.slug IN ('english', 'bird', 'air', 'sun', 'moon', 'love-heart')
ON CONFLICT DO NOTHING;

-- Gitsi Manitou: English/Nahuatl star song
INSERT INTO public.song_category_map (song_id, category_id)
SELECT c.id, cat.id FROM public.compositions c, public.categories cat
WHERE c.title = 'Gitsi Manitou' 
AND cat.slug IN ('english', 'nahuatl')
ON CONFLICT DO NOTHING;

-- Ide were were: Yoruba/Water traditional
INSERT INTO public.song_category_map (song_id, category_id)
SELECT c.id, cat.id FROM public.compositions c, public.categories cat
WHERE c.title = 'Ide were were' 
AND cat.slug = 'water'
ON CONFLICT DO NOTHING;

-- L'albero: Italian tree/nature song
INSERT INTO public.song_category_map (song_id, category_id)
SELECT c.id, cat.id FROM public.compositions c, public.categories cat
WHERE c.title = 'L''albero' 
AND cat.slug IN ('italian', 'sun', 'air', 'water', 'love-heart', 'plantas')
ON CONFLICT DO NOTHING;

-- Mother I Feel You: English elemental/bird song
INSERT INTO public.song_category_map (song_id, category_id)
SELECT c.id, cat.id FROM public.compositions c, public.categories cat
WHERE c.title = 'Mother I Feel You' 
AND cat.slug IN ('english', 'earth', 'water', 'bird', 'fire')
ON CONFLICT DO NOTHING;

-- Mother I Honor You: English water/devotional
INSERT INTO public.song_category_map (song_id, category_id)
SELECT c.id, cat.id FROM public.compositions c, public.categories cat
WHERE c.title = 'Mother I Honor You' 
AND cat.slug IN ('english', 'water', 'love-heart')
ON CONFLICT DO NOTHING;

-- Siento la medica: Spanish solar/medicine song
INSERT INTO public.song_category_map (song_id, category_id)
SELECT c.id, cat.id FROM public.compositions c, public.categories cat
WHERE c.title = 'Siento la medica' 
AND cat.slug IN ('spanish', 'sun', 'love-heart', 'ayahuasca', 'san-pedro', 'medicine-songs')
ON CONFLICT DO NOTHING;

-- Sou Filho de Deus: Portuguese Santo Daime/Plant song
INSERT INTO public.song_category_map (song_id, category_id)
SELECT c.id, cat.id FROM public.compositions c, public.categories cat
WHERE c.title = 'Sou Filho de Deus' 
AND cat.slug IN ('portuguese', 'santa-maria', 'santo-daime', 'plantas')
ON CONFLICT DO NOTHING;

-- Tonantzin tzin tzin: Nahuatl earth and sun
INSERT INTO public.song_category_map (song_id, category_id)
SELECT c.id, cat.id FROM public.compositions c, public.categories cat
WHERE c.title = 'Tonantzin tzin tzin' 
AND cat.slug IN ('nahuatl', 'earth', 'sun')
ON CONFLICT DO NOTHING;

-- Weyo wey yanna: Extensive medicine plant and regional mapping
INSERT INTO public.song_category_map (song_id, category_id)
SELECT c.id, cat.id FROM public.compositions c, public.categories cat
WHERE c.title = 'Weyo wey yanna' 
AND cat.slug IN ('peyote', 'selva', 'animales', 'ayahuasca', 'andean', 'san-pedro', 'plantas')
ON CONFLICT DO NOTHING;

-- Wichita tuya: Lakota tradition
INSERT INTO public.song_category_map (song_id, category_id)
SELECT c.id, cat.id FROM public.compositions c, public.categories cat
WHERE c.title = 'Wichita tuya' 
AND cat.slug = 'lakota'
ON CONFLICT DO NOTHING;

-- Agüita: Spanish water and mountain song
INSERT INTO public.song_category_map (song_id, category_id)
SELECT c.id, cat.id FROM public.compositions c, public.categories cat
WHERE c.title = 'Agüita' 
AND cat.slug IN ('spanish', 'water', 'mountain', 'love-heart', 'native-american')
ON CONFLICT DO NOTHING;

END $$;