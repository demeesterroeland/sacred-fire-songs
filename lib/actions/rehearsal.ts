import { createClient } from "@/lib/supabase/client";

export interface UserProfileSummary {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role?: string;
  is_musician?: boolean;
}

export interface RecordingShareInfo {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
}

export interface UserRecording {
  id: string;
  user_id: string;
  song_version_id: string;
  recording_name: string;
  storage_path: string;
  position?: number;
  file_size_bytes?: number;
  duration_seconds?: number;
  is_public?: boolean;
  singer_consent_confirmed?: boolean;
  singer_profile_id?: string | null;
  singer_name?: string | null;
  singer_email?: string | null;
  created_at: string;
  audioUrl?: string; // Resolved temporary signed URL or public URL
  is_owner?: boolean;
  is_shared?: boolean;
  can_download?: boolean;
  can_share?: boolean;
  singer_profile?: UserProfileSummary | null;
  shared_with?: RecordingShareInfo[];
}

// 1. Fetch user recordings for a specific song version (own, shared, and public)
export async function getUserRecordings(songVersionId: string): Promise<UserRecording[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  console.log(`[rehearsal] Fetching recordings for songVersionId=${songVersionId}, userId=${user?.id ?? "guest"}`);

  let query = supabase
    .from("user_recordings")
    .select("*")
    .eq("song_version_id", songVersionId);

  // If not logged in, only fetch public recordings
  if (!user) {
    query = query.eq("is_public", true);
  }

  const { data, error } = await query
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[rehearsal] DB ERROR: Failed to fetch user_recordings:", error);
    return [];
  }

  const rawRecordings = (data || []) as UserRecording[];
  if (rawRecordings.length === 0) {
    return [];
  }

  // Collect singer profile IDs to fetch in batch
  const singerProfileIds = Array.from(
    new Set(rawRecordings.map((r) => r.singer_profile_id).filter((id): id is string => !!id))
  );

  let singerProfilesMap = new Map<string, UserProfileSummary>();
  if (singerProfileIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, full_name, avatar_url, role")
      .in("id", singerProfileIds);

    if (profiles) {
      singerProfilesMap = new Map(
        profiles.map((p) => [
          p.id,
          {
            id: p.id,
            email: p.email,
            full_name: p.full_name,
            avatar_url: p.avatar_url,
            role: p.role,
            is_musician: p.role === "musician" || p.role === "expert",
          },
        ])
      );
    }
  }

  // For recordings owned by current user, fetch their shares
  const ownedRecordingIds = user
    ? rawRecordings.filter((r) => r.user_id === user.id).map((r) => r.id)
    : [];

  const sharesMap = new Map<string, RecordingShareInfo[]>();
  if (ownedRecordingIds.length > 0) {
    const { data: shares } = await supabase
      .from("recording_shares")
      .select("id, recording_id, shared_with_user_id, profiles:shared_with_user_id(id, email, full_name)")
      .in("recording_id", ownedRecordingIds);

    if (shares) {
      for (const s of shares) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const prof = (s as any).profiles;
        const list = sharesMap.get(s.recording_id) || [];
        list.push({
          id: s.id,
          user_id: s.shared_with_user_id,
          email: prof?.email || "",
          full_name: prof?.full_name || null,
        });
        sharesMap.set(s.recording_id, list);
      }
    }
  }

  // Create temporary signed URLs for each recording since the rehearsals bucket is private
  const recordingsWithUrls = await Promise.all(
    rawRecordings.map(async (rec) => {
      const isOwner = user ? rec.user_id === user.id : false;
      const isShared = user ? rec.user_id !== user.id && !rec.is_public : false;
      // Strict DRM-lite: only the owner can download and only the owner can share
      const canDownload = isOwner;
      const canShare = isOwner;

      const singerProfile = rec.singer_profile_id
        ? singerProfilesMap.get(rec.singer_profile_id) || null
        : null;

      const sharedWith = isOwner ? sharesMap.get(rec.id) || [] : undefined;

      if (!rec.storage_path) {
        return {
          ...rec,
          is_owner: isOwner,
          is_shared: isShared,
          can_download: canDownload,
          can_share: canShare,
          singer_profile: singerProfile,
          shared_with: sharedWith,
        };
      }

      try {
        const { data: signedData, error: signError } = await supabase.storage
          .from("rehearsals")
          .createSignedUrl(rec.storage_path, 3600); // 1 hour expiry

        if (signError) {
          console.error(`[rehearsal] STORAGE SIGN ERROR for id=${rec.id}:`, signError);
          return {
            ...rec,
            is_owner: isOwner,
            is_shared: isShared,
            can_download: canDownload,
            can_share: canShare,
            singer_profile: singerProfile,
            shared_with: sharedWith,
          };
        }

        return {
          ...rec,
          audioUrl: signedData?.signedUrl,
          is_owner: isOwner,
          is_shared: isShared,
          can_download: canDownload,
          can_share: canShare,
          singer_profile: singerProfile,
          shared_with: sharedWith,
        };
      } catch (e) {
        console.error(`[rehearsal] EXCEPTION signing URL for id=${rec.id}:`, e);
        return {
          ...rec,
          is_owner: isOwner,
          is_shared: isShared,
          can_download: canDownload,
          can_share: canShare,
          singer_profile: singerProfile,
          shared_with: sharedWith,
        };
      }
    })
  );

  return recordingsWithUrls;
}

