import { createClient } from '@/lib/supabase/server';
import { buildCatalogEditsFile, catalogEditsFileName, fetchCatalogEdits } from '@/lib/catalog/catalogEdits';

/**
 * Story 6.2.21 (#524): downloads the catalog rows corrected in the app as JSON. Admins only: the
 * RPC behind fetchCatalogEdits refuses everyone else, which answers 403 here.
 */
export async function GET() {
  const edits = await fetchCatalogEdits(await createClient());
  if (!edits) {
    return Response.json({ error: 'forbidden' }, { status: 403, headers: { 'Cache-Control': 'no-store' } });
  }
  const exportedAt = new Date();
  return new Response(JSON.stringify(buildCatalogEditsFile(edits, exportedAt), null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="${catalogEditsFileName(exportedAt)}"`,
      'Cache-Control': 'no-store',
    },
  });
}
