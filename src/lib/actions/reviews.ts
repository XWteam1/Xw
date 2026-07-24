"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";

export async function reviewPost(formData: FormData) {
  const user = await requireRole("STAKEHOLDER", "ADMIN");
  const postId = String(formData.get("postId") || "");
  const blogId = String(formData.get("blogId") || "");
  const decision = String(formData.get("decision") || "");
  const comment = String(formData.get("comment") || "").trim();
  if (!postId) throw new Error("Missing post id.");
  if (decision !== "APPROVED" && decision !== "CHANGES_REQUESTED") {
    throw new Error("Invalid decision.");
  }
  if (decision === "CHANGES_REQUESTED" && !comment) {
    throw new Error("A comment is required when requesting changes.");
  }

  await prisma.review.create({
    data: {
      targetType: "POST",
      targetId: postId,
      decision,
      comment: comment || null,
      reviewerId: user.id,
    },
  });
  await prisma.post.update({ where: { id: postId }, data: { status: decision } });

  if (blogId) revalidatePath(`/blogs/${blogId}`);
}
