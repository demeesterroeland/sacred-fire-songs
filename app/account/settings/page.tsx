import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AccountSettings, { parseSettingsTab } from "@/components/account/settings/AccountSettings";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const initialTab = parseSettingsTab((await searchParams).tab);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const next = initialTab === "profile" ? "/account/settings" : `/account/settings?tab=${initialTab}`;
    redirect(`/auth/login?next=${encodeURIComponent(next)}`);
  }

  // Fetch profile data
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="flex-1 overflow-y-auto">
      <AccountSettings user={user} profile={profile} initialTab={initialTab} />
    </div>
  );
}
