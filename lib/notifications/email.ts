/**
 * Pure helpers for transactional notification emails (Story 4.6.6).
 * No I/O here: the SMTP transport lives in `mailer.ts`, dispatch in
 * `lib/actions/notifications.ts`.
 */
import { tWithLocale, type Locale } from '@/lib/i18n';
import { recordingPermalink } from '@/lib/songs/recordingLink';

export interface SmtpConfig {
  host: string;
  port: number;
  /** TLS on connect (port 465). Other ports upgrade with STARTTLS when offered. */
  secure: boolean;
  auth?: { user: string; pass: string };
  from: string;
}

type Env = Record<string, string | undefined>;

/** SMTP settings from the environment, or null when email is not configured. */
export function getSmtpConfig(env: Env = process.env): SmtpConfig | null {
  const host = env.SMTP_HOST?.trim();
  if (!host) return null;
  const port = Number.parseInt(env.SMTP_PORT ?? '', 10) || 587;
  return {
    host,
    port,
    secure: env.SMTP_SECURE ? env.SMTP_SECURE === 'true' : port === 465,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS ?? '' } : undefined,
    from: env.SMTP_FROM?.trim() || `Sacred Fire Songs <no-reply@${host}>`,
  };
}

function siteBase(siteUrl: string | undefined, requestOrigin: string): string {
  return (siteUrl?.trim() || requestOrigin).replace(/\/+$/, '');
}

/** Absolute link to a recording's permalink, or to the song; SITE_URL wins over the request origin. */
export function notificationLink(
  compositionId: string,
  siteUrl: string | undefined,
  requestOrigin: string,
  recordingId?: string | null,
): string {
  const path = recordingId ? recordingPermalink(recordingId) : `/songs/${compositionId}`;
  return `${siteBase(siteUrl, requestOrigin)}${path}`;
}

/** Absolute link to the Preferences tab, where email notifications are turned off. */
export function emailSettingsLink(siteUrl: string | undefined, requestOrigin: string): string {
  return `${siteBase(siteUrl, requestOrigin)}/account/settings?tab=preferences`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export interface RecordingSharedEmailInput {
  actorName: string;
  songTitle: string;
  recordingName: string;
  recipientName: string | null;
  link: string;
  /** Link to the email notification preference (see `emailSettingsLink`). */
  settingsLink: string;
}

export interface EmailContent {
  subject: string;
  text: string;
  html: string;
}

export function buildRecordingSharedEmail(input: RecordingSharedEmailInput, locale: Locale): EmailContent {
  const params = { actor: input.actorName, song: input.songTitle, recording: input.recordingName };
  const subject = tWithLocale(locale, 'email.recordingShared.subject', params);
  const greeting = input.recipientName
    ? tWithLocale(locale, 'email.recordingShared.greeting', { name: input.recipientName })
    : tWithLocale(locale, 'email.recordingShared.greetingAnonymous');
  const body = tWithLocale(locale, 'email.recordingShared.body', params);
  const cta = tWithLocale(locale, 'email.recordingShared.cta');
  const footer = tWithLocale(locale, 'email.recordingShared.footer');
  const manage = tWithLocale(locale, 'email.recordingShared.manage');

  const text = [greeting, '', body, '', `${cta}: ${input.link}`, '', '—', footer, `${manage}: ${input.settingsLink}`].join('\n');

  const html = `<!doctype html>
<html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#1f2937;line-height:1.5;max-width:560px;margin:0 auto;padding:24px">
<p>${escapeHtml(greeting)}</p>
<p>${escapeHtml(body)}</p>
<p><a href="${escapeHtml(input.link)}" style="display:inline-block;background:#f45d1a;color:#fff;text-decoration:none;font-weight:600;padding:10px 18px;border-radius:10px">${escapeHtml(cta)}</a></p>
<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
<p style="font-size:12px;color:#6b7280">${escapeHtml(footer)}<br><a href="${escapeHtml(input.settingsLink)}" style="color:#6b7280">${escapeHtml(manage)}</a></p>
</body></html>`;

  return { subject, text, html };
}
