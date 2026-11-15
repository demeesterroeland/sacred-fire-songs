// @vitest-environment jsdom
// Story 6.1.26 / G6.1 (#410) review fix: a guest tapping ♥ gets the GuestGate (no hard-coded toast).
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const { toggleFavorite, toast } = vi.hoisted(() => ({
  toggleFavorite: vi.fn(),
  toast: Object.assign(vi.fn(), { success: vi.fn() }),
}));
vi.mock('@/app/actions/toggleFavorite', () => ({ toggleFavorite }));
vi.mock('sonner', () => ({ toast }));
vi.mock('@/context/LocaleContext', () => ({ useLocale: () => ({ t: (k: string) => k }) }));

import { useToggleFavorite } from '@/hooks/useToggleFavorite';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('useToggleFavorite as a guest', () => {
  it('reverts the heart and opens the sign-in gate instead of toasting', async () => {
    toggleFavorite.mockResolvedValue({ error: 'Not authenticated' });
    const { result } = renderHook(() => useToggleFavorite('song-1', false), { wrapper });
    expect(result.current.signInGate.open).toBe(false);
    await act(async () => {
      await result.current.handleToggle();
    });
    expect(result.current.isFav).toBe(false);
    expect(result.current.signInGate.open).toBe(true);
    expect(toast).not.toHaveBeenCalled();
    act(() => result.current.signInGate.onOpenChange(false));
    expect(result.current.signInGate.open).toBe(false);
  });

  it('keeps no hard-coded English sign-in copy', () => {
    const src = fs.readFileSync(path.resolve(__dirname, '../../../hooks/useToggleFavorite.ts'), 'utf8');
    expect(src).not.toContain('Sign in to save favorites');
    expect(src).not.toContain('Sign in →');
  });
});
