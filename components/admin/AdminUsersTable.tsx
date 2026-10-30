'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Users, Music, ListMusic, FileText, ChevronRight, Shield } from 'lucide-react';
import type { AdminUserSummary } from '@/lib/admin/types';
import {
  ACTIVE_WINDOW_DAYS,
  filterAndSortUsers,
  getActivityStatus,
  summarizeUsers,
  type AdminRoleFilter,
  type AdminUserSort,
} from '@/lib/admin/userOverview';
import { ActivityStatusBadge, RoleBadge } from './AdminBadges';

import { useLocale } from '@/context/LocaleContext';
import { LOCALE_DATE_TAGS } from '@/lib/i18n';
interface AdminUsersTableProps {
  initialUsers: AdminUserSummary[];
}

export default function AdminUsersTable({ initialUsers }: AdminUsersTableProps) {
  const { t, locale } = useLocale();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<AdminRoleFilter>('all');
  const [sortBy, setSortBy] = useState<AdminUserSort>('joined');

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
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">{t('admin.overview')}</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              label: t('admin.stats.users', { active: stats.activeUsers }),
              title: t('admin.stats.usersTitle', { active: stats.activeUsers, days: ACTIVE_WINDOW_DAYS }),
              value: stats.totalUsers,
              icon: Users,
              color: 'text-violet-400',
              bg: 'bg-violet-500/10',
              border: 'border-violet-500/20',
            },
            {
              label: t('admin.stats.songs'),
              title: t('admin.stats.songs'),
              value: stats.totalSongs,
              icon: Music,
              color: 'text-rose-400',
              bg: 'bg-rose-500/10',
              border: 'border-rose-500/20',
            },
            {
              label: t('admin.stats.playlists'),
              title: t('admin.stats.playlists'),
              value: stats.totalPlaylists,
              icon: ListMusic,
              color: 'text-sky-400',
              bg: 'bg-sky-500/10',
              border: 'border-sky-500/20',
            },
            {
              label: t('admin.stats.privileged'),
              title: t('admin.stats.privileged'),
              value: stats.privilegedUsers,
              icon: Shield,
              color: 'text-amber-400',
              bg: 'bg-amber-500/10',
              border: 'border-amber-500/20',
            },
          ].map(({ label, title, value, icon: Icon, color, bg, border }) => (
            <div
              key={label}
              className={`flex items-center gap-3 p-3 md:p-4 rounded-2xl border ${border} bg-white/50 dark:bg-gray-900/30`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{value}</p>
                <p className="text-[10px] md:text-xs text-gray-500 truncate" title={title}>
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
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t('admin.search.placeholder')}
            aria-label={t('admin.search.label')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as AdminRoleFilter)}
            aria-label={t('admin.filter.label')}
            className="px-4 py-2.5 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full text-xs font-semibold text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">{t('admin.filter.all')}</option>
            <option value="admin">{t('admin.role.admin')}</option>
            <option value="gatekeeper">{t('admin.role.gatekeeper')}</option>
            <option value="member">{t('admin.role.member')}</option>
            <option value="musician">{t('admin.filter.musician')}</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as AdminUserSort)}
            aria-label={t('admin.sort.label')}
            className="px-4 py-2.5 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full text-xs font-semibold text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="joined">{t('admin.sort.joined')}</option>
            <option value="contributions">{t('admin.sort.contributions')}</option>
            <option value="name">{t('admin.sort.name')}</option>
          </select>
        </div>
      </div>

      {/* Users List / Table */}
      <section>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">
          {t('admin.list.heading', { count: filteredUsers.length })}
        </p>
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/30 overflow-hidden">

        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            {initialUsers.length === 0 ? (
              <p className="text-base font-semibold">{t('admin.list.emptyAll')}</p>
            ) : (
              <>
                <p className="text-base font-semibold">{t('admin.list.emptyFiltered')}</p>
                <p className="text-xs mt-1">{t('admin.list.emptyHint')}</p>
              </>
            )}
          </div>
        ) : (
          <ul aria-label="Registered users" className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredUsers.map((user) => {
              const displayName = user.full_name || user.email.split('@')[0];
              const initials = displayName.substring(0, 2).toUpperCase();

              return (
                <li
                  key={user.id}
                  className="p-4 md:px-6 hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* User Profile Info */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-inner overflow-hidden shrink-0 relative">
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
                        <span className="font-bold text-sm text-gray-900 dark:text-white truncate">
                          {displayName}
                        </span>
                        <RoleBadge role={user.role} />
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user.email}
                      </div>
                    </div>
                  </div>

                  {/* Contributions & Dates */}
                  <div className="flex items-center justify-between md:justify-end gap-6 text-xs text-gray-600 dark:text-gray-300">
                    {/* Contribution Counters */}
                    <div className="flex items-center gap-4">
                      <div
                        className="flex items-center gap-1.5"
                        title={t('admin.user.songsTitle', { count: user.songs_count })}
                      >
                        <Music className="w-3.5 h-3.5 text-red-500" />
                        <span className="font-semibold">{user.songs_count}</span>
                        <span className="hidden sm:inline text-gray-400">{t('admin.user.songs')}</span>
                      </div>

                      <div
                        className="flex items-center gap-1.5"
                        title={t('admin.user.versionsTitle', { count: user.versions_count })}
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-500" />
                        <span className="font-semibold">{user.versions_count}</span>
                        <span className="hidden sm:inline text-gray-400">{t('admin.user.versions')}</span>
                      </div>

                      <div
                        className="flex items-center gap-1.5"
                        title={t('admin.user.playlistsTitle', { count: user.playlists_count })}
                      >
                        <ListMusic className="w-3.5 h-3.5 text-blue-500" />
                        <span className="font-semibold">{user.playlists_count}</span>
                        <span className="hidden sm:inline text-gray-400">{t('admin.user.playlists')}</span>
                      </div>
                    </div>

                    {/* Join Date */}
                    <div className="flex flex-col items-end text-right text-[11px] text-gray-400">
                      <ActivityStatusBadge status={getActivityStatus(user.last_seen_at)} />
                      <span>{t('admin.user.joined', { date: formatDate(user.created_at) })}</span>
                    </div>

                    {/* View Details Link */}
                    <Link
                      href={`/admin/users/${user.id}`}
                      aria-label={t('admin.user.viewDetails', { name: displayName })}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-purple-100 dark:hover:bg-purple-950/60 text-gray-700 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-300 font-semibold transition-all active:scale-95"
                    >
                      <span>{t('admin.user.details')}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
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
