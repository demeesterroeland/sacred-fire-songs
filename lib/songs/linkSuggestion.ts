/**
 * Story 6.2.26 / G1.5 (#598): a member suggests that a song is a version of another song; a gatekeeper or admin
 * links or declines.
 *
 * The rules live in the database (song_link_suggestions + the fn_*_song_link_suggestion functions: SECURITY
 * DEFINER, row-level security). This module holds the pure parts the song page, the server actions, the review
 * page and the tests share: who sees which action, how a note is checked, which message a refusal shows, how a row
 * reads in the list and in the bell. The database stays the authority; these helpers only decide what to show.
 */
import type { TranslationKey } from '@/messages/en';

export const SUGGESTION_NOTE_MAX = 280;
export const MAX_OPEN_SUGGESTIONS = 10;

export type SuggestionStatus = 'open' | 'accepted' | 'declined' | 'withdrawn' | 'superseded';

export const SUGGESTION_STATUSES: readonly SuggestionStatus[] = ['open', 'accepted', 'declined', 'withdrawn', 'superseded'];

type RoleUser = { id?: string | null; role?: string | null } | null | undefined;

/** Roles that review suggestions: they see and decide every suggestion (owner answer 3, Nov 24, 2026). */
export const SUGGESTION_REVIEW_ROLES = ['admin', 'gatekeeper'] as const;

export function isSuggestionReviewer(role: string | null | undefined): boolean {
  return !!role && (SUGGESTION_REVIEW_ROLES as readonly string[]).includes(role);
}

/**
 * Whether the song menu offers "Suggest as a version of…": a signed-in person who is not a reviewer (admins and
 * gatekeepers link or review instead of suggesting), on a public song (public songs only in v1).
 */
export function canSuggestLink(user: RoleUser, song: { isPublic: boolean }): boolean {
  if (!user?.id || !user.role) return false;
  return !isSuggestionReviewer(user.role) && song.isPublic;
}

/** A suggestion as the review page reads it. */
export interface LinkSuggestion {
  id: string;
  source_id: string | null;
  target_id: string | null;
  source_title: string;
  target_title: string;
  suggested_by: string | null;
  suggester_name: string | null;
  note: string | null;
  status: SuggestionStatus;
  decision_note: string | null;
  reviewed_by: string | null;
  reviewer_name: string | null;
  reviewed_at: string | null;
  reopened_at: string | null;
  created_at: string;
}

/** Reviewers decide open suggestions. */
export function canDecideSuggestion(user: RoleUser, suggestion: Pick<LinkSuggestion, 'status'>): boolean {
  return !!user && isSuggestionReviewer(user.role) && suggestion.status === 'open';
}

/** The suggester takes back their own open suggestion. */
export function canWithdrawSuggestion(user: RoleUser, suggestion: Pick<LinkSuggestion, 'status' | 'suggested_by'>): boolean {
  return !!user?.id && suggestion.status === 'open' && suggestion.suggested_by === user.id;
}

/** Admins reopen a declined suggestion (a decline is reversible, a link is not). */
export function canReopenSuggestion(user: RoleUser, suggestion: Pick<LinkSuggestion, 'status'>): boolean {
  return user?.role === 'admin' && suggestion.status === 'declined';
}

export type NoteCheck = { ok: true; value: string | null } | { ok: false; error: 'tooLong' };

/** A note or reason: trimmed, an empty text is no note, at most 280 characters. Shown as plain text everywhere. */
export function normalizeNote(text: string | null | undefined): NoteCheck {
  const value = (text ?? '').trim();
  if (value.length === 0) return { ok: true, value: null };
  if (value.length > SUGGESTION_NOTE_MAX) return { ok: false, error: 'tooLong' };
  return { ok: true, value };
}

/** Why a suggestion action was refused, as the actions return it. */
export type SuggestionError =
  | 'signIn'
  | 'reviewer'
  | 'notReviewer'
  | 'notAdmin'
  | 'notAllowed'
  | 'self'
  | 'alreadyLinked'
  | 'visibility'
  | 'notPublic'
  | 'notFound'
  | 'duplicate'
  | 'tooMany'
  | 'decided'
  | 'notDeclined'
  | 'tooLong'
  | 'invalid'
  | 'failed';

export const SUGGESTION_ERROR_KEYS: Readonly<Record<SuggestionError, TranslationKey>> = {
  signIn: 'suggest.error.signIn',
  reviewer: 'suggest.error.reviewer',
  notReviewer: 'suggest.error.notReviewer',
  notAdmin: 'suggest.error.notAdmin',
  notAllowed: 'suggest.error.notAllowed',
  self: 'suggest.error.self',
  alreadyLinked: 'suggest.error.alreadyLinked',
  visibility: 'suggest.error.visibility',
  notPublic: 'suggest.error.notPublic',
  notFound: 'suggest.error.notFound',
  duplicate: 'suggest.error.duplicate',
  tooMany: 'suggest.error.tooMany',
  decided: 'suggest.error.decided',
  notDeclined: 'suggest.error.notDeclined',
  tooLong: 'suggest.error.tooLong',
  invalid: 'suggest.error.invalid',
  failed: 'suggest.error.failed',
};

