// Story 6.1.38 (#534): one badge per role on a profile page.
import type { UserRole } from '@/lib/admin/types';
import type { TranslationKey } from '@/lib/i18n';

/** Name of the lucide-react icon the badge shows. */
export type RoleBadgeIcon = 'Shield' | 'KeyRound' | 'Award' | 'Music' | 'UserCheck';

export interface RoleBadgeSpec {
  role: UserRole;
  icon: RoleBadgeIcon;
  labelKey: TranslationKey;
}

const BADGES: Record<UserRole, RoleBadgeSpec> = {
  admin: { role: 'admin', icon: 'Shield', labelKey: 'admin.role.admin' },
  gatekeeper: { role: 'gatekeeper', icon: 'KeyRound', labelKey: 'admin.role.gatekeeper' },
  expert: { role: 'expert', icon: 'Award', labelKey: 'admin.role.expert' },
  musician: { role: 'musician', icon: 'Music', labelKey: 'admin.role.musician' },
  member: { role: 'member', icon: 'UserCheck', labelKey: 'admin.role.member' },
};

/**
 * A profile role from public_profiles. The view returns NULL for a guest, and an
 * unexpected value must never show a privileged badge, so both become "member".
 */
export function toProfileRole(raw: string | null | undefined): UserRole {
  return raw && Object.prototype.hasOwnProperty.call(BADGES, raw) ? (raw as UserRole) : 'member';
}

export function roleBadge(raw: string | null | undefined): RoleBadgeSpec {
  return BADGES[toProfileRole(raw)];
}
