#!/usr/bin/env bash
set -euo pipefail

if curl -sf http://127.0.0.1:3000/ >/dev/null 2>&1; then
  echo "Dev server already running on http://localhost:3000"
  exec tail -f /dev/null
fi

exec env DISABLE_HMR=true JWT_SECRET=skillbridge-cloud-dev npm run dev
