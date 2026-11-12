'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { clearCatalogEdit } from '@/lib/catalog/catalogEdits';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ClearCatalogEditReason = 'forbidden' | 'not_marked' | 'changed' | 'error';

export interface ClearCatalogEditOutcome {
  ok: boolean;
  reason?: ClearCatalogEditReason;
}

/**
 * Story 6.2.21 (#524): an admin marks a catalog correction as taken over by the source catalog,
 * so the next import may update the row again. `editedAt` is the `edited_at` the admin saw: a
 * correction made after it stays marked (`changed`). A marker that is already cleared counts as
 * done (`ok` with reason `not_marked`). The RPC refuses non-admins (`forbidden`).
 */
export async function clearCatalogEditAction(
  kind: unknown,
  id: unknown,
  editedAt: unknown
): Promise<ClearCatalogEditOutcome> {
  if (
    (kind !== 'song' && kind !== 'version') ||
    typeof id !== 'string' ||
    !UUID.test(id) ||
    typeof editedAt !== 'string' ||
    Number.isNaN(Date.parse(editedAt))
  ) {
    return { ok: false, reason: 'error' };
  }
  try {
    const result = await clearCatalogEdit(await createClient(), kind, id, editedAt);
    if (result === 'forbidden' || result === 'error') return { ok: false, reason: result };
    // The list changed either way: the row is gone, or it shows the newer correction.
    revalidatePath('/admin/catalog-edits');
    if (result === 'cleared') return { ok: true };
    if (result === 'not_marked') return { ok: true, reason: 'not_marked' };
    return { ok: false, reason: 'changed' };
  } catch (error) {
    console.error('[clearCatalogEditAction]', error);
    return { ok: false, reason: 'error' };
  }
}
