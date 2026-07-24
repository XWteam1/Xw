"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { approvedEmail } from "@/lib/email";
import { isRole } from "@/lib/roles";
import { baseUrl } from "@/lib/url";
import { createSignInLink } from "@/lib/magic-link";

export async function approveUser(formData: FormData) {
  const admin = await requireRole("ADMIN");
  const userId = String(formData.get("userId") || "");
  const role = String(formData.get("role") || "");
  if (!userId || !isRole(role)) throw new Error("Invalid approval request");

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      status: "APPROVED",
      role,
      approvedAt: new Date(),
      approvedBy: admin.id,
    },
  });

  try {
    await approvedEmail({ to: user.email, loginUrl: `${baseUrl()}/login` });
  } catch (err) {
    console.error("[approveUser] notification email failed:", err);
  }
  revalidatePath("/admin/access-requests");
}

// Called directly from a Client Component (not a <form> action) — returns
// the link so the admin can copy/share it manually, e.g. over WhatsApp,
// instead of depending on email delivery.
export async function generateSignInLink(userId: string): Promise<string> {
  await requireRole("ADMIN");
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.status !== "APPROVED") {
    throw new Error("User is not approved.");
  }
  return createSignInLink(user.email);
}

export async function rejectUser(formData: FormData) {
  const admin = await requireRole("ADMIN");
  const userId = String(formData.get("userId") || "");
  if (!userId) throw new Error("Invalid request");

  await prisma.user.update({
    where: { id: userId },
    data: { status: "REJECTED", approvedAt: new Date(), approvedBy: admin.id },
  });

  revalidatePath("/admin/access-requests");
}
