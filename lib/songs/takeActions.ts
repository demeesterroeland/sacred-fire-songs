import type { UserRecording } from "@/lib/actions/rehearsal";

/**
 * Story 6.1.17 / G4.4 (#401): the actions of a take, grouped for the bottom action
 * sheet. Groups are separated by a divider; Delete is always alone in the last
 * group, so it is never next to Share. Takes of other people are listen only
 * (DRM-lite): their only action is Play.
 */
export type TakeActionId =
  | "play"
  | "rename"
  | "download"
  | "share"
  | "singer"
  | "visibility"
  | "copyLink"
  | "delete";

export interface TakeActionGroup {
  key: "listen" | "share" | "danger";
  actions: TakeActionId[];
}

type OwnershipInput = Pick<UserRecording, "is_owner">;

/** A take without ownership info (just saved on this device) is mine, as in partitionTakes. */
const isMine = (take: OwnershipInput) => take.is_owner !== false;

export function takeActionGroups(take: OwnershipInput, opts: { canCopyLink?: boolean } = {}): TakeActionGroup[] {
  if (!isMine(take)) return [{ key: "listen", actions: ["play"] }];
  return [
    { key: "listen", actions: ["play", "rename", "download"] },
    {
      key: "share",
      actions: ["share", "singer", "visibility", ...(opts.canCopyLink ? (["copyLink"] as const) : [])],
    },
    { key: "danger", actions: ["delete"] },
  ];
}

/** Only my own takes open the sheet; the play button on the row is the whole menu of the others. */
export function takeHasActionSheet(take: OwnershipInput): boolean {
  return isMine(take);
}
