'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/context/LocaleContext';

/**
 * Shown to a signed-in member who does not own the song (Story 6.1.26 / G6.1, #410).
 * Keeps the warm copy and adds a plain way out. Guests get the GuestGate instead.
 */
export default function NotYoursToEdit({ songId }: { songId?: string }) {
    const { t } = useLocale();
    return (
        <div data-testid="not-yours-to-edit" className="mx-auto flex max-w-md flex-col items-center gap-3 p-8 text-center">
            <h1 className="text-title font-semibold text-fg">{t('feedback.accessDenied.title')}</h1>
            <p className="text-body text-fg-muted">{t('feedback.accessDenied.description')}</p>
            <div className="mt-2 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
                {songId ? (
                    <Button asChild>
                        <Link href={`/songs/${songId}`}>{t('feedback.accessDenied.backToSong')}</Link>
                    </Button>
                ) : null}
                <Button asChild variant="outline">
                    <Link href="/">{t('feedback.accessDenied.returnToCircle')}</Link>
                </Button>
            </div>
        </div>
    );
}
