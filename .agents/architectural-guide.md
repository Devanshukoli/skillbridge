# SkillBridge Architectural Guide

Purpose: give AI agents enough project context to make targeted changes without reading every file first.

## Fast Summary

SkillBridge is a full-stack TypeScript learning portal for software learners. The frontend is a React 19 single page app served from Vite. The backend is an Express API that runs in the same process and serves the frontend through Vite middleware during development.

The app supports:

- Student registration, login, logout, password changes, and Google OAuth sign-in.
- Student onboarding and profile editing.
- Curriculum browsing, lesson completion, and project submission.
- Track discovery, including a sidebar Tracks view for previewing available or newly added paths.
- Email notification for newly added local JSON tracks when SMTP is configured.
- Admin review of project submissions.
- Reward claims for capstone payouts with Stripe Connect integration for creator payouts.
- Manual payout options (bank transfer, UPI, PayPal) for users in unsupported Stripe regions.
- Admin dashboard for monitoring submissions and claims.
- Admin settings and tracks CMS for content management.
- Supabase (Postgres) persistence. **This is currently the only persistence path that exists in the code** — see "Known Gaps" at the end of this guide before assuming a local JSON fallback is available.

## Repository Shape

```text
.
|-- package.json                 # scripts and shared frontend/backend deps
|-- vite.config.ts               # Vite config; frontend root is ./frontend
|-- tsconfig.json                # shared TS config, noEmit
|-- content/                     # authored curriculum source files (not yet read by the backend; see Known Gaps)
|-- .env.example                 # env var names; do not copy secrets into docs
|-- frontend/
|   |-- index.html
|   `-- src/
|       |-- main.tsx             # React root
|       |-- App.tsx              # top-level app state/router-by-section
|       |-- types.ts             # shared domain interfaces
|       |-- index.css            # global Tailwind/theme styles
|       |-- hooks/               # custom React hooks (e.g., useStripeConnect)
|       |-- avatarPresets.ts     # built-in avatar choices
|       `-- components/          # view components
`-- backend/
    |-- content/
    |   `-- compiled.json        # present, but currently unused at runtime (see Known Gaps)
    |-- server.ts                # Express app, API mounting, Vite/prod serving
    |-- server/
    |   `-- supabase.ts          # the only persistence layer; every service imports from here directly
    |-- middlewares/
    |   |-- auth.ts              # JWT cookie auth and admin gate
    |   `-- errorHandler.ts      # global JSON error handler
    |-- migrations/              # database migration SQL files
    `-- modules/
        |-- auth/
        |-- profile/
        |-- curriculum/
        |-- notifications/
        |-- submissions/
        |-- claims/
        |-- payments/            # Stripe Connect and manual payout handling
        `-- admin/               # admin-specific endpoints
```

## Runtime Model

Development command:

```bash
npm run dev
```

This runs `tsx backend/server.ts` on port `3000`.

In development, `backend/server.ts` creates an Express app, mounts all `/api` routes, then mounts Vite in middleware mode for the React SPA. In production, the build script emits:

- frontend bundle to `dist/`
- backend bundle to `dist/server.cjs`

Production command:

```bash
npm run build
npm start
```

## Frontend Architecture

Entry path:

- `frontend/src/main.tsx` mounts `<App />`.
- `frontend/src/App.tsx` owns the main app orchestration.

`App.tsx` is not using React Router. It keeps `activeSection` in local state and renders one primary view at a time:

- `dashboard` -> `DashboardView`
- `tracks` -> `TracksView`
- `curriculum` -> `CurriculumView`
- `submissions` -> `ProjectSubmissionView`
- `settings` -> `SettingsView`
- `admin` -> `AdminView`, only when `user.role === 'admin'`

Important frontend state in `App.tsx`:

- `user`: authenticated user from `/api/auth/me`
- `activeSection`: current portal section
- `selectedLessonId`: curriculum reader focus
- `selectedProjectId`: submission focus
- `curriculum`: tracks, modules, lessons, projects, progress, submissions
- `currentTrackId`: currently previewed/enrolled curriculum track id
- `loadingSession` and `loadingCurriculum`

Important flow:

1. On mount, `App.tsx` calls `GET /api/auth/me`.
2. If no user, render `AuthView`.
3. If student user exists but onboarding is incomplete, render `OnboardingFlow`.
4. Otherwise fetch `GET /api/curriculum` and render the portal shell.
5. `Navbar` changes `activeSection`; the app resets selected lesson/project IDs when leaving their areas.

