import { notFound } from 'next/navigation';
import { getAdminUserDetails } from '@/lib/admin/serverQueries';
import AdminUserDetailView from '@/components/admin/AdminUserDetailView';
import { isUuid } from '@/lib/validation/uuid';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminUserDetailPage({ params }: Props) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const userDetails = await getAdminUserDetails(id);

  if (!userDetails) {
    notFound();
  }

  return <AdminUserDetailView user={userDetails} />;
}
