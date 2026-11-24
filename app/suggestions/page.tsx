import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { signInHref } from '@/lib/auth/guestGate';
import { getLinkSuggestions } from '@/lib/suggestions/serverQueries';
import { SuggestionsView } from '@/components/suggestions/SuggestionsView';

/**
 * Story 6.2.26 / G1.5 (#598): link suggestions. Gatekeepers and admins review every open suggestion here; everyone
 * else sees their own suggestions and can withdraw an open one. Row-level security decides which rows come back.
 */
export default async function SuggestionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(signInHref('/suggestions'));

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  const rows = await getLinkSuggestions();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-4">
      <SuggestionsView rows={rows} user={{ id: user.id, role: profile?.role ?? 'member' }} />
    </div>
  );
}
