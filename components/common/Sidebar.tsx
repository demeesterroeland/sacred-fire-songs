'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { Flame, IndentDecrease, SlidersHorizontal, Heart, FileText, ListMusic, LogOut, Music, Clock } from 'lucide-react';
import Image from 'next/image';
import DevTools from '@/components/dev/DevTools';
import LibrarySidebar from '../library/LibrarySidebar';
import { useEnvironment } from '@/hooks/useEnvironment';
import { useActivePath } from '@/hooks/useActivePath';
import { useAuth } from '@/hooks/useAuth';
import { NavLink } from './navigation/NavLink';
import { NAV_ITEMS } from '@/lib/navigation';
import { useSidebar } from '@/context/SidebarContext';
import { getSiteTitle } from '@/lib/env';
import { useRouter } from 'next/navigation';
import QuickLogin from '@/components/dev/QuickLogin';

export default function Sidebar() {
    const env = useEnvironment();
    const { pathname } = useActivePath();
    const { isOpen, setIsOpen } = useSidebar();
    const { user, logout } = useAuth();
    const router = useRouter();
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const userDisplayName = user?.full_name || user?.email?.split('@')[0] || 'Member';
    const userInitials = userDisplayName.substring(0, 1).toUpperCase();
    const userRole = user ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '';

    return (
        <>
            <aside
                style={{ top: 'var(--env-banner-height, 0px)', height: `calc(100vh - var(--env-banner-height, 0px))` }}
                className={`
                    fixed lg:sticky left-0 z-50
                    flex flex-col bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    w-[260px]
                `}
            >
                {/* Header: Logo & Branding */}
                <div className="p-4 flex items-center border-b border-gray-200/50 dark:border-gray-800/50 bg-gray-100/50 dark:bg-gray-900/50 h-[72px] justify-between">
                    {/* Desktop: flame logo + site title */}
                    <Link href="/" className="hidden lg:flex items-center gap-3 group/logo shrink-0" onClick={() => setIsOpen(false)}>
                        <div className="w-10 h-10 bg-gradient-to-br from-red-700 to-orange-600 rounded-full flex items-center justify-center shadow-lg shadow-red-900/30 ring-1 ring-black/10 dark:ring-white/10 group-hover/logo:scale-110 transition-transform">
                            <Flame className="text-white w-6 h-6 fill-current" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-lg leading-tight text-gray-900 dark:text-white tracking-tight group-hover/logo:text-red-500 transition-colors">
                                {getSiteTitle()}
                            </span>
                        </div>
                    </Link>

                    {/* Mobile: user identity (authenticated) or flame logo (guest) */}
                    <div className="lg:hidden flex items-center gap-3 shrink-0 min-w-0">
                        {user ? (
                            <>
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white ring-1 ring-black/10 dark:ring-white/10 shadow-inner relative overflow-hidden shrink-0">
                                    {user.avatar_url ? (
                                        <Image src={user.avatar_url} alt={userDisplayName} fill className="object-cover" sizes="36px" />
                                    ) : (
                                        userInitials
                                    )}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{userDisplayName}</p>
                                    <p className="text-xs text-blue-500 dark:text-blue-400/80 font-medium">{userRole}</p>
                                </div>
                            </>
                        ) : (
                            <Link href="/" className="flex items-center gap-3 group/logo" onClick={() => setIsOpen(false)}>
                                <div className="w-10 h-10 bg-gradient-to-br from-red-700 to-orange-600 rounded-full flex items-center justify-center shadow-lg shadow-red-900/30 ring-1 ring-black/10 dark:ring-white/10 group-hover/logo:scale-110 transition-transform">
                                    <Flame className="text-white w-6 h-6 fill-current" />
                                </div>
                            </Link>
                        )}
                    </div>

                    {/* Mobile Close Toggle - Positioned at Top Right of Sidebar */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="lg:hidden flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-1.5 pr-3 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800 group border border-transparent hover:border-gray-300 dark:hover:border-gray-700"
                        title="Close Menu"
                    >
                        <IndentDecrease className="w-6 h-6" />
                        <span className="sr-only">Close</span>
                    </button>
                </div>

                {/* Navigation Links + Personal Menu */}
                <nav className="flex-1 overflow-y-auto px-2 py-6">
                    <p className="lg:hidden text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 px-3 mb-2">Menu</p>
                    <div className="space-y-1">
                        {NAV_ITEMS.map((item) => {
                            if (item.label === 'Create') {
                                const Icon = item.icon;
                                return (
                                    <div key={item.label}>
                                        <button
                                            onClick={() => setIsCreateOpen(!isCreateOpen)}
                                            className={`w-full flex items-center gap-3 p-2 px-3 rounded-lg transition-colors ${
                                                isCreateOpen
                                                    ? 'text-red-400 bg-red-500/10'
                                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800'
                                            }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span className="text-sm font-medium">{item.label}</span>
                                        </button>
                                        {isCreateOpen && (
                                            <div className="ml-4 mt-1 space-y-0.5 border-l border-gray-200 dark:border-gray-800 pl-3">
                                                <Link
                                                    href={`/songs/add?next=${encodeURIComponent(pathname)}`}
                                                    onClick={() => { setIsCreateOpen(false); setIsOpen(false); }}
                                                    className="flex items-center gap-3 p-2 px-3 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors group"
                                                >
                                                    <Music className="w-4 h-4 group-hover:text-red-400" />
                                                    <span className="text-sm font-medium">Add Song</span>
                                                </Link>
                                                <Link
                                                    href="/library/playlists/add"
                                                    onClick={() => { setIsCreateOpen(false); setIsOpen(false); }}
                                                    className="flex items-center gap-3 p-2 px-3 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors group"
                                                >
                                                    <ListMusic className="w-4 h-4 group-hover:text-purple-400" />
                                                    <span className="text-sm font-medium">Create Playlist</span>
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                );
                            }
                            return (
                                <NavLink
                                    key={item.href}
                                    href={item.href}
                                    label={item.label}
                                    icon={item.icon}
                                    exact={'exact' in item ? item.exact : false}
                                    exclude={'exclude' in item ? item.exclude : []}
                                    layout="sidebar"
                                    showText={true}
                                    onClick={() => setIsOpen(false)}
                                />
                            );
                        })}
                    </div>

                    {/* Separator + Personal Menu (mobile only) */}
                    <div className="lg:hidden mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-800/50">
                        {user ? (
                            <>
                                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 px-3 mb-2">Personal</p>

                                {/* Personal Menu Items */}
                                <div className="space-y-1">
                                    <Link href="/account/settings" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-2 px-3 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors group">
                                        <SlidersHorizontal className="w-4 h-4 group-hover:text-blue-400" />
                                        <span className="text-sm font-medium">Account Settings</span>
                                    </Link>
                                    <Link href="/songs?favorites=true" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-2 px-3 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors group">
                                        <Heart className="w-4 h-4 group-hover:text-red-400" />
                                        <span className="text-sm font-medium">My Favorites</span>
                                    </Link>
                                    <Link href="/songs?status=draft" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-2 px-3 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors group">
                                        <FileText className="w-4 h-4 group-hover:text-orange-400" />
                                        <span className="text-sm font-medium">My Drafts</span>
                                    </Link>
                                    <Link href="/library/playlists" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-2 px-3 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors group">
                                        <ListMusic className="w-4 h-4 group-hover:text-purple-400" />
                                        <span className="text-sm font-medium">My Playlists</span>
                                    </Link>
                                    <Link href="/library/recently-viewed" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-2 px-3 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors group">
                                        <Clock className="w-4 h-4 group-hover:text-amber-400" />
                                        <span className="text-sm font-medium">Recently Viewed</span>
                                    </Link>
                                </div>

                                <div className="h-px bg-gray-200 dark:bg-gray-800 my-2 mx-1" />

                                {/* Sign Out */}
                                <button
                                    onClick={async () => {
                                        await logout();
                                        setIsOpen(false);
                                        router.refresh();
                                    }}
                                    className="w-full flex items-center gap-3 p-2 px-3 rounded-lg text-gray-500 dark:text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors group"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="text-sm font-medium">Sign Out</span>
                                </button>

                                {process.env.NODE_ENV === 'development' && (
                                    <div className="mt-4 pt-4 border-t border-gray-200/80 dark:border-gray-800/80 px-1">
                                        <QuickLogin />
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="px-1">
                                <Link
                                    href={`/auth/login?next=${encodeURIComponent(pathname)}`}
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center justify-center px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-red-900/20 active:scale-95"
                                >
                                    Sign In
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Filters (Dynamic Taxonomy) */}
                    {pathname === '/songs' && (
                        <div className="mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-800/50">
                            <Suspense fallback={<div className="text-gray-500 text-xs px-4">Loading filters...</div>}>
                                <LibrarySidebar />
                            </Suspense>
                        </div>
                    )}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200/30 dark:border-gray-800/30 bg-gray-50/20 dark:bg-gray-950/20">
                    <p className="text-[9px] text-center font-mono uppercase tracking-[0.2em] opacity-20 mt-2">
                        Sacred Fire v1.0
                    </p>
                </div>
            </aside>
        </>
    );
}
