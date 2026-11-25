#!/usr/bin/env bash
# Build the complete release: brand CSS, pinned images, wheel and source archive.
set -euo pipefail
cd "$(dirname "$0")/.."
(cd tutorindigo/brand && npm ci --no-audit --no-fund && npm run build)
python scripts/fetch_assets.py
python -m build
python -m twine check dist/*
