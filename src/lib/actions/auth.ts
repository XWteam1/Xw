"use server";

import crypto from "node:crypto";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { clearSessionCookie } from "@/lib/session";
import { magicLinkEmail, accessRequestAdminEmail } from "@/lib/email";
import { baseUrl } from "@/lib/url";

export type RequestAccessState = {
  status: "idle" | "sent" | "pending" | "rejected" | "error";
  message?: string;
};

async function issueMagicLink(email: string) {
  const raw = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(raw).digest("hex");
  const expires = new Date(Date.now() + 15 * 60 * 1000);

  // Invalidate any earlier outstanding links for this email first.
  await prisma.verificationToken.deleteMany({ where: { email } });
  await prisma.verificationToken.create({
    data: { email, tokenHash, expires },
  });

  const verifyUrl = `${baseUrl()}/api/auth/verify?token=${raw}&email=${encodeURIComponent(email)}`;
  await magicLinkEmail({ to: email, verifyUrl });
}

export async function requestAccess(
  _prev: RequestAccessState,
  formData: FormData,
): Promise<RequestAccessState> {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();

  if (!email || !email.includes("@")) {
    return { status: "error", message: "Enter a valid email address." };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    await prisma.user.create({ data: { email, status: "PENDING" } });
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      await accessRequestAdminEmail({
        adminEmail,
        requesterEmail: email,
        approveUrl: `${baseUrl()}/admin/access-requests`,
      });
    }
    return {
      status: "pending",
      message: `Request sent — you'll get an email once you're approved.`,
    };
  }

  if (user.status === "PENDING") {
    return {
      status: "pending",
      message: "Your request is still waiting on approval.",
    };
  }

  if (user.status === "REJECTED") {
    return {
      status: "rejected",
      message:
        "This email's access request was declined. Contact the team if that's unexpected.",
    };
  }

  await issueMagicLink(email);
  return {
    status: "sent",
    message: `Check ${email} for a sign-in link — it expires in 15 minutes.`,
  };
}

export async function logout() {
  await clearSessionCookie();
  redirect("/login");
}
