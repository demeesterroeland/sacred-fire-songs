import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import SetlistEditor from '@/components/playlists/SetlistEditor';
import { Setlist, SetlistItem } from '@/types';

export default async function SetlistPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    // Fetch setlist with items, song versions, and composition titles
    const { data: setlistData, error } = await supabase
        .from('setlists')
        .select(`
            *,
            items:setlist_items(
                *,
                song_version:song_versions(
                    *,
                    composition:compositions(title)
                )
            )
        `)
        .eq('id', id)
        .eq('owner_id', user.id)
        .single();

    if (error || !setlistData) {
        return notFound();
    }

    // Sort items by order_index manually
    const sortedItems = ((setlistData.items as unknown as SetlistItem[]) || []).sort((a, b) => a.order_index - b.order_index);

    const setlist = {
        ...setlistData,
        items: sortedItems
    } as unknown as Setlist;

    return (
        <div className="p-4 md:p-8">
            <SetlistEditor initialSetlist={setlist} />
        </div>
    );
}
