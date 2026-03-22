-- Track which songs a user has viewed (for "Recently Viewed" feature)
CREATE TABLE IF NOT EXISTS public.song_views (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  song_id uuid REFERENCES public.compositions(id) ON DELETE CASCADE NOT NULL,
  viewed_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE (user_id, song_id)
);

-- Index for efficient "recently viewed" queries
CREATE INDEX IF NOT EXISTS idx_song_views_user_viewed
  ON public.song_views (user_id, viewed_at DESC);

-- RLS
ALTER TABLE public.song_views ENABLE ROW LEVEL SECURITY;

-- Users can read their own views
CREATE POLICY "Users can read own song views"
  ON public.song_views FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert/update their own views
CREATE POLICY "Users can upsert own song views"
  ON public.song_views FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own song views"
  ON public.song_views FOR UPDATE
  USING (auth.uid() = user_id);
