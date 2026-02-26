'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ListMusic, Disc3, Mic2 } from 'lucide-react';

const tabs = [
    { label: 'Playlists', href: '/library/playlists', icon: ListMusic },
    { label: 'Albums',    href: '/library/albums',    icon: Disc3 },
    { label: 'Artists',   href: '/library/artists',   icon: Mic2 },
];

export default function LibraryTabs() {
    const pathname = usePathname();

    return (
        <div className="flex gap-2 mb-8">
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
    );
}
