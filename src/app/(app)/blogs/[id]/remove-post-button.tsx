"use client";

import { deletePost } from "@/lib/actions/posts";

export function RemovePostButton({ postId, blogId }: { postId: string; blogId: string }) {
  return (
    <form
      action={deletePost}
      onSubmit={(e) => {
        if (!confirm("Remove this post?")) e.preventDefault();
      }}
    >
      <input type="hidden" name="postId" value={postId} />
      <input type="hidden" name="blogId" value={blogId} />
      <button type="submit" className="text-[11px] font-semibold text-ink-faint hover:text-bad">
        Remove
      </button>
    </form>
  );
}
