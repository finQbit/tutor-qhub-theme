# Quantum Hub theme

Public source and release package for Quantum Hub's Open edX theme, based on
[`tutor-indigo` v22.2.0](https://github.com/overhangio/tutor-indigo/tree/v22.2.0).
The upstream Python namespace and Tutor plugin name remain `tutorindigo` and `indigo`.
Install this distribution **instead of** `tutor-indigo`; the two distributions
must not coexist because they own the same Python files and plugin entry point.

## Build and check a release

Use Python 3.12 and Node 22. Install `.[dev]`, then run:

```sh
make build
make test
```

The build compiles and checks the brand CSS, downloads three versioned images
from the Quantum Hub CDN with SHA-256 verification, then builds a wheel and source
archive. Both include the source of the brand and theme. The wheel also includes
the compiled CSS and the images. `tests/release/run.sh` installs the wheel in a
clean environment with Tutor 22.0.4 and tutor-mfe 22.1.2, then renders the theme.
See [SCENARIOS.md](SCENARIOS.md) for the application checks required before rollout.

## Consume a release

Install the wheel from the GitHub release using its exact URL and SHA-256 hash.
Use the same wheel for the deployment tooling, the Open edX image and the MFE
build. Enable `indigo` and `mfe`, then run `tutor config save`.

For a consumer that extends an existing Open edX image:

1. In a separate build stage, install the wheel and run `tutor config save` with
   the `indigo` and `mfe` plugins enabled.
2. Copy `/tutor/env/build/openedx/themes/indigo` over `/openedx/themes/indigo`.
3. Run `npm run compile-sass -- --skip-default` in `/openedx/edx-platform`.
4. Run LMS and CMS `collectstatic --noinput --settings=tutor.assets`.
5. Copy the wheel's `tutorindigo/brand/dist/*.min.css` to
   `/openedx/staticfiles/qhub-brand/` after `collectstatic`.

Build the MFE image from the same Tutor installation's rendered context at
`/tutor/env/plugins/mfe/build/mfe`. Installing this plugin only in deployment
tooling does not update either already-built application image.

## Contents and license

`tutorindigo/templates/indigo` contains the upstream Indigo theme with Quantum Hub
overrides. `tutorindigo/brand` is derived from edly-io/brand-openedx at
`indigo-3.1.1`; its original license is retained. `tutorindigo/qhub_mfe` contains
the logo and footer components; `tutorindigo/qhub.py` registers their configuration.
Fonts, logos and funding artwork use the versioned public Quantum Hub CDN URLs.
This release retains the LMS/CMS styling scope of the original theme work: the
custom SCSS targets legacy LMS and course content; Studio receives logo/favicon
changes and upstream Indigo styles.

The code is AGPL-3.0; preserve the upstream notices in [LICENSE.txt](LICENSE.txt).
Each footer links to the GitHub release corresponding to the installed package
version. Publish that release and its complete source archive before deploying.
The source offer covers this package; operators must separately assess any other
modified AGPL components in their application.

To publish after review, tag the reviewed commit as `v22.2.0.post1` and push the
tag. The release workflow builds, checks, and attaches the wheel, source archive
and SHA256SUMS. It does not publish to PyPI or deploy the platform.
