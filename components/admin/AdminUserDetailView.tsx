'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Music,
  ListMusic,
  FileText,
  Shield,
  UserCheck,
  Calendar,
  Clock,
  ExternalLink,
  Lock,
  Globe,
  Mail,
  Fingerprint,
} from 'lucide-react';
import type { AdminUserDetails, UserRole } from '@/lib/admin/types';

interface AdminUserDetailViewProps {
  user: AdminUserDetails;
}

type ContributionTab = 'songs' | 'versions' | 'playlists';

export default function AdminUserDetailView({ user }: AdminUserDetailViewProps) {
  const [activeTab, setActiveTab] = useState<ContributionTab>('songs');

  const displayName = user.full_name || user.email.split('@')[0];
  const initials = displayName.substring(0, 2).toUpperCase();

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return 'Never';
    return new Date(isoString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <Shield className="w-3.5 h-3.5" /> Admin
          </span>
        );
      case 'gatekeeper':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <UserCheck className="w-3.5 h-3.5" /> Gatekeeper
          </span>
        );
      case 'musician':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            Musician
          </span>
        );
      case 'member':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            Member
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
            {role}
          </span>
        );
    }
  };

  const songs = user.contributions.songs;
  const versions = user.contributions.versions;
  const playlists = user.contributions.playlists;

  return (
    <div className="space-y-6">
      {/* Top Bar with Back Navigation */}
      <div>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 text-xs md:text-sm font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Users</span>
        </Link>
      </div>

      {/* User Header Profile Card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm">
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
                {getRoleBadge(user.role)}
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
          <div className="flex flex-row md:flex-col justify-start md:items-end gap-4 md:gap-1 text-xs text-gray-500 dark:text-gray-400 border-t md:border-t-0 pt-4 md:pt-0 border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>Joined: <strong>{formatDate(user.created_at)}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>Last Active: <strong>{formatDate(user.last_seen_at)}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Contribution Metric Stat Cards */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <button
          onClick={() => setActiveTab('songs')}
          className={`p-4 md:p-5 rounded-2xl border text-left transition-all ${
            activeTab === 'songs'
              ? 'bg-red-50/50 dark:bg-red-950/30 border-red-200 dark:border-red-900/60 shadow-sm'
              : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
          }`}
        >
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Songs Created</span>
            <Music className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
            {songs.length}
          </div>
        </button>

        <button
          onClick={() => setActiveTab('versions')}
          className={`p-4 md:p-5 rounded-2xl border text-left transition-all ${
            activeTab === 'versions'
              ? 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60 shadow-sm'
              : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
          }`}
        >
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Versions Contributed</span>
            <FileText className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
            {versions.length}
          </div>
        </button>

        <button
          onClick={() => setActiveTab('playlists')}
          className={`p-4 md:p-5 rounded-2xl border text-left transition-all ${
            activeTab === 'playlists'
              ? 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/60 shadow-sm'
              : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
          }`}
        >
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Playlists Created</span>
            <ListMusic className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
            {playlists.length}
          </div>
        </button>
      </div>

      {/* Contribution Details Tab Content */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 px-6 pt-4 gap-6">
          <button
            onClick={() => setActiveTab('songs')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'songs'
                ? 'border-red-500 text-red-600 dark:text-red-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>Songs ({songs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('versions')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'versions'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Versions ({versions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('playlists')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'playlists'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <ListMusic className="w-4 h-4" />
            <span>Playlists ({playlists.length})</span>
          </button>
        </div>

        {/* Tab Panel: Songs */}
        {activeTab === 'songs' && (
          <div className="p-6">
            {songs.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <Music className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No songs created by this user yet.</p>
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
                        {song.artist || 'Traditional / Unknown'} · Created {formatDate(song.created_at)}
                      </div>
                    </div>

                    <Link
                      href={`/songs/${song.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      target="_blank"
                    >
                      <span>Open Song</span>
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
                <p className="text-sm font-medium">No song versions submitted by this user yet.</p>
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
                        {version.name || 'Default Arrangement'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Song: <span className="font-semibold">{version.song_title}</span> · Contributed {formatDate(version.created_at)}
                      </div>
                    </div>

                    <Link
                      href={`/songs/${version.song_id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                      target="_blank"
                    >
                      <span>Open Song</span>
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
                <p className="text-sm font-medium">No playlists created by this user yet.</p>
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
                              <Globe className="w-2.5 h-2.5" /> Public
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                              <Lock className="w-2.5 h-2.5" /> Private
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Created {formatDate(playlist.created_at)}
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/library/playlists/${playlist.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                      target="_blank"
                    >
                      <span>Open Playlist</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
