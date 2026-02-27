// app/actions/mergeGuestFavorites.ts
'use server';

import { createClient } from '@/lib/supabase/server';

export async function mergeGuestFavorites(guestCompositionIds: string[]): Promise<{ merged: number }> {
  if (!guestCompositionIds.length) return { merged: 0 };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { merged: 0 };

  // Find or create "My Favorites" setlist
  let { data: setlist } = await supabase
    .from('setlists')
    .select('id')
    .eq('owner_id', user.id)
    .eq('title', 'My Favorites')
    .maybeSingle();

  if (!setlist) {
    const { data: newSetlist, error } = await supabase
      .from('setlists')
      .insert({ owner_id: user.id, title: 'My Favorites', is_public: false })
      .select('id')
      .single();
    if (error || !newSetlist) return { merged: 0 };
    setlist = newSetlist;
  }

  // Get first song_version_id for each composition
  const { data: versions } = await supabase
    .from('song_versions')
    .select('id, composition_id')
    .in('composition_id', guestCompositionIds);

  if (!versions?.length) return { merged: 0 };

  // Get existing setlist items to avoid duplicates
  const { data: existing } = await supabase
    .from('setlist_items')
    .select('song_version_id')
    .eq('setlist_id', setlist.id);

  const existingIds = new Set(existing?.map(e => e.song_version_id) ?? []);

  // Get current max order_index
  const { data: maxItem } = await supabase
    .from('setlist_items')
    .select('order_index')
    .eq('setlist_id', setlist.id)
    .order('order_index', { ascending: false })
    .limit(1)
    .maybeSingle();

  let orderIndex = (maxItem?.order_index ?? -1) + 1;

  // Build inserts (one per composition, using first version, skip existing)
  const seen = new Set<string>();
  const toInsert = [];
  for (const v of versions) {
    if (existingIds.has(v.id) || seen.has(v.composition_id)) continue;
    seen.add(v.composition_id);
    toInsert.push({ setlist_id: setlist.id, song_version_id: v.id, order_index: orderIndex++ });
  }

  if (!toInsert.length) return { merged: 0 };

  await supabase.from('setlist_items').insert(toInsert);
  return { merged: toInsert.length };
}
