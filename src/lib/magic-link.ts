import "server-only";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { baseUrl } from "@/lib/url";

// Creates a one-time sign-in link for an email, valid 15 minutes. Shared by
// the auto-email flow (auth.ts) and the admin's manual "copy link" flow
// (admin.ts) — same token, same expiry, just different delivery.
export async function createSignInLink(email: string): Promise<string> {
  const raw = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(raw).digest("hex");
  const expires = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.verificationToken.deleteMany({ where: { email } });
  await prisma.verificationToken.create({
    data: { email, tokenHash, expires },
  });

  return `${baseUrl()}/api/auth/verify?token=${raw}&email=${encodeURIComponent(email)}`;
}
