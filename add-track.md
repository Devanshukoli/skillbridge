# Adding a New Track to SkillBridge

This guide walks any developer (including non-experts) step-by-step to add a new curriculum *track* to SkillBridge. A track groups modules, lessons, and projects (e.g. "Fundamentals", "Worked Examples", "Projects"). Follow these steps carefully.

Prerequisites
- Node.js + npm installed
- Project checked out and dependencies installed (`npm install`)
- Basic familiarity with the repo layout

Repo areas you'll touch
- Backend local DB: `db.json` (seed data used for local dev)
- Backend server modules: `backend/modules/*` (curriculum code)
- Server DB helpers: `backend/server/supabase.ts` and `backend/server/db.ts`
- Frontend curriculum: `frontend/src` (components read curriculum from API)

Overview: Steps you'll perform
1. Add the track to `db.json` local data
2. Add associated modules, lessons and projects in `db.json` under the new track
3. (Optional) If using Supabase: run the SQL schema and seed Supabase, then insert the new track rows in Supabase
4. Run the server and verify the new track is visible in the UI
5. Add any new assets, icons, or copy changes

Detailed step-by-step

1) Open `db.json` and find the `tracks` array
- File: `db.json`
- Add a new track object with these required fields:
  - `id`: a unique string (use kebab-case, e.g. `fundamentals`)
  - `name`: display name (e.g. `Fundamentals`)
  - `description`: short description
  - `icon`: (optional) icon name or URL

Example track object (add this to the `tracks` array):

{
  "id": "fundamentals",
  "name": "Fundamentals",
  "description": "Core concepts and exercises to build a strong foundation.",
  "icon": "book"
}

2) Add Modules that belong to the track
- Find `modules` array in `db.json`. Each module needs:
  - `id` (unique), `trackId` (must equal your track `id`), `title`, `order` (number)
- Add modules in the order you want them shown. Example:

{
  "id": "fundamentals-1",
  "trackId": "fundamentals",
  "title": "Intro to Concepts",
  "order": 1
}

3) Add Lessons for each module
- Find `lessons` array in `db.json`. Each lesson needs:
  - `id`, `moduleId`, `title`, `order`, `estimatedMinutes`, `content`
- `content` can be plain text or HTML/Markdown depending on how the renderer expects it. Example:

{
  "id": "fundamentals-1-lesson-1",
  "moduleId": "fundamentals-1",
  "title": "What is X?",
  "order": 1,
  "estimatedMinutes": 15,
  "content": "Introductory text for this lesson..."
}

4) Add Projects if the track includes practice work
- In `db.json`'s `projects` array add entries with:
  - `id`, `trackId`, `moduleId`, `type` ("practice" or "capstone"), `title`, `description`, `requirements`, `rubric`, `rewardPoints`, `rewardMoney`

Example project:

{
  "id": "fundamentals-project-1",
  "trackId": "fundamentals",
  "moduleId": "fundamentals-1",
  "type": "practice",
  "title": "Build a Hello App",
  "description": "Create a minimal app demonstrating core concepts.",
  "requirements": ["Repo URL", "Short writeup"],
  "rubric": ["Completeness", "Code quality"],
  "rewardPoints": 50,
  "rewardMoney": 0
}

5) (Optional) If you use Supabase in your environment
- Ensure your Supabase project has the SkillBridge tables. If you see errors like `PGRST205` (table not found), run the SQL schema from `backend/server/supabase.ts` or copy the output the server prints on startup.
- To manually add the new track to Supabase:
  - Open Supabase -> SQL Editor -> Run an `INSERT INTO skillbridge_tracks (id, name, description, icon) VALUES (...)` statement with your track values.
- Similarly insert modules, lessons, and projects into their corresponding tables (`skillbridge_modules`, `skillbridge_lessons`, `skillbridge_projects`).

6) Start the dev server and verify
- Run:

```bash
npm run dev
```

- Open the app in the browser (usually `http://localhost:3000`).
- Visit the curriculum view or dashboard to confirm the new track appears and modules/lessons load.

7) Update frontend content (if you want custom ordering or display)
- The frontend reads curriculum via the API; if you need specific display tweaks, update `frontend/src/components/CurriculumView.tsx` or related component.
- Add icons or static assets into `assets/` and reference them in the `icon` field.

8) Adding more "Fundamentals", "Worked Examples" or "Projects" sub-items
- Repeat steps 2-4 to add more modules, lessons, and projects. Use consistent IDs and increasing `order` values.

9) Recommended workflow for contributors
- Make changes in a feature branch.
- Run the dev server locally and verify behavior.
- Add a short entry in `metadata.json` or `README.md` describing the new track (optional but helpful).
- Create a PR describing what was added and include sample screenshots or the route to view it.

Troubleshooting
- If the UI doesn't show changes: restart the server and clear the browser cache.
- If Supabase returns `PGRST205`: the tables are missing in your Supabase project. Run the SQL schema from `getSupabaseSQLSchema()` in `backend/server/supabase.ts` (server prints it when the error occurs).
- If lessons show malformed content: ensure the `content` format matches `frontend/src/MarkdownRenderer.tsx` expectations (Markdown vs HTML).

Appendix: Quick SQL INSERT examples (Supabase)

INSERT a track:

```sql
INSERT INTO skillbridge_tracks (id, name, description, icon) VALUES (
  'fundamentals', 'Fundamentals', 'Core concepts and exercises', 'book'
);
```

INSERT a module:

```sql
INSERT INTO skillbridge_modules (id, track_id, title, "order") VALUES (
  'fundamentals-1', 'fundamentals', 'Intro to Concepts', 1
);
```

INSERT a lesson:

```sql
INSERT INTO skillbridge_lessons (id, module_id, title, "order", estimated_minutes, content) VALUES (
  'fundamentals-1-lesson-1', 'fundamentals-1', 'What is X?', 1, 15, 'Introductory text for this lesson...'
);
```

Notes
- Keep IDs stable: changing IDs later will orphan related rows and user progress.
- When adding new content that affects UX, include screenshots in your PR and ask a reviewer to sanity-check ordering and copy.

If you'd like, I can:
- Add a script that programmatically inserts new track rows into Supabase from `db.json`.
- Create a minimal PR template for content additions.

"Done" checklist (for maintainers)
- [ ] Added track object in `db.json`
- [ ] Added modules in `db.json`
- [ ] Added lessons in `db.json`
- [ ] Added projects (if applicable) in `db.json`
- [ ] Verified in UI locally
- [ ] Inserted rows into Supabase (if using a remote DB)

---
Generated by the project assistant. If you want the guide modified (more screenshots, stricter conventions, or a form to add tracks), tell me the preferred format.
