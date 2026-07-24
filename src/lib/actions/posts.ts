"use server";

import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";

export type PostFile = { url: string; type: string; name: string };

export async function createPost(formData: FormData) {
  await requireUser();
  const assetId = String(formData.get("assetId") || "");
  const blogId = String(formData.get("blogId") || "");
  const finalCopy = String(formData.get("finalCopy") || "").trim();
  const scheduledDateRaw = String(formData.get("scheduledDate") || "").trim();
  const incoming = formData
    .getAll("images")
    .filter((f): f is File => f instanceof File && f.size > 0);
  if (!assetId) throw new Error("Missing asset id.");

  let files: PostFile[] | null = null;
  if (incoming.length > 0) {
    const uploaded = await Promise.all(
      incoming.map(async (file) => {
        const blob = await put(file.name, file, {
          access: "public",
          addRandomSuffix: true,
        });
        return { url: blob.url, type: file.type, name: file.name };
      }),
    );
    files = uploaded;
  }

  await prisma.post.upsert({
    where: { assetId },
    update: {
      ...(files ? { files: JSON.stringify(files) } : {}),
      finalCopy: finalCopy || null,
      scheduledDate: scheduledDateRaw ? new Date(scheduledDateRaw) : null,
    },
    create: {
      assetId,
      files: files ? JSON.stringify(files) : null,
      finalCopy: finalCopy || null,
      scheduledDate: scheduledDateRaw ? new Date(scheduledDateRaw) : null,
    },
  });

  if (blogId) revalidatePath(`/blogs/${blogId}`);
}

export async function deletePost(formData: FormData) {
  await requireUser();
  const postId = String(formData.get("postId") || "");
  const blogId = String(formData.get("blogId") || "");
  if (!postId) throw new Error("Missing post id.");

  await prisma.post.delete({ where: { id: postId } });

  if (blogId) revalidatePath(`/blogs/${blogId}`);
}
