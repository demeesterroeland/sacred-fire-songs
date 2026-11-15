import { describe, it, expect, vi } from 'vitest';
import { tWithLocale, type Locale } from '@/lib/i18n';

vi.mock('@/components/common/feedback/NotFound', () => ({ default: () => null }));

const LOCALES: Locale[] = ['en', 'nl', 'es', 'fr', 'it', 'pt', 'qu', 'ru'];

describe('recording permalink not-found page', () => {
  it('uses recording-specific copy, not the "Song Not Found" default', async () => {
    const { default: RecordingNotFound } = await import('@/app/recordings/[id]/not-found');
    const element = RecordingNotFound() as { props: { titleKey: string; descriptionKey: string } };
    expect(element.props.titleKey).toBe('feedback.notFound.recording.title');
    expect(element.props.descriptionKey).toBe('feedback.notFound.recording.description');
  });

  it.each(LOCALES)('is translated in %s', (locale) => {
    const title = tWithLocale(locale, 'feedback.notFound.recording.title');
    const description = tWithLocale(locale, 'feedback.notFound.recording.description');
    expect(title).not.toBe('feedback.notFound.recording.title');
    expect(description).not.toBe('feedback.notFound.recording.description');
    expect(title).not.toBe(tWithLocale(locale, 'feedback.notFound.title'));
  });

  it('does not reveal whether the recording exists', () => {
    const description = tWithLocale('en', 'feedback.notFound.recording.description');
    expect(description.toLowerCase()).toMatch(/not available|doesn.t exist|no longer/);
  });
});
