import { getCatalogEdits } from '@/lib/catalog/serverQueries';
import CatalogEditsList from '@/components/admin/CatalogEditsList';

export const dynamic = 'force-dynamic';

/** Story 6.2.21 (#524): catalog rows corrected in the app, to take over into the source catalog. */
export default async function AdminCatalogEditsPage() {
  const edits = await getCatalogEdits();
  return <CatalogEditsList edits={edits ?? { songs: [], versions: [] }} />;
}
