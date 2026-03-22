import { createClient } from "@/lib/supabase/server";
import { getLibrarySummary } from "@/lib/songs/serverQueries";
import CategoryGrid from "@/components/home/CategoryGrid";
import LibrarySummary from "@/components/home/LibrarySummary";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const summary = user ? await getLibrarySummary(user.id) : null;

  return (
    <main className="flex-1 min-h-0 bg-gray-950 overflow-y-auto">
      <div className="p-4 md:p-8 lg:p-10 space-y-10 max-w-7xl mx-auto">
        {/* Explore by Category */}
        <section>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Explore by Category</p>
          <CategoryGrid />
        </section>

        {/* Library Summary — logged-in users only */}
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
      </div>
    </main>
  );
}
