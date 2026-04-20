#!/usr/bin/env bash
# Optional: fix topic typo (homassistant -> home-assistant) and keep HACS-related tags.
# Requires: GITHUB_TOKEN with repo scope (or fine-grained: repository contents read/write for metadata).
#
# Usage:
#   export GITHUB_TOKEN=ghp_...
#   ./scripts/patch-github-topics-for-hacs.sh

set -euo pipefail

REPO_API="https://api.github.com/repos/hello-sebastian/Energy-Horizon"

if [[ -z "${GITHUB_TOKEN:-}" ]]; then
  echo "GITHUB_TOKEN is not set; skipping API patch."
  echo "Repo metadata for HACS is already present (description, issues, topics)."
  echo "To fix the 'homassistant' topic typo, set GITHUB_TOKEN and re-run."
  exit 0
fi

PAYLOAD="$(python3 -c 'import json; print(json.dumps({"topics": [
  "chart", "dashboard", "data", "energy", "hacs", "hacs-dashboard", "hacs-plugin",
  "home-assistant", "lovelace", "visualization"
]}))')"

curl -fsS -X PATCH \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer ${GITHUB_TOKEN}" \
  "$REPO_API" \
  -d "$PAYLOAD"

echo ""
echo "Topics updated."
