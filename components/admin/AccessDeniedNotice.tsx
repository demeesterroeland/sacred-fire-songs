'use client';

import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

import { useLocale } from '@/context/LocaleContext';
import { Button } from '@/components/ui/button';
export default function AccessDeniedNotice() {
  const { t } = useLocale();
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center min-h-[60vh]">
      <div className="size-16 rounded-panel bg-surface flex items-center justify-center text-danger mb-6 border border-danger">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <h1 className="text-title font-bold text-fg mb-2">
        {t('admin.denied.title')}
      </h1>

      <p className="text-fg-muted max-w-md mb-8 text-body">
        {t('admin.denied.body')}
      </p>

      <Button asChild>
        <Link href="/">
          <ArrowLeft />
          {t('admin.denied.back')}
        </Link>
      </Button>
    </div>
  );
}
