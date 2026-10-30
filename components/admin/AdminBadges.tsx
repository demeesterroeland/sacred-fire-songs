import { Shield, UserCheck, Guitar } from 'lucide-react';
import type { UserRole } from '@/lib/admin/types';
import { getRoleLabel, type ActivityStatus } from '@/lib/admin/userOverview';

const ROLE_STYLES: Record<UserRole, string> = {
  admin:
    'font-bold bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  gatekeeper:
    'font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  expert:
    'font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  musician:
    'font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  member:
    'font-medium bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-800',
};

const FALLBACK_ROLE_STYLE =
  'font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';

export function RoleBadge({ role, size = 'sm' }: { role: UserRole; size?: 'sm' | 'md' }) {
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
      className={`inline-flex items-center gap-1 rounded-full text-xs border ${
        size === 'md' ? 'px-3 py-1' : 'px-2.5 py-0.5'
      } ${ROLE_STYLES[role] ?? FALLBACK_ROLE_STYLE}`}
    >
      {icon} {getRoleLabel(role)}
    </span>
  );
}

const STATUS_STYLES: Record<ActivityStatus, { label: string; dot: string; text: string }> = {
  active: { label: 'Active', dot: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-400' },
  inactive: { label: 'Inactive', dot: 'bg-gray-400', text: 'text-gray-500 dark:text-gray-400' },
  never: { label: 'Never active', dot: 'bg-gray-300 dark:bg-gray-600', text: 'text-gray-400 dark:text-gray-500' },
};

export function ActivityStatusBadge({ status }: { status: ActivityStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
      {style.label}
    </span>
  );
}
