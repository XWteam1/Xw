import { LoginForm } from "./login-form";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_link: "That sign-in link is invalid.",
  expired_link: "That sign-in link has expired — request a new one below.",
  not_approved: "This email isn't approved yet.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const errorMessage = error ? ERROR_MESSAGES[error] : undefined;

  return (
    <div className="flex flex-1 items-center justify-center bg-paper px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-strong">
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
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
            <h1 className="font-display text-xl font-semibold text-ink">
              XW Social
            </h1>
            <p className="text-xs uppercase tracking-wide text-ink-faint">
              Review System
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-paper-raised p-6 shadow-sm">
          <p className="mb-4 text-sm text-ink-soft">
            Enter your email. New requests go to the admin for approval —
            you&rsquo;ll get a sign-in link once you&rsquo;re in.
          </p>
          {errorMessage && (
            <p className="mb-4 rounded-lg border border-bad/30 bg-bad-soft px-3 py-2 text-sm text-bad">
              {errorMessage}
            </p>
          )}
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
