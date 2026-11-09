import Link from 'next/link';
import { Inbox } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { ListRow } from '@/components/ui/list-row';
import { songRowMeta } from '@/lib/songs/songMeta';
import { getUnviewedSongs } from '@/lib/songs/serverQueries';
import { getServerT } from '@/lib/i18n/server';
import GuestGate from '@/components/common/GuestGate';
import { LibrarySubpageHeading } from '@/components/library/LibrarySubpageHeading';

/** Library · New tab (validation 4): songs added in the last 30 days that you have not opened yet. */
export default async function NewSongsPage() {
    const t = await getServerT();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return <GuestGate feature="newSongs" next="/library/new" />;

    const songs = await getUnviewedSongs(user.id, 50);

    return (
        <div>
            <LibrarySubpageHeading icon={Inbox} title={t('newSinceLastVisit.section')} count={songs.length} />
            {songs.length === 0 ? (
                <p className="text-meta text-fg-muted italic py-8 text-center">{t('newSinceLastVisit.empty')}</p>
            ) : (
                <div className="border-t border-line" data-testid="song-rows">
                    {songs.map((song) => (
                        <ListRow key={song.id} asChild title={song.title} meta={songRowMeta(song.author, song.categories, t)} className="px-0">
                            <Link href={`/songs/${song.id}`} data-testid="song-row" />
                        </ListRow>
                    ))}
                </div>
            )}
        </div>
    );
}
