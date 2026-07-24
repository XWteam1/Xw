import { requireRole } from "@/lib/dal";
import { createBlog } from "@/lib/actions/blogs";

export default async function NewBlogPage() {
  await requireRole("CREATOR", "ADMIN");

  return (
    <div className="mx-auto max-w-lg px-7 py-6">
      <h1 className="font-display text-xl font-semibold text-ink">
        Add blog from Google Doc
      </h1>
      <p className="mt-1 text-sm text-ink-faint">
        Paste the doc link — make sure it&rsquo;s shared as &ldquo;Anyone with
        the link can view&rdquo; so the preview works for everyone.
      </p>

      <form action={createBlog} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
            Title
          </span>
          <input
            type="text"
            name="title"
            required
            placeholder="e.g. Why Async Standups Save Deep Work"
            className="rounded-lg border border-line-strong bg-paper px-3 py-2.5 text-sm text-ink outline-none focus:border-accent"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
            Google Doc link
          </span>
          <input
            type="url"
            name="docUrl"
            required
            placeholder="https://docs.google.com/document/d/..."
            className="rounded-lg border border-line-strong bg-paper px-3 py-2.5 text-sm text-ink outline-none focus:border-accent"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
            Published blog URL (optional)
          </span>
          <input
            type="url"
            name="sourceUrl"
            placeholder="https://xperiencewave.com/blog/..."
            className="rounded-lg border border-line-strong bg-paper px-3 py-2.5 text-sm text-ink outline-none focus:border-accent"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
            Notes (optional)
          </span>
          <textarea
            name="notes"
            rows={3}
            placeholder="Anything the kit-builder should know"
            className="resize-y rounded-lg border border-line-strong bg-paper px-3 py-2.5 text-sm text-ink outline-none focus:border-accent"
          />
        </label>

        <div className="mt-1 flex justify-end gap-2">
          <a
            href="/blogs"
            className="rounded-lg px-4 py-2.5 text-sm font-semibold text-ink-soft transition hover:bg-paper-sunken"
          >
            Cancel
          </a>
          <button
            type="submit"
            className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-strong"
          >
            Add blog
          </button>
        </div>
      </form>
    </div>
  );
}
