// #604: what the inline "New playlist" field does for each trigger (L2).
import { describe, expect, it } from 'vitest';
import { inlineCreateIntent } from '@/lib/playlists/inlineCreate';

describe('inlineCreateIntent (#604)', () => {
  it('creates only on Enter or Create with a name', () => {
    expect(inlineCreateIntent('enter', 'Fire Circle')).toBe('create');
    expect(inlineCreateIntent('create', ' Fire Circle ')).toBe('create');
  });
  it('never creates on blur or Escape', () => {
    expect(inlineCreateIntent('blur', 'Fire Circle')).toBe('cancel');
    expect(inlineCreateIntent('escape', 'Fire Circle')).toBe('cancel');
  });
  it('an empty name cancels instead of creating', () => {
    expect(inlineCreateIntent('enter', '   ')).toBe('cancel');
    expect(inlineCreateIntent('create', '')).toBe('cancel');
  });
});
