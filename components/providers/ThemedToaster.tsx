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
        loading: <Loader2 className="w-4 h-4 animate-spin text-fg-muted" />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          // Neutral surface for every toast; an error says so in its words and gets the danger text colour.
          toast: "bg-surface border border-line p-4 rounded-panel text-fg text-[15px] font-medium text-center shadow-sheet min-w-[300px] flex justify-center items-center gap-2 mb-2",
          error: "border-danger! text-danger!",
        }
      }}
    />
  );
}
