"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { OWNERS, PLATFORMS, FORMATS_BY_PLATFORM } from "@/lib/owners";

export async function createKit(formData: FormData) {
  await requireRole("CREATOR", "ADMIN");
  const blogId = String(formData.get("blogId") || "");
  if (!blogId) throw new Error("Missing blog id.");

  const blog = await prisma.blog.findUnique({ where: { id: blogId } });
  if (!blog) throw new Error("Blog not found.");

  const kit = await prisma.channelKit.create({
    data: { blogId, title: `${blog.title} — Channel Kit` },
  });

  revalidatePath(`/blogs/${blogId}`);
  redirect(`/kits/${kit.id}`);
}

export async function updateKitDoc(formData: FormData) {
  await requireRole("CREATOR", "ADMIN");
  const kitId = String(formData.get("kitId") || "");
  const docUrl = String(formData.get("docUrl") || "").trim();
  if (!kitId) throw new Error("Missing kit id.");

  await prisma.channelKit.update({
    where: { id: kitId },
    data: { docUrl: docUrl || null },
  });

  revalidatePath(`/kits/${kitId}`);
}

export async function deleteKit(formData: FormData) {
  await requireRole("CREATOR", "ADMIN");
  const kitId = String(formData.get("kitId") || "");
  const blogId = String(formData.get("blogId") || "");
  if (!kitId) throw new Error("Missing kit id.");

  await prisma.channelKit.delete({ where: { id: kitId } });

  revalidatePath("/kits");
  if (blogId) revalidatePath(`/blogs/${blogId}`);
}

export async function addAsset(formData: FormData) {
  await requireRole("CREATOR", "ADMIN");
  const kitId = String(formData.get("kitId") || "");
  if (!kitId) throw new Error("Missing kit id.");

  const count = await prisma.asset.count({ where: { kitId } });
  const platform = PLATFORMS[0];

  await prisma.asset.create({
    data: {
      kitId,
      owner: OWNERS[0],
      platform,
      format: FORMATS_BY_PLATFORM[platform][0],
      order: count,
    },
  });

  revalidatePath(`/kits/${kitId}`);
}

export async function updateAsset(formData: FormData) {
  await requireRole("CREATOR", "ADMIN");
  const assetId = String(formData.get("assetId") || "");
  const kitId = String(formData.get("kitId") || "");
  if (!assetId) throw new Error("Missing asset id.");

  const owner = String(formData.get("owner") || "");
  const platform = String(formData.get("platform") || "");
  const format = String(formData.get("format") || "");

  if (!OWNERS.includes(owner as (typeof OWNERS)[number])) {
    throw new Error("Invalid owner.");
  }
  if (!PLATFORMS.includes(platform as (typeof PLATFORMS)[number])) {
    throw new Error("Invalid platform.");
  }

  await prisma.asset.update({
    where: { id: assetId },
    data: { owner, platform, format },
  });

  revalidatePath(`/kits/${kitId}`);
}

export async function deleteAsset(formData: FormData) {
  await requireRole("CREATOR", "ADMIN");
  const assetId = String(formData.get("assetId") || "");
  const kitId = String(formData.get("kitId") || "");
  if (!assetId) throw new Error("Missing asset id.");

  await prisma.asset.delete({ where: { id: assetId } });

  revalidatePath(`/kits/${kitId}`);
}

export async function moveAsset(formData: FormData) {
  await requireRole("CREATOR", "ADMIN");
  const assetId = String(formData.get("assetId") || "");
  const kitId = String(formData.get("kitId") || "");
  const direction = String(formData.get("direction") || "");
  if (!assetId || !kitId) throw new Error("Missing ids.");

  const siblings = await prisma.asset.findMany({
    where: { kitId },
    orderBy: { order: "asc" },
  });
  const index = siblings.findIndex((a) => a.id === assetId);
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || targetIndex < 0 || targetIndex >= siblings.length) return;

  const a = siblings[index];
  const b = siblings[targetIndex];

  await prisma.$transaction([
    prisma.asset.update({ where: { id: a.id }, data: { order: b.order } }),
    prisma.asset.update({ where: { id: b.id }, data: { order: a.order } }),
  ]);

  revalidatePath(`/kits/${kitId}`);
}
