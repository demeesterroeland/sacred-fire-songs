import { Shield, UserCheck, Guitar } from 'lucide-react';
import type { UserRole } from '@/lib/admin/types';
import { type ActivityStatus } from '@/lib/admin/userOverview';
import { useLocale } from '@/context/LocaleContext';
import { ROLE_COLOR, type RoleColor } from '@/lib/admin/roleColors';

// Role badges use sober surface-2 and border-line to adhere to single accent token rules.
const COLOR_STYLES: Record<RoleColor, string> = {
  purple: 'bg-surface-2 text-fg border-line',
  amber: 'bg-surface-2 text-fg border-line',
  emerald: 'bg-surface-2 text-fg border-line',
  blue: 'bg-surface-2 text-fg border-line',
};

const ROLE_WEIGHT: Record<UserRole, string> = {
  admin: 'font-bold',
  gatekeeper: 'font-bold',
  expert: 'font-semibold',
  musician: 'font-semibold',
  member: 'font-medium',
};

const FALLBACK_ROLE_STYLE =
  'font-medium bg-surface-2 text-fg border-line';

export function RoleBadge({ role, size = 'sm' }: { role: UserRole; size?: 'sm' | 'md' }) {
  const { t } = useLocale();
  const icon =
    role === 'admin' ? (
      <Shield className="w-3 h-3" />
    ) : role === 'gatekeeper' ? (
      <UserCheck className="w-3 h-3" />
    ) : role === 'expert' || role === 'musician' ? (
      <Guitar className="w-3 h-3" />
    ) : null;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-control text-xs border ${
        size === 'md' ? 'px-3 py-1' : 'px-2.5 py-0.5'
      } ${ROLE_COLOR[role] ? `${ROLE_WEIGHT[role]} ${COLOR_STYLES[ROLE_COLOR[role]]}` : FALLBACK_ROLE_STYLE}`}
    >
      {icon} {t(`admin.role.${role}`)}
    </span>
  );
}

const STATUS_STYLES: Record<ActivityStatus, { dot: string; text: string }> = {
  active: { dot: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-400' },
  inactive: { dot: 'bg-gray-400', text: 'text-gray-500 dark:text-gray-400' },
  never: { dot: 'bg-gray-300 dark:bg-gray-600', text: 'text-gray-400 dark:text-gray-500' },
};

export function ActivityStatusBadge({ status }: { status: ActivityStatus }) {
  const { t } = useLocale();
  const style = STATUS_STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-caption font-semibold ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
      {t(`admin.status.${status}`)}
    </span>
  );
}
