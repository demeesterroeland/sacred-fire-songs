import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import GuestGate from "@/components/common/GuestGate";
import { fetchMusicianProfile } from "@/lib/users/serverQueries";
import UserProfileView from "@/components/profile/UserProfileView";
import { isUuid } from "@/lib/validation/uuid";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function UserProfilePage({ params }: Props) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return (
      <div className="p-4">
        <GuestGate feature="profile" next={`/users/${encodeURIComponent(id)}`} />
      </div>
    );
  }

  const profile = await fetchMusicianProfile(id);

  if (!profile) {
    notFound();
  }

  return <UserProfileView profile={profile} />;
}
