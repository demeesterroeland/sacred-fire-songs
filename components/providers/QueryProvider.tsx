'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, ReactNode } from 'react';

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
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}