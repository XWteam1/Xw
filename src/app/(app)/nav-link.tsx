"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition ${
        active
          ? "bg-accent-soft text-accent-ink"
          : "text-ink-soft hover:bg-paper-sunken hover:text-ink"
      }`}
    >
      <span className="h-4 w-4 shrink-0 opacity-80">{icon}</span>
      {children}
    </Link>
  );
}
