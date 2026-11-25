"""Tutor plugin `qhub_theme`: Quantum Hub's theme of Open edX, on top of Indigo.

Quantum Hub colours, typography, logos and footers on the upstream page layouts.
The package supplies the assets for the openedx and mfe images.

The indigo entry point loads these overrides after the upstream plugin.
"""

from pathlib import Path

from tutor import hooks

from .__about__ import __version__

HERE = Path(__file__).parent
SOURCE_URL = f"https://github.com/finQbit/tutor-qhub-theme/releases/tag/v{__version__}"

# Quantum Hub's shared visual assets (ADR 0027 of quantum-hub-environments): a file's
# version is in its name, and
# browsers cache it for a year. Where Open edX takes a URL, the browser loads the file
# from there. The files that
# Indigo's and Open edX's templates name by path are built into the openedx image from
# there (the consumer image build).
ASSETS = "https://cdn.qhub-dev.finqbit.com"
LOGO = f"{ASSETS}/brand/qhub-logo/quantumhub-logo-light-mode.v1.svg"
LOGO_WHITE = f"{ASSETS}/brand/qhub-logo/quantumhub-logo-dark-mode.v1.svg"
# E-mail clients do not show SVG.
LOGO_EMAIL = f"{ASSETS}/brand/qhub-logo/quantumhub-logo-light-mode-52.v1.png"
FAVICON = f"{ASSETS}/brand/favicon/favicon.v1.ico"

# Fixed choices. Tutor writes these into config.yml on `tutor config save`; config.yml
# then wins.
hooks.Filters.CONFIG_OVERRIDES.add_items(
    [
        ("PLATFORM_NAME", "Quantum Hub"),
        # Used by the legacy LMS pages; the openedx image compiles its theme with the
        # same value.
        ("INDIGO_PRIMARY_COLOR", "#B34700"),
        ("INDIGO_ENABLE_DARK_TOGGLE", True),
        # Learners may not repaint the platform: the colours are chosen to meet WCAG 2.2
        # AA.
        ("INDIGO_ENABLE_DYNAMIC_THEME", False),
        # Indigo's defaults point at pages that are blank placeholders.
        ("INDIGO_FOOTER_NAV_LINKS", []),
    ]
)

# The MFEs load the brand CSS that tutorindigo/brand builds, which the LMS serves from
# the openedx image. The
# query follows this package version, which must match in the openedx and deploy images.
_base = (
    "{% if ENABLE_HTTPS %}https{% else %}http{% endif %}"
    "://{{ LMS_HOST }}/static/qhub-brand"
)
_version = __version__


def _css(name: str) -> str:
    return f"{_base}/{name}.min.css" + (f"?v={_version}" if _version else "")


# With no variant chosen, the MFEs follow the system's light or dark preference.
_paragon_theme_urls = {
    "core": {"urls": {"brandOverride": _css("core")}},
    "defaults": {"light": "light", "dark": "dark"},
    "variants": {
        variant: {"urls": {"brandOverride": _css(variant)}}
        for variant in ("light", "dark")
    },
}
# The same files for the apps built on frontend-base.
_site_theme = {
    "core": {"url": _css("core")},
    "defaults": {"light": "light", "dark": "dark"},
    "variants": {variant: {"url": _css(variant)} for variant in ("light", "dark")},
}

hooks.Filters.ENV_PATCHES.add_items(
    [
        (
            # After Indigo's MFE settings, which point at its own brand on jsDelivr.
            "openedx-lms-production-settings",
            f"""
# qhub_theme: the brand CSS of the openedx image; the logo and favicon from the shared
# visual assets.
MFE_CONFIG["PARAGON_THEME_URLS"] = {_paragon_theme_urls!r}
FRONTEND_SITE_CONFIG.setdefault("commonAppConfig", {{}})["PARAGON_THEME_URLS"] = (
    MFE_CONFIG["PARAGON_THEME_URLS"]
)
FRONTEND_SITE_CONFIG["theme"] = {_site_theme!r}
MFE_CONFIG["LOGO_URL"] = {LOGO!r}
MFE_CONFIG["LOGO_TRADEMARK_URL"] = {LOGO!r}
MFE_CONFIG["LOGO_WHITE_URL"] = {LOGO_WHITE!r}
MFE_CONFIG["FAVICON_URL"] = {FAVICON!r}
FRONTEND_SITE_CONFIG["headerLogoImageUrl"] = {LOGO!r}
""",
        ),
        (
            # The light header of the legacy LMS pages, the Studio and LMS favicon, and
            # the e-mails.
            "openedx-common-settings",
            f"""
# qhub_theme: the logo and favicon from the shared visual assets.
LOGO_URL = {LOGO!r}
LOGO_TRADEMARK_URL = {LOGO!r}
LOGO_URL_PNG_FOR_EMAIL = {LOGO_EMAIL!r}
FAVICON_URL = {FAVICON!r}
QHUB_THEME_SOURCE_URL = {SOURCE_URL!r}
""",
        ),
    ]
)

# The MFEs' logo and footer (mfe/), compiled into the mfe image that the publish
# workflow builds.
_mfe = HERE / "qhub_mfe"
hooks.Filters.ENV_PATCHES.add_items(
    [
        (
            "mfe-env-config-runtime-definitions",
            "{% raw %}"
            + f"const QHUB_THEME_SOURCE_URL = {SOURCE_URL!r};\n"
            + (_mfe / "QuantumHubLogo.jsx").read_text()
            + (_mfe / "QuantumHubFooter.jsx").read_text()
            + "{% endraw %}",
        ),
        (
            "mfe-env-config-runtime-final",
            "{% raw %}" + (_mfe / "slots.js").read_text() + "{% endraw %}",
        ),
    ]
)
