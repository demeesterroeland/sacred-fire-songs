import type { AdminUserSummary, UserRole } from './types';

/** A user counts as "active" when last seen within this many days. */
export const ACTIVE_WINDOW_DAYS = 30;

export type ActivityStatus = 'active' | 'inactive' | 'never';

export type AdminRoleFilter = 'all' | 'admin' | 'gatekeeper' | 'musician' | 'member';

export const ADMIN_USER_SORTS = [
  'joined',
  'contributions',
  'name',
  'name_desc',
  'songs_desc',
  'songs_asc',
] as const;

export type AdminUserSort = (typeof ADMIN_USER_SORTS)[number];

/** Validates a persisted/query sort value; unknown values fall back to "joined". */
export function parseAdminUserSort(raw: string | null | undefined): AdminUserSort {
  return (ADMIN_USER_SORTS as readonly string[]).includes(raw ?? '') ? (raw as AdminUserSort) : 'joined';
}

export interface AdminUserFilterOptions {
  query?: string;
  role?: AdminRoleFilter;
  sortBy?: AdminUserSort;
}

export interface AdminUsersSummary {
  totalUsers: number;
  totalSongs: number;
  totalPlaylists: number;
  privilegedUsers: number;
  activeUsers: number;
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  gatekeeper: 'Gatekeeper',
  expert: 'Expert',
  musician: 'Musician',
  member: 'Member',
};

export function getRoleLabel(role: UserRole): string {
  return ROLE_LABELS[role] ?? role;
}

export function isAdminRole(role: UserRole | null | undefined): boolean {
  return role === 'admin';
}

/** Musician status: both the `musician` and the `expert` role play music. */
export function isMusicianRole(role: UserRole | null | undefined): boolean {
  return role === 'musician' || role === 'expert';
}

export function getActivityStatus(lastSeenAt: string | null, now: Date = new Date()): ActivityStatus {
  if (!lastSeenAt) return 'never';
  const seen = new Date(lastSeenAt).getTime();
  if (Number.isNaN(seen)) return 'never';
  const windowMs = ACTIVE_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  return now.getTime() - seen <= windowMs ? 'active' : 'inactive';
}

/** Counts rows per non-null `key`, optionally only rows matching `where`. */
export function countBy<T extends Record<string, unknown>>(
  rows: T[] | null | undefined,
  key: keyof T,
  where?: (row: T) => boolean
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const row of rows ?? []) {
    const id = row[key];
    if (typeof id !== 'string' || (where && !where(row))) continue;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return counts;
}

export function getTotalContributions(user: AdminUserSummary): number {
  return user.songs_count + user.versions_count + user.playlists_count;
}

function displayName(user: AdminUserSummary): string {
  return user.full_name || user.email;
}

function matchesRole(user: AdminUserSummary, role: AdminRoleFilter): boolean {
  if (role === 'all') return true;
  if (role === 'musician') return isMusicianRole(user.role);
  return user.role === role;
}

function byName(a: AdminUserSummary, b: AdminUserSummary): number {
  return displayName(a).localeCompare(displayName(b), undefined, { sensitivity: 'base' });
}

function byJoinedDesc(a: AdminUserSummary, b: AdminUserSummary): number {
  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
}

export function filterAndSortUsers(
  users: AdminUserSummary[],
  { query = '', role = 'all', sortBy = 'joined' }: AdminUserFilterOptions
): AdminUserSummary[] {
  const needle = query.trim().toLowerCase();

  return users
    .filter((user) => {
      const matchesQuery =
        needle === '' ||
        user.email.toLowerCase().includes(needle) ||
        (user.full_name?.toLowerCase().includes(needle) ?? false);
      return matchesQuery && matchesRole(user, role);
    })
    .sort((a, b) => {
      if (sortBy === 'contributions') {
        return getTotalContributions(b) - getTotalContributions(a) || byJoinedDesc(a, b);
      }
      if (sortBy === 'name') return byName(a, b);
      if (sortBy === 'name_desc') return byName(b, a);
      if (sortBy === 'songs_desc') return b.songs_count - a.songs_count || byName(a, b);
      if (sortBy === 'songs_asc') return a.songs_count - b.songs_count || byName(a, b);
      return byJoinedDesc(a, b);
    });
}

export function summarizeUsers(users: AdminUserSummary[], now: Date = new Date()): AdminUsersSummary {
  return {
    totalUsers: users.length,
    totalSongs: users.reduce((acc, u) => acc + u.songs_count, 0),
    totalPlaylists: users.reduce((acc, u) => acc + u.playlists_count, 0),
    privilegedUsers: users.filter((u) => u.role === 'admin' || u.role === 'gatekeeper').length,
    activeUsers: users.filter((u) => getActivityStatus(u.last_seen_at, now) === 'active').length,
  };
}
