'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ListMusic, Disc3, Mic2, Plus, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const tabs = [
    { label: 'Playlists', href: '/library/playlists', icon: ListMusic },
    { label: 'Albums',    href: '/library/albums',    icon: Disc3 },
    { label: 'Artists',   href: '/library/artists',   icon: Mic2 },
];

export default function LibraryTabs() {
    const pathname = usePathname();
    const { user } = useAuth();
    const isPlaylists = pathname === '/library/playlists' || pathname?.startsWith('/library/playlists/');

    return (
        <div className="flex items-center justify-between mb-8">
            <div className="flex gap-2">
                {tabs.map(({ label, href, icon: Icon }) => {
                    const isActive = pathname === href || pathname?.startsWith(href + '/');
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                                isActive
                                    ? 'bg-white text-gray-950'
                                    : 'bg-gray-800/80 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700/50'
                            }`}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            {label}
                        </Link>
                    );
                })}
            </div>

            {isPlaylists && (
                <div className="flex flex-col items-end gap-1">
                    <button
                        disabled={!user}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                            user
                                ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/20 active:scale-95'
                                : 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-60'
                        }`}
                    >
                        <Plus className="w-4 h-4" />
                        Create Playlist
                    </button>
                    {!user && (
                        <Link href="/auth/login" className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-300 transition-colors">
                            <LogIn aria-hidden="true" className="w-2.5 h-2.5" />
                            Sign in to create
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}
