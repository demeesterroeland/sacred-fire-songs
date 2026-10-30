import Link from 'next/link';
import { UserX, ArrowLeft } from 'lucide-react';

import { getServerT } from '@/lib/i18n/server';
export default async function AdminUserNotFound() {
  const t = await getServerT();
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center min-h-[50vh]">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 mb-6 border border-gray-200 dark:border-gray-700">
        <UserX className="w-8 h-8" />
      </div>

      <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
        {t('admin.notFound.title')}
      </h1>

      <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8 text-sm md:text-base">
        {t('admin.notFound.body')}
      </p>

      <Link
        href="/admin/users"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-semibold text-sm transition-all shadow-md active:scale-95"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('admin.notFound.back')}
      </Link>
    </div>
  );
}
