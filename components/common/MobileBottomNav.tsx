'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BOTTOM_NAV_ITEMS, isBottomNavActive } from '@/lib/navigation';
import { requestSearchFocus } from '@/lib/search/focusSearch';
import { useUserPreferences } from '@/context/UserPreferencesContext';
import { useLocale } from '@/context/LocaleContext';

/**
 * Mobile bottom bar (Story 6.1.24 / G5.3, #408, owner decision UXD-1):
 * Home · Search · Library. One accent marks the current item; Create is a "+"
 * in Library, Practice lives on the song page.
 */
export default function MobileBottomNav() {
    const { t } = useLocale();
    const pathname = usePathname();
    const { preferences } = useUserPreferences();
    const [isVisible, setIsVisible] = useState(true);
    // Set after mount: the Search tap can only request focus once React has hydrated.
    const [hydrated, setHydrated] = useState(false);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time mount flag
    useEffect(() => setHydrated(true), []);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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
        <nav
            data-testid="bottom-nav"
            aria-label={t('nav.bottomNavigation')}
            data-hydrated={hydrated ? 'true' : undefined}
            className={`fixed bottom-0 inset-x-0 z-30 lg:hidden motion-safe:transition-transform motion-safe:duration-300 ${!isVisible ? 'translate-y-full' : 'translate-y-0'}`}
        >
            <div className="bg-bg/95 backdrop-blur-xl border-t border-line safe-area-bottom">
                <div className="flex h-bar items-stretch px-2">
                    {BOTTOM_NAV_ITEMS.map((item) => {
                        const active = isBottomNavActive(pathname, item);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                aria-current={active ? 'page' : undefined}
                                onClick={item.focusSearch ? requestSearchFocus : undefined}
                                className={`flex min-h-tap flex-1 flex-col items-center justify-center gap-0.5 rounded-control py-1 transition-colors motion-safe:active:scale-95 ${
                                    active ? 'text-accent' : 'text-fg-muted hover:text-fg'
                                }`}
                            >
                                <span className="relative">
                                    <Icon className="size-[22px]" strokeWidth={active ? 2.5 : 1.8} aria-hidden />
                                    {active && (
                                        <span aria-hidden className="absolute -bottom-1.5 left-1/2 size-1 -translate-x-1/2 rounded-pill bg-accent" />
                                    )}
                                </span>
                                <span className={`mt-0.5 text-caption leading-tight ${active ? 'font-semibold' : 'font-medium'}`}>
                                    {t(item.labelKey)}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
