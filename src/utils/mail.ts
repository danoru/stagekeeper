import nodemailer from "nodemailer";

// Outbound mail is optional: with no SMTP_* env vars configured, messages are logged to
// the server console instead (handy in dev, and safe in prod — nothing silently fails).
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

export const mailConfigured = Boolean(SMTP_HOST && SMTP_FROM);

const transport = mailConfigured
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT ?? 587),
      secure: Number(SMTP_PORT ?? 587) === 465,
      auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    })
  : null;

export async function sendMail(opts: { to: string; subject: string; text: string; html?: string }) {
  if (!transport) {
    console.info(`[mail] SMTP not configured. Would send to ${opts.to}:\n${opts.text}`);
    return false;
  }
  await transport.sendMail({ from: SMTP_FROM, ...opts });
  return true;
}
