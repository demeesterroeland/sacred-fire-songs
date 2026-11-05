import { Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getServerT } from '@/lib/i18n/server';
import { getSharedWithMe } from '@/lib/notifications/serverQueries';
import { SharedWithMeList } from '@/components/library/SharedWithMeList';
import GuestGate from '@/components/common/GuestGate';

/** Story 6.1.19 / G4.6 (#403), UXD-3: takes others shared with me. Members only. */
export default async function SharedWithMePage() {
    const t = await getServerT();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return <GuestGate feature="sharedWithMe" next="/library/shared" />;

    const items = await getSharedWithMe(user.id);

    return (
        <div>
            <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-fg-subtle" aria-hidden />
                <h2 className="text-meta font-semibold text-fg-muted">{t('sharedWithMe.title')}</h2>
                <span className="text-caption text-fg-subtle ml-1">({items.length})</span>
            </div>
            <SharedWithMeList items={items} />
        </div>
    );
}
