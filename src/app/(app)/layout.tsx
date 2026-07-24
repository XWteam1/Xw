import { requireUser } from "@/lib/dal";
import { logout } from "@/lib/actions/auth";
import { roleLabel } from "@/lib/roles";
import { NavLink } from "./nav-link";

const ICONS = {
  dashboard:
    "M3 3h8v8H3zM13 3h8v5h-8zM13 12h8v9h-8zM3 14h8v7H3z",
  blog: "M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z M14 3v5h5 M8 13h8M8 17h5",
  users:
    "M9 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2.5 20c1-3.5 3.5-5.5 6.5-5.5s5.5 2 6.5 5.5M17.5 9a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2ZM15.5 14.5c2.6.3 4.4 2 5 5.5",
};

function Icon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {path.split(" M").map((seg, i) => (
        <path key={i} d={i === 0 ? seg : "M" + seg} />
      ))}
    </svg>
  );
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="grid min-h-full flex-1 grid-cols-[232px_1fr]">
      <aside className="flex flex-col gap-6 border-r border-line bg-paper-raised px-3.5 py-5">
        <div className="flex items-center gap-2.5 px-1.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-strong">
            <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5">
              <path
                d="M2 15c2.5 0 2.5-3 5-3s2.5 3 5 3 2.5-3 5-3 2.5 3 5 3"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M2 9c2.5 0 2.5-3 5-3s2.5 3 5 3 2.5-3 5-3 2.5 3 5 3"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                opacity=".55"
              />
            </svg>
          </div>
          <div>
            <div className="font-display text-[15px] font-semibold leading-tight text-ink">
              XW Social
            </div>
            <div className="text-[10px] uppercase tracking-wide text-ink-faint">
              Review System
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-0.5">
          <NavLink href="/dashboard" icon={<Icon path={ICONS.dashboard} />}>
            Dashboard
          </NavLink>
          <NavLink href="/blogs" icon={<Icon path={ICONS.blog} />}>
            Blogs
          </NavLink>
          {user.role === "ADMIN" && (
            <NavLink href="/admin/access-requests" icon={<Icon path={ICONS.users} />}>
              Manage Access
            </NavLink>
          )}
        </nav>

        <div className="mt-auto flex flex-col gap-2 rounded-lg border border-line bg-paper-sunken p-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-white">
              {(user.name || user.email)[0]?.toUpperCase()}
            </span>
            <div className="min-w-0">
              <div className="truncate text-[12.5px] font-semibold text-ink">
                {user.name || user.email}
              </div>
              <div className="text-[11px] text-ink-faint">{roleLabel(user.role)}</div>
            </div>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="w-full rounded-md px-2 py-1.5 text-left text-xs font-medium text-ink-soft hover:bg-paper-raised hover:text-ink"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className="min-w-0">{children}</main>
    </div>
  );
}
