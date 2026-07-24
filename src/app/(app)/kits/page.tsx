import Link from "next/link";
import { requireUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { statusLabel, statusClasses } from "@/lib/status";

export default async function KitsPage() {
  await requireUser();
  const kits = await prisma.channelKit.findMany({
    orderBy: { updatedAt: "desc" },
    include: { blog: true, assets: true },
  });

  return (
    <div className="px-7 py-6">
      <h1 className="font-display text-xl font-semibold text-ink">Channel Kits</h1>
      <p className="mt-1 text-sm text-ink-faint">
        Plans derived from blogs — who posts what, where, and with what copy.
      </p>

      <div className="mt-5 overflow-hidden rounded-xl border border-line bg-paper-raised">
        {kits.length === 0 ? (
          <div className="px-6 py-14 text-center text-sm text-ink-faint">
            No kits yet — add one from a blog&rsquo;s page.
          </div>
        ) : (
          kits.map((kit, i) => {
            const approved = kit.assets.filter((a) => a.status === "APPROVED").length;
            return (
              <Link
                key={kit.id}
                href={`/kits/${kit.id}`}
                className={`flex items-center gap-3.5 px-5 py-3.5 transition hover:bg-paper-sunken ${
                  i > 0 ? "border-t border-line" : ""
                }`}
              >
                <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-ink">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18M9 21V9" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-ink">{kit.title}</div>
                  <div className="mt-0.5 text-xs text-ink-faint">
                    From &ldquo;{kit.blog.title}&rdquo; · {approved} of {kit.assets.length} approved
                  </div>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(kit.status)}`}>
                  {statusLabel(kit.status)}
                </span>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