Shared domain types live in `frontend/src/types.ts`. Backend modules import these interfaces too, so update this file carefully when changing domain shape.

## Backend Architecture

Entry path:

- `backend/server.ts`

`server.ts` responsibilities:

- Create Express app.
- Enable `express.json()`.
- Register feature routers.
- Register global `errorHandler`.
- Serve Vite middleware in development.
- Serve static `dist/` in production.

Feature modules follow a consistent layer split:

```text
backend/modules/<feature>/
|-- <feature>.routes.ts       # Express route paths and middleware
|-- <feature>.controller.ts   # request/response orchestration
`-- <feature>.service.ts      # persistence/business logic
```

The backend uses async controllers and passes errors to `next(err)`, where practical. Keep new route handlers consistent with the existing route -> controller -> service pattern.

## API Map

Auth routes are mounted under `/api/auth`:

- `GET /api/auth/supabase-status`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/change-password`
- `GET /api/auth/me`
- `GET /api/auth/google`
- `GET /api/auth/google/callback`

Profile routes are mounted under `/api` and require auth:

- `POST /api/onboarding`
- `POST /api/profile`

Curriculum routes are mounted under `/api` and require auth:

- `GET /api/curriculum`
- `POST /api/lessons/:id/complete`

Submission routes are mounted under `/api`:

- `POST /api/submissions` - authenticated student submission
- `GET /api/admin/submissions` - admin only
- `POST /api/admin/submissions/:id/review` - admin only

Claim routes are mounted under `/api`:

- `GET /api/claims` - authenticated user's claims
- `POST /api/claims/request` - authenticated user creates claim request
- `GET /api/admin/claims` - admin only
- `POST /api/admin/claims/:id/pay` - admin only

Payment routes are mounted under `/api` and require auth:

- `POST /api/payments/connect` - initiate Stripe Connect onboarding
- `GET /api/payments/status` - get Stripe Connect status
- `GET /api/payments/config` - get payment configuration (unsupported countries)
- `GET /api/payments/payment-status` - get user's payment readiness status
- `POST /api/payments/manual-payout` - save manual payout details
- `POST /api/payments/refresh` - refresh Stripe Connect status from API
- `DELETE /api/payments/connect` - disconnect Stripe account
- `POST /api/payments/webhook` - Stripe webhook endpoint (no auth required)

Auth is cookie-based. Login/register/Google OAuth set an HttpOnly `skillbridge_token` JWT cookie. `authenticate` reads that cookie, verifies it with `JWT_SECRET`, loads the user, then attaches `req.user`.

## Persistence Model

**Reality check first:** every backend service module (`auth`, `profile`, `curriculum`, `submissions`, `claims`) imports its persistence functions directly from `backend/server/supabase.ts`. There is no other persistence layer in this repo. If `SUPABASE_URL`/`SUPABASE_ANON_KEY` are unset, `getSupabaseClient()` throws `[Supabase] Missing SUPABASE_URL or SUPABASE_ANON_KEY` and every data-touching request fails with a 500. This has been verified by running the server with no env vars and hitting `/api/auth/register`.

Some other docs in this repo (and earlier versions of this guide) describe a zero-config local mode backed by `db.json` and `backend/server/db.ts`, plus a `content/` -> `backend/content/compiled.json` pipeline read via `loadCompiledContent()` from `backend/content/content-store.ts`. **None of that exists in the code today** — `db.json`, `backend/server/db.ts`, `backend/content/schema.ts`, and `backend/content/content-store.ts` are not present, and `curriculum.service.ts` reads curriculum from Supabase, not from `backend/content/compiled.json`. Treat any reference to those files elsewhere as aspirational/stale until someone implements them. See "Known Gaps" below.

The Supabase adapter (`backend/server/supabase.ts`) maps camelCase TypeScript fields to snake_case table columns, for example:

- `pointsBalance` -> `points_balance`
- `claimableBalance` -> `claimable_balance`
- `onboardingCompleted` -> `onboarding_completed`
- `trackId` -> `track_id`
- `moduleId` -> `module_id`

`backend/migrations/` currently contains only one incremental migration (Stripe Connect columns on `skillbridge_users`). There is no committed base schema, so the required table shapes must currently be inferred from the row-mapping functions in `supabase.ts` (e.g. `mapUserRow` and its siblings).

