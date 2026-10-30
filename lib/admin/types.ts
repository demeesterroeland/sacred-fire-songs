/** Mirrors the `user_role` enum in the database. `expert` is the seeded musician account role. */
export type UserRole = 'admin' | 'gatekeeper' | 'expert' | 'musician' | 'member';

export interface AdminUserSummary {
  id: string;
  email: string;
  role: UserRole;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  last_seen_at: string | null;
  songs_count: number;
  versions_count: number;
  playlists_count: number;
  public_playlists_count: number;
}

export interface AdminUserContributionSong {
  id: string;
  title: string;
  artist: string | null;
  created_at: string;
}

export interface AdminUserContributionVersion {
  id: string;
  song_id: string;
  song_title: string;
  name: string | null;
  created_at: string;
}

export interface AdminUserContributionPlaylist {
  id: string;
  title: string;
  is_public: boolean;
  created_at: string;
}

export interface AdminUserDetails {
  id: string;
  email: string;
  role: UserRole;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  last_seen_at: string | null;
  contributions: {
    songs: AdminUserContributionSong[];
    versions: AdminUserContributionVersion[];
    playlists: AdminUserContributionPlaylist[];
  };
}
