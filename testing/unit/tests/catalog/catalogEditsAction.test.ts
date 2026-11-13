import { beforeEach, describe, expect, it, vi } from 'vitest';

/** Story 6.2.21 (#524): the "taken over" server action validates its input before the admin-only RPC. */
const rpc = vi.fn();
const revalidatePath = vi.fn();
vi.mock('@/lib/supabase/server', () => ({ createClient: async () => ({ rpc }) }));
vi.mock('next/cache', () => ({ revalidatePath: (p: string) => revalidatePath(p) }));

const { clearCatalogEditAction } = await import('@/app/actions/catalogEdits');
const ID = '6f9619ff-8b86-4011-b42d-00c04fc964ff';
// The exact value the export returned: microseconds included, never rounded through a Date.
const EDITED_AT = '2026-11-13T10:00:00.123456+00:00';

describe('clearCatalogEditAction', () => {
  beforeEach(() => {
    rpc.mockReset();
    revalidatePath.mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it.each([
    ['row', ID, EDITED_AT],
    ['version', 'not-a-uuid', EDITED_AT],
    ['song', 42, EDITED_AT],
    ['song', ID, null],
    ['song', ID, 'yesterday'],
  ])('refuses kind %s with id %s and edited_at %s without calling the database', async (kind, id, editedAt) => {
    await expect(clearCatalogEditAction(kind, id, editedAt)).resolves.toEqual({ ok: false, reason: 'error' });
    expect(rpc).not.toHaveBeenCalled();
  });

  it('clears the marker for the downloaded edit and refreshes the admin page', async () => {
    rpc.mockResolvedValue({ data: 'cleared', error: null });
    await expect(clearCatalogEditAction('version', ID, EDITED_AT)).resolves.toEqual({ ok: true });
    expect(rpc).toHaveBeenCalledWith('fn_clear_catalog_edit', { p_kind: 'version', p_id: ID, p_edited_at: EDITED_AT });
    expect(revalidatePath).toHaveBeenCalledWith('/admin/catalog-edits');
  });

  it('treats a marker that is already cleared as done (review N2)', async () => {
    rpc.mockResolvedValue({ data: 'not_marked', error: null });
    await expect(clearCatalogEditAction('song', ID, EDITED_AT)).resolves.toEqual({ ok: true, reason: 'not_marked' });
    expect(revalidatePath).toHaveBeenCalledWith('/admin/catalog-edits');
  });

  it('reports a newer correction instead of clearing it (review S1)', async () => {
    rpc.mockResolvedValue({ data: 'changed', error: null });
    await expect(clearCatalogEditAction('song', ID, EDITED_AT)).resolves.toEqual({ ok: false, reason: 'changed' });
    expect(revalidatePath).toHaveBeenCalledWith('/admin/catalog-edits');
  });

  it('reports a refusal', async () => {
    rpc.mockResolvedValue({ data: null, error: { code: '42501', message: 'Only admins' } });
    await expect(clearCatalogEditAction('song', ID, EDITED_AT)).resolves.toEqual({ ok: false, reason: 'forbidden' });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it.each([
    ['a database error', () => rpc.mockResolvedValue({ data: null, error: { code: 'XX000', message: 'boom' } })],
    ['an unexpected answer', () => rpc.mockResolvedValue({ data: true, error: null })],
    ['a thrown error', () => rpc.mockRejectedValue(new Error('network'))],
  ])('reports %s as an error', async (_what, arrange) => {
    arrange();
    await expect(clearCatalogEditAction('song', ID, EDITED_AT)).resolves.toEqual({ ok: false, reason: 'error' });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
