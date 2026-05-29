/// <reference types="@cloudflare/workers-types" />
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { drizzle } from 'drizzle-orm/d1';
import { Resend } from 'resend';
import * as schema from '../db/schema';

const FROM_ADDRESS = 'ardmore.directory <noreply@ardmore.directory>';
const SITE_URL = 'https://ardmore.directory';

export function createAuth(d1: D1Database, secret: string, resendKey?: string) {
  const db = drizzle(d1, { schema });
  const resend = resendKey ? new Resend(resendKey) : null;

  return betterAuth({
    secret,
    baseURL: SITE_URL,
    database: drizzleAdapter(db, {
      provider: 'sqlite',
    }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false, // enable once Resend is verified
      sendVerificationEmail: async ({ user, url }: { user: { email: string }, url: string }) => {
        if (!resend) return;
        await resend.emails.send({
          from: FROM_ADDRESS,
          to: user.email,
          subject: 'Verify your email — ardmore.directory',
          html: emailTemplate({
            heading: 'Verify your email address',
            body: "Thanks for creating an account! Click the button below to confirm your email address and activate your listing.",
            buttonText: 'Verify email',
            buttonUrl: url,
          }),
        });
      },
      sendResetPassword: async ({ user, url }: { user: { email: string }, url: string }) => {
        if (!resend) return;
        await resend.emails.send({
          from: FROM_ADDRESS,
          to: user.email,
          subject: 'Reset your password — ardmore.directory',
          html: emailTemplate({
            heading: 'Reset your password',
            body: "We received a request to reset your password. Click the button below to choose a new one. This link expires in 1 hour.",
            buttonText: 'Reset password',
            buttonUrl: url,
            footerNote: "If you didn't request this, you can safely ignore this email.",
          }),
        });
      },
    },
    session: {
      expiresIn:  60 * 60 * 24 * 7, // 7 days
      updateAge:  60 * 60 * 24,      // refresh if > 1 day old
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;

// ── Simple HTML email template ────────────────────────────────
function emailTemplate({ heading, body, buttonText, buttonUrl, footerNote }: {
  heading: string;
  body: string;
  buttonText: string;
  buttonUrl: string;
  footerNote?: string;
}) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:'Open Sans',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">
        <tr><td style="padding-bottom:24px;text-align:center">
          <a href="https://ardmore.directory" style="color:#3d4a3d;font-size:14px;font-weight:600;text-decoration:none;letter-spacing:0.05em;text-transform:uppercase">
            ardmore.directory
          </a>
        </td></tr>
        <tr><td style="background:#ffffff;border-radius:16px;padding:40px 36px">
          <h1 style="margin:0 0 16px;font-size:22px;font-weight:600;color:#1a1f1a">${heading}</h1>
          <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#4a544a">${body}</p>
          <a href="${buttonUrl}"
             style="display:inline-block;padding:12px 28px;background:#ff8300;color:#ffffff;border-radius:99px;font-size:14px;font-weight:600;text-decoration:none">
            ${buttonText}
          </a>
          ${footerNote ? `<p style="margin:28px 0 0;font-size:13px;color:#8a968a">${footerNote}</p>` : ''}
        </td></tr>
        <tr><td style="padding-top:24px;text-align:center">
          <p style="margin:0;font-size:12px;color:#8a968a">
            © ${new Date().getFullYear()} ardmore.directory &nbsp;·&nbsp;
            <a href="https://ardmore.directory/privacy-policy" style="color:#8a968a">Privacy Policy</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
