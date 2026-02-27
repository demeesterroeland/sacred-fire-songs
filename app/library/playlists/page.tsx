import { createClient } from '@/lib/supabase/server';
import { GuestHearth } from '@/components/playlists/GuestHearth';
import SetlistManager from '@/components/playlists/SetlistManager';

export default async function PlaylistsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return <GuestHearth />;
    }

    // Fetch all user setlists for initial data
    const { data: setlists } = await supabase
        .from('setlists')
        .select('id, owner_id, title, description, is_public, created_at')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

    return <SetlistManager initialSetlists={setlists ?? []} />;
}
