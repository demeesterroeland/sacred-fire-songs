import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  buildRecordingSharedEmail,
  emailSettingsLink,
  getSmtpConfig,
  notificationLink,
} from '@/lib/notifications/email';

describe('getSmtpConfig', () => {
  it('returns null when SMTP_HOST is not set, so email is skipped', () => {
    expect(getSmtpConfig({})).toBeNull();
  });

  it('reads host, port, credentials and sender from the environment', () => {
    expect(
      getSmtpConfig({
        SMTP_HOST: 'smtp.example.org',
        SMTP_PORT: '465',
        SMTP_USER: 'mailer',
        SMTP_PASS: 'secret',
        SMTP_FROM: 'Sacred Fire Songs <no-reply@example.org>',
      }),
    ).toEqual({
      host: 'smtp.example.org',
      port: 465,
      secure: true,
      auth: { user: 'mailer', pass: 'secret' },
      from: 'Sacred Fire Songs <no-reply@example.org>',
    });
  });

  it('defaults to port 587 without TLS-on-connect and no auth', () => {
    expect(getSmtpConfig({ SMTP_HOST: 'localhost' })).toEqual({
      host: 'localhost',
      port: 587,
      secure: false,
      auth: undefined,
      from: 'Sacred Fire Songs <no-reply@localhost>',
    });
  });
});

describe('notificationLink', () => {
  it('prefers SITE_URL over the request origin', () => {
    expect(notificationLink('comp-1', 'https://songs.example.org/', 'http://localhost:3000')).toBe(
      'https://songs.example.org/songs/comp-1',
    );
  });

  it('falls back to the request origin', () => {
    expect(notificationLink('comp-1', undefined, 'http://localhost:3373')).toBe(
      'http://localhost:3373/songs/comp-1',
    );
  });
});

describe('emailSettingsLink', () => {
  it('opens the Preferences tab of the account settings', () => {
    expect(emailSettingsLink('https://songs.example.org/', 'http://localhost:3000')).toBe(
      'https://songs.example.org/account/settings?tab=preferences',
    );
  });

  it('falls back to the request origin', () => {
    expect(emailSettingsLink(undefined, 'http://localhost:3373')).toBe(
      'http://localhost:3373/account/settings?tab=preferences',
    );
  });
});

describe('buildRecordingSharedEmail', () => {
  const input = {
    actorName: 'Maria',
    songTitle: 'Danza del Cielo',
    recordingName: 'Take 2',
    recipientName: 'Ana',
    link: 'https://songs.example.org/songs/comp-1',
    settingsLink: 'https://songs.example.org/account/settings?tab=preferences',
  };

  it('names the sender and song in the subject', () => {
    const mail = buildRecordingSharedEmail(input, 'en');
    expect(mail.subject).toContain('Maria');
    expect(mail.subject).toContain('Danza del Cielo');
  });

  it('includes the deep link in text and html bodies', () => {
    const mail = buildRecordingSharedEmail(input, 'en');
    expect(mail.text).toContain(input.link);
    expect(mail.html).toContain(`href="${input.link}"`);
  });

  it('links to the email notification settings in text and html bodies', () => {
    const mail = buildRecordingSharedEmail(input, 'en');
    expect(mail.text).toContain(`Manage email notifications: ${input.settingsLink}`);
    expect(mail.html).toContain(`href="${input.settingsLink}"`);
  });

  it('escapes user-controlled names in the html body', () => {
    const mail = buildRecordingSharedEmail({ ...input, actorName: '<script>x</script>' }, 'en');
    expect(mail.html).not.toContain('<script>');
    expect(mail.html).toContain('&lt;script&gt;');
  });

  it('is localized', () => {
    const en = buildRecordingSharedEmail(input, 'en');
    const nl = buildRecordingSharedEmail(input, 'nl');
    expect(nl.subject).not.toBe(en.subject);
  });
});

// ─── Server action ────────────────────────────────────────────────────────────

const mockRpc = vi.fn();
const mockSendMail = vi.fn();
let afterCallbacks: Array<() => Promise<void> | void> = [];

vi.mock('next/server', () => ({
  after: (cb: () => Promise<void> | void) => {
    afterCallbacks.push(cb);
  },
}));
vi.mock('next/headers', () => ({
  headers: async () => new Headers({ host: 'localhost:3373', 'x-forwarded-proto': 'http' }),
  cookies: async () => ({ get: () => undefined }),
}));
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ rpc: mockRpc }),
}));
vi.mock('@/lib/notifications/mailer', () => ({
  sendMail: (...args: unknown[]) => mockSendMail(...args),
}));

describe('sendRecordingShareEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    afterCallbacks = [];
  });

  async function runAfter() {
    for (const cb of afterCallbacks) await cb();
  }

  it('sends one email when the owner claims an un-emailed share', async () => {
    const { sendRecordingShareEmail } = await import('@/lib/actions/notifications');
    mockRpc.mockResolvedValue({
      data: [{
        recipient_email: 'ana@example.org',
        recipient_name: 'Ana',
        actor_name: 'Maria',
        song_title: 'Danza del Cielo',
        recording_name: 'Take 2',
        composition_id: 'comp-1',
      }],
      error: null,
    });
    mockSendMail.mockResolvedValue(undefined);

    await sendRecordingShareEmail('rec-1', 'user-2');
    await runAfter();

    expect(mockRpc).toHaveBeenCalledWith('claim_recording_share_email', {
      p_recording_id: 'rec-1',
      p_recipient_id: 'user-2',
    });
    expect(mockSendMail).toHaveBeenCalledTimes(1);
    const mail = mockSendMail.mock.calls[0][0];
    expect(mail.to).toBe('ana@example.org');
    expect(mail.text).toContain('http://localhost:3373/recordings/rec-1');
    expect(mail.text).toContain('http://localhost:3373/account/settings?tab=preferences');
  });

  it('sends nothing when the claim returns no row (not owner, already sent or opted out)', async () => {
    const { sendRecordingShareEmail } = await import('@/lib/actions/notifications');
    mockRpc.mockResolvedValue({ data: [], error: null });

    await sendRecordingShareEmail('rec-1', 'user-2');
    await runAfter();

    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it('swallows SMTP failures so the share is never affected', async () => {
    const { sendRecordingShareEmail } = await import('@/lib/actions/notifications');
    mockRpc.mockResolvedValue({
      data: [{ recipient_email: 'a@b.c', recipient_name: null, actor_name: 'M', song_title: 'S', recording_name: 'T', composition_id: 'c' }],
      error: null,
    });
    mockSendMail.mockRejectedValue(new Error('smtp down'));
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(sendRecordingShareEmail('rec-1', 'user-2')).resolves.toBeUndefined();
    await expect(runAfter()).resolves.toBeUndefined();
    expect(err).toHaveBeenCalled();
    err.mockRestore();
  });
});

// ─── Settings deep link ───────────────────────────────────────────────────────

describe('parseSettingsTab', () => {
  it('opens the tab named in ?tab=', async () => {
    const { parseSettingsTab } = await import('@/components/account/settings/AccountSettings');
    expect(parseSettingsTab('preferences')).toBe('preferences');
    expect(parseSettingsTab(['account', 'privacy'])).toBe('account');
  });

  it('falls back to Profile for missing or unknown values', async () => {
    const { parseSettingsTab } = await import('@/components/account/settings/AccountSettings');
    expect(parseSettingsTab(undefined)).toBe('profile');
    expect(parseSettingsTab('admin')).toBe('profile');
  });
});
