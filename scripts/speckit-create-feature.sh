#!/usr/bin/env bash
# Thin wrapper around Spec Kit's create-new-feature.sh.
# Keeps project-specific automation out of .specify/scripts/ (easier Spec Kit upgrades).
# Usage: ./scripts/speckit-create-feature.sh [--number N] [--short-name name] [--timestamp] [--skip-fetch] "Feature description"
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
exec "$ROOT/.specify/scripts/bash/create-new-feature.sh" "$@"
