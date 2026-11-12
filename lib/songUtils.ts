import { createClient } from "./supabase/client";
import { songsQuery, fetchAllSongRows, mapCompositionToSong } from './songs/queries';
import { normalizeWhitespace } from "./utils";
import { songMatchesSearch } from "./songs/search";

export const PAGE_SIZE = 20;


// lib/songUtils.ts
export interface Song {
    id: string;
    title: string;
    author: string;
    /** Every credit of the song (`compositions.authors`); `author` stays the display text. */
    authors?: string[];
    /** Other titles of the song (`compositions.aliases`), searched like the title (#521). */
    aliases?: string[];
    /** The title each songbook printed it under (`song_version_sources.original_title`, every version), searched too (#521). */
    sourceTitles?: string[];
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
        emoji?: string;
        parent: string | null;
        parentSlug: string | null;
    }[];
}

/**
 * Filters a list of songs by title, author, content, tags (AND), or categories (OR).
 */
export function filterSongs(songs: Song[], query: string, activeFilter: 'all' | 'public' | 'draft' = 'all', additionalFilters?: { tag?: string, category?: string }) {
    void activeFilter;
    const cleanQuery = normalizeWhitespace(query).toLowerCase();

    let filtered = songs.filter(song => {
        // 1. Text search: the one matcher of the song list (title, aliases, songbook titles, authors, lyrics)
        return songMatchesSearch(song, cleanQuery);
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
 * Fetches all songs (in server-sized pages, joined into one list) — used for in-memory search.
 */
export const fetchAllSongs = async (): Promise<Song[]> => {
    const supabase = createClient();
    // In pages: one request is capped at PostgREST's max_rows (1000) without an error (#521).
    const { data, error } = await fetchAllSongRows(supabase);
    if (error) throw error;
    return data.map(item => mapCompositionToSong(item));
};
