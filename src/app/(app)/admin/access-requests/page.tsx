import { requireRole } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { approveUser, rejectUser } from "@/lib/actions/admin";
import { ROLES, roleLabel } from "@/lib/roles";
import { CopySignInLinkButton } from "./copy-sign-in-link-button";

export default async function AccessRequestsPage() {
  await requireRole("ADMIN");

  const [pending, decided] = await Promise.all([
    prisma.user.findMany({
      where: { status: "PENDING" },
      orderBy: { requestedAt: "asc" },
    }),
    prisma.user.findMany({
      where: { status: { in: ["APPROVED", "REJECTED"] } },
      orderBy: { approvedAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <div className="px-7 py-6">
      <h1 className="font-display text-xl font-semibold text-ink">
        Manage Access
      </h1>
      <p className="mt-1 text-sm text-ink-faint">
        Approve requests and assign a role. No public signup — this is the
        only way in.
      </p>

      <div className="mt-6 overflow-hidden rounded-xl border border-line bg-paper-raised">
        <div className="border-b border-line px-5 py-3">
          <h2 className="text-sm font-semibold text-ink">
            Pending ({pending.length})
          </h2>
        </div>
        {pending.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-ink-faint">
            No pending requests.
          </div>
        ) : (
          pending.map((u, i) => (
            <div
              key={u.id}
              className={`flex flex-wrap items-center gap-3 px-5 py-3.5 ${i > 0 ? "border-t border-line" : ""}`}
            >
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-ink">{u.email}</div>
                <div className="text-xs text-ink-faint">
                  Requested{" "}
                  {u.requestedAt.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>

              <form action={approveUser} className="flex items-center gap-2">
                <input type="hidden" name="userId" value={u.id} />
                <select
                  name="role"
                  defaultValue="STAKEHOLDER"
                  className="rounded-lg border border-line-strong bg-paper px-2.5 py-1.5 text-xs font-semibold text-ink"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {roleLabel(r)}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="rounded-lg bg-ok px-3 py-1.5 text-xs font-semibold text-white transition hover:brightness-105"
                >
                  Approve
                </button>
              </form>

              <form action={rejectUser}>
                <input type="hidden" name="userId" value={u.id} />
                <button
                  type="submit"
                  className="rounded-lg border border-bad/40 px-3 py-1.5 text-xs font-semibold text-bad transition hover:bg-bad-soft"
                >
                  Decline
                </button>
              </form>
            </div>
          ))
        )}
      </div>

      {decided.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-xl border border-line bg-paper-raised">
          <div className="border-b border-line px-5 py-3">
            <h2 className="text-sm font-semibold text-ink">Recent decisions</h2>
          </div>
          {decided.map((u, i) => (
            <div
              key={u.id}
              className={`flex items-center gap-3 px-5 py-3 ${i > 0 ? "border-t border-line" : ""}`}
            >
              <div className="min-w-0 flex-1">
                <div className="text-sm text-ink">{u.email}</div>
              </div>
              {u.status === "APPROVED" && <CopySignInLinkButton userId={u.id} />}
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  u.status === "APPROVED"
                    ? "bg-ok-soft text-ok"
                    : "bg-bad-soft text-bad"
                }`}
              >
                {u.status === "APPROVED" ? roleLabel(u.role) : "Declined"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
