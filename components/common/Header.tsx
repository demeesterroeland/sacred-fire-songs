'use client';

import { IndentIncrease, Flame } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/context/SidebarContext';
import { UserProfile } from './navigation/UserProfile';

export default function Header() {
    const pathname = usePathname();
    const { setIsOpen, headerCount } = useSidebar();

    const getSubtitle = () => {
        if (pathname === '/') return 'DASHBOARD';
        if (pathname === '/songs') return 'LIBRARY';
        if (pathname === '/explore') return 'EXPLORE';
        if (pathname === '/songs/add') return 'ADD SONG';
        if (pathname === '/playlists') return 'PLAYLISTS';
        if (pathname?.startsWith('/songs/')) return 'SONG DETAIL';
        return '';
    };

    const subtitle = getSubtitle();
    const displaySubtitle = (pathname === '/songs' && headerCount !== undefined)
        ? `${headerCount} Songs`
        : subtitle;

    // Hide Global Header ONLY on Song Detail Page to allow custom Widescreen Design
    const isSongDetailPage = pathname?.startsWith('/songs/') &&
        pathname !== '/songs' &&
        pathname !== '/songs/add' &&
        !pathname.endsWith('/edit');

    if (isSongDetailPage) return null;

    return (
        <header className="sticky top-0 z-30 bg-gray-950/95 backdrop-blur-md border-b border-gray-800/50 px-4 md:px-8 py-4 h-[72px] flex items-center">
            <div className="w-full flex justify-between items-center">
                <div className="flex items-center gap-4">
                    {/* Menu Trigger */}
                    <button
                        onClick={() => setIsOpen(true)}
                        className="lg:hidden flex items-center gap-2 text-gray-400 hover:text-white transition-colors p-1.5 pr-3 rounded-xl hover:bg-gray-800 group shrink-0 border border-transparent hover:border-gray-700"
                    >
                        <IndentIncrease className="w-7 h-7" />
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity hidden sm:inline">Menu</span>
                    </button>

                    {/* Logo: Only on Mobile (Sidebar is hidden) */}
                    <Link href="/" className="flex lg:hidden items-center group/logo shrink-0">
                        <div className="w-9 h-9 bg-gradient-to-br from-red-700 to-orange-600 rounded-full flex items-center justify-center shadow-lg shadow-red-900/30 ring-1 ring-white/10 group-hover/logo:scale-110 transition-transform">
                            <Flame className="text-white w-5 h-5 fill-current" />
                        </div>
                    </Link>

                    {/* Divider on Mobile (Desktop sidebar is visible) */}
                    <div className="lg:hidden h-6 w-px bg-gray-800 mx-1 shrink-0" />

                    {/* Breadcrumb / Subtitle */}
                    {displaySubtitle && (
                        <div className="flex items-center">
                            <span className="text-[10px] lg:text-xs uppercase font-black text-red-500 tracking-[0.2em] lg:tracking-[0.3em] opacity-80">
                                {displaySubtitle}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {/* User Profile moved to Header */}
                    <UserProfile layout="header" showText={false} />
                </div>
            </div>
        </header>
    );
}
