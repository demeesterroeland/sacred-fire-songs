import { beforeEach, describe, expect, it, vi } from 'vitest';

/** Story 6.2.21 (#524): the "taken over" server action validates its input before the admin-only RPC. */
const rpc = vi.fn();
const revalidatePath = vi.fn();
vi.mock('@/lib/supabase/server', () => ({ createClient: async () => ({ rpc }) }));
vi.mock('next/cache', () => ({ revalidatePath: (p: string) => revalidatePath(p) }));

const { clearCatalogEditAction } = await import('@/app/actions/catalogEdits');
const ID = '6f9619ff-8b86-4011-b42d-00c04fc964ff';

describe('clearCatalogEditAction', () => {
  beforeEach(() => {
    rpc.mockReset();
    revalidatePath.mockReset();
  });

  it.each([
    ['row', ID],
    ['version', 'not-a-uuid'],
    ['song', 42],
  ])('refuses kind %s with id %s without calling the database', async (kind, id) => {
    await expect(clearCatalogEditAction(kind, id)).resolves.toEqual({ ok: false });
    expect(rpc).not.toHaveBeenCalled();
  });

  it('clears the marker and refreshes the admin page', async () => {
    rpc.mockResolvedValue({ data: true, error: null });
    await expect(clearCatalogEditAction('version', ID)).resolves.toEqual({ ok: true });
    expect(rpc).toHaveBeenCalledWith('fn_clear_catalog_edit', { p_kind: 'version', p_id: ID });
    expect(revalidatePath).toHaveBeenCalledWith('/admin/catalog-edits');
  });

  it('reports a refusal', async () => {
    rpc.mockResolvedValue({ data: null, error: { code: '42501', message: 'Only admins' } });
    await expect(clearCatalogEditAction('song', ID)).resolves.toEqual({ ok: false });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
