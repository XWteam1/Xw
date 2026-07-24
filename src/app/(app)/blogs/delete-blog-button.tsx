"use client";

import { deleteBlog } from "@/lib/actions/blogs";

export function DeleteBlogButton({ blogId, title }: { blogId: string; title: string }) {
  return (
    <form
      action={deleteBlog}
      onSubmit={(e) => {
        if (!confirm(`Delete "${title}"? This also deletes any channel kits under it.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="blogId" value={blogId} />
      <button
        type="submit"
        title="Delete blog"
        className="flex h-7 w-7 items-center justify-center rounded-md text-ink-faint transition hover:bg-bad-soft hover:text-bad"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
          <path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14" />
        </svg>
      </button>
    </form>
  );
}
