import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST;
const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.EMAIL_FROM ?? "no-reply@localhost";

function hasSmtp() {
  return Boolean(host && port && user && pass);
}

export async function sendMail({ to, subject, html, text }: { to: string; subject: string; html?: string; text?: string }) {
  if (!hasSmtp()) {
    console.warn("SMTP not configured, skipping sending mail to", to);
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({ from, to, subject, html, text });
}
