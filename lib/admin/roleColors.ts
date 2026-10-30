import type { UserRole } from './types';
import type { AdminRoleFilter } from './userOverview';

/**
 * Single source of the role colors: the role badges (components/admin/AdminBadges.tsx)
 * and the role filter picker both use these, so a role looks the same everywhere.
 */

export type RoleColor = 'purple' | 'amber' | 'emerald' | 'blue';

export const ROLE_COLOR: Record<UserRole, RoleColor> = {
  admin: 'purple',
  gatekeeper: 'amber',
  expert: 'emerald',
  musician: 'emerald',
  member: 'blue',
};

/** Tailwind 500 shades, used for the picker's wick and glow. */
export const ROLE_ACCENT: Record<RoleColor, string> = {
  purple: '#a855f7',
  amber: '#f59e0b',
  emerald: '#10b981',
  blue: '#3b82f6',
};

/** Accent for a role filter option; "all" keeps the picker's default ember. */
export function roleFilterAccent(filter: AdminRoleFilter): string | undefined {
  return filter === 'all' ? undefined : ROLE_ACCENT[ROLE_COLOR[filter]];
}
