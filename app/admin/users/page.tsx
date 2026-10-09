import { getAdminUsersList } from '@/lib/admin/serverQueries';
import AdminUsersTable from '@/components/admin/AdminUsersTable';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const users = await getAdminUsersList();

  return (
    <div className="space-y-6">
      <AdminUsersTable initialUsers={users || []} />
    </div>
  );
}
