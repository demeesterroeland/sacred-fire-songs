'use client';

import { Loader2 } from 'lucide-react';
import { Toaster } from 'sonner';
import { useUserPreferences } from '@/context/UserPreferencesContext';

export default function ThemedToaster() {
  const { resolvedTheme } = useUserPreferences();

  return (
    <Toaster
      position="top-center"
      theme={resolvedTheme}
      icons={{
        success: null,
        error: null,
        loading: <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: "bg-white dark:bg-[#141b24] border border-emerald-500/30 p-4 rounded-xl text-emerald-600 dark:text-emerald-400 text-[15px] font-medium text-center shadow-lg dark:shadow-inner min-w-[300px] flex justify-center items-center mb-2",
          title: "text-emerald-600 dark:text-emerald-400",
          success: "border-emerald-500/30",
          error: "bg-red-50 dark:bg-[#1a1010] border-red-500/30 text-red-600 dark:text-red-400",
        }
      }}
    />
  );
}
