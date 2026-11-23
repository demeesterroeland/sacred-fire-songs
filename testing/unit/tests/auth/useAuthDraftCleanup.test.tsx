// @vitest-environment jsdom
// #607: on a shared device, signing out removes the unsaved Add Song draft,
// next to the query cache and the cached setlist PDFs.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const auth = vi.hoisted(() => ({
    listener: undefined as undefined | ((event: string) => void),
}));

vi.mock('@/lib/supabase/client', () => ({
    createClient: () => ({
        auth: {
            getSession: async () => ({ data: { session: null } }),
            signOut: async () => ({ error: null }),
            onAuthStateChange: (cb: (event: string) => void) => {
                auth.listener = cb;
                return { data: { subscription: { unsubscribe: () => {} } } };
            },
        },
    }),
}));
vi.mock('@/lib/export/pdfCache', () => ({ clearPdfCache: vi.fn(async () => {}) }));

import { useAuth } from '@/hooks/useAuth';
import { SONG_DRAFT_KEY, writeSongDraft } from '@/lib/songs/songDraft';

function wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: new QueryClient() }, children);
}

afterEach(() => {
    cleanup();
    localStorage.clear();
});

describe('useAuth clears the song draft (#607)', () => {
    it('removes the draft when the user signs out', async () => {
        writeSongDraft({ title: 'Unsaved words' }, 'member-a');
        expect(localStorage.getItem(SONG_DRAFT_KEY)).not.toBeNull();
        const { result } = renderHook(() => useAuth(null), { wrapper });

        await act(() => result.current.logout());

        expect(localStorage.getItem(SONG_DRAFT_KEY)).toBeNull();
    });

    it('removes the draft when the session ends elsewhere (SIGNED_OUT event)', () => {
        writeSongDraft({ title: 'Unsaved words' }, 'member-a');
        expect(localStorage.getItem(SONG_DRAFT_KEY)).not.toBeNull();
        renderHook(() => useAuth(null), { wrapper });

        act(() => auth.listener?.('SIGNED_OUT'));

        expect(localStorage.getItem(SONG_DRAFT_KEY)).toBeNull();
    });
});
