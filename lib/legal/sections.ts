import type { TranslationKey } from '@/messages/en';

/**
 * The text of the Terms and Privacy pages (validation 2, item 12): sections of a heading and paragraphs, all
 * translated (`legal.<page>.<section>.title`, `.p1` …). The wording is a DRAFT until the owner approves it; it only
 * says what the app does (see docs/ux-research/ux-v2-decisions.md, UXA-068), and states no retention period,
 * legal basis, liability or governing law.
 */
export interface LegalSection {
  id: string;
  titleKey: TranslationKey;
  paragraphKeys: TranslationKey[];
}

function section(page: 'terms' | 'privacy', id: string, paragraphs: number): LegalSection {
  return {
    id,
    titleKey: `legal.${page}.${id}.title` as TranslationKey,
    paragraphKeys: Array.from({ length: paragraphs }, (_, i) => `legal.${page}.${id}.p${i + 1}` as TranslationKey),
  };
}

export const TERMS_SECTIONS: LegalSection[] = [
  section('terms', 'about', 3),
  section('terms', 'accounts', 3),
  section('terms', 'content', 4),
  section('terms', 'visibility', 4),
  section('terms', 'behaviour', 2),
  section('terms', 'changes', 2),
];

export const PRIVACY_SECTIONS: LegalSection[] = [
  section('privacy', 'stored', 5),
  section('privacy', 'visible', 4),
  section('privacy', 'browser', 4),
  section('privacy', 'third', 4),
  section('privacy', 'choices', 2),
];

export const LEGAL_KEYS: TranslationKey[] = [
  'legal.draft',
  'legal.operator.title',
  'legal.operator.nameLine',
  'legal.operator.contactLine',
  'legal.operator.none',
  'legal.operator.noEmail',
  'legal.account.title',
  ...[...TERMS_SECTIONS, ...PRIVACY_SECTIONS].flatMap((s) => [s.titleKey, ...s.paragraphKeys]),
];
