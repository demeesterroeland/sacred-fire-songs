-- Functional Update: Set has_chords and has_melody flags based on content/media analysis
DO $$ BEGIN -- 1. Identify songs that ACTUALLY have chords in ChordPro
UPDATE public.compositions c
SET has_chords = EXISTS (
    SELECT 1
    FROM public.song_versions v
    WHERE v.composition_id = c.id
      AND v.content_chordpro ~ '\[[A-G]'
  );
-- 2. Set has_melody based on media links or notation
UPDATE public.compositions c
SET has_melody = EXISTS (
    SELECT 1
    FROM public.song_versions v
    WHERE v.composition_id = c.id
      AND (
        v.youtube_url IS NOT NULL
        OR v.spotify_url IS NOT NULL
        OR v.soundcloud_url IS NOT NULL
        OR v.melody_notation IS NOT NULL
      )
  );
END $$;