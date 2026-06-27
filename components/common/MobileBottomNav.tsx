'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Home, Library, ListMusic, PlusCircle } from 'lucide-react';
import { useActivePath } from '@/hooks/useActivePath';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import CreateSheet from './CreateSheet';
import { useUserPreferences } from '@/context/UserPreferencesContext';

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
    { label: 'Songs', href: '/songs', icon: Library, exclude: ['/songs/add'] },
    { label: 'Library', href: '/library/playlists', icon: ListMusic },
    { label: 'Create', href: '/songs/add', icon: PlusCircle, isAction: true },
];

export default function MobileBottomNav() {
    const { isActive } = useActivePath();
    const pathname = usePathname();
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const { preferences } = useUserPreferences();
    const [isVisible, setIsVisible] = useState(true);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const isSongDetailPage = pathname?.startsWith('/songs/') &&
        pathname !== '/songs' &&
        pathname !== '/songs/add' &&
        !pathname.endsWith('/edit');

    useEffect(() => {
        if (!isSongDetailPage || !preferences.autoHideBottomNav) {
            setIsVisible(true);
            return;
        }

        const showNav = () => {
            setIsVisible(true);
            
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            
            timeoutRef.current = setTimeout(() => {
                setIsVisible(false);
            }, 3000);
        };

        showNav();

        const events = ['scroll', 'click', 'touchstart', 'touchmove', 'mousemove', 'keydown'];
        events.forEach(event => {
            window.addEventListener(event, showNav, { passive: true });
        });

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            events.forEach(event => {
                window.removeEventListener(event, showNav);
            });
        };
    }, [isSongDetailPage, preferences.autoHideBottomNav]);

    return (
        <>
            <CreateSheet
                isOpen={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
            />
            <nav className={`fixed bottom-0 inset-x-0 z-30 lg:hidden transition-transform duration-300 ${!isVisible ? 'translate-y-full' : 'translate-y-0'}`}>
                {/* Top edge glow */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />

                <div className="bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-800/50 safe-area-bottom">
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
                                                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
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
                                            : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
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