Track notification email lives in `backend/modules/notifications/trackNotificationEmail.ts` and uses SMTP env vars. If SMTP is not configured, the server logs a warning and skips sending rather than erroring.

## Domain Model

Canonical interfaces are in `frontend/src/types.ts`.

Core entities:

- `User`: role, balances, profile, onboarding state, Stripe Connect status, payout method.
- `Track`: curriculum track.
- `Module`: ordered group within a track.
- `Lesson`: markdown lesson content.
- `Project`: practice or capstone assignment with rewards.
- `Submission`: student project submission and review state.
- `Progress`: lesson/project completion state.
- `Claim`: reward payout request state with payout method and tracking.
- `ManualPayoutDetails`: bank transfer, UPI, or PayPal details for manual payouts.
- `StripeConnectStatus`: Stripe account connection and onboarding state.
- `PaymentStatus`: user's payment readiness status.
- `DashboardStats`: derived dashboard summary.

Status values to preserve:

- `User.role`: `student` or `admin`
- `Project.type`: `practice` or `capstone`
- `Submission.status`: `submitted`, `in_review`, `changes_requested`, `approved`, `rejected`
- `Progress.status`: `completed`, `submitted`, `approved`
- `Claim.status`: `pending`, `approved`, `paid`

## Environment Variables

Known variables:

- `GEMINI_API_KEY`: documented for AI Studio runtime, not currently visible in the main app flow from the scanned entry points.
- `APP_URL`: hosted app URL for callbacks/self-links.
- `GOOGLE_CLIENT_ID`: Google OAuth client ID for Sign-In.
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret for Sign-In.
- `SUPABASE_URL`: enables Supabase mode when paired with anon key.
- `SUPABASE_ANON_KEY`: Supabase public anon key.
- `SUPABASE_SERVICE_ROLE_KEY`: documented in `.env.example` for a future `content:sync` script; that script does not exist yet (see Known Gaps).
- `SMTP_HOST`: SMTP host for track notification email.
- `SMTP_PORT`: SMTP port for track notification email.
- `SMTP_SECURE`: set to `true` for secure SMTP transport.
- `SMTP_USER`: SMTP username.
- `SMTP_PASS`: SMTP password.
- `SMTP_FROM`: sender address used for track notification email.
- `STRIPE_SECRET_KEY`: Stripe secret key for Connect integration.
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret for event verification.
- `STRIPE_PUBLISHABLE_KEY`: Stripe publishable key for frontend.
- `STRIPE_CONNECT_RETURN_URL`: Return URL after Stripe Connect onboarding.
- `STRIPE_CONNECT_REFRESH_URL`: Refresh URL when Stripe Connect needs re-authentication.
- `STRIPE_PAYOUT_CURRENCY`: Currency for Stripe payouts (default: usd).
- `JWT_SECRET`: optional; backend falls back to a hard-coded development secret.
- `NODE_ENV`: controls dev Vite middleware vs production static serving.
- `DISABLE_HMR`: used by `vite.config.ts` to disable HMR/file watching in AI Studio-style environments.

Do not paste real secret values into agent docs, tests, or logs.

## Common Change Recipes

### Add or change a frontend view

Start with:

- `frontend/src/App.tsx`
- `frontend/src/components/Navbar.tsx`
- the target file in `frontend/src/components/`

If the view needs backend data, add or reuse an API call from the component and then inspect the matching backend module.

### Add a new API endpoint

Follow the module pattern:

1. Add the path and middleware in `backend/modules/<feature>/<feature>.routes.ts`.
2. Add request/response logic in the controller.
3. Put data reads/writes in the service.
4. If the endpoint requires a logged-in user, use `authenticate`.
5. If the endpoint is admin-only, use `authenticate, requireAdmin`.
6. Update frontend calls and shared types if the response shape changes.

### Change auth/session behavior

Start with:

- `backend/modules/auth/*`
- `backend/middlewares/auth.ts`
- `frontend/src/App.tsx`
- `frontend/src/components/AuthView.tsx`

Remember that the frontend discovers the session via `GET /api/auth/me`, not local storage.

### Change profile, settings, appearance, or privacy

Start with:

- `frontend/src/components/SettingsView.tsx`
- `frontend/src/components/Navbar.tsx`
- `frontend/src/avatarPresets.ts` for built-in avatar choices.
- `frontend/src/types.ts`
- `backend/modules/profile/*`

