'use client';

import { useRef } from 'react';
import { useSidebar } from '@/context/SidebarContext';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';

export default function MainContent({ children }: { children: React.ReactNode }) {
    const { isOpen, setIsOpen } = useSidebar();
    const contentRef = useRef<HTMLDivElement>(null);

    useSwipeNavigation(isOpen ? { current: null } : contentRef);

    return (
        <div
            ref={contentRef}
            onClick={isOpen ? () => setIsOpen(false) : undefined}
            className={`flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-gray-950 relative transition-transform duration-300 ease-in-out ${isOpen ? 'lg:translate-x-0 translate-x-[260px]' : 'translate-x-0'}`}
        >
            {children}
        </div>
    );
}
