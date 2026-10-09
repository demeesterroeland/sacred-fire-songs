'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  Users,
  Music,
  ListMusic,
  FileText,
  ChevronRight,
  Shield,
  ArrowUpDown,
  UserCheck,
  Calendar,
  Clock,
} from 'lucide-react';
import type { AdminUserSummary, UserRole } from '@/lib/admin/types';

interface AdminUsersTableProps {
  initialUsers: AdminUserSummary[];
}

export default function AdminUsersTable({ initialUsers }: AdminUsersTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'joined' | 'contributions' | 'name'>('joined');

  // Compute summary stats
  const stats = useMemo(() => {
    const totalUsers = initialUsers.length;
    const totalSongs = initialUsers.reduce((acc, u) => acc + u.songs_count, 0);
    const totalPlaylists = initialUsers.reduce((acc, u) => acc + u.playlists_count, 0);
    const privilegedUsers = initialUsers.filter(
      (u) => u.role === 'admin' || u.role === 'gatekeeper'
    ).length;

    return { totalUsers, totalSongs, totalPlaylists, privilegedUsers };
  }, [initialUsers]);

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    return initialUsers
      .filter((user) => {
        const matchesQuery =
          searchQuery.trim() === '' ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (user.full_name && user.full_name.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesRole =
          selectedRole === 'all' || user.role.toLowerCase() === selectedRole.toLowerCase();

        return matchesQuery && matchesRole;
      })
      .sort((a, b) => {
        if (sortBy === 'joined') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortBy === 'contributions') {
          const totalA = a.songs_count + a.versions_count + a.playlists_count;
          const totalB = b.songs_count + b.versions_count + b.playlists_count;
          return totalB - totalA;
        }
        if (sortBy === 'name') {
          const nameA = a.full_name || a.email;
          const nameB = b.full_name || b.email;
          return nameA.localeCompare(nameB);
        }
        return 0;
      });
  }, [initialUsers, searchQuery, selectedRole, sortBy]);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <Shield className="w-3 h-3" /> Admin
          </span>
        );
      case 'gatekeeper':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <UserCheck className="w-3 h-3" /> Gatekeeper
          </span>
        );
      case 'musician':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            Musician
          </span>
        );
      case 'member':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            Member
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
            {role}
          </span>
        );
    }
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return 'Never';
    return new Date(isoString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Users</span>
            <Users className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white">
            {stats.totalUsers}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Songs Created</span>
            <Music className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white">
            {stats.totalSongs}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Playlists Created</span>
            <ListMusic className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white">
            {stats.totalPlaylists}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Staff / Curators</span>
            <Shield className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white">
            {stats.privilegedUsers}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="gatekeeper">Gatekeeper</option>
            <option value="member">Member</option>
            <option value="musician">Musician</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'joined' | 'contributions' | 'name')}
            className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="joined">Sort: Recently Joined</option>
            <option value="contributions">Sort: Top Contributors</option>
            <option value="name">Sort: Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Users List / Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white">
            Registered Users ({filteredUsers.length})
          </h2>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-base font-semibold">No users found</p>
            <p className="text-xs mt-1">Try adjusting your search query or role filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredUsers.map((user) => {
              const displayName = user.full_name || user.email.split('@')[0];
              const initials = displayName.substring(0, 2).toUpperCase();

              return (
                <div
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
                        {getRoleBadge(user.role)}
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
                        title={`${user.songs_count} songs created`}
                      >
                        <Music className="w-3.5 h-3.5 text-red-500" />
                        <span className="font-semibold">{user.songs_count}</span>
                        <span className="hidden sm:inline text-gray-400">songs</span>
                      </div>

                      <div
                        className="flex items-center gap-1.5"
                        title={`${user.versions_count} song versions contributed`}
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-500" />
                        <span className="font-semibold">{user.versions_count}</span>
                        <span className="hidden sm:inline text-gray-400">versions</span>
                      </div>

                      <div
                        className="flex items-center gap-1.5"
                        title={`${user.playlists_count} playlists created`}
                      >
                        <ListMusic className="w-3.5 h-3.5 text-blue-500" />
                        <span className="font-semibold">{user.playlists_count}</span>
                        <span className="hidden sm:inline text-gray-400">playlists</span>
                      </div>
                    </div>

                    {/* Join Date */}
                    <div className="hidden lg:flex flex-col text-right text-[11px] text-gray-400">
                      <span>Joined {formatDate(user.created_at)}</span>
                      {user.last_seen_at && (
                        <span>Active {formatDate(user.last_seen_at)}</span>
                      )}
                    </div>

                    {/* View Details Link */}
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-purple-100 dark:hover:bg-purple-950/60 text-gray-700 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-300 font-semibold transition-all active:scale-95"
                    >
                      <span>Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
