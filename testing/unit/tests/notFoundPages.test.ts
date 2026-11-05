import { describe, it, expect, vi } from 'vitest';
import { tWithLocale, type Locale } from '@/lib/i18n';

vi.mock('@/components/common/feedback/NotFound', () => ({ default: () => null }));

const LOCALES: Locale[] = ['en', 'nl', 'es', 'fr', 'it', 'pt', 'qu', 'ru'];

describe('generic 404 page (story 6.1.22)', () => {
  it('root not-found renders the component with its generic defaults', async () => {
    const { default: NotFoundPage } = await import('@/app/not-found');
    const element = NotFoundPage() as { props: Record<string, unknown> };
    expect(element.props.titleKey).toBeUndefined();
    expect(element.props.descriptionKey).toBeUndefined();
  });

  it('song not-found keeps the song-specific copy', async () => {
    const { default: SongNotFound } = await import('@/app/songs/[id]/not-found');
    const element = SongNotFound() as { props: { titleKey: string; descriptionKey: string; icon: string } };
    expect(element.props.titleKey).toBe('feedback.notFound.title');
    expect(element.props.descriptionKey).toBe('feedback.notFound.description');
    expect(element.props.icon).toBe('music'); // plain string: server pages cannot pass components
    expect(tWithLocale('en', 'feedback.notFound.title')).toBe('Song Not Found');
  });

  it('English copy is plain: "Page not found" with a "Go home" action', () => {
    expect(tWithLocale('en', 'feedback.notFound.page.title')).toBe('Page not found');
    expect(tWithLocale('en', 'feedback.notFound.page.home')).toBe('Go home');
  });

  it.each(LOCALES)('is translated in %s and differs from the song and recording copy', (locale) => {
    for (const key of ['title', 'description', 'home'] as const) {
      const full = `feedback.notFound.page.${key}` as const;
      expect(tWithLocale(locale, full)).not.toBe(full);
    }
    const title = tWithLocale(locale, 'feedback.notFound.page.title');
    expect(title).not.toBe(tWithLocale(locale, 'feedback.notFound.title'));
    expect(title).not.toBe(tWithLocale(locale, 'feedback.notFound.recording.title'));
    if (locale !== 'en') expect(title).not.toBe(tWithLocale('en', 'feedback.notFound.page.title'));
  });
});
