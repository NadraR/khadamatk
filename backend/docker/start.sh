#!/usr/bin/env bash
set -o errexit
set -o pipefail
set -o nounset

export PORT="${PORT:-8000}"

python manage.py migrate --noinput
python manage.py collectstatic --noinput
gunicorn core.wsgi:application --bind 0.0.0.0:${PORT} --workers 3