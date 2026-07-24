"use client";

import { useState, useTransition } from "react";
import { generateSignInLink } from "@/lib/actions/admin";

export function CopySignInLinkButton({ userId }: { userId: string }) {
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          try {
            const url = await generateSignInLink(userId);
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            alert("Couldn't generate a link — try again.");
          }
        });
      }}
      className="rounded-full border border-line-strong bg-paper-raised px-2.5 py-1 text-xs font-semibold text-ink-soft transition hover:border-ink-faint hover:text-ink disabled:opacity-50"
    >
      {copied ? "Copied!" : isPending ? "Generating…" : "Copy sign-in link"}
    </button>
  );
}
