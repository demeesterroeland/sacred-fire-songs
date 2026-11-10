'use server';

import { after } from 'next/server';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { DEFAULT_LOCALE } from '@/lib/i18n';
import { buildRecordingSharedEmail, emailSettingsLink, notificationLink } from '@/lib/notifications/email';
import { sendMail } from '@/lib/notifications/mailer';

interface ShareEmailClaim {
  recipient_email: string;
  recipient_name: string | null;
  /** The sharer's profile name; null when the profile has no name. */
  actor_name: string | null;
  song_title: string;
  recording_name: string;
  composition_id: string;
}

async function requestOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}

/**
 * Emails the recipient of a new recording share (Story 4.6.6).
 *
 * `claim_recording_share_email` only returns a row for the recording owner, for
 * a share that has not been emailed yet, and when the recipient has email
 * notifications on — so this action is idempotent and cannot be used to spam.
 * Sending runs after the response; failures are logged, never thrown.
 */
export async function sendRecordingShareEmail(recordingId: string, recipientId: string): Promise<void> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('claim_recording_share_email', {
      p_recording_id: recordingId,
      p_recipient_id: recipientId,
    });
    if (error) throw error;
    const claim = (data as ShareEmailClaim[] | null)?.[0];
    if (!claim) return;

    // The request Host is caller-controlled, so production links must come from
    // SITE_URL; the request origin is only trusted in development.
    const siteUrl = process.env.SITE_URL;
    if (!siteUrl && process.env.NODE_ENV === 'production') {
      console.warn('[notifications] SITE_URL is not set; skipping share email.');
      return;
    }
    const origin = await requestOrigin();
    const link = notificationLink(claim.composition_id, siteUrl, origin, recordingId);
    // Profiles do not store a language yet, so emails go out in the default locale.
    const content = buildRecordingSharedEmail(
      {
        actorName: claim.actor_name,
        songTitle: claim.song_title,
        recordingName: claim.recording_name,
        recipientName: claim.recipient_name,
        link,
        settingsLink: emailSettingsLink(siteUrl, origin),
      },
      DEFAULT_LOCALE,
    );

    after(async () => {
      try {
        await sendMail({ to: claim.recipient_email, ...content });
      } catch (e) {
        console.error('[notifications] Share email failed:', e);
      }
    });
  } catch (e) {
    console.error('[notifications] Share email dispatch failed:', e);
  }
}
