-- Remove deprecated tags from categories table
-- 2026-02-07 02:30:00
DELETE FROM public.categories
WHERE slug IN (
    'andean',
    'amazonian',
    'native-american',
    'medicine-songs'
  );