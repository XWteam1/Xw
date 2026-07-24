"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { approvedEmail } from "@/lib/email";
import { isRole } from "@/lib/roles";
import { baseUrl } from "@/lib/url";

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

  await approvedEmail({ to: user.email, loginUrl: `${baseUrl()}/login` });
  revalidatePath("/admin/access-requests");
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
