import { createClient } from "@/lib/supabase/server";
import type { Song } from "@/lib/songUtils";
import type { TaxonomyNode } from "@/lib/taxonomyUtils";
import { songsQuery, mapCompositionToSong } from './queries';
import type { SupabaseClient } from "@supabase/supabase-js";

const PAGE_SIZE = 20;

async function fetchFavoriteIds(supabase: SupabaseClient) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Set<string>();

    const { data: setlist } = await supabase
        .from('setlists')
        .select('id')
        .eq('owner_id', user.id)
        .eq('title', 'My Favorites')
        .maybeSingle();

    if (!setlist) return new Set<string>();

    const { data: items } = await supabase
        .from('setlist_items')
        .select('song_versions(composition_id)')
        .eq('setlist_id', setlist.id);

    return new Set<string>(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (items || []).map((i: any) => i.song_versions?.composition_id).filter(Boolean)
    );
}

/**
 * Server-side version of fetchSongs — uses the server Supabase client (cookie-aware).
 * Only import this from Server Components or Server Actions.
 */
export async function fetchSongsServer(limit?: number): Promise<Song[]> {
    const supabase = await createClient();

    const [songsResult, favoriteIds] = await Promise.all([
        songsQuery(supabase, { limit: limit ?? undefined }),
        fetchFavoriteIds(supabase),
    ]);

    if (songsResult.error) {
        console.error('fetchSongsServer query error:', songsResult.error);
        return [];
    }

    return songsResult.data.map(item => mapCompositionToSong(item, favoriteIds));
}

/**
 * Paginated server-side fetch for infinite scroll.
 */
export async function fetchSongsPageServer(cursor?: string): Promise<{
    songs: Song[];
    nextCursor: string | null;
    totalCount: number;
}> {
    const supabase = await createClient();

    const [songsResult, favoriteIds, countResult] = await Promise.all([
        songsQuery(supabase, { limit: PAGE_SIZE, cursor }),
        fetchFavoriteIds(supabase),
        supabase.from('compositions').select('id', { count: 'exact', head: true }),
    ]);

    if (songsResult.error) {
        console.error('fetchSongsPageServer error:', songsResult.error);
        return { songs: [], nextCursor: null, totalCount: 0 };
    }

    const songs = songsResult.data.map(item => mapCompositionToSong(item, favoriteIds));
    const nextCursor = songs.length === PAGE_SIZE
        ? `${songs[songs.length - 1].createdAt}::${songs[songs.length - 1].id}`
        : null;

    return { songs, nextCursor, totalCount: countResult.count ?? 0 };
}

/**
 * Fetches songs in the authenticated user's "My Favorites" setlist.
 * Returns an empty array if the user is not authenticated or has no favorites.
 * Only import this from Server Components or Server Actions.
 */
export async function fetchFavoriteSongsServer(): Promise<Song[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data: setlist } = await supabase
        .from('setlists')
        .select('id')
        .eq('owner_id', user.id)
        .eq('title', 'My Favorites')
        .maybeSingle();

    if (!setlist) return [];

    const { data, error } = await supabase
        .from('setlist_items')
        .select(`
            order_index,
            song_versions(
                key,
                content_chordpro,
                melody_notation,
                compositions(
                    id,
                    title,
                    original_author,
                    is_public,
                    has_chords,
                    has_melody,
                    owner_id,
                    created_at,
                    song_category_map(
                        categories(
                            name,
                            slug,
                            parent:parent_id(name, slug)
                        )
                    )
                )
            )
        `)
        .eq('setlist_id', setlist.id)
        .order('order_index');

    if (error || !data) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data as any[]).flatMap((item) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const version = item.song_versions as any;
        if (!version) return [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const composition = version.compositions as any;
        if (!composition) return [];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawCategories = (composition.song_category_map as any[]) || [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const categories = rawCategories.map((mapItem: any) => {
            const cat = mapItem.categories;
            return {
                name: cat.name,
                slug: cat.slug,
                parent: cat.parent?.name || null,
                parentSlug: cat.parent?.slug || null,
            };
        });

        return [{
            id: composition.id,
            title: composition.title,
            author: composition.original_author || 'Unknown',
            songKey: version.key || null,
            content: version.content_chordpro || '',
            melodyNotation: version.melody_notation || '',
            ownerId: composition.owner_id,
            isPublic: composition.is_public ?? true,
            hasChords: composition.has_chords ?? false,
            hasMelody: composition.has_melody ?? false,
            createdAt: composition.created_at,
            color: 'red',
            categories,
        } as Song];
    });
}

export interface LibrarySummary {
    favoritesCount: number;
    draftsCount: number;
    mySongsCount: number;
    newSongsCount: number;
}

/**
 * Fetch aggregate counts for the home page "Your Library" summary.
 * Only import from Server Components or Server Actions.
 */
