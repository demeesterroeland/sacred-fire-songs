-- Story 6.1.26 / G6.1 (#410), owner decision UXD-2:
-- guests may listen to public takes ONLY when the take was published with singer consent.
-- Tightens both anon read policies (table row + storage object). No data is changed:
-- takes that are public without consent simply stop being visible to anon.

DROP POLICY IF EXISTS "Allow public to read public recordings" ON public.user_recordings;
CREATE POLICY "Allow public to read public recordings" ON public.user_recordings FOR SELECT TO anon
USING (is_public = true AND singer_consent_confirmed = true);

DROP POLICY IF EXISTS "Allow public to read public rehearsals" ON storage.objects;
CREATE POLICY "Allow public to read public rehearsals" ON storage.objects FOR SELECT TO anon
USING (
  bucket_id = 'rehearsals'
  AND EXISTS (
    SELECT 1 FROM public.user_recordings ur
    WHERE ur.storage_path = name
    AND ur.is_public = true
    AND ur.singer_consent_confirmed = true
  )
);