Profile settings persist through `POST /api/profile`. Appearance is stored on `user.profile.appearance` and applied by `App.tsx` through `document.documentElement.dataset.theme`.

### Change curriculum data

Curriculum is actually read live from Supabase today, not from `content/`. Start with:

- `backend/modules/curriculum/*` for read/complete behavior — this is where the real runtime data path lives.
- `backend/server/supabase.ts` (`supabaseGetCurriculum`, `supabaseCompleteLesson`) for the query/update logic.
- `frontend/src/components/CurriculumView.tsx` for presentation.
- `frontend/src/components/TracksView.tsx` for browsing or previewing available tracks.
- `backend/modules/notifications/trackNotificationEmail.ts` when changing new-track email behavior.

`content/` and `add-track.md` describe an authoring workflow (`content/<track-slug>/` -> `npm run content:build` -> `backend/content/compiled.json`) that is not wired to the backend yet — the compiler script and content-store loader it depends on don't exist in this repo (see Known Gaps). Until that's built, changes to curriculum data need to go directly into the Supabase tables (or into `content/` purely as a staging/reference format for a future migration).

Lesson content is markdown. Rendering is handled by `MarkdownRenderer`.

### Change project submission or review

Start with:

- `backend/modules/submissions/*`
- `frontend/src/components/ProjectSubmissionView.tsx`
- `frontend/src/components/AdminView.tsx`
- `frontend/src/types.ts`

Approving submissions may affect `progress`, `pointsBalance`, and capstone `claimableBalance`.

### Change claims/rewards

Start with:

- `backend/modules/claims/*`
- `frontend/src/components/SettingsView.tsx`
- `frontend/src/components/AdminView.tsx`
- `frontend/src/types.ts`

Claims draw from `claimableBalance`; capstone approval can increase that balance.

### Change payment/stripe functionality

Start with:

- `backend/modules/payments/*`
- `frontend/src/hooks/useStripeConnect.ts`
- `frontend/src/components/SettingsView.tsx`
- `frontend/src/types.ts`

Payment system supports both Stripe Connect for supported countries and manual payouts (bank, UPI, PayPal) for unsupported regions. The system automatically determines the appropriate payout method based on the user's country and Stripe account status.

### Change storage provider behavior

Start with:

- `backend/server/supabase.ts`
- the relevant feature service

There is currently only one storage provider (Supabase). If you're implementing a local fallback, note that every service module currently imports Supabase helpers directly rather than going through an abstraction — you'll need to introduce one (e.g. reintroduce a `backend/server/db.ts`-style module and update each service's imports) rather than just adding a branch inside `supabase.ts`.

## Styling and UI Notes

- Tailwind CSS v4 is wired through `@tailwindcss/vite`.
- Global styles live in `frontend/src/index.css`.
- Icons come from `lucide-react`.
- `motion` is installed for animation.
- The app shell uses a left navigation layout on large screens and a responsive layout for smaller screens.

## Build and Verification

Useful scripts:

```bash
npm run dev      # start Express plus Vite middleware on port 3000
npm run build    # build frontend and backend bundle
npm start        # run production bundle
npm run lint     # TypeScript noEmit check
npm test         # run node:test suites (currently: welcomeEmail, payments.service — not exhaustive)
npm run content:migrate   # one-time conversion from legacy db.json curriculum arrays into content/
```

`content:build`, `content:sync`, and `content:strip-db` are referenced in `add-track.md` and older docs but do not exist as scripts or files in this repo — do not assume they run. Use `npm run lint`, `npm test`, and `npm run build` as the baseline verification for code changes.

## Known Gaps

See the "Known Gaps" section in `README.md` for the full list (no local persistence fallback, no committed DB schema, no seeded accounts, disconnected content pipeline, sparse test coverage, a couple of unused dependencies). The short version for agents: **assume Supabase is the only persistence path, and assume `content/` is not read at runtime**, until those docs say otherwise.

## Agent Workflow Tips

- Read this guide first, then inspect only the files related to the requested change.
- Prefer `rg --files -g '!node_modules' -g '!dist' -g '!.git'` for a fast file map.
- Treat `frontend/src/types.ts` as a contract shared by frontend and backend.
- Do not change generated folders such as `node_modules` or `dist`.
- Do not commit real credentials from `.env` or `.env.example` into documentation.
- If you add a new architectural pattern, update this guide in the same change.
- If you close one of the items in "Known Gaps" (here or in `README.md`), remove it from both docs in the same change so they don't drift again.