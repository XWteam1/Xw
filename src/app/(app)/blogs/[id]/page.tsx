import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { gdocPreviewUrl } from "@/lib/gdoc";

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;

  const blog = await prisma.blog.findUnique({
    where: { id },
    include: { uploadedBy: true },
  });
  if (!blog) notFound();

  return (
    <div className="px-7 py-6">
      <div className="mb-1 flex items-center gap-1.5 text-xs text-ink-faint">
        <Link href="/blogs" className="hover:text-ink hover:underline">
          Blogs
        </Link>
        <span>›</span>
        <span>{blog.title}</span>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">
            {blog.title}
          </h1>
          <p className="mt-1 text-sm text-ink-faint">
            Added{" "}
            {blog.uploadedAt.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}{" "}
            by {blog.uploadedBy.name || blog.uploadedBy.email}
          </p>
        </div>
        <a
          href={blog.docUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-lg border border-line-strong bg-paper-raised px-3.5 py-2 text-sm font-semibold text-ink transition hover:border-ink-faint"
        >
          Open in Google Docs →
        </a>
      </div>

      <div className="mt-6 max-w-2xl overflow-hidden rounded-xl border border-line bg-paper-raised">
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <h3 className="text-sm font-semibold text-ink">Source doc</h3>
          <span className="rounded-full border border-line-strong bg-paper-sunken px-2.5 py-1 text-xs font-semibold text-ink-soft">
            Google Doc
          </span>
        </div>
        <div className="p-5">
          <iframe
            src={gdocPreviewUrl(blog.docUrl)}
            className="h-[420px] w-full rounded-lg border border-line bg-paper-sunken"
            loading="lazy"
            title="Google Doc preview"
          />
          <p className="mt-2 text-xs text-ink-faint">
            Live preview shown when the doc is shared as &ldquo;Anyone with the
            link can view&rdquo; — otherwise use Open in Google Docs above.
          </p>

          {blog.sourceUrl && (
            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                Published URL
              </div>
              <a
                href={blog.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-accent-ink hover:underline"
              >
                {blog.sourceUrl}
              </a>
            </div>
          )}

          {blog.notes && (
            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                Notes
              </div>
              <p className="text-sm text-ink-soft">{blog.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
