import Link from 'next/link';
import { UserX, ArrowLeft } from 'lucide-react';

import { getServerT } from '@/lib/i18n/server';
import { Button } from '@/components/ui/button';
export default async function AdminUserNotFound() {
  const t = await getServerT();
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center min-h-[50vh]">
      <div className="size-16 rounded-panel bg-surface flex items-center justify-center text-fg-muted mb-6 border border-line">
        <UserX className="w-8 h-8" />
      </div>

      <h1 className="text-title font-bold text-fg mb-2">
        {t('admin.notFound.title')}
      </h1>

      <p className="text-fg-muted max-w-md mb-8 text-body">
        {t('admin.notFound.body')}
      </p>

      <Button asChild>
        <Link href="/admin/users">
          <ArrowLeft />
          {t('admin.notFound.back')}
        </Link>
      </Button>
    </div>
  );
}
