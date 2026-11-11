/**
 * Sacred Fire Songs - Data Contract
 * These interfaces map to the Supabase database schema and UI requirements.
 */

export type UserRole = 'admin' | 'expert' | 'member';

export type CategoryType = 'Theme' | 'Rhythm' | 'Origin';

export interface UserProfile {
  id: string; // UUID
  email: string;
  role: UserRole;
  created_at: string; // ISO Date String
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  created_at: string;
}

export interface Composition {
  id: string;
  title: string;
  original_author?: string | null; // Optional because often unknown for medicine songs
  catalog_slug?: string | null; // Stable external id from a songbook catalog (Story 6.2.1)
  aliases?: string[]; // Other titles the song is known by
  authors?: string[]; // Every author; original_author stays the display text
  created_at: string;
  // Relations (populated via joins)
  categories?: Category[];
}

export interface CompositionCategory {
  composition_id: string;
  category_id: string;
}

export interface SongVersion {
  id: string;
  composition_id: string; // Foreign Key -> Composition
  version_name: string; // Default: 'Standard'
  content_chordpro: string;
  melody_notation?: string | null; // ABC Notation (Phase 2)
  key?: string | null; // e.g., 'Am'
  capo: number;
  tuning?: string | null; // Added v2.4 (e.g. 'Standard', 'Drop D')
  audio_url?: string | null;
  youtube_url?: string | null;
  contributor_id?: string | null; // Foreign Key -> UserProfile
  vote_count: number;
  catalog_source_id?: string | null; // External id within the song, usually the songbook id (Story 6.2.1)
  version_kind?: SongVersionKind;
  beats?: string | null;
  song_note?: string | null;
  created_at: string;
}

/** How a version relates to its song (song_versions.version_kind). */
export type SongVersionKind = 'original' | 'variant' | 'translation';

/** A printed source book (public.songbooks), keyed by its external id. */
export interface Songbook {
  id: string;
  title: string;
  short_name?: string | null;
  compiler?: string | null;
  community?: string | null;
  year?: number | null;
  languages: string[];
  attribution?: string | null;
  created_at: string;
}

/** Where a version was printed (public.song_version_sources). */
export interface SongVersionSource {
  id: string;
  song_version_id: string;
  songbook_id: string;
  original_title?: string | null;
  page?: string | null;
  source_file?: string | null;
  is_primary: boolean;
  created_at: string;
}

/** A song's translation into one language (public.song_translations). */
export interface SongTranslation {
  id: string;
  composition_id: string;
  language: string; // BCP 47 tag, e.g. 'nl' or 'pt-BR'
  title?: string | null;
  lyrics?: string | null;
  translator?: string | null;
  created_at: string;
}

export interface Setlist {
  id: string;
  owner_id: string;
  title: string;
  description?: string | null;
  is_public: boolean;
  created_at: string;
  // Nested items for easier UI consumption
  items?: SetlistItem[];
}

export interface SetlistItem {
  id: string;
  setlist_id: string;
  song_version_id: string;
  order_index: number;
  transposition_override?: number | null;
  created_at: string;
  // Reference to the actual song version when fetched
  song_version?: SongVersion;
}

// UI Helper Interfaces
// For MVP (Phase 1), we often need a "Populated" song object for the UI
// effectively joining Composition + The Default Version
export interface SongUI {
  id: string; // composition_id
  title: string;
  author: string;
  version_id: string;
  key: string;
  content: string; // chordpro
}
