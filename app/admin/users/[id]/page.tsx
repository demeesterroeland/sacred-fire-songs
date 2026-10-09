import { notFound } from 'next/navigation';
import { getAdminUserDetails } from '@/lib/admin/serverQueries';
import AdminUserDetailView from '@/components/admin/AdminUserDetailView';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminUserDetailPage({ params }: Props) {
  const { id } = await params;
  const userDetails = await getAdminUserDetails(id);

  if (!userDetails) {
    notFound();
  }

  return <AdminUserDetailView user={userDetails} />;
}
