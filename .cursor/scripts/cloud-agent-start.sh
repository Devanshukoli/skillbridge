#!/usr/bin/env bash
set -euo pipefail

# Per-boot setup: ensure a local .env exists for optional overrides.
# Without Supabase credentials the app uses in-memory demo data
# (admin@skillbridge.dev / admin123, student@skillbridge.dev / student123).
if [[ ! -f .env ]]; then
  cp .env.example .env
fi

# Wait for the dev server terminal to bind port 3000 (best-effort, 60s).
for _ in $(seq 1 60); do
  if curl -sf http://127.0.0.1:3000/ >/dev/null 2>&1; then
    echo "SkillBridge dev server is ready at http://localhost:3000"
    exit 0
  fi
  sleep 1
done

echo "Warning: dev server did not become ready within 60s" >&2
exit 0
