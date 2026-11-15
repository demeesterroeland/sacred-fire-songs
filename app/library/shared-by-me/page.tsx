import { Share2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getServerT } from '@/lib/i18n/server';
import { getSharedByMe } from '@/lib/library/serverQueries';
import { SharedByMeList } from '@/components/library/SharedByMeList';
import GuestGate from '@/components/common/GuestGate';
import { LibrarySubpageHeading } from '@/components/library/LibrarySubpageHeading';

/** Story 6.1.36 (#488): my takes that I shared with other members. Members only. */
export default async function SharedByMePage() {
    const t = await getServerT();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return <GuestGate feature="sharedByMe" next="/library/shared-by-me" />;

    const items = await getSharedByMe(user.id);

    return (
        <div>
            <LibrarySubpageHeading icon={Share2} title={t('sharedByMe.title')} count={items.length} level={1} />
            <SharedByMeList items={items} />
        </div>
    );
}
