import type { UserRecording } from "@/lib/actions/rehearsal";

/**
 * Story 6.1.15 / G4.2 (#399), UXD-3: the Record tab lists "My takes", "Shared with me"
 * and "Public takes" apart. A take belongs to me when I own it (a take without ownership
 * info, e.g. one just saved on this device, is mine). A take of someone else is "shared"
 * when it was shared with me (`is_shared`), otherwise it is a public take of another
 * singer. Order is kept in every list.
 */
export function partitionTakes(takes: ReadonlyArray<UserRecording>): {
  mine: UserRecording[];
  shared: UserRecording[];
  public: UserRecording[];
} {
  const mine: UserRecording[] = [];
  const shared: UserRecording[] = [];
  const open: UserRecording[] = [];
  for (const take of takes) {
    if (take.is_owner !== false) mine.push(take);
    else if (take.is_shared) shared.push(take);
    else open.push(take);
  }
  return { mine, shared, public: open };
}

/**
 * Display name of the person who shared a take: the full name, else null (the row then
 * shows the generic shared badge). Never the email: profile reads are not meant for display.
 */
export function sharedByName(
  owner: { full_name?: string | null; email?: string | null } | null | undefined
): string | null {
  return owner?.full_name?.trim() || null;
}
