import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AccountSettings from "@/components/account/settings/AccountSettings";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch profile data
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="flex-1 overflow-y-auto">
      <AccountSettings user={user} profile={profile} />
    </div>
  );
}
