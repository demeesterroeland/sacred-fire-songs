'use client';

import { Music, ListMusic } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from '@/context/LocaleContext';
import { BottomSheet, BottomSheetContent, SheetAction } from '@/components/ui/bottom-sheet';

interface CreateSheetProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Create menu behind the "+" in Library (Story 6.1.24, #408, UXD-1): add a song
 * or start a playlist. Built on the shared bottom sheet.
 */
export default function CreateSheet({ isOpen, onClose }: CreateSheetProps) {
    const { t } = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const options = [
        { label: t('header.addSong'), icon: Music, href: `/songs/add?next=${encodeURIComponent(pathname)}` },
        { label: t('header.newPlaylist'), icon: ListMusic, href: '/library/playlists/add' },
    ];

    return (
        <BottomSheet open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <BottomSheetContent title={t('nav.create')} hideTitle>
                <div className="py-1">
                    {options.map(({ label, icon: Icon, href }) => (
                        <SheetAction
                            key={href}
                            icon={<Icon />}
                            onClick={() => {
                                onClose();
                                router.push(href);
                            }}
                        >
                            {label}
                        </SheetAction>
                    ))}
                </div>
            </BottomSheetContent>
        </BottomSheet>
    );
}
