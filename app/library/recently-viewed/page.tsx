import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Clock } from 'lucide-react';
import { ListRow } from '@/components/ui/list-row';
import { songRowMeta } from '@/lib/songs/songMeta';
import { getRecentlyViewedLight } from '@/lib/songs/serverQueries';
import { getServerT } from '@/lib/i18n/server';
import GuestGate from '@/components/common/GuestGate';

export default async function RecentlyViewedPage() {
    const t = await getServerT();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return <GuestGate feature="history" next="/library/recently-viewed" />;

    const songs = await getRecentlyViewedLight(user.id, 50);

    return (
        <div>
            <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-fg-subtle" aria-hidden />
                <h2 className="text-meta font-semibold text-fg-muted">{t('recentlyViewed.section')}</h2>
                <span className="text-caption text-fg-subtle ml-1">({songs.length})</span>
            </div>

            {songs.length === 0 ? (
                <p className="text-meta text-fg-muted italic py-8 text-center">
                    {t('recentlyViewed.emptyWithAction')}
                </p>
            ) : (
                <div className="border-t border-line" data-testid="song-rows">
                  {songs.map((song) => (
                    <ListRow
                      key={song.id}
                      asChild
                      title={song.title}
                      meta={songRowMeta(song.author, [], t)}
                      className="px-0"
                    >
                      <Link href={`/songs/${song.id}`} data-testid="song-row" />
                    </ListRow>
                  ))}
                </div>
            )}
        </div>
    );
}
