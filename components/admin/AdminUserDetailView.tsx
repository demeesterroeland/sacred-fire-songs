'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Music,
  ListMusic,
  FileText,
  Guitar,
  Calendar,
  Clock,
  ExternalLink,
  Lock,
  Globe,
  Mail,
  Fingerprint,
} from 'lucide-react';
import type { AdminUserDetails } from '@/lib/admin/types';
import { getActivityStatus, isMusicianRole } from '@/lib/admin/userOverview';
import { ActivityStatusBadge, RoleBadge } from './AdminBadges';

import { useLocale } from '@/context/LocaleContext';
import { LOCALE_DATE_TAGS } from '@/lib/i18n';
interface AdminUserDetailViewProps {
  user: AdminUserDetails;
}

type ContributionTab = 'songs' | 'versions' | 'playlists';

export default function AdminUserDetailView({ user }: AdminUserDetailViewProps) {
  const { t, locale } = useLocale();
  const [activeTab, setActiveTab] = useState<ContributionTab>('songs');

  const displayName = user.full_name || user.email.split('@')[0];
  const initials = displayName.substring(0, 2).toUpperCase();

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return 'Never';
    return new Date(isoString).toLocaleDateString(LOCALE_DATE_TAGS[locale], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const songs = user.contributions.songs;
  const versions = user.contributions.versions;
  const playlists = user.contributions.playlists;
  const publicPlaylistsCount = playlists.filter((p) => p.is_public).length;
  const isMusician = isMusicianRole(user.role);

  return (
    <div className="space-y-8">
      {/* User Header Profile Card */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/30 p-5 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl md:text-2xl font-bold text-white shadow-lg relative overflow-hidden shrink-0">
              {user.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt={displayName}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : (
                initials
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                  {displayName}
                </h1>
                <RoleBadge role={user.role} size="md" />
              </div>

              <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 dark:text-gray-400">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span>{user.email}</span>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-gray-400 dark:text-gray-500 font-mono">
                <Fingerprint className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate max-w-[260px] md:max-w-none">{user.id}</span>
              </div>
            </div>
          </div>

          {/* Dates Metadata */}
          <div className="flex flex-row flex-wrap md:flex-col justify-start md:items-end gap-4 md:gap-1 text-xs text-gray-500 dark:text-gray-400 border-t md:border-t-0 pt-4 md:pt-0 border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>{t('admin.detail.joined')} <strong>{formatDate(user.created_at)}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>{t('admin.detail.lastActive')} <strong>{formatDate(user.last_seen_at)}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <ActivityStatusBadge status={getActivityStatus(user.last_seen_at)} />
            </div>
            <div className="flex items-center gap-1.5">
              <Guitar className="w-3.5 h-3.5 text-gray-400" />
              <span>
                {t('admin.detail.musician')} <strong>{isMusician ? t('admin.detail.yes') : t('admin.detail.no')}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Contribution Details Tab Content */}
      <section>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">{t('admin.detail.contributions')}</p>
        {/* Pill tabs, same style as app/library/LibraryTabs.tsx */}
        <div
          role="tablist"
          aria-label={t('admin.detail.contributions')}
          className="flex gap-2 overflow-x-auto scrollbar-none pb-1 mb-4 -mx-4 px-4 md:mx-0 md:px-0"
        >
          {(
            [
              { key: 'songs', label: t('admin.detail.tab.songs', { count: songs.length }), icon: Music },
              { key: 'versions', label: t('admin.detail.tab.versions', { count: versions.length }), icon: FileText },
              {
                key: 'playlists',
                label: t('admin.detail.tab.playlists', { count: playlists.length, public: publicPlaylistsCount }),
                icon: ListMusic,
              },
            ] as const
          ).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={activeTab === key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold transition-all whitespace-nowrap shrink-0 ${
                activeTab === key
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-950'
                  : 'bg-gray-200/80 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white border border-gray-300/50 dark:border-gray-700/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/30 overflow-hidden">
        {/* Tab Panel: Songs */}
        {activeTab === 'songs' && (
          <div className="p-6">
            {songs.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <Music className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">{t('admin.detail.noSongs')}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {songs.map((song) => (
                  <div
                    key={song.id}
                    className="py-3.5 flex items-center justify-between gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 px-3 rounded-xl transition-colors"
                  >
                    <div>
                      <div className="font-bold text-sm text-gray-900 dark:text-white">
                        {song.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {song.artist || t('admin.detail.unknownArtist')} · {t('admin.detail.created', { date: formatDate(song.created_at) })}
                      </div>
                    </div>

                    <Link
                      href={`/songs/${song.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      target="_blank"
                    >
                      <span>{t('admin.detail.openSong')}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Panel: Versions */}
        {activeTab === 'versions' && (
          <div className="p-6">
            {versions.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">{t('admin.detail.noVersions')}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    className="py-3.5 flex items-center justify-between gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 px-3 rounded-xl transition-colors"
                  >
                    <div>
                      <div className="font-bold text-sm text-gray-900 dark:text-white">
                        {version.name || t('admin.detail.defaultArrangement')}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {t('admin.detail.songLabel')} <span className="font-semibold">{version.song_title}</span> · {t('admin.detail.contributed', { date: formatDate(version.created_at) })}
                      </div>
                    </div>

                    <Link
                      href={`/songs/${version.song_id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                      target="_blank"
                    >
                      <span>{t('admin.detail.openSong')}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Panel: Playlists */}
        {activeTab === 'playlists' && (
          <div className="p-6">
            {playlists.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <ListMusic className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">{t('admin.detail.noPlaylists')}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {playlists.map((playlist) => (
                  <div
                    key={playlist.id}
                    className="py-3.5 flex items-center justify-between gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 px-3 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                        <ListMusic className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-gray-900 dark:text-white">
                            {playlist.title}
                          </span>
                          {playlist.is_public ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                              <Globe className="w-2.5 h-2.5" /> {t('admin.detail.public')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                              <Lock className="w-2.5 h-2.5" /> {t('admin.detail.private')}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {t('admin.detail.created', { date: formatDate(playlist.created_at) })}
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/library/playlists/${playlist.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                      target="_blank"
                    >
                      <span>{t('admin.detail.openPlaylist')}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        </div>
      </section>
    </div>
  );
}
