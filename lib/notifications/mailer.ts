import nodemailer, { type Transporter } from 'nodemailer';
import { getSmtpConfig } from './email';

export interface OutgoingMail {
  to: string;
  subject: string;
  text: string;
  html: string;
}

let transporter: Transporter | null = null;

/**
 * Sends one email over SMTP. Returns false (and sends nothing) when
 * SMTP_HOST is not configured, so self-hosters without mail still work.
 */
export async function sendMail(mail: OutgoingMail): Promise<boolean> {
  const config = getSmtpConfig();
  if (!config) return false;
  transporter ??= nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
  });
  await transporter.sendMail({ from: config.from, ...mail });
  return true;
}
