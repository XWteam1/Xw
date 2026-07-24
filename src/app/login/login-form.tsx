"use client";

import { useActionState } from "react";
import { requestAccess, type RequestAccessState } from "@/lib/actions/auth";

const initialState: RequestAccessState = { status: "idle" };

export function LoginForm() {
  const [state, action, pending] = useActionState(requestAccess, initialState);

  const done = state.status !== "idle" && state.status !== "error";

  return (
    <div className="flex flex-col gap-4">
      {!done && (
        <form action={action} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
              Work email
            </span>
            <input
              type="email"
              name="email"
              required
              placeholder="you@xperiencewave.com"
              className="rounded-lg border border-line-strong bg-paper px-3 py-2.5 text-sm text-ink outline-none focus:border-accent"
            />
          </label>
          {state.status === "error" && (
            <p className="text-sm text-bad">{state.message}</p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="mt-1 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-strong disabled:opacity-50"
          >
            {pending ? "Sending…" : "Continue"}
          </button>
        </form>
      )}

      {done && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            state.status === "sent"
              ? "border-ok/30 bg-ok-soft text-ok"
              : state.status === "rejected"
                ? "border-bad/30 bg-bad-soft text-bad"
                : "border-warn/30 bg-warn-soft text-warn"
          }`}
        >
          {state.message}
        </div>
      )}
    </div>
  );
}
