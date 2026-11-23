import type { UserRecording } from "@/lib/actions/rehearsal";

/**
 * Story 6.1.16 / G4.3 (#400): the status of a take row as words, not tooltips.
 * `public` and `shared` (with the number of people) describe who can hear the take,
 * `verified` and `pending` describe its singer.
 */
export type TakeStatusKind = "public" | "shared" | "verified" | "pending";

export interface TakeStatusPill {
  kind: TakeStatusKind;
  /** Number of people a take is shared with (kind `shared` only). */
  count?: number;
}

export type TakeStatusInput = Pick<
  UserRecording,
  "is_owner" | "is_public" | "is_shared" | "shared_with" | "singer_profile_id" | "singer_profile" | "singer_name"
>;

/**
 * Pills in display order: visibility first, then singer. Private is the default and gets
 * no pill. Only the owner knows who a take is shared with, so a take of someone else
 * never shows a share count (its row already says "Shared by …").
 * "Pending invite" is the existing meaning of an attribution to a singer who has no
 * linked profile yet (UXA-018); it is the owner's to-do, so only the owner sees it.
 */
export function takeStatusPills(rec: TakeStatusInput): TakeStatusPill[] {
  const pills: TakeStatusPill[] = [];
  if (rec.is_public) pills.push({ kind: "public" });
  const shareCount = rec.is_owner === false ? 0 : (rec.shared_with?.length ?? 0);
  if (shareCount > 0) pills.push({ kind: "shared", count: shareCount });
  if (rec.singer_profile_id && rec.singer_profile) {
    if (rec.singer_profile.is_musician) pills.push({ kind: "verified" });
  } else if (rec.singer_name && rec.is_owner !== false) {
    pills.push({ kind: "pending" });
  }
  return pills;
}
