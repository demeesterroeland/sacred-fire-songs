/**
 * Message keys that name a song's visibility (`compositions.is_public`), #564.
 *
 * A song that is not public is "Private" in every locale, never "Draft". `songForm.guestDraft.*` (an unsaved
 * local copy of the form) and `legal.draft` (the legal text is not approved yet) are not about visibility.
 */
import type { TranslationKey } from '@/messages/en';

export const SONG_VISIBILITY_KEYS = [
  'songs.filter.drafts.title',
  'songs.emptyDrafts.title',
  'songs.emptyDrafts.hint',
  'song.status.draft',
  'songForm.status.draft',
  'songForm.saveAsDraft',
  'search.status.public',
  'search.status.drafts',
  'search.status.draft',
  'playlists.countDraft',
  'legal.terms.visibility.p1',
  'legal.privacy.stored.p2',
  'legal.privacy.visible.p3',
] as const satisfies readonly TranslationKey[];

/** The word for "draft" in each locale's messages (Runasimi borrows the Spanish word). */
export const DRAFT_WORD = /draft|concept|borrador|bozz|черновик|brouillon|rascunho/i;
