import { createClient } from "@/lib/supabase/client";

export interface UserRecording {
  id: string;
  user_id: string;
  song_version_id: string;
  recording_name: string;
  storage_path: string;
  position?: number;
  file_size_bytes?: number;
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

  console.log(`[rehearsal] Fetching recordings for songVersionId=${songVersionId}, userId=${user.id}`);

  const { data, error } = await supabase
    .from("user_recordings")
    .select("*")
    .eq("song_version_id", songVersionId)
    .eq("user_id", user.id)
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[rehearsal] DB ERROR: Failed to fetch user_recordings:", error);
    return [];
  }

  const recordings = data as UserRecording[];
  console.log(`[rehearsal] Found ${recordings.length} recording metadata row(s) in DB for songVersionId=${songVersionId}`);

  if (recordings.length === 0) {
    console.log(`[rehearsal] INFO: No user_recordings metadata rows exist in DB for songVersionId=${songVersionId}`);
    return [];
  }

  // Create temporary signed URLs for each recording since the rehearsals bucket is private
  const recordingsWithUrls = await Promise.all(
    recordings.map(async (rec) => {
      if (!rec.storage_path) {
        console.warn(`[rehearsal] MISSING METADATA: Recording id=${rec.id} has no storage_path in DB`);
        return rec;
      }

      const fileExt = rec.storage_path.split(".").pop()?.toLowerCase();
      console.log(`[rehearsal] Processing recording id=${rec.id}, name="${rec.recording_name}", ext=.${fileExt}, path=${rec.storage_path}`);

      try {
        const { data: signedData, error: signError } = await supabase.storage
          .from("rehearsals")
          .createSignedUrl(rec.storage_path, 3600); // 1 hour expiry

        if (signError) {
          console.error(`[rehearsal] STORAGE SIGN ERROR for id=${rec.id}, path=${rec.storage_path}:`, signError);
          return rec;
        }

        console.log(`[rehearsal] SIGN SUCCESS: Signed URL generated for id=${rec.id}:`, signedData?.signedUrl);

        return {
          ...rec,
          audioUrl: signedData?.signedUrl,
        };
      } catch (e) {
        console.error(`[rehearsal] EXCEPTION signing URL for id=${rec.id}, path=${rec.storage_path}:`, e);
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
): Promise<{ recording: UserRecording | null; error: string | null }> {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("[rehearsal] User not logged in, cannot upload recording");
    return { recording: null, error: "User not logged in. Please sign in again." };
  }

  const fileId = typeof window !== 'undefined' && window.crypto?.randomUUID 
    ? window.crypto.randomUUID() 
    : Math.random().toString(36).substring(2) + Date.now().toString(36);

  let rawExt = "webm";
  if (blob.type) {
    const mainType = blob.type.split(";")[0];
    const subType = mainType.split("/")[1];
    if (subType) {
      if (subType === "mpeg" || subType === "mp3") rawExt = "mp3";
      else if (subType === "x-m4a" || subType === "mp4" || subType === "m4a") rawExt = "m4a";
      else if (subType === "opus") rawExt = "opus";
      else if (subType === "flac" || subType === "x-flac") rawExt = "flac";
      else if (subType === "ogg" || subType === "vorbis") rawExt = "ogg";
      else rawExt = subType;
    }
  }
  // Check if blob is a File instance with name extension
  if ('name' in blob && (blob as File).name.includes('.')) {
    const nameExt = (blob as File).name.split('.').pop()?.toLowerCase();
    if (nameExt && ['mp3', 'm4a', 'opus', 'flac', 'wav', 'ogg', 'webm', 'aac'].includes(nameExt)) {
      rawExt = nameExt;
    }
  }
  const storagePath = `${user.id}/${songVersionId}/${fileId}.${rawExt}`;

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
    return { recording: null, error: uploadError.message || "Failed to upload file to storage bucket." };
  }

  // Insert database metadata row
  const { data, error: dbError } = await supabase
    .from("user_recordings")
    .insert({
      user_id: user.id,
      song_version_id: songVersionId,
      recording_name: name || `Rehearsal - ${new Date().toLocaleDateString()}`,
      storage_path: storagePath,
      file_size_bytes: blob.size || 0,
    })
    .select()
    .single();

  if (dbError) {
    console.error("[rehearsal] Error inserting recording metadata:", dbError);
    // Attempt cleanup of orphaned storage file
    await supabase.storage.from("rehearsals").remove([storagePath]);
    return { recording: null, error: dbError.message || "Failed to save recording metadata." };
  }

  // Generate signed URL for return value
  const { data: signedData } = await supabase.storage
    .from("rehearsals")
    .createSignedUrl(storagePath, 3600);

  return {
    recording: {
      ...(data as UserRecording),
      audioUrl: signedData?.signedUrl,
    },
    error: null,
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

// 4. Reorder user recordings
export async function reorderUserRecordings(
  orderedRecordingIds: string[]
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  const updates = orderedRecordingIds.map((id, index) =>
    supabase
      .from("user_recordings")
      .update({ position: index })
      .eq("id", id)
      .eq("user_id", user.id)
  );

  const results = await Promise.all(updates);
  const hasError = results.some((r) => r.error);

  if (hasError) {
    console.error("[rehearsal] Error updating recording positions:", results.find((r) => r.error)?.error);
    return { success: false, error: "Failed to update order" };
  }

  return { success: true };
}