export async function getLibrarySummary(userId: string, isAdmin = false): Promise<LibrarySummary> {
    const supabase = await createClient();

    // Favorites count
    let favoritesCount = 0;
    const { data: favSetlist } = await supabase
        .from('setlists')
        .select('id')
        .eq('owner_id', userId)
        .eq('title', 'My Favorites')
        .maybeSingle();
    if (favSetlist) {
        const { count } = await supabase
            .from('setlist_items')
            .select('id', { count: 'exact', head: true })
            .eq('setlist_id', favSetlist.id);
        favoritesCount = count ?? 0;
    }

    // My songs count (songs I own)
    const { count: mySongsCount } = await supabase
        .from('compositions')
        .select('id', { count: 'exact', head: true })
        .eq('owner_id', userId);

    // Drafts count (all non-public songs visible to user via RLS)
    const { count: draftsCount } = await supabase
        .from('compositions')
        .select('id', { count: 'exact', head: true })
        .eq('is_public', false);

    // New songs: public, created in last 30 days, never viewed by this user
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: viewedIds } = await supabase
        .from('song_views')
        .select('song_id')
        .eq('user_id', userId);
    const viewedSet = new Set((viewedIds ?? []).map(v => v.song_id));

    // Count unviewed public songs from last 30 days
    let newSongsCount = 0;
    const { data: recentPublic } = await supabase
        .from('compositions')
        .select('id')
        .eq('is_public', true)
        .gte('created_at', thirtyDaysAgo);
    if (recentPublic) {
        newSongsCount = recentPublic.filter(c => !viewedSet.has(c.id)).length;
    }

    // Admins: also count unviewed drafts by other users
    if (isAdmin) {
        const { data: recentDrafts } = await supabase
            .from('compositions')
            .select('id')
            .eq('is_public', false)
            .neq('owner_id', userId)
            .gte('created_at', thirtyDaysAgo);
        if (recentDrafts) {
            newSongsCount += recentDrafts.filter(c => !viewedSet.has(c.id)).length;
        }
    }

    return {
        favoritesCount,
        draftsCount: draftsCount ?? 0,
        mySongsCount: mySongsCount ?? 0,
        newSongsCount,
    };
}

/**
 * Fetch recently viewed songs for a user.
 */
export async function getRecentlyViewed(userId: string, limit = 10): Promise<Song[]> {
    const supabase = await createClient();

    const { data: views } = await supabase
        .from('song_views')
        .select('song_id, viewed_at')
        .eq('user_id', userId)
        .order('viewed_at', { ascending: false })
        .limit(limit);

    if (!views?.length) return [];

    const songIds = views.map(v => v.song_id);
    const [songsResult, favoriteIds] = await Promise.all([
        songsQuery(supabase, { songIds }),
        fetchFavoriteIds(supabase),
    ]);

    if (songsResult.error) return [];

    // Maintain viewed_at order
    const songMap = new Map(songsResult.data.map(s => [s.id, s]));
    return songIds
        .map(id => songMap.get(id))
        .filter(Boolean)
        .map(item => mapCompositionToSong(item!, favoriteIds));
}

/**
 * Lightweight fetch of recently viewed songs — only id, title, author.
 * Skips category joins and favorites lookup for faster page loads.
 */
export async function getRecentlyViewedLight(userId: string, limit = 50): Promise<Pick<Song, 'id' | 'title' | 'author'>[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('song_views')
        .select('compositions(id, title, original_author)')
        .eq('user_id', userId)
        .order('viewed_at', { ascending: false })
        .limit(limit);

    if (error || !data) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data as any[])
        .map(row => row.compositions)
        .filter(Boolean)
        .map(c => ({
            id: c.id,
            title: c.title,
            author: c.original_author || 'Unknown',
        }));
}

/**
 * Count total recently viewed songs for a user.
 */
export async function getRecentlyViewedCount(userId: string): Promise<number> {
    const supabase = await createClient();
    const { count } = await supabase
        .from('song_views')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);
    return count ?? 0;
}

/**
 * Fetch public songs from the last 30 days that the user has never viewed.
 */
export async function getUnviewedSongs(userId: string, limit = 20): Promise<Song[]> {
    const supabase = await createClient();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Get all song IDs the user has viewed
    const { data: viewedIds } = await supabase
        .from('song_views')
        .select('song_id')
        .eq('user_id', userId);
    const viewedSet = new Set((viewedIds ?? []).map(v => v.song_id));

    // Get recent public songs
    const { data: recentPublic, error } = await supabase
        .from('compositions')
        .select('id')
        .eq('is_public', true)
        .gte('created_at', thirtyDaysAgo)
        .order('created_at', { ascending: false });

    if (error || !recentPublic?.length) return [];

    // Filter out viewed songs and apply limit
    const unviewedIds = recentPublic
        .filter(c => !viewedSet.has(c.id))
        .slice(0, limit)
        .map(c => c.id);

    if (unviewedIds.length === 0) return [];

    const [songsResult, favoriteIds] = await Promise.all([
        songsQuery(supabase, { songIds: unviewedIds }),
        fetchFavoriteIds(supabase),
    ]);

    if (songsResult.error) return [];
    return songsResult.data.map(item => mapCompositionToSong(item, favoriteIds));
}

/**
 * Fetch all song IDs that a user has viewed (for client-side "new" filtering).
 */
export async function getViewedSongIds(userId: string): Promise<string[]> {
    const supabase = await createClient();
    const { data } = await supabase
        .from('song_views')
        .select('song_id')
        .eq('user_id', userId);
    return (data ?? []).map(v => v.song_id);
}

/**
 * Server-side version of fetchCategoryTree — uses the server Supabase client.
 * Only import this from Server Components or Server Actions.
 */
export async function fetchCategoryTreeServer(): Promise<TaxonomyNode[]> {
    const supabase = await createClient();

    const { data: categories, error } = await supabase
        .from('categories')
        .select('id, name, slug, emoji, icon_name, parent_id')
        .order('name');

    if (error) {
        console.error('Error fetching categories:', JSON.stringify(error, null, 2));
        return [];
    }

    if (!categories) return [];

    const parents = categories.filter(c => !c.parent_id);
    const children = categories.filter(c => c.parent_id);

    return parents.map(parent => ({
        ...parent,
        children: children
            .filter(child => child.parent_id === parent.id)
            .map(child => ({ ...child, children: [] }))
    }));
}
