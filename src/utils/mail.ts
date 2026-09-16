import nodemailer from "nodemailer";

// Outbound mail is optional. Resend is used when both RESEND_API_KEY and MAIL_FROM are set
// (Resend only accepts a sender on a verified domain, so the key alone isn't enough); SMTP_*
// is the fallback; with neither, messages are logged to the server console instead (handy in
// dev, and safe in prod — nothing silently fails).
const { RESEND_API_KEY, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, MAIL_FROM } =
  process.env;

const useResend = Boolean(RESEND_API_KEY && MAIL_FROM);
const FROM = MAIL_FROM ?? SMTP_FROM;

export const mailConfigured = useResend || Boolean(SMTP_HOST && FROM);

const smtp =
  !useResend && SMTP_HOST && FROM
    ? nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT ?? 587),
        secure: Number(SMTP_PORT ?? 587) === 465,
        auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
      })
    : null;

export type MailMessage = {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

export async function sendMail(opts: MailMessage): Promise<boolean> {
  if (useResend) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: Array.isArray(opts.to) ? opts.to : [opts.to],
        subject: opts.subject,
        text: opts.text,
        html: opts.html,
        reply_to: opts.replyTo,
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`Resend ${res.status}: ${detail}`);
    }
    return true;
  }

  if (smtp) {
    await smtp.sendMail({ from: FROM, replyTo: opts.replyTo, ...opts });
    return true;
  }

  const to = Array.isArray(opts.to) ? opts.to.join(", ") : opts.to;
  console.info(`[mail] Not configured. Would send to ${to}:\n${opts.text}`);
  return false;
}
