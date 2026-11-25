# Release scenario

Given a clean environment with Tutor 22.0.4 and tutor-mfe 22.1.2,
When the released tutor-qhub-theme wheel is installed and the indigo plugin is enabled,
Then Tutor renders Quantum Hub's LMS/Studio theme and MFE components from that wheel,
And the wheel includes the compiled light/dark brand CSS and all source files,
And both footers offer the source of that exact release.

# Application scenario

Given the Open edX and MFE images built from the same theme release,
When a learner opens the dashboard, a legacy LMS page and the specimen lesson,
Then the Quantum Hub logo, typography and footer appear once,
And system dark mode works on the first visit with no theme cookie,
And the source link opens the source archive for the installed release.

Repeat in light/dark mode at 1440 and 390 pixels; check Studio's logo and favicon.
The render/package checks do not replace this application scenario.
