'use client';

import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function AccessDeniedNotice() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center min-h-[60vh]">
      <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950/50 flex items-center justify-center text-red-600 dark:text-red-400 mb-6 border border-red-200 dark:border-red-900/50 shadow-lg shadow-red-500/10">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
        Access Denied
      </h1>

      <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8 text-sm md:text-base">
        You do not have administrative privileges to view this area. Only administrators can access configuration, user details, and system administration.
      </p>

      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-semibold text-sm transition-all shadow-md active:scale-95"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Home
      </Link>
    </div>
  );
}
