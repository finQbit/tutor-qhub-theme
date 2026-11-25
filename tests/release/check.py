"""Check the installed release and its rendered LMS, Studio and MFE artifacts."""

import hashlib
import importlib.metadata
import sys
from pathlib import Path

import tutorindigo

root = Path(sys.argv[1])
package = Path(tutorindigo.__file__).parent
version = importlib.metadata.version("tutor-qhub-theme")
source = f"https://github.com/finQbit/tutor-qhub-theme/releases/tag/v{version}"
theme = root / "env/build/openedx/themes/indigo"
mfe = (root / "env/plugins/mfe/build/mfe/env.config.jsx").read_text()
lms = (root / "env/apps/openedx/settings/lms/production.py").read_text()

for variant in ("core", "light", "dark"):
    assert (package / f"brand/dist/{variant}.min.css").stat().st_size > 0
    assert f"/{variant}.min.css?v={version}" in lms
assert "cdn.jsdelivr.net/gh/edly-io/brand-openedx" not in lms
assert "var ENABLED = false;" in (theme / "lms/static/js/dynamic-theme.js").read_text()
assert (
    "theme === undefined || theme === 'undefined'"
    in (theme / "lms/static/js/dark-theme.js").read_text()
)
assert source in (theme / "lms/templates/footer.html").read_text()
assert source in mfe
assert mfe.count("const QuantumHubLogo") == 1
assert mfe.count("const QuantumHubFooter") == 1
assert "RenderWidget = QuantumHubLogo" in mfe
assert "RenderWidget = QuantumHubFooter" in mfe
for target in ("lms/static/images/logo.png", "cms/static/images/studio-logo.png"):
    assert hashlib.sha256((theme / target).read_bytes()).hexdigest() == (
        "b4faab6ee3b44322d206d87a42c4af0ce20b9e467da0b33c17170b9629c5582b"
    )
for target in ("lms/static/images/favicon.ico", "cms/static/images/favicon.ico"):
    assert hashlib.sha256((theme / target).read_bytes()).hexdigest() == (
        "421facd2c9d79baefc4f0269e81a965cf3bdbada7797075ccaa11de41e62f47a"
    )
print(f"PASS: installed {version}; LMS, Studio, MFE and source offer rendered")
