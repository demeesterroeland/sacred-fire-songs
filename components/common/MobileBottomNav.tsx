'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Home, Search, ListMusic, PlusCircle } from 'lucide-react';
import { useActivePath } from '@/hooks/useActivePath';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import CreateSheet from './CreateSheet';

type TabItem = {
    label: string;
    href: string;
    icon: LucideIcon;
    exact?: boolean;
    exclude?: string[];
    isAction?: boolean;
};

const BOTTOM_TABS: TabItem[] = [
    { label: 'Home', href: '/', icon: Home, exact: true },
    { label: 'Search', href: '/songs', icon: Search, exclude: ['/songs/add'] },
    { label: 'Library', href: '/library/playlists', icon: ListMusic },
    { label: 'Create', href: '/songs/add', icon: PlusCircle, isAction: true },
];

export default function MobileBottomNav() {
    const { isActive } = useActivePath();
    const pathname = usePathname();
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    // Hide on song detail pages (they have custom layouts)
    const isSongDetailPage = pathname?.startsWith('/songs/') &&
        pathname !== '/songs' &&
        pathname !== '/songs/add' &&
        !pathname.endsWith('/edit');

    if (isSongDetailPage) return null;

    return (
        <>
            <CreateSheet
                isOpen={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
            />
            <nav className="fixed bottom-0 inset-x-0 z-30 lg:hidden">
                {/* Top edge glow */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />

                <div className="bg-gray-950/95 backdrop-blur-xl border-t border-gray-800/50 safe-area-bottom">
                    <div className="flex items-center justify-around h-14 px-2">
                        {BOTTOM_TABS.map((tab) => {
                            const active = tab.isAction
                                ? isSheetOpen
                                : isActive(tab.href, { exact: tab.exact, exclude: tab.exclude as readonly string[] | undefined });
                            const Icon = tab.icon;

                            if (tab.isAction) {
                                return (
                                    <button
                                        key={tab.label}
                                        onClick={() => setIsSheetOpen(!isSheetOpen)}
                                        className={`flex flex-col items-center justify-center gap-0.5 min-w-[64px] py-1 rounded-xl transition-colors active:scale-95 ${
                                            active
                                                ? 'text-red-400'
                                                : 'text-gray-500 hover:text-gray-300'
                                        }`}
                                    >
                                        <div className="relative">
                                            <Icon className="w-[22px] h-[22px]" strokeWidth={active ? 2.5 : 1.8} />
                                            {active && (
                                                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-red-400" />
                                            )}
                                        </div>
                                        <span className={`text-[10px] leading-tight mt-0.5 ${active ? 'font-bold' : 'font-medium'}`}>
                                            {tab.label}
                                        </span>
                                    </button>
                                );
                            }

                            return (
                                <Link
                                    key={tab.href}
                                    href={tab.href}
                                    onClick={() => setIsSheetOpen(false)}
                                    className={`flex flex-col items-center justify-center gap-0.5 min-w-[64px] py-1 rounded-xl transition-colors active:scale-95 ${
                                        active
                                            ? 'text-red-400'
                                            : 'text-gray-500 hover:text-gray-300'
                                    }`}
                                >
                                    <div className="relative">
                                        <Icon className="w-[22px] h-[22px]" strokeWidth={active ? 2.5 : 1.8} />
                                        {active && (
                                            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-red-400" />
                                        )}
                                    </div>
                                    <span className={`text-[10px] leading-tight mt-0.5 ${active ? 'font-bold' : 'font-medium'}`}>
                                        {tab.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </nav>
        </>
    );
}
