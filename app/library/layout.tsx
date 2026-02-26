import LibraryTabs from './LibraryTabs';

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className="flex-1 min-w-0 overflow-y-auto bg-gray-950 p-4 md:p-8 lg:p-12">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 text-white">Your Library</h1>
                    <p className="text-slate-400">Your personal collection of playlists, albums, and artists.</p>
                </header>
                <LibraryTabs />
                {children}
            </div>
        </main>
    );
}
