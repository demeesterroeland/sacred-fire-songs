'use client';

import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, Music, Users } from 'lucide-react';

export default function QuickLogin() {
  const { quickLogin, loading } = useAuth();
  const queryClient = useQueryClient();

  const testUsers = [
    { email: 'roel.de.meester+admin@gmail.com', label: 'Admin', role: 'admin', icon: ShieldCheck, color: 'text-red-500' },
    { email: 'roel.de.meester+musician@gmail.com', label: 'Musician', role: 'musician', icon: Music, color: 'text-orange-500' },
    { email: 'roel.de.meester+member@gmail.com', label: 'Member', role: 'member', icon: Users, color: 'text-blue-500' },
  ];

  return (
    <div className="space-y-2 mt-4">
      <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">
        Real Quick Login
      </h3>
      <div className="grid grid-cols-1 gap-1">
        {testUsers.map((u) => (
          <button
            key={u.email}
            disabled={loading}
            onClick={async () => { await quickLogin(u.email); queryClient.clear(); }}
            className="flex items-center gap-2 px-2 py-1.5 text-[11px] text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-all group border border-transparent hover:border-gray-700"
          >
            <u.icon className={`w-3 h-3 ${u.color}`} />
            <span className="flex-1 text-left">{u.label}</span>
            <span className="text-[9px] text-gray-600 group-hover:text-gray-500 font-mono">
              Login
            </span>
          </button>
        ))}
      </div>
      <p className="text-[9px] text-gray-600 px-1 leading-tight">
        Instantly signs in as a real user. Best for testing RLS.
      </p>
    </div>
  );
}
