'use server';

import { createClient } from '@/lib/supabase/server';

export async function recordSongView(songId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from('song_views')
    .upsert(
      { user_id: user.id, song_id: songId, viewed_at: new Date().toISOString() },
      { onConflict: 'user_id,song_id' }
    );
}
