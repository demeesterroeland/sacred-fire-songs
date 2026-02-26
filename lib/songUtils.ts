import { createClient } from "./supabase/client";

// lib/songUtils.ts
export interface Song {
    id: string;
    title: string;
    author: string;
    songKey: string | null;
    color: string;
    ownerId?: string;
    isPublic?: boolean;
    hasChords?: boolean;
    hasMelody?: boolean;
    isFavorite?: boolean;
    content?: string; // ChordPro content for searching
    melodyNotation?: string;
    createdAt: string;
    categories: {
        name: string;
        slug: string;
        parent: string | null;
        parentSlug: string | null;
    }[];
}

/**
 * Filters a list of songs by title, author, content, tags (AND), or categories (OR).
 */
export function filterSongs(songs: Song[], query: string, activeFilter: 'all' | 'public' | 'draft' = 'all', additionalFilters?: { tag?: string, category?: string }) {
    const lowerQuery = query.toLowerCase();

    let filtered = songs.filter(song => {
        // 1. Text Search
        const matchesText = song.title.toLowerCase().includes(lowerQuery) ||
            song.author.toLowerCase().includes(lowerQuery) ||
            (song.content && song.content.toLowerCase().includes(lowerQuery));

        return matchesText;
    });

    // 2. Tag Filter (AND Logic - song must have ALL these tags)
    if (additionalFilters?.tag) {
        const requiredTags = additionalFilters.tag.split(',').map(t => t.trim()).filter(Boolean);
        if (requiredTags.length > 0) {
            filtered = filtered.filter(song =>
                requiredTags.every(reqTag =>
                    song.categories.some(cat => cat.slug === reqTag)
                )
            );
        }
    }

    // 3. Category Filter (OR Logic - song must have AT LEAST ONE tag from this parent category)
    if (additionalFilters?.category) {
        filtered = filtered.filter(song =>
            song.categories.some(cat => cat.parentSlug === additionalFilters.category)
        );
    }

    return filtered;
}

/**
 * Shared song fetching logic
 */
export const fetchSongs = async (limit?: number) => {
    const supabase = createClient();

    // We need to fetch:
    // 1. Composition details
    // 2. Default version (for key/content)
    // 3. Categories (via logic: song -> song_category_map -> categories -> parent category)
    // Note: PostgREST syntax for nested self-referencing tables can be tricky. 
    // We will select: song_category_map(categories(name, slug, parent:parent_id(name, slug)))

    let query = supabase
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

    if (limit) {
        query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data.map(item => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const version = (item.song_versions as any[])?.[0];

        // Map categories
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawCategories = (item.song_category_map as any[]) || [];
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
            categories: categories
        } as Song;
    });
};