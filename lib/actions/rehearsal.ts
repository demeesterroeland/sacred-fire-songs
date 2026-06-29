import { createClient } from "@/lib/supabase/client";

export interface UserRecording {
  id: string;
  user_id: string;
  song_version_id: string;
  recording_name: string;
  storage_path: string;
  created_at: string;
  audioUrl?: string; // Resolved temporary signed URL or public URL
}

// 1. Fetch user recordings for a specific song version
export async function getUserRecordings(songVersionId: string): Promise<UserRecording[]> {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.warn("[rehearsal] User not logged in, cannot fetch recordings");
    return [];
  }

  const { data, error } = await supabase
    .from("user_recordings")
    .select("*")
    .eq("song_version_id", songVersionId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[rehearsal] Error fetching user recordings:", error);
    return [];
  }

  const recordings = data as UserRecording[];

  // Create temporary signed URLs for each recording since the rehearsals bucket is private
  const recordingsWithUrls = await Promise.all(
    recordings.map(async (rec) => {
      try {
        const { data: signedData, error: signError } = await supabase.storage
          .from("rehearsals")
          .createSignedUrl(rec.storage_path, 3600); // 1 hour expiry

        if (signError) {
          console.error(`[rehearsal] Error signing URL for ${rec.storage_path}:`, signError);
          return rec;
        }

        return {
          ...rec,
          audioUrl: signedData.signedUrl,
        };
      } catch (e) {
        console.error(`[rehearsal] Exception signing URL for ${rec.storage_path}:`, e);
        return rec;
      }
    })
  );

  return recordingsWithUrls;
}

// 2. Upload recording file & insert database metadata
export async function uploadRehearsalRecording(
  songVersionId: string,
  name: string,
  blob: Blob
): Promise<UserRecording | null> {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("[rehearsal] User not logged in, cannot upload recording");
    return null;
  }

  const fileId = typeof window !== 'undefined' && window.crypto?.randomUUID 
    ? window.crypto.randomUUID() 
    : Math.random().toString(36).substring(2) + Date.now().toString(36);

  const fileExt = blob.type.split(";")[0].split("/")[1] || "webm";
  const storagePath = `${user.id}/${songVersionId}/${fileId}.${fileExt}`;

  // Upload blob to Supabase storage rehearsals bucket
  const { error: uploadError } = await supabase.storage
    .from("rehearsals")
    .upload(storagePath, blob, {
      contentType: blob.type || "audio/webm",
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    console.error("[rehearsal] Error uploading audio file to storage:", uploadError);
    return null;
  }

  // Insert database metadata row
  const { data, error: dbError } = await supabase
    .from("user_recordings")
    .insert({
      user_id: user.id,
      song_version_id: songVersionId,
      recording_name: name || `Rehearsal - ${new Date().toLocaleDateString()}`,
      storage_path: storagePath,
    })
    .select()
    .single();

  if (dbError) {
    console.error("[rehearsal] Error inserting recording metadata:", dbError);
    // Attempt cleanup of orphaned storage file
    await supabase.storage.from("rehearsals").remove([storagePath]);
    return null;
  }

  // Generate signed URL for return value
  const { data: signedData } = await supabase.storage
    .from("rehearsals")
    .createSignedUrl(storagePath, 3600);

  return {
    ...(data as UserRecording),
    audioUrl: signedData?.signedUrl,
  };
}

// 3. Delete recording file & database metadata
export async function deleteUserRecording(
  recordingId: string,
  storagePath: string
): Promise<boolean> {
  const supabase = createClient();

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from("rehearsals")
    .remove([storagePath]);

  if (storageError) {
    console.error("[rehearsal] Error deleting audio file from storage:", storageError);
    // Continue anyway to delete metadata, or return false? Better delete metadata if storage is missing.
  }

  // Delete from database
  const { error: dbError } = await supabase
    .from("user_recordings")
    .delete()
    .eq("id", recordingId);

  if (dbError) {
    console.error("[rehearsal] Error deleting recording metadata:", dbError);
    return false;
  }

  return true;
}
