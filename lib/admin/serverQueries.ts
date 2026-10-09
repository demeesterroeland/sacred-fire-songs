import { createClient } from '@/lib/supabase/server';
import type {
  AdminUserSummary,
  AdminUserDetails,
  AdminUserContributionSong,
  AdminUserContributionVersion,
  AdminUserContributionPlaylist,
} from './types';

/**
 * Validates that the current session belongs to an administrator.
 */
export async function checkAdminAccess() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { authorized: false, user: null, profile: null };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role !== 'admin') {
    return { authorized: false, user, profile };
  }

  return { authorized: true, user, profile };
}

/**
 * Retrieves the full list of registered users with their contribution metrics.
 * Strictly requires admin authorization.
 */
export async function getAdminUsersList(): Promise<AdminUserSummary[] | null> {
  const { authorized } = await checkAdminAccess();
  if (!authorized) {
    return null;
  }

  const supabase = await createClient();

  // 1. Fetch all profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, email, role, full_name, avatar_url, created_at, last_seen_at')
    .order('created_at', { ascending: false });

  if (profilesError || !profiles) {
    console.error('[getAdminUsersList] Error fetching profiles:', profilesError);
    return [];
  }

  // 2. Fetch contribution counts concurrently
  const [compositionsResult, versionsResult, playlistsResult] = await Promise.all([
    supabase.from('compositions').select('owner_id'),
    supabase.from('song_versions').select('contributor_id'),
    supabase.from('setlists').select('owner_id'),
  ]);

  const songsCountMap = new Map<string, number>();
  compositionsResult.data?.forEach((row: { owner_id: string | null }) => {
    if (row.owner_id) {
      songsCountMap.set(row.owner_id, (songsCountMap.get(row.owner_id) || 0) + 1);
    }
  });

  const versionsCountMap = new Map<string, number>();
  versionsResult.data?.forEach((row: { contributor_id: string | null }) => {
    if (row.contributor_id) {
      versionsCountMap.set(row.contributor_id, (versionsCountMap.get(row.contributor_id) || 0) + 1);
    }
  });

  const playlistsCountMap = new Map<string, number>();
  playlistsResult.data?.forEach((row: { owner_id: string | null }) => {
    if (row.owner_id) {
      playlistsCountMap.set(row.owner_id, (playlistsCountMap.get(row.owner_id) || 0) + 1);
    }
  });

  return profiles.map((p) => ({
    id: p.id,
    email: p.email,
    role: p.role,
    full_name: p.full_name,
    avatar_url: p.avatar_url,
    created_at: p.created_at,
    last_seen_at: p.last_seen_at,
    songs_count: songsCountMap.get(p.id) || 0,
    versions_count: versionsCountMap.get(p.id) || 0,
    playlists_count: playlistsCountMap.get(p.id) || 0,
  }));
}

/**
 * Retrieves details and contribution lists for a single user.
 * Strictly requires admin authorization.
 */
export async function getAdminUserDetails(userId: string): Promise<AdminUserDetails | null> {
  const { authorized } = await checkAdminAccess();
  if (!authorized) {
    return null;
  }

  const supabase = await createClient();

  // 1. Fetch user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, role, full_name, avatar_url, created_at, last_seen_at')
    .eq('id', userId)
    .maybeSingle();

  if (profileError || !profile) {
    return null;
  }

  // 2. Fetch user contributions
  const [songsResult, versionsResult, playlistsResult] = await Promise.all([
    supabase
      .from('compositions')
      .select('id, title, artist, created_at')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false }),
    supabase
      .from('song_versions')
      .select('id, song_id, name, created_at, compositions(title)')
      .eq('contributor_id', userId)
      .order('created_at', { ascending: false }),
    supabase
      .from('setlists')
      .select('id, title, is_public, created_at')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false }),
  ]);

  const songs: AdminUserContributionSong[] = (songsResult.data || []).map((s: {
    id: string;
    title: string;
    artist: string | null;
    created_at: string;
  }) => ({
    id: s.id,
    title: s.title,
    artist: s.artist,
    created_at: s.created_at,
  }));

  const versions: AdminUserContributionVersion[] = (versionsResult.data || []).map((v: {
    id: string;
    song_id: string;
    name: string;
    created_at: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    compositions?: any;
  }) => ({
    id: v.id,
    song_id: v.song_id,
    song_title: Array.isArray(v.compositions) ? v.compositions[0]?.title ?? 'Untitled Song' : v.compositions?.title ?? 'Untitled Song',
    name: v.name,
    created_at: v.created_at,
  }));

  const playlists: AdminUserContributionPlaylist[] = (playlistsResult.data || []).map((p: {
    id: string;
    title: string;
    is_public: boolean;
    created_at: string;
  }) => ({
    id: p.id,
    title: p.title,
    is_public: p.is_public,
    created_at: p.created_at,
  }));

  return {
    id: profile.id,
    email: profile.email,
    role: profile.role,
    full_name: profile.full_name,
    avatar_url: profile.avatar_url,
    created_at: profile.created_at,
    last_seen_at: profile.last_seen_at,
    contributions: {
      songs,
      versions,
      playlists,
    },
  };
}
