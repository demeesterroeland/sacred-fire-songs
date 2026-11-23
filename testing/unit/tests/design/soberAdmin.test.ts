// Story 6.1.35 (#485), admin: every admin screen uses semantic tokens only.
// Role and status badges are neutral tags whose text says the meaning
// (colour never carries it alone).
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { countPaletteClasses } from '@/lib/design/paletteAudit';

const ROOT = path.resolve(__dirname, '..', '..', '..', '..');

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(tsx|ts)$/.test(entry.name)) out.push(path.relative(ROOT, full));
  }
  return out;
}

const read = (file: string) => fs.readFileSync(path.join(ROOT, file), 'utf8');
const FILES = [...walk(path.join(ROOT, 'app/admin')), ...walk(path.join(ROOT, 'components/admin'))];

describe('sober admin screens (#485)', () => {
  it('covers the admin files', () => {
    expect(FILES).toEqual(
      expect.arrayContaining([
        'components/admin/AdminUserDetailView.tsx',
        'components/admin/AdminUsersTable.tsx',
        'components/admin/AdminHeader.tsx',
        'components/admin/AdminBadges.tsx',
        'components/admin/AccessDeniedNotice.tsx',
        'app/admin/users/[id]/not-found.tsx',
      ])
    );
  });

  it.each(FILES)('%s uses no palette classes', (file) => {
    expect(countPaletteClasses(read(file))).toBe(0);
  });

  it('the activity status badge is grey and always shows its text label', () => {
    const src = read('components/admin/AdminBadges.tsx');
    expect(src).toContain("t(`admin.status.${status}`)");
    const status = src.slice(src.indexOf('STATUS_STYLES'));
    expect(status).not.toMatch(/emerald|amber|red-|green/);
  });

  it('admin tabs are 44 px pills with inverted greys when active', () => {
    for (const file of ['components/admin/AdminHeader.tsx', 'components/admin/AdminUserDetailView.tsx']) {
      const src = read(file);
      expect(src, file).toContain('min-h-tap');
      expect(src, file).toContain('bg-chip-active text-on-chip-active');
    }
  });
});
