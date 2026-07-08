# SkillBridge

SkillBridge is a full-stack learning portal for software learners. It includes student authentication, onboarding, curriculum lessons, project submissions, admin review, and reward claims.

The project runs as one Node.js app:

- React frontend in `frontend/`
- Express backend in `backend/`
- Local JSON database fallback in `db.json`
- Version-controlled curriculum content in `content/`
- Optional Supabase persistence when Supabase environment variables are configured

## Prerequisites

Install these before starting:

- Node.js 20 or newer
- npm

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

2. Start the development server:

```bash
npm run dev
```

3. Open the app:

```text
http://localhost:3000
```

That is enough for local development. The app reads compiled curriculum from `backend/content/compiled.json` and uses `db.json` automatically for local user/runtime data when Supabase is not configured.

## Default Local Accounts

The backend seeds these users on startup if they do not already exist in `db.json`.

Admin:

```text
Email: admin@skillbridge.com
Password: admin123
```

Student:

```text
Email: student@skillbridge.com
Password: student123
```

You can also create a new student account from the sign-up screen.

## Environment Variables

No environment variables are required for the default local setup.

Optional variables:

```text
JWT_SECRET=replace-with-a-long-random-string
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
DISABLE_HMR=true
```

Notes:

- `JWT_SECRET` signs login cookies. If omitted, the app uses a development fallback secret.
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` enable Google Sign-In.
- `SUPABASE_URL` and `SUPABASE_ANON_KEY` switch persistence from `db.json` to Supabase.
- `SUPABASE_SERVICE_ROLE_KEY` is only needed for `npm run content:sync`. Keep it server-side.
- `DISABLE_HMR=true` disables Vite hot module reload and file watching for environments where file watching causes problems.
- Keep real secrets out of committed files.

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
npm run content:build
```

Validates files under `content/` and writes `backend/content/compiled.json`.

```bash
npm run content:sync
```

Upserts compiled curriculum content into Supabase. Requires `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

```bash
npm run content:migrate
```

One-time helper that converts old `db.json` curriculum arrays into `content/` files.

```bash
npm run content:strip-db
```

Removes authored curriculum arrays from `db.json` after migration while keeping user/runtime data.

```bash
npm run clean
```

Removes build output. This script uses `rm -rf`, so it works best in Git Bash, WSL, macOS, or Linux.

## Project Structure

```text
.
|-- content/
|   |-- backend/
|   `-- sql/
|-- frontend/
|   |-- index.html
|   `-- src/
|       |-- main.tsx
|       |-- App.tsx
|       |-- types.ts
|       `-- components/
|-- backend/
|   |-- server.ts
|   |-- server/
|   |   |-- db.ts
|   |   `-- supabase.ts
|   |-- middlewares/
|   `-- modules/
|       |-- auth/
|       |-- profile/
|       |-- curriculum/
|       |-- submissions/
|       `-- claims/
|-- db.json
|-- package.json
|-- tsconfig.json
`-- vite.config.ts
```

## How The App Runs

In development, `npm run dev` runs `backend/server.ts`.

The Express server:

1. Registers JSON parsing middleware.
2. Mounts API routes under `/api`.
3. Seeds local user accounts in `db.json` when needed.
4. Uses Supabase if Supabase variables are configured.
5. Serves the React app through Vite middleware.

In production, `npm run build` creates `dist/`, and `npm start` serves the built frontend plus the bundled backend.

## Curriculum Content

Curriculum tracks, modules, lessons, and projects are authored as files in `content/`.

After editing content, run:

```bash
npm run content:build
```

The compiler validates YAML/frontmatter and writes `backend/content/compiled.json`, which the backend reads at runtime.

For the detailed content authoring workflow, see `add-track.md`.

## Local Data

The local database is `db.json`.

It stores users, password hashes, submissions, progress, claims, and track notification markers. The app updates this file as you use the local version.

If you want a fresh local seed, stop the server, back up or remove `db.json`, then run `npm run dev` again.

## Troubleshooting

If `http://localhost:3000` does not open, check that `npm run dev` is still running and that no other app is using port `3000`.

If login fails for the default accounts, inspect `db.json`. Existing data may have different user records. Restarting with a fresh `db.json` will recreate the seeded users.

If Supabase is configured but data looks empty, confirm the Supabase tables exist and that `SUPABASE_URL` starts with `http://` or `https://`.

If TypeScript changes behave strangely, run:

```bash
npm run lint
```

For architecture notes aimed at AI coding agents, see `.agents/architectural-guide.md`.
