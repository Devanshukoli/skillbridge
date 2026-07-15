# Adding Curriculum Content to SkillBridge

> **Status note:** this document describes the intended content-as-code workflow. As of now, only `npm run content:migrate` exists and runs. `npm run content:build`, `npm run content:sync`, and `npm run content:strip-db` are **not implemented** (the underlying scripts and `backend/content/schema.ts` / `backend/content/content-store.ts` are missing), and the running app currently reads curriculum from Supabase directly rather than from `backend/content/compiled.json`. Use this doc as the target design and content authoring format; see `README.md` → "Known Gaps" for the current state.

SkillBridge now uses a content-as-code pipeline. Curriculum is authored in `content/`, validated by `npm run content:build`, and compiled into `backend/content/compiled.json` for the app to read.

Do not add tracks, modules, lessons, or projects directly to `db.json`. That file is for user/runtime data only: users, password hashes, progress, submissions, claims, and notification markers.

## Folder Shape

Each track gets a folder under `content/`:

```text
content/
|-- backend/
|   |-- track.yaml
|   |-- 01-node-js-express-fundamentals/
|   |   |-- module.yaml
|   |   |-- 01-what-is-node-js.md
|   |   `-- ...
|   `-- 03-practice-projects/
|       |-- module.yaml
|       `-- practice-proj-prac-1.yaml
`-- sql/
    |-- track.yaml
    `-- ...
```

Use numeric prefixes on module and lesson filenames so file order matches display order.

## Track File

Create `track.yaml` in the track folder:

```yaml
id: track-aws-1
name: AWS Cloud Foundations
description: Learn cloud fundamentals, IAM, compute, storage, networking, and deployment workflows.
icon: Layers
```

## Module File

Create `module.yaml` in each module folder:

```yaml
id: mod-aws-1
title: Cloud Fundamentals
order: 1
```

`trackId` is inferred from the parent track folder, so do not add it here.

## Lesson File

Lessons are Markdown files with YAML frontmatter:

```markdown
---
id: less-aws-1
title: What Is Cloud Computing?
order: 1
estimatedMinutes: 15
---

### Why Cloud Changed Infrastructure

Write the lesson body in normal Markdown.
```

`content` is inferred from the Markdown body.

## Project File

Projects are YAML files:

```yaml
id: proj-aws-prac-1
type: practice
title: "Practice: Deploy a Static Site"
description: Deploy a static site using object storage and public hosting.
requirements:
  - Create a public static hosting bucket.
  - Upload an HTML/CSS site.
  - Document the deployment steps.
rubric:
  - Hosting works from a public URL.
  - Permissions are scoped intentionally.
  - README clearly explains the deployment.
rewardPoints: 150
rewardMoney: 0
```

## Validate and Compile

After adding or editing content, run:

```bash
npm run content:build
```

This validates every YAML/frontmatter file and writes `backend/content/compiled.json`.

Then run the normal checks:

```bash
npm run lint
npm run build
```

## Supabase Sync

If the environment uses Supabase content tables, compile first and then sync:

```bash
npm run content:build
npm run content:sync
```

`content:sync` requires:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

The service-role key is server-only. Never expose it to frontend code or commit a real value.

## Migrating Old db.json Content

The one-time migration script converts legacy `db.json` curriculum arrays into `content/` files:

```bash
npm run content:migrate
npm run content:build
npm run content:strip-db
```

Only run this when migrating old authored curriculum out of `db.json`.

## Contributor Checklist

- Add or update files under `content/`.
- Keep IDs stable; changing IDs can orphan user progress or submissions.
- Run `npm run content:build`.
- Run `npm run lint` and `npm run build`.
- Open a PR so lesson/project changes can be reviewed like code.