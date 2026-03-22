import { LogOut, ChevronDown, Settings, User, Heart, FileText, ListMusic, Sun, Moon, SlidersHorizontal, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import QuickLogin from '@/components/dev/QuickLogin';

import { usePathname, useRouter } from 'next/navigation';

interface UserProfileProps {
  onLogout?: () => void;
  layout?: 'sidebar' | 'mobile' | 'header';
  showText?: boolean;
}

export const UserProfile = ({ onLogout, layout = 'header', showText = true }: UserProfileProps) => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return (
      <Link
        href={`/auth/login?next=${encodeURIComponent(pathname)}`}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-red-900/20 active:scale-95 whitespace-nowrap"
      >
        Sign In
      </Link>
    );
  }

  const userDisplayName = user.full_name || user.email?.split('@')[0] || 'Member';
  const userInitials = userDisplayName.substring(0, 1).toUpperCase();
  const userRole = user.role.charAt(0).toUpperCase() + user.role.slice(1);

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-gray-800/80 hover:bg-gray-700 transition-colors active:scale-95 group border border-transparent hover:border-gray-600"
      >
        <div className="w-[26px] h-[26px] rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white shadow-inner overflow-hidden shrink-0 relative">
          {user.avatar_url ? (
            <Image 
              src={user.avatar_url} 
              alt={userDisplayName} 
              fill 
              className="object-cover" 
              sizes="26px"
            />
          ) : (
            userInitials
          )}
        </div>
        {showText && (
          <span className="hidden sm:block text-xs font-bold text-gray-300 truncate max-w-[100px]">
            {userDisplayName}
          </span>
        )}
        <ChevronDown className={`w-4 h-4 text-gray-500 group-hover:text-gray-300 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in duration-200 origin-top-right">
          {/* Account Title */}
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-800">
            <span className="text-sm font-black text-white uppercase tracking-wider">Account</span>
            <div className="flex items-center gap-1 opacity-50">
              <Sun className="w-3.5 h-3.5" />
              <div className="w-7 h-4 bg-gray-800 rounded-full relative">
                <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-gray-600 rounded-full" />
              </div>
              <Moon className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="p-3">
            {/* User Identity Card */}
            <div className="relative group/card bg-gray-800/50 p-3 rounded-xl mb-3 border border-gray-700/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-900/40 flex items-center justify-center text-sm font-bold text-red-400 ring-1 ring-red-500/20 shadow-inner relative overflow-hidden">
                  {user.avatar_url ? (
                    <Image 
                      src={user.avatar_url} 
                      alt={userDisplayName} 
                      fill 
                      className="object-cover" 
                      sizes="40px"
                    />
                  ) : (
                    userInitials
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{userDisplayName}</p>
                  <p className="text-xs text-blue-400/80 font-medium">{userRole}</p>
                </div>
              </div>

              {/* Hover Cogwheel */}
              <Link
                href="/account/settings"
                className="absolute top-2 right-2 p-1.5 bg-gray-800/80 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 opacity-0 group-hover/card:opacity-100 transition-all border border-gray-700/50"
              >
                <Settings className="w-4 h-4" />
              </Link>
            </div>

            {/* Menu Items */}
            <div className="space-y-1">
              <Link href="/account/settings" className="flex items-center gap-3 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors group">
                <SlidersHorizontal className="w-4 h-4 group-hover:text-blue-400" />
                <span className="text-sm font-medium">Account Settings</span>
              </Link>
              <Link href="/songs?favorites=true" className="flex items-center gap-3 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors group">
                <Heart className="w-4 h-4 group-hover:text-red-400" />
                <span className="text-sm font-medium">My Favorites</span>
              </Link>
              <Link href="/songs?status=draft" className="flex items-center gap-3 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors group">
                <FileText className="w-4 h-4 group-hover:text-orange-400" />
                <span className="text-sm font-medium">My Drafts</span>
              </Link>
              <Link href="/library/playlists" className="flex items-center gap-3 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors group">
                <ListMusic className="w-4 h-4 group-hover:text-purple-400" />
                <span className="text-sm font-medium">My Playlists</span>
              </Link>
              <Link href="/library/recently-viewed" className="flex items-center gap-3 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors group">
                <Clock className="w-4 h-4 group-hover:text-amber-400" />
                <span className="text-sm font-medium">Recently Viewed</span>
              </Link>
            </div>

            <div className="h-px bg-gray-800 my-2" />

            {/* Sign Out */}
            <button
              onClick={async () => {
                await logout();
                onLogout?.();
                router.refresh();
              }}
              className="w-full flex items-center gap-3 p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors group"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>

            {/* Local Dev Info */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 pt-4 border-t border-gray-800/80">
                <QuickLogin />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
