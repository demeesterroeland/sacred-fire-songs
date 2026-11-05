'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Home, Library, ListMusic, PlusCircle } from 'lucide-react';
import { useActivePath } from '@/hooks/useActivePath';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import CreateSheet from './CreateSheet';
import { useUserPreferences } from '@/context/UserPreferencesContext';
import { useLocale } from '@/context/LocaleContext';

type TabItem = {
    label: string;
    href: string;
    icon: LucideIcon;
    exact?: boolean;
    exclude?: string[];
    isAction?: boolean;
};

export default function MobileBottomNav() {
    const { t } = useLocale();
    const { isActive } = useActivePath();
    const pathname = usePathname();
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const { preferences } = useUserPreferences();
    const [isVisible, setIsVisible] = useState(true);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const bottomTabs: TabItem[] = [
        { label: t('nav.home'), href: '/', icon: Home, exact: true },
        { label: t('nav.songs'), href: '/songs', icon: Library, exclude: ['/songs/add'] },
        { label: t('nav.library'), href: '/library/playlists', icon: ListMusic },
        { label: t('nav.create'), href: '/songs/add', icon: PlusCircle, isAction: true },
    ];

    const isSongDetailPage = pathname?.startsWith('/songs/') &&
        pathname !== '/songs' &&
        pathname !== '/songs/add' &&
        !pathname.endsWith('/edit');

    useEffect(() => {
        if (!isSongDetailPage || !preferences.autoHideBottomNav) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional sync of local state with props/route; refactor tracked separately (Epic 5.1 lint ratchet)
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

    // Expose nav visibility as CSS custom property for the mini-player to use
    useEffect(() => {
        document.documentElement.style.setProperty(
            '--bottom-nav-height',
            isVisible && isSongDetailPage && preferences.autoHideBottomNav ? '3.5rem' : '0rem'
        );
        return () => {
            document.documentElement.style.removeProperty('--bottom-nav-height');
        };
    }, [isVisible, isSongDetailPage, preferences.autoHideBottomNav]);

    return (
        <>
            <CreateSheet
                isOpen={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
            />
            <nav className={`fixed bottom-0 inset-x-0 z-30 lg:hidden transition-transform duration-300 ${!isVisible ? 'translate-y-full' : 'translate-y-0'}`}>
                {/* Top edge glow */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />

                <div className="bg-bg/95 backdrop-blur-xl border-t border-line safe-area-bottom">
                    <div className="flex items-center justify-around h-14 px-2">
                        {bottomTabs.map((tab) => {
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
                                                ? 'text-accent'
                                                : 'text-fg-muted hover:text-fg'
                                        }`}
                                    >
                                        <div className="relative">
                                            <Icon className="w-[22px] h-[22px]" strokeWidth={active ? 2.5 : 1.8} />
                                            {active && (
                                                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
                                            )}
                                        </div>
                                        <span className={`text-caption leading-tight mt-0.5 ${active ? 'font-semibold' : 'font-medium'}`}>
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
                                            ? 'text-accent'
                                            : 'text-fg-muted hover:text-fg'
                                    }`}
                                >
                                    <div className="relative">
                                        <Icon className="w-[22px] h-[22px]" strokeWidth={active ? 2.5 : 1.8} />
                                        {active && (
                                            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
                                        )}
                                    </div>
                                    <span className={`text-caption leading-tight mt-0.5 ${active ? 'font-semibold' : 'font-medium'}`}>
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
