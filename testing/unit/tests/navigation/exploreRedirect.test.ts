// #574: /explore was replaced by the bottom bar (UXA-020); old links redirect permanently (308) to /songs.
// Next.js passes the query string through to the destination.
import { describe, expect, it } from 'vitest';
import nextConfig from '@/next.config';

describe('/explore redirect (#574)', () => {
  it('redirects /explore permanently to /songs', async () => {
    const rules = (await nextConfig.redirects?.()) ?? [];
    expect(rules).toContainEqual({ source: '/explore', destination: '/songs', permanent: true });
  });
});
