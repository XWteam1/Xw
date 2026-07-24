import type { PostFile } from "@/lib/actions/posts";

export function parsePostFiles(raw: string | null): PostFile[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
