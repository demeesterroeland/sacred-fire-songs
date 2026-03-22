'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/context/SidebarContext';
import { UserProfile } from './navigation/UserProfile';
import { useAuth } from '@/hooks/useAuth';

export default function Header() {
    const pathname = usePathname();
    const { setIsOpen, headerCount } = useSidebar();
    const { user } = useAuth();

    const getSubtitle = () => {
        if (pathname === '/') return 'Home';
        if (pathname === '/songs') return 'Songs';
        if (pathname === '/songs/add') return 'Add Song';
        if (pathname === '/library/recently-viewed') return 'Recently Viewed';
        if (pathname === '/library/playlists') return 'Your Library';
        if (pathname === '/library/playlists/add') return 'New Playlist';
        if (pathname?.startsWith('/library/playlists/')) return 'Playlist';
        if (pathname?.endsWith('/edit')) return 'Edit Song';
        if (pathname?.startsWith('/songs/')) return 'Song Detail';
        if (pathname === '/account/settings') return 'Settings';
        return '';
    };

    const subtitle = getSubtitle();
    const displaySubtitle = (pathname === '/songs' && headerCount !== undefined)
        ? `${headerCount} songs`
        : subtitle;

    // Hide Global Header ONLY on Song Detail Page to allow custom Widescreen Design
    const isSongDetailPage = pathname?.startsWith('/songs/') &&
        pathname !== '/songs' &&
        pathname !== '/songs/add' &&
        !pathname.endsWith('/edit');

    if (isSongDetailPage) return null;

    const userDisplayName = user?.full_name || user?.email?.split('@')[0] || 'Member';
    const userInitials = userDisplayName.substring(0, 1).toUpperCase();

    return (
        <header className="sticky top-0 z-30 bg-gray-950/95 backdrop-blur-md border-b border-gray-800/50 px-4 md:px-8 py-4 h-[72px] flex items-center">
            <div className="w-full flex justify-between items-center">
                <div className="flex items-center gap-4">
                    {/* Mobile: Avatar button opens sidebar (replaces hamburger) */}
                    <button
                        onClick={() => setIsOpen(true)}
                        className="lg:hidden flex items-center shrink-0 active:scale-95 transition-transform"
                        aria-label="Open menu"
                    >
                        {user ? (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-inner overflow-hidden relative ring-2 ring-gray-700 hover:ring-gray-500 transition-all">
                                {user.avatar_url ? (
                                    <Image
                                        src={user.avatar_url}
                                        alt={userDisplayName}
                                        fill
                                        className="object-cover"
                                        sizes="32px"
                                    />
                                ) : (
                                    userInitials
                                )}
                            </div>
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center ring-2 ring-gray-700 hover:ring-gray-500 transition-all">
                                <span className="text-xs font-bold text-gray-500">?</span>
                            </div>
                        )}
                    </button>

                    {/* Page Title */}
                    {displaySubtitle && (
                        <h1 className="text-xl font-bold tracking-tight text-white lg:text-xs lg:uppercase lg:font-black lg:text-red-500 lg:tracking-[0.3em] lg:opacity-80">
                            {displaySubtitle}
                        </h1>
                    )}
                </div>

                {/* User Profile: hidden on mobile (avatar is in bottom nav / header left) */}
                <div className="hidden lg:flex items-center gap-3">
                    <UserProfile layout="header" showText={false} />
                </div>
            </div>
        </header>
    );
}
