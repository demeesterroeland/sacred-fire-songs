import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  AdminUserSummary,
  AdminUserDetails,
  AdminUserContributionSong,
  AdminUserContributionVersion,
  AdminUserContributionPlaylist,
  UserRole,
} from './types';
import { countBy, isAdminRole } from './userOverview';

/**
 * Admin user queries with the Supabase client injected, so they run against
 * the server client (see serverQueries.ts) as well as test doubles in vitest
 * and Cucumber. Do not import from client components.
 */

// Structural subset of SupabaseClient used here; keeps test doubles simple.
export type AdminQueryClient = Pick<SupabaseClient, 'auth' | 'from'>;

const PROFILE_COLUMNS = 'id, email, role, full_name, avatar_url, created_at, last_seen_at';

interface ProfileRow {
  id: string;
  email: string;
  role: UserRole;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  last_seen_at: string | null;
}

export interface AdminAccessResult {
  authorized: boolean;
  user: { id: string; email?: string } | null;
  profile: ProfileRow | null;
}

function logQueryError(scope: string, error: unknown) {
  if (error) console.error(`[${scope}]`, error);
}

/** Validates that the current session belongs to an administrator. */
export async function fetchAdminAccess(supabase: AdminQueryClient): Promise<AdminAccessResult> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { authorized: false, user: null, profile: null };
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', user.id)
    .maybeSingle();
  logQueryError('fetchAdminAccess', error);

  const row = (profile as ProfileRow | null) ?? null;
  return { authorized: isAdminRole(row?.role), user, profile: row };
}

/**
 * Lists every registered user with contribution counts.
 * Returns null when the caller is not an admin.
 */
export async function fetchAdminUsersList(
  supabase: AdminQueryClient
): Promise<AdminUserSummary[] | null> {
  const { authorized } = await fetchAdminAccess(supabase);
  if (!authorized) return null;

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .order('created_at', { ascending: false });

  if (profilesError || !profiles) {
    logQueryError('fetchAdminUsersList:profiles', profilesError);
    return [];
  }

  const [songs, versions, playlists] = await Promise.all([
    supabase.from('compositions').select('owner_id'),
    supabase.from('song_versions').select('contributor_id'),
    supabase.from('setlists').select('owner_id, is_public'),
  ]);
  logQueryError('fetchAdminUsersList:compositions', songs.error);
  logQueryError('fetchAdminUsersList:song_versions', versions.error);
  logQueryError('fetchAdminUsersList:setlists', playlists.error);

  type OwnerRow = { owner_id: string | null };
  type ContributorRow = { contributor_id: string | null };
  type PlaylistRow = { owner_id: string | null; is_public: boolean };

  const songsCount = countBy((songs.data ?? []) as OwnerRow[], 'owner_id');
  const versionsCount = countBy((versions.data ?? []) as ContributorRow[], 'contributor_id');
  const playlistRows = (playlists.data ?? []) as PlaylistRow[];
  const playlistsCount = countBy(playlistRows, 'owner_id');
  const publicPlaylistsCount = countBy(playlistRows, 'owner_id', (row) => row.is_public === true);

  return (profiles as ProfileRow[]).map((p) => ({
    id: p.id,
    email: p.email,
    role: p.role,
    full_name: p.full_name,
    avatar_url: p.avatar_url,
    created_at: p.created_at,
    last_seen_at: p.last_seen_at,
    songs_count: songsCount.get(p.id) ?? 0,
    versions_count: versionsCount.get(p.id) ?? 0,
    playlists_count: playlistsCount.get(p.id) ?? 0,
    public_playlists_count: publicPlaylistsCount.get(p.id) ?? 0,
  }));
}

/**
 * Returns one user's profile and contributions (songs, versions, playlists).
 * Returns null when the caller is not an admin or the user does not exist.
 */
export async function fetchAdminUserDetails(
  supabase: AdminQueryClient,
  userId: string
): Promise<AdminUserDetails | null> {
  const { authorized } = await fetchAdminAccess(supabase);
  if (!authorized) return null;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', userId)
    .maybeSingle();

  if (profileError || !profile) {
    logQueryError('fetchAdminUserDetails:profile', profileError);
    return null;
  }

  const [songsResult, versionsResult, playlistsResult] = await Promise.all([
    supabase
      .from('compositions')
      .select('id, title, original_author, created_at')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false }),
    supabase
      .from('song_versions')
      .select('id, composition_id, version_name, created_at, compositions(title)')
      .eq('contributor_id', userId)
      .order('created_at', { ascending: false }),
    supabase
      .from('setlists')
      .select('id, title, is_public, created_at')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false }),
  ]);
  logQueryError('fetchAdminUserDetails:compositions', songsResult.error);
  logQueryError('fetchAdminUserDetails:song_versions', versionsResult.error);
  logQueryError('fetchAdminUserDetails:setlists', playlistsResult.error);

  type SongRow = { id: string; title: string; original_author: string | null; created_at: string };
  type VersionRow = {
    id: string;
    composition_id: string;
    version_name: string | null;
    created_at: string;
    compositions: { title: string } | { title: string }[] | null;
  };

  const songs: AdminUserContributionSong[] = ((songsResult.data ?? []) as SongRow[]).map((s) => ({
    id: s.id,
    title: s.title,
    artist: s.original_author,
    created_at: s.created_at,
  }));

  const versions: AdminUserContributionVersion[] = ((versionsResult.data ?? []) as VersionRow[]).map(
    (v) => {
      const composition = Array.isArray(v.compositions) ? v.compositions[0] : v.compositions;
      return {
        id: v.id,
        song_id: v.composition_id,
        song_title: composition?.title ?? 'Untitled Song',
        name: v.version_name,
        created_at: v.created_at,
      };
    }
  );

  const playlists = (playlistsResult.data ?? []) as AdminUserContributionPlaylist[];

  const p = profile as ProfileRow;
  return {
    id: p.id,
    email: p.email,
    role: p.role,
    full_name: p.full_name,
    avatar_url: p.avatar_url,
    created_at: p.created_at,
    last_seen_at: p.last_seen_at,
    contributions: { songs, versions, playlists },
  };
}
