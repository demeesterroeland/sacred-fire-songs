'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Globe, Lock, Loader2 } from 'lucide-react';
import { createPlaylist } from '@/app/actions/playlistActions';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { NEW_PLAYLIST_IS_PUBLIC, canCreatePlaylist, visibilityExplainKey } from '@/lib/playlists/visibility';
import { useLocale } from '@/context/LocaleContext';
import { actionErrorMessage } from '@/lib/errors/actionError';

/** Client half of /library/playlists/add; the page guards auth on the server (#321). */
export function CreatePlaylistForm() {
    const { t } = useLocale();
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [isPublic, setIsPublic] = useState(NEW_PLAYLIST_IS_PUBLIC);
    const [isPending, startTransition] = useTransition();
    const inputRef = useRef<HTMLInputElement>(null);
    // A second Enter before the first request settles must not create a second playlist.
    const submittingRef = useRef(false);

    // Auto-focus the title input
    useEffect(() => {
        // Small delay to ensure the page has rendered
        const timer = setTimeout(() => inputRef.current?.focus(), 100);
        return () => clearTimeout(timer);
    }, []);

    const handleCreate = () => {
        if (submittingRef.current || isPending) return;
        const trimmed = title.trim();
        if (!trimmed) {
            toast.error(t('playlists.add.nameRequired'));
            inputRef.current?.focus();
            return;
        }

        submittingRef.current = true;
        startTransition(async () => {
            let result: Awaited<ReturnType<typeof createPlaylist>>;
            try {
                result = await createPlaylist(trimmed, isPublic);
            } catch {
                // A thrown or rejected request must not leave the form locked.
                submittingRef.current = false;
                toast.error(t('common.errorOccurred'));
                return;
            }
            if ('error' in result) {
                submittingRef.current = false;
                toast.error(actionErrorMessage(result.error, t));
            } else {
                toast.success(t('playlists.add.created'));
                router.push(`/library/playlists/${result.id}`);
            }
        });
    };

    const explainId = 'new-playlist-visibility-explain';

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-1">
                <Link
                    href="/library/playlists"
                    className="-ml-3 flex size-tap shrink-0 items-center justify-center text-fg-muted transition-colors hover:text-fg"
                    aria-label={t('playlists.detail.back')}
                >
                    <ArrowLeft className="size-5" aria-hidden="true" />
                </Link>
                <input
                    ref={inputRef}
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter') handleCreate();
                        if (e.key === 'Escape') router.push('/library/playlists');
                    }}
                    placeholder={t('playlists.add.namePlaceholder')}
                    aria-label={t('playlists.add.namePlaceholder')}
                    className="field-underline min-h-tap min-w-0 flex-1 border-b border-line-strong bg-transparent text-title font-bold text-fg placeholder:text-fg-subtle"
                />
            </div>

            {/* Visibility: one switch, one line that says what it means */}
            <div className="space-y-1">
                <div className="flex min-h-tap items-center justify-between gap-4">
                    <label htmlFor="new-playlist-public" className="flex items-center gap-2 text-body font-semibold text-fg">
                        {isPublic ? <Globe className="size-4" aria-hidden="true" /> : <Lock className="size-4" aria-hidden="true" />}
                        {t('playlists.add.visibilityLabel')}
                    </label>
                    <Switch
                        id="new-playlist-public"
                        checked={isPublic}
                        onCheckedChange={setIsPublic}
                        aria-describedby={explainId}
                        className="shrink-0"
                    />
                </div>
                <p id={explainId} className="text-meta text-fg-muted">
                    {t(visibilityExplainKey(isPublic))}
                </p>
            </div>

            {/* Create button */}
            <Button
                type="button"
                size="lg"
                onClick={handleCreate}
                disabled={!canCreatePlaylist(title, isPending)}
                className="w-full font-bold"
            >
                {isPending ? (
                    <>
                        <Loader2 className="size-5 motion-safe:animate-spin" aria-hidden="true" />
                        {t('playlists.add.creating')}
                    </>
                ) : (
                    t('playlists.add.submit')
                )}
            </Button>
        </div>
    );
}
