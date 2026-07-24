"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";

export async function createBlog(formData: FormData) {
  const user = await requireUser();

  const title = String(formData.get("title") || "").trim();
  const docUrl = String(formData.get("docUrl") || "").trim();
  const sourceUrl = String(formData.get("sourceUrl") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  if (!title || !docUrl) {
    throw new Error("Title and Google Doc link are required.");
  }

  const blog = await prisma.blog.create({
    data: {
      title,
      docUrl,
      sourceUrl: sourceUrl || null,
      notes: notes || null,
      uploadedById: user.id,
    },
  });

  revalidatePath("/blogs");
  redirect(`/blogs/${blog.id}`);
}

export async function deleteBlog(formData: FormData) {
  await requireUser();
  const blogId = String(formData.get("blogId") || "");
  if (!blogId) throw new Error("Missing blog id.");

  await prisma.blog.delete({ where: { id: blogId } });

  revalidatePath("/blogs");
}
