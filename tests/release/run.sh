#!/usr/bin/env bash
# Exercise the installed wheel, not imports from this checkout.
set -euo pipefail
repo=$(cd "$(dirname "$0")/../.." && pwd)
out=$(mktemp -d)
trap 'rm -rf "$out"' EXIT
python -m venv "$out/venv"
"$out/venv/bin/pip" install "$repo"/dist/*.whl tutor==22.0.4 tutor-mfe==22.1.2
export TUTOR_ROOT="$out/tutor"
export TUTOR_PLUGINS_ROOT="$out/plugins"
export PYTHONPATH=""
cd "$out"
"$out/venv/bin/tutor" plugins enable indigo mfe
"$out/venv/bin/tutor" config save --set ENABLE_HTTPS=false --set LMS_HOST=local.openedx.io
"$out/venv/bin/python" "$repo/tests/release/check.py" "$TUTOR_ROOT"
