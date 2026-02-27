'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { useState, ReactNode, useEffect } from 'react';

export default function QueryProvider({ children }: { children: ReactNode }) {
    // Ensure QueryClient is created once per client lifecycle to avoid prop drilling issues
    // or resetting cache on re-renders.
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                // Data is considered fresh for 5 minutes. 
                // During this time, we won't even ask the server.
                staleTime: 5 * 60 * 1000,
                // If a request fails, retry 1 time before showing error.
                retry: 1,
                // Ensure data stays in cache even if stale when offline
                gcTime: 1000 * 60 * 60 * 24, // 24 hours
            },
        },
    }));

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const localStoragePersister = createSyncStoragePersister({
                storage: window.localStorage,
                key: 'SFS_QUERY_CACHE',
            });

            persistQueryClient({
                queryClient,
                persister: localStoragePersister,
                maxAge: 1000 * 60 * 60 * 24, // 24 hours
            });
        }
    }, [queryClient]);

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
