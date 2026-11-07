'use client';

import SongDisplay from '@/components/song/SongDisplay';
import { hasChords } from '@/lib/chordProParsing';
import { useLocale } from '@/context/LocaleContext';

interface ChordPreviewProps {
    content: string;
}

/**
 * Add Song preview (Story 6.1.31 / G8.2, #415): the typed ChordPro rendered by the
 * same component the song page uses, so what the member sees here is what they get.
 */
export default function ChordPreview({ content }: ChordPreviewProps) {
    const { t } = useLocale();

    if (!content.trim()) {
        return <p className="p-4 text-meta text-fg-muted">{t('songForm.preview.empty')}</p>;
    }

    return (
        <div className="py-4 pr-4 pl-8">
            <SongDisplay content={content} hasChords={hasChords(content)} />
        </div>
    );
}
