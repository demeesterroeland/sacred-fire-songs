import { z } from 'zod';

/** Validates a UUID string */
export const uuid = z.string().uuid();

/** Validates a playlist title: trimmed, 1-200 chars */
export const playlistTitle = z.string().trim().min(1, 'Title required').max(200, 'Title too long');

/** Validates an optional playlist description: max 2000 chars */
export const playlistDescription = z.string().max(2000, 'Description too long').optional();

/**
 * Wraps a Zod parse in a try/catch, returning { error: string } on failure.
 * Use in server actions to avoid throwing.
 */
export function safeParse<T>(schema: z.ZodType<T>, value: unknown): { data: T } | { error: string } {
  const result = schema.safeParse(value);
  if (result.success) return { data: result.data };
  return { error: result.error.issues.map(i => i.message).join(', ') };
}
