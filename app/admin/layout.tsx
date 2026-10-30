import { redirect } from 'next/navigation';
import { checkAdminAccess } from '@/lib/admin/serverQueries';
import AdminHeader from '@/components/admin/AdminHeader';
import AccessDeniedNotice from '@/components/admin/AccessDeniedNotice';

export const dynamic = 'force-dynamic';

// Same scroll container as app/library/layout.tsx: the app shell has a fixed
// height, so each section scrolls inside its own <main>.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authorized, user } = await checkAdminAccess();

  if (!user) {
    redirect('/auth/login?next=/admin/users');
  }

  return (
    <main className="flex-1 min-w-0 overflow-y-auto bg-white dark:bg-gray-950 p-4 md:p-8 lg:p-12">
      <div className="max-w-5xl mx-auto w-full min-w-0">
        {authorized ? (
          <>
            <AdminHeader />
            {children}
          </>
        ) : (
          <AccessDeniedNotice />
        )}
      </div>
    </main>
  );
}
