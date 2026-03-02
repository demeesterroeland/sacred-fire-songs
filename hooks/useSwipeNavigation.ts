'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const TAB_ORDER = ['/', '/songs', '/library/playlists'];
const EXCLUDED_PATHS = ['/songs/add', '/library/playlists/add'];

export function useSwipeNavigation(containerRef: React.RefObject<HTMLElement | null>) {
    const pathname = usePathname();
    const router = useRouter();
    const touchStart = useRef<{ x: number; y: number } | null>(null);
    const lastDx = useRef(0);
    const swiping = useRef(false);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const isExcluded = EXCLUDED_PATHS.some(p => pathname === p) ||
            (pathname?.startsWith('/songs/') && pathname !== '/songs');
        if (isExcluded) return;

        const currentIndex = TAB_ORDER.indexOf(pathname || '');
        if (currentIndex === -1) return;

        const handleTouchStart = (e: TouchEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest('.hide-scroll')) return;
            touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            swiping.current = false;
            lastDx.current = 0;
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!touchStart.current) return;
            const dx = e.touches[0].clientX - touchStart.current.x;
            const dy = e.touches[0].clientY - touchStart.current.y;
            if (Math.abs(dy) > Math.abs(dx)) { touchStart.current = null; return; }
            lastDx.current = dx;
            if (Math.abs(dx) > 50 && Math.abs(dy) < 30) swiping.current = true;
        };

        const handleTouchEnd = () => {
            if (!swiping.current) { touchStart.current = null; lastDx.current = 0; return; }
            const direction = lastDx.current < 0 ? 1 : -1;
            const nextIndex = currentIndex + direction;
            touchStart.current = null;
            swiping.current = false;
            lastDx.current = 0;
            if (nextIndex >= 0 && nextIndex < TAB_ORDER.length) {
                router.push(TAB_ORDER[nextIndex]);
            }
        };

        el.addEventListener('touchstart', handleTouchStart, { passive: true });
        el.addEventListener('touchmove', handleTouchMove, { passive: true });
        el.addEventListener('touchend', handleTouchEnd, { passive: true });
        return () => {
            el.removeEventListener('touchstart', handleTouchStart);
            el.removeEventListener('touchmove', handleTouchMove);
            el.removeEventListener('touchend', handleTouchEnd);
        };
    }, [pathname, router, containerRef]);
}
