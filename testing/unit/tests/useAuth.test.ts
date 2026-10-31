import { describe, it, expect, vi } from 'vitest';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/lib/supabase/client', () => ({ createClient: () => ({}) }));
vi.mock('@/lib/export/pdfCache', () => ({ clearPdfCache: vi.fn() }));

import { useAuth, type AuthUser } from '@/hooks/useAuth';

/**
 * Captures the hook's state on the first render. renderToString never runs
 * effects, so this is exactly what a page sees before the session resolves
 * (#321: the playlists/add guest guard fired on this render).
 */
function firstRender(...args: [] | [AuthUser | null]) {
    let state: ReturnType<typeof useAuth> | undefined;
    function Probe() {
        state = useAuth(...args);
        return null;
    }
    renderToString(
        createElement(QueryClientProvider, { client: new QueryClient() }, createElement(Probe))
    );
    return state!;
}

const serverUser: AuthUser = { id: 'u1', email: 'a@b.c', role: 'member' };

describe('useAuth initial state (#321)', () => {
    it('is loading when no server user was passed, so guest guards wait for the session', () => {
        const { user, loading } = firstRender();
        expect(user).toBeNull();
        expect(loading).toBe(true);
    });

    it('is not loading when the server passed a user (no header flash)', () => {
        const { user, loading } = firstRender(serverUser);
        expect(user).toEqual(serverUser);
        expect(loading).toBe(false);
    });

    it('is not loading when the server says guest (null), so the Sign In button renders immediately', () => {
        const { user, loading } = firstRender(null);
        expect(user).toBeNull();
        expect(loading).toBe(false);
    });
});
