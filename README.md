# XW Social System

Internal content review system for the Xperience Wave team. Next.js (App
Router) + TypeScript + Tailwind + Prisma.

**Status: Phase 1** — sign-in (passwordless, admin-approved), roles, and the
blog library (Google Doc based). Channel kits and the two review gates land
in later phases.

## Running locally

```bash
npm install
npx prisma migrate dev   # creates dev.db (SQLite) locally
npx prisma db seed       # creates the admin user from ADMIN_EMAIL in .env
npm run dev
```

Visit `http://localhost:3000`. Sign in with the email set as `ADMIN_EMAIL` in
`.env` — since `RESEND_API_KEY` is blank by default, the magic sign-in link
is printed to the terminal (look for `[email:dev]` in the output) instead of
actually being emailed.

## How access works

There's no public signup. A visitor enters their email on `/login`. That
creates a pending request and (once `RESEND_API_KEY` is set) emails the
admin. The admin approves it from **Manage Access**, choosing a role
(Creator / Stakeholder / Admin). Once approved, that email can request a
sign-in link any time from `/login` — it's a one-time link valid for 15
minutes, not a password.

## Going live (Chrome-accessible, real accounts)

Three free accounts, none of which I can create on your behalf:

1. **[Neon](https://neon.tech)** — Postgres database. Create a project, copy
   the connection string. Set it as `DATABASE_URL` (replaces the local
   `file:./dev.db`) — no code change needed, `src/lib/prisma.ts` picks the
   right driver automatically based on the URL.
2. **[Resend](https://resend.com)** — sends the approval and sign-in emails.
   Create an API key, set `RESEND_API_KEY`. To send to addresses other than
   your own while testing, verify a sending domain (e.g. xperiencewave.com)
   under Resend → Domains.
3. **[Vercel](https://vercel.com)** — hosting. Import this repo (push it to
   GitHub first, or run `vercel` from this folder) and set the environment
   variables above plus `AUTH_SECRET` (`openssl rand -base64 32`), `AUTH_URL`
   (your Vercel URL), and `ADMIN_EMAIL`/`ADMIN_NAME`.

Once deployed, run `npx prisma migrate deploy` against the Postgres URL and
`npx prisma db seed` once to create the admin user, same as local dev.

## Environment variables (`.env`)

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | SQLite locally (`file:./dev.db`), Postgres in prod |
| `AUTH_SECRET` | Signs the session cookie — keep it secret, unique per env |
| `AUTH_URL` | Base URL used in emailed links |
| `RESEND_API_KEY` | Blank = emails print to the terminal instead of sending |
| `EMAIL_FROM` | Sender shown on outgoing emails |
| `ADMIN_EMAIL` / `ADMIN_NAME` | Seeded as the first approved Admin |
