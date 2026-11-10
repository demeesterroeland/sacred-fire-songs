import { createClient } from "@/lib/supabase/server";
import GuestGate from "@/components/common/GuestGate";
import AccountSettings from "@/components/account/settings/AccountSettings";
import { parseSettingsTab } from "@/lib/account/settingsTabs";

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
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <GuestGate feature="settings" next={next} />
      </div>
    );
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
