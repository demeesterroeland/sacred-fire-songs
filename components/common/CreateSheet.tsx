'use client';

import { useEffect, useRef } from 'react';
import { Music, ListMusic } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

interface CreateSheetProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateSheet({ isOpen, onClose }: CreateSheetProps) {
    const router = useRouter();
    const pathname = usePathname();
    const sheetRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        if (!isOpen) return;
        const handleClick = (e: MouseEvent) => {
            if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        // Delay to avoid closing from the same click that opened
        const timer = setTimeout(() => document.addEventListener('click', handleClick), 0);
        return () => {
            clearTimeout(timer);
            document.removeEventListener('click', handleClick);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const options = [
        { label: 'Add Song', icon: Music, href: `/songs/add?next=${encodeURIComponent(pathname)}`, color: 'text-red-400' },
        { label: 'Create Playlist', icon: ListMusic, href: '/library/playlists/add', color: 'text-purple-400' },
    ];

    return (
        <div
            ref={sheetRef}
            className="fixed bottom-[72px] inset-x-0 z-40 px-4 pb-2 safe-area-bottom animate-in slide-in-from-bottom-4 duration-200 lg:hidden"
        >
            <div className="bg-gray-900 border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
                {options.map((opt) => {
                    const Icon = opt.icon;
                    return (
                        <button
                            key={opt.href}
                            onClick={() => {
                                onClose();
                                router.push(opt.href);
                            }}
                            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-800/50 transition-colors active:scale-[0.98] border-b border-gray-800/30 last:border-b-0"
                        >
                            <Icon className={`w-5 h-5 ${opt.color}`} />
                            <span className="text-sm font-semibold text-white">{opt.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