/** Maps a database error of the suggestion functions to the refusal shown to the person. */
export function suggestionError(error: { code?: string | null; message?: string | null } | null | undefined): SuggestionError {
  const code = error?.code ?? '';
  const message = error?.message ?? '';
  if (code === '42501') {
    if (/sign in/i.test(message)) return 'signIn';
    if (/yourself/i.test(message)) return 'reviewer';
    if (/only admins/i.test(message)) return 'notAdmin';
    if (/review suggestions/i.test(message)) return 'notReviewer';
    if (/own suggestions/i.test(message)) return 'notAllowed';
    return 'notAllowed';
  }
  if (code === 'P0002') return 'notFound';
  if (code === '23505') return 'duplicate';
  if (code === '22023' || code === '22P02') {
    if (/itself/i.test(message)) return 'self';
    if (/already linked/i.test(message)) return 'alreadyLinked';
    if (/public, or both private/i.test(message)) return 'visibility';
    if (/only public/i.test(message)) return 'notPublic';
    if (/too many/i.test(message)) return 'tooMany';
    if (/already decided/i.test(message)) return 'decided';
    if (/only declined/i.test(message)) return 'notDeclined';
    if (/too long/i.test(message)) return 'tooLong';
    return 'invalid';
  }
  return 'failed';
}

export const SUGGESTION_STATUS_KEYS: Readonly<Record<SuggestionStatus, TranslationKey>> = {
  open: 'suggest.status.open',
  accepted: 'suggest.status.accepted',
  declined: 'suggest.status.declined',
  withdrawn: 'suggest.status.withdrawn',
  superseded: 'suggest.status.superseded',
};

/** Quiet hints under a row of the review list; built only from rows the reader may read. */
export interface SuggestionHints {
  /** The same pair (either direction) was declined before: the date of the last decline. */
  declinedBefore: string | null;
  /** The same source song has other open suggestions: the titles of the other targets. */
  alsoSuggested: string[];
}

const samePair = (a: LinkSuggestion, b: LinkSuggestion) =>
  !!a.source_id &&
  !!a.target_id &&
  ((a.source_id === b.source_id && a.target_id === b.target_id) || (a.source_id === b.target_id && a.target_id === b.source_id));

export function suggestionHints(row: LinkSuggestion, all: readonly LinkSuggestion[]): SuggestionHints {
  let declinedBefore: string | null = null;
  const also: string[] = [];
  for (const other of all) {
    if (other.id === row.id) continue;
    if (other.status === 'declined' && samePair(row, other) && other.reviewed_at) {
      if (!declinedBefore || other.reviewed_at > declinedBefore) declinedBefore = other.reviewed_at;
    }
    if (
      row.status === 'open' &&
      other.status === 'open' &&
      row.source_id &&
      other.source_id === row.source_id &&
      other.target_id !== row.target_id &&
      !also.includes(other.target_title)
    ) {
      also.push(other.target_title);
    }
  }
  // A reopened row says "declined before" about its own last decision.
  if (!declinedBefore && row.status === 'open' && row.reopened_at && row.reviewed_at) declinedBefore = row.reviewed_at;
  return { declinedBefore, alsoSuggested: also };
}

/** The tabs of the review page: reviewers get all three, everyone else only their own list. */
export type SuggestionSegment = 'review' | 'reviewed' | 'mine';

export function suggestionSegments(role: string | null | undefined): SuggestionSegment[] {
  return isSuggestionReviewer(role) ? ['review', 'reviewed', 'mine'] : ['mine'];
}

/** Which rows a segment lists, newest first (the query already returns them in that order). */
export function rowsForSegment(
  segment: SuggestionSegment,
  rows: readonly LinkSuggestion[],
  userId: string | null | undefined
): LinkSuggestion[] {
  switch (segment) {
    case 'review':
      return rows.filter((r) => r.status === 'open');
    case 'reviewed':
      return rows.filter((r) => r.status !== 'open' && r.status !== 'withdrawn');
    case 'mine':
      return rows.filter((r) => !!userId && r.suggested_by === userId);
  }
}

/** The notification types written by the decide functions. */
export type SuggestionNotificationType = 'link_suggestion_accepted' | 'link_suggestion_declined';

export const SUGGESTION_NOTIFICATION_TYPES: readonly SuggestionNotificationType[] = [
  'link_suggestion_accepted',
  'link_suggestion_declined',
];

export function isSuggestionNotification(type: string): type is SuggestionNotificationType {
  return (SUGGESTION_NOTIFICATION_TYPES as readonly string[]).includes(type);
}

/** The snapshot the decide functions put on the notification, so the bell reads in the reader's locale. */
export interface SuggestionNotificationMetadata {
  source_title?: string;
  target_title?: string;
  reviewer_name?: string;
  reason?: string;
}

/** The bell item's translation key and parameters. */
export function suggestionNotificationText(
  type: SuggestionNotificationType,
  metadata: SuggestionNotificationMetadata
): { key: TranslationKey; params: Record<string, string> } {
  const source = metadata.source_title ?? '';
  const target = metadata.target_title ?? '';
  if (type === 'link_suggestion_accepted') return { key: 'notifications.linkSuggestionAccepted', params: { source, target } };
  const reason = (metadata.reason ?? '').trim().replace(/\.+$/, '');
  return reason
    ? { key: 'notifications.linkSuggestionDeclinedReason', params: { source, reason } }
    : { key: 'notifications.linkSuggestionDeclined', params: { source } };
}
