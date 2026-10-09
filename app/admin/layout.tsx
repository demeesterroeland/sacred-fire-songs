import { redirect } from 'next/navigation';
import { checkAdminAccess } from '@/lib/admin/serverQueries';
import AdminHeader from '@/components/admin/AdminHeader';
import AccessDeniedNotice from '@/components/admin/AccessDeniedNotice';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authorized, user } = await checkAdminAccess();

  if (!user) {
    redirect('/auth/login?next=/admin/users');
  }

  if (!authorized) {
    return (
      <div className="flex-1 bg-gray-50/50 dark:bg-gray-950 flex flex-col min-h-screen">
        <AccessDeniedNotice />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50/50 dark:bg-gray-950 flex flex-col min-h-screen pb-16">
      <AdminHeader />
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-8 py-6">
        {children}
      </div>
    </div>
  );
}
