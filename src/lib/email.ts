import "server-only";
import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM || "XW Social <onboarding@resend.dev>";

function client() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

// Sends via Resend when RESEND_API_KEY is set; otherwise logs to the
// terminal so auth flows are fully testable before an email account exists.
export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}) {
  const resend = client();
  if (!resend) {
    const links = [...opts.html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
    console.log(
      `\n[email:dev] RESEND_API_KEY not set — would send:\n  to: ${opts.to}\n  subject: ${opts.subject}\n${links.map((l) => `  link: ${l}`).join("\n")}\n`,
    );
    return;
  }
  const result = await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });
  if (result.error) {
    console.error("[email] Resend error:", result.error);
    throw new Error(`Failed to send email: ${result.error.message}`);
  }
}

export function accessRequestAdminEmail(params: {
  adminEmail: string;
  requesterEmail: string;
  approveUrl: string;
}) {
  return sendEmail({
    to: params.adminEmail,
    subject: `Access request: ${params.requesterEmail}`,
    html: `<p><strong>${params.requesterEmail}</strong> asked for access to XW Social.</p>
      <p><a href="${params.approveUrl}">Review the request →</a></p>`,
  });
}

export function approvedEmail(params: { to: string; loginUrl: string }) {
  return sendEmail({
    to: params.to,
    subject: "You're approved — sign in to XW Social",
    html: `<p>You've been approved to access XW Social.</p>
      <p><a href="${params.loginUrl}">Sign in →</a></p>`,
  });
}

export function magicLinkEmail(params: { to: string; verifyUrl: string }) {
  return sendEmail({
    to: params.to,
    subject: "Your XW Social sign-in link",
    html: `<p>Click below to sign in. This link expires in 15 minutes and can only be used once.</p>
      <p><a href="${params.verifyUrl}">Sign in to XW Social →</a></p>`,
  });
}
