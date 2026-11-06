import { createClient } from "@/lib/supabase/server";
import { getLibrarySummary, getRecentlyAddedSongs } from "@/lib/songs/serverQueries";
import CategoryGrid from "@/components/home/CategoryGrid";
import LibrarySummary from "@/components/home/LibrarySummary";
import UpdateLastSeen from "@/components/home/UpdateLastSeen";
import HomeWelcome from "@/components/home/HomeWelcome";
import HomeSearch from "@/components/home/HomeSearch";
import RecentlyAdded from "@/components/home/RecentlyAdded";
import { getServerT } from '@/lib/i18n/server';

export default async function Home() {
  const t = await getServerT();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const summary = user ? await getLibrarySummary(user.id) : null;
  // First-time visitors (Story 6.1.28 / G6.3): welcome line, search field and "Recently added".
  const recentlyAdded = user ? [] : await getRecentlyAddedSongs();

  return (
    <main className="flex-1 min-h-0 bg-bg overflow-y-auto">
      <div className="p-4 md:p-8 lg:p-10 space-y-10 max-w-7xl mx-auto">
        {/* Update last_seen_at after render so "new songs" count uses the old value */}
        {user && <UpdateLastSeen />}

        {/* Guests: what this is, a way in, and something to open */}
        {!user && (
          <div className="max-w-2xl space-y-6">
            <HomeWelcome />
            <HomeSearch />
            <RecentlyAdded songs={recentlyAdded} />
          </div>
        )}

        {/* Library Summary — logged-in users only, shown first */}
        {summary && (
          <section>
            <LibrarySummary
              favoritesCount={summary.favoritesCount}
              draftsCount={summary.draftsCount}
              mySongsCount={summary.mySongsCount}
              newSongsCount={summary.newSongsCount}
            />
          </section>
        )}

        {/* Explore by Category */}
        <section>
          <p className="text-meta font-semibold text-fg-muted mb-4">{t('explore.categories.heading')}</p>
          <CategoryGrid />
        </section>
      </div>
    </main>
  );
}
