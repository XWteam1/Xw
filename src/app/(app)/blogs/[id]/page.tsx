import Link from "next/link";
import { notFound, redirect } from "next/navigation";
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
import { PostFilesGallery } from "./post-files-gallery";
import { reviewPost } from "@/lib/actions/reviews";

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
  const user = await requireUser();
  const { id } = await params;
  const { tab: tabParam } = await searchParams;
  const tab = TABS.some((t) => t.key === tabParam) ? tabParam! : "doc";

  const canEdit = user.role === "CREATOR" || user.role === "ADMIN";
  const canReview = user.role === "STAKEHOLDER" || user.role === "ADMIN";

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

  const postReviews =
    postedAssets.length > 0
      ? await prisma.review.findMany({
          where: { targetType: "POST", targetId: { in: postedAssets.map((a) => a.post!.id) } },
          include: { reviewer: true },
          orderBy: { createdAt: "asc" },
        })
      : [];
  const reviewsByPost = new Map<string, typeof postReviews>();
  for (const r of postReviews) {
    if (!reviewsByPost.has(r.targetId)) reviewsByPost.set(r.targetId, []);
    reviewsByPost.get(r.targetId)!.push(r);
  }

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

      {tab === "kits" && blog.kits.length > 0 && redirect(`/kits/${blog.kits[0].id}`)}

      {tab === "kits" && blog.kits.length === 0 && (
        <div className="mt-5 flex max-w-xl flex-col items-center gap-3 rounded-xl border border-line bg-paper-raised px-4 py-14 text-center">
          <p className="text-sm text-ink-faint">
            {canEdit
              ? "No channel kit yet for this blog — one kit per blog, one click to start it."
              : "No channel kit yet for this blog."}
          </p>
          {canEdit && (
            <form action={createKit}>
              <input type="hidden" name="blogId" value={blog.id} />
              <button
                type="submit"
                className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-strong"
              >
                Create channel kit
              </button>
            </form>
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
                      <PostFilesGallery files={files} />
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
                        {canEdit && <RemovePostButton postId={post.id} blogId={blog.id} />}
                      </div>

                      {(() => {
                        const reviews = reviewsByPost.get(post.id) ?? [];
                        const reviewable = canReview && (post.status === "DRAFT" || post.status === "CHANGES_REQUESTED");
                        if (reviews.length === 0 && !reviewable) return null;
                        return (
                          <div className="-mx-3.5 -mb-3.5 mt-1 border-t border-line bg-paper-sunken px-3.5 py-2.5">
                            {reviews.map((r) => (
                              <div key={r.id} className="py-1 text-xs">
                                <span className="font-semibold text-ink">{r.reviewer.name || r.reviewer.email}</span>{" "}
                                <span className={r.decision === "APPROVED" ? "text-ok" : "text-bad"}>
                                  {r.decision === "APPROVED" ? "approved" : "requested changes"}
                                </span>
                                {r.comment && <p className="mt-0.5 text-ink-soft">{r.comment}</p>}
                              </div>
                            ))}
                            {reviewable && (
                              <form action={reviewPost} className="mt-1.5 flex flex-col gap-1.5">
                                <input type="hidden" name="postId" value={post.id} />
                                <input type="hidden" name="blogId" value={blog.id} />
                                <textarea
                                  name="comment"
                                  placeholder="Comment (required if requesting changes)"
                                  rows={2}
                                  className="rounded-lg border border-line-strong bg-paper px-2.5 py-1.5 text-xs text-ink"
                                />
                                <div className="flex justify-end gap-1.5">
                                  <button type="submit" name="decision" value="CHANGES_REQUESTED" className="rounded-md border border-bad/40 px-2.5 py-1 text-[11px] font-semibold text-bad hover:bg-bad-soft">
                                    Request changes
                                  </button>
                                  <button type="submit" name="decision" value="APPROVED" className="rounded-md bg-ok px-2.5 py-1 text-[11px] font-semibold text-white hover:brightness-105">
                                    Approve
                                  </button>
                                </div>
                              </form>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {canEdit && unpostedAssets.length > 0 && (
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
