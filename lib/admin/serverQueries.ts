import { createClient } from '@/lib/supabase/server';
import type { AdminUserDetails, AdminUserSummary } from './types';
import {
  fetchAdminAccess,
  fetchAdminUserDetails,
  fetchAdminUsersList,
  type AdminAccessResult,
} from './userQueries';

/**
 * Validates that the current session belongs to an administrator.
 */
export async function checkAdminAccess(): Promise<AdminAccessResult> {
  return fetchAdminAccess(await createClient());
}

/**
 * Retrieves the full list of registered users with their contribution metrics.
 * Strictly requires admin authorization (returns null otherwise).
 */
export async function getAdminUsersList(): Promise<AdminUserSummary[] | null> {
  return fetchAdminUsersList(await createClient());
}

/**
 * Retrieves details and contribution lists for a single user.
 * Strictly requires admin authorization (returns null otherwise).
 */
export async function getAdminUserDetails(userId: string): Promise<AdminUserDetails | null> {
  return fetchAdminUserDetails(await createClient(), userId);
}
