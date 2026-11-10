import { createClient } from "@/lib/supabase/server";

export interface AttributedRecordingSummary {
  id: string;
  recording_name: string;
  song_version_id: string;
  song_id?: string;
  song_title?: string;
  created_at: string;
}

export interface MusicianProfileData {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  is_musician: boolean;
  attributed_recordings: AttributedRecordingSummary[];
}

export async function fetchMusicianProfile(userId: string): Promise<MusicianProfileData | null> {
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    // The public view: name, avatar and musician badge; never the e-mail address.
    .from("public_profiles")
    .select("id, full_name, avatar_url, is_musician")
    .eq("id", userId)
    .maybeSingle();

  if (error || !profile) return null;

  // Fetch recordings attributed to this singer (filtered by RLS)
  const { data: recordings } = await supabase
    .from("user_recordings")
    .select("id, recording_name, song_version_id, created_at, song_versions(composition_id, compositions(title))")
    .eq("singer_profile_id", userId)
    .order("created_at", { ascending: false });

  type DbRecordingRow = {
    id: string;
    recording_name: string;
    song_version_id: string;
    created_at: string;
    song_versions?: {
      composition_id?: string;
      compositions?: {
        title?: string;
      } | null;
    } | null;
  };

  const rawRows = (recordings || []) as unknown as DbRecordingRow[];
  const attributedRecordings: AttributedRecordingSummary[] = rawRows.map((r) => ({
    id: r.id,
    recording_name: r.recording_name,
    song_version_id: r.song_version_id,
    song_id: r.song_versions?.composition_id,
    song_title: r.song_versions?.compositions?.title,
    created_at: r.created_at,
  }));

  return {
    id: profile.id,
    full_name: profile.full_name,
    avatar_url: profile.avatar_url,
    is_musician: !!profile.is_musician,
    attributed_recordings: attributedRecordings,
  };
}
