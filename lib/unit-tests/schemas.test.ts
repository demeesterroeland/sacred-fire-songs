import { describe, it, expect } from 'vitest';
import { uuid, playlistTitle, playlistDescription } from '../validation/schemas';

describe('uuid schema', () => {
  it('accepts a valid UUID', () => {
    expect(() => uuid.parse('550e8400-e29b-41d4-a716-446655440000')).not.toThrow();
  });

  it('rejects a non-UUID string', () => {
    expect(() => uuid.parse('not-a-uuid')).toThrow();
  });

  it('rejects an empty string', () => {
    expect(() => uuid.parse('')).toThrow();
  });
});

describe('playlistTitle schema', () => {
  it('accepts a normal title', () => {
    expect(playlistTitle.parse('My Ceremony Songs')).toBe('My Ceremony Songs');
  });

  it('trims whitespace', () => {
    expect(playlistTitle.parse('  Padded  ')).toBe('Padded');
  });

  it('rejects an empty string', () => {
    expect(() => playlistTitle.parse('')).toThrow();
  });

  it('rejects whitespace-only', () => {
    expect(() => playlistTitle.parse('   ')).toThrow();
  });

  it('rejects strings over 200 chars', () => {
    expect(() => playlistTitle.parse('x'.repeat(201))).toThrow();
  });
});

describe('playlistDescription schema', () => {
  it('accepts a normal description', () => {
    expect(playlistDescription.parse('Closing songs')).toBe('Closing songs');
  });

  it('accepts undefined', () => {
    expect(playlistDescription.parse(undefined)).toBeUndefined();
  });

  it('rejects strings over 2000 chars', () => {
    expect(() => playlistDescription.parse('x'.repeat(2001))).toThrow();
  });
});
