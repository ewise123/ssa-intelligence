#!/usr/bin/env bash
# Detect drift between backend and frontend copies of shared modules.
# Run in CI or locally: bash scripts/check-shared-drift.sh
# Exit code 0 = in sync, 1 = drift detected.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
EXIT_CODE=0

check_pair() {
  local backend="$1"
  local frontend="$2"
  local label="$3"

  if [[ ! -f "$ROOT/$backend" ]]; then
    echo "MISSING: $backend"
    EXIT_CODE=1
    return
  fi
  if [[ ! -f "$ROOT/$frontend" ]]; then
    echo "MISSING: $frontend"
    EXIT_CODE=1
    return
  fi

  # Strip the "Keep in sync with" comment header (first 7 lines) before comparing
  # so the only allowed difference is the sync comment pointing to the other file.
  local diff_output
  diff_output=$(diff \
    <(tail -n +8 "$ROOT/$backend") \
    <(tail -n +8 "$ROOT/$frontend") \
  ) || true

  if [[ -n "$diff_output" ]]; then
    echo "DRIFT DETECTED: $label"
    echo "  backend:  $backend"
    echo "  frontend: $frontend"
    echo "$diff_output" | head -20
    echo ""
    EXIT_CODE=1
  else
    echo "OK: $label"
  fi
}

echo "=== Shared module drift check ==="
echo ""

check_pair \
  "backend/src/services/metric-formatter.ts" \
  "frontend/src/utils/metric-formatter.ts" \
  "metric-formatter"

check_pair \
  "backend/src/services/rendering-helpers.ts" \
  "frontend/src/utils/rendering-helpers.ts" \
  "rendering-helpers"

echo ""
if [[ $EXIT_CODE -eq 0 ]]; then
  echo "All shared modules in sync."
else
  echo "Shared module drift detected! Update both copies to match."
fi

exit $EXIT_CODE
