import Link from "next/link";
import { requireUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

export default async function BlogsPage() {
  await requireUser();
  const blogs = await prisma.blog.findMany({
    orderBy: { uploadedAt: "desc" },
    include: { uploadedBy: true },
  });

  return (
    <div className="px-7 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">Blogs</h1>
          <p className="mt-1 text-sm text-ink-faint">
            Source docs the content team drafts from.
          </p>
        </div>
        <Link
          href="/blogs/new"
          className="rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-accent-strong"
        >
          + Add blog
        </Link>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-line bg-paper-raised">
        {blogs.length === 0 ? (
          <div className="px-6 py-14 text-center text-sm text-ink-faint">
            No blogs yet — add one from a Google Doc link.
          </div>
        ) : (
          blogs.map((blog, i) => (
            <Link
              key={blog.id}
              href={`/blogs/${blog.id}`}
              className={`flex items-center gap-3.5 px-5 py-3.5 transition hover:bg-paper-sunken ${
                i > 0 ? "border-t border-line" : ""
              }`}
            >
              <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-ink">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <path d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
                  <path d="M14 3v5h5" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-ink">
                  {blog.title}
                </div>
                <div className="mt-0.5 text-xs text-ink-faint">
                  Added {blog.uploadedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}{" "}
                  by {blog.uploadedBy.name || blog.uploadedBy.email}
                </div>
              </div>
              <span className="rounded-full border border-line-strong bg-paper-sunken px-2.5 py-1 text-xs font-semibold text-ink-soft">
                Google Doc
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
