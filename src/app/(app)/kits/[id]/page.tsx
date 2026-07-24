import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { gdocPreviewUrl } from "@/lib/gdoc";
import { addAsset, updateKitDoc } from "@/lib/actions/kits";
import { AssetCard } from "./asset-card";
import { DeleteKitButton } from "./delete-kit-button";

export default async function KitEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const kit = await prisma.channelKit.findUnique({
    where: { id },
    include: { blog: true, assets: { orderBy: { order: "asc" } } },
  });
  if (!kit) notFound();

  const canEdit = user.role === "CREATOR" || user.role === "ADMIN";

  return (
    <div className="px-7 py-6">
      <div className="mb-1 flex items-center gap-1.5 text-xs text-ink-faint">
        <Link href="/blogs" className="hover:text-ink hover:underline">Blogs</Link>
        <span>›</span>
        <Link href={`/blogs/${kit.blog.id}`} className="hover:text-ink hover:underline">{kit.blog.title}</Link>
        <span>›</span>
        <span>{kit.title}</span>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">{kit.title}</h1>
          <p className="mt-1 text-sm text-ink-faint">From &ldquo;{kit.blog.title}&rdquo;</p>
        </div>
        {canEdit && <DeleteKitButton kitId={kit.id} blogId={kit.blog.id} title={kit.title} />}
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-line bg-paper-raised">
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <h3 className="text-sm font-semibold text-ink">Kit doc</h3>
          <span className="rounded-full border border-line-strong bg-paper-sunken px-2.5 py-1 text-xs font-semibold text-ink-soft">
            Google Doc
          </span>
        </div>
        <div className="p-5">
          {canEdit ? (
            <form action={updateKitDoc} className="flex gap-2">
              <input type="hidden" name="kitId" value={kit.id} />
              <input
                type="url"
                name="docUrl"
                defaultValue={kit.docUrl ?? ""}
                placeholder="https://docs.google.com/document/d/..."
                className="flex-1 rounded-lg border border-line-strong bg-paper px-3 py-2 text-sm text-ink"
              />
              <button
                type="submit"
                className="shrink-0 rounded-lg border border-line-strong bg-paper-raised px-3.5 py-2 text-sm font-semibold text-ink transition hover:border-ink-faint"
              >
                Save
              </button>
            </form>
          ) : (
            !kit.docUrl && <p className="text-sm text-ink-faint">No kit doc added yet.</p>
          )}
          <p className="mt-2 text-xs text-ink-faint">
            The plan and copy live in this doc — assets below just track who&rsquo;s posting what, where.
          </p>
          {kit.docUrl && (
            <iframe
              src={gdocPreviewUrl(kit.docUrl)}
              className="mt-4 h-[360px] w-full rounded-lg border border-line bg-paper-sunken"
              loading="lazy"
              title="Kit doc preview"
            />
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3.5">
        {kit.assets.map((asset, i) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            kitId={kit.id}
            isFirst={i === 0}
            isLast={i === kit.assets.length - 1}
            locked={false}
            canEdit={canEdit}
          />
        ))}
      </div>

      {canEdit && (
        <form action={addAsset} className="mt-3.5">
          <input type="hidden" name="kitId" value={kit.id} />
          <button
            type="submit"
            className="rounded-lg border border-line-strong bg-paper-raised px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-ink-faint"
          >
            + Add asset
          </button>
        </form>
      )}
    </div>
  );
}
