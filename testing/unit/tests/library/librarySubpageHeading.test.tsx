// @vitest-environment jsdom
// Validation 2, item 3 (#407): every Library sub-page (History, Artists, Shared with me) heads its list with the
// same heading: same size, weight and colour, the count between parentheses, and an h2 under the Library tabs' h1.
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { Clock } from 'lucide-react';
import { LibrarySubpageHeading } from '@/components/library/LibrarySubpageHeading';

afterEach(cleanup);

describe('LibrarySubpageHeading', () => {
  it('is an h2 with the title and the count in parentheses', () => {
    render(<LibrarySubpageHeading icon={Clock} title="History" count={4} />);
    const h = screen.getByRole('heading', { level: 2, name: 'History' });
    expect(h.className).toMatch(/text-body/);
    expect(h.className).toMatch(/font-semibold/);
    expect(screen.getByText('(4)')).toBeTruthy();
  });

  it('omits the count when there is none', () => {
    render(<LibrarySubpageHeading icon={Clock} title="History" />);
    expect(screen.queryByText(/\(/)).toBeNull();
  });
});

describe('Library sub-pages', () => {
  const pages = ['app/library/recently-viewed/page.tsx', 'app/library/artists/page.tsx', 'app/library/shared/page.tsx'];
  it.each(pages)('%s uses the shared heading and no hand-made one', (file) => {
    const src = readFileSync(file, 'utf8');
    expect(src).toContain('LibrarySubpageHeading');
    expect(src).not.toMatch(/<h[12][^>]*className/);
  });

  it('the Artists heading is translated, not hard-coded English', () => {
    const src = readFileSync('app/library/artists/page.tsx', 'utf8');
    expect(src).toContain("t('artists.pageTitle')");
  });
});
