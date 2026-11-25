# Quantum Hub brand for the Open edX MFEs

Paragon design tokens and styles that the MFEs load at runtime: `dist/core.min.css`, `light.min.css` and
`dark.min.css`, served by the LMS at `/static/qhub-brand/` (the `brand` stage of [../Dockerfile](../Dockerfile)).

Derived from [edly-io/brand-openedx](https://github.com/edly-io/brand-openedx) at tag `indigo-3.1.1`, the brand that
`tutor-indigo` 22.1.0 uses; AGPL-3.0, as the original (`LICENSE`). Its SCSS styles Indigo's markup, so it follows
Indigo's version. Left out: upstream's CI, docs and catalog files, its built CSS (`dist/`, `paragon/build/`; the image
builds them) and its images (logos, favicon, the card image fallback), which nothing here uses. What changed:

- `paragon/tokens/src`: Quantum Hub's tokens replace Indigo's. Light and dark take DESIGN.md's colours; core sets Inter
  and JetBrains Mono, the type scale and the corner radii.
- `scripts/compose-tokens.mjs`: composes both variants in full (see its header for why); `scripts/name-variants.mjs`
  names the files.
- `scripts/check-contrast.mjs`: fails the build on a colour pair below WCAG 2.2 AA in either mode.
- `paragon/_qhub.scss`: what DESIGN.md asks beyond tokens (shadows, links, browser surfaces, the logo and the footer
  of `openedx-deploy/mfe`); imported last.
- Indigo's SCSS: hard-coded colours and shadows replaced by tokens; text on a filled orange is Charred Ink; fonts are
  self-hosted (`_fonts.scss`); code keeps the mono face (`_overrides.scss`). Indigo's dark-mode stylesheets are
  removed: the dark tokens are complete.

Build on the host: `npm ci && npm run build`. In the local stack, `dev/stack.sh image` does this.

To move to a later Indigo: compare the new brand-openedx tag with `indigo-3.1.1`, carry its SCSS changes over, then
build and check the MFEs in both modes.
