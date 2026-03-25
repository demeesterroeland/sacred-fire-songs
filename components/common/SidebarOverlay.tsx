'use client';

import { useSidebar } from '@/context/SidebarContext';

export default function SidebarOverlay() {
    const { isOpen, setIsOpen } = useSidebar();

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
        />
    );
}
