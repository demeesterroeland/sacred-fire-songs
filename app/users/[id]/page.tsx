import { notFound } from "next/navigation";
import { fetchMusicianProfile } from "@/lib/users/serverQueries";
import UserProfileView from "@/components/profile/UserProfileView";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function UserProfilePage({ params }: Props) {
  const { id } = await params;
  const profile = await fetchMusicianProfile(id);

  if (!profile) {
    notFound();
  }

  return <UserProfileView profile={profile} />;
}
