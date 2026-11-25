#!/usr/bin/env bash
# Run the actual public-stack setup without touching an existing local stack.
set -euo pipefail
repo=$(cd "$(dirname "$0")/../.." && pwd)
out=$(mktemp -d)
trap 'rm -rf "$out"' EXIT
export QHUB_DEV_ROOT="$out/tutor"
cd "$repo"
bash -n dev/stack.sh
dev/stack.sh setup
test "$(dev/stack.sh tutor config printvalue LOCAL_PROJECT_NAME)" = qhub_theme_dev
uv run --no-project --with-requirements dev/requirements.txt --with-editable . \
  python tests/release/check.py "$QHUB_DEV_ROOT"