// 2. Upload recording file & insert database metadata
export async function uploadRehearsalRecording(
  songVersionId: string,
  name: string,
  blob: Blob,
  durationSeconds?: number
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
      duration_seconds: durationSeconds || 0,
      is_public: false,
      singer_consent_confirmed: false,
    })
    .select()
    .single();

  if (dbError) {
    console.error("[rehearsal] Error inserting recording metadata:", dbError);
    await supabase.storage.from("rehearsals").remove([storagePath]);
    return { recording: null, error: dbError.message || "Failed to save recording metadata." };
  }

  const { data: signedData } = await supabase.storage
    .from("rehearsals")
    .createSignedUrl(storagePath, 3600);

  return {
    recording: {
      ...(data as UserRecording),
      audioUrl: signedData?.signedUrl,
      is_owner: true,
      is_shared: false,
      can_download: true,
      can_share: true,
    },
    error: null,
  };
}

// 3. Delete recording file & database metadata (owner only)
export async function deleteUserRecording(
  recordingId: string,
  storagePath: string
): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Verify ownership before deleting
  const { data: rec } = await supabase
    .from("user_recordings")
    .select("user_id")
    .eq("id", recordingId)
    .maybeSingle();

  if (!rec || rec.user_id !== user.id) {
    console.error("[rehearsal] Unauthorized: only the owner can delete a recording");
    return false;
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from("rehearsals")
    .remove([storagePath]);

  if (storageError) {
    console.error("[rehearsal] Error deleting audio file from storage:", storageError);
  }

  // Delete from database
  const { error: dbError } = await supabase
    .from("user_recordings")
    .delete()
    .eq("id", recordingId)
    .eq("user_id", user.id);

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

// 5. Rename user recording (owner only)
export async function renameUserRecording(recordingId: string, newName: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("user_recordings")
    .update({ recording_name: newName })
    .eq("id", recordingId)
    .eq("user_id", user.id);

  if (error) {
    console.error("[rehearsal] Error renaming recording:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// 6. Search users for sharing and attribution
export async function searchUsersForSharing(searchTerm: string): Promise<UserProfileSummary[]> {
  const trimmed = searchTerm.trim();
  if (trimmed.length < 2) return [];

  const supabase = createClient();
  const { data, error } = await supabase.rpc("search_users_for_sharing", {
    search_term: trimmed,
  });

  if (error) {
    console.error("[rehearsal] RPC search_users_for_sharing error:", error);
    return [];
  }

  return (data || []) as UserProfileSummary[];
}

// 7. Share recording with a registered user (owner only, DRM-lite: recipient cannot reshare)
export async function shareRecording(
  recordingId: string,
  targetUserId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Strict ownership check: only owner can share
  const { data: rec } = await supabase
    .from("user_recordings")
    .select("user_id")
    .eq("id", recordingId)
    .maybeSingle();

  if (!rec || rec.user_id !== user.id) {
    return { success: false, error: "Only the recording owner can share this recording." };
  }

  if (targetUserId === user.id) {
    return { success: false, error: "Cannot share recording with yourself." };
  }

  const { error } = await supabase
    .from("recording_shares")
    .insert({
      recording_id: recordingId,
      shared_with_user_id: targetUserId,
    });

  if (error) {
    if (error.code === "23505") {
      // Already shared
      return { success: true };
    }
    console.error("[rehearsal] Error sharing recording:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// 8. Revoke share / unshare recording
export async function unshareRecording(
  recordingId: string,
  targetUserId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("recording_shares")
    .delete()
    .eq("recording_id", recordingId)
    .eq("shared_with_user_id", targetUserId);

  if (error) {
    console.error("[rehearsal] Error revoking share:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// 9. Publish recording publicly with singer consent confirmation (owner only)
export async function publishRecording(
  recordingId: string,
  consentConfirmed: boolean
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  if (!consentConfirmed) {
    return {
      success: false,
      error: "Singer consent must be explicitly confirmed before publishing publicly.",
    };
  }

  const { error } = await supabase
    .from("user_recordings")
    .update({
      is_public: true,
      singer_consent_confirmed: true,
    })
    .eq("id", recordingId)
    .eq("user_id", user.id);

  if (error) {
    console.error("[rehearsal] Error publishing recording:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// 10. Unpublish recording back to private (owner only)
export async function unpublishRecording(
  recordingId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("user_recordings")
    .update({
      is_public: false,
    })
    .eq("id", recordingId)
    .eq("user_id", user.id);

  if (error) {
    console.error("[rehearsal] Error unpublishing recording:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// 11. Update singer attribution (owner only)
export async function updateSingerAttribution(
  recordingId: string,
  attribution: {
    singerProfileId?: string | null;
    singerName?: string | null;
    singerEmail?: string | null;
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("user_recordings")
    .update({
      singer_profile_id: attribution.singerProfileId || null,
      singer_name: attribution.singerName?.trim() || null,
      singer_email: attribution.singerEmail?.trim() || null,
    })
    .eq("id", recordingId)
    .eq("user_id", user.id);

  if (error) {
    console.error("[rehearsal] Error updating singer attribution:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// 12. Strict DRM-lite download URL check: only owner may download
export async function getRecordingDownloadUrl(
  recordingId: string
): Promise<{ downloadUrl?: string; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: rec, error } = await supabase
    .from("user_recordings")
    .select("user_id, storage_path, recording_name")
    .eq("id", recordingId)
    .maybeSingle();

  if (error || !rec) {
    return { error: "Recording not found" };
  }

  if (rec.user_id !== user.id) {
    return { error: "Shared recordings cannot be downloaded" };
  }

  const { data: signedData, error: signError } = await supabase.storage
    .from("rehearsals")
    .createSignedUrl(rec.storage_path, 300); // 5 min for download

  if (signError || !signedData?.signedUrl) {
    return { error: "Failed to create download link" };
  }

  return { downloadUrl: signedData.signedUrl };
}

// 13. Fetch public profile for singer
export async function getUserProfile(userId: string): Promise<UserProfileSummary | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url, role")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    email: data.email,
    full_name: data.full_name,
    avatar_url: data.avatar_url,
    role: data.role,
    is_musician: data.role === "musician" || data.role === "expert",
  };
}
