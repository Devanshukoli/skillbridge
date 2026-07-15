# SkillBridge

SkillBridge is a full-stack learning portal for software learners. It includes student authentication, onboarding, curriculum lessons, project submissions, admin review, and reward claims (Stripe Connect or manual payout).

The project runs as one Node.js app:

- React 19 frontend in `frontend/`
- Express backend in `backend/`
- Supabase (Postgres) for persistence

> **Status note:** the codebase is mid-migration. Docs and code in a couple of places describe a "local `db.json` fallback" and a "content-as-code" pipeline that reads `content/` and compiles it for the backend. **Neither exists yet** — see [Known Gaps](#known-gaps) below before you spend time chasing them. A working Supabase project is currently **required** to run the app at all.

## Prerequisites

- Node.js 20 or newer
- npm
- A free [Supabase](https://supabase.com) project (required — see [Known Gaps](#known-gaps))

Check your versions:

```bash
node --version
npm --version
```

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Create a Supabase project and copy `.env.example` to `.env`, filling in `SUPABASE_URL` and `SUPABASE_ANON_KEY` at minimum:

```bash
cp .env.example .env
```

3. Create the required tables in your Supabase project. **There is no committed base schema in this repo** (only an incremental migration for Stripe columns, in `backend/migrations/`). The fastest way to get the table shape today is to read the field mappings in `backend/server/supabase.ts` (e.g. `mapUserRow`, and the equivalent functions for tracks/modules/lessons/projects/submissions/claims) and create matching tables by hand, or ask an admin/teammate for a schema dump. Fixing this gap is tracked as a priority — see [Known Gaps](#known-gaps).

4. Start the development server:

```bash
npm run dev
```

5. Open the app:

```text
http://localhost:3000
```

There is no seed step: the backend does not currently create any default accounts. Register your own account from the sign-up screen. To get an admin account, set that user's `role` to `admin` directly in your Supabase `skillbridge_users` table (there is no in-app way to do this yet).

## Environment Variables

`SUPABASE_URL` and `SUPABASE_ANON_KEY` are required — every read/write in the app goes through Supabase (see [Known Gaps](#known-gaps)).

Everything else is optional and degrades gracefully when unset:

```text
JWT_SECRET=replace-with-a-long-random-string
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
SMTP_FROM=no-reply@skillbridge.app
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_CONNECT_RETURN_URL=http://localhost:3000/?settings=payment
STRIPE_CONNECT_REFRESH_URL=http://localhost:3000/?settings=payment
DISABLE_HMR=true
```

Notes:

- `JWT_SECRET` signs login cookies. If omitted, the app uses a hard-coded development fallback secret — **set a real value before deploying anywhere real users can reach.**
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` enable Google Sign-In.
- SMTP variables enable welcome/notification/payout emails. Without them, email sending is skipped (not an error).
- Stripe variables enable Stripe Connect payouts. Without them, only manual payout methods (bank transfer, UPI, PayPal) are available.
- `DISABLE_HMR=true` disables Vite hot module reload and file watching, for environments where file watching causes problems.
- `.env.example` also lists `GEMINI_API_KEY` and `APP_URL`. Neither is currently read anywhere in `backend/` or `frontend/` — they appear to be leftover from an AI Studio template. Safe to ignore unless you're wiring up new Gemini functionality.
- Keep real secrets out of committed files. `.gitignore` already excludes `.env*` (except `.env.example`).

For local Google Sign-In, add this redirect URI in Google Cloud:

```text
http://localhost:3000/api/auth/google/callback
```

On PowerShell, set an env var for the current terminal like this:

```powershell
$env:JWT_SECRET="replace-with-a-long-random-string"
npm run dev
```

On macOS/Linux shells:

```bash
JWT_SECRET="replace-with-a-long-random-string" npm run dev
```

## Available Scripts

```bash
npm run dev
```

Starts the Express server with Vite middleware at `http://localhost:3000`.

```bash
npm run build
```

Builds the React frontend into `dist/` and bundles the backend into `dist/server.cjs`.

```bash
npm start
```

Runs the production build. Run `npm run build` first.

```bash
npm run lint
```

Runs the TypeScript compiler in check-only mode.

```bash
npm test
```

Runs the backend's `node:test` suites (currently `welcomeEmail.test.ts` and `payments.service.test.ts`). This is not exhaustive coverage — most modules have no tests yet.

```bash
npm run content:migrate
```

One-time helper that converts legacy `db.json` curriculum arrays (`tracks`/`modules`/`lessons`/`projects`) into files under `content/`. This script exists and runs, but nothing downstream currently consumes its output — see [Known Gaps](#known-gaps).

```bash
npm run clean
```

Removes the `dist/` build output. Uses `rm -rf`, so it works best in Git Bash, WSL, macOS, or Linux.

## Project Structure

```text
.
|-- content/                # authored curriculum source (see Known Gaps: not read by the backend yet)
|   |-- backend/
|   `-- sql/
|-- frontend/
|   |-- index.html
|   `-- src/
|       |-- main.tsx
|       |-- App.tsx
|       |-- types.ts         # shared domain interfaces, also imported by backend
|       |-- hooks/
|       `-- components/
|-- backend/
|   |-- server.ts            # Express entry point
|   |-- server/
|   |   `-- supabase.ts      # the only persistence layer that actually exists today
|   |-- middlewares/
|   |-- migrations/          # SQL migrations (incremental only, no base schema)
|   `-- modules/
|       |-- auth/
|       |-- profile/
|       |-- curriculum/
|       |-- notifications/
|       |-- submissions/
|       |-- claims/
|       |-- payments/
|       `-- admin/
|-- scripts/
|   `-- migrate-db-to-content.ts
|-- package.json
|-- tsconfig.json
`-- vite.config.ts
```

For a deeper architectural map (intended for both humans and AI coding agents), see [`.agents/architectural-guide.md`](.agents/architectural-guide.md).

## How The App Runs

In development, `npm run dev` runs `backend/server.ts`, which:

1. Registers JSON parsing and request-logging middleware.
2. Mounts API routes under `/api`.
3. Serves the React app through Vite middleware.

Every route handler that touches data calls into `backend/server/supabase.ts`. There is currently no other persistence path, so the app is non-functional without Supabase configured (see [Known Gaps](#known-gaps)).

In production, `npm run build` creates `dist/`, and `npm start` serves the built frontend plus the bundled backend.

## Curriculum Content

`content/` holds authored curriculum source files (tracks, modules, lessons, projects) for two tracks so far (`backend`, `sql`). See `add-track.md` for the authoring format.

**This is currently disconnected from the running app.** `backend/modules/curriculum/curriculum.service.ts` reads curriculum entirely from Supabase tables; nothing reads `content/` or `backend/content/compiled.json` at runtime, and the compiler script (`scripts/build-content.ts`) referenced by `add-track.md` does not exist in this repo. Treat `content/` as a staging area for curriculum you'll need to load into Supabase by hand (or as the next thing to wire up) rather than a working pipeline today.

## Known Gaps

Filed here so new contributors don't lose time rediscovering these the hard way:

1. **No local persistence fallback.** The README/architecture docs previously described a `db.json`-backed local mode requiring zero configuration. That mode is not implemented — there is no `backend/server/db.ts`, and every service module imports directly from `backend/server/supabase.ts`, which throws if `SUPABASE_URL`/`SUPABASE_ANON_KEY` are unset. In practice, `npm install && npm run dev` boots the server, but every API call (register, login, curriculum, submissions, claims...) fails with a 500 until Supabase is configured. This is the single biggest onboarding blocker.
2. **No committed database schema.** `backend/migrations/` only contains an `ALTER TABLE` migration for Stripe Connect columns. There's no base migration that creates `skillbridge_users` or the curriculum/submission/claim tables, so a new Supabase project can't be set up from the repo alone — you have to reverse-engineer the shape from `backend/server/supabase.ts`.
3. **No default/seeded accounts.** Nothing in `backend/server.ts` seeds an admin or student user. You must register your own account and manually promote it to `admin` in Supabase.
4. **The content pipeline is disconnected**, as described above. `add-track.md` documents `npm run content:build`, `npm run content:sync`, and `npm run content:strip-db`, but the underlying scripts (`scripts/build-content.ts`, `scripts/sync-supabase-content.ts`, `scripts/strip-db-content.ts`) and `backend/content/schema.ts` / `backend/content/content-store.ts` are not present in this repo. Only `npm run content:migrate` exists and runs.
5. **Minimal test coverage.** Only `auth/welcomeEmail` and `payments/payments.service` have `node:test` suites (12 tests total, all passing). Auth, curriculum, submissions, claims, and admin modules have none.
6. **A couple of unused dependencies.** `@google/genai` and `gray-matter` are installed but not imported anywhere in `backend/` or `frontend/`. Likely fine to remove once someone confirms they're not needed for planned work.

If you pick up any of these, please update this section and `.agents/architectural-guide.md` in the same change.

## Troubleshooting

If `http://localhost:3000` does not open, check that `npm run dev` is still running and that no other app is using port `3000`.

If every API call returns a 500 with a Supabase error in the server logs, confirm `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set in `.env` and that `SUPABASE_URL` starts with `http://` or `https://`. This is the most common first-run issue — see [Known Gaps](#known-gaps) item 1.

If login fails, confirm the account exists in your Supabase `skillbridge_users` table.

If TypeScript changes behave strangely, run:

```bash
npm run lint
```

For architecture notes aimed at AI coding agents (and useful for humans too), see [`.agents/architectural-guide.md`](.agents/architectural-guide.md).