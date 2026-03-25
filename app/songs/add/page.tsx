import SongForm from '@/components/song/SongForm';

export default function AddSongPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 pb-20">

            <main className="container mx-auto px-4 pt-8">


                <SongForm mode="create" />
            </main>
        </div>
    );
}
