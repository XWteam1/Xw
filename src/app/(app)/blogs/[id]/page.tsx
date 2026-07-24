import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { gdocPreviewUrl } from "@/lib/gdoc";
import { createKit } from "@/lib/actions/kits";
import { createPost } from "@/lib/actions/posts";
import { parsePostFiles } from "@/lib/post-files";
import { statusLabel, statusClasses } from "@/lib/status";
import { OwnerAvatar } from "@/components/owner-avatar";
import { PlatformIcon } from "@/components/platform-icon";
import { RemovePostButton } from "./remove-post-button";

function FileThumb({ file }: { file: { url: string; type: string; name: string } }) {
  if (file.type.startsWith("image/")) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={file.url} alt="" className="h-full w-full object-cover" />;
  }
  if (file.type.startsWith("video/")) {
    return <video src={file.url} className="h-full w-full object-cover" muted />;
  }
  return (
    <a
      href={file.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-full w-full flex-col items-center justify-center gap-1 text-ink-faint hover:text-accent-ink"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-6 w-6">
        <path d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
        <path d="M14 3v5h5" />
      </svg>
      <span className="max-w-[90%] truncate text-[10px]">{file.name}</span>
    </a>
  );
}

const TABS = [
  { key: "doc", label: "Source Doc" },
  { key: "kits", label: "Channel Kit" },
  { key: "posts", label: "Posts" },
] as const;

export default async function BlogDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const { tab: tabParam } = await searchParams;
  const tab = TABS.some((t) => t.key === tabParam) ? tabParam! : "doc";

  const blog = await prisma.blog.findUnique({
    where: { id },
    include: {
      uploadedBy: true,
      kits: {
        include: { assets: { include: { post: true }, orderBy: { order: "asc" } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!blog) notFound();

  const allAssets = blog.kits.flatMap((k) => k.assets);
  const postedAssets = allAssets.filter((a) => a.post);
  const unpostedAssets = allAssets.filter((a) => !a.post);

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

      <div className="mt-5 flex gap-1 border-b border-line">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/blogs/${blog.id}${t.key === "doc" ? "" : `?tab=${t.key}`}`}
            className={`border-b-2 px-3.5 py-2.5 text-sm font-semibold transition ${
              tab === t.key
                ? "border-accent text-ink"
                : "border-transparent text-ink-faint hover:text-ink"
            }`}
          >
            {t.label}
            {t.key === "kits" && blog.kits.length > 0 && (
              <span className="ml-1.5 text-xs text-ink-faint">{blog.kits.length}</span>
            )}
            {t.key === "posts" && postedAssets.length > 0 && (
              <span className="ml-1.5 text-xs text-ink-faint">{postedAssets.length}</span>
            )}
          </Link>
        ))}
      </div>

      {tab === "doc" && (
        <div className="mt-5 max-w-2xl overflow-hidden rounded-xl border border-line bg-paper-raised">
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
              Live preview shown when the doc is shared as &ldquo;Anyone with
              the link can view&rdquo; — otherwise use Open in Google Docs
              above.
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
      )}

      {tab === "kits" && (
        <div className="mt-5 max-w-xl">
          <div className="mb-3 flex justify-end">
            <form action={createKit}>
              <input type="hidden" name="blogId" value={blog.id} />
              <button
                type="submit"
                className="rounded-md border border-line-strong bg-paper-raised px-2.5 py-1.5 text-xs font-semibold text-ink transition hover:border-ink-faint"
              >
                + New kit
              </button>
            </form>
          </div>

          {blog.kits.length === 0 ? (
            <div className="rounded-xl border border-line bg-paper-raised px-4 py-10 text-center text-sm text-ink-faint">
              No kits yet for this blog.
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {blog.kits.map((kit) => {
                const approved = kit.assets.filter((a) => a.status === "APPROVED").length;
                return (
                  <Link
                    key={kit.id}
                    href={`/kits/${kit.id}`}
                    className="block rounded-xl border border-line bg-paper-raised p-3.5 transition hover:border-ink-faint"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-sm font-semibold text-ink">{kit.title}</div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusClasses(kit.status)}`}
                      >
                        {statusLabel(kit.status)}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-ink-faint">
                      {approved} of {kit.assets.length} asset{kit.assets.length === 1 ? "" : "s"} approved
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "posts" && (
        <div className="mt-5 max-w-2xl">
          {postedAssets.length === 0 ? (
            <div className="rounded-xl border border-line bg-paper-raised px-4 py-10 text-center text-sm text-ink-faint">
              No posts yet — add one below once you have assets from a channel kit.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3.5">
              {postedAssets.map((asset) => {
                const post = asset.post!;
                const files = parsePostFiles(post.files);
                return (
                  <div key={post.id} className="overflow-hidden rounded-xl border border-line bg-paper-raised">
                    {files.length > 0 ? (
                      <div className={`grid h-36 gap-0.5 bg-paper-sunken ${files.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                        {files.slice(0, 4).map((f, i) => (
                          <div key={i} className="overflow-hidden bg-paper-sunken">
                            <FileThumb file={f} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex h-36 items-center justify-center bg-paper-sunken text-xs text-ink-faint">
                        No files
                      </div>
                    )}
                    <div className="flex flex-col gap-2 p-3.5">
                      <div className="flex items-center gap-2">
                        <OwnerAvatar owner={asset.owner} size={20} />
                        <span className="text-xs font-semibold text-ink">{asset.owner}</span>
                        <PlatformIcon platform={asset.platform} size={18} />
                        {files.length > 1 && (
                          <span className="text-[10px] font-semibold text-ink-faint">{files.length} files</span>
                        )}
                        <span
                          className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusClasses(post.status)}`}
                        >
                          {statusLabel(post.status)}
                        </span>
                      </div>
                      {post.finalCopy && (
                        <p className="line-clamp-2 text-xs text-ink-soft">{post.finalCopy}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] text-ink-faint">
                          {post.scheduledDate
                            ? post.scheduledDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                            : "Not scheduled"}
                        </span>
                        <RemovePostButton postId={post.id} blogId={blog.id} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {unpostedAssets.length > 0 && (
            <div className="mt-5 rounded-xl border border-line bg-paper-raised p-4">
              <h3 className="mb-3 text-sm font-semibold text-ink">Add a post</h3>
              <form action={createPost} className="flex flex-col gap-3">
                <input type="hidden" name="blogId" value={blog.id} />
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Asset</span>
                  <select name="assetId" className="rounded-lg border border-line-strong bg-paper px-2.5 py-2 text-sm text-ink">
                    {unpostedAssets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.owner} · {a.platform} · {a.format}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                    Files (image, video, or PDF — multiple allowed for carousels)
                  </span>
                  <input
                    type="file"
                    name="images"
                    accept="image/*,video/*,application/pdf"
                    multiple
                    required
                    className="rounded-lg border border-dashed border-line-strong bg-paper-sunken px-3 py-4 text-sm text-ink-soft file:mr-3 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Final copy</span>
                  <textarea
                    name="finalCopy"
                    rows={3}
                    className="rounded-lg border border-line-strong bg-paper px-3 py-2 text-sm text-ink"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Scheduled date</span>
                  <input
                    type="date"
                    name="scheduledDate"
                    className="w-fit rounded-lg border border-line-strong bg-paper px-3 py-2 text-sm text-ink"
                  />
                </label>
                <button
                  type="submit"
                  className="w-fit rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-strong"
                >
                  Add post
                </button>
              </form>
            </div>
          )}

          {allAssets.length === 0 && (
            <p className="mt-4 text-xs text-ink-faint">
              This blog has no channel kit assets yet — add a kit first.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
