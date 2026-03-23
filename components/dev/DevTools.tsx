'use client';

import QuickLogin from './QuickLogin';

export default function DevTools() {
  // Only render in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-200/80 dark:border-gray-800/80 bg-gray-50/20 dark:bg-gray-950/20 rounded-t-xl px-2 pb-2">
      <h2 className="text-[10px] font-black text-red-500/80 uppercase tracking-[0.2em] mb-4 text-center">
        Developer Tools
      </h2>
      <div className="space-y-4">
        <QuickLogin />
      </div>
    </div>
  );
}
