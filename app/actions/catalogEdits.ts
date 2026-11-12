'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { clearCatalogEdit } from '@/lib/catalog/catalogEdits';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Story 6.2.21 (#524): an admin marks a catalog correction as taken over by the source catalog,
 * so the next import may update the row again. The RPC refuses non-admins.
 */
export async function clearCatalogEditAction(kind: unknown, id: unknown): Promise<{ ok: boolean }> {
  if ((kind !== 'song' && kind !== 'version') || typeof id !== 'string' || !UUID.test(id)) {
    return { ok: false };
  }
  const ok = await clearCatalogEdit(await createClient(), kind, id);
  if (ok) revalidatePath('/admin/catalog-edits');
  return { ok };
}
