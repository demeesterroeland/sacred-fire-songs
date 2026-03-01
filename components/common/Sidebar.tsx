'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { Flame, IndentDecrease, SlidersHorizontal, Heart, FileText, ListMusic, LogOut } from 'lucide-react';
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

    const userDisplayName = user?.full_name || user?.email?.split('@')[0] || 'Member';
    const userInitials = userDisplayName.substring(0, 1).toUpperCase();
    const userRole = user ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '';

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside
                className={`
                    fixed lg:sticky top-0 left-0 h-screen z-50
                    flex flex-col bg-gray-900 border-r border-gray-800 transition-all duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    w-[260px]
                `}
            >
                {/* Header: Logo & Branding */}
                <div className="p-4 flex items-center border-b border-gray-800/50 bg-gray-900/50 h-[72px] justify-between">
                    <Link href="/" className="flex items-center gap-3 group/logo shrink-0" onClick={() => setIsOpen(false)}>
                        <div className="w-10 h-10 bg-gradient-to-br from-red-700 to-orange-600 rounded-full flex items-center justify-center shadow-lg shadow-red-900/30 ring-1 ring-white/10 group-hover/logo:scale-110 transition-transform">
                            <Flame className="text-white w-6 h-6 fill-current" />
                        </div>
                        {/* Title: Only on Desktop. Hide on Mobile Drawer as requested. */}
                        <div className="hidden lg:flex flex-col">
                            <span className="font-bold text-lg leading-tight text-white tracking-tight group-hover/logo:text-red-500 transition-colors">
                                {getSiteTitle()}
                            </span>
                        </div>
                    </Link>

                    {/* Mobile Close Toggle - Positioned at Top Right of Sidebar */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="lg:hidden flex items-center gap-2 text-gray-400 hover:text-white transition-colors p-1.5 pr-3 rounded-xl hover:bg-gray-800 group border border-transparent hover:border-gray-700"
                        title="Close Menu"
                    >
                        <IndentDecrease className="w-6 h-6" />
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">Close</span>
                    </button>
                </div>

                {/* Navigation Links + Personal Menu */}
                <nav className="flex-1 overflow-y-auto px-2 py-6">
                    <div className="space-y-1">
                        {NAV_ITEMS.map((item) => (
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
                        ))}
                    </div>

                    {/* Separator + Personal Menu (mobile only) */}
                    <div className="lg:hidden mt-4 pt-4 border-t border-gray-800/50">
                        {user ? (
                            <>
                                {/* User Identity Card */}
                                <div className="relative group/card bg-gray-800/50 p-3 rounded-xl mx-1 mb-3 border border-gray-700/30">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-red-900/40 flex items-center justify-center text-sm font-bold text-red-400 ring-1 ring-red-500/20 shadow-inner relative overflow-hidden">
                                            {user.avatar_url ? (
                                                <Image src={user.avatar_url} alt={userDisplayName} fill className="object-cover" sizes="40px" />
                                            ) : (
                                                userInitials
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-white truncate">{userDisplayName}</p>
                                            <p className="text-xs text-blue-400/80 font-medium">{userRole}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Personal Menu Items */}
                                <div className="space-y-1">
                                    <Link href="/account/settings" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-2 px-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors group">
                                        <SlidersHorizontal className="w-4 h-4 group-hover:text-blue-400" />
                                        <span className="text-sm font-medium">Account Settings</span>
                                    </Link>
                                    <Link href="/songs?favorites=true" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-2 px-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors group">
                                        <Heart className="w-4 h-4 group-hover:text-red-400" />
                                        <span className="text-sm font-medium">My Favorites</span>
                                    </Link>
                                    <Link href="/songs?status=draft" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-2 px-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors group">
                                        <FileText className="w-4 h-4 group-hover:text-orange-400" />
                                        <span className="text-sm font-medium">My Drafts</span>
                                    </Link>
                                    <Link href="/library/playlists" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-2 px-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors group">
                                        <ListMusic className="w-4 h-4 group-hover:text-purple-400" />
                                        <span className="text-sm font-medium">My Playlists</span>
                                    </Link>
                                </div>

                                <div className="h-px bg-gray-800 my-2 mx-1" />

                                {/* Sign Out */}
                                <button
                                    onClick={async () => {
                                        await logout();
                                        setIsOpen(false);
                                        router.refresh();
                                    }}
                                    className="w-full flex items-center gap-3 p-2 px-3 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors group"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="text-sm font-medium">Sign Out</span>
                                </button>

                                {process.env.NODE_ENV === 'development' && (
                                    <div className="mt-4 pt-4 border-t border-gray-800/80 px-1">
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
                        <div className="mt-6 pt-6 border-t border-gray-800/50">
                            <Suspense fallback={<div className="text-gray-500 text-xs px-4">Loading filters...</div>}>
                                <LibrarySidebar />
                            </Suspense>
                        </div>
                    )}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-gray-800/30 bg-gray-950/20">
                    <p className="text-[9px] text-center font-mono uppercase tracking-[0.2em] opacity-20 mt-2">
                        Sacred Fire v1.0
                    </p>
                </div>
            </aside>
        </>
    );
}
