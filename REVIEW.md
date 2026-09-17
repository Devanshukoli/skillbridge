# REVIEW.md

Repository review rules for Qodo. Apply these on every pull request. Do not treat this file as product docs for humans.

## Severity

Treat these as Important:

- Auth bypass, missing `authenticate` / `requireAdmin`, or leaking `twoFactorSecret`, password hashes, JWT, or Stripe secrets to the client or logs.
- Stripe webhook changes that parse JSON before signature check, skip `constructEvent`, or move `paymentsWebhookRouter` after `express.json()`.
- Money movement that can double-pay, skip a balance check, or change `claimableBalance` without going through `backend/server/supabase.ts`.
- Secrets committed in source, `.env` files, or fixtures.

Treat these as Nit, and keep them to at most five per pull request. Group repeats into one summary:

- Naming, import order, extra comments, Tailwind class taste, commit message wording when commitlint already applies.

Do not re-raise issues already covered by `npm run lint` (`tsc --noEmit`).

## Out of scope

Do not raise findings on:

- `node_modules/`, `dist/`, `coverage/`, lockfiles, `*.log`
- `content/` curriculum markdown, unless the diff claims the backend now reads it at runtime
- `backend/content/compiled.json`, unless a service starts importing it
- `scripts/migrate-db-to-content.ts` local tooling, unless it gains production call sites
- Unused `GEMINI_API_KEY` / `APP_URL` rows in `.env.example` (they are leftover template names)
- Missing `db.json`, `backend/server/db.ts`, or `scripts/build-content.ts`. Those paths are documented gaps, not regressions in an unrelated change.

Do not demand a full test suite on frontend view-only diffs. Backend tests exist only for `welcomeEmail` and `payments.service`. Flag missing tests when the diff changes auth, claims, payouts, webhooks, or admin gates.

## Layering and dependency direction

Backend features live under `backend/modules/<feature>/` as `*.routes.ts` → `*.controller.ts` → `*.service.ts`. Persistence stays in `backend/server/supabase.ts`.

- Services do not import Express `Request` / `Response`. Controllers map HTTP to service calls and pass `next(err)`.
- New data access goes through `supabase.ts` mappers (`mapUserRow` and siblings). Do not add ad-hoc Supabase queries in controllers.
- Domain types live in `frontend/src/types.ts`. Backend imports that file. A field rename must update mappers, API JSON, and UI together.
- Do not introduce a second persistence layer (`db.json`, in-memory store) in the same change as a feature unless the PR's job is that migration.

Frontend:

- `frontend/src/lib/api.ts` `api()` is the HTTP helper. New fetches use it with `credentials: 'include'`.
- `App.tsx` is the section switcher. Do not add React Router unless the PR is a routing migration.
- Shared session boot is `SessionBootScreen` in `frontend/src/components/Skeleton.tsx`. Do not restore a fake dashboard shell for `loadingSession`.

## Extension points

A missed wiring spot fails silent. For each new sibling, grep an existing one and match every site.

**New `/api` route.** Add the router file, mount it in `backend/server.ts`, attach `authenticate` unless the route is public auth or the Stripe webhook. Admin paths also use `requireAdmin` from `backend/middlewares/auth.ts`.

**New Stripe webhook event.** Handle it in `payments.service` after `constructEvent`. Keep the webhook router on raw body. `backend/server.ts` must keep `app.use('/api', paymentsWebhookRouter)` before `express.json()`.

**New payout country or method.** Update `backend/modules/payments/unsupportedCountries.ts` and the eligibility checks in `payments.service`, not a one-off `if` in a controller.

**New curriculum track.** Runtime data is Supabase tables, not `content/`. Flag a PR that only adds files under `content/` and claims the student app will show the track.

## Trust and data boundaries

Validate and authorize where untrusted data enters.

- Cookie JWT is `skillbridge_token`. `authenticate` verifies it and loads the user. Blocked users get 403.
- An authenticated student is not entitled to another user's claims, submissions, or Stripe account. Scope by `user.id` unless `requireAdmin` ran.
- Public JSON uses `toPublicUser` (`backend/utils/ToPublicUser.ts`). Never send `twoFactorSecret`.
- Fail closed. Unknown webhook types, missing Stripe config, or mapper failures must not look like success.
- Do not log cookies, `JWT_SECRET`, webhook raw bodies, or payout account numbers.
- Production requires `JWT_SECRET`. Do not reintroduce a hard-coded fallback that runs when `NODE_ENV === 'production'`.

## State, ownership, and lifecycle

- `GET /api/auth/me` starts as soon as `App` mounts. Do not insert a sleep or minimum delay before that request. `loadingSession` clears in `finally` after the request finishes.
- Claim and payout retries must not double-apply. Flag `Date.now()` claim ids or missing uniqueness if a retry can insert twice.
- `claimableBalance` / `pointsBalance` have one writer path through Supabase helpers. Do not cache a second copy in React that later overwrites the server.
- Release Stripe or SMTP work on error paths the same way success paths return.

## Cross-service contracts

- Stripe Connect onboarding URLs, webhook events, and `skillbridge_users` Stripe columns must stay compatible. Additive column changes belong in `backend/migrations/` with the mapper update.
- There is no committed base schema. A PR that needs a new table must include SQL a reviewer can run, not only TypeScript types.
- Cookie auth plus CORS `credentials: true` must stay aligned with `allowedOrigins` in `backend/server.ts`.

## Reuse before reinvention

- Errors go through `AppError` and `errorHandler`. Do not send a one-off `res.status().json()` from a service.
- Cookie parsing uses `getCookies` in `backend/middlewares/auth.ts`.
- Email skip-when-SMTP-unset is the existing pattern. Do not throw from welcome or payout mail when SMTP is absent unless the PR is changing that contract.

## Review focus

Prioritize, in order:

1. Auth, admin, Stripe, claims, and balance correctness.
2. Persistence mapping and migration lockstep.
3. Frontend session and cookie-credential fetches.
4. Accessibility and reduced-motion only when the diff touches those paths.

Deprioritize visual restyles of `LandingView` marketing copy unless they break contrast or keyboard access.
