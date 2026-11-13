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

  // Story 6.1.36 (#488): members see the guest layout ("Recently added" + categories) with their
  // personal counts on top; guests get the welcome line and search field there instead.
  const [summary, recentlyAdded] = await Promise.all([
    user ? getLibrarySummary(user.id) : Promise.resolve(null),
    getRecentlyAddedSongs(),
  ]);

  return (
    <div className="flex-1 min-h-0 bg-bg overflow-y-auto">
      {/* Same outer padding as /songs, so the two-column grids sit at the same x on both pages (#488). */}
      <div className="p-4 md:p-8 space-y-10 max-w-7xl mx-auto">
        {/* Update last_seen_at after render (admin user overview) */}
        {user && <UpdateLastSeen />}

        <div className="space-y-6">
          {summary ? (
            <LibrarySummary {...summary} />
          ) : (
            /* Guests: what this is and a way in */
            <div className="max-w-2xl space-y-6">
              <HomeWelcome />
              <HomeSearch />
            </div>
          )}
          <RecentlyAdded songs={recentlyAdded} />
        </div>

        {/* Explore by Category */}
        <section>
          <p className="text-meta font-semibold text-fg-muted mb-4">{t('explore.categories.heading')}</p>
          <CategoryGrid />
        </section>
      </div>
    </div>
  );
}
