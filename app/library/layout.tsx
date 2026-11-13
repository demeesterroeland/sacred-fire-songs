import LibraryTabs from './LibraryTabs';

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex-1 min-w-0 overflow-y-auto bg-bg p-4 pb-24 md:p-8 md:pb-28 lg:p-12">
            <div className="max-w-4xl mx-auto w-full min-w-0">
                <LibraryTabs />
                {children}
            </div>
        </div>
    );
}
