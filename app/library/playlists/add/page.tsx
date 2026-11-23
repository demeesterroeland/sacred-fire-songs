import { createClient } from '@/lib/supabase/server';
import { CreatePlaylistForm } from '@/components/playlists/CreatePlaylistForm';
import GuestGate from '@/components/common/GuestGate';

export default async function CreatePlaylistPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return <GuestGate feature="newPlaylist" next="/library/playlists/add" />;

    return <CreatePlaylistForm />;
}
