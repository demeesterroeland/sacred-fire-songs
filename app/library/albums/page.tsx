import { notFound } from 'next/navigation';
import { Disc3 } from 'lucide-react';
import { getServerT } from '@/lib/i18n/server';
import { FEATURES } from '@/lib/features';

// Albums is on the roadmap but hidden (UXD-4, Story 6.1.23 / #407): the route
// stays and answers 404 until the feature is switched on in lib/features.ts.
export default async function AlbumsPage() {
    if (!FEATURES.albums) notFound();
    const t = await getServerT();
    return (
        <div className="mt-16 flex flex-col items-center text-center">
            <div className="size-16 rounded-panel bg-surface-2 flex items-center justify-center mb-5">
                <Disc3 className="size-8 text-fg-muted" aria-hidden />
            </div>
            <h2 className="text-title font-semibold text-fg mb-1">{t('albums.likedAlbums')}</h2>
            <p className="text-body text-fg-muted max-w-xs">{t('albums.description')}</p>
        </div>
    );
}
