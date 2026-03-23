'use client';

import { useAuth } from '@/hooks/useAuth';

export default function MockRoleSwitcher() {
  const { mockRole, switchMockRole } = useAuth();

  return (
    <div className="space-y-2">
      <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">
        Mock UI Role
      </h3>
      <select
        className="w-full bg-gray-200 dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300 rounded px-2 py-1.5 border border-gray-300 dark:border-gray-700 focus:outline-none focus:border-red-500 transition-colors"
        value={mockRole || ''}
        onChange={(e) => switchMockRole(e.target.value || null)}
      >
        <option value="">-- Use Real Auth --</option>
        <option value="guest">Guest</option>
        <option value="mock-member">Mock Member</option>
        <option value="mock-musician">Mock Musician</option>
        <option value="mock-admin">Mock Admin</option>
      </select>
      <p className="text-[9px] text-gray-600 px-1 leading-tight">
        Simulates UI states only. Does not affect RLS.
      </p>
    </div>
  );
}
