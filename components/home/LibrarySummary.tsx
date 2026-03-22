import Link from 'next/link';
import { Heart, PenLine, Music, Sparkles } from 'lucide-react';

interface LibrarySummaryProps {
  favoritesCount: number;
  draftsCount: number;
  mySongsCount: number;
  newSongsCount: number;
}

const stats = [
  {
    key: 'favorites',
    icon: Heart,
    label: 'Favorites',
    href: '/songs?favorites=true',
    color: 'text-rose-400',
    iconFill: 'fill-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20 hover:border-rose-500/40',
  },
  {
    key: 'drafts',
    icon: PenLine,
    label: 'Drafts',
    href: '/songs?status=draft',
    color: 'text-amber-400',
    iconFill: '',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20 hover:border-amber-500/40',
  },
  {
    key: 'mySongs',
    icon: Music,
    label: 'My Songs',
    href: '/songs?mine=true',
    color: 'text-violet-400',
    iconFill: '',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20 hover:border-violet-500/40',
  },
  {
    key: 'newSongs',
    icon: Sparkles,
    label: 'New songs',
    href: '/songs?new=true',
    color: 'text-emerald-400',
    iconFill: '',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20 hover:border-emerald-500/40',
  },
] as const;

const countMap: Record<string, keyof LibrarySummaryProps> = {
  favorites: 'favoritesCount',
  drafts: 'draftsCount',
  mySongs: 'mySongsCount',
  newSongs: 'newSongsCount',
};

export default function LibrarySummary(props: LibrarySummaryProps) {
  return (
    <div>
      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Your Library</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const count = props[countMap[stat.key]];
          return (
            <Link
              key={stat.key}
              href={stat.href}
              className={`flex items-center gap-3 p-3 md:p-4 rounded-2xl border transition-all hover:-translate-y-0.5 group ${stat.border} bg-gray-900/30`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${stat.bg}`}>
                <Icon className={`w-4 h-4 ${stat.color} ${stat.iconFill}`} />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold text-white leading-tight">{count}</p>
                <p className="text-[10px] md:text-xs text-gray-500 truncate">{stat.label}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
