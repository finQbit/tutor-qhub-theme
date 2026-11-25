"""Local theme development: limited workers, password login and no timed exams."""

import os
from pathlib import Path

from tutor import hooks

hooks.Filters.LMS_WORKER_COMMAND.add_item("--concurrency=2")
hooks.Filters.CMS_WORKER_COMMAND.add_item("--concurrency=2")
hooks.Filters.ENV_PATCHES.add_item(
    (
        "openedx-lms-production-settings",
        'ENABLE_SPECIAL_EXAMS = FEATURES["ENABLE_SPECIAL_EXAMS"] = False',
    )
)

# Trust a developer's optional proxy certificate in MFE Node builds.
if extra_ca := os.environ.get("QHUB_DEV_EXTRA_CA"):
    pem = Path(extra_ca).read_text().strip()
    hooks.Filters.ENV_PATCHES.add_item(
        (
            "mfe-dockerfile-base",
            "{% raw %}"
            + f"RUN cat > /usr/local/share/qhub-dev-extra-ca.pem <<'PEM'\n{pem}\nPEM\n"
            + "ENV NODE_EXTRA_CA_CERTS=/usr/local/share/qhub-dev-extra-ca.pem\n"
            + "{% endraw %}",
        )
    )
