#!/usr/bin/env bash
# Prepares a branch on a local clone of hacs/default with the Energy Horizon plugin entry.
# After review, push to your fork and open a PR: https://github.com/hacs/default
#
# Usage:
#   ./scripts/prepare-hacs-default-pr.sh
#   cd /tmp/hacs-default-*   # path printed at end
#   git checkout -b add-energy-horizon-card
#   git add plugin && git commit -m "Adds Energy Horizon card for default"
#   git remote add mine https://github.com/YOUR_USER/default.git
#   git push mine add-energy-horizon-card
# Then open a PR against hacs/default master using the repository PR template.

set -euo pipefail

ENTRY="hello-sebastian/Energy-Horizon"
UPSTREAM="https://github.com/hacs/default.git"

WORKDIR="$(mktemp -d /tmp/hacs-default-XXXXXX)"
git clone --depth 1 "$UPSTREAM" "$WORKDIR/hacs-default"

python3 <<PY
import bisect
import json
import sys
from pathlib import Path

plugin = Path("$WORKDIR/hacs-default/plugin")
data = json.loads(plugin.read_text())
entry = "$ENTRY"
if entry in data:
    print(f"Entry already present: {entry}", flush=True)
else:
    # Case-insensitive position matches typical HACS alphabetical rules for this list.
    if sys.version_info < (3, 10):
        print("Python 3.10+ required (bisect key=str.casefold).", file=sys.stderr)
        sys.exit(1)
    idx = bisect.bisect_left(data, entry, key=str.casefold)
    data.insert(idx, entry)
    plugin.write_text(json.dumps(data, indent=2) + "\n")
    print(f"Inserted: {entry} at index {idx}", flush=True)
PY

cd "$WORKDIR/hacs-default"
git diff --stat plugin
echo ""
echo "Clone ready at: $WORKDIR/hacs-default"
echo "Review with: git -C \"$WORKDIR/hacs-default\" diff plugin"
