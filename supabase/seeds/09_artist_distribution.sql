-- Seed extension: Distribute diverse medicine music artists across compositions
WITH target_songs AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY title) as rn
  FROM public.compositions
  WHERE original_author = 'Traditional' OR original_author IS NULL
)
UPDATE public.compositions c
SET original_author = CASE (ts.rn % 10)
  WHEN 1 THEN 'Peia'
  WHEN 2 THEN 'Curawaka'
  WHEN 3 THEN 'Ayla Nereo'
  WHEN 4 THEN 'Danit'
  WHEN 5 THEN 'Shimshai'
  WHEN 6 THEN 'Alain Merens'
  WHEN 7 THEN 'Nico Pérez'
  WHEN 8 THEN 'Xavier Rudd'
  WHEN 9 THEN 'Fiona Helmer'
  ELSE 'Traditional'
END
FROM target_songs ts
WHERE c.id = ts.id;
