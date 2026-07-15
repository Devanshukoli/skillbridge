# Contributing to SkillBridge

Welcome! This doc gets you from a fresh clone to a running app and your first PR. For a deeper architectural map, read [`.agents/architectural-guide.md`](.agents/architectural-guide.md) after this — it's written for both humans and AI coding agents and is kept up to date alongside the code.

## 1. Set up your environment

```bash
git clone <this-repo>
cd skillbridge
npm install
cp .env.example .env
```

Node 20+ and npm are the only tools you need locally.

## 2. Get a working backend

SkillBridge currently requires Supabase — there is no local, dependency-free mode yet (see [Known Gaps](README.md#known-gaps) in the README, item 1). Steps:

1. Create a free project at [supabase.com](https://supabase.com).
2. Copy its Project URL and anon public key into `.env` as `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
3. Create the tables the app expects. There's no committed schema file yet, so the fastest path today is to open `backend/server/supabase.ts` and read the mapping functions (`mapUserRow` and similar) to see the columns each table needs — start with `skillbridge_users`, since nothing works without it. If a teammate already has a project set up, ask them for a `pg_dump --schema-only` instead of doing this by hand.
4. Run `npm run dev` and confirm `http://localhost:3000` loads and you can register an account without a 500 error in the terminal.

If you hit a Supabase error on every request, that almost always means step 2 or 3 is incomplete — check the terminal running `npm run dev` for the actual error message.

## 3. Get an admin account

There's no seeded admin user and no in-app promotion flow yet. Register a normal account through the sign-up screen, then in the Supabase table editor set that row's `role` column to `admin`.

## 4. Verify your setup

```bash
npm run lint   # TypeScript check, should be clean
npm test       # runs the existing node:test suites
npm run build  # confirms the production build still works
```

All three should pass on an unmodified checkout. If `npm run lint` or `npm run build` fails on a clean clone, that's a bug worth filing before you start on anything else.

## 5. Find something to work on

- Check open issues, or
- Pick an item from [Known Gaps](README.md#known-gaps) in the README — they're ordered roughly by onboarding impact, and closing #1 (local persistence fallback) or #2 (base DB schema) would meaningfully improve the new-contributor experience.
- If you're adding curriculum content rather than code, read [`add-track.md`](add-track.md) — note its status callout, since the compiler pipeline it describes isn't wired up yet.

## 6. Make your change

The codebase follows a consistent layered pattern per backend feature:

```text
backend/modules/<feature>/
|-- <feature>.routes.ts       # paths + middleware
|-- <feature>.controller.ts   # request/response orchestration
`-- <feature>.service.ts      # business logic + Supabase calls
```

Frontend and backend share domain types from `frontend/src/types.ts` — treat that file as a contract and update both sides together when a shape changes.

Before opening a PR:

```bash
npm run lint
npm test
npm run build
```

If your change touches curriculum data, submissions, claims, or payments, also click through the relevant flow manually in the browser — coverage in `npm test` is currently limited to `welcomeEmail` and `payments.service`.

## 7. Keep the docs honest

This project has previously drifted out of sync with its own docs (see [Known Gaps](README.md#known-gaps)) — README and `.agents/architectural-guide.md` described a local JSON fallback and a working content pipeline that didn't actually exist in the code. Please help keep that from happening again:

- If you implement something a "Known Gaps" item describes, remove that item from both `README.md` and `.agents/architectural-guide.md` in the same PR.
- If you add a new module, script, or architectural pattern, add it to `.agents/architectural-guide.md` in the same PR.
- If a doc claims a script or file exists, it should actually exist and run on a clean clone.

## Commit style

This repo uses [Conventional Commits](https://www.conventionalcommits.org/) (`commitlint` config is in `package.json`). Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.

```text
feat: add manual payout support for UPI
fix: correct claimable balance rounding on capstone approval
docs: document Supabase schema requirements
```