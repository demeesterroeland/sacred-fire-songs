import { type AuthUser } from '@/hooks/useAuth';
import { LogOut, ChevronDown, Heart, FileText, ListMusic, Sun, Moon, Monitor, SlidersHorizontal, Clock, Globe, ShieldCheck, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUserPreferences, type ThemePreference } from '@/context/UserPreferencesContext';
import { useLocale } from '@/context/LocaleContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { SignInLink } from '@/components/auth/SignInLink';
import { MY_DRAFTS_HREF } from '@/lib/songs/draftsLink';
import { useNotificationsQuery } from '@/hooks/useNotificationsQuery';
import { unreadSharedCount } from '@/lib/notifications/sharedWithMe';

import { usePathname, useRouter } from 'next/navigation';

interface UserProfileProps {
  initialUser?: AuthUser | null;
  onLogout?: () => void;
  layout?: 'sidebar' | 'mobile' | 'header';
  showText?: boolean;
}

const themeOptions: { value: ThemePreference; icon: typeof Sun }[] = [
  { value: 'light', icon: Sun },
  { value: 'dark', icon: Moon },
  { value: 'system', icon: Monitor },
];

function ThemeToggle() {
  const { t } = useLocale();
  const { preferences, setPreference } = useUserPreferences();

  return (
    <div className="flex items-center bg-surface-2 rounded-panel p-0.5 gap-0.5">
      {themeOptions.map(({ value, icon: Icon }) => {
        const active = preferences.theme === value;
        return (
          <button
            key={value}
            onClick={() => setPreference('theme', value)}
            aria-label={t(`theme.${value}`)}
            aria-pressed={active}
            className={`size-tap inline-flex items-center justify-center rounded-control transition-colors ${active ? 'bg-chip-active text-on-chip-active' : 'text-fg-muted hover:text-fg'}`}
          >
            <Icon className="w-4 h-4" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}

/**
 * "Shared with me" entry (Story 6.1.19 / G4.6, UXD-3). The unread count is said in words
 * ("3 new"); the badge stays on the bell only, so one thing never has two badges. It reads
 * the same query as the bell, so both drop together.
 */
function SharedWithMeMenuItem({ userId, onNavigate }: { userId: string; onNavigate: () => void }) {
  const { t } = useLocale();
  const { data } = useNotificationsQuery(userId);
  const unread = unreadSharedCount(data);
  return (
    <Link
      href="/library/shared"
      onClick={onNavigate}
      data-testid="user-menu-shared-with-me"
      className={MENU_ITEM}
    >
      <Users className="w-4 h-4" aria-hidden="true" />
      <span className="flex-1 text-sm font-medium">{t('sharedWithMe.title')}</span>
      {unread > 0 && (
        <span data-testid="user-menu-shared-unread" className="rounded-pill bg-chip px-2 py-0.5 text-caption font-semibold text-on-chip">
          {t('sharedWithMe.unreadCount', { count: unread })}
        </span>
      )}
    </Link>
  );
}

/** One style for every item in the user menu: grey text, a grey hover, no colour per item. */
const MENU_ITEM =
  'flex min-h-tap items-center gap-3 rounded-control p-2 text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg';

/** Initials or photo on a neutral grey disc. */
const AVATAR = 'rounded-full bg-chip-active text-on-chip-active flex items-center justify-center overflow-hidden shrink-0 relative';

export const UserProfile = ({ onLogout, layout = 'header', showText = true, initialUser }: UserProfileProps) => {
  const { user, loading, logout } = useAuth(initialUser);
  const { t } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      // The language list is portalled to <body>; picking from it must not close the menu.
      if (target.closest?.('[data-language-listbox]')) return;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return <div className="w-9 h-9 rounded-full bg-surface-2 animate-pulse" />;
  }

  if (!user) {
    return (
      <SignInLink href={`/auth/login?next=${encodeURIComponent(pathname)}`}>
        {t('auth.login.submit')}
      </SignInLink>
    );
  }

  const userDisplayName = user.full_name || user.email?.split('@')[0] || t('userMenu.defaultName');
  const userInitials = userDisplayName.substring(0, 1).toUpperCase();
  // Translated role; a guest has no account menu, so it never shows a role.
  const userRole = user.role === 'guest' ? '' : t(`admin.role.${user.role}`);

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('userMenu.trigger')}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="flex min-h-tap items-center gap-2 px-2 rounded-control text-fg-muted hover:bg-surface-2 hover:text-fg transition-colors active:scale-95"
      >
        <div className={`w-[26px] h-[26px] text-caption font-semibold ${AVATAR}`}>
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
          <span className="hidden sm:block text-xs font-bold text-fg truncate max-w-[100px]">
            {userDisplayName}
          </span>
        )}
        <ChevronDown aria-hidden="true" className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div data-testid="user-menu" className="absolute top-full right-0 mt-2 w-72 bg-surface text-fg border border-line rounded-panel shadow-sheet overflow-hidden z-50 animate-in fade-in zoom-in duration-200 origin-top-right">
          {/* Account Title */}
          <div className="flex justify-between items-center px-4 py-1 border-b border-line">
            <span className="text-sm font-semibold text-fg">{t('userMenu.account')}</span>
            <ThemeToggle />
          </div>

          <div className="p-3">
            {/* User Identity Card */}
            <div className="bg-surface-2 p-3 rounded-control mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 text-sm font-bold ${AVATAR}`}>
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
                  <p className="text-sm font-bold text-fg truncate">{userDisplayName}</p>
                  <p className="text-xs text-fg-muted font-medium">{userRole}</p>
                </div>
              </div>

            </div>

            {/* Menu Items */}
            <div className="space-y-1">
              {user.role === 'admin' && (
                <Link
                  href="/admin/users"
                  onClick={() => setIsOpen(false)}
                  className={MENU_ITEM}
                >
                  <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                  <span className="text-sm font-medium">{t('userMenu.adminPortal')}</span>
                </Link>
              )}
              <Link href="/account/settings" onClick={() => setIsOpen(false)} className={MENU_ITEM}>
                <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
                <span className="text-sm font-medium">{t('userMenu.settings')}</span>
              </Link>
              <Link href="/songs?favorites=true" onClick={() => setIsOpen(false)} className={MENU_ITEM}>
                <Heart className="w-4 h-4" aria-hidden="true" />
                <span className="text-sm font-medium">{t('userMenu.favorites')}</span>
              </Link>
              <Link href={MY_DRAFTS_HREF} onClick={() => setIsOpen(false)} className={MENU_ITEM}>
                <FileText className="w-4 h-4" aria-hidden="true" />
                <span className="text-sm font-medium">{t('userMenu.drafts')}</span>
              </Link>
              <Link href="/library/playlists" onClick={() => setIsOpen(false)} className={MENU_ITEM}>
                <ListMusic className="w-4 h-4" aria-hidden="true" />
                <span className="text-sm font-medium">{t('userMenu.playlists')}</span>
              </Link>
              <SharedWithMeMenuItem userId={user.id} onNavigate={() => setIsOpen(false)} />
              <Link href="/library/recently-viewed" onClick={() => setIsOpen(false)} className={MENU_ITEM}>
                <Clock className="w-4 h-4" aria-hidden="true" />
                <span className="text-sm font-medium">{t('userMenu.recentlyViewed')}</span>
              </Link>
            </div>

            {/* Language switcher */}
            <div className="h-px bg-line my-2" />
            <div className="flex items-center gap-2 px-2 py-1.5">
              <Globe className="w-4 h-4 text-fg-muted" aria-hidden="true" />
              <span className="text-sm font-medium text-fg-muted flex-1">{t('userMenu.language')}</span>
              <LanguageSwitcher />
            </div>

            <div className="h-px bg-line my-2" />

            {/* Sign Out */}
            <button
              onClick={async () => {
                setIsOpen(false);
                await logout();
                onLogout?.();
                router.refresh();
              }}
              className={`w-full ${MENU_ITEM}`}
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              <span className="text-sm font-medium">{t('userMenu.signOut')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
