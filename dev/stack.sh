#!/usr/bin/env bash
# Local Open edX stack using this checkout's theme, without an identity provider or bucket.
#
#   dev/stack.sh setup       configure the isolated qhub_theme_dev project
#   dev/stack.sh image       build the brand CSS and the local Open edX image
#   dev/stack.sh up          launch (the first start takes 20-30 minutes)
#   dev/stack.sh learner     create the local learner/learner account
#   dev/stack.sh specimen    import the specimen course and enrol the learner
#   dev/stack.sh course DIR  import another course from an OLX directory
#   dev/stack.sh learner KEY create the learner and enrol it in another course
#   dev/stack.sh mfe         build and use the MFE image from this checkout (long)
#   dev/stack.sh restart     recreate application containers after an image build
#   dev/stack.sh down        stop the stack, keeping its data
#   dev/stack.sh tutor ...   run a Tutor command against this stack
set -euo pipefail
cd "$(dirname "$0")/.."

export TUTOR_ROOT="${QHUB_DEV_ROOT:-$PWD/.tutor}"
export TUTOR_PLUGINS_ROOT="$PWD/dev/tutor-plugins"
IMAGE=qhub-theme-openedx:local
LEARNER=${LEARNER:-learner}
PROJECT=qhub_theme_dev
SPECIMEN_KEY=course-v1:QuantumHub+THEME+local

tutor() { uv run --no-project --with-requirements dev/requirements.txt --with-editable . tutor "$@"; }
container() { echo "${PROJECT}-$1-1"; }
import_olx() {
  [[ -f "$1/course.xml" ]] || { echo "$1/course.xml not found" >&2; exit 1; }
  tar -C "$1" -cf - . | docker exec -i "$(container cms)" sh -c \
    'rm -rf /tmp/qhub-olx && mkdir -p /tmp/qhub-olx/course && tar -xf - -C /tmp/qhub-olx/course'
  docker exec "$(container cms)" ./manage.py cms import /tmp/qhub-olx course
  docker exec "$(container cms)" rm -rf /tmp/qhub-olx
}
enrol() { docker exec "$(container lms)" ./manage.py lms enroll_user_in_course -e "$LEARNER@example.com" -c "$1"; }

case "${1:-}" in
  setup)
    tutor config save \
      --set LOCAL_PROJECT_NAME="$PROJECT" \
      --set ENABLE_HTTPS=false \
      --set DOCKER_IMAGE_OPENEDX="$IMAGE"
    tutor plugins enable indigo mfe qhub_dev
    ;;
  image)
    (cd tutorindigo/brand && npm ci --no-audit --no-fund && npm run build)
    python3 scripts/fetch_assets.py
    tutor config save
    context=$(mktemp -d)
    trap 'rm -rf "$context"' EXIT
    cp dev/Dockerfile "$context/Dockerfile"
    cp -r "$TUTOR_ROOT/env/build/openedx/themes/indigo" "$context/theme"
    cp -r tutorindigo/brand/dist "$context/brand"
    docker build -t "$IMAGE" "$context"
    ;;
  up)
    if docker container inspect "$(container lms)" >/dev/null 2>&1; then
      tutor local start -d
    else
      tutor local launch --non-interactive
    fi
    echo "LMS: http://$(tutor config printvalue LMS_HOST)  Studio: http://$(tutor config printvalue CMS_HOST)"
    ;;
  restart)
    tutor local dc up -d --force-recreate lms cms lms-worker cms-worker mfe
    ;;
  course)
    import_olx "${2:?Usage: dev/stack.sh course /path/to/olx}"
    ;;
  learner)
    tutor local do createuser --password "$LEARNER" "$LEARNER" "$LEARNER@example.com"
    # A new stack has no specimen until the separate specimen import command.
    if [[ "${2:-}" ]]; then enrol "$2"; fi
    ;;
  specimen)
    import_olx dev/specimen
    enrol "$SPECIMEN_KEY"
    ;;
  mfe)
    tutor config save --set MFE_DOCKER_IMAGE=qhub-theme-mfe:local
    tutor images build mfe
    tutor local dc up -d --force-recreate mfe
    ;;
  down)
    tutor local stop
    ;;
  tutor)
    shift
    tutor "$@"
    ;;
  *)
    sed -n '2,/^set -euo/p' "$0" | sed '$d; s/^# \{0,1\}//'
    exit 2
    ;;
esac
