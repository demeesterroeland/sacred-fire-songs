// Story 6.1.5 / G1.5 (#389): unfinished features are hidden, no "Coming soon" placeholder remains.
import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { FEATURES } from '@/lib/features';
import { parseSettingsTab, visibleSettingsTabs } from '@/lib/account/settingsTabs';
import en from '@/messages/en';

const root = join(__dirname, '../../../..');

function sourceFiles(dir: string): string[] {
  return readdirSync(join(root, dir)).flatMap((name) => {
    const rel = join(dir, name);
    if (statSync(join(root, rel)).isDirectory()) return sourceFiles(rel);
    return /\.(ts|tsx)$/.test(name) ? [rel] : [];
  });
}

describe('feature flags', () => {
  it('keeps every unfinished feature off', () => {
    expect(FEATURES).toEqual({
      albums: false,
      avatarUpload: false,
      privacySettings: false,
      plannedPreferences: false,
      melodyNotation: false,
    });
  });
});

describe('settings tabs', () => {
  it('hides Privacy & Data while privacySettings is off', () => {
    expect(visibleSettingsTabs()).toEqual(['profile', 'account', 'preferences']);
  });

  it('shows Privacy & Data last once privacySettings is on', () => {
    expect(visibleSettingsTabs({ ...FEATURES, privacySettings: true }).at(-1)).toBe('privacy');
  });

  it('opens Profile for a hidden ?tab=privacy, like any unknown tab', () => {
    expect(parseSettingsTab('privacy')).toBe('profile');
    expect(parseSettingsTab(['privacy', 'account'])).toBe('profile');
    expect(parseSettingsTab('privacy', { ...FEATURES, privacySettings: true })).toBe('privacy');
  });
});

describe('no "Coming soon" copy', () => {
  it('has no coming-soon message key in the English catalogue', () => {
    const keys = Object.keys(en).filter((k) => /comingsoon|notactive/i.test(k));
    expect(keys).toEqual([]);
  });

  it('renders no coming-soon key from any component or page', () => {
    const offenders = [...sourceFiles('components'), ...sourceFiles('app')].filter((file) =>
      /comingSoon|privacy\.notActive/.test(readFileSync(join(root, file), 'utf8')),
    );
    expect(offenders).toEqual([]);
  });
});
