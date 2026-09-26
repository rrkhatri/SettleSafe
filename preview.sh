#!/usr/bin/env bash
# Preview supervisor.
#
# The sandbox periodically wipes node_modules/ and .next/ (both are excluded
# from workspace snapshots). When that happens under a running `next start`,
# HTML still gets served but every CSS/JS asset 404s — the page renders as raw
# unstyled markup. This wrapper reinstalls and relaunches on the next request
# instead of leaving a dead page, and self-heals if the server dies.
set -u
cd "$(dirname "$0")"

export NEXT_TELEMETRY_DISABLED=1
PORT="${PORT:-3000}"

while true; do
  if [ ! -d node_modules/next ]; then
    echo "[preview] dependencies missing — installing"
    npm install --no-audit --no-fund --loglevel=error || true
  fi

  # Dev mode compiles on demand, so it recovers from a deleted .next by itself.
  npx next dev -H 0.0.0.0 -p "$PORT"
  code=$?
  echo "[preview] server exited (code $code) — restarting in 2s"
  sleep 2
done
