#!/bin/sh
set -eu

python - <<'PY'
import os
import time

import psycopg

configuration = {
    "dbname": os.environ["DB_NAME"],
    "user": os.environ.get("DB_USER", "postgres"),
    "password": os.environ["DB_PASSWORD"],
    "host": os.environ.get("DB_HOST", "db"),
    "port": os.environ.get("DB_PORT", "5432"),
}

for attempt in range(60):
    try:
        with psycopg.connect(**configuration):
            print("PostgreSQL listo.")
            break
    except psycopg.OperationalError:
        if attempt == 59:
            raise
        time.sleep(2)
PY

python manage.py migrate --noinput
python manage.py collectstatic --noinput --clear
python manage.py seed_hemoruta_demo \
    --password "${HEMORUTA_DEMO_PASSWORD:-alex}" \
    --fecha-base "${HEMORUTA_DEMO_FECHA_BASE:-2026-08-13}"

exec "$@"
