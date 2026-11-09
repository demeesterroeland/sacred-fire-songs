'use client';

import Link from 'next/link';
import { Heart, Lock, Trash2 } from 'lucide-react';
import { MetaLine } from '@/components/ui/meta-line';
import { songRowMeta } from '@/lib/songs/songMeta';
import { cn } from '@/lib/utils';
import { useToggleFavorite } from '@/hooks/useToggleFavorite';
import GuestGateSheet from '@/components/common/GuestGateSheet';
import { PlaylistPicker } from '@/components/playlists/PlaylistPicker';
import { useLocale } from '@/context/LocaleContext';

interface SongCardProps {
    id: string;
    title: string;
    author: string;
    songKey?: string | null;
    isPublic?: boolean;
    isFavorite?: boolean;
    userId?: string;
    canDelete?: boolean;
    onDelete?: () => void;
    categories?: {
        name: string;
        slug: string;
        emoji?: string;
        parent?: string | null;
    }[];
}

/**
 * Song list row (Story 6.1.2 / G1.2, #386): title, one grey meta line
 * `Author · Category · Language` and a key badge on the right. No coloured
 * chips, no glow, no accent bar. The whole row opens the song; heart and
 * add-to-playlist stay separate 44 px targets.
 */
export default function SongCard({
    id,
    title,
    author,
    songKey,
    isPublic = true,
    isFavorite = false,
    userId,
    canDelete = false,
    onDelete,
    categories = [],
}: SongCardProps) {
    const { t } = useLocale();
    const { isFav, handleToggle, signInGate } = useToggleFavorite(id, isFavorite);

    return (
        <div
            data-testid="song-row"
            className={cn(
                'group relative flex min-h-tap items-center gap-1 border-b border-line py-2 pl-4 pr-1 transition-colors hover:bg-surface',
                !isPublic && 'border-dashed'
            )}
        >
            {/* Stretched link: the whole row opens the song, without nesting buttons inside it. */}
            <Link href={`/songs/${id}`} className="absolute inset-0 z-10" aria-label={t('songCard.view', { title })} />

            <div className="min-w-0 flex-1 pr-2">
                <div className="flex items-center gap-2">
                    <h3 className={cn('truncate text-row font-medium', isPublic ? 'text-fg' : 'text-fg-muted')}>{title}</h3>
                    {!isPublic && (
                        <span
                            className="inline-flex shrink-0 items-center text-fg-muted"
                            title={t('song.visibility.private')}
                            data-testid="song-row-draft"
                        >
                            <Lock className="size-3.5" aria-hidden />
                            <span className="sr-only">{t('song.visibility.private')}</span>
                        </span>
                    )}
                </div>
                <MetaLine items={songRowMeta(author, categories, t)} className="mt-0.5" data-testid="song-row-meta" />
            </div>

            {songKey && (
                <span className="shrink-0 rounded-control border border-line px-1.5 font-mono text-caption text-fg-muted" data-testid="song-row-key">
                    <span aria-hidden>{songKey}</span>
                    <span className="sr-only">{t('song.meta.key', { key: songKey })}</span>
                </span>
            )}

            <div className="relative z-20 flex shrink-0 items-center">
                {canDelete && onDelete && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onDelete();
                        }}
                        className="inline-flex size-tap items-center justify-center rounded-pill text-fg-subtle opacity-0 transition-opacity hover:text-danger focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
                        aria-label={t('songCard.delete')}
                        title={t('songCard.delete')}
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                )}
                {userId && (
                    <PlaylistPicker
                        compositionId={id}
                        userId={userId}
                        triggerClassName="inline-flex size-tap items-center justify-center rounded-pill text-fg-subtle hover:text-fg"
                        iconClassName="w-4 h-4"
                    />
                )}
                <button
                    type="button"
                    onClick={handleToggle}
                    aria-pressed={isFav}
                    aria-label={isFav ? t('songCard.removeFavorite') : t('songCard.addFavorite')}
                    className={cn(
                        'inline-flex size-tap items-center justify-center rounded-pill transition-colors',
                        isFav ? 'text-accent' : 'text-fg-subtle hover:text-fg'
                    )}
                >
                    <Heart className={cn('h-4 w-4', isFav && 'fill-current')} strokeWidth={1.5} />
                </button>
            </div>
            {signInGate.open && <GuestGateSheet feature="favourites" {...signInGate} />}
        </div>
    );
}
