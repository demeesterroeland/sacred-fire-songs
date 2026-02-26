import { createClient } from "@/lib/supabase/server";
import type { Song } from "@/lib/songUtils";
import type { TaxonomyNode } from "@/lib/taxonomyUtils";

/**
 * Server-side version of fetchSongs — uses the server Supabase client (cookie-aware).
 * Only import this from Server Components or Server Actions.
 */
export async function fetchSongsServer(limit?: number): Promise<Song[]> {
    const supabase = await createClient();

    // Fetch songs and user's favorites in parallel
    const [songsResult, favoriteIds] = await Promise.all([
        (() => {
            let q = supabase
                .from('compositions')
                .select(`
                    *,
                    song_versions(key, content_chordpro, melody_notation),
                    song_category_map (
                      categories (
                        name,
                        slug,
                        parent:parent_id (
                          name,
                          slug
                        )
                      )
                    )
                `)
                .order('created_at', { ascending: false });
            if (limit) q = q.limit(limit);
            return q;
        })(),
        (async () => {
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

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return new Set<string>((items || []).map((i: any) => i.song_versions?.composition_id).filter(Boolean));
        })(),
    ]);

    if (songsResult.error) {
        console.error('fetchSongsServer query error:', songsResult.error);
        return [];
    }

    return songsResult.data.map(item => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const version = (item.song_versions as any[])?.[0];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawCategories = (item.song_category_map as any[]) || [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const categories = rawCategories.map((mapItem: any) => {
            const cat = mapItem.categories;
            return {
                name: cat.name,
                slug: cat.slug,
                parent: cat.parent?.name || null,
                parentSlug: cat.parent?.slug || null
            };
        });

        return {
            id: item.id,
            title: item.title,
            author: item.original_author || "Unknown",
            songKey: version?.key || null,
            content: version?.content_chordpro || "",
            melodyNotation: version?.melody_notation || "",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ownerId: (item as any).owner_id ?? undefined,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            isPublic: (item as any).is_public ?? true,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            hasChords: (item as any).has_chords ?? false,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            hasMelody: (item as any).has_melody ?? false,
            createdAt: item.created_at,
            color: "red",
            categories: categories,
            isFavorite: favoriteIds.has(item.id),
        } as Song;
    });
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
