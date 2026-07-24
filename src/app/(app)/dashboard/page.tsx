import Link from "next/link";
import { requireUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const user = await requireUser();
  const blogCount = await prisma.blog.count();
  const pendingCount =
    user.role === "ADMIN"
      ? await prisma.user.count({ where: { status: "PENDING" } })
      : 0;

  return (
    <div className="px-7 py-6">
      <h1 className="font-display text-xl font-semibold text-ink">
        Welcome back, {(user.name || user.email).split(" ")[0]}.
      </h1>
      <p className="mt-1 text-sm text-ink-faint">
        Phase 1 is live: sign-in, roles, and the blog library. Channel kits and
        review gates land next.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Link
          href="/blogs"
          className="rounded-xl border border-line bg-paper-raised p-4 shadow-sm transition hover:shadow-md"
        >
          <div className="font-mono text-2xl font-semibold text-ink">
            {blogCount}
          </div>
          <div className="mt-1 text-xs text-ink-soft">Blogs in the library</div>
        </Link>

        {user.role === "ADMIN" && (
          <Link
            href="/admin/access-requests"
            className={`rounded-xl border p-4 shadow-sm transition hover:shadow-md ${
              pendingCount > 0
                ? "border-warn/30 bg-warn-soft"
                : "border-line bg-paper-raised"
            }`}
          >
            <div
              className={`font-mono text-2xl font-semibold ${pendingCount > 0 ? "text-warn" : "text-ink"}`}
            >
              {pendingCount}
            </div>
            <div className="mt-1 text-xs text-ink-soft">
              Access requests waiting
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
