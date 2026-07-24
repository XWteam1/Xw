"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { clearSessionCookie } from "@/lib/session";
import { magicLinkEmail, accessRequestAdminEmail } from "@/lib/email";
import { baseUrl } from "@/lib/url";
import { createSignInLink } from "@/lib/magic-link";

export type RequestAccessState = {
  status: "idle" | "sent" | "pending" | "rejected" | "error";
  message?: string;
};

async function issueMagicLink(email: string) {
  const verifyUrl = await createSignInLink(email);
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
      try {
        await accessRequestAdminEmail({
          adminEmail,
          requesterEmail: email,
          approveUrl: `${baseUrl()}/admin/access-requests`,
        });
      } catch (err) {
        console.error("[requestAccess] admin notification failed:", err);
      }
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

  try {
    await issueMagicLink(email);
  } catch (err) {
    console.error("[requestAccess] magic link email failed:", err);
    return {
      status: "error",
      message:
        "Couldn't send the sign-in email — the sending domain likely isn't verified yet in Resend. Contact the admin.",
    };
  }

  return {
    status: "sent",
    message: `Check ${email} for a sign-in link — it expires in 15 minutes.`,
  };
}

export async function logout() {
  await clearSessionCookie();
  redirect("/login");
}
