import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CreatePlaylistForm } from '@/components/playlists/CreatePlaylistForm';

export default async function CreatePlaylistPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect(`/auth/login?next=${encodeURIComponent('/library/playlists/add')}`);

    return <CreatePlaylistForm />;
}
