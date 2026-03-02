import { createClient } from "./supabase/client";
import { songsQuery, mapCompositionToSong } from './songs/queries';

const PAGE_SIZE = 20;

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
    const { data, error } = await songsQuery(supabase, { limit: limit ?? undefined });
    if (error) throw error;
    return data.map(item => mapCompositionToSong(item));
};

/**
 * Paginated client-side fetch for infinite scroll.
 */
export const fetchSongsPage = async (cursor?: string) => {
    const supabase = createClient();
    const { data, error } = await songsQuery(supabase, { limit: PAGE_SIZE, cursor });
    if (error) throw error;
    const songs = data.map(item => mapCompositionToSong(item));
    const nextCursor = songs.length === PAGE_SIZE
        ? songs[songs.length - 1].createdAt
        : null;
    return { songs, nextCursor };
};
