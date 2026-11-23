import { createClient } from '@/lib/supabase/server';
import { fetchCatalogEdits, type CatalogEditsExport } from './catalogEdits';

/**
 * Catalog songs and versions corrected in the app (Story 6.2.21, #524), for the admin page.
 * Null when the caller is not an admin (the RPC refuses). Server Components only.
 */
export async function getCatalogEdits(): Promise<CatalogEditsExport | null> {
  return fetchCatalogEdits(await createClient());
}
