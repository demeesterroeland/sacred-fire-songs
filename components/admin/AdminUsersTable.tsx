'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Users, Music, ListMusic, FileText, ChevronRight, Shield } from 'lucide-react';
import type { AdminUserSummary } from '@/lib/admin/types';
import {
  ACTIVE_WINDOW_DAYS,
  filterAndSortUsers,
  getActivityStatus,
  parseAdminUserSort,
  summarizeUsers,
  type AdminRoleFilter,
  type AdminUserSort,
} from '@/lib/admin/userOverview';
import { ActivityStatusBadge, RoleBadge } from './AdminBadges';
import { WickSelect, type WickSelectOption } from '@/components/common/ui/WickSelect';
import { roleFilterAccent } from '@/lib/admin/roleColors';

const SORT_STORAGE_KEY = 'admin-users-sort';
const SORT_CHANGE_EVENT = 'admin-users-sort-change';

function subscribeToSort(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener(SORT_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(SORT_CHANGE_EVENT, onChange);
  };
}


import { useLocale } from '@/context/LocaleContext';
import { LOCALE_DATE_TAGS } from '@/lib/i18n';
interface AdminUsersTableProps {
  initialUsers: AdminUserSummary[];
}

export default function AdminUsersTable({ initialUsers }: AdminUsersTableProps) {
  const { t, locale } = useLocale();

  const roleOptions: WickSelectOption<AdminRoleFilter>[] = [
    { value: 'all', label: t('admin.filter.all') },
    { value: 'admin', label: t('admin.role.admin'), accent: roleFilterAccent('admin') },
    { value: 'gatekeeper', label: t('admin.role.gatekeeper'), accent: roleFilterAccent('gatekeeper') },
    { value: 'member', label: t('admin.role.member'), accent: roleFilterAccent('member') },
    { value: 'musician', label: t('admin.filter.musician'), accent: roleFilterAccent('musician') },
  ];

  const sortOptions: WickSelectOption<AdminUserSort>[] = [
    { value: 'joined', label: t('admin.sort.joined') },
    { value: 'contributions', label: t('admin.sort.contributions') },
    { value: 'name', label: t('admin.sort.name') },
    { value: 'name_desc', label: t('admin.sort.nameDesc') },
    { value: 'songs_desc', label: t('admin.sort.songsDesc') },
    { value: 'songs_asc', label: t('admin.sort.songsAsc') },
  ];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<AdminRoleFilter>('all');
  // Sort is remembered in localStorage across reloads and visits to a user's details (#278).
  const sortBy = parseAdminUserSort(
    useSyncExternalStore(subscribeToSort, () => window.localStorage.getItem(SORT_STORAGE_KEY), () => null)
  );
  const changeSort = (next: AdminUserSort) => {
    window.localStorage.setItem(SORT_STORAGE_KEY, next);
    window.dispatchEvent(new Event(SORT_CHANGE_EVENT));
  };

  const stats = useMemo(() => summarizeUsers(initialUsers), [initialUsers]);

  const filteredUsers = useMemo(
    () => filterAndSortUsers(initialUsers, { query: searchQuery, role: selectedRole, sortBy }),
    [initialUsers, searchQuery, selectedRole, sortBy]
  );

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return 'Never';
    return new Date(isoString).toLocaleDateString(LOCALE_DATE_TAGS[locale], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-8">
      {/* Summary cards (same style as components/home/LibrarySummary.tsx) */}
      <section>
        <p className="text-caption font-semibold text-fg-muted mb-4">{t('admin.overview')}</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              label: t('admin.stats.users', { active: stats.activeUsers }),
              title: t('admin.stats.usersTitle', { active: stats.activeUsers, days: ACTIVE_WINDOW_DAYS }),
              value: stats.totalUsers,
              icon: Users,
            },
            {
              label: t('admin.stats.songs'),
              title: t('admin.stats.songs'),
              value: stats.totalSongs,
              icon: Music,
            },
            {
              label: t('admin.stats.playlists'),
              title: t('admin.stats.playlists'),
              value: stats.totalPlaylists,
              icon: ListMusic,
            },
            {
              label: t('admin.stats.privileged'),
              title: t('admin.stats.privileged'),
              value: stats.privilegedUsers,
              icon: Shield,
            },
          ].map(({ label, title, value, icon: Icon }) => (
            <div
              key={label}
              className={`flex items-center gap-3 p-3 md:p-4 rounded-panel border border-line bg-surface`}
            >
              <div className={`size-9 rounded-control flex items-center justify-center shrink-0 bg-surface-2`}>
                <Icon className="w-4 h-4 text-fg-muted" />
              </div>
              <div className="min-w-0">
                <p className="text-row font-bold text-fg leading-tight">{value}</p>
                <p className="text-caption text-fg-muted truncate" title={title}>
                  {label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-subtle" />
          <input
            type="text"
            placeholder={t('admin.search.placeholder')}
            aria-label={t('admin.search.label')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 min-h-tap py-2.5 bg-surface border border-line-strong rounded-pill text-body text-fg placeholder:text-fg-subtle"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <WickSelect
            label={t('admin.filter.label')}
            testId="admin-role-filter"
            value={selectedRole}
            options={roleOptions}
            onChange={setSelectedRole}
          />
          <WickSelect
            label={t('admin.sort.label')}
            testId="admin-sort"
            value={sortBy}
            options={sortOptions}
            onChange={changeSort}
          />
        </div>
      </div>

      {/* Users List / Table */}
      <section>
        <p className="text-caption font-semibold text-fg-muted mb-4">
          {t('admin.list.heading', { count: filteredUsers.length })}
        </p>
        <div className="rounded-panel border border-line bg-surface overflow-hidden">

        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-fg-muted">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            {initialUsers.length === 0 ? (
              <p className="text-base font-semibold">{t('admin.list.emptyAll')}</p>
            ) : (
              <>
                <p className="text-base font-semibold">{t('admin.list.emptyFiltered')}</p>
                <p className="text-caption mt-1">{t('admin.list.emptyHint')}</p>
              </>
            )}
          </div>
        ) : (
          <ul aria-label="Registered users" className="divide-y divide-line">
            {filteredUsers.map((user) => {
              const displayName = user.full_name || user.email.split('@')[0];
              const initials = displayName.substring(0, 2).toUpperCase();

              return (
                <li
                  key={user.id}
                  className="relative cursor-pointer p-4 md:px-6 hover:bg-surface-2 focus-within:bg-surface-2 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-focus transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* User Profile Info */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="size-10 rounded-pill bg-surface-2 flex items-center justify-center text-caption font-bold text-fg overflow-hidden shrink-0 relative">
                      {user.avatar_url ? (
                        <Image
                          src={user.avatar_url}
                          alt={displayName}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : (
                        initials
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-fg truncate">
                          {displayName}
                        </span>
                        <RoleBadge role={user.role} />
                      </div>
                      <div className="text-xs text-fg-muted truncate">
                        {user.email}
                      </div>
                    </div>
                  </div>

                  {/* Contributions & Dates */}
                  <div className="flex items-center justify-between md:justify-end gap-6 text-caption text-fg-muted">
                    {/* Contribution Counters */}
                    <div className="flex items-center gap-4">
                      <div
                        className="flex items-center gap-1.5"
                        title={t('admin.user.songsTitle', { count: user.songs_count })}
                      >
                        <Music className="w-3.5 h-3.5 text-fg-muted" />
                        <span className="font-semibold">{user.songs_count}</span>
                        <span className="hidden sm:inline text-fg-subtle">{t('admin.user.songs')}</span>
                      </div>

                      <div
                        className="flex items-center gap-1.5"
                        title={t('admin.user.versionsTitle', { count: user.versions_count })}
                      >
                        <FileText className="w-3.5 h-3.5 text-fg-muted" />
                        <span className="font-semibold">{user.versions_count}</span>
                        <span className="hidden sm:inline text-fg-subtle">{t('admin.user.versions')}</span>
                      </div>

                      <div
                        className="flex items-center gap-1.5"
                        title={t('admin.user.playlistsTitle', { count: user.playlists_count })}
                      >
                        <ListMusic className="w-3.5 h-3.5 text-fg-muted" />
                        <span className="font-semibold">{user.playlists_count}</span>
                        <span className="hidden sm:inline text-fg-subtle">{t('admin.user.playlists')}</span>
                      </div>
                    </div>

                    {/* Join Date */}
                    <div className="flex flex-col items-end text-right text-caption text-fg-muted">
                      <ActivityStatusBadge status={getActivityStatus(user.last_seen_at)} />
                      <span>{t('admin.user.joined', { date: formatDate(user.created_at) })}</span>
                    </div>

                    {/* View Details Link */}
                    <Link
                      href={`/admin/users/${user.id}`}
                      aria-label={t('admin.user.viewDetails', { name: displayName })}
                      // Stretched link: the ::after overlay makes the whole row clickable (#279),
                      // keeping native Enter, middle-click and Ctrl/Cmd-click behaviour.
                      // No transform on the link itself: it would shrink the overlay mid-click.
                      className="group/details after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
                    >
                      <span className="inline-flex min-h-tap items-center gap-1 px-3 py-1.5 rounded-control bg-surface-2 group-hover/details:bg-line text-fg font-semibold transition-colors">
                        <span>{t('admin.user.details')}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        </div>
      </section>
    </div>
  );
}
