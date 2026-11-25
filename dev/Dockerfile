# The rendered theme and host-built brand CSS are supplied by dev/stack.sh image.
FROM docker.io/overhangio/openedx:22.0.4-indigo@sha256:0036a2087873d0a3fe0a4e4c368607c4e7c5e1b5f4fb143389e78ed13af5f5b0
COPY --chown=app:app theme/ /openedx/themes/indigo/
RUN npm run compile-sass -- --skip-default
RUN ./manage.py lms collectstatic --noinput --settings=tutor.assets \
    && ./manage.py cms collectstatic --noinput --settings=tutor.assets \
    && rdfind -makesymlinks true -followsymlinks true /openedx/staticfiles/
COPY --chown=app:app brand/core.min.css brand/light.min.css brand/dark.min.css \
    /openedx/staticfiles/qhub-brand/
