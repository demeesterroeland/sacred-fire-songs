'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ListMusic, Disc3, Mic2, ChevronRight } from 'lucide-react';

const tabs = [
    { label: 'Playlists', href: '/library/playlists', icon: ListMusic },
    { label: 'Albums',    href: '/library/albums',    icon: Disc3 },
    { label: 'Artists',   href: '/library/artists',   icon: Mic2 },
];

export default function LibraryTabs() {
    const pathname = usePathname();

    // Detail page = a tab's href + at least one more path segment
    const parentTab = tabs.find(t => pathname?.startsWith(t.href + '/'));

    if (parentTab) {
        // Breadcrumb only — no heading, no tabs
        return (
            <nav className="mb-8">
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Link href={parentTab.href} className="hover:text-gray-300 transition-colors">
                        Library
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                    <Link href={parentTab.href} className="hover:text-gray-300 transition-colors">
                        {parentTab.label}
                    </Link>
                </div>
            </nav>
        );
    }

    // List page — full heading + tabs
    return (
        <>
            <header className="hidden md:block mb-12">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 text-white">Your Library</h1>
                <p className="text-slate-400">Your personal collection of playlists, albums, and artists.</p>
            </header>
            <div className="flex items-center mb-8">
                <div className="flex gap-2">
                    {tabs.map(({ label, href, icon: Icon }) => {
                        const isActive = pathname === href;
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
            </div>
        </>
    );
}
