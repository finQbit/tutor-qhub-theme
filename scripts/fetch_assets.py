"""Fetch the versioned theme images and verify their published checksums."""

import hashlib
from pathlib import Path
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[1] / "tutorindigo/templates/indigo"
CDN = "https://cdn.qhub-dev.finqbit.com"
ASSETS = (
    (
        "brand/qhub-logo/quantumhub-logo-light-mode-52.v1.png",
        "b4faab6ee3b44322d206d87a42c4af0ce20b9e467da0b33c17170b9629c5582b",
        ("lms/static/images/logo.png", "cms/static/images/studio-logo.png"),
    ),
    (
        "brand/qhub-logo/quantumhub-logo-dark-mode-52.v1.png",
        "2cdb153e1ca87e6707d1f8ecf900a7982ae2b7dce18a3fb628299cffc8ae7282",
        ("lms/static/images/logo-white.png",),
    ),
    (
        "brand/favicon/favicon.v1.ico",
        "421facd2c9d79baefc4f0269e81a965cf3bdbada7797075ccaa11de41e62f47a",
        ("lms/static/images/favicon.ico", "cms/static/images/favicon.ico"),
    ),
)

for asset, checksum, targets in ASSETS:
    with urlopen(f"{CDN}/{asset}", timeout=60) as response:
        data = response.read()
    if hashlib.sha256(data).hexdigest() != checksum:
        raise SystemExit(f"Checksum mismatch: {asset}")
    for target in targets:
        (ROOT / target).write_bytes(data)
