"use client";

import { deleteKit } from "@/lib/actions/kits";

export function DeleteKitButton({ kitId, blogId, title }: { kitId: string; blogId: string; title: string }) {
  return (
    <form
      action={deleteKit}
      onSubmit={(e) => {
        if (!confirm(`Delete "${title}"? This deletes all its assets too.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="kitId" value={kitId} />
      <input type="hidden" name="blogId" value={blogId} />
      <button
        type="submit"
        className="rounded-lg border border-line-strong bg-paper-raised px-3 py-1.5 text-xs font-semibold text-ink-soft transition hover:border-bad/40 hover:text-bad"
      >
        Delete kit
      </button>
    </form>
  );
}
