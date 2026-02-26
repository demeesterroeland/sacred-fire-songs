import { fetchFavoriteSongsServer } from '@/lib/songs/serverQueries';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import FavoritesPageContent from './FavoritesPageContent';

export default async function FavoritesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const songs = await fetchFavoriteSongsServer();

    return <FavoritesPageContent initialSongs={songs} />;
}
