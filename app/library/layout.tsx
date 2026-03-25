import LibraryTabs from './LibraryTabs';

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className="flex-1 min-w-0 overflow-y-auto bg-white dark:bg-gray-950 p-4 md:p-8 lg:p-12">
            <div className="max-w-4xl mx-auto">
                <LibraryTabs />
                {children}
            </div>
        </main>
    );
}
