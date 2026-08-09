import { FilterConfig } from "@/lib/declarative-filter/types";
import { Song } from "@/lib/songUtils";
import { normalizeWhitespace, removeDiacritics } from "@/lib/utils";

// 1. Define the Filter State (URL Params map to this)
export interface SongFilterState {
  category?: string;      // Parent Category Slug (OR Logic)
  tags?: string[];        // AND Logic
  chords?: boolean;
  melody?: boolean;
  myRecordings?: boolean;
  search?: string;
  status: 'all' | 'public' | 'draft';
  favorites?: boolean;
  mine?: boolean;
  new?: boolean;
  artist?: string;
}

/**
 * Returns true if any filter in the given state deviates from the default (empty) state.
 * Used by both useSongsFilter (committed state) and SongsPageContent (draft state)
 * so the boolean logic is not duplicated.
 */
export function isDraftActive(draft: SongFilterState, userId?: string): boolean {
  return !!(
    draft.category ||
    (draft.tags?.length ?? 0) > 0 ||
    draft.search ||
    (userId && draft.status !== 'all') ||
    draft.chords ||
    draft.melody ||
    draft.myRecordings ||
    draft.favorites ||
    draft.mine ||
    draft.new ||
    draft.artist
  );
}

// 2. Define the Configuration
export const songFilterConfig: FilterConfig<Song, SongFilterState> = {
  // --- CATEGORY (Parent) ---
  // OR Logic: Matches if song has ANY tag belonging to this parent category
  category: {
    isActive: (val) => !!val,
    match: (song, categorySlug) => {
      if (!song.categories) return false;
      // Check "parentSlug" which is pre-populated in songUtils.ts fetcher
      return song.categories.some(c => c.parentSlug === categorySlug);
    },
    // For facet counting: We want to count occurences of PARENT slugs
    getFacetKeys: (song) => {
      const parents = new Set<string>();
      song.categories?.forEach(c => {
        if (c.parentSlug) parents.add(c.parentSlug);
      });
      return Array.from(parents);
    }
  },

  // --- TAGS (Sub-categories) ---
  // AND Logic: Matches if song has ALL selected tags
  // Note: For multi-select AND logic, the engine usually handles single-value matching.
  // But our engine is generic. If we pass an array, we handle it here.
  tags: {
    isActive: (val) => !!val && val.length > 0,
    match: (song, tags) => {
      if (!tags || tags.length === 0) return true;
      if (!song.categories) return false;

      // Verifies the song has EVERY tag in the filter list
      return tags.every(requiredTag =>
        song.categories.some(c => c.slug === requiredTag)
      );
    },
    // For facet counting: Count occurences of individual TAG slugs
    getFacetKeys: (song) => {
      return song.categories?.map(c => c.slug) || [];
    }
  },

  // --- CHORDS ---
  chords: {
    isActive: (val) => !!val, // active if true
    match: (song, val) => !val || (song.hasChords === true),
    getFacetKeys: (song) => song.hasChords ? ['true'] : ['false']
  },

  // --- MELODY ---
  melody: {
    isActive: (val) => !!val,
    match: (song, val) => !val || (song.hasMelody === true),
    getFacetKeys: (song) => song.hasMelody ? ['true'] : ['false']
  },

  // --- SEARCH ---
  search: {
    isActive: (val) => !!val && val.trim().length > 0,
    match: (song, query) => {
      if (!query) return true;
      const cleanQuery = removeDiacritics(normalizeWhitespace(query)).toLowerCase();
      const cleanTitle = removeDiacritics(normalizeWhitespace(song.title)).toLowerCase();
      const cleanAuthor = removeDiacritics(normalizeWhitespace(song.author)).toLowerCase();
      const cleanContent = song.content ? removeDiacritics(normalizeWhitespace(song.content)).toLowerCase() : "";
      // Also match subcategory names (e.g. "Water") and parent group names (e.g. "Element Songs")
      const matchesCategory = song.categories?.some(c => {
        const catName = removeDiacritics(normalizeWhitespace(c.name)).toLowerCase();
        const parentName = c.parent ? removeDiacritics(normalizeWhitespace(c.parent)).toLowerCase() : "";
        return catName.includes(cleanQuery) || parentName.includes(cleanQuery);
      }) ?? false;
      return (
        cleanTitle.includes(cleanQuery) ||
        cleanAuthor.includes(cleanQuery) ||
        cleanContent.includes(cleanQuery) ||
        matchesCategory
      );
    },
    // No facets for free-text search usually
  },


  // --- STATUS ---
  status: {
    isActive: (val) => val !== 'all',
    match: (song, status) => {
      if (status === 'all') return true;
      if (status === 'public') return song.isPublic === true;
      if (status === 'draft') return song.isPublic === false;
      return true;
    }
  },

  // --- ARTIST ---
  artist: {
    isActive: (val) => !!val && val.trim().length > 0,
    match: (song, filterArtist) => {
      if (!filterArtist) return true;
      const normalizedFilter = removeDiacritics(normalizeWhitespace(filterArtist)).toLowerCase();
      if (normalizedFilter === "no artist" || normalizedFilter === "unspecified") {
        return !song.author;
      }
      return removeDiacritics(normalizeWhitespace(song.author)).toLowerCase() === normalizedFilter;
    }
  }
};
