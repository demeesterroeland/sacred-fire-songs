import { createClient } from "@/lib/supabase/server";
import type { Song } from "@/lib/songUtils";
import type { TaxonomyNode } from "@/lib/taxonomyUtils";

/**
 * Server-side version of fetchSongs — uses the server Supabase client (cookie-aware).
 * Only import this from Server Components or Server Actions.
 */
export async function fetchSongsServer(limit?: number): Promise<Song[]> {
    const supabase = await createClient();

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
